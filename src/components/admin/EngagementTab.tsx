// Admin: website feedback (New → Reviewing → Resolved) and newsletter subscribers.
// Reads Supabase `site_feedback` and `newsletter_subscribers`
// (docs/database/2026-11-06-feedback-and-newsletter.sql); only admins can read them.
import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Download, Mail, MessageSquarePlus, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { FEEDBACK_EASE, FEEDBACK_REASONS, FEEDBACK_TOPICS } from '../../lib/engagement';

type FeedbackStatus = 'new' | 'reviewing' | 'resolved';

interface FeedbackRow {
  id: string;
  created_at: string;
  reason: string | null;
  ease: number | null;
  topic: string;
  message: string;
  email: string | null;
  page_path: string | null;
  device: string | null;
  source: string;
  status: FeedbackStatus;
  admin_note: string | null;
}

interface SubscriberRow {
  id: string;
  email: string;
  status: 'pending' | 'confirmed' | 'unsubscribed' | 'legacy';
  consent_source: string;
  consent_page: string | null;
  consent_text: string;
  consented_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
}

const STATUSES: { value: FeedbackStatus; label: string; style: string }[] = [
  { value: 'new', label: 'New', style: 'bg-accent-orange/15 text-accent-orange border-accent-orange/40' },
  { value: 'reviewing', label: 'Reviewing', style: 'bg-lago-500/15 text-lago-300 border-lago-500/40' },
  { value: 'resolved', label: 'Resolved', style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' },
];

const label = (list: readonly { value: string | number; label: string }[], value: unknown) =>
  list.find((item) => item.value === value)?.label ?? '—';
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const SOURCE_LABEL: Record<string, string> = {
  footer_band: 'Footer section',
  side_panel: 'Side button',
  tester_page: 'Tester page',
  homepage_legacy: 'Old homepage form',
  widget: 'Side button',
};

export function EngagementTab() {
  const [view, setView] = useState<'feedback' | 'newsletter'>('feedback');

  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-white mb-2">Feedback &amp; Newsletter</h1>
      <p className="text-lago-200 mb-6 max-w-2xl">
        What visitors tell you through the “Share feedback” button and the tester page, and who has signed up for
        the newsletter. Both stay private to admins.
      </p>
      <div className="mb-6 inline-flex rounded-xl border border-lago-800 bg-lago-900 p-1">
        {(['feedback', 'newsletter'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              view === v ? 'bg-lago-700 text-white' : 'text-lago-300 hover:text-white'
            }`}
          >
            {v === 'feedback' ? <MessageSquarePlus className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            {v === 'feedback' ? 'Feedback' : 'Newsletter'}
          </button>
        ))}
      </div>
      {view === 'feedback' ? <FeedbackView /> : <NewsletterView />}
    </div>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {text}
    </div>
  );
}

function Stat({ label: title, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-lago-800 bg-lago-900 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-lago-400">{title}</p>
      <p className="mt-1 text-3xl font-display font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-lago-400">{hint}</p>}
    </div>
  );
}

// ── Feedback ────────────────────────────────────────────────────────────────

function FeedbackView() {
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FeedbackStatus | 'all'>('new');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_feedback')
      .select('id, created_at, reason, ease, topic, message, email, page_path, device, source, status, admin_note')
      .order('created_at', { ascending: false })
      .limit(500);
    setError(error ? `Couldn't load feedback (${error.message}). Has docs/database/2026-11-06-feedback-and-newsletter.sql been run?` : null);
    setRows((data as FeedbackRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: Partial<Pick<FeedbackRow, 'status' | 'admin_note'>>) => {
    const { error } = await supabase.from('site_feedback').update(patch).eq('id', id);
    if (error) setError(`Couldn't save: ${error.message}`);
    else setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const counts = useMemo(() => {
    const byStatus = { new: 0, reviewing: 0, resolved: 0 } as Record<FeedbackStatus, number>;
    const byTopic: Record<string, number> = {};
    const problemPages: Record<string, number> = {};
    let easeTotal = 0;
    let easeCount = 0;
    for (const r of rows) {
      byStatus[r.status] += 1;
      byTopic[r.topic] = (byTopic[r.topic] ?? 0) + 1;
      if (r.topic === 'technical_problem' && r.page_path) problemPages[r.page_path] = (problemPages[r.page_path] ?? 0) + 1;
      if (r.ease) { easeTotal += r.ease; easeCount += 1; }
    }
    const repeatedPages = Object.entries(problemPages).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { byStatus, byTopic, repeatedPages, easeAverage: easeCount ? easeTotal / easeCount : null };
  }, [rows]);

  const productRequests = rows.filter((r) => r.topic === 'product_request' && r.status !== 'resolved').slice(0, 8);
  const shown = filter === 'all' ? rows : rows.filter((r) => r.status === filter);

  return (
    <div>
      {error && <ErrorBox text={error} />}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="New" value={counts.byStatus.new} />
        <Stat label="Reviewing" value={counts.byStatus.reviewing} />
        <Stat label="Resolved" value={counts.byStatus.resolved} />
        <div className="rounded-2xl border border-lago-800 bg-lago-900 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-lago-400">Ease of use</p>
          <p className="mt-1 text-3xl font-display font-bold text-white">
            {counts.easeAverage ? label(FEEDBACK_EASE, Math.round(counts.easeAverage)) : '—'}
          </p>
          <p className="mt-1 text-xs text-lago-400">Average answer</p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-lago-800 bg-lago-900 p-5">
          <h3 className="text-sm font-bold text-white mb-3">By topic</h3>
          <ul className="space-y-1.5 text-sm text-lago-200">
            {FEEDBACK_TOPICS.map((t) => (
              <li key={t.value} className="flex justify-between"><span>{t.label}</span><span className="font-semibold text-white">{counts.byTopic[t.value] ?? 0}</span></li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-lago-800 bg-lago-900 p-5">
          <h3 className="text-sm font-bold text-white mb-3">Pages with repeated problems</h3>
          {counts.repeatedPages.length === 0 ? (
            <p className="text-sm text-lago-400">No page has more than one technical problem reported.</p>
          ) : (
            <ul className="space-y-1.5 text-sm text-lago-200">
              {counts.repeatedPages.map(([page, n]) => (
                <li key={page} className="flex justify-between gap-3"><span className="truncate">{page}</span><span className="font-semibold text-accent-orange">{n}</span></li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-lago-800 bg-lago-900 p-5">
          <h3 className="text-sm font-bold text-white mb-3">Open product requests</h3>
          {productRequests.length === 0 ? (
            <p className="text-sm text-lago-400">None open.</p>
          ) : (
            <ul className="space-y-2 text-sm text-lago-200">
              {productRequests.map((r) => <li key={r.id} className="line-clamp-2">{r.message}</li>)}
            </ul>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['new', 'reviewing', 'resolved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                filter === f ? 'border-lago-500 bg-lago-800 text-white' : 'border-lago-800 text-lago-300 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : label(STATUSES, f)} {f !== 'all' && <span className="text-lago-400">({counts.byStatus[f]})</span>}
            </button>
          ))}
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-lago-300 hover:text-white">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {!loading && shown.length === 0 && <p className="rounded-2xl border border-lago-800 bg-lago-900 p-6 text-sm text-lago-300">Nothing here.</p>}

      <div className="space-y-4">
        {shown.map((r) => <FeedbackCard key={r.id} row={r} onUpdate={update} />)}
      </div>
    </div>
  );
}

function FeedbackCard({ row, onUpdate }: { row: FeedbackRow; onUpdate: (id: string, patch: Partial<FeedbackRow>) => void }) {
  const [note, setNote] = useState(row.admin_note ?? '');
  const status = STATUSES.find((s) => s.value === row.status)!;

  return (
    <article className="rounded-2xl border border-lago-800 bg-lago-900 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full border px-2.5 py-0.5 font-semibold ${status.style}`}>{status.label}</span>
          <span className="rounded-full bg-lago-800 px-2.5 py-0.5 font-semibold text-white">{label(FEEDBACK_TOPICS, row.topic)}</span>
          {row.source === 'tester_page' && <span className="rounded-full bg-accent-cyan/10 px-2.5 py-0.5 font-semibold text-accent-cyan">Tester page</span>}
          <span className="text-lago-400">{when(row.created_at)}</span>
        </div>
        <select
          value={row.status}
          onChange={(e) => onUpdate(row.id, { status: e.target.value as FeedbackStatus })}
          aria-label="Status"
          className="rounded-lg border border-lago-700 bg-lago-800 px-2.5 py-1.5 text-sm text-white"
        >
          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-white">{row.message}</p>

      <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-lago-300 md:grid-cols-4">
        <div><dt className="text-lago-500">Came to</dt><dd>{label(FEEDBACK_REASONS, row.reason)}</dd></div>
        <div><dt className="text-lago-500">Ease</dt><dd>{label(FEEDBACK_EASE, row.ease)}</dd></div>
        <div><dt className="text-lago-500">Page</dt><dd className="truncate">{row.page_path ?? '—'} {row.device && <span className="text-lago-500">({row.device})</span>}</dd></div>
        <div>
          <dt className="text-lago-500">Reply to</dt>
          <dd className="truncate">{row.email ? <a href={`mailto:${row.email}`} className="text-lago-300 underline hover:text-white">{row.email}</a> : 'No email given'}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={2000}
          placeholder="Private note, e.g. what was done"
          aria-label="Admin note"
          className="flex-1 rounded-lg border border-lago-700 bg-lago-800 px-3 py-2 text-sm text-white placeholder:text-lago-500"
        />
        <button
          onClick={() => onUpdate(row.id, { admin_note: note.trim() || null })}
          disabled={(row.admin_note ?? '') === note.trim()}
          className="rounded-lg bg-lago-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lago-500 disabled:opacity-40"
        >
          Save note
        </button>
      </div>
    </article>
  );
}

// ── Newsletter ──────────────────────────────────────────────────────────────

function NewsletterView() {
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, status, consent_source, consent_page, consent_text, consented_at, confirmed_at, unsubscribed_at')
      .order('consented_at', { ascending: false })
      .limit(5000);
    setError(error ? `Couldn't load subscribers (${error.message}). Has docs/database/2026-11-06-feedback-and-newsletter.sql been run?` : null);
    setRows((data as SubscriberRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const confirmed = rows.filter((r) => r.status === 'confirmed');
  const pending = rows.filter((r) => r.status === 'pending');
  const unsubscribed = rows.filter((r) => r.status === 'unsubscribed');
  const legacy = rows.filter((r) => r.status === 'legacy');
  const confirmedThisMonth = confirmed.filter((r) => r.confirmed_at && new Date(r.confirmed_at).getTime() >= monthStart).length;
  const unsubscribedThisMonth = unsubscribed.filter((r) => r.unsubscribed_at && new Date(r.unsubscribed_at).getTime() >= monthStart).length;

  // Confirmed addresses with their consent record, e.g. to import into a mailing tool.
  const exportCsv = () => {
    const quote = (v: string | null) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [
      ['email', 'confirmed_at', 'consented_at', 'consent_source', 'consent_page', 'consent_text'].join(','),
      ...confirmed.map((r) =>
        [r.email, r.confirmed_at, r.consented_at, r.consent_source, r.consent_page, r.consent_text].map(quote).join(','),
      ),
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `spet-newsletter-confirmed-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusStyle = { confirmed: 'text-emerald-300', pending: 'text-accent-orange', unsubscribed: 'text-lago-400', legacy: 'text-lago-500' };

  return (
    <div>
      {error && <ErrorBox text={error} />}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Confirmed" value={confirmed.length} hint={`${confirmedThisMonth} this month`} />
        <Stat label="Awaiting confirmation" value={pending.length} hint="Not subscribed until confirmed" />
        <Stat label="Unsubscribed" value={unsubscribed.length} hint={`${unsubscribedThisMonth} this month`} />
        <Stat label="Old form, not confirmed" value={legacy.length} hint="Signed up before consent was asked. Not mailed." />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={exportCsv}
          disabled={confirmed.length === 0}
          className="flex items-center gap-2 rounded-lg bg-lago-600 px-4 py-2 text-sm font-semibold text-white hover:bg-lago-500 disabled:opacity-40"
        >
          <Download className="w-4 h-4" /> Export confirmed (CSV)
        </button>
        <button onClick={load} className="flex items-center gap-2 text-sm text-lago-300 hover:text-white">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-lago-800 bg-lago-900">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-lago-400">
            <tr className="border-b border-lago-800">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Signed up</th>
              <th className="px-4 py-3">Confirmed</th>
              <th className="px-4 py-3">Where</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-lago-300">No sign-ups yet.</td></tr>
            )}
            {rows.slice(0, 300).map((r) => (
              <tr key={r.id} className="border-b border-lago-800/60 last:border-0">
                <td className="px-4 py-2.5 text-white">{r.email}</td>
                <td className={`px-4 py-2.5 font-semibold capitalize ${statusStyle[r.status]}`}>{r.status}</td>
                <td className="px-4 py-2.5 text-lago-300">{when(r.consented_at)}</td>
                <td className="px-4 py-2.5 text-lago-300">{r.status === 'unsubscribed' ? `Left ${when(r.unsubscribed_at)}` : when(r.confirmed_at)}</td>
                <td className="px-4 py-2.5 text-lago-300">{SOURCE_LABEL[r.consent_source] ?? r.consent_source}{r.consent_page ? ` · ${r.consent_page}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 300 && <p className="mt-2 text-xs text-lago-400">Showing the latest 300. The export includes every confirmed address.</p>}
    </div>
  );
}
