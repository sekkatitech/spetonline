import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, MailCheck, MailX } from 'lucide-react';
import { PageShell } from '../components/ui/PageShell';
import { ButtonLink } from '../components/ui/Button';
import { confirmNewsletter, unsubscribeNewsletter } from '../lib/engagement';
import { useSEO } from '../lib/useSEO';

const COPY = {
  confirm: {
    title: 'Confirm your subscription',
    intro: 'Press the button to start receiving SPET Online updates on IT products, new arrivals and special offers.',
    button: 'Confirm subscription',
    busy: 'Confirming…',
    doneTitle: 'You’re subscribed',
    doneBody: 'Thank you. You’ll now receive our newsletter. Every email has a link to unsubscribe.',
    icon: MailCheck,
  },
  unsubscribe: {
    title: 'Unsubscribe',
    intro: 'Press the button and we’ll stop sending you SPET Online newsletters and offers.',
    button: 'Unsubscribe',
    busy: 'Unsubscribing…',
    doneTitle: 'You’re unsubscribed',
    doneBody: 'We won’t send you any more newsletters. You can sign up again at any time from the bottom of any page.',
    icon: MailX,
  },
} as const;

/**
 * /newsletter/confirm and /newsletter/unsubscribe, linked from emails. The visitor presses a
 * button: email scanners open links by themselves, and must not act for them.
 */
export function NewsletterPage({ mode }: { mode: 'confirm' | 'unsubscribe' }) {
  const copy = COPY[mode];
  useSEO({ title: copy.title, description: copy.intro, noindex: true });

  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const validToken = /^[a-f0-9]{64}$/.test(token);
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>(validToken ? 'idle' : 'error');
  const [error, setError] = useState(validToken ? '' : 'invalid');

  async function act() {
    setState('busy');
    const result = mode === 'confirm' ? await confirmNewsletter(token) : await unsubscribeNewsletter(token);
    if (result.ok) {
      setState('done');
    } else {
      setState('error');
      setError(result.error);
    }
  }

  const Icon = copy.icon;
  const errorText =
    error === 'expired'
      ? 'This confirmation link has expired. Sign up again at the bottom of any page and we’ll send you a new one.'
      : error === 'invalid'
        ? mode === 'confirm'
          ? 'This link has already been used or isn’t valid. If you’ve confirmed before, you’re already subscribed.'
          : 'This unsubscribe link isn’t valid. Please email sales@spetonline.co.za and we’ll remove you straight away.'
        : error;

  return (
    <PageShell contentClassName="pb-16">
      <div className="mx-auto mt-6 max-w-md rounded-2xl bg-spet-surface p-8 text-center shadow-[0_0_0_1px_rgba(16,24,32,0.14)]">
        <span className="mx-auto grid h-14 w-14 place-content-center rounded-full bg-spet-tint text-spet-blue">
          {state === 'done' ? <Check className="h-6 w-6" strokeWidth={2.25} aria-hidden="true" /> : <Icon className="h-6 w-6" aria-hidden="true" />}
        </span>
        <h1 className="mt-4 font-display text-[24px] font-semibold text-spet-ink">
          {state === 'done' ? copy.doneTitle : copy.title}
        </h1>

        <div aria-live="polite">
          {state === 'done' && <p className="mt-2 text-[14px] leading-relaxed text-spet-ink-2">{copy.doneBody}</p>}
          {state === 'error' && <p className="mt-2 text-[14px] leading-relaxed text-spet-ink-2">{errorText}</p>}
        </div>

        {(state === 'idle' || state === 'busy') && (
          <>
            <p className="mt-2 text-[14px] leading-relaxed text-spet-ink-2">{copy.intro}</p>
            <button
              type="button"
              onClick={act}
              disabled={state === 'busy'}
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-spet-blue px-5 text-[14px] font-semibold text-white transition-colors hover:bg-spet-blue-dark disabled:cursor-wait disabled:opacity-70"
            >
              {state === 'busy' ? copy.busy : copy.button}
            </button>
          </>
        )}

        {(state === 'done' || state === 'error') && (
          <ButtonLink to="/shop" variant="secondary" className="mt-6">
            Continue shopping
          </ButtonLink>
        )}
      </div>
    </PageShell>
  );
}
