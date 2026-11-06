// netlify/functions/apple-catalogue.js
// Customer-facing read of the Apple catalogue. The storefront reads through here so cost
// columns (wholesale_ex_vat, markup_percent) never reach a browser. Add a column to these
// lists only if customers are meant to see it.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const LIST_COLUMNS = 'id, sku, name, category_main, category_sub, rrp_inc_vat, price_display, status, specs, thumbnail_url, image_urls';
const DETAIL_COLUMNS = `${LIST_COLUMNS}, short_description, full_description, weight_kg`;
const PAGE_SIZE = 1000;
// Enough for a whole range ("iphone" matches 110) so the results page can page through
// what it loaded instead of lying about the total.
const MAX_SEARCH_RESULTS = 200;
const MIN_SEARCH_LENGTH = 2;

const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60',
};

const respond = (statusCode, body) => ({ statusCode, headers: HEADERS, body: JSON.stringify(body) });

// Images are mirrored into our own storage, because the suppliers' CDNs (core.co.za,
// cdn.shopify.com) answer slowly or not at all from some networks. The manifest maps the
// supplier URL to the cached 1400px and 640px WebP files; anything not in it — a new SKU,
// or a checkout without the manifest — keeps its original URL. The database itself keeps
// the supplier's URLs, so deleting the manifest restores the previous behaviour.
// Run `npm run images:apple` after adding products; see scripts/mirror-images.mjs.
const IMAGE_BUCKET = 'apple-images';
let imageManifest = {};
try {
  imageManifest = require('./apple-images.json');
} catch {
  // Not mirrored yet: fall through and serve the supplier URLs.
}

const mirroredUrl = (url, size) => {
  const entry = url ? imageManifest[url] : null;
  const path = entry && entry[size];
  return path ? `${process.env.SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${path}` : url;
};

// Apple is sold as available with delivery pending stock, so stock levels stay internal.
// Only "while stocks last" is a customer-facing state.
const publicProduct = (p) => {
  const supplierImages = (p.image_urls || []).filter(Boolean);
  const imageUrls = supplierImages.map((url) => mirroredUrl(url, 'web'));
  // 289 rows ship without a thumbnail, and handing a 5000px original to a grid tile is
  // what made the catalogue heavy. Take the cached small twin of the first image instead.
  const thumbnail = p.thumbnail_url
    ? mirroredUrl(p.thumbnail_url, 'thumb')
    : supplierImages[0]
      ? mirroredUrl(supplierImages[0], 'thumb')
      : null;

  return {
    ...p,
    image_urls: imageUrls,
    thumbnail_url: thumbnail,
    status: p.status === 'while_stocks_last' ? 'while_stocks_last' : 'active',
  };
};

const visibleProducts = (columns, options) =>
  supabase
    .from('core_products')
    .select(columns, options)
    .eq('is_active', true)
    .eq('is_enterprise_only', true);

async function allPages(buildQuery) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await buildQuery().range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    rows.push(...data);
    if (data.length < PAGE_SIZE) return rows;
  }
}

// PostgREST reads commas and parentheses inside .or() as syntax, so a shopper typing
// "Mac, 14-inch" would break the query. Strip the syntax characters instead of quoting,
// and neutralise % and _ so they stay literal.
const searchTerm = (raw) =>
  String(raw || '')
    .slice(0, 64)
    .replace(/[\\%_,()*"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Cheapest-first would put "EXTENDED WARRANTY: IPHONE 11" above the iPhones a shopper asked
// for, so matches are ranked before they are cut down to the requested page.
const RANK_FETCH_CAP = 400;

function relevance(product, term) {
  const t = term.toLowerCase();
  const name = (product.name || '').toLowerCase();
  const sub = (product.category_sub || '').toLowerCase();
  const category = (product.category_main || '').toLowerCase();
  const sku = (product.sku || '').toLowerCase();

  let score = 0;
  if (name.startsWith(t)) score += 100;
  else if (name.includes(` ${t}`)) score += 70;
  else if (name.includes(t)) score += 45;
  if (category === t) score += 40;
  if (sub.includes(t)) score += 25;
  if (sku.includes(t)) score += 15;
  return score;
}

async function searchProducts(raw, requestedLimit) {
  const term = searchTerm(raw);
  if (term.length < MIN_SEARCH_LENGTH) return { products: [], total: 0 };

  const limit = Math.min(Math.max(Number(requestedLimit) || 24, 1), MAX_SEARCH_RESULTS);
  const pattern = `%${term}%`;

  const { data, error, count } = await visibleProducts(LIST_COLUMNS, { count: 'exact' })
    .or(`name.ilike.${pattern},sku.ilike.${pattern},category_sub.ilike.${pattern}`)
    .order('price_display', { ascending: true })
    .order('id')
    .limit(RANK_FETCH_CAP);

  if (error) throw new Error(error.message);

  const ranked = (data || [])
    .map((product) => ({ product, score: relevance(product, term) }))
    .sort((a, b) => b.score - a.score || a.product.price_display - b.product.price_display)
    .slice(0, limit)
    .map((entry) => publicProduct(entry.product));

  return {
    products: ranked,
    // How many configurations match in total, so the shelf can say "8 of 256".
    total: typeof count === 'number' ? count : (data || []).length,
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return respond(405, { error: 'Method not allowed' });

  const { id, category, counts, search, limit } = event.queryStringParameters || {};

  try {
    if (id) {
      const { data: product, error } = await visibleProducts(DETAIL_COLUMNS).eq('id', id).maybeSingle();
      if (error) throw new Error(error.message);
      if (!product) return respond(404, { error: 'Product not found' });

      const { data: related, error: relatedError } = await visibleProducts(LIST_COLUMNS)
        .eq('category_main', product.category_main)
        .neq('id', product.id)
        .limit(8);
      if (relatedError) throw new Error(relatedError.message);

      return respond(200, { product: publicProduct(product), related: (related || []).map(publicProduct) });
    }

    if (search) {
      const result = await searchProducts(search, limit);
      return respond(200, result);
    }

    if (counts) {
      const rows = await allPages(() => visibleProducts('category_main').order('id'));
      const totals = {};
      for (const row of rows) totals[row.category_main] = (totals[row.category_main] || 0) + 1;
      return respond(200, { counts: totals });
    }

    if (category) {
      const rows = await allPages(() => visibleProducts(LIST_COLUMNS)
        .eq('category_main', category)
        .order('price_display', { ascending: true })
        .order('id'));
      return respond(200, { products: rows.map(publicProduct) });
    }

    return respond(400, { error: 'Specify id, category, counts or search' });
  } catch (err) {
    console.error('apple-catalogue error:', err);
    return respond(500, { error: 'Could not load products' });
  }
};
