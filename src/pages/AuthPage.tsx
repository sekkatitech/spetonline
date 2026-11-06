import React, { useEffect, useState } from 'react';
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
  // The address waiting for its confirmation email, so it can be sent again.
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const { user, loading: authLoading, signIn, signUp, resendConfirmation } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to go after login: /account by default. Only paths on this site are accepted, so a
  // crafted link can't send someone to another website after they sign in.
  const params = new URLSearchParams(location.search);
  const requested = params.get('redirect') || '';
  const redirectTo = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/account';

  // The confirmation link in the email signs the customer in and lands here: carry on.
  useEffect(() => {
    if (!authLoading && user && mode !== 'forgot') navigate(redirectTo, { replace: true });
  }, [authLoading, user, mode, redirectTo, navigate]);

  function changeMode(next: typeof mode) {
    setMode(next);
    setError('');
    setSuccess('');
    setUnconfirmedEmail('');
  }

  async function handleResend() {
    setResending(true);
    setError('');
    const { error } = await resendConfirmation(unconfirmedEmail);
    setResending(false);
    if (error) {
      setError(/rate|seconds|too many/i.test(error.message)
        ? 'Please wait a minute before asking for another email.'
        : 'We could not send the email. Please try again shortly.');
      return;
    }
    setSuccess(`We've sent a new confirmation link to ${unconfirmedEmail}. Check your inbox and spam folder.`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(''); setUnconfirmedEmail(''); setLoading(true);
    const address = email.trim();

    if (mode === 'login') {
      const { error } = await signIn(address, password);
      if (error) {
        if (/not confirmed/i.test(error.message)) {
          setError('Please confirm your email address first. Open the link we emailed you when you signed up.');
          setUnconfirmedEmail(address);
        } else if (/invalid login credentials/i.test(error.message)) {
          setError('Incorrect email or password. Please try again.');
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }
      // Go back to where the user came from (e.g. /checkout)
      navigate(redirectTo);
    } else if (mode === 'register') {
      if (password.length < 8) { setError('Please choose a password of at least 8 characters.'); setLoading(false); return; }
      const { error } = await signUp(address, password, firstName.trim(), lastName.trim());
      if (error) { setError(error.message); setLoading(false); return; }

      // Trigger Welcome Email
      supabase.functions.invoke('send-mailtrap', {
        body: { type: 'welcome', payload: { email, first_name: firstName } }
      }).catch(err => console.error("Failed to trigger welcome email:", err));

      // No email confirmation pending means the customer is already signed in.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { navigate(redirectTo); return; }

      // Same message whether or not the address already had an account, so the form can't be
      // used to find out who is registered.
      setSuccess(`Almost done: we've emailed a confirmation link to ${address}. Open it to activate your account. It may take a few minutes, and can land in spam.`);
      setUnconfirmedEmail(address);
      setPassword('');
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
            {unconfirmedEmail && mode === 'login' && (
              <Button type="button" variant="ghost" className="mt-2 w-full" loading={resending} onClick={handleResend}>
                Send the confirmation email again
              </Button>
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
                    minLength={mode === 'register' ? 8 : undefined}
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
