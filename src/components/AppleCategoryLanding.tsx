import { useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// EDIT THIS CONFIG to change the landing page content — no code knowledge
// needed. Each tile's `sub` must EXACTLY match a category_sub value in the
// core_products table. `image` can be a web link (paste an image address)
// or a file in your public folder (starting with /enterprice-images/...).
// ═══════════════════════════════════════════════════════════════════════════

export interface LandingTile {
  sub: string
  title: string
  tagline: string
  image: string
}

export interface CategoryLandingConfig {
  heroVideo: string
  heroImage: string
  headline: string
  subheadline: string
  tiles: LandingTile[]
}

export const IPAD_LANDING: CategoryLandingConfig = {
  heroVideo: 'https://core.co.za/cdn/shop/videos/c/vp/84926a051b284f16aa7400878fef7c00/84926a051b284f16aa7400878fef7c00.HD-1080p-7.2Mbps-81752485.mp4?v=0',
  heroImage: '/enterprice-images/iPad-family.png',
  headline: 'iPad',
  subheadline: 'Touch, draw, and type on one magical device.',
  tiles: [
    { sub: 'Ipad pro 13" m5',  title: 'iPad Pro 13\u2033 | M5', tagline: 'The ultimate iPad experience.',        image: '/enterprice-images/iPad-family.png' },
    { sub: 'Ipad pro 11" m5',  title: 'iPad Pro 11\u2033 | M5', tagline: 'Pro power. Portable size.',            image: '/enterprice-images/iPad-family.png' },
    { sub: 'Ipad air m4',      title: 'iPad Air | M4',          tagline: 'Take your office anywhere.',           image: '/enterprice-images/iPad-family.png' },
    { sub: 'Ipad air m2',      title: 'iPad Air | M2',          tagline: 'Serious performance. Superb value.',   image: '/enterprice-images/iPad-family.png' },
    { sub: 'Ipad (11th gen)',  title: 'iPad | 11th Gen',        tagline: 'Meet the magical, colourful iPad.',    image: '/enterprice-images/iPad-family.png' },
    { sub: 'Ipad mini 7',      title: 'iPad mini | 7',          tagline: 'The full iPad experience, in hand.',   image: '/enterprice-images/iPad-family.png' },
  ],
}

// ── Design tokens (matches the Apple portal) ────────────────────────────────
const L = {
  white: '#ffffff', offwhite: '#f5f5f7', black: '#1d1d1f',
  grey: '#6e6e73', line: '#e8e8ed', blue: '#0071e3',
}

// ═══════════════════════════════════════════════════════════════════════════
// The landing page component
// ═══════════════════════════════════════════════════════════════════════════

export default function AppleCategoryLanding({ config, onShop, onBrowseAll }: {
  config: CategoryLandingConfig
  onShop: (sub: string) => void
  onBrowseAll: () => void
}) {
  const [videoError, setVideoError] = useState(false)

  return (
    <div>

      {/* ── Hero: video with image fallback ── */}
      <div style={{ borderRadius: 18, overflow: 'hidden', background: L.offwhite, marginBottom: 16 }}>
        {!videoError ? (
          <video
            src={config.heroVideo}
            poster={config.heroImage}
            autoPlay muted loop playsInline
            onError={() => setVideoError(true)}
            style={{ width: '100%', display: 'block' }}
          />
        ) : (
          <img
            src={config.heroImage}
            alt={config.headline}
            style={{ width: '100%', display: 'block' }}
          />
        )}
      </div>

      {/* ── Headline row ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, margin: '32px 0 36px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: L.black, letterSpacing: '-0.02em', margin: 0 }}>
            {config.headline}
          </h1>
          <p style={{ fontSize: 17, color: L.grey, margin: '8px 0 0' }}>{config.subheadline}</p>
        </div>
        <button
          onClick={onBrowseAll}
          style={{
            padding: '10px 22px', borderRadius: 980, border: `1px solid ${L.black}`,
            background: 'none', color: L.black, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}
        >
          Browse all {config.headline} →
        </button>
      </div>

      {/* ── Model tiles ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
      }}>
        {config.tiles.map(tile => (
          <div
            key={tile.sub}
            style={{
              background: L.offwhite, borderRadius: 18, padding: '36px 28px 28px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ height: 150, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
              <img
                src={tile.image}
                alt={tile.title}
                loading="lazy"
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ fontSize: 21, fontWeight: 600, color: L.black, letterSpacing: '-0.01em', marginBottom: 6 }}>
              {tile.title}
            </div>
            <div style={{ fontSize: 13.5, color: L.grey, lineHeight: 1.45, marginBottom: 20, flex: 1 }}>
              {tile.tagline}
            </div>
            <button
              onClick={() => onShop(tile.sub)}
              style={{
                padding: '10px 26px', borderRadius: 980, border: 'none',
                background: L.black, color: L.white, fontSize: 13.5, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Shop now
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}
