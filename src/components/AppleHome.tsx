import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import ApplePreorderBadge from './ApplePreorderBadge'
import { AppleFilm } from './apple/AppleFilm'
import { AppleLinkButton } from './apple/AppleButton'
import { appleHref } from '../lib/appleQuery'

// The Apple home page: products and films first, with the shop one click away.
// Headlines come from Apple's reseller copy documents, so keep them word for word.

const VIDEO_BASE = 'https://core.co.za/cdn/shop/videos/c/vp'
const video = (id: string, version: string) =>
  `${VIDEO_BASE}/${id}/${id}.HD-1080p-7.2Mbps-${version}.mp4?v=0`

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
  { key: 'iPad', label: 'iPad', image: '/images/apple-imagies/iPad/iPad_Pro_11-in_M5.webp' },
  { key: 'Watch', label: 'Apple Watch', image: '/images/apple-imagies/apple-watch/Apple_Watch_Series_11.webp' },
  { key: 'AirPods', label: 'AirPods', image: '/images/apple-imagies/AirPods/AirPods_Pro_3.webp' },
  {
    key: 'HomePod',
    label: 'HomePod',
    image:
      '/images/apple-imagies/HomePod_mini_Blue_PDP_Image_Position-5__WWEN_511da05e-c37d-46b6-940f-d66dff94ee4f_5000x.webp',
    preorder: true,
  },
  { key: 'HomeView', label: 'HomeView', image: '/images/apple-products/homeview/rose-pink-front.webp', preorder: true },
  { key: 'Accessories', label: 'Accessories', image: '' },
]

function Panel({
  dark = false,
  title,
  subtitle,
  cta,
  ctaHref,
  children,
}: {
  dark?: boolean
  title: ReactNode
  subtitle?: ReactNode
  cta: string
  ctaHref: string
  children: ReactNode
}) {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded-[18px] ${
        dark ? 'bg-black text-white' : 'bg-apple-surface text-apple-ink'
      }`}
    >
      <div className="px-6 pb-6 pt-10 text-center md:px-10">
        <h2 className="font-display text-[26px] font-semibold leading-[32px] tracking-[-0.01em] md:text-[32px] md:leading-[38px]">
          {title}
        </h2>
        {subtitle && (
          <p className={`mt-2 text-[15px] leading-[22px] ${dark ? 'text-white/70' : 'text-apple-muted'}`}>{subtitle}</p>
        )}
        <div className="mt-5">
          <AppleLinkButton to={ctaHref} size="sm">
            {cta}
          </AppleLinkButton>
        </div>
      </div>
      <div className="mt-auto">{children}</div>
    </section>
  )
}

export default function AppleHome({ counts = {} }: { counts?: Record<string, number> }) {
  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-[18px] bg-black text-white">
        <div className="grid items-center gap-6 px-6 pb-6 pt-10 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-10 md:px-12 md:pb-10">
          <div className="max-w-[440px] text-center md:text-left">
            <h1 className="font-display text-[36px] font-semibold leading-[40px] tracking-[-0.02em] md:text-[44px] md:leading-[48px]">
              MacBook Pro
            </h1>
            <p className="mt-1 text-[17px] leading-[24px] text-white/70 md:text-[19px]">PROLED XDR Display</p>
            <div className="mt-4">
              <ApplePreorderBadge inline />
            </div>
            <div className="mt-6">
              <AppleLinkButton to={appleHref({ cat: 'Mac' })}>Shop Mac</AppleLinkButton>
            </div>
          </div>
          <AppleFilm
            src={VIDEOS.macbookProXdr}
            poster={POSTERS.macbookPro}
            alt="MacBook Pro with PROLED XDR Display"
            frameClassName="h-[220px] md:h-[320px]"
            autoplay
          />
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="iPhone 18 Pro" subtitle="Pro further." cta="Shop iPhone" ctaHref={appleHref({ cat: 'iPhone' })}>
          <div className="flex h-[220px] items-end justify-center px-6 pb-6 md:h-[280px] md:px-10">
            <img
              src="/images/apple-products/iphone-18-pro/iphone-18-pro-silver-1.jpg"
              alt="iPhone 18 Pro in Silver"
              loading="lazy"
              decoding="async"
              className="max-h-full w-auto object-contain"
            />
          </div>
        </Panel>

        <Panel title="iPhone Duo" subtitle="Hello, hello." cta="Shop iPhone" ctaHref={appleHref({ cat: 'iPhone' })}>
          <div className="px-6 pb-6 md:px-10">
            <AppleFilm
              src={VIDEOS.iphoneDuo}
              poster={POSTERS.iphoneDuo}
              alt="iPhone Duo"
              frameClassName="h-[190px] md:h-[250px]"
            />
          </div>
        </Panel>
      </div>

      <Panel title={<>iPad Air. Built for Apple Intelligence.<sup>1</sup></>} cta="Shop iPad" ctaHref={appleHref({ cat: 'iPad' })}>
        <div className="px-6 pb-6 md:px-10">
          <AppleFilm src={VIDEOS.ipadAir} poster={POSTERS.ipadAir} alt="iPad Air" frameClassName="h-[200px] md:h-[300px]" />
        </div>
      </Panel>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel
          dark
          title="MacBook Pro 14″"
          subtitle="Fast runs in the family."
          cta="Shop Mac"
          ctaHref={appleHref({ cat: 'Mac' })}
        >
          <div className="px-6 pb-6 md:px-10">
            <AppleFilm
              src={VIDEOS.macbookPro14}
              poster={POSTERS.macbookPro}
              alt="MacBook Pro 14-inch"
              frameClassName="h-[190px] md:h-[250px]"
            />
          </div>
        </Panel>

        <Panel
          title="Welcome, Apple HomeView."
          subtitle={<ApplePreorderBadge inline />}
          cta="Shop HomeView"
          ctaHref={appleHref({ cat: 'HomeView' })}
        >
          <div className="px-6 pb-6 md:px-10">
            <AppleFilm
              src={VIDEOS.homeView}
              poster={POSTERS.homeView}
              alt="Apple HomeView"
              frameClassName="h-[190px] md:h-[250px]"
            />
          </div>
        </Panel>
      </div>

      <section className="pt-10">
        <h2 className="font-display text-[24px] font-semibold leading-[30px] tracking-[-0.01em] text-apple-ink md:text-[28px]">
          Shop by product
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {CATEGORY_TILES.map((tile) => {
            const count = counts[tile.key] ?? 0
            return (
              <Link
                key={tile.key}
                to={appleHref({ cat: tile.key })}
                className="group relative flex flex-col rounded-[18px] bg-apple-surface px-4 pb-5 pt-5 transition-colors hover:bg-apple-surface-2"
              >
                {tile.preorder && <ApplePreorderBadge />}
                <span className="flex h-[110px] items-center justify-center">
                  {tile.image ? (
                    <img
                      src={tile.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="text-[12px] text-apple-muted">View range</span>
                  )}
                </span>
                <span className="mt-4 text-[15px] font-medium text-apple-ink">{tile.label}</span>
                {count > 0 && (
                  <span className="mt-0.5 text-[12px] text-apple-muted">
                    {count} {count === 1 ? 'configuration' : 'configurations'}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mt-10 border-t border-apple-line pt-10">
        <h2 className="font-display text-[22px] font-semibold leading-[28px] text-apple-ink">Shop with Confidence</h2>
        <p className="mt-3 max-w-[80ch] text-[14px] leading-[22px] text-apple-ink-2">
          Our team will confirm product availability and keep you informed throughout your order. If an item is
          temporarily out of stock, we’ll gladly assist with a special order or a suitable alternative.
        </p>
      </section>

      <p className="mt-8 text-[12px] leading-[18px] text-apple-muted">
        <sup>1</sup> Apple Intelligence is available in beta. Some features may not be available in all regions or
        languages. For feature and language availability and system requirements, see
        support.apple.com/en-za/121115.
      </p>
    </div>
  )
}
