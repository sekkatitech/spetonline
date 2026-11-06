// netlify/functions/security-lib.js
// Shared helpers for the server functions. Not an endpoint: it has no handler, the same as
// zoho-lib.js.

const crypto = require('crypto');

/** Escapes text before it goes into an HTML email or page. */
const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Compares two strings in constant time, so the comparison can't be timed. */
function safeEqual(a, b) {
  const left = Buffer.from(String(a ?? ''));
  const right = Buffer.from(String(b ?? ''));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

// One function calling another (payfast-itn -> send-order-email) proves it is the server
// with an HMAC keyed by the service role key, which only the functions hold. A visitor can't
// produce it, so the endpoint can't be used to send emails from the browser.
const internalToken = (purpose, id) =>
  crypto
    .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY || '')
    .update(`${purpose}:${id}`)
    .digest('hex');

const verifyInternalToken = (purpose, id, token) =>
  Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) && Boolean(token) && safeEqual(internalToken(purpose, id), token);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value);

// Order numbers look like SPT-BC22205; older ones may be ids. Letters, digits and dashes only.
const isOrderId = (value) => typeof value === 'string' && /^[A-Za-z0-9-]{3,64}$/.test(value);

/** Trims a text field and caps its length; anything that isn't text becomes ''. */
const cleanText = (value, max = 200) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;
const isEmail = (value) => typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value);

/**
 * Runs an older `exports.handler` function as a current Netlify function, which is what
 * lets it use `config.rateLimit` (see create-enterprise-account.mjs).
 */
const legacyToV2 = (handler) => async (req, context) => {
  const url = new URL(req.url);
  const event = {
    httpMethod: req.method,
    path: url.pathname,
    headers: Object.fromEntries(req.headers),
    queryStringParameters: Object.fromEntries(url.searchParams),
    body: req.method === 'GET' || req.method === 'HEAD' ? null : await req.text(),
  };
  const result = await handler(event, context);
  return new Response(result.body ?? '', { status: result.statusCode, headers: result.headers });
};

module.exports = { escapeHtml, safeEqual, internalToken, verifyInternalToken, isUuid, isOrderId, cleanText, isEmail, legacyToV2 };
