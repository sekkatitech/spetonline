import { useState } from 'react';
import { Mail, MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { useSEO } from '../lib/useSEO';

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
    <div className="pt-32 pb-24 container mx-auto px-4 md:px-6">
      
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
        <p className="text-gray-600 dark:text-lago-200 text-lg">We're here to help. Reach out to us for support, inquiries, or feedback.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
        <div className="lg:col-span-1 space-y-8">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-full bg-lago-100 dark:bg-lago-800/50 text-lago-600 dark:text-lago-400 flex items-center justify-center mb-2">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Call Us</h3>
            <p className="text-gray-600 dark:text-lago-200 text-sm">Mon-Fri from 8am to 5pm.</p>
            <p className="text-lago-600 dark:text-lago-400 font-semibold">
              Sales: <a href="tel:0870881483" className="hover:underline">0870 881 483</a><br/>
              Support: <a href="tel:+27743507142" className="hover:underline">+27 74 350 7142</a>
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-full bg-lago-100 dark:bg-lago-800/50 text-lago-600 dark:text-lago-400 flex items-center justify-center mb-2">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Email Us</h3>
            <p className="text-gray-600 dark:text-lago-200 text-sm">Our friendly team is here to help.</p>
            <p className="text-lago-600 dark:text-lago-400 font-semibold">
              <a href="mailto:sales@spetonline.co.za" className="hover:underline">sales@spetonline.co.za</a>
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-full bg-lago-100 dark:bg-lago-800/50 text-lago-600 dark:text-lago-400 flex items-center justify-center mb-2">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Visit Us</h3>
            <p className="text-gray-600 dark:text-lago-200 text-sm">Come say hello at our retail store.</p>
            <p className="text-lago-600 dark:text-lago-400 font-semibold">Pretoria, Gauteng<br/>South Africa</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 p-8 md:p-10 rounded-3xl shadow-sm dark:shadow-none">
          {status === 'sent' ? (
            <div className="flex flex-col items-center text-center gap-4 py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thanks, {form.firstName}!</h2>
              <p className="text-gray-600 dark:text-lago-200">We've received your message and will reply to {form.email} within one business day.</p>
            </div>
          ) : (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Honeypot for bots; hidden from people */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" value={form.company} onChange={set('company')} className="hidden" aria-hidden="true" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">First Name</label>
                <input type="text" className="h-12 px-4 rounded-lg bg-gray-50 dark:bg-[#0a141d] border border-gray-300 dark:border-lago-700 text-gray-900 dark:text-white focus:outline-none focus:border-lago-500 shadow-sm dark:shadow-none transition-colors" placeholder="First Name" required value={form.firstName} onChange={set('firstName')} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-900 dark:text-white">Last Name</label>
                <input type="text" className="h-12 px-4 rounded-lg bg-gray-50 dark:bg-[#0a141d] border border-gray-300 dark:border-lago-700 text-gray-900 dark:text-white focus:outline-none focus:border-lago-500 shadow-sm dark:shadow-none transition-colors" placeholder="Last Name" value={form.lastName} onChange={set('lastName')} />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Email Address</label>
              <input type="email" className="h-12 px-4 rounded-lg bg-gray-50 dark:bg-[#0a141d] border border-gray-300 dark:border-lago-700 text-gray-900 dark:text-white focus:outline-none focus:border-lago-500 shadow-sm dark:shadow-none transition-colors" placeholder="your@email.com" required value={form.email} onChange={set('email')} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Message</label>
              <textarea rows={5} className="p-4 rounded-lg bg-gray-50 dark:bg-[#0a141d] border border-gray-300 dark:border-lago-700 text-gray-900 dark:text-white focus:outline-none focus:border-lago-500 resize-none shadow-sm dark:shadow-none transition-colors" placeholder="How can we help you?" required maxLength={5000} value={form.message} onChange={set('message')}></textarea>
            </div>

            {status === 'error' && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button type="submit" disabled={status === 'sending'} className="disabled:opacity-60 h-14 mt-4 px-8 rounded-full bg-lago-600 hover:bg-lago-700 text-white font-bold transition-colors w-full sm:w-auto self-start shadow-[0_4px_14px_rgba(5,125,205,0.3)]">
              {status === 'sending' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
          )}
        </div>
      </div>

    </div>
  );
}
