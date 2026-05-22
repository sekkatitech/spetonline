import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function testUserOrderInsertion() {
  console.log('Probing more address columns on orders...');

  const candidates = [
    'delivery_address_id', 'shipping_id', 'address_details', 'shipping_details',
    'shipping_info', 'address_info', 'delivery_info', 'recipient_name', 'billing_address', 'billing_address_id'
  ];

  const knownGood = ['id', 'created_at', 'total', 'status', 'subtotal', 'discount_amount', 'vat_amount', 'shipping', 'user_id', 'promotion_id'];

  for (const col of candidates) {
    const queryStr = [...knownGood, col].join(', ');
    const { error } = await supabase.from('orders').select(queryStr).limit(1);
    if (!error) {
      console.log(`  => Column [${col}] EXISTS!`);
    } else if (error.code === 'PGRST100' || error.message.includes('does not exist')) {
      // Doesn't exist
    } else {
      console.log(`  => Column [${col}] returned other error:`, error.message);
    }
  }
}

testUserOrderInsertion();









