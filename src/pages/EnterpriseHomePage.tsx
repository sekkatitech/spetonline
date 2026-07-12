import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Apple, FileText, Truck, ClipboardList, Settings, type LucideIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { WhySection, EnterpriseFooter } from './EnterprisePage'

// ── Design tokens (matches EnterprisePage / EnterpriseDashboard) ──
const E = {
  primary:            '#000000',
  primaryContainer:   '#131b2e',
  onPrimary:           '#ffffff',
  secondary:           '#515f74',
  surface:             '#f7f9fb',
  surfaceLow:          '#f2f4f6',
  surfaceContainer:    '#eceef0',
  surfaceWhite:        '#ffffff',
  onSurface:           '#191c1e',
  onSurfaceVariant:    '#45464d',
  outline:             '#76777d',
  outlineVariant:      '#c6c6cd',
  blue:                '#497cff',
  orange:              '#F97316',
}

const s = {
  container: { maxWidth: 1320, margin: '0 auto', padding: '0 24px' } as React.CSSProperties,
}

interface Profile {
  id:        string
  full_name: string
  role:      string
}

interface Account {
  id:           string
  company_name: string
  account_tier: string
}

// ── Quick-nav destinations ──
const QUICK_LINKS: { label: string; desc: string; to: string; icon: LucideIcon }[] = [
  { label: 'Dashboard',           desc: 'Overview, orders & activity',      to: '/enterprise/dashboard',          icon: LayoutDashboard },
  { label: 'Catalog',              desc: 'Browse the full product range',    to: '/enterprise/products',           icon: Package },
  { label: 'Apple Portal',         desc: 'Mac, iPhone, iPad & AirPods',      to: '/enterprise/apple',              icon: Apple },
  { label: 'Quotes',               desc: 'Request & track formal quotes',    to: '/enterprise/quotes',             icon: FileText },
  { label: 'Orders',               desc: 'Order history & delivery status',  to: '/enterprise/orders',             icon: Truck },
  { label: 'Procurement Lists',    desc: 'Saved lists for repeat ordering',  to: '/enterprise/lists',              icon: ClipboardList },
  { label: 'Account',              desc: 'Company & team settings',          to: '/enterprise/account',            icon: Settings },
]

// ── What we sell — category banners ──
const CATEGORY_BANNERS = [
  { name: 'Apple for Business',   desc: 'Mac, iPhone, iPad & AirPods with dedicated B2B pricing.',   img: '/enterprice-images/ARP100_Desktop Banner.png',    to: '/enterprise/apple' },
  { name: 'IT & Computing',        desc: 'Laptops, desktops, and workstations for every role.',        img: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=800&q=80', to: '/enterprise/products' },
  { name: 'Networking',            desc: 'Switches, routers, and high-density Wi-Fi infrastructure.',  img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80', to: '/enterprise/products' },
  { name: 'Security & CCTV',       desc: 'Surveillance cameras, access control, and NVRs.',             img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80', to: '/enterprise/products' },
]

const BRANDS = ['Dell', 'HP', 'Lenovo', 'Apple', 'Ubiquiti', 'Hikvision', 'TP-Link', 'Microsoft']

export default function EnterpriseHomePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/enterprise/login'); return }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, role, enterprise_status')
        .eq('id', session.user.id)
        .maybeSingle()

      const hasAccess = profileData && (
        ['admin', 'super_admin'].includes(profileData.role) ||
        profileData.enterprise_status === 'approved'
      )
      if (!hasAccess) { navigate('/enterprise/login'); return }

      setProfile(profileData)

      const { data: memberData } = await supabase
        .from('enterprise_account_members')
        .select('account_id')
        .eq('profile_id', session.user.id)
        .maybeSingle()

      if (memberData) {
        const { data: accountData } = await supabase
          .from('enterprise_accounts')
          .select('id, company_name, account_tier')
          .eq('id', memberData.account_id)
          .maybeSingle()
        if (accountData) setAccount(accountData)
      }

      setLoading(false)
    })()
  }, [navigate])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: E.surface, color: E.onSurfaceVariant, fontFamily: FONT }}>
        Loading…
      </div>
    )
  }

  return (
    <div style={{ fontFamily: FONT, background: E.surface, color: E.onSurface, minHeight: '100vh', WebkitFontSmoothing: 'antialiased' }}>

      {/* ── Header ── */}
      <div style={{ background: E.surfaceWhite, borderBottom: `1px solid ${E.outlineVariant}` }}>
        <div style={{ ...s.container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px' }}>
          <img src="/enterprice-images/spet-enterprise-logo.png" alt="SPET Enterprise" style={{ height: 32 }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: E.orange, color: '#fff', border: 'none',
                borderRadius: 980, padding: '10px 20px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              ← Back to SPET Online
            </button>
            <button
              onClick={() => navigate('/enterprise/dashboard')}
              style={{
                background: E.primary, color: E.onPrimary, border: 'none',
                borderRadius: 980, padding: '10px 20px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <section style={{ background: E.primaryContainer, padding: '64px 0', position: 'relative', overflow: 'hidden' }}>
        {/* Faded product banner, bled into the right edge of the section */}
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '52%', minWidth: 320, zIndex: 1 }}>
          <img
            src="/images/apple-hero-banner.jpg"
            alt=""
            aria-hidden="true"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '68% center', display: 'block' }}
          />
          {/* Fade the left edge of the image into the section background — eased further right so the "iPad Air" lockup peeks through faintly */}
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right, ${E.primaryContainer} 0%, ${E.primaryContainer}d9 8%, ${E.primaryContainer}4d 24%, transparent 48%)` }} />
          {/* Subtle overall shade so it reads as part of the banner, not a photo on top */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)' }} />
        </div>

        <div style={{ ...s.container, position: 'relative', zIndex: 2 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: E.orange, marginBottom: 12 }}>
            {account?.account_tier ? `${account.account_tier} account` : 'Enterprise account'}
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', marginBottom: 12 }}>
            Welcome back, {account?.company_name?.trim() || profile?.full_name?.trim() || 'there'}.
          </h1>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.85)', maxWidth: 560, lineHeight: 1.6, textAlign: 'center' }}>
            South Africa's trusted B2B procurement portal for technology, security, and infrastructure solutions —
            here's a quick look at what SPET Enterprise offers before you head to your dashboard.
          </p>
        </div>
      </section>

      {/* ── Quick nav ── */}
      <section style={{ padding: '48px 0 8px' }}>
        <div style={s.container}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {QUICK_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => navigate(link.to)}
                style={{
                  textAlign: 'left', background: E.surfaceWhite,
                  border: `1px solid ${E.outlineVariant}`, borderRadius: 14,
                  padding: '20px 18px', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = E.orange; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = E.outlineVariant; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ marginBottom: 10, color: E.orange }}><link.icon size={24} strokeWidth={1.75} /></div>
                <div style={{ fontSize: 14, fontWeight: 700, color: E.primary, marginBottom: 4 }}>{link.label}</div>
                <div style={{ fontSize: 12, color: E.onSurfaceVariant, lineHeight: 1.4 }}>{link.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we sell ── */}
      <section style={{ padding: '64px 0' }}>
        <div style={s.container}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: E.orange, marginBottom: 10 }}>
            What we sell
          </p>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.02em', color: E.primary, marginBottom: 32 }}>
            Everything your organisation needs, in one place
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {CATEGORY_BANNERS.map(cat => (
              <button
                key={cat.name}
                onClick={() => navigate(cat.to)}
                style={{
                  position: 'relative', textAlign: 'left', border: 'none', cursor: 'pointer',
                  borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3',
                  background: E.surfaceContainer, fontFamily: 'inherit', padding: 0,
                }}
              >
                <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.1) 60%, transparent)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 18 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{cat.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>{cat.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brands ── */}
      <section style={{ padding: '48px 0', background: E.surfaceWhite, borderTop: `1px solid ${E.outlineVariant}`, borderBottom: `1px solid ${E.outlineVariant}` }}>
        <div style={s.container}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: E.onSurfaceVariant, textAlign: 'center', marginBottom: 24 }}>
            Authorised partner for industry-leading brands
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px 40px' }}>
            {BRANDS.map(brand => (
              <span key={brand} style={{ fontSize: 18, fontWeight: 700, color: E.onSurfaceVariant, opacity: 0.6 }}>{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why us (reused from public Enterprise page) ── */}
      <WhySection />

      {/* ── Bottom CTA ── */}
      <section style={{ padding: '24px 0 64px' }}>
        <div style={s.container}>
          <div style={{
            background: E.primary, borderRadius: 20, padding: '48px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24,
          }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Ready to get started?</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>Head to your dashboard to place orders, request quotes, and manage your account.</div>
            </div>
            <button
              onClick={() => navigate('/enterprise/dashboard')}
              style={{
                background: E.orange, color: '#fff', border: 'none', borderRadius: 980,
                padding: '14px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              Go to Dashboard →
            </button>
          </div>
        </div>
      </section>

      <EnterpriseFooter />
    </div>
  )
}

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
