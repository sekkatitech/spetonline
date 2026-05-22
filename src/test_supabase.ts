import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || 'https://hxxaxyruliquidvkocei.supabase.co';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Testing Supabase Connection...');
console.log('URL:', url);
console.log('Key:', key ? `${key.substring(0, 10)}...` : 'MISSING');

const supabase = createClient(url, key);

async function runTest() {
  try {
    console.log('\n--- Fetching Categories ---');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (catError) {
      console.error('Categories Error:', catError);
    } else {
      console.log(`Successfully fetched ${categories?.length ?? 0} categories:`, categories);
    }

    console.log('\n--- Fetching Products ---');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (prodError) {
      console.error('Products Error:', prodError);
    } else {
      console.log(`Successfully fetched ${products?.length ?? 0} products:`, products);
    }

    console.log('\n--- Fetching Promotions ---');
    const { data: promos, error: promoError } = await supabase
      .from('promotions')
      .select('*')
      .limit(5);

    if (promoError) {
      console.error('Promotions Error:', promoError);
    } else {
      console.log(`Successfully fetched ${promos?.length ?? 0} promotions:`, promos);
    }

  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

runTest();
