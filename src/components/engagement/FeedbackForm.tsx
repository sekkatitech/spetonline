import { useRef, useState, type FormEvent } from 'react';
import { Check, ChevronDown, MapPin } from 'lucide-react';
import {
  FEEDBACK_EASE,
  FEEDBACK_REASONS,
  FEEDBACK_TOPICS,
  sendFeedback,
  type FeedbackReason,
  type FeedbackTopic,
} from '../../lib/engagement';

// Recessed field look shared by the feedback and newsletter forms.
export const WELL =
  'rounded-xl bg-spet-canvas shadow-[inset_0_-1px_0_rgba(16,24,32,0.10),inset_0_1px_2px_rgba(16,24,32,0.06)] focus-within:shadow-[inset_0_-2px_0_var(--color-spet-blue),inset_0_1px_2px_rgba(16,24,32,0.06)]';
export const FIELD_LABEL = 'mb-2 block text-[13px] font-semibold text-spet-ink-2';
export const PRIMARY_BUTTON =
  'inline-flex h-11 items-center justify-center rounded-xl bg-spet-blue px-5 text-[14px] font-semibold text-white transition-colors hover:bg-spet-blue-dark disabled:cursor-wait disabled:opacity-70';

interface FeedbackFormProps {
  idPrefix: string;
  source: 'widget' | 'tester_page';
  defaultReason?: FeedbackReason;
  onDone?: () => void;
}

export function FeedbackForm({ idPrefix, source, defaultReason, onDone }: FeedbackFormProps) {
  const openedAt = useRef(Date.now());
  const [reason, setReason] = useState<FeedbackReason | null>(defaultReason ?? null);
  const [ease, setEase] = useState<number | null>(null);
  const [topic, setTopic] = useState<FeedbackTopic | ''>('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!topic) return setError('Please choose what you would like to tell us.');
    if (message.trim().length < 3) return setError('Please write a short message.');

    setError(null);
    setStatus('sending');
    const result = await sendFeedback({
      reason,
      ease,
      topic,
      message: message.trim(),
      email: email.trim(),
      source,
      website,
      openedAt: openedAt.current,
    });
    if (result.ok) {
      setStatus('sent');
    } else {
      setStatus('idle');
      setError(result.error);
    }
  }

  if (status === 'sent') {
    return (
      <div className="py-4 text-center" role="status">
        <span className="mx-auto grid h-14 w-14 place-content-center rounded-full bg-spet-tint text-spet-blue motion-safe:animate-[engagement-pop_.35s_cubic-bezier(.34,1.56,.64,1)_both]">
          <Check className="h-6 w-6" strokeWidth={2.25} aria-hidden="true" />
        </span>
        <p className="mt-4 font-display text-[20px] font-semibold text-spet-ink">Thank you</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-spet-ink-2">Your feedback has been sent to the SPET Online team.</p>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="mt-5 h-10 rounded-xl border border-spet-line px-4 text-[13.5px] font-medium text-spet-ink transition-colors hover:bg-spet-canvas"
          >
            Close
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Honeypot: hidden from people and screen readers; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${idPrefix}-website`}>Website</label>
        <input id={`${idPrefix}-website`} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <fieldset>
        <legend className={FIELD_LABEL}>What brought you here?</legend>
        <div className="flex flex-wrap gap-1.5">
          {FEEDBACK_REASONS.map((option) => {
            const selected = reason === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setReason(selected ? null : option.value)}
                className={`h-9 rounded-xl border px-3 text-[13px] transition-colors ${
                  selected
                    ? 'border-spet-ink bg-spet-ink text-spet-surface'
                    : 'border-spet-line text-spet-ink-2 hover:border-spet-ink'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={FIELD_LABEL}>How easy was the website to use?</legend>
        <div className={`${WELL} grid grid-cols-5 gap-1 p-1`}>
          {FEEDBACK_EASE.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name={`${idPrefix}-ease`}
                value={option.value}
                checked={ease === option.value}
                onChange={() => setEase(option.value)}
                className="peer sr-only"
              />
              <span className="block rounded-lg py-2 text-center text-[11.5px] leading-tight text-spet-ink-2 transition-colors hover:bg-spet-surface peer-checked:bg-spet-blue peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-spet-blue">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${idPrefix}-topic`} className={FIELD_LABEL}>
          What would you like to tell us?
        </label>
        <div className={`${WELL} relative`}>
          <select
            id={`${idPrefix}-topic`}
            value={topic}
            onChange={(e) => setTopic(e.target.value as FeedbackTopic)}
            className="h-11 w-full cursor-pointer appearance-none bg-transparent px-3.5 pr-10 text-[14px] text-spet-ink outline-none"
          >
            <option value="" disabled>
              Choose one
            </option>
            {FEEDBACK_TOPICS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-spet-muted" aria-hidden="true" />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-message`} className={FIELD_LABEL}>
          Your feedback
        </label>
        <div className={WELL}>
          <textarea
            id={`${idPrefix}-message`}
            rows={3}
            maxLength={2000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what happened or what you'd like to see"
            className="block w-full resize-none bg-transparent px-3.5 py-3 text-[14px] text-spet-ink outline-none placeholder:text-spet-was"
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-email`} className={FIELD_LABEL}>
          Email address <span className="font-normal text-spet-muted">(optional)</span>
        </label>
        <div className={WELL}>
          <input
            id={`${idPrefix}-email`}
            type="email"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.co.za"
            aria-describedby={`${idPrefix}-email-hint`}
            className="block h-11 w-full bg-transparent px-3.5 text-[14px] text-spet-ink outline-none placeholder:text-spet-was"
          />
        </div>
        <p id={`${idPrefix}-email-hint`} className="mt-1.5 text-[12.5px] text-spet-muted">
          Only if you would like a reply.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-[13px] font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <p className="flex max-w-[200px] items-start gap-1.5 text-[12px] leading-snug text-spet-muted">
          <MapPin className="mt-px h-3.5 w-3.5 flex-none" aria-hidden="true" />
          We'll note the page you're on so we can find the problem.
        </p>
        <button type="submit" disabled={status === 'sending'} className={PRIMARY_BUTTON}>
          {status === 'sending' ? 'Sending…' : 'Send feedback'}
        </button>
      </div>
    </form>
  );
}
