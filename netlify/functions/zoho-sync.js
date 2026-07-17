// netlify/functions/zoho-sync.js
// Syncs SPET data to Zoho Books:
// - Completed order → Zoho Invoice
// - New customer → Zoho Contact
// - Enterprise quote approved → Zoho Invoice with credit terms

const { createClient } = require('@supabase/supabase-js');
const { findOrCreateContact, createInvoiceFromOrder, zohoAPI } = require('./zoho-lib');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
// revert: env vars restored to plain (non-secret) after runtime incident
