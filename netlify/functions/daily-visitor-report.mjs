// netlify/functions/daily-visitor-report.mjs
// Scheduled daily (netlify.toml, 04:00 UTC = 06:00 SAST). Totals yesterday's
// storefront visits from `site_visits` (written by track-visit.mjs), compares
// them with the day before, asks Claude for a short plain-English summary with
// suggestions, and emails it via Brevo to AI_REPORT_EMAIL (or SENDER_EMAIL).
//
// Switched on/off from /admin → AI Features (ai_features.key = 'daily_visitor_report').

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Netlify.env.get('SUPABASE_URL'),
  Netlify.env.get('SUPABASE_SERVICE_ROLE_KEY'),
);
const anthropic = new Anthropic({ apiKey: Netlify.env.get('ANTHROPIC_API_KEY') });

const MODEL = 'claude-opus-5-5';
const SENDER_EMAIL = Netlify.env.get('SENDER_EMAIL') || 'sales@spetonline.co.za';
const SENDER_NAME = Netlify.env.get('SENDER_NAME') || 'SPET Online';
const REPORT_TO = Netlify.env.get('AI_REPORT_EMAIL') || SENDER_EMAIL;
const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;
const PAGE = 1000;

// Start of a SAST calendar day `daysAgo` days back, as a UTC Date.
function sastDayStart(daysAgo) {
  const nowSast = new Date(Date.now() + SAST_OFFSET_MS);
  const midnight = Date.UTC(nowSast.getUTCFullYear(), nowSast.getUTCMonth(), nowSast.getUTCDate() - daysAgo);
  return new Date(midnight - SAST_OFFSET_MS);
}

async function fetchVisits(from, to) {
  const rows = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase
      .from('site_visits')
      .select('visitor_id, session_id, path, source, device, city, country')
      .gte('created_at', from.toISOString())
      .lt('created_at', to.toISOString())
      .range(offset, offset + PAGE - 1);
    if (error) throw new Error(`site_visits query failed: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}

function top(rows, key, n) {
  const counts = {};
  for (const r of rows) {
    const k = typeof key === 'function' ? key(r) : r[key];
    if (k) counts[k] = (counts[k] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function summarise(rows) {
  return {
    page_views: rows.length,
    unique_visitors: new Set(rows.map(r => r.visitor_id)).size,
    sessions: new Set(rows.map(r => r.session_id)).size,
    by_source: Object.fromEntries(top(rows, 'source', 10)),
    by_device: Object.fromEntries(top(rows, 'device', 5)),
    top_pages: top(rows, 'path', 10),
    top_locations: top(rows, r => r.city && `${r.city}, ${r.country ?? ''}`.replace(/, $/, ''), 8),
  };
}

async function writeSummary(dateLabel, yesterday, dayBefore) {
  const response = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages: [{
      role: 'user',
      content: `You write a short daily website report for the owner of SPET Online, a South African online electronics store.

Here are the storefront visitor statistics for ${dateLabel} ("yesterday") and the day before, as JSON. Product pages are paths starting /product/ or /shop/*/product/.

<yesterday>${JSON.stringify(yesterday)}</yesterday>
<day_before>${JSON.stringify(dayBefore)}</day_before>

Write: one sentence on overall traffic with the change versus the day before; 3-4 short bullet points on what stood out (sources, devices, popular pages or products, locations); and 1-2 practical suggestions the owner could act on today. Use only these numbers and do not invent causes. Plain text only: bullets start with "- ", no markdown headings or bold. Under 180 words.`,
    }],
  });
  if (response.stop_reason === 'refusal') return null;
  return response.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function renderEmail(dateLabel, stats, summary) {
  const lines = (summary || 'The AI summary was unavailable today. The figures are below.').split('\n').filter(Boolean);
  const bullets = lines.filter(l => l.startsWith('- ')).map(l => `<li>${esc(l.slice(2))}</li>`).join('');
  const paras = lines.filter(l => !l.startsWith('- ')).map(l => `<p>${esc(l)}</p>`).join('');
  const pages = stats.top_pages.map(([p, n]) => `<tr><td>${esc(p)}</td><td align="right">${n}</td></tr>`).join('');
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#1a1a1a;max-width:600px">
<h2 style="color:#057dcd">Daily visitor report: ${esc(dateLabel)}</h2>
<p><b>${stats.page_views}</b> page views · <b>${stats.unique_visitors}</b> visitors · <b>${stats.sessions}</b> sessions</p>
${paras}${bullets ? `<ul>${bullets}</ul>` : ''}
<h3>Top pages</h3><table width="100%" cellpadding="4" style="border-collapse:collapse">${pages}</table>
<p style="color:#888;font-size:12px">Written automatically by Claude from site_visits. Switch off in /admin → AI Features.</p>
</div>`;
}

async function sendEmail(subject, htmlContent) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': Netlify.env.get('BREVO_API_KEY') },
    body: JSON.stringify({ sender: { name: SENDER_NAME, email: SENDER_EMAIL }, to: [{ email: REPORT_TO }], subject, htmlContent }),
  });
  if (!res.ok) throw new Error(`Brevo API error: ${res.status} ${await res.text()}`);
}

async function recordRun(status, result) {
  await supabase
    .from('ai_features')
    .update({ last_run_at: new Date().toISOString(), last_status: status, last_result: result })
    .eq('key', 'daily_visitor_report');
}

export default async () => {
  const { data: feature } = await supabase.from('ai_features').select('enabled').eq('key', 'daily_visitor_report').maybeSingle();
  if (feature?.enabled === false) {
    await recordRun('skipped', { reason: 'switched off' });
    return new Response('skipped');
  }

  try {
    const [yStart, today, dbStart] = [sastDayStart(1), sastDayStart(0), sastDayStart(2)];
    const dateLabel = new Date(yStart.getTime() + SAST_OFFSET_MS).toISOString().slice(0, 10);
    const [yRows, dbRows] = await Promise.all([fetchVisits(yStart, today), fetchVisits(dbStart, yStart)]);
    const yesterday = summarise(yRows);
    const dayBefore = summarise(dbRows);

    let summary = null;
    try {
      summary = await writeSummary(dateLabel, yesterday, dayBefore);
    } catch (err) {
      console.error('[daily-visitor-report] Claude summary failed, sending figures only:', err.message);
    }

    await sendEmail(`SPET Online visitors ${dateLabel}: ${yesterday.page_views} views, ${yesterday.unique_visitors} visitors`,
      renderEmail(dateLabel, yesterday, summary));
    await recordRun('ok', { date: dateLabel, page_views: yesterday.page_views, visitors: yesterday.unique_visitors, sent_to: REPORT_TO, ai_summary: !!summary });
    return new Response('ok');
  } catch (err) {
    console.error('[daily-visitor-report] failed:', err.message);
    await recordRun('error', { error: err.message });
    return new Response('error', { status: 500 });
  }
};
