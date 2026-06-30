// netlify/functions/calculate-shipping.js
// Shipping rules:
//   Order value >= R2,500         → FREE shipping
//   Total weight <= 5kg           → R90 flat rate
//   Total weight > 5kg            → Real Courier Guy rate via ShipLogic API
//   Fallback (API unavailable)    → R90 flat rate

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const FREE_SHIPPING_THRESHOLD = 2500;  // R2,500 — free shipping
const FLAT_RATE                = 90;   // R90 flat rate for <= 5kg
const WEIGHT_THRESHOLD_KG      = 5;    // 5kg cutoff

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── Fetch product weights from DB ──────────────────────────────────────────
async function getProductWeights(items) {
  const esquireIds = items.filter(i => i.supplier === 'esquire').map(i => i.product_id);
  const syntechIds = items.filter(i => i.supplier === 'syntech').map(i => i.product_id);

  const weightMap = {};

  if (esquireIds.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('id, "MassKG"')
      .in('id', esquireIds);

    for (const p of data || []) {
      const kg = Number(p.MassKG) || 0;
      weightMap[p.id] = kg;
    }
  }

  if (syntechIds.length > 0) {
    const { data } = await supabase
      .from('syntech_products')
      .select('id, weight_grams')
      .in('id', syntechIds);

    for (const p of data || []) {
      let kg = Number(p.weight_grams) || 0;
      // Sanity check: if weight_grams > 200,000 it's likely already in kg
      // (some Syntech rows store kg values in the grams column)
      if (kg > 200000) {
        kg = kg / 1000000; // likely stored as milligrams — convert
      } else if (kg > 500) {
        kg = kg / 1000; // stored as grams — convert to kg
      }
      // If still > 150kg treat as 1kg (data error)
      if (kg > 150) kg = 1;
      weightMap[p.id] = kg;
    }
  }

  return weightMap;
}

// ── Calculate total order weight ──────────────────────────────────────────
function calculateTotalWeight(items, weightMap) {
  let totalKg = 0;
  for (const item of items) {
    const unitWeight = weightMap[item.product_id] || 0.5; // default 0.5kg if unknown
    totalKg += unitWeight * item.qty;
  }
  return totalKg;
}

// ── Call ShipLogic / Courier Guy API for real rate ─────────────────────────
async function getCourierGuyRate(totalWeightKg, postalCode) {
  const apiKey = process.env.COURIER_GUY_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch('https://api.shiplogic.com/rates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collection_address: {
          // SPET Online warehouse/collection address
          street_address: '1 Business District',
          local_area:     'Johannesburg',
          city:           'Johannesburg',
          code:           '2001',
          zone:           'GP',
          country:        'South Africa',
        },
        delivery_address: {
          local_area: postalCode,
          city:       postalCode,
          code:       postalCode,
          country:    'South Africa',
        },
        parcels: [
          {
            submitted_length_cm: 30,
            submitted_width_cm:  20,
            submitted_height_cm: 15,
            submitted_weight_kg: Math.max(totalWeightKg, 0.5), // minimum 0.5kg
          },
        ],
        declared_value: 1000,
        collect_time_from: '08:00',
        collect_time_to:   '17:00',
        delivery_time_from: '08:00',
        delivery_time_to:   '17:00',
      }),
    });

    if (!response.ok) {
      console.error('Courier Guy API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const rates = data.rates || [];

    if (rates.length === 0) return null;

    // Find the cheapest ECO (Economy) rate
    const ecoRates = rates.filter(r =>
      r.service_level?.code?.includes('ECO') ||
      r.service_level?.name?.toLowerCase().includes('economy')
    );

    const cheapest = (ecoRates.length > 0 ? ecoRates : rates)
      .sort((a, b) => Number(a.rate) - Number(b.rate))[0];

    const rateAmount = Math.ceil(Number(cheapest.rate));
    return rateAmount > 0 ? rateAmount : null;

  } catch (err) {
    console.error('Courier Guy API call failed:', err.message);
    return null;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { items, orderValue, postalCode } = body;

    if (!items || items.length === 0) {
      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipping: FLAT_RATE, method: 'flat', reason: 'No items' }),
      };
    }

    // ── Rule 1: Free shipping for orders over R2,500 ──────────────────────
    if (orderValue >= FREE_SHIPPING_THRESHOLD) {
      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping: 0,
          method: 'free',
          reason: `Free shipping on orders over R${FREE_SHIPPING_THRESHOLD.toLocaleString()}`,
        }),
      };
    }

    // ── Fetch product weights ─────────────────────────────────────────────
    const weightMap   = await getProductWeights(items);
    const totalWeight = calculateTotalWeight(items, weightMap);

    console.log(`Order weight: ${totalWeight.toFixed(2)}kg, value: R${orderValue}`);

    // ── Rule 2: Flat rate for orders <= 5kg ───────────────────────────────
    if (totalWeight <= WEIGHT_THRESHOLD_KG) {
      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping: FLAT_RATE,
          method:   'flat',
          weight:   totalWeight,
          reason:   `Flat rate for orders under ${WEIGHT_THRESHOLD_KG}kg`,
        }),
      };
    }

    // ── Rule 3: Real Courier Guy rate for orders > 5kg ────────────────────
    const liveRate = await getCourierGuyRate(totalWeight, postalCode || '2000');

    if (liveRate) {
      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping: liveRate,
          method:   'courier_guy',
          weight:   totalWeight,
          reason:   `Courier Guy Economy rate for ${totalWeight.toFixed(1)}kg`,
        }),
      };
    }

    // ── Fallback: R90 flat rate if Courier Guy API unavailable ────────────
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shipping: FLAT_RATE,
        method:   'flat_fallback',
        weight:   totalWeight,
        reason:   'Courier Guy API unavailable — flat rate applied',
      }),
    };

  } catch (err) {
    console.error('calculate-shipping error:', err);
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shipping: FLAT_RATE,
        method:   'flat_fallback',
        reason:   'Error calculating shipping — flat rate applied',
      }),
    };
  }
};
