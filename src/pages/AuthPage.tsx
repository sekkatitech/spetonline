import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-lago-800 border border-gray-200 dark:border-lago-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-lago-500 transition-colors';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) { setError(error.message); setLoading(false); return; }
      navigate('/account');
    } else {
      const { error } = await signUp(email, password, firstName, lastName);
      if (error) { setError(error.message); setLoading(false); return; }
      setSuccess('Account created! Please check your email to verify your account, then log in.');
      setMode('login');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-32 md:pt-36 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="relative h-28 bg-gradient-to-r from-lago-800 to-lago-600 flex items-center justify-center">
            <img src="/logo-main.png" alt="SPET Online" className="h-12 w-auto object-contain brightness-0 invert" />
          </div>

          <div className="p-8">
            {/* Tabs */}
            <div className="flex rounded-xl bg-gray-100 dark:bg-lago-800 p-1 mb-8">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                    mode === m ? 'bg-white dark:bg-lago-700 shadow-sm text-lago-600 dark:text-white' : 'text-gray-500 dark:text-lago-400 hover:text-gray-700 dark:hover:text-white'
                  }`}
                >
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-5 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-600 dark:text-green-400 font-medium">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">First Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass + ' pl-9'} placeholder="First" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Last Name</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} placeholder="Last" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass + ' pl-9'} placeholder="you@email.com" autoComplete="email" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass + ' pl-9 pr-10'} placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-lago-200 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-lago-600 hover:bg-lago-700 text-white font-bold transition-colors disabled:opacity-60 shadow-lg shadow-lago-600/20 mt-2"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-500 dark:text-lago-400 mt-6 leading-relaxed">
              By continuing you agree to our{' '}
              <span className="text-lago-600 dark:text-lago-400 font-semibold cursor-pointer hover:underline">Terms & Conditions</span>
              {' '}and{' '}
              <span className="text-lago-600 dark:text-lago-400 font-semibold cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-lago-400 mt-6">
          <Link to="/shop" className="hover:text-lago-600 dark:hover:text-white transition-colors">← Continue Shopping Without Account</Link>
        </p>
      </div>
    </div>
  );
}
