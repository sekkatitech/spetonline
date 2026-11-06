// netlify/functions/feedback.mjs
// "Share feedback" form (src/components/engagement). Stores one private feedback item in
// Supabase `site_feedback` (docs/database/2026-11-06-feedback-and-newsletter.sql) for the
// admin page's Feedback tab. No account needed; nothing is shown publicly or emailed out.
//
// Spam protection: Netlify rate limit, a hidden honeypot field, a minimum time between the
// form opening and being sent, and length caps on every field.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Netlify.env.get('SUPABASE_URL'),
  Netlify.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

const REASONS = ['browsing', 'buying', 'comparing_prices', 'testing'];
const TOPICS = ['suggestion', 'technical_problem', 'product_request', 'other'];
const DEVICES = ['mobile', 'tablet', 'desktop'];
const SOURCES = ['widget', 'tester_page'];
const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;
// Faster than a person can read the form and type a message.
const MIN_FILL_MS = 2500;

const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const oneOf = (value, list) => (list.includes(value) ? value : null);

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid request' });
  }

  // Bots that fill the hidden field, or send instantly, get a normal-looking reply and nothing is stored.
  const elapsed = Number(body?.elapsedMs);
  if (body?.website || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return json(200, { ok: true });

  const topic = oneOf(body?.topic, TOPICS);
  const message = text(body?.message, 2000);
  const email = text(body?.email, 254);
  const ease = Number.isInteger(body?.ease) && body.ease >= 1 && body.ease <= 5 ? body.ease : null;
  const pagePath = text(body?.pagePath, 500);

  if (!topic || message.length < 3) {
    return json(400, { error: 'Please choose what you would like to tell us and write a short message.' });
  }
  if (email && !EMAIL_RE.test(email)) {
    return json(400, { error: 'Please check your email address, or leave it empty.' });
  }

  const { error } = await supabase.from('site_feedback').insert({
    reason: oneOf(body?.reason, REASONS),
    ease,
    topic,
    message,
    email: email || null,
    page_path: pagePath.startsWith('/') ? pagePath : null,
    device: oneOf(body?.device, DEVICES),
    source: oneOf(body?.source, SOURCES) || 'widget',
  });

  if (error) {
    console.error('[feedback] insert failed:', error.message);
    return json(502, { error: "Sorry, we couldn't send your feedback. Please try again in a moment." });
  }

  return json(200, { ok: true });
};

export const config = {
  path: '/api/feedback',
  rateLimit: { windowLimit: 6, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
