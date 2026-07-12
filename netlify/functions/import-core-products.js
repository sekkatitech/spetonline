// netlify/functions/import-core-products.js
// Imports the Core Group Apple ARP price list XLSX into core_products table
// Called from admin dashboard — protected by a Supabase admin session (Authorization: Bearer <token>)

const { createClient } = require('@supabase/supabase-js');
const XLSX = require('xlsx');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Verifies the caller is a signed-in admin/super_admin. Was previously a
// static x-spet-secret header comparison — that value is baked into the
// admin dashboard's public JS bundle (VITE_* vars are never secret), so
// anyone who read the bundle could call this endpoint with full service-role
// write access. Real auth: validate the caller's Supabase session, then
// check their profiles.role.
async function requireAdmin(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) return null;
  return user;
}

const MAIN_MAP = {
  '1 - CPU': 'Mac', '2 - iPad': 'iPad', '3 - iPhone': 'iPhone',
  '4 - Watch': 'Watch', '5 - Apple TV': 'Apple TV', '6 - Airpods': 'AirPods',
  '9 - Homepod': 'HomePod', '10 - Accessories': 'Accessories',
  '10 - Watch Accessories': 'Watch Accessories',
};

function parseSpecs(name) {
  const specs = {};
  const colours = ['SILVER','SPACE BLACK','MIDNIGHT','STARLIGHT','SKY BLUE','SPACE GREY',
    'BLUE','YELLOW','PINK','GREEN','RED','WHITE','BLACK','PURPLE','GOLD',
    'NATURAL TITANIUM','BLACK TITANIUM','WHITE TITANIUM','DESERT TITANIUM','CITRUS','INDIGO','BLUSH'];
  for (const c of colours) {
    if (name.includes(c)) { specs.colour = c.charAt(0) + c.slice(1).toLowerCase(); break; }
  }
  const storage = name.match(/(\d+(?:\.\d+)?(?:GB|TB)) SSD/);
  if (storage) specs.storage = storage[1];
  const ram = name.match(/(\d+)GB(?:,|\s)/);
  if (ram) specs.ram = ram[1] + 'GB';
  const chip = name.match(/APPLE ([A-Z]\d+(?:\s+(?:PRO|MAX|ULTRA|NEO))?)/);
  if (chip) specs.chip = 'Apple ' + chip[1].charAt(0) + chip[1].slice(1).toLowerCase();
  const size = name.match(/(\d+(?:\.\d+)?)[- ]INCH/);
  if (size) specs.screen_size = size[1] + '"';
  return Object.keys(specs).length > 0 ? specs : null;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method not allowed' };

  // Auth check
  const admin = await requireAdmin(event);
  if (!admin) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { fileBase64, fileName } = body;

    if (!fileBase64) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'No file provided' }) };
    }

    // Parse XLSX from base64
    const buffer = Buffer.from(fileBase64, 'base64');
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

    let currentMain = '';
    let currentSub = '';
    const products = [];

    for (const row of rows) {
      const [sku, name, status, wholesale, rrp] = row;
      if (!sku) continue;
      const skuStr = String(sku).trim();

      if (MAIN_MAP[skuStr]) { currentMain = MAIN_MAP[skuStr]; continue; }
      if (status !== 'ACTIVE' && status !== 'WHILE STOCKS LAST' && !name) {
        currentSub = skuStr; continue;
      }
      if ((status === 'ACTIVE' || status === 'WHILE STOCKS LAST') && wholesale && rrp) {
        const nameStr = String(name || '').trim();
        const wholesaleNum = parseFloat(wholesale);
        const rrpNum = parseFloat(rrp);
        const markup = Math.round(((rrpNum / 1.15 - wholesaleNum) / wholesaleNum) * 10000) / 100;
        const specs = parseSpecs(nameStr.toUpperCase());

        products.push({
          sku: skuStr,
          name: nameStr,
          category_main: currentMain,
          category_sub: currentSub.charAt(0).toUpperCase() + currentSub.slice(1).toLowerCase(),
          brand: 'Apple',
          supplier: 'core',
          status: status === 'ACTIVE' ? 'active' : 'while_stocks_last',
          wholesale_ex_vat: wholesaleNum,
          rrp_inc_vat: rrpNum,
          price_display: rrpNum,
          markup_percent: markup,
          is_active: true,
          is_enterprise_only: true,
          specs: specs,
        });
      }
    }

    if (products.length === 0) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'No products found in file' }) };
    }

    // Upsert in chunks of 200
    let inserted = 0;
    const chunkSize = 200;
    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('core_products')
        .upsert(chunk, { onConflict: 'sku' });
      if (error) throw new Error(`Upsert failed at chunk ${i}: ${error.message}`);
      inserted += chunk.length;
    }

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        inserted,
        total: products.length,
        categories: [...new Set(products.map(p => p.category_main))],
        message: `Successfully imported ${inserted} Apple products from Core Group price list`,
      }),
    };

  } catch (err) {
    console.error('Core import error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
// cache-bust: force rebuild after env var scope fix (2026-07-12T21:49:14Z)
