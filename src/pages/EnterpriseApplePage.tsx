import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Types ──────────────────────────────────────────────────────────────────
interface AppleProduct {
  id: string
  sku: string
  name: string
  category_main: string
  category_sub: string
  rrp_inc_vat: number
  wholesale_ex_vat: number
  price_display: number
  status: string
  specs: Record<string, string> | null
  thumbnail_url: string | null
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
    hero: '/enterprice-images/ARP100_Mobile Banner.png',
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
    key: 'Apple TV',
    label: 'Apple TV',
    tagline: 'Your TV experience, elevated.',
    hero: null,
    color: '#1d1d1f',
    bg: '#ffffff',
  },
]

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
function AppleProductImage({ sku, name, category }: { sku: string; name: string; category: string }) {
  const [imgError, setImgError] = useState(false)

  // Apple product images from Core Group CDN pattern
  const src = `https://cdsassets.apple.com/live/BZGVET9P/images/apple-og-image.png`

  const ICONS: Record<string, string> = {
    Mac: '💻', iPhone: '📱', iPad: '⬜', Watch: '⌚',
    AirPods: '🎧', 'Apple TV': '📺', HomePod: '🔊',
    Accessories: '🔌', 'Watch Accessories': '⌚',
  }

  return (
    <div style={{
      width: '100%', aspectRatio: '1/1',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: A.offwhite, borderRadius: 12,
      fontSize: 64, userSelect: 'none',
    }}>
      {ICONS[category] || '📦'}
    </div>
  )
}

// ── Product card — Apple style ─────────────────────────────────────────────
function AppleProductCard({ product, onAddToQuote }: {
  product: AppleProduct
  onAddToQuote: (p: AppleProduct) => void
}) {
  const [hovered, setHovered] = useState(false)
  const displayName = cleanName(product.name)
  const subtitle = getSubtitle(product)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
      <AppleProductImage sku={product.sku} name={product.name} category={product.category_main} />

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

      {/* Add to quote button */}
      <button
        onClick={(e) => { e.stopPropagation(); onAddToQuote(product) }}
        style={{
          width: '100%', padding: '10px 0',
          background: hovered ? A.blue : A.offwhite,
          color: hovered ? A.white : A.blue,
          border: 'none', borderRadius: 980,
          fontSize: 13, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background 0.2s, color 0.2s',
          letterSpacing: '-0.01em',
        }}
      >
        {hovered ? 'Add to Quote →' : 'Add to Quote'}
      </button>
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
    <div style={{
      display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
      marginBottom: 32, padding: '16px 20px',
      background: A.white, borderRadius: 12,
      border: `1px solid ${A.grey100}`,
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: '1 1 200px' }}>
        <input
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
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: A.grey300, fontSize: 14 }}>🔍</span>
      </div>

      {/* Colour filter */}
      {colours.length > 0 && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          {colours.slice(0, 10).map(colour => (
            <button
              key={colour}
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
function QuoteSidebar({
  items, onRemove, onSubmit, onClose,
}: {
  items: Array<{ product: AppleProduct; qty: number }>
  onRemove: (id: string) => void
  onSubmit: () => void
  onClose: () => void
}) {
  const total = items.reduce((s, i) => s + i.product.price_display * i.qty, 0)

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
      background: A.white, boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 16px', borderBottom: `1px solid ${A.grey100}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: A.black }}>Quote Request</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: A.grey300 }}>✕</button>
      </div>

      {/* Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: A.grey300, fontSize: 14 }}>
            No products added yet
          </div>
        ) : (
          items.map(({ product, qty }) => (
            <div key={product.id} style={{
              display: 'flex', gap: 12, paddingBottom: 16, marginBottom: 16,
              borderBottom: `1px solid ${A.grey100}`,
            }}>
              <div style={{ width: 56, height: 56, background: A.offwhite, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                {product.category_main === 'Mac' ? '💻' : product.category_main === 'iPhone' ? '📱' : product.category_main === 'iPad' ? '⬜' : product.category_main === 'Watch' ? '⌚' : '📦'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: A.black, marginBottom: 2, lineHeight: 1.3 }}>
                  {cleanName(product.name)}
                </div>
                <div style={{ fontSize: 11, color: A.grey300, marginBottom: 4 }}>{product.sku}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: A.black }}>{fmt(product.price_display)}</div>
              </div>
              <button onClick={() => onRemove(product.id)}
                style={{ background: 'none', border: 'none', color: A.grey300, cursor: 'pointer', fontSize: 16, padding: '0 4px', alignSelf: 'flex-start' }}>
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Total + CTA */}
      <div style={{ padding: '16px 24px 32px', borderTop: `1px solid ${A.grey100}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: A.grey300 }}>Estimated total</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: A.black }}>{fmt(total)}</span>
        </div>
        <p style={{ fontSize: 12, color: A.grey300, marginBottom: 16, lineHeight: 1.5 }}>
          Final pricing subject to formal quote. All prices include VAT. Net 30 credit terms available for approved accounts.
        </p>
        <button
          onClick={onSubmit}
          disabled={items.length === 0}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 980,
            background: items.length > 0 ? A.blue : A.grey100,
            color: items.length > 0 ? A.white : A.grey300,
            border: 'none', fontSize: 15, fontWeight: 600,
            cursor: items.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', letterSpacing: '-0.01em',
          }}
        >
          Submit Quote Request
        </button>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function EnterpriseApplePage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('Mac')
  const [products, setProducts] = useState<AppleProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', colour: '', storage: '', status: '' })
  const [quoteItems, setQuoteItems] = useState<Array<{ product: AppleProduct; qty: number }>>([])
  const [showQuote, setShowQuote] = useState(false)
  const [toast, setToast] = useState('')
  const [counts, setCounts] = useState<Record<string, number>>({})

  // Load products for active category
  useEffect(() => {
    loadProducts()
  }, [activeCategory])

  // Load category counts on mount
  useEffect(() => {
    loadCounts()
  }, [])

  const loadCounts = async () => {
    const { data } = await supabase
      .from('core_products')
      .select('category_main')
      .eq('is_active', true)
      .eq('is_enterprise_only', true)

    if (data) {
      const c: Record<string, number> = {}
      for (const p of data) {
        c[p.category_main] = (c[p.category_main] || 0) + 1
      }
      setCounts(c)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    setFilters({ search: '', colour: '', storage: '', status: '' })
    try {
      const { data } = await supabase
        .from('core_products')
        .select('*')
        .eq('category_main', activeCategory)
        .eq('is_active', true)
        .eq('is_enterprise_only', true)
        .order('price_display', { ascending: true })

      setProducts(data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const filteredProducts = products.filter(p => {
    if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase()) && !p.sku.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.colour && p.specs?.colour !== filters.colour) return false
    if (filters.storage && p.specs?.storage !== filters.storage) return false
    if (filters.status && p.status !== filters.status) return false
    return true
  })

  const addToQuote = (product: AppleProduct) => {
    setQuoteItems(prev => {
      if (prev.find(i => i.product.id === product.id)) return prev
      return [...prev, { product, qty: 1 }]
    })
    showToast(`${cleanName(product.name)} added to quote`)
    setShowQuote(true)
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSubmitQuote = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/enterprise/login'); return }

      const { error } = await supabase.from('quote_requests').insert({
        user_id: user.id,
        source: 'enterprise',
        status: 'pending',
        items: quoteItems.map(i => ({
          product_id: i.product.id,
          sku: i.product.sku,
          name: i.product.name,
          qty: i.qty,
          unit_price: i.product.price_display,
        })),
        total_amount: quoteItems.reduce((s, i) => s + i.product.price_display * i.qty, 0),
        notes: 'Apple products quote from enterprise portal',
      })

      if (error) throw error
      setQuoteItems([])
      setShowQuote(false)
      showToast('Quote submitted! We will respond within 24 hours.')
    } catch (err: any) {
      showToast(`Error: ${err.message}`)
    }
  }

  const currentCat = CATEGORIES.find(c => c.key === activeCategory) || CATEGORIES[0]

  return (
    <div style={{
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
      background: A.offwhite, minHeight: '100vh', color: A.black,
    }}>

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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/enterprice-images/Apple Reseller Program Logo.png" alt="Apple Reseller" style={{ height: 28 }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              <span style={{ fontSize: 13, color: A.grey300, fontWeight: 400 }}>Enterprise</span>
            </div>
            <button
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
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                style={{
                  padding: '12px 16px',
                  background: 'none', border: 'none',
                  fontSize: 13, fontWeight: activeCategory === cat.key ? 600 : 400,
                  color: activeCategory === cat.key ? A.black : A.grey300,
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  borderBottom: activeCategory === cat.key ? `2px solid ${A.black}` : '2px solid transparent',
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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Category hero */}
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
            <div style={{ fontSize: 32, marginBottom: 12 }}>🍎</div>
            <div style={{ fontSize: 14 }}>Loading {currentCat.label} products…</div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: A.grey300 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: A.black, marginBottom: 8 }}>No products found</div>
            <div style={{ fontSize: 14 }}>Try adjusting your filters</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: A.grey300, marginBottom: 20 }}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 20,
            }}>
              {filteredProducts.map(product => (
                <AppleProductCard
                  key={product.id}
                  product={product}
                  onAddToQuote={addToQuote}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Quote sidebar */}
      {showQuote && (
        <>
          <div
            onClick={() => setShowQuote(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 999 }}
          />
          <QuoteSidebar
            items={quoteItems}
            onRemove={id => setQuoteItems(prev => prev.filter(i => i.product.id !== id))}
            onSubmit={handleSubmitQuote}
            onClose={() => setShowQuote(false)}
          />
        </>
      )}
    </div>
  )
}
