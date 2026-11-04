import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function NewsletterBand() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: email.trim().toLowerCase(), source: 'homepage' });

    if (error) {
      if (error.code === '23505') {
        setStatus('success');
        setMessage("You're already subscribed — thanks for being with us.");
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
      return;
    }

    setStatus('success');
    setMessage("You're subscribed. Watch your inbox for new arrivals and price drops.");
    setEmail('');
  }

  return (
    <section
      aria-labelledby="newsletter-title"
      className="mt-10 rounded-2xl border border-spet-tint-line bg-spet-tint px-5 py-6 md:px-8 md:py-7"
    >
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 id="newsletter-title" className="font-display text-[24px] font-semibold tracking-tight text-spet-ink">
            Deals by email
          </h2>
          <p className="mt-1.5 text-[14px] text-spet-ink-2">New arrivals and price drops.</p>
        </div>

        {status === 'success' ? (
          <p
            role="status"
            className="flex items-center gap-2.5 rounded-lg border border-spet-stock/30 bg-spet-surface px-4 py-3 text-[13px] font-medium text-spet-stock md:max-w-[420px]"
          >
            <CheckCircle2 className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full gap-2 md:max-w-[420px]">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              autoComplete="email"
              className="h-11 min-w-0 flex-1 rounded-lg border border-spet-line bg-spet-surface px-4 text-sm text-spet-ink placeholder:text-spet-was focus:border-spet-blue focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="h-11 shrink-0 rounded-lg bg-spet-blue px-5 text-sm font-semibold text-white transition-colors hover:bg-spet-blue-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}
      </div>

      {status === 'error' && (
        <p role="alert" className="mt-3 text-[13px] text-red-600 dark:text-red-400">
          {message}
        </p>
      )}
    </section>
  );
}
