// netlify/functions/axiz-sync.js
// Pulls the latest pricing file from Axiz Digital's SFTP drop
// (sftp://files.axizdigital.com/home/axizpricing/files) and upserts it
// into the axiz_products table. Runs on a schedule (see netlify.toml) and
// can also be triggered manually with a POST — same public-invocation
// posture as the syntech/esquire sync functions, since it only ever pulls
// Axiz's own feed and upserts (idempotent, no destructive action).
//
// Required env vars (set in Netlify site settings, never in the repo):
//   AXIZ_SFTP_HOST, AXIZ_SFTP_USER, AXIZ_SFTP_PASSWORD, AXIZ_SFTP_PATH
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// The file format Axiz drops (CSV vs XLSX, exact column headers) wasn't
// known at the time this was written, so the parser auto-detects the
// format via the `xlsx` library and matches columns against a list of
// likely header aliases. Anything it can't confidently map is kept in
// `raw_data` so no data from the feed is silently dropped.

const SftpClient = require('ssh2-sftp-client');
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DATA_EXT = /\.(csv|xlsx|xls|txt)$/i;

// Selling price = cost, plus 15% VAT (unless the source column already
// includes VAT), plus 25% markup on top. Which case applies is decided
// per-row by which price column the file actually has — see mapRow().
const VAT_PERCENT = 15;
const MARKUP_PERCENT = 25;

const HEADER_ALIASES = {
  sku:      ['sku', 'stockcode', 'stock_code', 'productcode', 'product_code', 'itemcode', 'item_code', 'code'],
  name:     ['description', 'productdescription', 'product_description', 'name', 'productname', 'product_name'],
  brand:    ['brand', 'manufacturer', 'vendor'],
  category: ['category', 'productgroup', 'product_group', 'group', 'range'],
  uom:      ['uom', 'unit', 'unitofmeasure', 'unit_of_measure'],
  // Explicit "incl VAT" column — if the file has this, VAT is already in
  // the number, so we only add markup.
  price_incl_vat: ['priceinclvat', 'price_incl_vat', 'inclprice', 'incl_price', 'vatinclusiveprice', 'grossprice', 'gross_price', 'rrpincl', 'rrp_incl'],
  // Explicit "excl VAT" column, or an unlabelled generic "price" — treated
  // as VAT-exclusive (the normal case for a distributor cost/wholesale
  // price list), so we add VAT then markup.
  price_excl_vat: ['price', 'exclprice', 'excl_price', 'priceexclvat', 'price_excl_vat', 'listprice', 'list_price', 'unitprice', 'unit_price', 'nettprice', 'nett_price', 'cost', 'costprice', 'cost_price'],
  stock:    ['stock', 'stockqty', 'stock_qty', 'qty', 'quantity', 'available', 'availableqty', 'available_qty', 'soh'],
};

function normalizeHeader(h) {
  return String(h ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function buildColumnMap(headerRow) {
  const normalized = headerRow.map(normalizeHeader);
  const map = {};
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    const normalizedAliases = aliases.map(normalizeHeader);
    const idx = normalized.findIndex((h) => normalizedAliases.includes(h));
    if (idx !== -1) map[field] = idx;
  }
  return map;
}

function mapRow(row, columnMap, headerRow) {
  const sku = columnMap.sku != null ? String(row[columnMap.sku] ?? '').trim() : '';
  const name = columnMap.name != null ? String(row[columnMap.name] ?? '').trim() : '';
  const stockQty = columnMap.stock != null ? Number(row[columnMap.stock]) || 0 : 0;

  // Figure out the selling price. If the file gives us a VAT-inclusive
  // price, VAT's already in there — just add markup. Otherwise treat the
  // price as ex-VAT (the normal case for a wholesale/cost price list) and
  // add VAT then markup.
  let priceCost = null;   // always stored ex-VAT, for a consistent cost basis
  let vatInclusive = false;
  let priceDisplay = null;

  if (columnMap.price_incl_vat != null) {
    const inclPrice = Number(row[columnMap.price_incl_vat]);
    if (Number.isFinite(inclPrice)) {
      vatInclusive = true;
      priceCost = Math.round((inclPrice / (1 + VAT_PERCENT / 100)) * 100) / 100;
      priceDisplay = Math.round(inclPrice * (1 + MARKUP_PERCENT / 100) * 100) / 100;
    }
  } else if (columnMap.price_excl_vat != null) {
    const exclPrice = Number(row[columnMap.price_excl_vat]);
    if (Number.isFinite(exclPrice)) {
      priceCost = exclPrice;
      priceDisplay = Math.round(exclPrice * (1 + VAT_PERCENT / 100) * (1 + MARKUP_PERCENT / 100) * 100) / 100;
    }
  }

  const raw = {};
  headerRow.forEach((h, i) => { raw[h] = row[i] ?? null; });

  return {
    sku,
    name,
    brand:              columnMap.brand != null ? String(row[columnMap.brand] ?? '').trim() || null : null,
    category:           columnMap.category != null ? String(row[columnMap.category] ?? '').trim() || null : null,
    uom:                columnMap.uom != null ? String(row[columnMap.uom] ?? '').trim() || null : null,
    price_cost:         priceCost,
    vat_percent:        VAT_PERCENT,
    vat_inclusive:      vatInclusive,
    markup_percent:     MARKUP_PERCENT,
    price_display:      priceDisplay,
    stock_qty:          stockQty,
    stock_status:       stockQty > 0 ? 'in_stock' : 'out_of_stock',
    raw_data:           raw,
    is_active:          true,
    supplier_id:        'axiz',
    last_synced_at:     new Date().toISOString(),
  };
}

async function fetchLatestFileBuffer(sftp) {
  const path = process.env.AXIZ_SFTP_PATH || '/home/axizpricing/files';
  const list = await sftp.list(path);
  const candidates = list
    .filter((f) => f.type === '-' && DATA_EXT.test(f.name))
    .sort((a, b) => b.modifyTime - a.modifyTime);

  if (candidates.length === 0) {
    throw new Error(`No data files found in ${path}`);
  }

  const target = candidates[0];
  const buffer = await sftp.get(`${path}/${target.name}`);
  return { name: target.name, buffer };
}

exports.handler = async () => {
  const startTime = Date.now();
  const sftp = new SftpClient();

  let totalFetched = 0;
  let totalUpserted = 0;
  let totalSkipped = 0;
  let errorMessage = null;
  let fileName = null;

  try {
    await sftp.connect({
      host:     process.env.AXIZ_SFTP_HOST,
      username: process.env.AXIZ_SFTP_USER,
      password: process.env.AXIZ_SFTP_PASSWORD,
    });

    const file = await fetchLatestFileBuffer(sftp);
    fileName = file.name;

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: false });

    if (rows.length < 2) throw new Error(`${fileName} has no data rows`);

    const headerRow = rows[0].map((h) => String(h ?? '').trim());
    const columnMap = buildColumnMap(headerRow);

    if (columnMap.sku == null || columnMap.name == null) {
      throw new Error(
        `Could not identify SKU/name columns in ${fileName}. Headers found: ${headerRow.join(', ')}`
      );
    }

    const dataRows = rows.slice(1);
    totalFetched = dataRows.length;

    const mapped = dataRows
      .map((r) => mapRow(r, columnMap, headerRow))
      .filter((r) => r.sku !== '' && r.name !== '');
    totalSkipped = dataRows.length - mapped.length;

    const BATCH_SIZE = 200;
    for (let i = 0; i < mapped.length; i += BATCH_SIZE) {
      const batch = mapped.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('axiz_products')
        .upsert(batch, { onConflict: 'sku', ignoreDuplicates: false });

      if (error) {
        errorMessage = error.message;
      } else {
        totalUpserted += batch.length;
      }
    }

    const duration = Date.now() - startTime;

    await supabase.from('feed_sync_log').insert({
      source:           'axiz',
      status:           errorMessage ? 'error' : 'success',
      products_fetched: totalFetched,
      products_updated: totalUpserted,
      products_created: totalUpserted,
      error_message:    errorMessage,
      started_at:       new Date(startTime).toISOString(),
      completed_at:     new Date().toISOString(),
    });

    await supabase
      .from('sync_sources')
      .update({
        last_synced_at:    new Date().toISOString(),
        last_sync_status:  errorMessage ? 'error' : 'success',
        last_sync_count:   totalUpserted,
        last_sync_error:   errorMessage,
      })
      .eq('org_key', 'axiz');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        file: fileName,
        total_fetched: totalFetched,
        total_upserted: totalUpserted,
        total_skipped: totalSkipped,
        duration_ms: duration,
      }),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    await supabase.from('feed_sync_log').insert({
      source:           'axiz',
      status:           'error',
      products_fetched: totalFetched,
      products_updated: totalUpserted,
      error_message:    message,
      started_at:       new Date(startTime).toISOString(),
      completed_at:     new Date().toISOString(),
    });

    await supabase
      .from('sync_sources')
      .update({ last_sync_status: 'error', last_sync_error: message, last_synced_at: new Date().toISOString() })
      .eq('org_key', 'axiz');

    return { statusCode: 500, body: JSON.stringify({ success: false, error: message }) };
  } finally {
    try { await sftp.end(); } catch (_) { /* already closed */ }
  }
};
