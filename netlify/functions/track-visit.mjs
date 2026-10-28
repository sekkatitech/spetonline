// netlify/functions/track-visit.mjs
// Records one storefront page view into Supabase `site_visits` for the admin
// dashboard's Site Visitors page (table + aggregation live in the spet-admin
// repo: supabase/migrations/*_site_visits.sql).
//
// Privacy: no IP address is stored. visitor_id / session_id are random UUIDs
// created in the browser; location is Netlify's city-level edge geo lookup.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Netlify.env.get('SUPABASE_URL'),
  Netlify.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT_RE = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp/i;
const SEARCH_RE = /(^|\.)(google|bing|yahoo|duckduckgo|yandex|baidu|ecosia)\./i;
const SOCIAL_RE = /(^|\.)(facebook|fb|instagram|linkedin|lnkd|twitter|x|t|tiktok|youtube|pinterest|reddit|whatsapp)\.(com|co|me|in)$/i;

function deviceType(ua) {
  if (/ipad|tablet|kindle|silk/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) return 'tablet';
  if (/mobi|iphone|ipod|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

function trafficSource(referrerHost, siteHost) {
  if (!referrerHost) return 'direct';
  if (referrerHost === siteHost || referrerHost.endsWith('.' + siteHost)) return 'internal';
  if (SEARCH_RE.test(referrerHost)) return 'search';
  if (SOCIAL_RE.test(referrerHost)) return 'social';
  return 'referral';
}

export default async (req, context) => {
  if (req.method !== 'POST') return new Response(null, { status: 405 });

  const ua = req.headers.get('user-agent') || '';
  if (BOT_RE.test(ua)) return new Response(null, { status: 204 });

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const { visitorId, sessionId, path, referrer } = body || {};
  if (!UUID_RE.test(visitorId) || !UUID_RE.test(sessionId) || typeof path !== 'string' || !path.startsWith('/')) {
    return new Response(null, { status: 400 });
  }

  let referrerHost = null;
  try {
    if (referrer) referrerHost = new URL(referrer).hostname.replace(/^www\./, '');
  } catch { /* ignore malformed referrer */ }
  const siteHost = new URL(req.url).hostname.replace(/^www\./, '');

  const geo = context.geo || {};
  const row = {
    visitor_id: visitorId,
    session_id: sessionId,
    path: path.split('?')[0].slice(0, 300),
    referrer_host: referrerHost?.slice(0, 200) ?? null,
    source: trafficSource(referrerHost, siteHost),
    device: deviceType(ua),
    city: geo.city ?? null,
    region: geo.subdivision?.name ?? null,
    country: geo.country?.name ?? null,
    country_code: geo.country?.code ?? null,
    latitude: geo.latitude ?? null,
    longitude: geo.longitude ?? null,
  };

  // Respond immediately; write after the response so page loads never wait on it.
  context.waitUntil(
    supabase.from('site_visits').insert(row).then(({ error }) => {
      if (error) console.error('track-visit insert failed:', error.message);
    }),
  );

  return new Response(null, { status: 204 });
};

export const config = {
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
