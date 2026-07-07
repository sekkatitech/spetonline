import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Check, ClipboardList } from 'lucide-react'
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
  purple:              '#6d28d9',
  purpleBg:            '#ede9fe',
}

// ── Types ──
interface QuoteItem {
  name:  string
  qty:   number
  price: number
}

interface Quote {
  id:           string
  ref:          string | null
  status:       string
  source:       string
  final_amount: number
  items:        QuoteItem[]
  org_name:     string
  admin_notes:  string | null
  created_at:   string
  updated_at:   string
  valid_until:  string | null
}

// ── Icons ──
function DashIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> }
function BoxIcon()     { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> }
function DocIcon()     { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function TruckIcon()   { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg> }
function ListIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function LogoutIcon()  { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
function PlusIcon()    { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function ChevDownIcon(){ return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg> }
function ChevUpIcon()  { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg> }
function RefreshIcon() { return <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg> }
function DownloadIcon(){ return <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> }

// ── Helpers ──
const formatPrice = (p: number) =>
  `R ${Number(p).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })

// ── Status config ──
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  pending:   { label: 'Pending Review',  bg: E.amberBg,   color: E.amber,  dot: E.amber  },
  review:    { label: 'Under Review',    bg: E.purpleBg,  color: E.purple, dot: E.purple },
  approved:  { label: 'Approved',        bg: E.greenBg,   color: E.green,  dot: E.green  },
  declined:  { label: 'Declined',        bg: E.redBg,     color: E.red,    dot: E.red    },
  invoiced:  { label: 'Invoiced',        bg: E.secondaryContainer, color: E.blue, dot: E.blue },
  paid:      { label: 'Paid',            bg: E.greenBg,   color: E.green,  dot: E.green  },
  converted: { label: 'Order Created',   bg: E.greenBg,   color: E.green,  dot: E.green  },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
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

// ── Status timeline ──
const STEPS = ['pending', 'review', 'approved', 'invoiced', 'paid']

function StatusTimeline({ status }: { status: string }) {
  const currentIndex = STEPS.indexOf(status)
  const isDeclined   = status === 'declined'

  if (isDeclined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: E.redBg, border: `2px solid ${E.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: E.red }}><X size={13} /></div>
        <span style={{ fontSize: 12, color: E.red, fontWeight: 500 }}>This quote was declined</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '12px 0' }}>
      {STEPS.map((step, i) => {
        const done    = i < currentIndex
        const active  = i === currentIndex
        const future  = i > currentIndex
        const cfg     = STATUS_CONFIG[step]
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
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
                {cfg.label.split(' ')[0]}
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

// ── Quote card ──
function QuoteCard({ quote, expanded, onToggle, onNewQuote }: {
  quote:     Quote
  expanded:  boolean
  onToggle:  () => void
  onNewQuote: () => void
}) {
  const items: QuoteItem[] = Array.isArray(quote.items) ? quote.items : []
  const isApproved = ['approved', 'invoiced', 'paid', 'converted'].includes(quote.status)
  const isDeclined = quote.status === 'declined'

  const handleDownload = () => {
    // Simple CSV download of quote items
    const rows = [
      ['SPET Enterprise Quote', quote.ref ?? quote.id, ''],
      ['Date', formatDate(quote.created_at), ''],
      ['Status', quote.status, ''],
      ['', '', ''],
      ['Product', 'Qty', 'Unit Price', 'Line Total'],
      ...items.map(i => [i.name, String(i.qty), formatPrice(i.price), formatPrice(i.price * i.qty)]),
      ['', '', 'TOTAL', formatPrice(quote.final_amount)],
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${quote.ref ?? quote.id}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{
      background: E.surfaceWhite,
      border: `1px solid ${expanded ? E.primary : E.outlineVariant}`,
      borderRadius: 12, overflow: 'hidden',
      transition: 'border-color 0.15s',
    }}>
      {/* Card header */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', cursor: 'pointer',
          background: expanded ? E.surfaceLow : E.surfaceWhite,
          transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Quote icon */}
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: isApproved ? E.greenBg : isDeclined ? E.redBg : E.surfaceContainer,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isApproved ? E.green : isDeclined ? E.red : E.onSurfaceVariant,
          }}>
            <DocIcon />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: E.primary, marginBottom: 3 }}>
              {quote.ref ?? quote.id}
            </div>
            <div style={{ fontSize: 12, color: E.onSurfaceVariant }}>
              {items.length} item{items.length !== 1 ? 's' : ''} · Submitted {formatDate(quote.created_at)} at {formatTime(quote.created_at)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusBadge status={quote.status} />
          <div style={{ fontSize: 16, fontWeight: 700, color: E.primary, fontVariantNumeric: 'tabular-nums', minWidth: 100, textAlign: 'right' }}>
            {formatPrice(quote.final_amount)}
          </div>
          <span style={{ color: E.outline }}>
            {expanded ? <ChevUpIcon /> : <ChevDownIcon />}
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${E.outlineVariant}`, padding: '20px 24px' }}>

          {/* Status timeline */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: E.outline, marginBottom: 8 }}>
              Quote Progress
            </div>
            <StatusTimeline status={quote.status} />
          </div>

          {/* Admin notes if any */}
          {quote.admin_notes && (
            <div style={{
              background: isDeclined ? E.redBg : E.secondaryContainer,
              border: `1px solid ${isDeclined ? E.red : E.outlineVariant}`,
              borderRadius: 8, padding: '12px 16px', marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: isDeclined ? E.red : E.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Note from SPET
              </div>
              <div style={{ fontSize: 13, color: E.onSurface, lineHeight: 1.6 }}>
                {quote.admin_notes}
              </div>
            </div>
          )}

          {/* Line items table */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: E.outline, marginBottom: 12 }}>
              Line Items
            </div>
            <div style={{ border: `1px solid ${E.outlineVariant}`, borderRadius: 8, overflow: 'hidden' }}>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 120px 120px',
                padding: '10px 16px',
                background: E.surfaceLow,
                borderBottom: `1px solid ${E.outlineVariant}`,
              }}>
                {['Product', 'Qty', 'Unit Price', 'Line Total'].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 600, color: E.outline, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
                ))}
              </div>
              {/* Rows */}
              {items.map((item, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '1fr 80px 120px 120px',
                  padding: '12px 16px',
                  borderBottom: i < items.length - 1 ? `1px solid ${E.outlineVariant}` : 'none',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, color: E.onSurface, fontWeight: 500, paddingRight: 12 }}>{item.name}</span>
                  <span style={{ fontSize: 13, color: E.onSurfaceVariant }}>{item.qty}</span>
                  <span style={{ fontSize: 13, color: E.onSurfaceVariant, fontVariantNumeric: 'tabular-nums' }}>{formatPrice(item.price)}</span>
                  <span style={{ fontSize: 13, color: E.primary, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
              {/* Total row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 120px 120px',
                padding: '12px 16px',
                background: E.surfaceLow,
                borderTop: `1px solid ${E.outlineVariant}`,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: E.primary, gridColumn: '1 / 4' }}>Total (excl. VAT)</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: E.primary, fontVariantNumeric: 'tabular-nums' }}>{formatPrice(quote.final_amount)}</span>
              </div>
            </div>
          </div>

          {/* Valid until */}
          {quote.valid_until && (
            <div style={{ fontSize: 12, color: E.onSurfaceVariant, marginBottom: 16 }}>
              Quote valid until: <strong>{formatDate(quote.valid_until)}</strong>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownload}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 8,
                border: `1px solid ${E.outlineVariant}`,
                background: E.surfaceWhite, color: E.onSurfaceVariant,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <DownloadIcon /> Download CSV
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              {isDeclined && (
                <button
                  onClick={onNewQuote}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', borderRadius: 8,
                    border: 'none',
                    background: E.primary, color: E.onPrimary,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <RefreshIcon /> Request New Quote
                </button>
              )}
              {isApproved && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px', borderRadius: 8,
                  background: E.greenBg,
                  fontSize: 13, fontWeight: 600, color: E.green,
                }}>
                  ✓ Approved — our team will contact you shortly
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ──
export default function EnterpriseQuotesPage() {
  const navigate = useNavigate()

  const [quotes, setQuotes]     = useState<Quote[]>([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter]     = useState<'all' | 'pending' | 'approved' | 'declined'>('all')

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/enterprise/login'); return }

      const { data, error } = await supabase
        .from('quote_requests')
        .select('id, ref, status, source, final_amount, items, org_name, admin_notes, created_at, updated_at, valid_until')
        .eq('user_id', session.user.id)
        .eq('source', 'enterprise')
        .order('created_at', { ascending: false })

      if (error) throw error
      setQuotes(data ?? [])
    } catch (err) {
      console.error('Failed to load quotes:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = quotes.filter(q => {
    if (filter === 'all') return true
    if (filter === 'pending') return ['pending', 'review'].includes(q.status)
    if (filter === 'approved') return ['approved', 'invoiced', 'paid', 'converted'].includes(q.status)
    if (filter === 'declined') return q.status === 'declined'
    return true
  })

  const counts = {
    all:      quotes.length,
    pending:  quotes.filter(q => ['pending', 'review'].includes(q.status)).length,
    approved: quotes.filter(q => ['approved', 'invoiced', 'paid', 'converted'].includes(q.status)).length,
    declined: quotes.filter(q => q.status === 'declined').length,
  }

  const totalValue = quotes
    .filter(q => ['approved', 'invoiced', 'paid'].includes(q.status))
    .reduce((s, q) => s + Number(q.final_amount), 0)

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
              { icon: <BoxIcon />,  label: 'Products',          path: '/enterprise/products',  active: false },
              { icon: <DocIcon />,  label: 'Quotations',        path: '/enterprise/quotes',    active: true  },
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
            <h1 style={{ fontSize: 18, fontWeight: 700, color: E.primary, letterSpacing: '-0.02em' }}>My Quotations</h1>
            <p style={{ fontSize: 12, color: E.onSurfaceVariant, marginTop: 1 }}>
              Track and manage all your quote requests
            </p>
          </div>
          <button
            onClick={() => navigate('/enterprise/products')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: E.primary, color: E.onPrimary,
              fontSize: 13, fontWeight: 600, padding: '9px 18px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <PlusIcon /> New Quote
          </button>
        </div>

        <div style={{ padding: '28px 32px' }}>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Total Quotes',     value: counts.all,      color: E.primary  },
              { label: 'Pending Review',   value: counts.pending,  color: E.amber    },
              { label: 'Approved',         value: counts.approved, color: E.green    },
              { label: 'Approved Value',   value: formatPrice(totalValue), color: E.blue },
            ].map(card => (
              <div key={card.label} style={{
                background: E.surfaceWhite, border: `1px solid ${E.outlineVariant}`,
                borderRadius: 12, padding: '18px 20px',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: E.outline, marginBottom: 6 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: card.color, fontVariantNumeric: 'tabular-nums' }}>
                  {card.value}
                </div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: E.surfaceWhite, border: `1px solid ${E.outlineVariant}`, borderRadius: 10, padding: 4, width: 'fit-content' }}>
            {(['all', 'pending', 'approved', 'declined'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '6px 16px', borderRadius: 7, border: 'none',
                background: filter === f ? E.primary : 'none',
                color: filter === f ? E.onPrimary : E.onSurfaceVariant,
                fontSize: 12, fontWeight: filter === f ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>
                  {f === 'all' ? counts.all : f === 'pending' ? counts.pending : f === 'approved' ? counts.approved : counts.declined}
                </span>
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  background: E.surfaceWhite, border: `1px solid ${E.outlineVariant}`,
                  borderRadius: 12, padding: 20, height: 80,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}>
                  <div style={{ height: 12, background: E.surfaceContainer, borderRadius: 4, width: '30%', marginBottom: 10 }} />
                  <div style={{ height: 10, background: E.surfaceContainer, borderRadius: 4, width: '60%' }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, opacity: 0.2 }}><ClipboardList size={48} /></div>
              <div style={{ fontSize: 16, fontWeight: 600, color: E.onSurface, marginBottom: 8 }}>
                {filter === 'all' ? 'No quotes yet' : `No ${filter} quotes`}
              </div>
              <p style={{ fontSize: 13, color: E.onSurfaceVariant, marginBottom: 24, lineHeight: 1.6 }}>
                {filter === 'all'
                  ? 'Browse the product catalog and add items to start building your first quote.'
                  : 'Try switching to a different filter above.'}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => navigate('/enterprise/products')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: E.primary, color: E.onPrimary,
                    fontSize: 13, fontWeight: 600, padding: '11px 24px',
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <PlusIcon /> Browse Products
                </button>
              )}
            </div>
          )}

          {/* Quote list */}
          {!loading && filtered.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(quote => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  expanded={expanded === quote.id}
                  onToggle={() => setExpanded(expanded === quote.id ? null : quote.id)}
                  onNewQuote={() => navigate('/enterprise/products')}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
