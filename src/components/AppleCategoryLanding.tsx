import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { isApplePreorder } from '../lib/appleCatalogue'
import { applePrice } from '../lib/appleFormat'
import { appleHref, normaliseSub } from '../lib/appleQuery'
import type { AppleProduct } from '../lib/appleTypes'
import ApplePreorderBadge from './ApplePreorderBadge'
import { AppleFilm } from './apple/AppleFilm'
import { AppleLinkButton } from './apple/AppleButton'

// ═══════════════════════════════════════════════════════════════════════════
// EDIT THIS CONFIG to change the landing page content — no code knowledge
// needed. Each tile's `sub` must match a category_sub value in the
// core_products table (capitals don't matter). `image` can be a web link (paste
// an image address), a file in your public folder (starting with
// /enterprice-images/...), or empty to use the range image.
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

const MAC_HERO_IMAGE = '/images/apple-imagies/MacBook_Pro_14.jpg'
const IPHONE_HERO_IMAGE = '/images/apple-products/iphone-18-pro/iphone-18-pro-silver-1.jpg'
const IPAD_HERO_IMAGE = '/images/apple-imagies/iPad/iPad_Pro_11-in_M5.webp'
const AIRPODS_HERO_IMAGE = '/images/apple-imagies/AirPods/AirPods_Pro_3.webp'

const MACBOOK_AIR_IMAGE = '/images/apple-imagies/MacBook_Air.jpeg'
const MACBOOK_PRO_14_IMAGE = '/images/apple-imagies/MacBook_Pro_14.jpg'
const MACBOOK_PRO_16_IMAGE = '/images/apple-imagies/MacBook_Pro_16.jpg'
const IMAC_24_IMAGE = '/images/apple-imagies/iMac_24.jpeg'
const MAC_MINI_IMAGE = '/images/apple-imagies/Mac_mini.jpeg'
const MAC_STUDIO_IMAGE = '/images/apple-imagies/Mac_Studio.jpeg'
const STUDIO_DISPLAY_IMAGE = '/images/apple-imagies/Studio_Display.webp'
const MACBOOK_NEO_IMAGE = '/images/apple-imagies/MacBook_neo.webp'

const IPHONE_18_PRO_MAX_IMAGE = '/images/apple-products/iphone-18-pro/iphone-18-pro-max-silver-1.jpg'
const IPHONE_18_PRO_IMAGE = '/images/apple-products/iphone-18-pro/iphone-18-pro-silver-1.jpg'
const IPHONE_DUO_IMAGE = '/images/apple-home/iphone-duo.jpg'
const MACBOOK_PRO_XDR_IMAGE = '/images/apple-home/macbook-pro.jpg'
const IPHONE_17_PRO_MAX_IMAGE = '/images/apple-imagies/iPhone/iPhone_17_Pro_Max.jpg'
const IPHONE_17_PRO_IMAGE = '/images/apple-imagies/iPhone/iPhone_17_pro.jpg'
const IPHONE_17_IMAGE = '/images/apple-imagies/iPhone/iPhone_17.jpg'
const IPHONE_17E_IMAGE = '/images/apple-imagies/iPhone/iPhone_17.webp'
const IPHONE_AIR_IMAGE = '/images/apple-imagies/iPhone/iPhone_Air.jpg'
const IPHONE_16_IMAGE = '/images/apple-imagies/iPhone/iPhone_16.webp'
const IPHONE_16_PLUS_IMAGE = '/images/apple-imagies/iPhone/iPhone_16_Plus.webp'
const IPHONE_16E_IMAGE = '/images/apple-imagies/iPhone/iPhone_16e.webp'
const IPHONE_15_IMAGE = '/images/apple-imagies/iPhone/iPhone_15.webp'

const WATCH_SERIES_11_IMAGE = '/images/apple-imagies/apple-watch/Apple_Watch_Series_11.webp'
const WATCH_SE_3_IMAGE = '/images/apple-imagies/apple-watch/Apple_Watch_SE_3.webp'
const WATCH_ULTRA_3_IMAGE = '/images/apple-imagies/apple-watch/Apple_Watch_Ultra_3.webp'

const AIRPODS_PRO_3_IMAGE = '/images/apple-imagies/AirPods/AirPods_Pro_3.webp'
const AIRPODS_MAX_2_IMAGE = '/images/apple-imagies/AirPods/AirPods_Max_2.webp'
const AIRPODS_4_IMAGE = '/images/apple-imagies/AirPods/AirPods_4.webp'

const IPAD_LANDING: CategoryLandingConfig = {
  heroVideo:
    'https://core.co.za/cdn/shop/videos/c/vp/84926a051b284f16aa7400878fef7c00/84926a051b284f16aa7400878fef7c00.HD-1080p-7.2Mbps-81752485.mp4?v=0',
  heroImage: IPAD_HERO_IMAGE,
  headline: 'iPad',
  subheadline: 'Touch, draw, and type on one magical device.',
  tiles: [
    { sub: 'Ipad pro 13" m5', title: 'iPad Pro 13″ | M5', tagline: 'The ultimate iPad experience.', image: IPAD_HERO_IMAGE },
    { sub: 'Ipad pro 11" m5', title: 'iPad Pro 11″ | M5', tagline: 'Pro power. Portable size.', image: IPAD_HERO_IMAGE },
    { sub: 'Ipad air m4', title: 'iPad Air | M4', tagline: 'Take your office anywhere.', image: IPAD_HERO_IMAGE },
    { sub: 'Ipad air m2', title: 'iPad Air | M2', tagline: 'Serious performance. Superb value.', image: IPAD_HERO_IMAGE },
    { sub: 'Ipad (11th gen)', title: 'iPad | 11th Gen', tagline: 'Meet the magical, colourful iPad.', image: IPAD_HERO_IMAGE },
    { sub: 'Ipad mini a20', title: 'iPad mini | A20', tagline: 'The full iPad experience, in hand.', image: IPAD_HERO_IMAGE },
    { sub: 'Ipad mini 7', title: 'iPad mini | 7', tagline: 'The full iPad experience, in hand.', image: IPAD_HERO_IMAGE },
  ],
}

const IPHONE_LANDING: CategoryLandingConfig = {
  heroVideo:
    'https://core.co.za/cdn/shop/videos/c/vp/a74a607aba354fb39d92c279df00a8c7/a74a607aba354fb39d92c279df00a8c7.HD-1080p-7.2Mbps-81749787.mp4?v=0',
  heroImage: IPHONE_HERO_IMAGE,
  headline: 'iPhone',
  subheadline: 'Built for Apple Intelligence.',
  tiles: [
    { sub: 'Iphone 18 pro max', title: 'iPhone 18 Pro Max', tagline: 'Pro further.', image: IPHONE_18_PRO_MAX_IMAGE },
    { sub: 'Iphone 18 pro', title: 'iPhone 18 Pro', tagline: 'Pro further.', image: IPHONE_18_PRO_IMAGE },
    { sub: 'Iphone duo', title: 'iPhone Duo', tagline: 'Hello, hello.', image: IPHONE_DUO_IMAGE },
    { sub: 'Iphone 17 pro max', title: 'iPhone 17 Pro Max', tagline: 'The ultimate iPhone.', image: IPHONE_17_PRO_MAX_IMAGE },
    { sub: 'Iphone 17 pro', title: 'iPhone 17 Pro', tagline: 'Titanium. Pro cameras. Pro power.', image: IPHONE_17_PRO_IMAGE },
    { sub: 'Iphone 17', title: 'iPhone 17', tagline: 'A total powerhouse.', image: IPHONE_17_IMAGE },
    { sub: 'Iphone 17e', title: 'iPhone 17e', tagline: 'Serious capability. Serious value.', image: IPHONE_17E_IMAGE },
    { sub: 'Iphone air', title: 'iPhone Air', tagline: 'Impossibly thin. Incredibly capable.', image: IPHONE_AIR_IMAGE },
    { sub: 'Iphone 16', title: 'iPhone 16', tagline: 'A total powerhouse.', image: IPHONE_16_IMAGE },
    { sub: 'Iphone 16 plus', title: 'iPhone 16 Plus', tagline: 'Big and mighty.', image: IPHONE_16_PLUS_IMAGE },
    { sub: 'Iphone 16e', title: 'iPhone 16e', tagline: 'A lot to love.', image: IPHONE_16E_IMAGE },
    { sub: 'Iphone 15', title: 'iPhone 15', tagline: 'Loads to love. Even more to discover.', image: IPHONE_15_IMAGE },
  ],
}

const MAC_LANDING: CategoryLandingConfig = {
  heroVideo:
    'https://core.co.za/cdn/shop/videos/c/vp/33a44b35849141c38de94be93e36c024/33a44b35849141c38de94be93e36c024.HD-1080p-7.2Mbps-81748093.mp4?v=0',
  heroImage: MAC_HERO_IMAGE,
  headline: 'Mac',
  subheadline: "Supercharged for what's next.",
  tiles: [
    { sub: 'Macbook pro with proled xdr display', title: 'MacBook Pro | PROLED XDR', tagline: "The world's best laptop display.", image: MACBOOK_PRO_XDR_IMAGE },
    { sub: 'Macbook air m5', title: 'MacBook Air | M5', tagline: 'Strikingly thin. Remarkably capable.', image: MACBOOK_AIR_IMAGE },
    { sub: 'Macbook pro 14"', title: 'MacBook Pro 14″', tagline: 'Mind-blowing. Head-turning.', image: MACBOOK_PRO_14_IMAGE },
    { sub: 'Macbook pro 16"', title: 'MacBook Pro 16″', tagline: 'A beast of a laptop.', image: MACBOOK_PRO_16_IMAGE },
    { sub: 'Imac 24', title: 'iMac 24″', tagline: 'Allllll that. Plus a superfast M6 chip.', image: IMAC_24_IMAGE },
    { sub: 'Mac mini', title: 'Mac mini', tagline: 'More muscle. More hustle.', image: MAC_MINI_IMAGE },
    { sub: 'Mac studio', title: 'Mac Studio', tagline: 'Take a big step up.', image: MAC_STUDIO_IMAGE },
    { sub: 'Displays', title: 'Displays', tagline: 'The ultimate display companion.', image: STUDIO_DISPLAY_IMAGE },
    { sub: 'Macbook neo', title: 'MacBook Neo', tagline: 'A18 Pro power. Incredible price.', image: MACBOOK_NEO_IMAGE },
  ],
}

const WATCH_LANDING: CategoryLandingConfig = {
  heroVideo:
    'https://core.co.za/cdn/shop/videos/c/vp/e95cf57d268a4fd9b26e855020a6873b/e95cf57d268a4fd9b26e855020a6873b.HD-1080p-7.2Mbps-81753153.mp4?v=0',
  heroImage: WATCH_SERIES_11_IMAGE,
  headline: 'Apple Watch',
  subheadline: 'The ultimate device for a healthier life.',
  tiles: [
    { sub: 'Watch ultra 4', title: 'Apple Watch Ultra 4', tagline: 'Adventure at every altitude.', image: '' },
    { sub: 'Watch series 12', title: 'Apple Watch Series 12', tagline: 'The latest Apple Watch.', image: '' },
    { sub: 'Watch ultra 3', title: 'Apple Watch Ultra 3', tagline: 'Adventure at every altitude.', image: WATCH_ULTRA_3_IMAGE },
    { sub: 'Watch series 11', title: 'Apple Watch Series 11', tagline: 'Smarter. Brighter. Mightier.', image: WATCH_SERIES_11_IMAGE },
    { sub: 'Watch se 3', title: 'Apple Watch SE 3', tagline: 'A big step up. A great value.', image: WATCH_SE_3_IMAGE },
  ],
}

const AIRPODS_LANDING: CategoryLandingConfig = {
  heroVideo:
    'https://core.co.za/cdn/shop/videos/c/vp/4e917baa54024dd5a8e7c8dcd14cab59/4e917baa54024dd5a8e7c8dcd14cab59.HD-1080p-7.2Mbps-81750794.mp4?v=0',
  heroImage: AIRPODS_HERO_IMAGE,
  headline: 'AirPods',
  subheadline: 'Wireless audio. Perfected.',
  tiles: [
    { sub: 'Airpods pro', title: 'AirPods Pro', tagline: 'Adaptive Audio. Now even smarter.', image: AIRPODS_PRO_3_IMAGE },
    { sub: 'Airpods', title: 'AirPods', tagline: 'Effortless. Magical. AirPods.', image: AIRPODS_4_IMAGE },
    { sub: 'Airpods max 2', title: 'AirPods Max 2', tagline: 'Computational audio. Reimagined.', image: AIRPODS_MAX_2_IMAGE },
  ],
}

export const LANDING_CONFIGS: Record<string, CategoryLandingConfig> = {
  iPad: IPAD_LANDING,
  iPhone: IPHONE_LANDING,
  Mac: MAC_LANDING,
  AirPods: AIRPODS_LANDING,
  Watch: WATCH_LANDING,
}

interface ModelSummary {
  count: number
  minPrice: number | null
}

/**
 * The range landing page: one bounded film, then the models in that range with
 * the number of configurations and the lowest price actually in the catalogue.
 */
export default function AppleCategoryLanding({
  config,
  category,
  products,
}: {
  config: CategoryLandingConfig
  category: string
  products: AppleProduct[]
}) {
  const models = useMemo(() => {
    const summary = new Map<string, ModelSummary>()
    for (const product of products) {
      const key = normaliseSub(product.category_sub)
      if (!key) continue
      const current = summary.get(key) ?? { count: 0, minPrice: null }
      current.count += 1
      const price = Number(product.price_display) || 0
      if (price > 0) current.minPrice = current.minPrice === null ? price : Math.min(current.minPrice, price)
      summary.set(key, current)
    }
    return summary
  }, [products])

  const priced = products.map((product) => Number(product.price_display)).filter((price) => price > 0)
  const fromPrice = priced.length ? Math.min(...priced) : null

  return (
    <div>
      <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:gap-10">
        <div>
          <h1 className="font-display text-[32px] font-semibold leading-[38px] tracking-[-0.02em] text-apple-ink md:text-[40px] md:leading-[46px]">
            {config.headline}
          </h1>
          <p className="mt-1.5 text-[15px] leading-[22px] text-apple-muted">{config.subheadline}</p>

          {(products.length > 0 || fromPrice !== null) && (
            <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-apple-ink-2">
              {products.length > 0 && (
                <span>
                  {products.length} {products.length === 1 ? 'configuration' : 'configurations'}
                </span>
              )}
              {fromPrice !== null && <span>From {applePrice(fromPrice)}</span>}
            </p>
          )}

          <div className="mt-6">
            <AppleLinkButton to={appleHref({ cat: category, view: 'shop' })} variant="secondary" size="sm">
              Browse all {config.headline}
            </AppleLinkButton>
          </div>
        </div>

        {/* The range stills are square product shots, so a square frame shows
            them whole without cropping or leaving a coloured border. */}
        <AppleFilm
          src={config.heroVideo}
          poster={config.heroImage}
          alt={`${config.headline} film`}
          posterFit="contain"
          frameClassName="aspect-square w-full"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {config.tiles.map((tile) => {
          const summary = models.get(normaliseSub(tile.sub))
          // An empty image shows the tile without a picture, never a different model's.
          const image = tile.image
          const count = summary?.count ?? 0
          const minPrice = summary?.minPrice ?? null

          return (
            <Link
              key={tile.sub}
              to={appleHref({ cat: category, sub: tile.sub, view: 'shop' })}
              className="group relative flex flex-col rounded-[18px] bg-apple-surface p-6 transition-colors hover:bg-apple-surface-2"
            >
              {isApplePreorder(tile.title) && <ApplePreorderBadge />}

              <span className="flex h-[150px] items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt={tile.title}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <span className="text-[12px] text-apple-muted">Pictures coming soon</span>
                )}
              </span>

              <span className="mt-5 text-[17px] font-medium leading-[23px] text-apple-ink">{tile.title}</span>
              <span className="mt-1 text-[13px] leading-[18px] text-apple-muted">{tile.tagline}</span>

              <span className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-apple-line-2 pt-4">
                <span className="flex flex-wrap items-baseline gap-x-2 text-[12px] text-apple-muted">
                  {count > 0 && (
                    <span>
                      {count} {count === 1 ? 'configuration' : 'configurations'}
                    </span>
                  )}
                  {minPrice !== null && <span>From {applePrice(minPrice)}</span>}
                </span>
                <span className="text-[13px] text-apple-blue">View configurations</span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
