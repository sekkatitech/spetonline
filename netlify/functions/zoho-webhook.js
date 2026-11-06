// netlify/functions/zoho-webhook.js
// Receives webhook events from Zoho Books
// When a payment is recorded in Zoho, this updates the SPET order status

const { createClient } = require('@supabase/supabase-js');
const { safeEqual, isOrderId } = require('./security-lib');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Anyone can POST to this URL, and it marks orders as paid, so a call must carry the
// shared secret configured in Zoho Books (header "x-spet-webhook-secret", or "?secret=" on
// the webhook URL). Without ZOHO_WEBHOOK_SECRET set in Netlify, every call is refused.
function isAuthorised(event) {
  const expected = process.env.ZOHO_WEBHOOK_SECRET;
  if (!expected || expected.length < 24) return false;
  const headers = event.headers || {};
  const given = headers['x-spet-webhook-secret'] || event.queryStringParameters?.secret || '';
  return safeEqual(given, expected);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }
  if (!isAuthorised(event)) {
    console.warn('Zoho webhook refused: missing or wrong secret');
    return { statusCode: 401, body: 'Unauthorised' };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const { event_type, data } = payload;

    console.log('Zoho webhook received:', event_type);

    switch (event_type) {

      // Invoice paid in Zoho → mark SPET order as paid
      case 'invoice.paymentthank': 
      case 'invoice.payment_made': {
        const invoiceNumber = data?.invoice?.invoice_number || data?.invoice_number;
        if (!isOrderId(invoiceNumber)) break;

        // Find the SPET order by ID (we set invoice_number = order.id)
        const { error } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            paid_at:        new Date().toISOString(),
          })
          .eq('id', invoiceNumber);

        if (error) console.error('Failed to update order payment status:', error);
        else console.log(`Order ${invoiceNumber} marked as paid`);
        break;
      }

      // Invoice overdue → flag the order
      case 'invoice.overdue': {
        const invoiceNumber = data?.invoice?.invoice_number;
        if (!invoiceNumber) break;

        await supabase
          .from('orders')
          .update({ internal_notes: 'OVERDUE — Zoho Books flagged this invoice as overdue' })
          .eq('id', invoiceNumber);
        break;
      }

      // Customer payment received
      case 'customerpayment.created': {
        console.log('Customer payment recorded in Zoho');
        break;
      }

      default:
        console.log('Unhandled Zoho webhook event:', event_type);
    }

    // Always return 200 to Zoho so it doesn't retry
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };

  } catch (err) {
    console.error('Zoho webhook error:', err);
    // Still return 200 — don't let Zoho keep retrying
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  }
};// cache-bust: force rebuild after env var scope fix (2026-07-12T21:49:14Z)
// revert: env vars restored to plain (non-secret) after runtime incident
