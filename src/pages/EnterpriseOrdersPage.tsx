import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'

// ── Design tokens ──
const E = {
  primary:             '#000000',
  primaryContainer:    '#131b2e',
  onPrimary:           '#ffffff',
  secondary:           '#515f74',
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
  purple:              '#6d28d9',
  purpleBg:            '#ede9fe',
}

// ── Types ──
interface Order {
  id:                    string
  source:                string
  quote_ref:             string | null
  po_number:             string | null
  client_name:           string | null
  client_email:          string | null
  subtotal:              number
  vat_amount:            number
  total:                 number
  status:                string
  payment_status:        string
  payment_method:        string | null
  courier:               string | null
  courier_waybill:       string | null
  tracking_url:          string | null
  tracking_number:       string | null
  estimated_delivery:    string | null
  delivered_at:          string | null
  shipping_address_line1:string | null
  shipping_city:         string | null
  shipping_province:     string | null
  shipping_postal_code:  string | null
  credit_terms:          number
  due_date:              string | null
  paid_at:               string | null
  internal_notes:        string | null
  created_at:            string
  updated_at:            string
}

// ── Icons ──
function DashIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> }
function BoxIcon()     { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> }
function DocIcon()     { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function TruckIcon()   { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg> }
function ListIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function LogoutIcon()  { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
function ChevDownIcon(){ return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg> }
function ChevUpIcon()  { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg> }
function MapPinIcon()  { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function ExternalIcon(){ return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> }
function ShoppingIcon(){ return <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> }
function CreditIcon()  { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> }

// ── Helpers ──
const fmt = (p: number) =>
  `R ${Number(p).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtDate = (d: string | null) => d
  ? new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—'

const daysFromNow = (d: string | null) => {
  if (!d) return null
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  if (diff < 0) return 'Overdue'
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `In ${diff} days`
}

// ── Status config ──
const ORDER_STATUS: Record<string, { label: string; bg: string; color: string; dot: string; step: number }> = {
  pending:    { label: 'Order Placed',   bg: E.surfaceContainer, color: E.onSurfaceVariant, dot: E.outline,  step: 0 },
  processing: { label: 'Processing',     bg: E.amberBg,          color: E.amber,            dot: E.amber,    step: 1 },
  shipped:    { label: 'In Transit',     bg: E.secondaryContainer ?? '#d5e3fd', color: E.blue, dot: E.blue,  step: 2 },
  completed:  { label: 'Delivered',      bg: E.greenBg,          color: E.green,            dot: E.green,   step: 3 },
  cancelled:  { label: 'Cancelled',      bg: E.redBg,            color: E.red,              dot: E.red,     step: -1 },
}

const PAYMENT_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  unpaid:   { label: 'Payment Pending', bg: E.amberBg, color: E.amber  },
  paid:     { label: 'Paid',            bg: E.greenBg, color: E.green  },
  refunded: { label: 'Refunded',        bg: E.redBg,   color: E.red    },
  failed:   { label: 'Payment Failed',  bg: E.redBg,   color: E.red    },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = ORDER_STATUS[status] ?? ORDER_STATUS.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 9999,
      fontSize: 11, fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

function PaymentBadge({ status }: { status: string }) {
  const cfg = PAYMENT_STATUS[status] ?? PAYMENT_STATUS.unpaid
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 9999,
      fontSize: 10, fontWeight: 600,
      background: cfg.bg, color: cfg.color,
    }}>
      {cfg.label}
    </span>
  )
}

// ── Order timeline ──
const STEPS = [
  { key: 'pending',    label: 'Order Placed'  },
  { key: 'processing', label: 'Processing'    },
  { key: 'shipped',    label: 'In Transit'    },
  { key: 'completed',  label: 'Delivered'     },
]

function OrderTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: E.redBg, border: `2px solid ${E.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: E.red }}><X size={13} /></div>
        <span style={{ fontSize: 12, color: E.red, fontWeight: 500 }}>This order was cancelled</span>
      </div>
    )
  }

  const currentStep = ORDER_STATUS[status]?.step ?? 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '10px 0' }}>
      {STEPS.map((step, i) => {
        const done   = i < currentStep
        const active = i === currentStep
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: done ? E.primary : active ? E.primary : E.surfaceContainer,
                border: `2px solid ${done || active ? E.primary : E.outlineVariant}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
                color: done || active ? E.onPrimary : E.outline,
              }}>
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span style={{
                fontSize: 9, fontWeight: 500, textTransform: 'uppercase',
                letterSpacing: '0.04em', whiteSpace: 'nowrap',
                color: done || active ? E.primary : E.outline,
              }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 4px',
                background: done ? E.primary : E.outlineVariant,
                marginBottom: 18,
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Order card ──
function OrderCard({ order, expanded, onToggle }: {
  order:    Order
  expanded: boolean
  onToggle: () => void
}) {
  const statusCfg  = ORDER_STATUS[order.status]  ?? ORDER_STATUS.pending
  const isShipped  = order.status === 'shipped'
  const isDelivered = order.status === 'completed'
  const isCancelled = order.status === 'cancelled'

  return (
    <div style={{
      background: E.surfaceWhite,
      border: `1px solid ${expanded ? E.primary : E.outlineVariant}`,
      borderRadius: 12, overflow: 'hidden',
      transition: 'border-color 0.15s',
    }}>
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', cursor: 'pointer',
          background: expanded ? E.surfaceLow : E.surfaceWhite,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10, flexShrink: 0,
            background: isCancelled ? E.redBg : isDelivered ? E.greenBg : isShipped ? '#dbeafe' : E.surfaceContainer,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isCancelled ? E.red : isDelivered ? E.green : isShipped ? E.blue : E.onSurfaceVariant,
          }}>
            <TruckIcon />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: E.primary, marginBottom: 3 }}>
              {order.id}
            </div>
            <div style={{ fontSize: 12, color: E.onSurfaceVariant, display: 'flex', alignItems: 'center', gap: 8 }}>
              {order.po_number && <span>PO: {order.po_number}</span>}
              {order.quote_ref && <span>· Quote: {order.quote_ref}</span>}
              <span>· {fmtDate(order.created_at)}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusBadge status={order.status} />
          <PaymentBadge status={order.payment_status} />
          <div style={{ fontSize: 16, fontWeight: 700, color: E.primary, fontVariantNumeric: 'tabular-nums', minWidth: 100, textAlign: 'right' }}>
            {fmt(order.total)}
          </div>
          {isShipped && order.estimated_delivery && (
            <span style={{
              fontSize: 11, fontWeight: 600, color: E.blue,
              background: '#dbeafe', padding: '2px 8px', borderRadius: 9999,
              whiteSpace: 'nowrap',
            }}>
              ETA: {daysFromNow(order.estimated_delivery)}
            </span>
          )}
          <span style={{ color: E.outline }}>
            {expanded ? <ChevUpIcon /> : <ChevDownIcon />}
          </span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${E.outlineVariant}`, padding: '20px 24px' }}>

          {/* Timeline */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: E.outline, marginBottom: 8 }}>
              Order Progress
            </div>
            <OrderTimeline status={order.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

            {/* Delivery info */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: E.outline, marginBottom: 12 }}>
                Delivery Details
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {order.shipping_address_line1 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: E.blue, marginTop: 1 }}><MapPinIcon /></span>
                    <div style={{ fontSize: 13, color: E.onSurface, lineHeight: 1.5 }}>
                      {order.shipping_address_line1}<br />
                      {order.shipping_city}, {order.shipping_province} {order.shipping_postal_code}
                    </div>
                  </div>
                )}
                {order.estimated_delivery && !isDelivered && (
                  <div>
                    <span style={{ fontSize: 11, color: E.outline }}>Estimated delivery:</span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: E.primary }}>
                      {fmtDate(order.estimated_delivery)} · <span style={{ color: E.blue }}>{daysFromNow(order.estimated_delivery)}</span>
                    </div>
                  </div>
                )}
                {isDelivered && order.delivered_at && (
                  <div>
                    <span style={{ fontSize: 11, color: E.outline }}>Delivered on:</span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: E.green }}>
                      ✓ {fmtDate(order.delivered_at)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: E.outline, marginBottom: 12 }}>
                Tracking
              </div>
              {order.courier || order.tracking_number ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {order.courier && (
                    <div>
                      <span style={{ fontSize: 11, color: E.outline }}>Courier:</span>
                      <div style={{ fontSize: 13, fontWeight: 600, color: E.primary }}>{order.courier}</div>
                    </div>
                  )}
                  {order.tracking_number && (
                    <div>
                      <span style={{ fontSize: 11, color: E.outline }}>Waybill / Tracking:</span>
                      <div style={{ fontSize: 13, fontWeight: 600, color: E.primary, fontFamily: 'monospace' }}>
                        {order.tracking_number}
                      </div>
                    </div>
                  )}
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontSize: 13, fontWeight: 600, color: E.blue,
                        textDecoration: 'none',
                      }}
                    >
                      <ExternalIcon /> Track on Courier Guy
                    </a>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: E.outline, lineHeight: 1.6 }}>
                  Tracking information will appear here once your order has been dispatched.
                </div>
              )}
            </div>

            {/* Payment + financials */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: E.outline, marginBottom: 12 }}>
                Payment
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Subtotal',  val: fmt(order.subtotal) },
                  { label: 'VAT (15%)', val: fmt(order.vat_amount) },
                  { label: 'Total',     val: fmt(order.total), bold: true },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: E.onSurfaceVariant }}>{row.label}</span>
                    <span style={{ fontWeight: row.bold ? 700 : 400, color: E.primary, fontVariantNumeric: 'tabular-nums' }}>{row.val}</span>
                  </div>
                ))}
                <div style={{ borderTop: `1px solid ${E.outlineVariant}`, paddingTop: 8, marginTop: 4 }}>
                  {order.credit_terms > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: E.onSurfaceVariant, marginBottom: 4 }}>
                      <CreditIcon /> Net {order.credit_terms} terms
                      {order.due_date && (
                        <span style={{ color: order.payment_status === 'unpaid' ? E.amber : E.green, fontWeight: 600 }}>
                          · Due {fmtDate(order.due_date)}
                        </span>
                      )}
                    </div>
                  )}
                  <PaymentBadge status={order.payment_status} />
                  {order.paid_at && (
                    <div style={{ fontSize: 11, color: E.green, marginTop: 4 }}>
                      Paid on {fmtDate(order.paid_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ──
export default function EnterpriseOrdersPage() {
  const navigate = useNavigate()

  const [orders, setOrders]     = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter]     = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/enterprise/login'); return }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, source, quote_ref, po_number,
          client_name, client_email,
          subtotal, vat_amount, total,
          status, payment_status, payment_method,
          courier, courier_waybill, tracking_url, tracking_number,
          estimated_delivery, delivered_at,
          shipping_address_line1, shipping_city, shipping_province, shipping_postal_code,
          credit_terms, due_date, paid_at,
          internal_notes, created_at, updated_at
        `)
        .eq('user_id', session.user.id)
        .eq('source', 'enterprise')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data ?? [])
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = orders.filter(o => {
    if (filter === 'all') return true
    if (filter === 'active') return ['pending', 'processing', 'shipped'].includes(o.status)
    if (filter === 'completed') return o.status === 'completed'
    if (filter === 'cancelled') return o.status === 'cancelled'
    return true
  })

  const counts = {
    all:       orders.length,
    active:    orders.filter(o => ['pending','processing','shipped'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  const totalSpend    = orders.filter(o => o.status === 'completed').reduce((s, o) => s + Number(o.total), 0)
  const pendingAmount = orders.filter(o => ['pending','processing','shipped'].includes(o.status)).reduce((s, o) => s + Number(o.total), 0)

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: E.surface, color: E.onSurface,
      WebkitFontSmoothing: 'antialiased',
      display: 'flex', minHeight: '100vh',
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
              { icon: <BoxIcon />,  label: 'Products',          path: '/enterprise/products',  active: false },
              { icon: <DocIcon />,  label: 'Quotations',        path: '/enterprise/quotes',    active: false },
              { icon: <TruckIcon/>, label: 'Orders',            path: '/enterprise/orders',    active: true  },
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', height: 64,
          borderBottom: `1px solid ${E.outlineVariant}`,
          background: E.surfaceWhite,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: E.primary, letterSpacing: '-0.02em' }}>My Orders</h1>
            <p style={{ fontSize: 12, color: E.onSurfaceVariant, marginTop: 1 }}>
              Track deliveries and manage your enterprise orders
            </p>
          </div>
          <button
            onClick={() => navigate('/enterprise/products')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: E.primary, color: E.onPrimary,
              fontSize: 13, fontWeight: 600, padding: '9px 18px',
              borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            + New Quote
          </button>
        </div>

        <div style={{ padding: '28px 32px' }}>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Total Orders',    value: counts.all,             color: E.primary  },
              { label: 'Active Orders',   value: counts.active,          color: E.blue     },
              { label: 'Total Delivered', value: counts.completed,       color: E.green    },
              { label: 'Total Spend',     value: fmt(totalSpend),        color: E.primary  },
            ].map(c => (
              <div key={c.label} style={{
                background: E.surfaceWhite, border: `1px solid ${E.outlineVariant}`,
                borderRadius: 12, padding: '18px 20px',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: E.outline, marginBottom: 6 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: c.color, fontVariantNumeric: 'tabular-nums' }}>
                  {c.value}
                </div>
              </div>
            ))}
          </div>

          {/* Active orders banner */}
          {counts.active > 0 && (
            <div style={{
              background: '#dbeafe', border: `1px solid ${E.blue}`,
              borderRadius: 10, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 12,
              marginBottom: 20,
            }}>
              <TruckIcon />
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: E.blue }}>
                  {counts.active} active order{counts.active > 1 ? 's' : ''} in progress
                </span>
                <span style={{ fontSize: 13, color: E.onSurfaceVariant, marginLeft: 8 }}>
                  — {fmt(pendingAmount)} pending delivery
                </span>
              </div>
            </div>
          )}

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: E.surfaceWhite, border: `1px solid ${E.outlineVariant}`, borderRadius: 10, padding: 4, width: 'fit-content' }}>
            {(['all', 'active', 'completed', 'cancelled'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 16px', borderRadius: 7, border: 'none',
                background: filter === f ? E.primary : 'none',
                color: filter === f ? E.onPrimary : E.onSurfaceVariant,
                fontSize: 12, fontWeight: filter === f ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>
                  {f === 'all' ? counts.all : f === 'active' ? counts.active : f === 'completed' ? counts.completed : counts.cancelled}
                </span>
              </button>
            ))}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  background: E.surfaceWhite, border: `1px solid ${E.outlineVariant}`,
                  borderRadius: 12, padding: 20, height: 80,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}>
                  <div style={{ height: 12, background: E.surfaceContainer, borderRadius: 4, width: '25%', marginBottom: 10 }} />
                  <div style={{ height: 10, background: E.surfaceContainer, borderRadius: 4, width: '50%' }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <div style={{ opacity: 0.2, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                <ShoppingIcon />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: E.onSurface, marginBottom: 8 }}>
                {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
              </div>
              <p style={{ fontSize: 13, color: E.onSurfaceVariant, marginBottom: 24, lineHeight: 1.6 }}>
                {filter === 'all'
                  ? 'Orders appear here once a quote has been approved and converted by our team.'
                  : 'Try switching to a different filter above.'}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => navigate('/enterprise/products')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: E.primary, color: E.onPrimary,
                    fontSize: 13, fontWeight: 600, padding: '11px 24px',
                    borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Browse Products
                </button>
              )}
            </div>
          )}

          {/* Orders list */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  expanded={expanded === order.id}
                  onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  )
}
