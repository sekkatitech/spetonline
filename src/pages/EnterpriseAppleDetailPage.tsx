import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Apple tokens (matches EnterpriseProductsPage) ──
const A = {
  white: '#ffffff',
  off:   '#f5f5f7',
  grey:  '#6e6e73',
  dark:  '#1d1d1f',
  blue:  '#0071e3',
  line:  '#d2d2d7',
}
const APPLE_LOGO = '/enterprice-images/apple.com-logo.png'

interface AppleProduct {
  id: string; sku: string; name: string; category_main: string; category_sub: string
  rrp_inc_vat: number; price_display: number; status: string
  specs: Record<string, string> | null; thumbnail_url: string | null
  image_urls: string[] | null
  short_description: string | null; full_description: string | null
  weight_kg: number | null
}

const CAT_ICONS: Record<string, string> = {
  Mac: '💻', iPhone: '📱', iPad: '⬜', Watch: '⌚', AirPods: '🎧',
  'Apple TV': '📺', HomePod: '🔊', Accessories: '🔌', 'Watch Accessories': '⌚',
}

const formatPrice = (n: number) =>
  'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const cleanName = (s: string) => s.replace(/\s+/g, ' ').trim()

export default function EnterpriseAppleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<AppleProduct | null>(null)
  const [featured, setFeatured] = useState<AppleProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [heroError, setHeroError] = useState(false)
  const [zoomSrc, setZoomSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setShowFullDesc(false)
    setHeroError(false)
    setQty(1)
    supabase.from('core_products').select('*').eq('id', id).single()
      .then(({ data }) => {
        const p = data as AppleProduct | null
        setProduct(p)
        setLoading(false)
        if (p) {
          supabase.from('core_products')
            .select('*')
            .eq('category_main', p.category_main)
            .eq('is_active', true)
            .eq('is_enterprise_only', true)
            .neq('id', p.id)
            .limit(8)
            .then(({ data: rel }) => setFeatured((rel as AppleProduct[]) || []))
        }
      })
  }, [id])

  const gallery: string[] = product
    ? (product.image_urls && product.image_urls.length > 0
        ? product.image_urls
        : product.thumbnail_url ? [product.thumbnail_url] : [])
    : []

  const hero = gallery[0] ?? null

  const addToQuote = async () => {
    if (!product) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { navigate('/enterprise/login'); return }
    let accountId: string | null = null
    const { data: member } = await supabase
      .from('enterprise_members').select('account_id').eq('user_id', session.user.id).maybeSingle()
    accountId = member?.account_id ?? null
    await supabase.from('quote_requests').insert({
      user_id: session.user.id,
      enterprise_account_id: accountId,
      source: 'enterprise',
      org_name: 'Enterprise Quote',
      status: 'pending',
      items: [{ id: product.id, sku: product.sku, name: product.name, qty, price: product.price_display }],
      final_amount: product.price_display * qty,
    })
    navigate('/enterprise/products')
  }

  if (loading) return <CenterMsg text="Loading…" />
  if (!product) {
    return (
      <div style={{ background: A.off, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: FONT }}>
        <div style={{ fontSize: 18, color: A.dark }}>Product not found</div>
        <button onClick={() => navigate('/enterprise/products')} style={pillBtn(true)}>Back to products</button>
      </div>
    )
  }

  const specs = product.specs || {}
  const subtitle = [specs.chip, specs.ram, specs.storage].filter(Boolean).join(' · ')
  const outOfStock = product.status === 'out_of_stock'

  return (
    <div style={{ background: A.off, minHeight: '100vh', fontFamily: FONT }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 24px 80px' }}>

        <button onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/enterprise/products'); }} style={backLink}>← Back</button>
        {zoomSrc && (
          <div
            onClick={() => setZoomSrc(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 32, cursor: 'zoom-out',
            }}
          >
            <img src={zoomSrc} alt="Zoomed product view" style={{ width: '92vw', height: '88vh', objectFit: 'contain', borderRadius: 12, background: '#fff', padding: 24, boxSizing: 'border-box' }} />
            <button
              onClick={() => setZoomSrc(null)}
              style={{ position: 'fixed', top: 20, right: 24, fontSize: 28, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              aria-label="Close zoom"
            >✕</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 56, alignItems: 'start' }}>

          {/* LEFT — hero then feature images stacked down */}
          <div>
            <div style={imgPanel}>
              {hero && !heroError
                ? <img src={hero} alt={cleanName(product.name)} onError={() => setHeroError(true)} onClick={() => setZoomSrc(hero)} style={{ ...imgTag, cursor: 'zoom-in' }} />
                : <img src={APPLE_LOGO} alt="Apple" style={{ width: '38%', height: '38%', objectFit: 'contain', opacity: 0.9 }} />}
            </div>
            {gallery.slice(1).map((url, i) => (
              <div key={i} style={{ ...imgPanel, marginTop: 20 }}>
                <img src={url} alt={`${cleanName(product.name)} view ${i + 2}`} style={{ ...imgTag, cursor: 'zoom-in' }} loading="lazy" onClick={() => setZoomSrc(url)} />
              </div>
            ))}
          </div>

          {/* RIGHT — sticky product info */}
          <div style={{ position: 'sticky', top: 24 }}>
            {product.status === 'while_stocks_last' && (
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: '#b45309', textTransform: 'uppercase', marginBottom: 10 }}>While stocks last</div>
            )}
            <h1 style={{ fontSize: 34, fontWeight: 600, color: A.dark, letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 8px' }}>
              {cleanName(product.name)}
            </h1>
            <div style={{ fontSize: 12, color: A.grey, fontFamily: 'monospace', marginBottom: 16 }}>{product.sku}</div>

            {subtitle && <div style={{ fontSize: 15, color: A.grey, marginBottom: 20 }}>{subtitle}</div>}

            <div style={{ fontSize: 28, fontWeight: 700, color: A.dark, letterSpacing: '-0.02em' }}>
              {formatPrice(product.price_display)}
            </div>
            <div style={{ fontSize: 12, color: A.grey, fontStyle: 'italic', marginBottom: 20 }}>All prices include VAT.</div>

            {outOfStock && <div style={{ fontSize: 15, fontWeight: 700, color: '#ff3b30', marginBottom: 16 }}>OUT OF STOCK</div>}

            {product.short_description && (
              <div style={{ fontSize: 15, color: A.dark, lineHeight: 1.6, marginBottom: 8 }}>
                {product.short_description}
              </div>
            )}
            {product.full_description && (
              <button onClick={() => setShowFullDesc(true)} style={{ background: 'none', border: 'none', color: A.blue, fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 24, fontFamily: 'inherit' }}>
                Read full description →
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', marginTop: 12, marginBottom: 16, maxWidth: 180 }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={qtyBtn('l')}>−</button>
              <div style={qtyVal}>{qty}</div>
              <button onClick={() => setQty(q => q + 1)} style={qtyBtn('r')}>+</button>
            </div>

            <button onClick={addToQuote} style={{ ...pillBtn(true), width: '100%', maxWidth: 440, padding: '14px 0', fontSize: 15 }}>
              Add to Quote
            </button>

            {Object.keys(specs).length > 0 && (
              <div style={{ borderTop: `1px solid ${A.line}`, paddingTop: 20, marginTop: 28 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: A.dark, marginBottom: 12 }}>Specifications</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 20px' }}>
                  {Object.entries(specs).map(([k, v]) => (
                    <div key={k} style={{ display: 'contents' }}>
                      <div style={{ fontSize: 13, color: A.grey, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: 13, color: A.dark, fontWeight: 500 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {featured.length > 0 && (
          <div style={{ marginTop: 72 }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: A.dark, letterSpacing: '-0.01em', marginBottom: 24 }}>
              More {product.category_main}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
              {featured.map(f => (
                <button key={f.id} onClick={() => navigate(`/enterprise/apple/${encodeURIComponent(f.id)}`)} style={featCard}>
                  <div style={{ width: '100%', aspectRatio: '1/1', background: A.off, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 44, marginBottom: 12 }}>
                    {f.thumbnail_url
                      ? <img src={f.thumbnail_url} alt={cleanName(f.name)} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 12 }} loading="lazy" />
                      : <img src={APPLE_LOGO} alt="Apple" style={{ width: '42%', height: '42%', objectFit: 'contain', opacity: 0.9 }} />}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: A.dark, lineHeight: 1.3, marginBottom: 4 }}>{cleanName(f.name)}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: A.dark }}>{formatPrice(f.price_display)}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showFullDesc && product.full_description && (
        <div onClick={() => setShowFullDesc(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: A.white, borderRadius: 20, maxWidth: 720, width: '100%', maxHeight: '82vh', overflow: 'auto', padding: '40px 44px', position: 'relative' }}>
            <button onClick={() => setShowFullDesc(false)}
              style={{ position: 'absolute', top: 20, right: 20, width: 34, height: 34, borderRadius: '50%', border: 'none', background: A.off, fontSize: 18, cursor: 'pointer', color: A.grey, lineHeight: 1 }}>×</button>
            <h2 style={{ fontSize: 26, fontWeight: 600, color: A.dark, letterSpacing: '-0.02em', margin: '0 0 20px', paddingRight: 40 }}>
              {cleanName(product.name)}
            </h2>
            <div style={{ fontSize: 15, color: A.dark, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {product.full_description}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif"
const imgPanel: React.CSSProperties = { width: '100%', aspectRatio: '1/1', background: A.white, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }
const imgTag: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'contain', padding: 32 }
const backLink: React.CSSProperties = { background: 'none', border: 'none', color: A.blue, fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 24, fontFamily: FONT }
const featCard: React.CSSProperties = { background: A.white, borderRadius: 16, padding: 16, border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: FONT }
const qtyVal: React.CSSProperties = { flex: 1, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: A.white, fontSize: 15, fontWeight: 600, color: A.dark }
function qtyBtn(side: 'l' | 'r'): React.CSSProperties {
  return { width: 44, height: 44, background: A.off, border: 'none', borderRadius: side === 'l' ? '10px 0 0 10px' : '0 10px 10px 0', fontSize: 20, cursor: 'pointer', color: A.dark }
}
function pillBtn(filled: boolean): React.CSSProperties {
  return { background: filled ? A.blue : A.off, color: filled ? A.white : A.blue, border: 'none', borderRadius: 980, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT, padding: '10px 22px' }
}
function CenterMsg({ text }: { text: string }) {
  return <div style={{ background: A.off, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: A.grey }}>{text}</div>
}
