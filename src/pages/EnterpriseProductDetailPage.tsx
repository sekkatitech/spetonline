import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import { supabase } from '../lib/supabase'

// ── Design tokens ──
const E = {
  primary:             '#000000',
  primaryContainer:    '#131b2e',
  onPrimary:           '#ffffff',
  secondary:           '#515f74',
  secondaryContainer:  '#d5e3fd',
  onSecondaryContainer:'#57657b',
  surface:             '#f7f9fb',
  surfaceLow:          '#f2f4f6',
  surfaceContainer:    '#eceef0',
  surfaceWhite:        '#ffffff',
  onSurface:           '#191c1e',
  onSurfaceVariant:    '#45464d',
  outline:             '#76777d',
  outlineVariant:      '#c6c6cd',
  blue:                '#497cff',
  green:               '#2e7d32',
  greenBg:             '#e8f5e9',
  amber:               '#f57f17',
  amberBg:             '#fff8e1',
  red:                 '#c62828',
  redBg:               '#fce4e4',
}

// ── Icons ──
function DashIcon()  { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> }
function BoxIcon()   { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> }
function DocIcon()   { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function TruckIcon() { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg> }
function ListIcon()  { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function LogoutIcon(){ return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
function BackIcon()  { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg> }
function CartIcon()  { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg> }
function CheckIcon() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }

const formatPrice = (p: number) =>
  `R ${p.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

interface ProductDetail {
  id:          string
  name:        string
  sku:         string
  brand:       string
  category:    string
  price:       number
  stock:       number
  stockStatus: string
  image:       string | null
  images:      string[]
  source:      'esquire' | 'syntech' | 'enterprise' | 'axiz'
  description: string | null
  summary:     string | null
  specs:       Record<string, string>
}

function SourceBadge({ source }: { source: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    esquire:    { label: 'Home & Entertainment', bg: E.surfaceContainer, color: E.onSurfaceVariant },
    syntech:    { label: 'Gaming & Computing',   bg: E.secondaryContainer, color: E.blue },
    enterprise: { label: 'Enterprise Exclusive', bg: '#ede7f6', color: '#5e35b1' },
    axiz:       { label: 'Axiz Digital',         bg: '#fff3e0', color: '#e65100' },
  }
  const s = map[source] ?? map.esquire
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 4, background: s.bg, color: s.color }}>{s.label}</span>
}

function StockBadge({ status, qty }: { status: string; qty: number }) {
  if (qty === 0 || status === 'out_of_stock')
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: E.red }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: E.red, display: 'inline-block' }}/>Out of stock</span>
  if (qty <= 5 || status === 'low_stock')
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: E.amber }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: E.amber, display: 'inline-block' }}/>Low stock ({qty} remaining)</span>
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: E.green }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: E.green, display: 'inline-block' }}/>In stock</span>
}

export default function EnterpriseProductDetailPage() {
  const { source, id } = useParams<{ source: string; id: string }>()
  const navigate = useNavigate()

  const [product, setProduct]   = useState<ProductDetail | null>(null)
  const [loading, setLoading]   = useState(true)
  const [imgError, setImgError] = useState(false)
  const [qty, setQty]           = useState(1)
  const [added, setAdded]       = useState(false)
  const [toast, setToast]       = useState('')
  const [selImg, setSelImg]     = useState(0)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  useEffect(() => {
    if (!id || !source) return
    loadProduct()
  }, [id, source])

  const loadProduct = async () => {
    setLoading(true)
    try {
      if (source === 'esquire') {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single()

        if (data) {
          const imgs: string[] = []
          if (data.image) imgs.push(data.image)
          if (data.images && Array.isArray(data.images)) imgs.push(...data.images)

          setProduct({
            id:          data.id,
            name:        data.ProductName,
            sku:         data.ProductCode,
            brand:       data.Brand ?? '—',
            category:    data.Category ?? '—',
            price:       Number(data.Price),
            stock:       data.AvailableQty ?? 0,
            stockStatus: (data.AvailableQty ?? 0) === 0 ? 'out_of_stock' : (data.AvailableQty ?? 0) <= 5 ? 'low_stock' : 'in_stock',
            image:       data.image,
            images:      imgs,
            source:      'esquire',
            description: data.ProductDescription,
            summary:     data.ProductSummary,
            specs: {
              ...(data.Brand        ? { Brand:    data.Brand }        : {}),
              ...(data.Category     ? { Category: data.Category }     : {}),
              ...(data.Condition    ? { Condition: data.Condition }   : {}),
              ...(data.LengthCM     ? { 'Length (cm)': String(data.LengthCM) } : {}),
              ...(data.WidthCM      ? { 'Width (cm)':  String(data.WidthCM)  } : {}),
              ...(data.HeightCM     ? { 'Height (cm)': String(data.HeightCM) } : {}),
              ...(data.MassKG       ? { 'Mass (kg)':   String(data.MassKG)   } : {}),
            },
          })
        }

      } else if (source === 'syntech') {
        const { data } = await supabase
          .from('syntech_products')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single()

        if (data) {
          const imgs: string[] = []
          if (data.thumbnail_url) imgs.push(data.thumbnail_url)
          if (data.images && Array.isArray(data.images)) imgs.push(...data.images)

          setProduct({
            id:          data.id,
            name:        data.name,
            sku:         data.sku,
            brand:       data.brand ?? '—',
            category:    data.category ?? '—',
            price:       Number(data.price_display),
            stock:       data.stock_qty ?? 0,
            stockStatus: data.stock_status ?? 'out_of_stock',
            image:       data.thumbnail_url,
            images:      imgs,
            source:      'syntech',
            description: data.long_description ?? data.short_description,
            summary:     data.short_description,
            specs: {
              ...(data.brand    ? { Brand:    data.brand }    : {}),
              ...(data.category ? { Category: data.category } : {}),
              ...(data.sku      ? { SKU:      data.sku }      : {}),
            },
          })
        }
      } else if (source === 'axiz') {
        const { data } = await supabase
          .from('axiz_products')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single()

        if (data) {
          const imgs: string[] = []
          if (data.thumbnail_url) imgs.push(data.thumbnail_url)
          if (data.images && Array.isArray(data.images)) imgs.push(...data.images.filter((u: string) => u !== data.thumbnail_url))

          setProduct({
            id:          data.id,
            name:        data.name,
            sku:         data.sku,
            brand:       data.brand ?? '—',
            category:    data.category ?? '—',
            price:       Number(data.price_display),
            stock:       data.stock_qty ?? 0,
            stockStatus: data.stock_status ?? 'out_of_stock',
            image:       data.thumbnail_url,
            images:      imgs,
            source:      'axiz',
            description: data.short_description,
            summary:     data.short_description,
            specs: {
              ...(data.brand ? { Brand:    data.brand }    : {}),
              ...(data.category ? { Category: data.category } : {}),
              ...(data.sku    ? { SKU:      data.sku }      : {}),
              ...(data.uom    ? { Unit:     data.uom }      : {}),
            },
          })
        }
      }
    } catch (err) {
      console.error('Failed to load product:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToQuote = async () => {
    if (!product) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/enterprise/login'); return }

      const { data: member } = await supabase
        .from('enterprise_account_members')
        .select('account_id')
        .eq('profile_id', session.user.id)
        .single()

      const subtotal = product.price * qty
      const { data: quote, error: qErr } = await supabase
        .from('quote_requests')
        .insert({
          user_id:               session.user.id,
          enterprise_account_id: member?.account_id ?? null,
          source:                'enterprise',
          org_name:              'Enterprise Quote',
          status:                'pending',
          items:                 [{ id: product.id, name: product.name, qty, price: product.price }],
          final_amount:          subtotal,
        })
        .select('id')
        .single()

      if (qErr) throw qErr

      if (quote) {
        await supabase.from('enterprise_quote_items').insert({
          quote_id:       quote.id,
          product_id:     product.id,
          product_source: product.source,
          product_name:   product.name,
          sku:            product.sku,
          brand:          product.brand,
          quantity:       qty,
          unit_price:     product.price,
        })
      }

      setAdded(true)
      showToast(`✓ ${qty}× ${product.name.slice(0, 30)}… added to quote`)
      setTimeout(() => setAdded(false), 3000)
    } catch (err: any) {
      showToast(`Error: ${err.message}`)
    }
  }

  const outOfStock = !product || product.stock === 0 || product.stockStatus === 'out_of_stock'

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: E.surface,
      color: E.onSurface,
      WebkitFontSmoothing: 'antialiased',
      display: 'flex',
      minHeight: '100vh',
    }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, minWidth: 220,
        background: E.surfaceWhite,
        borderRight: `1px solid ${E.outlineVariant}`,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh', position: 'sticky', top: 0,
      }}>
        <div>
          <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${E.outlineVariant}` }}>
            <a href="/enterprise" style={{ display: 'flex', alignItems: 'baseline', gap: 5, textDecoration: 'none' }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: E.primary, letterSpacing: '-0.03em' }}>SPET</span>
              <span style={{ fontSize: 12, fontWeight: 300, color: E.secondary }}>Enterprise</span>
            </a>
          </div>
          <nav style={{ padding: '12px 10px' }}>
            {[
              { icon: <DashIcon />, label: 'Dashboard',        path: '/enterprise/dashboard', active: false },
              { icon: <BoxIcon />,  label: 'Products',          path: '/enterprise/products',  active: true  },
              { icon: <DocIcon />,  label: 'Quotations',        path: '/enterprise/quotes',    active: false },
              { icon: <TruckIcon/>, label: 'Orders',            path: '/enterprise/orders',    active: false },
              { icon: <ListIcon />, label: 'Procurement Lists', path: '/enterprise/lists',     active: false },
            ].map(item => (
              <button key={item.label} onClick={() => navigate(item.path)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none',
                background: item.active ? E.surfaceLow : 'none',
                color: item.active ? E.primary : E.onSurfaceVariant,
                fontSize: 13, fontWeight: item.active ? 600 : 400,
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', marginBottom: 2,
              }}>
                <span style={{ color: item.active ? E.primary : E.outline }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ padding: '12px 10px', borderTop: `1px solid ${E.outlineVariant}` }}>
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/enterprise') }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none', background: 'none', color: E.red, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            <LogoutIcon /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', height: 64,
          borderBottom: `1px solid ${E.outlineVariant}`,
          background: E.surfaceWhite,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <button
            onClick={() => navigate('/enterprise/products')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 500, color: E.onSurfaceVariant,
              fontFamily: 'inherit', padding: '6px 0',
            }}
          >
            <BackIcon /> Back to Catalog
          </button>
          <button
            onClick={() => navigate('/enterprise/quotes')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: `1px solid ${E.outlineVariant}`,
              borderRadius: 8, padding: '7px 14px',
              fontSize: 13, fontWeight: 500, color: E.onSurfaceVariant,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <CartIcon /> View My Quotes
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '36px 40px', maxWidth: 1200 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
              {[1, 2].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[200, 20, 14, 14, 14].map((h, j) => (
                    <div key={j} style={{ height: h, background: E.surfaceContainer, borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  ))}
                </div>
              ))}
            </div>

          ) : !product ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, opacity: 0.2 }}><Package size={48} /></div>
              <div style={{ fontSize: 18, fontWeight: 600, color: E.onSurface, marginBottom: 8 }}>Product not found</div>
              <button
                onClick={() => navigate('/enterprise/products')}
                style={{ background: E.primary, color: E.onPrimary, border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Back to Catalog
              </button>
            </div>

          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>

              {/* ── Left: Images ── */}
              <div>
                {/* Main image */}
                <div style={{
                  background: E.surfaceWhite,
                  border: `1px solid ${E.outlineVariant}`,
                  borderRadius: 16,
                  aspectRatio: '1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', marginBottom: 12, position: 'relative',
                }}>
                  {product.images[selImg] && !imgError ? (
                    <img
                      src={product.images[selImg]}
                      alt={product.name}
                      onError={() => setImgError(true)}
                      style={{ width: '85%', height: '85%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ opacity: 0.15 }}><Package size={64} /></div>
                  )}
                  <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <SourceBadge source={product.source} />
                  </div>
                </div>

                {/* Thumbnail strip */}
                {product.images.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {product.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelImg(i); setImgError(false) }}
                        style={{
                          width: 60, height: 60,
                          border: `2px solid ${selImg === i ? E.primary : E.outlineVariant}`,
                          borderRadius: 8, overflow: 'hidden', padding: 0,
                          background: E.surfaceWhite, cursor: 'pointer',
                          transition: 'border-color 0.15s',
                        }}
                      >
                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} onError={e => (e.currentTarget.style.display = 'none')} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Right: Details ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Breadcrumb */}
                <div style={{ fontSize: 12, color: E.outline }}>
                  <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/enterprise/products')}>Catalog</span>
                  {' / '}{product.category}{' / '}<span style={{ color: E.onSurface }}>{product.brand}</span>
                </div>

                {/* Name */}
                <h1 style={{ fontSize: 24, fontWeight: 700, color: E.primary, letterSpacing: '-0.02em', lineHeight: 1.3, margin: 0 }}>
                  {product.name}
                </h1>

                {/* SKU + Brand */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: E.outline, fontFamily: 'monospace' }}>SKU: {product.sku}</span>
                  <span style={{ fontSize: 12, color: E.outline }}>Brand: <strong style={{ color: E.onSurface }}>{product.brand}</strong></span>
                </div>

                {/* Price */}
                <div style={{
                  background: E.surfaceLow,
                  border: `1px solid ${E.outlineVariant}`,
                  borderRadius: 12, padding: '20px 24px',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: E.outline, marginBottom: 6 }}>
                    Enterprise Price (excl. VAT)
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: E.primary, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums', marginBottom: 8 }}>
                    {formatPrice(product.price)}
                  </div>
                  <StockBadge status={product.stockStatus} qty={product.stock} />
                </div>

                {/* Quantity + Add to Quote */}
                {!outOfStock && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${E.outlineVariant}`, borderRadius: 8, overflow: 'hidden' }}>
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        style={{ width: 40, height: 44, background: E.surfaceLow, border: 'none', cursor: 'pointer', fontSize: 18, color: E.onSurface, fontFamily: 'inherit' }}
                      >−</button>
                      <span style={{ width: 48, textAlign: 'center', fontSize: 16, fontWeight: 600, color: E.onSurface }}>{qty}</span>
                      <button
                        onClick={() => setQty(q => q + 1)}
                        style={{ width: 40, height: 44, background: E.surfaceLow, border: 'none', cursor: 'pointer', fontSize: 18, color: E.onSurface, fontFamily: 'inherit' }}
                      >+</button>
                    </div>

                    <button
                      onClick={handleAddToQuote}
                      style={{
                        flex: 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: added ? E.green : E.primary,
                        color: E.onPrimary,
                        fontSize: 14, fontWeight: 600,
                        padding: '12px 24px', borderRadius: 8,
                        border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background 0.2s',
                      }}
                    >
                      {added ? <><CheckIcon /> Added to Quote</> : <><DocIcon /> Add to Quote</>}
                    </button>
                  </div>
                )}

                {outOfStock && (
                  <div style={{
                    background: E.redBg, border: `1px solid ${E.red}`,
                    borderRadius: 8, padding: '12px 16px',
                    fontSize: 13, color: E.red, fontWeight: 500,
                  }}>
                    This product is currently out of stock. Contact your account manager for availability.
                  </div>
                )}

                {/* Line total */}
                {!outOfStock && qty > 1 && (
                  <div style={{ fontSize: 13, color: E.onSurfaceVariant }}>
                    Line total: <strong style={{ color: E.primary }}>{formatPrice(product.price * qty)}</strong> excl. VAT
                  </div>
                )}

                {/* Shipping note */}
                <div style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  background: E.secondaryContainer, borderRadius: 8, padding: '12px 16px',
                  fontSize: 12, color: E.onSecondaryContainer, lineHeight: 1.6,
                }}>
                  <TruckIcon />
                  <div>
                    <strong>Priority enterprise delivery</strong><br />
                    Dedicated Courier Guy shipping for verified enterprise accounts. Waybill tracking available from your orders page.
                  </div>
                </div>

                {/* Description */}
                {(product.summary || product.description) && (
                  <div style={{ borderTop: `1px solid ${E.outlineVariant}`, paddingTop: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: E.primary, marginBottom: 10 }}>Product Description</div>
                    {product.summary && (
                      <p style={{ fontSize: 13, color: E.onSurfaceVariant, lineHeight: 1.7, marginBottom: 8 }}>{product.summary}</p>
                    )}
                    {product.description && product.description !== product.summary && (
                      <p style={{ fontSize: 13, color: E.onSurfaceVariant, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{product.description}</p>
                    )}
                  </div>
                )}

                {/* Specs table */}
                {Object.keys(product.specs).length > 0 && (
                  <div style={{ borderTop: `1px solid ${E.outlineVariant}`, paddingTop: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: E.primary, marginBottom: 12 }}>Specifications</div>
                    <div style={{ border: `1px solid ${E.outlineVariant}`, borderRadius: 8, overflow: 'hidden' }}>
                      {Object.entries(product.specs).map(([key, val], i) => (
                        <div key={key} style={{
                          display: 'grid', gridTemplateColumns: '160px 1fr',
                          padding: '10px 16px',
                          borderBottom: i < Object.keys(product.specs).length - 1 ? `1px solid ${E.outlineVariant}` : 'none',
                          background: i % 2 === 0 ? E.surfaceWhite : E.surfaceLow,
                        }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: E.onSurfaceVariant }}>{key}</span>
                          <span style={{ fontSize: 12, color: E.onSurface }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: E.primaryContainer, color: '#fff',
          padding: '12px 20px', borderRadius: 10,
          fontSize: 13, fontWeight: 500,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 999, whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
