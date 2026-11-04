// netlify/functions/cancel-order.js
// Called when a shopper cancels at PayFast. Only touches the shopper's own order,
// and only while it is still unpaid. If PayFast later confirms a payment on it,
// payfast-itn.js overwrites the status, so a real payment is never lost.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { accessToken, orderId } = JSON.parse(event.body || '{}');

    if (!accessToken || !orderId) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Missing session or order' }) };
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Invalid session' }) };
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('user_id', user.id)
      .eq('source', 'consumer')
      .eq('status', 'pending')
      .eq('payment_status', 'unpaid');

    if (error) {
      console.error('cancel-order error:', error);
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Failed to cancel order' }) };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('cancel-order error:', err);
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'An unexpected error occurred' }) };
  }
};
