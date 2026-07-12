const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const https = require('https');

// ── Supabase admin client (server-side only) ─────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PF_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';
const PF_VALIDATE_HOST = process.env.PAYFAST_SANDBOX === 'true'
  ? 'sandbox.payfast.co.za'
  : 'www.payfast.co.za';

// Must match the pfEncode in create-order.js's generatePfSignature exactly —
// PayFast's signature algorithm is based on PHP's urlencode(), which differs
// from JS's encodeURIComponent on spaces ('+' vs '%20') and !'()* and ~.
function pfEncode(value) {
  return encodeURIComponent(String(value).trim())
    .replace(/%20/g, '+')
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
    .replace(/~/g, '%7E');
}

// ── Rebuild and verify the PayFast signature ──────────────────────────────────
function verifySignature(data, passphrase = '') {
  const receivedSignature = data.signature;
  const payload = { ...data };
  delete payload.signature;

  let str = Object.entries(payload)
    .map(([k, v]) => `${k}=${pfEncode(v)}`)
    .join('&');
  if (passphrase) str += `&passphrase=${pfEncode(passphrase)}`;

  const calculatedSignature = crypto.createHash('md5').update(str).digest('hex');
  return calculatedSignature === receivedSignature;
}

// ── Validate the ITN with PayFast's servers (anti-spoofing check) ────────────
function validateWithPayFast(rawBody) {
  return new Promise((resolve) => {
    const options = {
      hostname: PF_VALIDATE_HOST,
      path: '/eng/query/validate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(rawBody),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve(body.trim() === 'VALID'));
    });

    req.on('error', () => resolve(false));
    req.write(rawBody);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const rawBody = event.body || '';
    const params = new URLSearchParams(rawBody);
    const data = {};
    for (const [key, value] of params) data[key] = value;

    // ── 1. Verify signature ──────────────────────────────────────────────────
    if (!verifySignature(data, PF_PASSPHRASE)) {
      console.error('PayFast ITN: signature mismatch', data);
      return { statusCode: 400, body: 'Invalid signature' };
    }

    // ── 2. Validate with PayFast servers ─────────────────────────────────────
    const isValid = await validateWithPayFast(rawBody);
    if (!isValid) {
      console.error('PayFast ITN: failed server validation', data);
      return { statusCode: 400, body: 'Invalid ITN' };
    }

    // ── 3. Extract order info ────────────────────────────────────────────────
    const orderId = data.m_payment_id;
    const paymentStatus = data.payment_status; // COMPLETE, FAILED, PENDING
    const amountGross = parseFloat(data.amount_gross || '0');

    if (!orderId) {
      console.error('PayFast ITN: missing m_payment_id');
      return { statusCode: 400, body: 'Missing order reference' };
    }

    // ── 4. Fetch the order to verify amount matches ─────────────────────────
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      console.error('PayFast ITN: order not found', orderId);
      return { statusCode: 404, body: 'Order not found' };
    }

    // Verify the amount paid matches the order total (anti-tamper check)
    const expectedTotal = Number(order.total);
    if (Math.abs(amountGross - expectedTotal) > 0.5) {
      console.error('PayFast ITN: amount mismatch', { orderId, expectedTotal, amountGross });
      await supabase.from('orders').update({ status: 'payment_mismatch' }).eq('id', orderId);
      return { statusCode: 400, body: 'Amount mismatch' };
    }

    // ── 5. Update order status based on payment_status ──────────────────────
    let newStatus = order.status;
    let newPaymentStatus = order.payment_status;

    if (paymentStatus === 'COMPLETE') {
      newStatus = 'processing';
      newPaymentStatus = 'paid';
    } else if (paymentStatus === 'FAILED') {
      newStatus = 'failed';
      newPaymentStatus = 'failed';
    } else if (paymentStatus === 'PENDING') {
      newStatus = 'pending';
      newPaymentStatus = 'pending';
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        payment_status: newPaymentStatus,
        payfast_payment_id: data.pf_payment_id || null,
        paid_at: paymentStatus === 'COMPLETE' ? new Date().toISOString() : null,
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('PayFast ITN: failed to update order', updateError);
      return { statusCode: 500, body: 'Failed to update order' };
    }

    // ── 6. Trigger confirmation email on successful payment ─────────────────
    if (paymentStatus === 'COMPLETE') {
      try {
        const siteUrl = process.env.SITE_URL || 'https://spetonline.co.za';
        await fetch(`${siteUrl}/.netlify/functions/send-order-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
      } catch (emailErr) {
        // Don't fail the ITN response if email fails — just log it
        console.error('Failed to trigger confirmation email:', emailErr);
      }
    }

    // PayFast expects a 200 OK response with no body content requirements
    return { statusCode: 200, body: 'OK' };

  } catch (err) {
    console.error('PayFast ITN error:', err);
    return { statusCode: 500, body: 'Server error' };
  }
};// cache-bust: force rebuild after env var scope fix (2026-07-12T21:49:14Z)
// revert: env vars restored to plain (non-secret) after runtime incident
