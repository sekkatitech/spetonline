import { useState, type CSSProperties, type ReactNode } from 'react'
import { Play } from 'lucide-react'
import ApplePreorderBadge from './ApplePreorderBadge'

// The Apple home page: products and videos first, with the shop one click away.
// Headlines come from Apple's reseller copy documents, so keep them word for word.

const H = {
  white: '#ffffff', offwhite: '#f5f5f7', black: '#1d1d1f', ink: '#000000',
  grey: '#6e6e73', greyDark: '#a1a1a6', blue: '#0071e3', blueDark: '#2997ff',
}

const VIDEO_BASE = 'https://core.co.za/cdn/shop/videos/c/vp'
const video = (id: string, version: string) => `${VIDEO_BASE}/${id}/${id}.HD-1080p-7.2Mbps-${version}.mp4?v=0`

const VIDEOS = {
  macbookProXdr: video('b3d26ebd7a7b4430bda4f03dcddb604c', '99285553'),
  macbookPro14: video('f91e0861454040048a8fddf88cc7248e', '99178782'),
  iphoneDuo: video('1fed24ee0d2a47a388e461960737a4ac', '97710257'),
  ipadAir: video('84926a051b284f16aa7400878fef7c00', '81752485'),
  homeView: video('0812bae7f4da45e394a509a2d557e59a', '97712421'),
}

const POSTERS = {
  macbookPro: '/images/apple-home/macbook-pro.jpg',
  iphoneDuo: '/images/apple-home/iphone-duo.jpg',
  ipadAir: '/images/apple-home/ipad-air.jpg',
  homeView: '/images/apple-home/homeview.jpg',
}

const CATEGORY_TILES = [
  { key: 'Mac', label: 'Mac', image: '/images/apple-imagies/MacBook_Air.jpeg' },
  { key: 'iPhone', label: 'iPhone', image: '/images/apple-products/iphone-18-pro/iphone-18-pro-silver-1.jpg' },
  { key: 'iPad', label: 'iPad', image: '/enterprice-images/iPad-family.png' },
  { key: 'Watch', label: 'Apple Watch', image: '/images/apple-imagies/apple-watch/Apple_Watch_Series_11.webp' },
  { key: 'AirPods', label: 'AirPods', image: '/images/apple-imagies/AirPods/AirPods_Pro_3.webp' },
  { key: 'HomePod', label: 'HomePod', image: '/images/apple-imagies/HomePod_mini_Blue_PDP_Image_Position-5__WWEN_511da05e-c37d-46b6-940f-d66dff94ee4f_5000x.webp' },
  { key: 'HomeView', label: 'HomeView', image: '/images/apple-products/homeview/rose-pink-front.webp', preorder: true },
  { key: 'Accessories', label: 'Accessories', image: 'https://cdn.shopify.com/s/files/1/0571/8340/4192/files/mq052za_3.webp?v=1749735555' },
]

const RESPONSIVE_CSS = `
.apple-home-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.apple-home-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.apple-home-tile:hover img { transform: scale(1.04); }
@media (max-width: 760px) {
  .apple-home-pair { grid-template-columns: minmax(0, 1fr); }
  .apple-home-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
`

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Short clip that plays silently. Falls back to its poster if it can't load. */
function LoopVideo({ src, poster, alt }: { src: string; poster: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  const style: CSSProperties = { width: '100%', display: 'block' }
  if (failed || prefersReducedMotion()) return <img src={poster} alt={alt} style={style} />
  return (
    <video
      src={src} poster={poster} aria-label={alt}
      autoPlay muted loop playsInline preload="metadata"
      onError={() => setFailed(true)}
      style={style}
    />
  )
}

/** Long film: nothing downloads until the customer presses play. */
function FilmVideo({ src, poster, alt }: { src: string; poster: string; alt: string }) {
  const [playing, setPlaying] = useState(false)
  if (playing) {
    return <video src={src} poster={poster} aria-label={alt} autoPlay controls playsInline style={{ width: '100%', display: 'block' }} />
  }
  return (
    <button
      onClick={() => setPlaying(true)}
      aria-label={`Play film: ${alt}`}
      style={{ position: 'relative', display: 'block', width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
    >
      <img src={poster} alt="" style={{ width: '100%', display: 'block' }} />
      <span style={{
        position: 'absolute', left: 20, bottom: 20, display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 18px', borderRadius: 980, background: 'rgba(0,0,0,0.72)', color: H.white,
        fontSize: 14, fontWeight: 600,
      }}>
        <Play size={14} fill="currentColor" aria-hidden="true" /> Watch the film
      </span>
    </button>
  )
}

function Panel({ dark, title, subtitle, cta, onShop, children }: {
  dark?: boolean
  title: ReactNode
  subtitle?: ReactNode
  cta: string
  onShop: () => void
  children: ReactNode
}) {
  return (
    <section style={{
      background: dark ? H.ink : H.white, color: dark ? H.white : H.black,
      borderRadius: 18, overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '44px 24px 28px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 'clamp(16px, 2vw, 21px)', color: dark ? H.greyDark : H.grey, margin: '10px 0 0' }}>{subtitle}</p>}
        <button
          onClick={onShop}
          style={{
            marginTop: 20, padding: '11px 24px', minHeight: 44, borderRadius: 980, border: 'none',
            background: H.blue, color: H.white, fontSize: 15, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {cta}
        </button>
      </div>
      <div style={{ marginTop: 'auto' }}>{children}</div>
    </section>
  )
}

export default function AppleHome({ onShop }: { onShop: (category: string) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{RESPONSIVE_CSS}</style>

      <section style={{ background: H.ink, color: H.white, borderRadius: 18, overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ padding: '36px 24px 28px' }}>
          <img src="/images/apple-home/arp-white.png" alt="Apple Reseller Program" style={{ height: 30, marginBottom: 28 }} />
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 700, letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>MacBook Pro</h1>
          <p style={{ fontSize: 'clamp(17px, 2.4vw, 24px)', color: H.greyDark, margin: '12px 0 0' }}>PROLED XDR Display</p>
          <div style={{ marginTop: 14 }}><ApplePreorderBadge inline /></div>
          <button
            onClick={() => onShop('Mac')}
            style={{
              marginTop: 22, padding: '11px 24px', minHeight: 44, borderRadius: 980, border: 'none',
              background: H.blue, color: H.white, fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Shop Mac
          </button>
        </div>
        <LoopVideo src={VIDEOS.macbookProXdr} poster={POSTERS.macbookPro} alt="MacBook Pro with PROLED XDR Display" />
      </section>

      <div className="apple-home-pair">
        <Panel title="iPhone 18 Pro" subtitle="Pro further." cta="Shop iPhone" onShop={() => onShop('iPhone')}>
          <img
            src="/images/apple-products/iphone-18-pro/iphone-18-pro-silver-1.jpg"
            alt="iPhone 18 Pro in Silver"
            style={{ width: '100%', maxHeight: 420, objectFit: 'contain', display: 'block', padding: '0 24px 24px', boxSizing: 'border-box' }}
          />
        </Panel>
        <Panel title="iPhone Duo" subtitle="Hello, hello." cta="Shop iPhone" onShop={() => onShop('iPhone')}>
          <FilmVideo src={VIDEOS.iphoneDuo} poster={POSTERS.iphoneDuo} alt="iPhone Duo" />
        </Panel>
      </div>

      <Panel title={<>iPad Air. Built for Apple Intelligence.<sup>1</sup></>} cta="Shop iPad" onShop={() => onShop('iPad')}>
        <FilmVideo src={VIDEOS.ipadAir} poster={POSTERS.ipadAir} alt="iPad Air" />
      </Panel>

      <div className="apple-home-pair">
        <Panel dark title="MacBook Pro 14″" subtitle="Fast runs in the family." cta="Shop Mac" onShop={() => onShop('Mac')}>
          <LoopVideo src={VIDEOS.macbookPro14} poster={POSTERS.macbookPro} alt="MacBook Pro 14-inch" />
        </Panel>
        <Panel title="Welcome, Apple HomeView." subtitle={<ApplePreorderBadge inline />} cta="Shop HomeView" onShop={() => onShop('HomeView')}>
          <LoopVideo src={VIDEOS.homeView} poster={POSTERS.homeView} alt="Apple HomeView" />
        </Panel>
      </div>

      <section style={{ padding: '44px 0 8px' }}>
        <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 36px)', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 20px', color: H.black }}>Shop by product</h2>
        <div className="apple-home-tiles">
          {CATEGORY_TILES.map(tile => (
            <button
              key={tile.key}
              className="apple-home-tile"
              onClick={() => onShop(tile.key)}
              style={{
                position: 'relative',
                background: H.white, border: 'none', borderRadius: 18, padding: '24px 18px 20px', cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, overflow: 'hidden',
              }}
            >
              {tile.preorder && <ApplePreorderBadge />}
              <span style={{ height: 130, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={tile.image} alt="" loading="lazy" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.3s ease' }} />
              </span>
              <span style={{ fontSize: 17, fontWeight: 600, color: H.black }}>{tile.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section style={{ background: H.white, borderRadius: 18, padding: '32px 28px', marginTop: 12 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', margin: '0 0 8px', color: H.black }}>Shop with Confidence!</h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: H.grey, margin: 0, maxWidth: 720 }}>
          Our team will confirm product availability and keep you informed throughout your order. If an item is temporarily out of stock, we'll gladly assist with a special order or a suitable alternative.
        </p>
      </section>

      <p style={{ fontSize: 12, lineHeight: 1.5, color: H.grey, margin: '16px 0 0' }}>
        <sup>1</sup> Apple Intelligence is available in beta. Some features may not be available in all regions or languages. For feature and language availability and system requirements, see support.apple.com/en-za/121115.
      </p>
    </div>
  )
}
