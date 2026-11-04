// netlify/functions/cancel-stale-orders.mjs
// Scheduled daily (netlify.toml, 05:00 UTC = 07:00 SAST). Cancels storefront orders
// left unpaid for 48 hours, which is long enough for a slow EFT. Enterprise orders are
// skipped because they stay unpaid on credit terms. A payment that still arrives is
// recorded by payfast-itn.js, which overwrites the status.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Netlify.env.get('SUPABASE_URL'),
  Netlify.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

const MAX_AGE_MS = 48 * 60 * 60 * 1000;
// Orders from before this job existed are a separate, one-off cleanup.
const FIRST_ORDER_COVERED = '2026-11-04T00:00:00Z';

export default async () => {
  const cutoff = new Date(Date.now() - MAX_AGE_MS).toISOString();

  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('source', 'consumer')
    .eq('status', 'pending')
    .eq('payment_status', 'unpaid')
    .gte('created_at', FIRST_ORDER_COVERED)
    .lt('created_at', cutoff)
    .select('id');

  if (error) {
    console.error('[cancel-stale-orders] failed:', error.message);
    return new Response('error', { status: 500 });
  }

  console.log(`[cancel-stale-orders] cancelled ${data.length} order(s)`);
  return new Response('ok');
};
