const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'sales@spetonline.co.za';
const SENDER_NAME = process.env.SENDER_NAME || 'SPET Online';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function formatCurrency(amount) {
  return `R ${Number(amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
}

function buildOrderItemsHtml(items) {
  return items.map((item) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; font-size: 14px; color: #1f2937;">${item.name}</td>
      <td style="padding: 12px 8px; font-size: 14px; color: #6b7280; text-align: center;">${item.qty}</td>
      <td style="padding: 12px 8px; font-size: 14px; color: #1f2937; text-align: right;">${formatCurrency(item.line_total)}</td>
    </tr>
  `).join('');
}

function buildCustomerEmailHtml(order, items) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: #0a141d; padding: 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px;">SPET Online</h1>
    </div>
    <div style="padding: 32px 24px;">
      <h2 style="color: #1f2937; font-size: 20px; margin-top: 0;">Thank you for your order!</h2>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Hi ${order.client_name || 'there'}, we've received your payment and your order is now being processed.
      </p>

      <table style="width: 100%; background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0; border-collapse: collapse;">
        <tr><td style="padding: 4px 8px; font-size: 13px; color: #6b7280;">Order Number</td><td style="padding: 4px 8px; font-size: 13px; font-weight: bold; text-align: right;">${order.id}</td></tr>
        <tr><td style="padding: 4px 8px; font-size: 13px; color: #6b7280;">Order Date</td><td style="padding: 4px 8px; font-size: 13px; text-align: right;">${new Date(order.created_at).toLocaleDateString('en-ZA')}</td></tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 8px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Item</th>
            <th style="padding: 8px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase;">Qty</th>
            <th style="padding: 8px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${buildOrderItemsHtml(items)}
        </tbody>
      </table>

      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 4px 8px; font-size: 14px; color: #6b7280;">Subtotal</td><td style="padding: 4px 8px; font-size: 14px; text-align: right;">${formatCurrency(order.subtotal)}</td></tr>
        ${order.discount_amount > 0 ? `<tr><td style="padding: 4px 8px; font-size: 14px; color: #16a34a;">Discount</td><td style="padding: 4px 8px; font-size: 14px; text-align: right; color: #16a34a;">-${formatCurrency(order.discount_amount)}</td></tr>` : ''}
        <tr><td style="padding: 4px 8px; font-size: 14px; color: #6b7280;">Shipping</td><td style="padding: 4px 8px; font-size: 14px; text-align: right;">${order.shipping > 0 ? formatCurrency(order.shipping) : 'FREE'}</td></tr>
        <tr style="border-top: 2px solid #e5e7eb;"><td style="padding: 8px 8px; font-size: 16px; font-weight: bold;">Total</td><td style="padding: 8px 8px; font-size: 16px; font-weight: bold; text-align: right;">${formatCurrency(order.total)}</td></tr>
      </table>

      <div style="margin-top: 24px; padding: 16px; background: #f0f9ff; border-radius: 8px;">
        <p style="margin: 0; font-size: 13px; color: #1f2937;"><strong>Shipping Address</strong></p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">
          ${order.shipping_address_line1 || ''}${order.shipping_address_line2 ? ', ' + order.shipping_address_line2 : ''}<br/>
          ${order.shipping_city || ''}, ${order.shipping_province || ''}, ${order.shipping_postal_code || ''}
        </p>
      </div>

      <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">
        We'll notify you when your order ships. Questions? Reply to this email or call us on 0870 881 483.
      </p>
    </div>
    <div style="background: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; font-size: 11px; color: #9ca3af;">
        Sekkati Petroleum Energy and Technology (Pty) Ltd · Trading as SPET Online
      </p>
    </div>
  </div>
  `;
}

function buildAdminEmailHtml(order, items) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1f2937;">🎉 New Paid Order — ${order.id}</h2>
    <p style="color: #6b7280;">A new order has been paid and is ready for fulfilment.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 4px 8px; font-weight: bold;">Customer</td><td style="padding: 4px 8px;">${order.client_name}</td></tr>
      <tr><td style="padding: 4px 8px; font-weight: bold;">Email</td><td style="padding: 4px 8px;">${order.client_email}</td></tr>
      <tr><td style="padding: 4px 8px; font-weight: bold;">Phone</td><td style="padding: 4px 8px;">${order.client_phone || '—'}</td></tr>
      <tr><td style="padding: 4px 8px; font-weight: bold;">Total</td><td style="padding: 4px 8px;">${formatCurrency(order.total)}</td></tr>
    </table>
    <table style="width: 100%; border-collapse: collapse;">
      ${buildOrderItemsHtml(items)}
    </table>
    <p style="color: #6b7280; margin-top: 16px;">
      Shipping to: ${order.shipping_address_line1}, ${order.shipping_city}, ${order.shipping_province}, ${order.shipping_postal_code}
    </p>
  </div>
  `;
}

async function sendEmail({ to, toName, subject, htmlContent }) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: SENDER_NAME, email: SENDER_EMAIL },
      to: [{ email: to, name: toName || to }],
      subject,
      htmlContent,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Brevo API error: ${response.status} ${errText}`);
  }

  return response.json();
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { orderId } = JSON.parse(event.body || '{}');

    if (!orderId) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'orderId is required' }) };
    }

    // ── Fetch order with items ─────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Order not found' }) };
    }

    const items = order.order_items || [];

    // ── Send customer confirmation email ─────────────────────────────────────
    await sendEmail({
      to: order.client_email,
      toName: order.client_name,
      subject: `Order Confirmed — ${order.id} | SPET Online`,
      htmlContent: buildCustomerEmailHtml(order, items),
    });

    // ── Send admin notification email ────────────────────────────────────────
    await sendEmail({
      to: SENDER_EMAIL,
      toName: 'SPET Online Admin',
      subject: `🎉 New Order Paid — ${order.id}`,
      htmlContent: buildAdminEmailHtml(order, items),
    });

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };

  } catch (err) {
    console.error('send-order-email error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'Failed to send email', details: err.message }),
    };
  }
};// cache-bust: force rebuild after env var scope fix (2026-07-12T21:49:14Z)
