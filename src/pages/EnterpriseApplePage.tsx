import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, X, Package, Apple as AppleIcon } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { canUseApple, withAppleReturn } from '../lib/appleAccess'
import { APPLE_QUOTE_TERMS, appleDeliveryNotes, fetchAppleCounts, fetchAppleProducts, isApplePreorder, submitAppleQuote } from '../lib/appleCatalogue'
import ApplePreorderBadge from '../components/ApplePreorderBadge'
import { useAppleBuying } from '../lib/useAppleBuying'
import { MAX_QUOTE_QTY, useAppleQuoteStore, type AppleQuoteItem } from '../lib/appleQuoteStore'
import AppleCategoryLanding, { LANDING_CONFIGS } from '../components/AppleCategoryLanding'
import AppleRangeDisclaimers from '../components/AppleRangeDisclaimers'
import AppleHome from '../components/AppleHome'

// ── Types ──────────────────────────────────────────────────────────────────
const APPLE_LOGO = '/enterprice-images/apple.com-logo.png'
interface AppleProduct {
  id: string
  sku: string
  name: string
  category_main: string
  category_sub: string
  rrp_inc_vat: number
  price_display: number
  status: string
  specs: Record<string, string> | null
  thumbnail_url: string | null
  image_urls: string[] | null
}

// ── Apple brand tokens ─────────────────────────────────────────────────────
const A = {
  white:    '#ffffff',
  offwhite: '#f5f5f7',
  grey100:  '#e8e8ed',
  grey300:  '#6e6e73',
  grey500:  '#3a3a3c',
  black:    '#1d1d1f',
  blue:     '#0071e3',
  blueHov:  '#0077ed',
  green:    '#1d8348',
  red:      '#ff3b30',
}

// ── Category config ────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    key: 'Mac',
    label: 'Mac',
    tagline: 'Supercharged for what\'s next.',
    hero: '/enterprice-images/ARP100_Desktop Banner.png',
    color: '#1d1d1f',
    bg: '#f5f5f7',
  },
  {
    key: 'iPhone',
    label: 'iPhone',
    tagline: 'Built for Apple Intelligence.',
    hero: '/enterprice-images/ARP059_iPhone 17.png',
    color: '#1d1d1f',
    bg: '#ffffff',
  },
  {
    key: 'iPad',
    label: 'iPad',
    tagline: 'Loveable. Drawable. Magical.',
    hero: '/enterprice-images/ARP068_iPad Pro M5 Chip.png',
    color: '#1d1d1f',
    bg: '#f5f5f7',
  },
  {
    key: 'Watch',
    label: 'Apple Watch',
    tagline: 'The ultimate device for a healthier life.',
    hero: '/enterprice-images/ARP057_Q4_25 _ Apple Watch Series 11.png',
    color: '#1d1d1f',
    bg: '#ffffff',
  },
  {
    key: 'AirPods',
    label: 'AirPods',
    tagline: 'Wireless audio. Perfected.',
    hero: null,
    color: '#1d1d1f',
    bg: '#f5f5f7',
  },
  {
    key: 'Accessories',
    label: 'Accessories',
    tagline: 'Everything you need to do more.',
    hero: '/images/apple-imagies/ARP100_Desktop Banner.png',
    color: '#1d1d1f',
    bg: '#ffffff',
  },
  {
    key: 'HomePod',
    label: 'HomePod',
    tagline: 'Profound sound. Smart home control.',
    hero: null,
    color: '#1d1d1f',
    bg: '#f5f5f7',
  },
  {
    key: 'HomeView',
    label: 'HomeView',
    tagline: 'Welcome, Apple HomeView.',
    hero: null,
    color: '#1d1d1f',
    bg: '#ffffff',
  },
  {
    key: 'Apple TV',
    label: 'Apple TV',
    tagline: 'Your TV experience, elevated.',
    hero: null,
    color: '#1d1d1f',
    bg: '#ffffff',
  },
]

// ── Responsive overrides (inline-style page, so media queries live here) ───
const RESPONSIVE_CSS = `
.ent-tabbar::-webkit-scrollbar { display: none; }
@media (max-width: 480px) {
  .ent-portal-label { display: none; }
  .ent-product-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; gap: 12px !important; }
}
@media (max-width: 640px) {
  .ent-header-row { flex-wrap: wrap; row-gap: 10px; }
  .ent-search-input { font-size: 16px !important; padding: 12px 16px 12px 36px !important; }
  .ent-colour-swatch { width: 32px !important; height: 32px !important; }
  .ent-storage-btn, .ent-status-select { min-height: 44px !important; }
  .ent-tab-btn { min-height: 44px !important; display: inline-flex !important; align-items: center; }
  .ent-quote-btn { min-height: 44px !important; }
  .ent-quote-sidebar {
    top: auto !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
    width: 100% !important; max-height: 85vh !important;
    border-radius: 20px 20px 0 0 !important;
    box-shadow: 0 -4px 32px rgba(0,0,0,0.16) !important;
  }
}
`

// ── Format helpers ─────────────────────────────────────────────────────────
const fmt = (n: number) =>
  `R\u00a0${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function cleanName(name: string): string {
  // Shorten long product names for display
  return name
    .replace(/^(\d+)-INCH\s+/i, '')
    .replace(/\s+WITH\s+RETINA.+?DISPLAY/i, '')
    .replace(/\s*-\s*[A-Z]{2}$/, '')
    .replace(/\s+WI-FI(\s+\+\s+CELLULAR)?/i, (m) => m.includes('CELLULAR') ? ' Wi-Fi + Cellular' : ' Wi-Fi')
    .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    .replace('Homeview', 'HomeView')
    .replace('Homepod', 'HomePod')
    .replace('Imac', 'iMac')
}

function getSubtitle(product: AppleProduct): string {
  const specs = product.specs || {}
  const parts: string[] = []
  if (specs.chip) parts.push(specs.chip)
  if (specs.ram) parts.push(specs.ram)
  if (specs.storage) parts.push(specs.storage)
  if (specs.colour && !specs.chip) parts.push(specs.colour)
  if (specs.screen_size) parts.push(specs.screen_size + ' display')
  return parts.slice(0, 2).join(' · ')
}

// ── Product image via Core/Apple CDN lookup ────────────────────────────────
function AppleProductImage({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  const [imgError, setImgError] = useState(false)

  if (imageUrl && !imgError) {
    return (
      <div style={{
        width: '100%', aspectRatio: '1/1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: A.offwhite, borderRadius: 12, overflow: 'hidden',
      }}>
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12, boxSizing: 'border-box' }}
        />
      </div>
    )
  }

  return (
    <div style={{
      width: '100%', aspectRatio: '1/1',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: A.offwhite, borderRadius: 12,
    }}>
      <img
        src={APPLE_LOGO}
        alt={name}
        loading="lazy"
        style={{ width: '38%', maxWidth: 90, opacity: 0.3, objectFit: 'contain' }}
      />
    </div>
  )
}

// ── Product card — Apple style ─────────────────────────────────────────────
function AppleProductCard({ product, onBuy, onAddToQuote }: {
  product: AppleProduct
  onBuy: (p: AppleProduct) => void
  onAddToQuote: (p: AppleProduct) => void
}) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  const displayName = cleanName(product.name)
  const subtitle = getSubtitle(product)
  const preorder = isApplePreorder(product.name)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/enterprise/apple/${product.id}`)}
      style={{
        background: A.white,
        borderRadius: 18,
        padding: '28px 24px 24px',
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
        transition: 'box-shadow 0.3s ease, transform 0.2s ease',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-4px)' : 'none',
      }}
    >
      {/* Product image */}
      <div style={{ position: 'relative' }}>
        <AppleProductImage imageUrl={product.thumbnail_url || product.image_urls?.[0] || null} name={product.name} />
        {preorder && <ApplePreorderBadge />}
      </div>

      {/* Info */}
      <div style={{ marginTop: 20, flex: 1 }}>
        {/* Status badge */}
        {product.status === 'while_stocks_last' && (
          <div style={{
            display: 'inline-block', fontSize: 11, fontWeight: 600,
            color: A.red, marginBottom: 6,
          }}>
            While Stocks Last
          </div>
        )}

        <div style={{
          fontSize: 15, fontWeight: 600,
          color: A.black, lineHeight: 1.3, marginBottom: 6,
          letterSpacing: '-0.01em',
        }}>
          {displayName}
        </div>

        {subtitle && (
          <div style={{ fontSize: 13, color: A.grey300, marginBottom: 8, lineHeight: 1.4 }}>
            {subtitle}
          </div>
        )}

        <div style={{ fontSize: 11, color: A.grey300, marginBottom: 12, fontFamily: 'monospace' }}>
          {product.sku}
        </div>

        <div style={{ fontSize: 18, fontWeight: 700, color: A.black, letterSpacing: '-0.02em', marginBottom: 16 }}>
          {fmt(product.price_display)}
          <span style={{ fontSize: 12, fontWeight: 400, color: A.grey300, marginLeft: 4 }}>incl. VAT</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={(e) => { e.stopPropagation(); if (preorder) onAddToQuote(product); else onBuy(product) }}
          style={{
            width: '100%', padding: '10px 0',
            background: A.blue, color: A.white,
            border: 'none', borderRadius: 980,
            fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            letterSpacing: '-0.01em',
          }}
        >
          {preorder ? 'Pre-order' : 'Buy'}
        </button>
        {!preorder && (
          <button
            onClick={(e) => { e.stopPropagation(); onAddToQuote(product) }}
            style={{
              width: '100%', padding: '10px 0',
              background: A.offwhite, color: A.blue,
              border: 'none', borderRadius: 980,
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '-0.01em',
            }}
          >
            Add to Quote
          </button>
        )}
      </div>
    </div>
  )
}

// ── Category hero ──────────────────────────────────────────────────────────
function CategoryHero({ cat, productCount }: { cat: typeof CATEGORIES[0]; productCount: number }) {
  return (
    <div style={{
      width: '100%', borderRadius: 20,
      overflow: 'hidden', marginBottom: 48,
      background: cat.bg,
      position: 'relative',
      minHeight: cat.hero ? 0 : 200,
    }}>
      {cat.hero ? (
        <img
          src={cat.hero}
          alt={cat.label}
          style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 420 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      ) : (
        <div style={{
          padding: '64px 48px',
          background: `linear-gradient(135deg, ${cat.bg} 0%, #e8e8ed 100%)`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: A.blue, marginBottom: 12, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Apple {cat.label}
          </div>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 700, color: cat.color, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 12 }}>
            {cat.label}
          </h2>
          <p style={{ fontSize: 18, color: A.grey300, fontWeight: 400 }}>{cat.tagline}</p>
        </div>
      )}
      <div style={{
        position: cat.hero ? 'absolute' : 'relative',
        bottom: cat.hero ? 20 : 0,
        right: cat.hero ? 20 : 0,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        borderRadius: 980,
        padding: '6px 14px',
        fontSize: 12, fontWeight: 600, color: A.black,
        display: 'inline-block',
        margin: cat.hero ? 0 : '0 48px 24px',
      }}>
        {productCount} products
      </div>
    </div>
  )
}

// ── Filter bar ─────────────────────────────────────────────────────────────
function FilterBar({
  products, filters, setFilters,
}: {
  products: AppleProduct[]
  filters: { search: string; colour: string; storage: string; status: string }
  setFilters: (f: any) => void
}) {
  const colours = [...new Set(products.map(p => p.specs?.colour).filter(Boolean))].sort()
  const storages = [...new Set(products.map(p => p.specs?.storage).filter(Boolean))].sort()

  const COLOUR_MAP: Record<string, string> = {
    'Black': '#1d1d1f', 'Silver': '#e3e4e5', 'Midnight': '#2b2d30',
    'Starlight': '#f2e8d9', 'Space Grey': '#8e8e93', 'Blue': '#4a90d9',
    'Pink': '#f2a7c3', 'Yellow': '#f5d547', 'Green': '#3e7c57',
    'Purple': '#7b5ea7', 'Red': '#c41230', 'White': '#f5f5f7',
    'Gold': '#c8a97e', 'Sky Blue': '#87ceeb', 'Natural Titanium': '#c4b9a8',
    'Black Titanium': '#3a3a3c', 'White Titanium': '#e5e5e7', 'Desert Titanium': '#d4b896',
  }

  return (
    <div className="ent-filterbar" style={{
      display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
      marginBottom: 32, padding: '16px 20px',
      background: A.white, borderRadius: 12,
      border: `1px solid ${A.grey100}`,
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: '1 1 200px' }}>
        <input
          className="ent-search-input"
          type="text"
          placeholder="Search products…"
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })}
          style={{
            width: '100%', padding: '9px 16px 9px 36px',
            border: `1px solid ${A.grey100}`, borderRadius: 980,
            fontSize: 14, outline: 'none', color: A.black,
            background: A.offwhite, fontFamily: 'inherit',
            boxSizing: 'border-box',
          }}
        />
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: A.grey300, display: 'flex' }}><Search size={15} /></span>
      </div>

      {/* Colour filter */}
      {colours.length > 0 && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {colours.slice(0, 10).map(colour => (
            <button
              key={colour}
              className="ent-colour-swatch"
              title={colour}
              onClick={() => setFilters({ ...filters, colour: filters.colour === colour ? '' : colour })}
              style={{
                width: 22, height: 22, borderRadius: '50%',
                background: COLOUR_MAP[colour!] || '#999',
                border: filters.colour === colour ? `2px solid ${A.blue}` : `2px solid ${A.grey100}`,
                cursor: 'pointer', outline: 'none',
                boxShadow: filters.colour === colour ? `0 0 0 2px ${A.white}, 0 0 0 4px ${A.blue}` : 'none',
                transition: 'box-shadow 0.15s',
              }}
            />
          ))}
          {filters.colour && (
            <button onClick={() => setFilters({ ...filters, colour: '' })}
              style={{ fontSize: 12, color: A.blue, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Clear
            </button>
          )}
        </div>
      )}

      {/* Storage filter */}
      {storages.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {storages.map(storage => (
            <button
              key={storage}
              className="ent-storage-btn"
              onClick={() => setFilters({ ...filters, storage: filters.storage === storage ? '' : storage! })}
              style={{
                padding: '5px 12px', borderRadius: 980, fontSize: 12, fontWeight: 500,
                border: `1px solid ${filters.storage === storage ? A.blue : A.grey100}`,
                background: filters.storage === storage ? A.blue : A.white,
                color: filters.storage === storage ? A.white : A.black,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {storage}
            </button>
          ))}
        </div>
      )}

      {/* Status filter */}
      <select
        className="ent-status-select"
        value={filters.status}
        onChange={e => setFilters({ ...filters, status: e.target.value })}
        style={{
          padding: '8px 12px', borderRadius: 980, fontSize: 13,
          border: `1px solid ${A.grey100}`, background: A.white,
          color: A.black, outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <option value="">All products</option>
        <option value="active">In stock</option>
        <option value="while_stocks_last">While stocks last</option>
      </select>
    </div>
  )
}

// ── Quote sidebar ──────────────────────────────────────────────────────────
interface QuoteContact {
  name: string
  phone: string
  organisation: string
  notes: string
}

const quoteField: React.CSSProperties = {
  width: '100%', padding: '10px 12px', marginBottom: 8, boxSizing: 'border-box',
  border: `1px solid ${A.grey100}`, borderRadius: 10,
  fontSize: 14, fontFamily: 'inherit', color: A.black, background: A.white,
}

const quoteQtyBtn: React.CSSProperties = {
  width: 28, height: 28, border: 'none', borderRadius: 8,
  background: A.offwhite, color: A.black,
  fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
}

function QuoteSidebar({
  items, reference, customerEmailed, submitting, error, contact, onContactChange, onQtyChange, onRemove, onSubmit, onClose,
}: {
  items: AppleQuoteItem[]
  reference: string | null
  customerEmailed: boolean
  submitting: boolean
  error: string
  contact: QuoteContact
  onContactChange: (contact: QuoteContact) => void
  onQtyChange: (id: string, qty: number) => void
  onRemove: (id: string) => void
  onSubmit: () => void
  onClose: () => void
}) {
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const canSubmit = items.length > 0 && !submitting && !!contact.name.trim() && !!contact.phone.trim()

  if (reference) {
    return (
      <div className="ent-quote-sidebar" style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
        background: A.white, boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
        zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 32, boxSizing: 'border-box',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
      }}>
        <div style={{ fontSize: 22, fontWeight: 600, color: A.black, marginBottom: 8 }}>Shop with Confidence!</div>
        <p style={{ fontSize: 14, color: A.grey500, lineHeight: 1.6, margin: '0 0 24px' }}>
          Our team will confirm product availability and keep you informed throughout your order. If an item is temporarily out of stock, we'll gladly assist with a special order or a suitable alternative.
        </p>
        <div style={{ fontSize: 15, fontWeight: 600, color: A.black, marginBottom: 6 }}>Quote request received</div>
        <p style={{ fontSize: 14, color: A.grey300, lineHeight: 1.6, margin: '0 0 24px' }}>
          Your reference is <strong style={{ color: A.black }}>{reference}</strong>.{customerEmailed && " We've emailed you a copy."}
        </p>
        <button onClick={onClose} style={{
          width: '100%', padding: '14px 0', borderRadius: 980, background: A.blue, color: A.white,
          border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Done
        </button>
      </div>
    )
  }

  return (
    <div className="ent-quote-sidebar" style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
      background: A.white, boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 16px', borderBottom: `1px solid ${A.grey100}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: A.black }}>Quote Request</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: A.grey300, display: 'flex' }}><X size={20} /></button>
      </div>

      {/* Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: A.grey300, fontSize: 14 }}>
            No products added yet
          </div>
        ) : (
          <>
            {items.map((item) => (
              <div key={item.id} style={{
                display: 'flex', gap: 12, paddingBottom: 16, marginBottom: 16,
                borderBottom: `1px solid ${A.grey100}`,
              }}>
                <div style={{ width: 56, height: 56, background: A.offwhite, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: A.grey300, overflow: 'hidden' }}>
                  {item.image
                    ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <Package size={24} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: A.black, marginBottom: 2, lineHeight: 1.3 }}>
                    {cleanName(item.name)}
                  </div>
                  <div style={{ fontSize: 11, color: A.grey300, marginBottom: 4 }}>{item.sku}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: A.black, marginBottom: 8 }}>{fmt(item.price)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button aria-label={`Reduce quantity of ${cleanName(item.name)}`} onClick={() => onQtyChange(item.id, item.qty - 1)} style={quoteQtyBtn}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                    <button aria-label={`Increase quantity of ${cleanName(item.name)}`} disabled={item.qty >= MAX_QUOTE_QTY} onClick={() => onQtyChange(item.id, item.qty + 1)} style={quoteQtyBtn}>+</button>
                  </div>
                </div>
                <button aria-label={`Remove ${cleanName(item.name)}`} onClick={() => onRemove(item.id)}
                  style={{ background: 'none', border: 'none', color: A.grey300, cursor: 'pointer', padding: '0 4px', alignSelf: 'flex-start', display: 'flex' }}>
                  <X size={16} />
                </button>
              </div>
            ))}

            <div style={{ fontSize: 13, fontWeight: 600, color: A.black, marginBottom: 8 }}>Your details</div>
            <input aria-label="Your name" placeholder="Your name" autoComplete="name" value={contact.name}
              onChange={e => onContactChange({ ...contact, name: e.target.value })} style={quoteField} />
            <input aria-label="Phone number" placeholder="Phone number" type="tel" autoComplete="tel" value={contact.phone}
              onChange={e => onContactChange({ ...contact, phone: e.target.value })} style={quoteField} />
            <input aria-label="Organisation (optional)" placeholder="Organisation (optional)" autoComplete="organization" value={contact.organisation}
              onChange={e => onContactChange({ ...contact, organisation: e.target.value })} style={quoteField} />
            <textarea aria-label="Notes (optional)" placeholder="Notes (optional)" rows={3} value={contact.notes}
              onChange={e => onContactChange({ ...contact, notes: e.target.value })} style={{ ...quoteField, resize: 'vertical' }} />
          </>
        )}
      </div>

      {/* Total + CTA */}
      <div style={{ padding: '16px 24px 32px', borderTop: `1px solid ${A.grey100}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: A.grey300 }}>Estimated total</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: A.black }}>{fmt(total)}</span>
        </div>
        <p style={{ fontSize: 12, color: A.grey300, marginBottom: 16, lineHeight: 1.5 }}>
          All prices include VAT. {appleDeliveryNotes(items.map(i => i.name)).join(' ')} {APPLE_QUOTE_TERMS}
        </p>
        {error && (
          <p role="alert" style={{ fontSize: 13, color: A.red, marginBottom: 12, lineHeight: 1.4 }}>{error}</p>
        )}
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 980,
            background: canSubmit ? A.blue : A.grey100,
            color: canSubmit ? A.white : A.grey300,
            border: 'none', fontSize: 15, fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', letterSpacing: '-0.01em',
          }}
        >
          {submitting ? 'Sending…' : 'Submit Quote Request'}
        </button>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function EnterpriseApplePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('cat') || 'Mac'
  const setActiveCategory = (cat: string) => setSearchParams({ cat })
  const activeSub = searchParams.get('sub') || ''
  const setActiveSub = (sub: string) => {
    const next: Record<string, string> = { view: 'shop' }
    if (activeCategory !== 'Mac') next.cat = activeCategory
    if (sub) next.sub = sub
    setSearchParams(next)
  }
  const view = searchParams.get('view') || ''
  // No category chosen yet: show the Apple home page, not a shop.
  const showHome = !searchParams.get('cat') && !activeSub && !view
  const landingConfig = LANDING_CONFIGS[activeCategory]
  const showLanding = !!landingConfig && !activeSub && view !== 'shop'
  const [products, setProducts] = useState<AppleProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', colour: '', storage: '', status: '' })
  const quoteItems = useAppleQuoteStore(s => s.items)
  const setQuoteQty = useAppleQuoteStore(s => s.setQty)
  const removeQuoteItem = useAppleQuoteStore(s => s.removeItem)
  const clearQuote = useAppleQuoteStore(s => s.clear)
  const { user, session, profile } = useAuth()
  const { buy, addToQuote: addProductToQuote } = useAppleBuying()
  const [showQuote, setShowQuote] = useState(searchParams.get('quote') === 'open')
  const [contact, setContact] = useState<QuoteContact>({ name: '', phone: '', organisation: '', notes: '' })
  const [quoteReference, setQuoteReference] = useState<string | null>(null)
  const [quoteEmailed, setQuoteEmailed] = useState(false)
  const [submittingQuote, setSubmittingQuote] = useState(false)
  const [quoteError, setQuoteError] = useState('')
  const [toast, setToast] = useState('')
  const [counts, setCounts] = useState<Record<string, number>>({})

  // Load products for active category
  useEffect(() => {
    if (!showHome) loadProducts()
  }, [activeCategory, showHome])

  // Load category counts on mount
  useEffect(() => {
    loadCounts()
  }, [])

  const loadCounts = async () => {
    try {
      setCounts(await fetchAppleCounts())
    } catch (err) { console.error(err) }
  }

  const loadProducts = async () => {
    setLoading(true)
    setFilters({ search: '', colour: '', storage: '', status: '' })
    try {
      setProducts(await fetchAppleProducts<AppleProduct>(activeCategory))
    } catch (err) {
      console.error(err)
      setProducts([])
    }
    finally { setLoading(false) }
  }

  const filteredProducts = products.filter(p => {
    if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase()) && !p.sku.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (activeSub && p.category_sub?.toLowerCase() !== activeSub.toLowerCase()) return false
    if (filters.colour && p.specs?.colour !== filters.colour) return false
    if (filters.storage && p.specs?.storage !== filters.storage) return false
    if (filters.status && p.status !== filters.status) return false
    return true
  })

  const addToQuote = (product: AppleProduct) => {
    if (!addProductToQuote(product)) return
    showToast(`${cleanName(product.name)} added to quote`)
    setQuoteReference(null)
    setShowQuote(true)
  }

  // Fill in what we already know, without overwriting anything the customer typed.
  useEffect(() => {
    if (!profile) return
    setContact(c => ({
      ...c,
      name: c.name || profile.full_name || [profile.first_name, profile.last_name].filter(Boolean).join(' '),
      phone: c.phone || profile.phone || '',
      organisation: c.organisation || profile.org_name || '',
    }))
  }, [profile])

  const closeQuote = () => {
    setShowQuote(false)
    setQuoteReference(null)
    setQuoteError('')
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSubmitQuote = async () => {
    if (!user || !session || !canUseApple(profile)) {
      const here = `/enterprise/apple?${new URLSearchParams({ cat: activeCategory, view: 'shop', quote: 'open' })}`
      navigate(withAppleReturn('/enterprise/register', here))
      return
    }
    setSubmittingQuote(true)
    setQuoteError('')
    try {
      const { reference, customerEmailed } = await submitAppleQuote({
        accessToken: session.access_token,
        items: quoteItems.map(i => ({ product_id: i.id, qty: i.qty })),
        contactName: contact.name,
        contactPhone: contact.phone,
        organisation: contact.organisation,
        notes: contact.notes,
      })
      clearQuote()
      setContact(c => ({ ...c, notes: '' }))
      setQuoteReference(reference)
      setQuoteEmailed(customerEmailed)
    } catch (err) {
      setQuoteError(err instanceof Error ? err.message : 'We couldn\'t save your quote. Please try again.')
    } finally {
      setSubmittingQuote(false)
    }
  }

  const currentCat = CATEGORIES.find(c => c.key === activeCategory) || CATEGORIES[0]

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
      background: A.offwhite, minHeight: '100vh', color: A.black,
    }}>
      <style>{RESPONSIVE_CSS}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: A.black, color: A.white, padding: '12px 24px', borderRadius: 980,
          fontSize: 13, fontWeight: 500, zIndex: 2000, whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}

      {/* Category navigation — sticky Apple-style tab bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${A.grey100}`,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          {/* Header row */}
          <div className="ent-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={() => navigate('/enterprise/home')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 13, fontWeight: 500, color: A.grey300, padding: '6px 4px',
                }}
              >
                ← Enterprise
              </button>
              <div style={{ width: 1, height: 18, background: A.grey100 }} />
              <img src="/enterprice-images/Apple Reseller Program Logo.png" alt="Apple Reseller" style={{ height: 28 }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <span className="ent-portal-label" style={{ fontSize: 13, color: A.grey300, fontWeight: 400 }}>Enterprise</span>
            </div>
            <button
              className="ent-quote-btn"
              onClick={() => setShowQuote(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: quoteItems.length > 0 ? A.blue : A.offwhite,
                color: quoteItems.length > 0 ? A.white : A.grey300,
                border: 'none', borderRadius: 980, padding: '8px 16px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              Quote
              {quoteItems.length > 0 && (
                <span style={{
                  background: A.white, color: A.blue,
                  borderRadius: '50%', width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {quoteItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Category tabs */}
          <div className="ent-tabbar" style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
            <button
              className="ent-tab-btn"
              onClick={() => setSearchParams({})}
              style={{
                padding: '12px 16px',
                background: 'none', border: 'none',
                fontSize: 13, fontWeight: showHome ? 600 : 400,
                color: showHome ? A.black : A.grey300,
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                borderBottom: showHome ? `2px solid ${A.black}` : '2px solid transparent',
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              Apple Home
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className="ent-tab-btn"
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  padding: '12px 16px',
                  background: 'none', border: 'none',
                  fontSize: 13, fontWeight: !showHome && activeCategory === cat.key ? 600 : 400,
                  color: !showHome && activeCategory === cat.key ? A.black : A.grey300,
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  borderBottom: !showHome && activeCategory === cat.key ? `2px solid ${A.black}` : '2px solid transparent',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
              >
                {cat.label}
                {counts[cat.key] > 0 && (
                  <span style={{ fontSize: 11, color: A.grey300, marginLeft: 4 }}>
                    ({counts[cat.key]})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: showHome ? '12px 12px 80px' : '48px 24px 80px' }}>

        {/* Category hero */}
        
        {showHome ? (
          <AppleHome onShop={setActiveCategory} />
        ) : showLanding ? (
          <AppleCategoryLanding
            config={landingConfig!}
            onShop={sub => setSearchParams({ cat: activeCategory, sub })}
            onBrowseAll={() => setSearchParams({ cat: activeCategory, view: 'shop' })}
          />
        ) : (
        <>
        
        <CategoryHero cat={currentCat} productCount={products.length} /> 

        {/* Category subtitle */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, color: A.black, letterSpacing: '-0.02em', marginBottom: 8 }}>
            {currentCat.label}
          </h1>
          <p style={{ fontSize: 16, color: A.grey300 }}>{currentCat.tagline}</p>
        </div>

        {/* Filter bar */}
        <FilterBar products={products} filters={filters} setFilters={setFilters} />

        {/* Products grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: A.grey300 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><AppleIcon size={32} /></div>
            <div style={{ fontSize: 14 }}>Loading {currentCat.label} products…</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: A.grey300 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Search size={32} /></div>
            <div style={{ fontSize: 16, fontWeight: 600, color: A.black, marginBottom: 8 }}>No products found</div>
            <div style={{ fontSize: 14 }}>Try adjusting your filters</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: A.grey300, marginBottom: 20 }}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </div>
            <div className="ent-product-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 20,
            }}>
              {filteredProducts.map(product => (
                <AppleProductCard
                  key={product.id}
                  product={product}
                  onBuy={buy}
                  onAddToQuote={addToQuote}
                />
              ))}
            </div>
          </>
        )}
        </>
        )}

        {!showHome && <AppleRangeDisclaimers category={activeCategory} sub={activeSub} />}
      </div>

      {/* Quote sidebar */}
      {showQuote && (
        <>
          <div
            onClick={closeQuote}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 999 }}
          />
          <QuoteSidebar
            items={quoteItems}
            reference={quoteReference}
            customerEmailed={quoteEmailed}
            submitting={submittingQuote}
            error={quoteError}
            contact={contact}
            onContactChange={setContact}
            onQtyChange={setQuoteQty}
            onRemove={removeQuoteItem}
            onSubmit={handleSubmitQuote}
            onClose={closeQuote}
          />
        </>
      )}
    </div>
  )
}
