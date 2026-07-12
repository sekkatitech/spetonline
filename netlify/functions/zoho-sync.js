// netlify/functions/zoho-sync.js
// Syncs SPET data to Zoho Books:
// - Completed order → Zoho Invoice
// - New customer → Zoho Contact
// - Enterprise quote approved → Zoho Invoice with credit terms

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
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
  const res = await fetch(`${ZOHO_BASE}${path}?organization_id=${ZOHO_ORG_ID}`, {
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

  // Build line items from order items
  const lineItems = Array.isArray(order.items)
    ? order.items.map(item => ({
        name:       item.name || 'Product',
        rate:       Number(item.price) || 0,
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
    customer_id:      contactId,
    invoice_number:   order.id,
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

// Verifies the caller is a signed-in admin/super_admin. Was previously a
// static x-spet-secret header comparison — that value is baked into the
// admin dashboard's public JS bundle (VITE_* vars are never secret), so
// anyone who read the bundle could call this endpoint with full service-role
// write access. Real auth: validate the caller's Supabase session, then
// check their profiles.role.
async function requireAdmin(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) return null;
  return user;
}

// ── Main handler ──
exports.handler = async (event) => {
  // Verify this is called from a signed-in SPET admin
  const admin = await requireAdmin(event);
  if (!admin) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const body = JSON.parse(event.body || '{}');
  const { action, data } = body;

  try {
    let result;

    switch (action) {

      // Sync a completed order to Zoho as an invoice
      case 'sync_order': {
        const invoice = await createInvoiceFromOrder(data);
        // Update SPET order with Zoho invoice ID
        await supabase.from('orders').update({
          internal_notes: `Zoho Invoice: ${invoice.invoice_id}`,
        }).eq('id', data.id);
        result = { success: true, invoice_id: invoice.invoice_id };
        break;
      }

      // Sync a new customer to Zoho contacts
      case 'sync_customer': {
        const contactId = await findOrCreateContact(data.email, data.full_name, data.org_name);
        result = { success: true, contact_id: contactId };
        break;
      }

      // Sync an approved enterprise quote to Zoho as an invoice
      case 'sync_enterprise_quote': {
        const invoice = await createInvoiceFromOrder({
          ...data,
          id:           data.ref || data.id,
          subtotal:     data.final_amount,
          total:        data.final_amount,
          credit_terms: data.credit_terms || 30,
        });
        // Update quote with Zoho invoice ID
        await supabase.from('quote_requests').update({
          admin_notes: `${data.admin_notes || ''} | Zoho Invoice: ${invoice.invoice_id}`.trim(),
        }).eq('id', data.id);
        result = { success: true, invoice_id: invoice.invoice_id };
        break;
      }

      // Get financial summary from Zoho for the Finance dashboard
      case 'get_summary': {
        const [invoices, contacts] = await Promise.all([
          zohoAPI('GET', '/invoices?status=unpaid&per_page=10'),
          zohoAPI('GET', '/contacts?contact_type=customer&per_page=5'),
        ]);
        result = {
          success:           true,
          unpaid_invoices:   invoices.invoices || [],
          recent_customers:  contacts.contacts || [],
        };
        break;
      }

      default:
        return { statusCode: 400, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };

  } catch (err) {
    console.error('Zoho sync error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};// cache-bust: force rebuild after env var scope fix (2026-07-12T21:49:14Z)
