// netlify/functions/newsletter.mjs
// Newsletter sign-up with double opt-in (src/components/engagement, src/pages/NewsletterPage.tsx).
//
//   POST /api/newsletter              { email, consent: true, source, pagePath }  -> emails a confirmation link
//   POST /api/newsletter/confirm      { token }                                   -> pending -> confirmed
//   POST /api/newsletter/unsubscribe  { token }                                   -> unsubscribed
//
// The links in emails open /newsletter/confirm and /newsletter/unsubscribe on the site, where
// the visitor presses a button. Email security scanners open links on their own, so a link
// that acted on a plain visit could confirm or unsubscribe someone without them knowing.
//
// Consent record (POPIA s69): the exact wording agreed to, where and when, and when the
// address was confirmed, all in `newsletter_subscribers`. Nobody is subscribed until they
// confirm. Feedback, contact and account sign-ups never subscribe anyone.
//
// Optional: set BREVO_NEWSLETTER_LIST_ID and confirmed addresses are added to that Brevo
// list (and taken off it on unsubscribe), ready for campaigns. Brevo adds its own
// unsubscribe link to every campaign.

import { createHash, randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Netlify.env.get('SUPABASE_URL'),
  Netlify.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);

const SENDER_EMAIL = Netlify.env.get('SENDER_EMAIL') || 'sales@spetonline.co.za';
const SENDER_NAME = Netlify.env.get('SENDER_NAME') || 'SPET Online';
const SITE_URL = (Netlify.env.get('URL') || 'https://spetonline.co.za').replace(/\/$/, '');
const LIST_ID = Number(Netlify.env.get('BREVO_NEWSLETTER_LIST_ID')) || null;

// Must match NEWSLETTER_CONSENT_TEXT in src/lib/engagement.ts: this is the wording stored as proof.
const CONSENT_TEXT =
  'I agree to receive email newsletters and promotional offers from SPET Online. I can unsubscribe at any time.';
const SOURCES = ['footer_band', 'side_panel', 'tester_page'];
const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;
const MIN_FILL_MS = 1500;
const RESEND_AFTER_MS = 10 * 60 * 1000;
const CONFIRM_VALID_MS = 7 * 24 * 60 * 60 * 1000;

const token = () => randomBytes(32).toString('hex');
const hash = (value) => createHash('sha256').update(String(value)).digest('hex');
const isToken = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

async function brevo(path, payload) {
  const res = await fetch(`https://api.brevo.com/v3${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': Netlify.env.get('BREVO_API_KEY') },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Brevo ${path} ${res.status}: ${await res.text()}`);
}

function confirmationEmail(confirmUrl, unsubscribeUrl) {
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#101820;max-width:560px">
<h2 style="font-size:22px;margin:0 0 12px">Please confirm your subscription</h2>
<p>Thanks for signing up to SPET Online's newsletter. You'll get updates on IT products, new arrivals and special offers for your business.</p>
<p>Press the button to confirm. Until you do, we won't send you any newsletters.</p>
<p style="margin:24px 0"><a href="${esc(confirmUrl)}" style="background:#057dcd;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px;display:inline-block">Confirm subscription</a></p>
<p style="font-size:13px;color:#6b7783">This link works for 7 days. If you didn't sign up, ignore this email and nothing will happen.</p>
<hr style="border:none;border-top:1px solid #e4e2dc;margin:24px 0">
<p style="font-size:12px;color:#6b7783">Sent by Sekkati Petroleum Energy and Technology (Pty) Ltd, trading as SPET Online, Pretoria, South Africa.
Contact us at <a href="mailto:sales@spetonline.co.za" style="color:#0a5c99">sales@spetonline.co.za</a> or 0870 881 483.
Read how we use your information in our <a href="${SITE_URL}/?legal=privacy" style="color:#0a5c99">Privacy Notice</a>.
<a href="${esc(unsubscribeUrl)}" style="color:#0a5c99">Unsubscribe</a>.</p>
</div>`;
}

async function findByEmail(email) {
  const pattern = email.replace(/[\\%_]/g, (c) => `\\${c}`);
  // Older sign-ups may hold the same address twice in different capitals; a confirmed row wins.
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, status, confirm_sent_at')
    .ilike('email', pattern)
    .limit(5);
  if (error) throw error;
  if (!data?.length) return null;
  return data.find((row) => row.status === 'confirmed') ?? data[0];
}

async function subscribe(body) {
  const elapsed = Number(body?.elapsedMs);
  if (body?.website || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return json(200, { ok: true });

  const email = typeof body?.email === 'string' ? body.email.trim().slice(0, 254) : '';
  if (!EMAIL_RE.test(email)) return json(400, { error: 'Please enter a valid email address.' });
  if (body?.consent !== true) return json(400, { error: 'Please tick the box to agree before subscribing.' });

  const source = SOURCES.includes(body?.source) ? body.source : 'footer_band';
  const pagePath = typeof body?.pagePath === 'string' && body.pagePath.startsWith('/') ? body.pagePath.slice(0, 500) : null;

  const existing = await findByEmail(email);
  // The reply is the same either way, so the form can't be used to find out who subscribed.
  if (existing?.status === 'confirmed') return json(200, { ok: true });
  if (existing?.status === 'pending' && existing.confirm_sent_at
      && Date.now() - new Date(existing.confirm_sent_at).getTime() < RESEND_AFTER_MS) {
    return json(200, { ok: true });
  }

  const confirmToken = token();
  const unsubscribeToken = token();
  const now = new Date().toISOString();
  const row = {
    status: 'pending',
    consent_text: CONSENT_TEXT,
    consent_source: source,
    consent_page: pagePath,
    consented_at: now,
    confirm_token_hash: hash(confirmToken),
    confirm_sent_at: now,
    confirmed_at: null,
    unsubscribe_token_hash: hash(unsubscribeToken),
    unsubscribed_at: null,
    updated_at: now,
  };

  const { error } = existing
    ? await supabase.from('newsletter_subscribers').update(row).eq('id', existing.id)
    : await supabase.from('newsletter_subscribers').insert({ email, ...row });
  if (error) throw error;

  await brevo('/smtp/email', {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email }],
    subject: 'Please confirm your SPET Online newsletter subscription',
    htmlContent: confirmationEmail(
      `${SITE_URL}/newsletter/confirm?token=${confirmToken}`,
      `${SITE_URL}/newsletter/unsubscribe?token=${unsubscribeToken}`,
    ),
  });

  return json(200, { ok: true });
}

async function confirm(body) {
  if (!isToken(body?.token)) return json(400, { error: 'invalid' });

  const { data: row, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, status, confirm_sent_at')
    .eq('confirm_token_hash', hash(body.token))
    .maybeSingle();
  if (error) throw error;
  if (!row || row.status !== 'pending') return json(400, { error: 'invalid' });
  if (!row.confirm_sent_at || Date.now() - new Date(row.confirm_sent_at).getTime() > CONFIRM_VALID_MS) {
    return json(400, { error: 'expired' });
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'confirmed', confirmed_at: now, confirm_token_hash: null, updated_at: now })
    .eq('id', row.id);
  if (updateError) throw updateError;

  if (LIST_ID) {
    try {
      await brevo('/contacts', { email: row.email, listIds: [LIST_ID], updateEnabled: true });
    } catch (err) {
      // The subscription is recorded; the list can be re-synced from the admin export.
      console.error('[newsletter] Brevo list add failed:', err.message);
    }
  }

  return json(200, { ok: true });
}

async function unsubscribe(body) {
  if (!isToken(body?.token)) return json(400, { error: 'invalid' });

  const { data: row, error } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, status')
    .eq('unsubscribe_token_hash', hash(body.token))
    .maybeSingle();
  if (error) throw error;
  if (!row) return json(400, { error: 'invalid' });
  if (row.status === 'unsubscribed') return json(200, { ok: true });

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: now, confirm_token_hash: null, updated_at: now })
    .eq('id', row.id);
  if (updateError) throw updateError;

  if (LIST_ID) {
    try {
      await brevo(`/contacts/lists/${LIST_ID}/contacts/remove`, { emails: [row.email] });
    } catch (err) {
      console.error('[newsletter] Brevo list remove failed:', err.message);
    }
  }

  return json(200, { ok: true });
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid request' });
  }

  const { pathname } = new URL(req.url);
  try {
    if (pathname.endsWith('/confirm')) return await confirm(body);
    if (pathname.endsWith('/unsubscribe')) return await unsubscribe(body);
    return await subscribe(body);
  } catch (err) {
    console.error('[newsletter] failed:', err.message);
    return json(502, { error: "Sorry, something went wrong. Please try again in a moment." });
  }
};

export const config = {
  path: ['/api/newsletter', '/api/newsletter/confirm', '/api/newsletter/unsubscribe'],
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
