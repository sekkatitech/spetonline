import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

// ── Design tokens ──
const E = {
  primary:             '#000000',
  primaryContainer:    '#131b2e',
  onPrimary:           '#ffffff',
  secondary:           '#515f74',
  secondaryContainer:  '#d5e3fd',
  onSecondaryContainer:'#57657b',
  surface:             '#f7f9fb',
  surfaceLow:          '#f2f4f6',
  surfaceContainer:    '#eceef0',
  surfaceWhite:        '#ffffff',
  onSurface:           '#191c1e',
  onSurfaceVariant:    '#45464d',
  outline:             '#76777d',
  outlineVariant:      '#c6c6cd',
  blue:                '#497cff',
  error:               '#ba1a1a',
  errorBg:             '#ffdad6',
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: '100%', padding: '11px 14px',
  fontSize: 14, color: E.onSurface,
  background: E.surfaceWhite,
  border: `1px solid ${hasError ? E.error : E.outlineVariant}`,
  borderRadius: 8, outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
})

export default function EnterpriseLoginPage() {
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')

    try {
      // 1. Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (authError) throw new Error(authError.message)

      // 2. Check enterprise status
      const { data: profile } = await supabase
        .from('profiles')
        .select('enterprise_status, role')
        .eq('id', authData.user.id)
        .single()

      if (!profile) throw new Error('Account not found. Please contact support.')

      if (profile.enterprise_status === 'pending') {
        setError('Your application is still under review. We will contact you within 1 business day once approved.')
        await supabase.auth.signOut()
        return
      }

      if (profile.enterprise_status === 'suspended') {
        setError('Your enterprise account has been suspended. Please contact support at sales@spetonline.co.za.')
        await supabase.auth.signOut()
        return
      }

      if (profile.enterprise_status !== 'approved') {
        setError('This account does not have enterprise access. Please register your business first.')
        await supabase.auth.signOut()
        return
      }

      // 3. Approved — go to the enterprise home/showcase page
      navigate('/enterprise/home')

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.'
      // Make Supabase error messages friendlier
      if (msg.includes('Invalid login credentials')) {
        setError('Incorrect email or password. Please try again.')
      } else if (msg.includes('Email not confirmed')) {
        setError('Please verify your email address first. Check your inbox for a confirmation link.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: '100vh',
      background: E.surface,
      WebkitFontSmoothing: 'antialiased',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    }}>

      {/* ── Left panel — branding ── */}
      <div style={{
        background: E.primaryContainer,
        padding: '48px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dot pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative' }}>
          <a href="/enterprise" style={{ display: 'flex', alignItems: 'baseline', gap: 6, textDecoration: 'none' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>SPET</span>
            <span style={{ fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.6)' }}>Enterprise</span>
          </a>
        </div>

        {/* Middle content */}
        <div style={{ position: 'relative' }}>
          <h1 style={{
            fontSize: 'clamp(28px, 3vw, 44px)',
            fontWeight: 700, color: '#fff',
            letterSpacing: '-0.03em', lineHeight: 1.1,
            marginBottom: 20,
          }}>
            Your procurement<br />portal awaits.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 360, marginBottom: 40 }}>
            Access your enterprise dashboard, build quotes, track orders, and manage your team — all in one place.
          </p>

          {/* Feature pills */}
          {[
            '5,657 products across all ranges',
            'Formal PDF quotes within 24 hours',
            'Net 30 / 60 credit terms available',
            'Priority Courier Guy logistics',
          ].map(f => (
            <div key={f} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 14,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', flexShrink: 0,
              }}><Check size={11} /></div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Bottom quote */}
        <div style={{
          position: 'relative',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 24,
        }}>
          <p style={{ fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 8 }}>
            "SPET Enterprise has transformed our procurement cycle from weeks to hours."
          </p>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)' }}>
            — CTO, NexaCorp Systems
          </p>
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '48px 40px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Heading */}
          <h2 style={{
            fontSize: 28, fontWeight: 700,
            color: E.primary, letterSpacing: '-0.02em',
            marginBottom: 8,
          }}>
            Welcome back
          </h2>
          <p style={{ fontSize: 14, color: E.onSurfaceVariant, marginBottom: 36 }}>
            Sign in to your SPET Enterprise account.
          </p>

          {/* Error box */}
          {error && (
            <div style={{
              background: E.errorBg,
              border: `1px solid ${E.error}`,
              borderRadius: 8, padding: '12px 16px',
              fontSize: 13, color: E.error,
              lineHeight: 1.6, marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontSize: 13, fontWeight: 500,
              color: E.onSurfaceVariant, display: 'block', marginBottom: 6,
            }}>
              Work Email
            </label>
            <input
              style={inputStyle()}
              type="email"
              placeholder="you@company.co.za"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              autoComplete="email"
              onFocus={e => (e.target.style.borderColor = E.primary)}
              onBlur={e  => (e.target.style.borderColor = E.outlineVariant)}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <label style={{
              fontSize: 13, fontWeight: 500,
              color: E.onSurfaceVariant, display: 'block', marginBottom: 6,
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                style={inputStyle()}
                type={showPw ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
                onFocus={e => (e.target.style.borderColor = E.primary)}
                onBlur={e  => (e.target.style.borderColor = E.outlineVariant)}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 12,
                  color: E.outline, fontFamily: 'inherit',
                }}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginBottom: 28 }}>
            <a
              href="/auth?mode=reset"
              style={{ fontSize: 12, color: E.blue, textDecoration: 'none' }}
            >
              Forgot password?
            </a>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? E.outline : E.primary,
              color: E.onPrimary,
              fontSize: 15, fontWeight: 600,
              padding: '13px 24px',
              borderRadius: 8, border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.15s, transform 0.1s',
              marginBottom: 16,
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
          >
            {loading ? 'Signing in…' : 'Sign In to Enterprise Portal'}
          </button>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 20,
          }}>
            <div style={{ flex: 1, height: 1, background: E.outlineVariant }} />
            <span style={{ fontSize: 12, color: E.outline }}>or</span>
            <div style={{ flex: 1, height: 1, background: E.outlineVariant }} />
          </div>

          {/* Register link */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{ fontSize: 13, color: E.onSurfaceVariant }}>
              Don't have an account?{' '}
            </span>
            <a
              href="/enterprise/register"
              style={{ fontSize: 13, fontWeight: 600, color: E.primary, textDecoration: 'none' }}
            >
              Register your business →
            </a>
          </div>

          {/* Back to consumer site */}
          <div style={{ textAlign: 'center' }}>
            <a
              href="/"
              style={{
                fontSize: 12, color: E.outline, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              ← Back to SPET Online
            </a>
          </div>

        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          .enterprise-login-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}