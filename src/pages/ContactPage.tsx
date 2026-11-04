import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { useSEO } from '../lib/useSEO';
import { Button, PageShell, TextField, TextareaField, panelStyles } from '../components/ui';

export function ContactPage() {
  useSEO({ title: 'Contact Us', description: 'Contact SPET Online for sales, support and enquiries.' });

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '', company: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  };

  return (
    <PageShell
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      title="Contact"
      description="Reach out to us for support, enquiries or feedback."
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <ul className={`${panelStyles} divide-y divide-spet-line-2`}>
          <li className="flex gap-3 p-5">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-spet-blue" aria-hidden="true" />
            <div className="text-[13px] leading-relaxed text-spet-ink-2">
              <h2 className="font-display text-[16px] font-semibold text-spet-ink">Call us</h2>
              <p>Monday to Friday, 08:00–17:00.</p>
              <p className="mt-1">Sales: <a href="tel:0870881483" className="font-semibold text-spet-link hover:underline">0870 881 483</a></p>
              <p>Support: <a href="tel:+27743507142" className="font-semibold text-spet-link hover:underline">+27 74 350 7142</a></p>
            </div>
          </li>
          <li className="flex gap-3 p-5">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-spet-blue" aria-hidden="true" />
            <div className="text-[13px] leading-relaxed text-spet-ink-2">
              <h2 className="font-display text-[16px] font-semibold text-spet-ink">Email us</h2>
              <a href="mailto:sales@spetonline.co.za" className="font-semibold text-spet-link hover:underline">sales@spetonline.co.za</a>
            </div>
          </li>
          <li className="flex gap-3 p-5">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-spet-blue" aria-hidden="true" />
            <div className="text-[13px] leading-relaxed text-spet-ink-2">
              <h2 className="font-display text-[16px] font-semibold text-spet-ink">Where we are</h2>
              <p>Pretoria, Gauteng. Delivered nationwide.</p>
            </div>
          </li>
        </ul>

        <div className={`${panelStyles} p-5 md:p-8 lg:col-span-2`}>
          {status === 'sent' ? (
            <div role="status" className="flex flex-col items-center gap-3 py-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-spet-stock" aria-hidden="true" />
              <h2 className="font-display text-[24px] font-semibold text-spet-ink">Thanks, {form.firstName}!</h2>
              <p className="text-[14px] text-spet-ink-2">We've received your message and will reply to {form.email} within one business day.</p>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {/* Honeypot for bots; hidden from people */}
              <input type="text" name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={set('company')} className="hidden" aria-hidden="true" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField id="contact-first" label="First name" required autoComplete="given-name" value={form.firstName} onChange={set('firstName')} />
                <TextField id="contact-last" label="Last name" autoComplete="family-name" value={form.lastName} onChange={set('lastName')} />
              </div>
              <TextField id="contact-email" label="Email address" type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
              <TextareaField id="contact-message" label="Message" rows={5} required maxLength={5000} className="resize-none" value={form.message} onChange={set('message')} />

              {status === 'error' && <p role="alert" className="text-[13px] text-red-600 dark:text-red-400">{error}</p>}

              <Button type="submit" size="lg" className="self-start" loading={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}
