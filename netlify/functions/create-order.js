const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// ── Supabase admin client (server-side only, never exposed to browser) ──────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // service role — bypasses RLS for price lookups
);

const SHIPPING_THRESHOLD = 2500;
const SHIPPING_COST = 150;

// ── PayFast config (server-side only) ────────────────────────────────────────
const PF_MERCHANT_ID  = process.env.PAYFAST_MERCHANT_ID;
const PF_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY;
const PF_PASSPHRASE   = process.env.PAYFAST_PASSPHRASE || '';
// Switch to live URL when ready: 'https://www.payfast.co.za/eng/process'
const PF_URL = process.env.PAYFAST_SANDBOX === 'true'
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process';

// ── PayFast MD5 signature generator ─────────────────────────────────────────
function generatePfSignature(data, passphrase = '') {
  // Build query string in exact key order PayFast requires
  let str = Object.entries(data)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim())}`)
    .join('&');
  if (passphrase) str += `&passphrase=${encodeURIComponent(passphrase.trim())}`;
  return crypto.createHash('md5').update(str).digest('hex');
}

// ── CORS helper ───────────────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const {
      accessToken,   // Supabase user JWT — we verify who the user is server-side
      items,         // [{ product_id, sku, qty, supplier }]
      shippingAddress,
      promoCode,
      promoId,
    } = body;

    // ── 1. Verify the user token ─────────────────────────────────────────────
    if (!accessToken) {
      return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorised' }) };
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Invalid session' }) };
    }

    // ── 2. Validate cart items are present ───────────────────────────────────
    if (!items || items.length === 0) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Cart is empty' }) };
    }

    // ── 3. Re-fetch prices from DB — browser totals are IGNORED ─────────────
    // Split by supplier so we query the right table
    const esquireIds = items.filter(i => i.supplier === 'esquire').map(i => i.product_id);
    const syntechIds = items.filter(i => i.supplier === 'syntech').map(i => i.product_id);

    const priceMap = {};  // product_id → { price, name, sku, qty_available }

    if (esquireIds.length > 0) {
      const { data: esquireProducts, error: eq } = await supabase
        .from('products')
        .select('id, ProductName, ProductCode, Price, AvailableQty')
        .in('id', esquireIds)
        .eq('is_active', true);

      if (eq) throw new Error('Failed to fetch Esquire product prices');

      for (const p of esquireProducts) {
        priceMap[p.id] = {
          price: Number(p.Price),
          name: p.ProductName,
          sku: p.ProductCode,
          qty_available: p.AvailableQty,
        };
      }
    }

    if (syntechIds.length > 0) {
      const { data: syntechProducts, error: sq } = await supabase
        .from('syntech_products')
        .select('id, name, sku, price_display, stock_qty')
        .in('id', syntechIds)
        .eq('is_active', true);

      if (sq) throw new Error('Failed to fetch Syntech product prices');

      for (const p of syntechProducts) {
        priceMap[p.id] = {
          price: Number(p.price_display),
          name: p.name,
          sku: p.sku,
          qty_available: p.stock_qty,
        };
      }
    }

    // ── 4. Validate all items found + build verified line items ───────────────
    const verifiedItems = [];
    for (const cartItem of items) {
      const dbProduct = priceMap[cartItem.product_id];
      if (!dbProduct) {
        return {
          statusCode: 400,
          headers: CORS,
          body: JSON.stringify({ error: `Product not found or no longer active: ${cartItem.product_id}` }),
        };
      }
      if (cartItem.qty < 1) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid quantity' }) };
      }

      verifiedItems.push({
        product_id: cartItem.product_id,
        product_name: dbProduct.name,
        sku: dbProduct.sku,
        qty: cartItem.qty,
        unit_price: dbProduct.price,            // ← server price, not browser price
        line_total: dbProduct.price * cartItem.qty,
      });
    }

    // ── 5. Recalculate totals server-side ────────────────────────────────────
    const subtotal = verifiedItems.reduce((sum, i) => sum + i.line_total, 0);

    // Validate promo code server-side if provided
    let discountAmount = 0;
    let validatedPromoId = null;
    if (promoCode) {
      const { data: promo } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (promo) {
        const now = new Date();
        const notStarted = promo.starts_at && new Date(promo.starts_at) > now;
        const expired = promo.ends_at && new Date(promo.ends_at) < now;
        const maxUsed = promo.max_uses && promo.uses_count >= promo.max_uses;
        const belowMin = promo.min_order_value && subtotal < promo.min_order_value;

        if (!notStarted && !expired && !maxUsed && !belowMin) {
          if (promo.type === 'percentage' && promo.value) discountAmount = subtotal * (promo.value / 100);
          if (promo.type === 'fixed' && promo.value) discountAmount = promo.value;
          validatedPromoId = promo.id;
        }
      }
    }

    const afterDiscount = subtotal - discountAmount;
    const shippingCost = afterDiscount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = afterDiscount + shippingCost;

    // ── 6. Validate shipping address ─────────────────────────────────────────
    if (!shippingAddress?.address_line1 || !shippingAddress?.city || !shippingAddress?.province || !shippingAddress?.postal_code) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Incomplete shipping address' }) };
    }

    const clientName = shippingAddress.full_name || `${shippingAddress.first_name || ''} ${shippingAddress.last_name || ''}`.trim() || 'Customer';
    const clientPhone = shippingAddress.phone || null;

    // ── 7. Create the order in Supabase ──────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        client_name: clientName,
        client_email: user.email,
        client_phone: clientPhone,
        shipping_full_name: clientName,
        shipping_phone: clientPhone,
        shipping_address_line1: shippingAddress.address_line1,
        shipping_address_line2: shippingAddress.address_line2 || null,
        shipping_city: shippingAddress.city,
        shipping_province: shippingAddress.province,
        shipping_postal_code: shippingAddress.postal_code,
        shipping_country: shippingAddress.country || 'South Africa',
        shipping_address: shippingAddress,
        status: 'pending',
        payment_status: 'unpaid',
        subtotal,
        discount_amount: discountAmount,
        shipping: shippingCost,
        vat_amount: 0,
        total,
        promotion_id: validatedPromoId,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order insert error:', orderError);
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Failed to create order. Please try again.' }) };
    }

    // ── 8. Insert order items ─────────────────────────────────────────────────
    const orderItems = verifiedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      name: item.product_name,
      sku: item.sku,
      qty: item.qty,
      unit_price: item.unit_price,
      line_total: item.line_total,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) {
      console.error('Order items insert error:', itemsError);
      // Order exists but items failed — mark as error so admin can fix
      await supabase.from('orders').update({ status: 'error' }).eq('id', order.id);
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Failed to save order items. Please contact support.' }) };
    }

    // ── 9. Build PayFast payload (server-side, signed) ────────────────────────
    const firstName = shippingAddress.first_name?.trim() || clientName.split(' ')[0] || 'Customer';
    const lastName = shippingAddress.last_name?.trim() || clientName.split(' ').slice(1).join(' ') || 'Name';

    const siteUrl = process.env.SITE_URL || 'https://spetonline.co.za';

    const pfData = {
      merchant_id:   PF_MERCHANT_ID,
      merchant_key:  PF_MERCHANT_KEY,
      return_url:    `${siteUrl}/payment-success?order_number=${order.id}`,
      cancel_url:    `${siteUrl}/payment-cancel?order_number=${order.id}`,
      notify_url:    `${siteUrl}/.netlify/functions/payfast-itn`,
      name_first:    firstName,
      name_last:     lastName,
      email_address: user.email,
      m_payment_id:  order.id,
      amount:        total.toFixed(2),
      item_name:     `SPET Online Order`,
    };

    // Generate MD5 signature
    const signature = generatePfSignature(pfData, PF_PASSPHRASE);

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        orderId: order.id,
        // Verified totals to show user before redirect
        totals: { subtotal, discountAmount, shippingCost, total },
        // PayFast redirect data
        payfast: {
          url: PF_URL,
          fields: { ...pfData, signature },
        },
      }),
    };

  } catch (err) {
    console.error('create-order error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
    };
  }
};