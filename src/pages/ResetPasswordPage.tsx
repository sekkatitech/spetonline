import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-lago-800 border border-gray-200 dark:border-lago-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-lago-500 transition-colors';

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
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-32 md:pt-36 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="relative h-28 bg-gradient-to-r from-lago-800 to-lago-600 flex items-center justify-center">
            <img src="/logo-main.png" alt="SPET Online" className="h-12 w-auto object-contain brightness-0 invert" />
          </div>

          <div className="p-8">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1">Set a New Password</h1>
            <p className="text-sm text-gray-500 dark:text-lago-400 text-center mb-6">Choose a new password for your account.</p>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 font-medium">
                {error}
              </div>
            )}

            {success ? (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-600 dark:text-green-400 font-medium text-center">
                Password updated! Taking you to your account...
              </div>
            ) : !ready ? (
              <div className="text-center text-sm text-gray-500 dark:text-lago-400 py-6">
                Verifying your reset link...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass + ' pl-9 pr-10'} placeholder="••••••••" autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-lago-200 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPw ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className={inputClass + ' pl-9'} placeholder="••••••••" autoComplete="new-password" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-lago-600 hover:bg-lago-700 text-white font-bold transition-colors disabled:opacity-60 shadow-lg shadow-lago-600/20 mt-2"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}