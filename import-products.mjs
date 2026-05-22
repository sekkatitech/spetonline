/**
 * SPET Online — Esquire JSON Data Feed Import Script
 * Reads data.json and bulk-inserts products into Supabase
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load env vars
const SUPABASE_URL = 'https://hxxaxyruliquidvkocei.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4eGF4eXJ1bGlxdWlkdmtvY2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDQxMDQsImV4cCI6MjA5NDU4MDEwNH0.4xsWN9s8b-yJwy3WOm6das5zZGTxbHsRs3SQM2IkuL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Read the JSON file
console.log('📖 Reading data.json...');
const raw = readFileSync('data.json', 'utf8');
const items = JSON.parse(raw);
console.log(`✅ Found ${items.length} products in the data feed.`);

// Helper: generate slug from product name
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200);
}

// Transform Esquire JSON items → Supabase rows
function transformItem(item) {
  return {
    ProductName: item.ProductName || 'Unnamed Product',
    ProductCode: item.ProductCode || `UNKNOWN-${Math.random().toString(36).substr(2, 8)}`,
    Category: item.Category || null,
    Price: typeof item.Price === 'number' ? item.Price : parseFloat(item.Price) || 0,
    AvailableQty: typeof item.AvailableQty === 'number' ? item.AvailableQty : parseInt(item.AvailableQty) || 0,
    Condition: item.Condition || 'New',
    Brand: item.ProductAttributes?.Brand || null,
    Location: item.Location || null,
    image: item.image || null,
    images: item.images || null,
    ShippingProductClass: item.ShippingProductClass || null,
    ProductSummary: item.ProductSummary || null,
    ProductDescription: item.ProductDescription || null,
    LengthCM: item.LengthCM ? parseFloat(item.LengthCM) : null,
    WidthCM: item.WidthCM ? parseFloat(item.WidthCM) : null,
    HeightCM: item.HeightCM ? parseFloat(item.HeightCM) : null,
    MassKG: item.MassKG ? parseFloat(item.MassKG) : null,
    CategoryHead: item.CategoryHead || null,
    slug: slugify(item.ProductName || 'product'),
    is_active: true,
    is_featured: false,
    is_on_sale: false,
  };
}

// Batch insert in chunks of 500
const BATCH_SIZE = 500;

async function importProducts() {
  const rows = items.map(transformItem);

  // Deduplicate by ProductCode (keep first occurrence)
  const seen = new Set();
  const uniqueRows = [];
  for (const row of rows) {
    if (!seen.has(row.ProductCode)) {
      seen.add(row.ProductCode);
      uniqueRows.push(row);
    } else {
      console.log(`⚠️  Skipping duplicate ProductCode: ${row.ProductCode}`);
    }
  }

  console.log(`📦 Inserting ${uniqueRows.length} unique products in batches of ${BATCH_SIZE}...`);

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < uniqueRows.length; i += BATCH_SIZE) {
    const batch = uniqueRows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(uniqueRows.length / BATCH_SIZE);

    const { data, error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'ProductCode' })
      .select('id');

    if (error) {
      console.error(`❌ Batch ${batchNum}/${totalBatches} failed:`, error.message);
      // Try inserting one by one to find the problematic row
      for (const row of batch) {
        const { error: singleError } = await supabase
          .from('products')
          .upsert(row, { onConflict: 'ProductCode' });
        if (singleError) {
          console.error(`   ❌ Failed: ${row.ProductCode} (${row.ProductName}): ${singleError.message}`);
          errors++;
        } else {
          inserted++;
        }
      }
    } else {
      inserted += data?.length || batch.length;
      console.log(`   ✅ Batch ${batchNum}/${totalBatches}: ${batch.length} products inserted`);
    }
  }

  console.log('\n══════════════════════════════════════════');
  console.log(`🎉 Import complete!`);
  console.log(`   ✅ Successfully inserted: ${inserted}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log('══════════════════════════════════════════');
}

importProducts().catch(console.error);
