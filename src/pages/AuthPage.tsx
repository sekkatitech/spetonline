import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import type { LegalKey } from '../lib/legalContent';
import { supabase } from '../lib/supabase';
import { useSEO } from '../lib/useSEO';
import { LegalModal } from '../components/LegalModal';
import { Button, PageShell, PasswordField, Tabs, TextField, panelStyles } from '../components/ui';

const AUTH_TABS = [
  { id: 'login', label: 'Sign in' },
  { id: 'register', label: 'Create account' },
];

export function AuthPage() {
  useSEO({ title: 'Sign In', description: 'Sign in or create your SPET Online account.', noindex: true });

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [legalDoc, setLegalDoc] = useState<LegalKey | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to go after login — default to /account, but honour ?redirect= param
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect') || '/account';

  function changeMode(next: typeof mode) {
    setMode(next);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) { setError(error.message); setLoading(false); return; }
      // Go back to where the user came from (e.g. /checkout)
      navigate(redirectTo);
    } else if (mode === 'register') {
      const { error } = await signUp(email, password, firstName, lastName);
      if (error) { setError(error.message); setLoading(false); return; }

      // Trigger Welcome Email
      supabase.functions.invoke('send-mailtrap', {
        body: { type: 'welcome', payload: { email, first_name: firstName } }
      }).catch(err => console.error("Failed to trigger welcome email:", err));

      setSuccess('Account created! Please check your email to verify your account, then log in.');
      setMode('login');
    } else if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) { setError(error.message); setLoading(false); return; }
      setSuccess('If that email is registered, a password reset link is on its way. Check your inbox.');
    }
    setLoading(false);
  }

  const submitLabel = mode === 'forgot' ? 'Send reset link' : mode === 'login' ? 'Sign in' : 'Create account';

  return (
    <PageShell>
      <div className="flex justify-center py-6">
        <div className="w-full max-w-md">
          <div className={`${panelStyles} p-6 md:p-8`}>
            <h1 className="font-display text-[26px] font-semibold tracking-tight text-spet-ink">
              {mode === 'forgot' ? 'Reset password' : mode === 'login' ? 'Sign in' : 'Create account'}
            </h1>

            {mode === 'forgot' && <p className="mt-1 text-[13px] text-spet-ink-2">Enter your email and we’ll send you a reset link.</p>}

            {mode !== 'forgot' && redirectTo.includes('checkout') && (
              <p className="mt-3 rounded-xl border border-spet-tint-line bg-spet-tint p-3 text-[13px] font-medium text-spet-link">
                Please sign in or create an account to complete your order.
              </p>
            )}

            {mode !== 'forgot' && (
              <Tabs label="Account access" items={AUTH_TABS} value={mode} onChange={(id) => changeMode(id as typeof mode)} className="mt-4" />
            )}

            {error && (
              <p role="alert" className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-[13px] font-medium text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}
            {success && (
              <p role="status" className="mt-4 rounded-xl border border-spet-line bg-spet-surface-2 p-3 text-[13px] font-medium text-spet-stock">
                {success}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <TextField id="auth-first" label="First name" required autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  <TextField id="auth-last" label="Last name" required autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              )}

              <TextField id="auth-email" label="Email address" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />

              {mode !== 'forgot' && (
                <div>
                  <PasswordField
                    id="auth-password"
                    label="Password"
                    required
                    minLength={6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {mode === 'login' && (
                    <button type="button" onClick={() => changeMode('forgot')} className="min-h-11 text-[13px] font-semibold text-spet-link hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                {loading ? 'Please wait…' : submitLabel}
              </Button>

              {mode === 'forgot' && (
                <Button type="button" variant="ghost" className="w-full" onClick={() => changeMode('login')}>
                  Back to sign in
                </Button>
              )}
            </form>

            {mode !== 'forgot' && (
              <p className="mt-5 text-center text-[12px] leading-relaxed text-spet-muted">
                By continuing you agree to our{' '}
                <button type="button" onClick={() => setLegalDoc('terms')} className="font-semibold text-spet-link underline">Terms &amp; Conditions</button>
                {' '}and{' '}
                <button type="button" onClick={() => setLegalDoc('privacy')} className="font-semibold text-spet-link underline">Privacy Policy</button>.
              </p>
            )}
          </div>

          <p className="mt-4 text-center text-[13px]">
            <Link to="/shop" className="inline-flex min-h-11 items-center text-spet-ink-2 transition-colors hover:text-spet-blue">
              Continue shopping without an account
            </Link>
          </p>
        </div>
      </div>

      <LegalModal docKey={legalDoc} onClose={() => setLegalDoc(null)} />
    </PageShell>
  );
}
