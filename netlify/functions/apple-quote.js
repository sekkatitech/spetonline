// netlify/functions/apple-quote.js
// Saves an Apple quote request and emails the sales team and the customer. Prices come
// from the database, never the browser. Email failures don't lose the quote: it is
// already saved and staff can see it in the dashboard.

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = 'admin@spetonline.co.za';
const SENDER_NAME = process.env.SENDER_NAME || 'SPET Online';
const QUOTE_ALERT_EMAIL = process.env.QUOTE_ALERT_EMAIL || 'info@sekkatitech.co.za';

const MAX_LINES = 50;
const MAX_QTY = 999;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const respond = (statusCode, body) => ({
  statusCode,
  headers: { ...CORS, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clean = (value, max) => String(value ?? '').trim().slice(0, max);
const money = (n) => `R ${Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

function itemRows(lines) {
  return lines.map((l) => `
    <tr style="border-bottom:1px solid #e5e7eb">
      <td style="padding:10px 8px;font-size:14px;color:#1f2937">${esc(l.name)}<br><span style="font-size:12px;color:#6b7280">${esc(l.sku)}</span></td>
      <td style="padding:10px 8px;font-size:14px;color:#6b7280;text-align:center">${l.qty}</td>
      <td style="padding:10px 8px;font-size:14px;color:#1f2937;text-align:right">${money(l.price * l.qty)}</td>
    </tr>`).join('');
}

function staffEmailHtml(quote, lines, total, contact) {
  return `<div style="font-family:Arial,sans-serif;max-width:640px;color:#1f2937">
    <h2>New Apple quote request: ${esc(quote.ref || quote.id)}</h2>
    <p><b>Contact:</b> ${esc(contact.name)}<br>
    <b>Email:</b> ${esc(contact.email)}<br>
    <b>Phone:</b> ${esc(contact.phone)}<br>
    <b>Organisation:</b> ${esc(contact.organisation || 'None given')}</p>
    ${contact.notes ? `<p><b>Notes:</b> ${esc(contact.notes)}</p>` : ''}
    <table style="width:100%;border-collapse:collapse">${itemRows(lines)}</table>
    <p style="font-size:16px"><b>Estimated total: ${money(total)}</b> incl. VAT</p>
    <p style="color:#6b7280;font-size:13px">Check availability, then press Reply to answer the customer. Tell them if anything is unavailable or on order.</p>
  </div>`;
}

function customerEmailHtml(quote, lines, total, contact) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
    <div style="background:#0a141d;padding:24px;text-align:center"><h1 style="color:#fff;margin:0;font-size:22px">SPET Online</h1></div>
    <div style="padding:32px 24px">
      <h2 style="color:#1f2937;font-size:20px;margin-top:0">We've received your quote request</h2>
      <p style="color:#6b7280;font-size:14px;line-height:1.6">Hi ${esc(contact.name)}, thank you. Your reference is <b>${esc(quote.ref || quote.id)}</b>.</p>
      <p style="color:#1f2937;font-size:14px;line-height:1.6"><b>Shop with Confidence!</b> Our team will confirm product availability and keep you informed throughout your order. If an item is temporarily out of stock, we'll gladly assist with a special order or a suitable alternative.</p>
      <table style="width:100%;border-collapse:collapse">${itemRows(lines)}</table>
      <p style="font-size:16px;color:#1f2937"><b>Estimated total: ${money(total)}</b> incl. VAT</p>
      <p style="color:#6b7280;font-size:13px;line-height:1.6">Delivery is 3 to 14 days, pending stock availability. If an item isn't available, you can cancel for a 100% refund of anything you've paid.</p>
      <p style="color:#6b7280;font-size:12px;line-height:1.6">Prices remain subject to change up to delivery, and the price payable is the list price on the date of delivery. E&amp;OE.</p>
    </div>
    <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb">
      <p style="margin:0;font-size:11px;color:#9ca3af">Sekkati Petroleum Energy and Technology (Pty) Ltd · Trading as SPET Online</p>
    </div>
  </div>`;
}

async function sendEmail(message) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
    body: JSON.stringify({ sender: { name: SENDER_NAME, email: SENDER_EMAIL }, ...message }),
  });
  if (!response.ok) throw new Error(`Brevo API error: ${response.status} ${await response.text()}`);
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method not allowed' });

  try {
    const body = JSON.parse(event.body || '{}');

    const { data: { user }, error: authError } = await supabase.auth.getUser(clean(body.accessToken, 4000));
    if (authError || !user) return respond(401, { error: 'Please sign in to request a quote.' });

    // Apple is sold to businesses: must match canUseApple in src/lib/appleAccess.ts.
    const { data: access } = await supabase
      .from('profiles')
      .select('role, enterprise_status')
      .eq('id', user.id)
      .maybeSingle();
    if (!['admin', 'super_admin'].includes(access?.role) && !['approved', 'pending'].includes(access?.enterprise_status)) {
      return respond(403, { error: 'Please register your business to request a quote.' });
    }

    const name = clean(body.contactName, 120);
    const phone = clean(body.contactPhone, 40);
    const organisation = clean(body.organisation, 160);
    const notes = clean(body.notes, 2000);
    if (!name || phone.replace(/\D/g, '').length < 9) {
      return respond(400, { error: 'Please add your name and a valid phone number.' });
    }

    const requested = Array.isArray(body.items) ? body.items : [];
    if (requested.length === 0 || requested.length > MAX_LINES) {
      return respond(400, { error: 'Please add between 1 and 50 products to your quote.' });
    }
    if (requested.some((i) => !Number.isInteger(i.qty) || i.qty < 1 || i.qty > MAX_QTY)) {
      return respond(400, { error: 'Please check the quantities in your quote.' });
    }

    const { data: products, error: productError } = await supabase
      .from('core_products')
      .select('id, sku, name, price_display')
      .in('id', requested.map((i) => String(i.product_id)))
      .eq('is_active', true)
      .eq('is_enterprise_only', true);
    if (productError) throw new Error(productError.message);

    const byId = new Map(products.map((p) => [String(p.id), p]));
    const missing = requested.filter((i) => !byId.has(String(i.product_id)));
    if (missing.length > 0) {
      return respond(400, { error: 'A product in your quote is no longer available. Please remove it and try again.' });
    }

    const lines = requested.map((i) => {
      const p = byId.get(String(i.product_id));
      return { id: p.id, product_id: p.id, sku: p.sku, name: p.name.replace(/\s+/g, ' ').trim(), qty: i.qty, price: Number(p.price_display) };
    });
    const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);

    const { data: member } = await supabase
      .from('enterprise_account_members')
      .select('account_id')
      .eq('profile_id', user.id)
      .maybeSingle();

    // org_type is required by the table, and 'business' is the value the other quote
    // pages use. Individuals are told apart by org_name holding their own name.
    const { data: quote, error: quoteError } = await supabase
      .from('quote_requests')
      .insert({
        id: `QR-${crypto.randomBytes(4).toString('hex').slice(0, 7).toUpperCase()}`,
        user_id: user.id,
        enterprise_account_id: member?.account_id ?? null,
        source: 'enterprise',
        status: 'pending',
        org_name: organisation || name,
        org_type: 'business',
        contact_person: name,
        contact_phone: phone,
        notes: notes || null,
        items: lines,
        estimated_total: total,
        final_amount: total,
      })
      .select('id, ref')
      .single();
    if (quoteError) throw new Error(quoteError.message);

    const { error: lineError } = await supabase.from('enterprise_quote_items').insert(lines.map((l) => ({
      quote_id: quote.id,
      product_source: 'enterprise',
      product_name: l.name,
      sku: l.sku,
      brand: 'Apple',
      quantity: l.qty,
      unit_price: l.price,
    })));
    if (lineError) console.error('apple-quote: line items not saved:', lineError.message);

    const contact = { name, email: user.email, phone, organisation, notes };
    const reference = quote.ref || quote.id;
    const results = await Promise.allSettled([
      sendEmail({
        to: [{ email: QUOTE_ALERT_EMAIL }],
        replyTo: { email: user.email, name },
        subject: `New Apple quote request ${reference} from ${name}`,
        htmlContent: staffEmailHtml(quote, lines, total, contact),
      }),
      sendEmail({
        to: [{ email: user.email, name }],
        subject: `We've received your quote request ${reference} | SPET Online`,
        htmlContent: customerEmailHtml(quote, lines, total, contact),
      }),
    ]);
    const [staffResult, customerResult] = results;

    // Failures go in the staff-only notes field so a quote that nobody was told about can
    // still be spotted. Not admin_notes: customers can read that on their quotes page.
    const problems = [];
    if (lineError) problems.push(`line items not saved: ${lineError.message}`);
    if (staffResult.status === 'rejected') problems.push(`staff alert failed: ${staffResult.reason.message}`);
    if (customerResult.status === 'rejected') problems.push(`customer email failed: ${customerResult.reason.message}`);
    if (problems.length > 0) {
      console.error('apple-quote:', problems.join('; '));
      const systemNote = `[System] ${problems.join('; ')}`.slice(0, 1000);
      const { error: noteError } = await supabase
        .from('quote_requests')
        .update({ notes: notes ? `${notes}\n${systemNote}` : systemNote })
        .eq('id', quote.id);
      if (noteError) console.error('apple-quote: could not record problems:', noteError.message);
    }

    return respond(200, { success: true, reference, total, customerEmailed: customerResult.status === 'fulfilled' });
  } catch (err) {
    console.error('apple-quote error:', err);
    return respond(500, { error: "We couldn't save your quote. Please try again or email sales@spetonline.co.za." });
  }
};
