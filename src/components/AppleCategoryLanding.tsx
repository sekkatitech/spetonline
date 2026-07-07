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

const IPAD_HERO_IMAGE = '/enterprice-images/iPad-family.png'
const IPHONE_HERO_IMAGE = '/enterprice-images/ARP059_iPhone 17.png'
const MAC_HERO_IMAGE = '/enterprice-images/ARP100_Desktop Banner.png'
const AIRPODS_HERO_IMAGE = '/enterprice-images/AirPods-Prods.png'

const IPAD_LANDING: CategoryLandingConfig = {
  heroVideo: 'https://core.co.za/cdn/shop/videos/c/vp/84926a051b284f16aa7400878fef7c00/84926a051b284f16aa7400878fef7c00.HD-1080p-7.2Mbps-81752485.mp4?v=0',
  heroImage: IPAD_HERO_IMAGE,
  headline: 'iPad',
  subheadline: 'Touch, draw, and type on one magical device.',
  tiles: [
    { sub: 'Ipad pro 13" m5',  title: 'iPad Pro 13″ | M5', tagline: 'The ultimate iPad experience.',        image: IPAD_HERO_IMAGE },
    { sub: 'Ipad pro 11" m5',  title: 'iPad Pro 11″ | M5', tagline: 'Pro power. Portable size.',            image: IPAD_HERO_IMAGE },
    { sub: 'Ipad air m4',      title: 'iPad Air | M4',          tagline: 'Take your office anywhere.',           image: IPAD_HERO_IMAGE },
    { sub: 'Ipad air m2',      title: 'iPad Air | M2',          tagline: 'Serious performance. Superb value.',   image: IPAD_HERO_IMAGE },
    { sub: 'Ipad (11th gen)',  title: 'iPad | 11th Gen',        tagline: 'Meet the magical, colourful iPad.',    image: IPAD_HERO_IMAGE },
    { sub: 'Ipad mini 7',      title: 'iPad mini | 7',          tagline: 'The full iPad experience, in hand.',   image: IPAD_HERO_IMAGE },
  ],
}

const IPHONE_LANDING: CategoryLandingConfig = {
  heroVideo: 'https://core.co.za/cdn/shop/videos/c/vp/a74a607aba354fb39d92c279df00a8c7/a74a607aba354fb39d92c279df00a8c7.HD-1080p-7.2Mbps-81749787.mp4?v=0',
  heroImage: IPHONE_HERO_IMAGE,
  headline: 'iPhone',
  subheadline: 'Built for Apple Intelligence.',
  tiles: [
    { sub: 'Iphone 17 pro max', title: 'iPhone 17 Pro Max', tagline: 'The ultimate iPhone.',                image: IPHONE_HERO_IMAGE },
    { sub: 'Iphone 17 pro',     title: 'iPhone 17 Pro',     tagline: 'Titanium. Pro cameras. Pro power.',    image: IPHONE_HERO_IMAGE },
    { sub: 'Iphone 17',         title: 'iPhone 17',         tagline: 'A total powerhouse.',                  image: IPHONE_HERO_IMAGE },
    { sub: 'Iphone 17e',        title: 'iPhone 17e',        tagline: 'Serious capability. Serious value.',   image: IPHONE_HERO_IMAGE },
    { sub: 'Iphone air',        title: 'iPhone Air',        tagline: 'Impossibly thin. Incredibly capable.', image: IPHONE_HERO_IMAGE },
    { sub: 'Iphone 16',         title: 'iPhone 16',         tagline: 'A total powerhouse.',                  image: IPHONE_HERO_IMAGE },
    { sub: 'Iphone 16 plus',    title: 'iPhone 16 Plus',    tagline: 'Big and mighty.',                      image: IPHONE_HERO_IMAGE },
    { sub: 'Iphone 16e',        title: 'iPhone 16e',        tagline: 'A lot to love.',                       image: IPHONE_HERO_IMAGE },
    { sub: 'Iphone 15',         title: 'iPhone 15',         tagline: 'Loads to love. Even more to discover.', image: IPHONE_HERO_IMAGE },
  ],
}

const MAC_LANDING: CategoryLandingConfig = {
  heroVideo: 'https://core.co.za/cdn/shop/videos/c/vp/33a44b35849141c38de94be93e36c024/33a44b35849141c38de94be93e36c024.HD-1080p-7.2Mbps-81748093.mp4?v=0',
  heroImage: MAC_HERO_IMAGE,
  headline: 'Mac',
  subheadline: "Supercharged for what's next.",
  tiles: [
    { sub: 'Macbook air m5',   title: 'MacBook Air | M5',   tagline: 'Strikingly thin. Remarkably capable.', image: MAC_HERO_IMAGE },
    { sub: 'Macbook pro 14"',  title: 'MacBook Pro 14″', tagline: 'Mind-blowing. Head-turning.',        image: MAC_HERO_IMAGE },
    { sub: 'Macbook pro 16"',  title: 'MacBook Pro 16″', tagline: 'A beast of a laptop.',                image: MAC_HERO_IMAGE },
    { sub: 'Imac 24',          title: 'iMac 24″',       tagline: 'Say hello to the color of possibility.', image: MAC_HERO_IMAGE },
    { sub: 'Mac mini',         title: 'Mac mini',           tagline: 'More muscle. More hustle.',            image: MAC_HERO_IMAGE },
    { sub: 'Mac studio',       title: 'Mac Studio',         tagline: 'Take a big step up.',                  image: MAC_HERO_IMAGE },
    { sub: 'Displays',         title: 'Displays',           tagline: 'The ultimate display companion.',      image: MAC_HERO_IMAGE },
    { sub: 'Macbook neo',      title: 'MacBook Neo',        tagline: 'A18 Pro power. Incredible price.',     image: MAC_HERO_IMAGE },
  ],
}

const AIRPODS_LANDING: CategoryLandingConfig = {
  heroVideo: 'https://core.co.za/cdn/shop/videos/c/vp/4e917baa54024dd5a8e7c8dcd14cab59/4e917baa54024dd5a8e7c8dcd14cab59.HD-1080p-7.2Mbps-81750794.mp4?v=0',
  heroImage: AIRPODS_HERO_IMAGE,
  headline: 'AirPods',
  subheadline: 'Wireless audio. Perfected.',
  tiles: [
    { sub: 'AirPods Pro 3',  title: 'AirPods Pro 3',  tagline: 'Adaptive Audio. Now even smarter.',   image: AIRPODS_HERO_IMAGE },
    { sub: 'AirPods Pro 4',  title: 'AirPods Pro 4',  tagline: 'The ultimate wireless earbuds.',       image: AIRPODS_HERO_IMAGE },
    { sub: 'AirPods Max 2',  title: 'AirPods Max 2',  tagline: 'Computational audio. Reimagined.',     image: AIRPODS_HERO_IMAGE },
    { sub: 'AirPods',        title: 'AirPods',        tagline: 'Effortless. Magical. AirPods.',        image: AIRPODS_HERO_IMAGE },
  ],
}

export const LANDING_CONFIGS: Record<string, CategoryLandingConfig> = {
  iPad: IPAD_LANDING,
  iPhone: IPHONE_LANDING,
  Mac: MAC_LANDING,
  AirPods: AIRPODS_LANDING,
}

// ── Design tokens (matches the Apple portal) ────────────────────────────────
const L = {
  white: '#ffffff', offwhite: '#f5f5f7', black: '#1d1d1f',
  grey: '#6e6e73', line: '#e8e8ed', blue: '#0071e3',
}

const RESPONSIVE_CSS = `
@media (max-width: 480px) {
  .ent-landing-tiles { grid-template-columns: 1fr !important; }
}
@media (min-width: 481px) and (max-width: 900px) {
  .ent-landing-tiles { grid-template-columns: repeat(2, 1fr) !important; }
}
`

// ═══════════════════════════════════════════════════════════════════════════
// The landing page component
// ═══════════════════════════════════════════════════════════════════════════

export default function AppleCategoryLanding({ config, onShop, onBrowseAll }: {
  config: CategoryLandingConfig
  onShop: (sub: string) => void
  onBrowseAll: () => void
}) {
  const [videoError, setVideoError] = useState(false)
  const hasVideo = !!config.heroVideo

  return (
    <div>
      <style>{RESPONSIVE_CSS}</style>

      {/* ── Hero: video with image fallback ── */}
      <div style={{ borderRadius: 18, overflow: 'hidden', background: L.offwhite, marginBottom: 16 }}>
        {hasVideo && !videoError ? (
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
      <div className="ent-landing-tiles" style={{
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
