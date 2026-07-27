// netlify/functions/generate-descriptions-background.js
// Backfills short_description for axiz_products / pinnacle_products rows
// that don't have one yet. Neither supplier's feed includes a description
// field (see axiz-sync.js / pinnacle-sync) — this generates one from what
// the feed DOES give us: name, brand, category, and (for Pinnacle) the
// structured specifications captured during sync.
//
// Runs as a Netlify Background Function (up to 15 min) since generating
// hundreds of descriptions per invocation would blow past the ~10s limit
// of a normal function. Scheduled daily (see netlify.toml) after both
// suppliers' syncs run, so it clears the backlog and keeps up with new
// products as they're added.

const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = 'claude-haiku-4-5-20251001';
const BATCH_PER_TABLE = 2000; // comfortably covers the whole current backlog in one run
const CONCURRENCY = 10;

const SOURCES = [
  { table: 'axiz_products',     source: 'axiz',     selectCols: 'id, name, brand, category' },
  { table: 'pinnacle_products', source: 'pinnacle', selectCols: 'id, name, brand, category, specifications' },
];

async function runWithConcurrency(items, worker, limit) {
  let i = 0;
  async function next() {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
}

function buildPrompt(product, source) {
  const parts = [`Product name: ${product.name}`];
  if (product.brand) parts.push(`Brand: ${product.brand}`);
  if (product.category) parts.push(`Category: ${product.category}`);
  if (source === 'pinnacle' && product.specifications && Object.keys(product.specifications).length > 0) {
    const specs = Object.entries(product.specifications).map(([k, v]) => `${k}: ${v}`).join(', ');
    parts.push(`Known attributes: ${specs}`);
  }
  return `Write a concise, factual 2-3 sentence retail product description for the following item, suitable for an e-commerce product page. Do not invent specifications not given below. Do not use markdown formatting. Do not start with the product name verbatim.\n\n${parts.join('\n')}`;
}

async function generateDescription(product, source) {
  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 200,
      messages: [{ role: 'user', content: buildPrompt(product, source) }],
    });
    const block = msg.content?.[0];
    return block?.type === 'text' ? block.text.trim() : null;
  } catch (err) {
    console.error(`[generate-descriptions] ${source} ${product.id} failed:`, err.message);
    return null;
  }
}

async function processTable(table, source, selectCols) {
  const { data: products, error } = await supabase
    .from(table)
    .select(selectCols)
    .is('short_description', null)
    .eq('is_active', true)
    .limit(BATCH_PER_TABLE);

  if (error) throw new Error(`Failed to fetch ${table}: ${error.message}`);
  if (!products || products.length === 0) return { table, found: 0, updated: 0 };

  let updated = 0;
  await runWithConcurrency(products, async (product) => {
    const description = await generateDescription(product, source);
    if (description) {
      const { error: updateError } = await supabase
        .from(table)
        .update({ short_description: description })
        .eq('id', product.id);
      if (!updateError) updated++;
    }
  }, CONCURRENCY);

  return { table, found: products.length, updated };
}

exports.handler = async () => {
  const startTime = Date.now();
  const results = [];

  for (const { table, source, selectCols } of SOURCES) {
    try {
      results.push(await processTable(table, source, selectCols));
    } catch (err) {
      console.error(`[generate-descriptions] ${table} failed:`, err.message);
      results.push({ table, error: err.message });
    }
  }

  console.log(`[generate-descriptions] Done in ${Date.now() - startTime}ms:`, JSON.stringify(results));
  return { statusCode: 200, body: JSON.stringify({ success: true, results }) };
};
