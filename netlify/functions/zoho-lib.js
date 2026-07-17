// netlify/functions/zoho-lib.js
// Shared Zoho Books helpers — imported directly (no HTTP hop) by both
// zoho-sync.js (admin-triggered actions) and payfast-itn.js (the PayFast
// webhook, which has no admin session to pass zoho-sync.js's auth gate).

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ZOHO_ORG_ID = process.env.ZOHO_ORGANIZATION_ID;
const ZOHO_BASE   = 'https://www.zohoapis.com/books/v3';

// ── Get valid access token (refresh if expired) ──
async function getAccessToken() {
  const { data: tokenRow } = await supabase
    .from('zoho_tokens')
    .select('*')
    .eq('id', 1)
    .single();

  if (!tokenRow) throw new Error('Zoho not connected. Run OAuth setup first.');

  const isExpired = new Date(tokenRow.expires_at) <= new Date(Date.now() + 60000);

  if (!isExpired) return tokenRow.access_token;

  // Refresh the token
  const res = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      client_id:     process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      refresh_token: tokenRow.refresh_token,
    }),
  });

  const newTokens = await res.json();
  if (newTokens.error) throw new Error(`Token refresh failed: ${newTokens.error}`);

  const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000).toISOString();

  await supabase.from('zoho_tokens').update({
    access_token: newTokens.access_token,
    expires_at:   expiresAt,
    updated_at:   new Date().toISOString(),
  }).eq('id', 1);

  return newTokens.access_token;
}

// ── Zoho API helper ──
async function zohoAPI(method, path, body = null) {
  const token = await getAccessToken();
  // path sometimes already carries its own query string (e.g. the contact
  // email search below) — appending "?organization_id=" unconditionally
  // produced a second "?", which silently swallowed organization_id into the
  // preceding parameter's value instead of being read as its own param.
  const separator = path.includes('?') ? '&' : '?';
  const res = await fetch(`${ZOHO_BASE}${path}${separator}organization_id=${ZOHO_ORG_ID}`, {
    method,
    headers: {
      'Authorization': `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (data.code !== 0 && data.code !== undefined) {
    throw new Error(`Zoho API error: ${data.message}`);
  }
  return data;
}

// ── Find or create Zoho contact ──
async function findOrCreateContact(email, name, companyName = null) {
  // Search for existing contact
  const search = await zohoAPI('GET', `/contacts?email=${encodeURIComponent(email)}`);
  if (search.contacts && search.contacts.length > 0) {
    return search.contacts[0].contact_id;
  }

  // Create new contact
  const newContact = await zohoAPI('POST', '/contacts', {
    contact_name:    companyName || name,
    contact_type:    'customer',
    contact_persons: [{ first_name: name.split(' ')[0], last_name: name.split(' ').slice(1).join(' '), email, is_primary_contact: true }],
  });

  return newContact.contact.contact_id;
}

// ── Create Zoho Invoice from SPET order ──
async function createInvoiceFromOrder(order) {
  const contactId = await findOrCreateContact(
    order.client_email,
    order.client_name,
    order.org_name
  );

  // Build line items from order items. order_items rows use `unit_price`,
  // not `price` — using the wrong field silently invoiced everything at R0.
  const lineItems = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map(item => ({
        name:       item.name || 'Product',
        rate:       Number(item.unit_price) || 0,
        quantity:   Number(item.qty) || 1,
        tax_name:   'VAT',
        tax_percentage: 15,
      }))
    : [{
        name:       `Order ${order.id}`,
        rate:       Number(order.subtotal) || Number(order.total) || 0,
        quantity:   1,
        tax_name:   'VAT',
        tax_percentage: 15,
      }];

  const invoiceData = {
    // NOTE: no invoice_number field — this Zoho Books org has auto-numbering
    // enabled, and supplying an explicit number that doesn't match Zoho's own
    // sequence is rejected outright (error 4097). Zoho assigns its own
    // invoice number; SPET's order id is still tracked via reference_number.
    customer_id:      contactId,
    reference_number: order.po_number || order.quote_ref || order.id,
    date:             new Date(order.created_at).toISOString().split('T')[0],
    due_date:         order.due_date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    payment_terms:    order.credit_terms || 0,
    line_items:       lineItems,
    notes:            `SPET Order: ${order.id}${order.source === 'enterprise' ? ' (Enterprise)' : ''}`,
  };

  const result = await zohoAPI('POST', '/invoices', invoiceData);

  // Mark as paid if already paid
  if (order.payment_status === 'paid' && result.invoice) {
    await zohoAPI('POST', `/invoices/${result.invoice.invoice_id}/status/sent`);
  }

  return result.invoice;
}

module.exports = { getAccessToken, zohoAPI, findOrCreateContact, createInvoiceFromOrder };
