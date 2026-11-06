import { useRef, useState, type FormEvent } from 'react';
import { Check, MailCheck } from 'lucide-react';
import { LegalModal } from '../LegalModal';
import { NEWSLETTER_CONSENT_TEXT, subscribeNewsletter, type NewsletterSource } from '../../lib/engagement';
import { FIELD_LABEL, PRIMARY_BUTTON, WELL } from './FeedbackForm';

interface NewsletterFormProps {
  idPrefix: string;
  source: NewsletterSource;
  /** 'panel' sits on a white card; 'band' sits on the orange section above the footer. */
  variant: 'panel' | 'band';
}

const CHECKBOX =
  "mt-0.5 h-[18px] w-[18px] flex-none cursor-pointer appearance-none rounded-[5px] border-[1.5px] bg-spet-surface bg-center bg-no-repeat [background-size:12px] checked:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E\")] focus-visible:outline-2 focus-visible:outline-offset-2";

export function NewsletterForm({ idPrefix, source, variant }: NewsletterFormProps) {
  const openedAt = useRef(Date.now());
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<{ field: 'email' | 'consent' | 'form'; text: string } | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const band = variant === 'band';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      return setError({ field: 'email', text: 'Please enter a valid email address.' });
    }
    if (!consent) {
      return setError({ field: 'consent', text: 'Please tick the box to agree before subscribing.' });
    }

    setError(null);
    setStatus('sending');
    const result = await subscribeNewsletter({ email: email.trim(), consent, source, website, openedAt: openedAt.current });
    if (result.ok) {
      setStatus('sent');
    } else {
      setStatus('idle');
      setError({ field: 'form', text: result.error });
    }
  }

  if (status === 'sent') {
    return band ? (
      <div role="status" className="flex items-start gap-3 rounded-xl bg-white/90 p-5 text-[#101820]">
        <span className="grid h-9 w-9 flex-none place-content-center rounded-full bg-[#101820] text-spet-orange">
          <Check className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <p className="text-[15px] leading-snug">
          <strong className="font-semibold">Check your inbox.</strong> We've sent you a link to confirm your subscription.
        </p>
      </div>
    ) : (
      <div role="status" className="py-3 text-center">
        <span className="mx-auto grid h-14 w-14 place-content-center rounded-full bg-spet-tint text-spet-blue motion-safe:animate-[engagement-pop_.35s_cubic-bezier(.34,1.56,.64,1)_both]">
          <MailCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-4 font-display text-[20px] font-semibold text-spet-ink">Check your inbox</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-spet-ink-2">We've sent you a link to confirm your subscription.</p>
      </div>
    );
  }

  const errorText = band ? 'text-[#5c1708]' : 'text-red-600 dark:text-red-400';

  return (
    <>
      <LegalModal docKey={showPrivacy ? 'privacy' : null} onClose={() => setShowPrivacy(false)} />
      <form onSubmit={handleSubmit} noValidate>
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${idPrefix}-website`}>Website</label>
          <input id={`${idPrefix}-website`} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>

        <label htmlFor={`${idPrefix}-email`} className={band ? 'mb-2 block text-[13px] font-medium text-[#101820]' : FIELD_LABEL}>
          Email address
        </label>
        <div className={band ? 'flex flex-col gap-2 sm:flex-row' : ''}>
          <div className={band ? 'flex-1' : WELL}>
            <input
              id={`${idPrefix}-email`}
              type="email"
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.co.za"
              aria-invalid={error?.field === 'email' || undefined}
              aria-describedby={error?.field === 'email' ? `${idPrefix}-error` : undefined}
              className={
                band
                  ? 'h-12 w-full rounded-xl bg-white px-4 text-[15px] text-[#101820] outline-none placeholder:text-[#8a949c] focus:ring-2 focus:ring-[#101820]'
                  : 'block h-11 w-full bg-transparent px-3.5 text-[14px] text-spet-ink outline-none placeholder:text-spet-was'
              }
            />
          </div>
          {band && (
            <button
              type="submit"
              disabled={status === 'sending'}
              className="h-12 rounded-xl bg-[#101820] px-6 text-[15px] font-semibold text-spet-orange transition-colors hover:bg-black disabled:cursor-wait disabled:opacity-80"
            >
              {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
            </button>
          )}
        </div>

        <label className={`mt-4 flex cursor-pointer gap-3 text-[13px] leading-snug ${band ? 'text-[#101820]' : 'text-spet-ink-2'}`}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={error?.field === 'consent' || undefined}
            aria-describedby={error?.field === 'consent' ? `${idPrefix}-error` : undefined}
            className={`${CHECKBOX} ${
              band
                ? 'border-[#101820] checked:border-[#101820] checked:bg-[#101820] focus-visible:outline-[#101820]'
                : 'border-spet-muted checked:border-spet-blue checked:bg-spet-blue focus-visible:outline-spet-blue'
            }`}
          />
          <span>{NEWSLETTER_CONSENT_TEXT}</span>
        </label>

        {error && (
          <p id={`${idPrefix}-error`} role="alert" className={`mt-2 text-[12.5px] font-semibold ${errorText} ${error.field === 'consent' ? 'ml-[30px]' : ''}`}>
            {error.text}
          </p>
        )}

        {!band && (
          <button type="submit" disabled={status === 'sending'} className={`${PRIMARY_BUTTON} mt-5 w-full`}>
            {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
          </button>
        )}

        <p className={`mt-3 text-[12px] ${band ? 'text-[#101820]/80' : 'text-spet-muted'}`}>
          Read our{' '}
          <button
            type="button"
            onClick={() => setShowPrivacy(true)}
            className={`font-medium underline underline-offset-2 ${band ? 'decoration-2 text-[#101820]' : 'decoration-spet-blue decoration-2 text-spet-ink'}`}
          >
            Privacy Notice
          </button>{' '}
          to learn how we use your information.
        </p>
      </form>
    </>
  );
}
