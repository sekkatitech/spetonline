import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSEO } from '../lib/useSEO';
import { Button, PageShell, PasswordField, panelStyles } from '../components/ui';

export function ResetPasswordPage() {
  useSEO({ title: 'Set a new password', description: 'Choose a new password for your SPET Online account.', noindex: true });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  // Supabase puts the user into a temporary "recovery" session when they
  // arrive here from the email link. We just wait for that session to be
  // ready before letting them submit a new password.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // In case the event already fired before this component mounted
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) { setError(error.message); return; }

    setSuccess(true);
    setTimeout(() => navigate('/account'), 2000);
  }

  return (
    <PageShell>
      <div className="flex justify-center py-6">
        <div className={`${panelStyles} w-full max-w-md p-6 md:p-8`}>
          <h1 className="font-display text-[26px] font-semibold tracking-tight text-spet-ink">Set a new password</h1>
          <p className="mt-1 text-[13px] text-spet-ink-2">Choose a new password for your account.</p>

          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-[13px] font-medium text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}

          {success ? (
            <p role="status" className="mt-4 rounded-xl border border-spet-line bg-spet-surface-2 p-3 text-center text-[13px] font-medium text-spet-stock">
              Password updated. Taking you to your account…
            </p>
          ) : !ready ? (
            <p role="status" className="py-6 text-center text-[13px] text-spet-ink-2">Verifying your reset link…</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <PasswordField id="reset-password" label="New password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <PasswordField id="reset-confirm" label="Confirm new password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <Button type="submit" size="lg" className="w-full" loading={loading}>
                {loading ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}
