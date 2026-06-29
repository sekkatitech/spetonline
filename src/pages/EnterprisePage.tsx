import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────────
// Enterprise colour tokens — light mode only
// These are scoped to this page via inline styles
// so they don't clash with the consumer site theme
// ─────────────────────────────────────────────
const E = {
  primary:           '#000000',
  primaryContainer:  '#131b2e',
  onPrimary:         '#ffffff',
  secondary:         '#515f74',
  secondaryContainer:'#d5e3fd',
  onSecondaryContainer: '#57657b',
  surface:           '#f7f9fb',
  surfaceLow:        '#f2f4f6',
  surfaceContainer:  '#eceef0',
  surfaceHigh:       '#e6e8ea',
  surfaceHighest:    '#e0e3e5',
  surfaceWhite:      '#ffffff',
  onSurface:         '#191c1e',
  onSurfaceVariant:  '#45464d',
  outline:           '#76777d',
  outlineVariant:    '#c6c6cd',
  blue:              '#497cff',
}

// ─────────────────────────────────────────────
// Shared inline style helpers
// ─────────────────────────────────────────────
const s = {
  page: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: E.surface,
    color: E.onSurface,
    WebkitFontSmoothing: 'antialiased' as const,
    lineHeight: 1.5,
  } as React.CSSProperties,

  container: {
    maxWidth: 1320,
    margin: '0 auto',
    padding: '0 24px',
  } as React.CSSProperties,

  // Buttons
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: E.primary, color: E.onPrimary,
    fontSize: 15, fontWeight: 600, padding: '14px 28px',
    borderRadius: 8, border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s',
  } as React.CSSProperties,

  btnSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: E.surfaceWhite, color: E.primary,
    fontSize: 15, fontWeight: 600, padding: '14px 28px',
    borderRadius: 8, border: `1.5px solid ${E.outlineVariant}`, cursor: 'pointer',
    textDecoration: 'none', transition: 'background 0.15s',
  } as React.CSSProperties,

  btnGhost: {
    fontSize: 13, fontWeight: 600, color: E.primary,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '8px 16px', borderRadius: 6,
  } as React.CSSProperties,

  btnNav: {
    fontSize: 13, fontWeight: 600, color: E.onPrimary,
    background: E.primary, border: 'none', cursor: 'pointer',
    padding: '9px 20px', borderRadius: 6,
  } as React.CSSProperties,
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function EnterpriseHeader({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => {
      if (headerRef.current) {
        headerRef.current.style.boxShadow =
          window.scrollY > 20 ? '0 2px 12px rgba(0,0,0,0.08)' : 'none'
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLink = (label: string, href: string, active = false) => (
    <a
      key={label}
      href={href}
      style={{
        fontSize: 13, fontWeight: active ? 600 : 500,
        color: active ? E.primary : E.onSurfaceVariant,
        textDecoration: 'none', padding: '6px 12px', borderRadius: 6,
        borderBottom: active ? `2px solid ${E.primary}` : undefined,
        borderRadius: active ? 0 : 6,
      } as React.CSSProperties}
    >
      {label}
    </a>
  )

  return (
    <header
      ref={headerRef}
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: E.surfaceWhite,
        borderBottom: `1px solid ${E.outlineVariant}`,
        transition: 'box-shadow 0.2s',
      }}
    >
      <div style={{ ...s.container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <a href="/enterprise" style={{ display: 'flex', alignItems: 'baseline', gap: 6, textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: E.primary, letterSpacing: '-0.03em' }}>SPET</span>
          <span style={{ fontSize: 14, fontWeight: 300, color: E.secondary, letterSpacing: '0.01em' }}>Enterprise</span>
        </a>

        {/* Nav — hidden on mobile */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="enterprise-nav-desktop">
          {navLink('Products', '#', true)}
          {navLink('Solutions', '#solutions')}
          {navLink('Why SPET', '#why')}
          {navLink('Support', '#support')}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={s.btnGhost} onClick={onLogin}>Login</button>
          <button style={s.btnNav} onClick={onRegister}>Request Quote</button>
        </div>
      </div>
    </header>
  )
}

// ── Hero Section ──────────────────────────────
function HeroSection({ onRegister, onServices }: { onRegister: () => void; onServices: () => void }) {
  return (
    <section style={{
      background: E.surfaceWhite,
      padding: '80px 0 72px',
      overflow: 'hidden',
      position: 'relative',
      backgroundImage: 'radial-gradient(#c6c6cd 0.5px, transparent 0.5px)',
      backgroundSize: '24px 24px',
    }}>
      <div style={s.container}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: 64,
          alignItems: 'center',
        }}>
          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: E.secondaryContainer, color: E.onSecondaryContainer,
              padding: '5px 14px', borderRadius: 9999,
              fontSize: 11, fontWeight: 600, letterSpacing: '0.07em',
              textTransform: 'uppercase', marginBottom: 20,
            }}>
              <ShieldIcon size={14} />
              Enterprise Ready
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 700, lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: E.primary, marginBottom: 20,
            }}>
              Business<br />Procurement<br />
              <span style={{ color: E.blue }}>Made Simple</span>
            </h1>

            {/* Body */}
            <p style={{
              fontSize: 16, lineHeight: 1.65,
              color: E.onSurfaceVariant,
              maxWidth: 480, marginBottom: 36,
            }}>
              Source products, IT equipment, networking solutions, security systems,
              software, and technical services from one trusted supplier. Designed for
              the rigour of corporate and government scale.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <button
                style={s.btnPrimary}
                onClick={onRegister}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.22)'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.transform = ''
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)'
                }}
              >
                Create Business Account
                <ArrowRightIcon size={18} />
              </button>
              <button style={s.btnSecondary} onClick={onServices}>
                View Services
              </button>
            </div>

            {/* Trusted by */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 32,
              borderTop: `1px solid ${E.outlineVariant}`,
              paddingTop: 32, opacity: 0.55,
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: E.outline, whiteSpace: 'nowrap' }}>
                Trusted by:
              </span>
              <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                {['MUNICIPALITY', 'CORP-X', 'EDUTECH'].map(name => (
                  <span key={name} style={{ fontSize: 14, fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.02em', color: E.onSurfaceVariant }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — visual panel */}
          <div style={{ position: 'relative' }}>
            {/* Glow */}
            <div style={{
              position: 'absolute', width: 300, height: 300,
              borderRadius: '50%', background: 'rgba(218,226,253,0.4)',
              filter: 'blur(60px)', top: -60, right: -60, zIndex: 0,
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'relative', zIndex: 1,
              background: E.surfaceWhite,
              border: `1px solid ${E.outlineVariant}`,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.06)',
            }}>
              {/* Illustration */}
              <HeroIllustration />

              {/* Chips */}
              <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 8 }}>
                {[
                  { icon: <MonitorIcon size={14} />, label: 'Infrastructure' },
                  { icon: <ShieldIcon size={14} />,  label: 'Surveillance' },
                ].map(chip => (
                  <div key={chip.label} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(8px)',
                    border: `1px solid rgba(198,198,205,0.5)`,
                    borderRadius: 6, padding: '6px 12px',
                    fontSize: 12, fontWeight: 600, color: E.onSurface,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}>
                    <span style={{ color: E.blue }}>{chip.icon}</span>
                    {chip.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Sectors ───────────────────────────────────
const SECTORS = [
  {
    icon: <EducationIcon />,
    title: 'Education',
    body: 'Laptops, projectors, networking, and lab equipment for schools, colleges, and universities. SITA-compliant procurement.',
  },
  {
    icon: <GovIcon />,
    title: 'Government & Municipal',
    body: 'Tender-ready supply of IT infrastructure, surveillance systems, and communications for public sector entities.',
  },
  {
    icon: <CorporateIcon />,
    title: 'Corporate & Enterprise',
    body: 'Bulk hardware refresh, server infrastructure, VoIP, and managed services for mid to large companies.',
  },
  {
    icon: <MiningIcon />,
    title: 'Mining & Industrial',
    body: 'Ruggedised devices, CCTV, access control, and site networking for mining, construction, and industrial environments.',
  },
]

function SolutionsSection() {
  return (
    <section id="solutions" style={{ background: E.surface, padding: '96px 0' }}>
      <div style={s.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, gap: 32, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: E.blue, marginBottom: 10 }}>
              Targeted Verticals
            </p>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', color: E.primary }}>
              Solutions for every sector
            </h2>
          </div>
          <p style={{ fontSize: 14, color: E.onSurfaceVariant, maxWidth: 320, lineHeight: 1.65 }}>
            Specialised procurement pipelines built for the unique compliance and technical requirements of your industry.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {SECTORS.map(sec => (
            <div
              key={sec.title}
              style={{
                background: E.surfaceWhite,
                border: `1px solid ${E.outlineVariant}`,
                borderRadius: 12, padding: '28px 24px',
                cursor: 'pointer', transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
                ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
                ;(e.currentTarget as HTMLDivElement).style.transform = ''
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: E.surfaceContainer,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16, color: E.blue,
              }}>
                {sec.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: E.primary, marginBottom: 8 }}>{sec.title}</div>
              <div style={{ fontSize: 13, color: E.onSurfaceVariant, lineHeight: 1.6 }}>{sec.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Stats Bento ───────────────────────────────
function StatsSection() {
  const card = (style?: React.CSSProperties): React.CSSProperties => ({
    background: E.surfaceWhite,
    border: `1px solid ${E.outlineVariant}`,
    borderRadius: 12, padding: 28,
    position: 'relative', overflow: 'hidden',
    ...style,
  })

  const darkCard: React.CSSProperties = {
    background: E.primaryContainer,
    border: `1px solid ${E.primaryContainer}`,
    borderRadius: 12, padding: 28,
    position: 'relative', overflow: 'hidden',
    color: E.onPrimary,
  }

  const label = (text: string, dark = false) => (
    <span style={{
      fontSize: 12, fontWeight: 600, letterSpacing: '0.05em',
      textTransform: 'uppercase',
      color: dark ? 'rgba(124,131,155,1)' : E.blue,
      display: 'block', marginBottom: 6,
    }}>
      {text}
    </span>
  )

  const number = (val: string, dark = false) => (
    <div style={{
      fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em',
      lineHeight: 1, color: dark ? '#fff' : E.primary,
    }}>
      {val}
    </div>
  )

  const sub = (text: string, dark = false) => (
    <p style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.55)' : E.onSurfaceVariant, marginTop: 8 }}>{text}</p>
  )

  return (
    <section style={{ background: E.surfaceLow, padding: '96px 0' }}>
      <div style={s.container}>
        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 16, marginBottom: 16 }}>
          <div style={card()}>
            {label('Active SKUs')}
            {number('5,657')}
            {sub('Across Esquire and Syntech ranges — laptops, networking, security, peripherals and more.')}
          </div>
          <div style={card()}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, height: '100%' }}>
              <div>
                {label('Brands')}
                <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: E.primary }}>242</div>
                {sub('HP, Dell, Lenovo, Hikvision, Ubiquiti and more.')}
              </div>
              <div>
                {label('Categories')}
                <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: E.primary }}>548</div>
                {sub('Every category your procurement team needs.')}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 4fr 4fr', gap: 16 }}>
          <div style={darkCard}>
            {label('Quote turnaround', true)}
            {number('24h', true)}
            {sub('Formal quotes generated and returned within one business day.', true)}
          </div>

          <div style={darkCard}>
            {label('Credit terms', true)}
            {number('30', true)}
            {sub('Net 30 / Net 60 available for verified enterprise accounts.', true)}
            <div style={{
              marginTop: 20, padding: '20px 24px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>24/7 Technical Support</div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 16, lineHeight: 1.6 }}>
                Dedicated account managers and engineers ready to assist.
              </p>
              <button id="support" style={{
                width: '100%', background: '#fff', color: E.primary,
                fontSize: 13, fontWeight: 600, padding: '11px 20px',
                borderRadius: 6, border: 'none', cursor: 'pointer',
              }}>
                Speak to an Expert
              </button>
            </div>
          </div>

          <div style={card()}>
            {label('Why enterprise clients choose us')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
              {[
                { val: 'R0',  desc: 'Subscription fee' },
                { val: '15%', desc: 'VAT included', blue: true },
                { val: 'PDF', desc: 'Formal quotes' },
              ].map(item => (
                <div key={item.desc} style={{ textAlign: 'center', padding: '16px 8px', background: E.surfaceLow, borderRadius: 8 }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: item.blue ? E.blue : E.primary, letterSpacing: '-0.03em' }}>{item.val}</div>
                  <div style={{ fontSize: 11, color: E.onSurfaceVariant, marginTop: 4 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Why SPET Enterprise ───────────────────────
const FEATURES = [
  {
    icon: <CheckCircleIcon />,
    title: 'Vetted supplier partners',
    body: 'Access certified IT and infrastructure brands. No grey imports — all products are officially distributed.',
  },
  {
    icon: <ClipboardIcon />,
    title: 'Formal quote workflow',
    body: 'Build multi-line quotes with quantities and bulk tiers. Submit for approval. Receive a signed PDF quote within 24 hours.',
  },
  {
    icon: <TruckIcon />,
    title: 'Priority logistics',
    body: 'Dedicated shipping lanes via Courier Guy. Real-time waybill tracking on every enterprise order.',
  },
  {
    icon: <CardIcon />,
    title: 'Net 30 / 60 credit',
    body: 'Flexible credit terms available for verified accounts. Monthly statements downloadable from your dashboard.',
  },
]

const MINI_STATS = [
  { icon: <ClipboardIcon />, label: 'Active quotes',   val: '5',        badge: '+2 this week', badgeStyle: { background: E.secondaryContainer, color: E.blue } },
  { icon: <TruckIcon />,     label: 'Pending orders',  val: '2',        badge: 'In transit',   badgeStyle: { background: '#fff8e1', color: '#f57f17' } },
  { icon: <CurrencyIcon />,  label: 'Monthly spend',   val: 'R 45,200', badge: 'On budget',    badgeStyle: { background: '#e8f5e9', color: '#2e7d32' } },
  { icon: <DocIcon />,       label: 'Open invoices',   val: '1',        badge: 'Due in 8 days',badgeStyle: { background: '#fce4e4', color: '#c62828' } },
]

function WhySection() {
  return (
    <section id="why" style={{ background: E.surfaceWhite, padding: '96px 0' }}>
      <div style={s.container}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
          gap: 80, alignItems: 'center',
        }}>
          {/* Left — features */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: E.blue, marginBottom: 10 }}>
              Built for business
            </p>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', color: E.primary, marginBottom: 40 }}>
              Everything your procurement team needs
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{ display: 'flex', gap: 16 }}>
                  <div style={{
                    width: 40, height: 40, minWidth: 40, borderRadius: 8,
                    background: E.surfaceContainer,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: E.blue,
                  }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: E.primary, marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: E.onSurfaceVariant, lineHeight: 1.6 }}>{f.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — live account preview */}
          <div style={{
            background: E.surfaceLow,
            border: `1px solid ${E.outlineVariant}`,
            borderRadius: 16, padding: 32,
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: E.onSurfaceVariant, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 2 }}>
              Account overview
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: E.primary, marginBottom: 8 }}>
              Global Logistics Inc.
            </div>

            {MINI_STATS.map(row => (
              <div key={row.label} style={{
                background: E.surfaceWhite,
                border: `1px solid ${E.outlineVariant}`,
                borderRadius: 8, padding: '14px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: E.onSurfaceVariant }}>
                  <span style={{ color: E.blue }}>{row.icon}</span>
                  {row.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: E.primary, fontVariantNumeric: 'tabular-nums' }}>{row.val}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px',
                    borderRadius: 9999, ...row.badgeStyle,
                  }}>
                    {row.badge}
                  </span>
                </div>
              </div>
            ))}

            {/* Tier pill */}
            <div style={{
              marginTop: 4, padding: '18px 20px',
              background: E.primaryContainer,
              borderRadius: 8,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'rgba(124,131,155,1)', marginBottom: 4 }}>
                Account tier
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Preferred Partner</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                Net 30 · Bulk pricing unlocked · Priority support
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── CTA Banner ────────────────────────────────
function CTABanner({ onRegister, onLogin }: { onRegister: () => void; onLogin: () => void }) {
  return (
    <section style={{ background: E.surfaceWhite, padding: '80px 0' }}>
      <div style={s.container}>
        <div style={{
          background: E.secondaryContainer,
          borderRadius: 24, padding: '72px 64px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          {/* Dot pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(#b9c7e0 0.5px, transparent 0.5px)',
            backgroundSize: '24px 24px',
            opacity: 0.35, pointerEvents: 'none',
          }} />
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 700, letterSpacing: '-0.03em',
            color: E.primary, marginBottom: 16,
            position: 'relative',
          }}>
            Ready to streamline your<br />business procurement?
          </h2>
          <p style={{
            fontSize: 16, color: E.onSurfaceVariant, lineHeight: 1.65,
            maxWidth: 540, margin: '0 auto 36px',
            position: 'relative',
          }}>
            Join procurement officers from municipalities, corporates, and schools who
            trust SPET Enterprise for their hardware, networking, and technical service needs.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', position: 'relative' }}>
            <button style={s.btnPrimary} onClick={onRegister}>
              Create Business Account
              <ArrowRightIcon size={18} />
            </button>
            <button style={s.btnSecondary} onClick={onLogin}>
              Login to Portal
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────
function EnterpriseFooter() {
  const col = (title: string, links: string[]) => (
    <div key={title}>
      <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: E.primary, marginBottom: 16 }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map(l => (
          <a key={l} href="#" style={{ fontSize: 13, color: E.onSurfaceVariant, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = E.primary)}
            onMouseLeave={e => (e.currentTarget.style.color = E.onSurfaceVariant)}
          >
            {l}
          </a>
        ))}
      </div>
    </div>
  )

  return (
    <footer style={{ background: E.surfaceHighest, borderTop: `1px solid ${E.outlineVariant}`, padding: '56px 0 0' }}>
      <div style={s.container}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', gap: 48, paddingBottom: 48, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: E.primary, letterSpacing: '-0.02em', marginBottom: 10 }}>
              SPET Enterprise
            </div>
            <p style={{ fontSize: 13, color: E.onSurfaceVariant, lineHeight: 1.65, marginBottom: 20 }}>
              South Africa's trusted B2B procurement portal for technology, security, and
              infrastructure solutions. Building a reliable bridge between verified suppliers
              and local enterprises.
            </p>
          </div>
          {col('Solutions', ['IT & Computing', 'Security Systems', 'Networking', 'VoIP & Communications', 'Professional Services'])}
          {col('Support',   ['Help Centre', 'Contact Support', 'Logistics Tracking', 'Request a Quote'])}
          {col('Legal',     ['Privacy Policy', 'Terms of Service', 'POPIA Compliance', 'B-BBEE Certificate'])}
        </div>

        <div style={{
          borderTop: `1px solid rgba(198,198,205,0.4)`,
          padding: '20px 0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: 12, color: E.onSurfaceVariant, opacity: 0.65 }}>
            © 2026 SPET Online B2B Procurement Portal. Sekkati Petroleum Energy and Technology (Pty) Ltd. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Sitemap', 'Cookies'].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: E.onSurfaceVariant, textDecoration: 'none', opacity: 0.65 }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Inline SVG Icon set ───────────────────────
// All icons are self-contained — no icon library dependency needed

function ArrowRightIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )
}
function ShieldIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}
function MonitorIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  )
}
function EducationIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  )
}
function GovIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4z"/>
    </svg>
  )
}
function CorporateIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
    </svg>
  )
}
function MiningIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}
function CheckCircleIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  )
}
function ClipboardIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
    </svg>
  )
}
function TruckIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
    </svg>
  )
}
function CardIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
    </svg>
  )
}
function CurrencyIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/>
    </svg>
  )
}
function DocIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}

// ── Hero Illustration (SVG) ───────────────────
function HeroIllustration() {
  return (
    <div style={{ width: '100%', aspectRatio: '4/3', background: '#dde3ec', overflow: 'hidden' }}>
      <svg viewBox="0 0 560 420" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="ep-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8edf5"/>
            <stop offset="100%" stopColor="#d0d8e8"/>
          </linearGradient>
          <linearGradient id="ep-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2a4a"/>
            <stop offset="100%" stopColor="#0d1b33"/>
          </linearGradient>
        </defs>
        <rect width="560" height="420" fill="url(#ep-bg)"/>
        {/* Laptop */}
        <rect x="80" y="280" width="240" height="12" rx="3" fill="#9aa5b8"/>
        <rect x="60" y="288" width="280" height="8" rx="4" fill="#8090a8"/>
        <rect x="85" y="140" width="230" height="145" rx="8" fill="#2d3a52"/>
        <rect x="92" y="147" width="216" height="128" rx="4" fill="url(#ep-screen)"/>
        <rect x="96" y="151" width="208" height="120" rx="2" fill="#0f1e38"/>
        <rect x="96" y="151" width="36" height="120" fill="#0a1626"/>
        <rect x="103" y="163" width="22" height="4" rx="2" fill="#497cff" opacity=".8"/>
        {[175,187,199,211].map(y => <rect key={y} x="103" y={y} width="22" height="4" rx="2" fill="#fff" opacity=".2"/>)}
        <rect x="136" y="158" width="60" height="7" rx="2" fill="#497cff" opacity=".9"/>
        {[[136,172,44,28],[186,172,44,28],[236,172,56,28]].map(([x,y,w,h],i) => <rect key={i} x={x} y={y} width={w} height={h} rx="3" fill="#1a2d50"/>)}
        <rect x="140" y="178" width="24" height="3" rx="1" fill="#97a3b8" opacity=".7"/><rect x="140" y="185" width="32" height="6" rx="1" fill="#fff" opacity=".9"/>
        <rect x="190" y="178" width="24" height="3" rx="1" fill="#97a3b8" opacity=".7"/><rect x="190" y="185" width="28" height="6" rx="1" fill="#fff" opacity=".9"/>
        <rect x="240" y="178" width="30" height="3" rx="1" fill="#97a3b8" opacity=".7"/><rect x="240" y="185" width="40" height="6" rx="1" fill="#497cff" opacity=".9"/>
        <rect x="136" y="207" width="164" height="56" rx="3" fill="#1a2d50"/>
        <polyline points="144,252 158,238 172,244 186,228 200,234 214,218 228,222 242,210 256,216 270,204 284,212 298,200" fill="none" stroke="#497cff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="144,258 158,248 172,252 186,242 200,246 214,234 228,238 242,230 256,234 270,226 284,232 298,224" fill="none" stroke="#bec6e0" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity=".5"/>
        <rect x="85" y="285" width="230" height="5" rx="2" fill="#bcc5d6"/>
        <rect x="165" y="286" width="70" height="3" rx="1.5" fill="#aab4c6"/>
        {/* Network rack */}
        {[160,182,204,226,248].map((y,i) => <rect key={y} x="360" y={y} width="140" height="18" rx="3" fill={i%2===0?'#4a5568':'#3d4a5c'}/>)}
        {[169,191,213,235,257].map((y,i) => <circle key={y} cx="490" cy={y} r="3" fill={i===3?'#f57f17':'#497cff'} opacity=".9"/>)}
        {[169,191].map(y => <circle key={y+'b'} cx="483" cy={y} r="3" fill="#497cff" opacity=".5"/>)}
        {[169,191,213].map(y => <circle key={y+'g'} cx="476" cy={y} r="3" fill="#2e7d32" opacity=".8"/>)}
        {/* Camera */}
        <rect x="420" y="90" width="60" height="8" rx="4" fill="#8090a8"/>
        <rect x="430" y="64" width="4" height="28" fill="#9aa5b8"/>
        <ellipse cx="432" cy="62" rx="18" ry="18" fill="#6b7a94"/>
        <ellipse cx="432" cy="62" rx="12" ry="12" fill="#3d4a5c"/>
        <ellipse cx="432" cy="62" rx="6" ry="6" fill="#1a2440"/>
        <ellipse cx="432" cy="62" rx="2.5" ry="2.5" fill="#0d1426"/>
        {/* VoIP phone */}
        <rect x="330" y="295" width="90" height="65" rx="5" fill="#4a5568"/>
        <rect x="336" y="300" width="64" height="32" rx="3" fill="#1a2d50"/>
        <rect x="339" y="303" width="58" height="26" rx="2" fill="#0f1e38"/>
        <rect x="342" y="307" width="30" height="3" rx="1" fill="#497cff" opacity=".8"/>
        <rect x="342" y="313" width="50" height="2" rx="1" fill="#fff" opacity=".2"/>
        {[337,351,365,379].map(x => <rect key={x} x={x} y="337" width="10" height="6" rx="1.5" fill="#5a6880"/>)}
        {[337,351].map(x => <rect key={x+'b'} x={x} y="347" width="10" height="6" rx="1.5" fill="#5a6880"/>)}
        <rect x="365" y="347" width="10" height="6" rx="1.5" fill="#2e7d32"/>
        <rect x="379" y="347" width="10" height="6" rx="1.5" fill="#c62828"/>
        <rect x="330" y="310" width="12" height="38" rx="6" fill="#6b7a94"/>
        {/* Shadows */}
        <ellipse cx="200" cy="355" rx="130" ry="10" fill="#000" opacity=".06"/>
        <ellipse cx="430" cy="365" rx="90" ry="8" fill="#000" opacity=".06"/>
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main EnterprisePage component
// Drop into: src/pages/EnterprisePage.tsx
// Add route in App.tsx: <Route path="/enterprise" element={<EnterprisePage />} />
// ─────────────────────────────────────────────
export default function EnterprisePage() {
  const navigate = useNavigate()

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleRegister = () => navigate('/enterprise/register')
  const handleLogin    = () => navigate('/enterprise/login')
  const handleServices = () => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div style={s.page}>
      {/*
        NOTE: This page renders its OWN header and footer with Enterprise branding.
        Make sure your App.tsx route for /enterprise does NOT wrap this in
        your consumer <Layout> component (which has the SPET Online header/footer).

        In App.tsx add:
          <Route path="/enterprise" element={<EnterprisePage />} />
          <Route path="/enterprise/register" element={<EnterpriseRegisterPage />} />
          <Route path="/enterprise/login" element={<EnterpriseLoginPage />} />
      */}

      <EnterpriseHeader onLogin={handleLogin} onRegister={handleRegister} />

      <main>
        <HeroSection    onRegister={handleRegister} onServices={handleServices} />
        <SolutionsSection />
        <StatsSection />
        <WhySection />
        <CTABanner      onRegister={handleRegister} onLogin={handleLogin} />
      </main>

      <EnterpriseFooter />

      {/* Scoped responsive styles — avoids polluting global CSS */}
      <style>{`
        @media (max-width: 768px) {
          .enterprise-nav-desktop { display: none !important; }
        }
        @media (max-width: 640px) {
          .enterprise-cta-row { flex-direction: column !important; }
        }
      `}</style>
    </div>
  )
}