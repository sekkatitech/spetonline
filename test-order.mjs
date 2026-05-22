import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hxxaxyruliquidvkocei.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4eGF4eXJ1bGlxdWlkdmtvY2VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDQxMDQsImV4cCI6MjA5NDU4MDEwNH0.4xsWN9s8b-yJwy3WOm6das5zZGTxbHsRs3SQM2IkuL4';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testOrder() {
  console.log('Testing orders table insertion...');
  const { data, error } = await supabase
    .from('orders')
    .insert({
      status: 'pending',
      subtotal: 100,
      discount_amount: 0,
      shipping: 10,
      vat_amount: 15,
      total: 125
    })
    .select()
    .single();
    
  console.log('Result:', data);
  console.log('Error:', error);
}

testOrder();
