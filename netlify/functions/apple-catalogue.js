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

const HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'public, max-age=60',
};

const respond = (statusCode, body) => ({ statusCode, headers: HEADERS, body: JSON.stringify(body) });

// Apple is sold as available with delivery pending stock, so stock levels stay internal.
// Only "while stocks last" is a customer-facing state.
const publicProduct = (p) => ({ ...p, status: p.status === 'while_stocks_last' ? 'while_stocks_last' : 'active' });

const visibleProducts = (columns) => supabase
  .from('core_products')
  .select(columns)
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

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return respond(405, { error: 'Method not allowed' });

  const { id, category, counts } = event.queryStringParameters || {};

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

    return respond(400, { error: 'Specify id, category or counts' });
  } catch (err) {
    console.error('apple-catalogue error:', err);
    return respond(500, { error: 'Could not load products' });
  }
};
