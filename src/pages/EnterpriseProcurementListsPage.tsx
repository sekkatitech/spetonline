import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// ── Design tokens ──
const E = {
  primary:           '#000000',
  primaryContainer:  '#131b2e',
  onPrimary:         '#ffffff',
  secondary:         '#515f74',
  surface:           '#f7f9fb',
  surfaceLow:        '#f2f4f6',
  surfaceContainer:  '#eceef0',
  surfaceWhite:      '#ffffff',
  onSurface:         '#191c1e',
  onSurfaceVariant:  '#45464d',
  outline:           '#76777d',
  outlineVariant:    '#c6c6cd',
  blue:              '#497cff',
  green:             '#2e7d32',
  greenBg:           '#e8f5e9',
  amber:             '#f57f17',
  amberBg:           '#fff8e1',
  red:               '#c62828',
  redBg:             '#fce4e4',
}

// ── Types ──
interface ListItem {
  id:             string
  product_source: string
  product_name:   string
  sku:            string | null
  brand:          string | null
  default_qty:    number
  notes:          string | null
  sort_order:     number
}

interface ProcurementList {
  id:          string
  name:        string
  description: string | null
  is_default:  boolean
  created_at:  string
  updated_at:  string
  items:       ListItem[]
}

// ── Icons ──
function DashIcon()   { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> }
function BoxIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> }
function DocIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function TruckIcon()  { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg> }
function ListIcon()   { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function LogoutIcon() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
function PlusIcon()   { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function TrashIcon()  { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg> }
function CartIcon()   { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg> }
function StarIcon()   { return <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> }
function EditIcon()   { return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> }
function ChevDownIcon(){ return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg> }
function ChevUpIcon() { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg> }

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })

// ── Source badge ──
function SourceBadge({ source }: { source: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    esquire:    { label: 'Home & Ent.',      bg: E.surfaceContainer, color: E.onSurfaceVariant },
    syntech:    { label: 'Gaming & Comp.',   bg: '#dbeafe',          color: E.blue },
    enterprise: { label: 'Enterprise',       bg: '#ede9fe',          color: '#6d28d9' },
  }
  const s = map[source] ?? map.esquire
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

// ── New List Modal ──
function NewListModal({ onClose, onSave }: {
  onClose: () => void
  onSave:  (name: string, description: string) => void
}) {
  const [name, setName]   = useState('')
  const [desc, setDesc]   = useState('')
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!name.trim()) { setError('List name is required'); return }
    onSave(name.trim(), desc.trim())
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: E.surfaceWhite, borderRadius: 16,
          padding: '28px 32px', width: '100%', maxWidth: 440,
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: E.primary, marginBottom: 20 }}>
          Create new list
        </h2>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: E.onSurfaceVariant, display: 'block', marginBottom: 6 }}>
            List name *
          </label>
          <input
            autoFocus
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="e.g. Monthly IT Restock"
            style={{
              width: '100%', padding: '10px 14px', fontSize: 14,
              border: `1px solid ${error ? E.red : E.outlineVariant}`,
              borderRadius: 8, outline: 'none', fontFamily: 'inherit',
              color: E.onSurface, background: E.surfaceWhite,
              boxSizing: 'border-box',
            }}
          />
          {error && <span style={{ fontSize: 12, color: E.red, marginTop: 4, display: 'block' }}>{error}</span>}
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: E.onSurfaceVariant, display: 'block', marginBottom: 6 }}>
            Description (optional)
          </label>
          <textarea
            rows={3}
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="What is this list for?"
            style={{
              width: '100%', padding: '10px 14px', fontSize: 14,
              border: `1px solid ${E.outlineVariant}`,
              borderRadius: 8, outline: 'none', fontFamily: 'inherit',
              color: E.onSurface, background: E.surfaceWhite,
              resize: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px', borderRadius: 8,
              border: `1px solid ${E.outlineVariant}`,
              background: 'none', fontSize: 13, fontWeight: 500,
              color: E.onSurfaceVariant, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: E.primary, color: E.onPrimary,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Create List
          </button>
        </div>
      </div>
    </div>
  )
}

// ── List card ──
function ListCard({ list, expanded, onToggle, onDelete, onConvertToQuote, onDeleteItem, onUpdateQty }: {
  list:            ProcurementList
  expanded:        boolean
  onToggle:        () => void
  onDelete:        (id: string) => void
  onConvertToQuote:(list: ProcurementList) => void
  onDeleteItem:    (listId: string, itemId: string) => void
  onUpdateQty:     (listId: string, itemId: string, qty: number) => void
}) {
  return (
    <div style={{
      background: E.surfaceWhite,
      border: `1px solid ${expanded ? E.primary : list.is_default ? E.blue : E.outlineVariant}`,
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
            width: 42, height: 42, borderRadius: 10,
            background: list.is_default ? '#dbeafe' : E.surfaceContainer,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: list.is_default ? E.blue : E.onSurfaceVariant,
          }}>
            <ListIcon />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: E.primary }}>{list.name}</span>
              {list.is_default && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  fontSize: 10, fontWeight: 600, color: E.blue,
                  background: '#dbeafe', padding: '1px 7px', borderRadius: 9999,
                }}>
                  <StarIcon /> Default
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: E.onSurfaceVariant }}>
              {list.items.length} item{list.items.length !== 1 ? 's' : ''}
              {list.description && ` · ${list.description}`}
              {` · Updated ${fmtDate(list.updated_at)}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Convert to quote */}
          <button
            onClick={e => { e.stopPropagation(); onConvertToQuote(list) }}
            disabled={list.items.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 7, border: 'none',
              background: list.items.length === 0 ? E.surfaceContainer : E.primary,
              color: list.items.length === 0 ? E.outline : E.onPrimary,
              fontSize: 12, fontWeight: 600,
              cursor: list.items.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <CartIcon /> Convert to Quote
          </button>
          <span style={{ color: E.outline }}>
            {expanded ? <ChevUpIcon /> : <ChevDownIcon />}
          </span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${E.outlineVariant}` }}>

          {/* Items table */}
          {list.items.length > 0 ? (
            <div>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px',
                padding: '10px 20px',
                background: E.surfaceLow,
                borderBottom: `1px solid ${E.outlineVariant}`,
              }}>
                {['Product', 'Source', 'Default Qty', ''].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 600, color: E.outline, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
                ))}
              </div>

              {/* Rows */}
              {list.items.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '1fr 100px 80px 80px',
                    padding: '12px 20px', alignItems: 'center',
                    borderBottom: i < list.items.length - 1 ? `1px solid ${E.outlineVariant}` : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: E.onSurface, marginBottom: 2 }}>
                      {item.product_name}
                    </div>
                    {item.sku && (
                      <div style={{ fontSize: 11, color: E.outline, fontFamily: 'monospace' }}>
                        {item.brand && `${item.brand} · `}SKU: {item.sku}
                      </div>
                    )}
                  </div>
                  <div>
                    <SourceBadge source={item.product_source} />
                  </div>
                  <div>
                    <input
                      type="number"
                      min={1}
                      value={item.default_qty}
                      onChange={e => onUpdateQty(list.id, item.id, Math.max(1, Number(e.target.value)))}
                      style={{
                        width: 56, padding: '5px 8px', fontSize: 13,
                        border: `1px solid ${E.outlineVariant}`,
                        borderRadius: 6, outline: 'none',
                        fontFamily: 'inherit', color: E.onSurface,
                        background: E.surfaceWhite, textAlign: 'center',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onDeleteItem(list.id, item.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: E.outline, padding: 4,
                        borderRadius: 4, display: 'flex', alignItems: 'center',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = E.red}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = E.outline}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, opacity: 0.2, marginBottom: 8 }}>📋</div>
              <div style={{ fontSize: 13, color: E.onSurfaceVariant, marginBottom: 12 }}>
                This list is empty. Add products from the catalog.
              </div>
              <button
                onClick={() => {}}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: E.primary, color: E.onPrimary,
                  fontSize: 12, fontWeight: 600, padding: '8px 16px',
                  borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <PlusIcon /> Browse Catalog
              </button>
            </div>
          )}

          {/* Footer actions */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px',
            background: E.surfaceLow,
            borderTop: `1px solid ${E.outlineVariant}`,
          }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => onDelete(list.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 14px', borderRadius: 7,
                  border: `1px solid ${E.outlineVariant}`,
                  background: 'none', color: E.red,
                  fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <TrashIcon /> Delete list
              </button>
            </div>
            <div style={{ fontSize: 12, color: E.outline }}>
              Created {fmtDate(list.updated_at)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Page ──
export default function EnterpriseProcurementListsPage() {
  const navigate = useNavigate()

  const [lists, setLists]       = useState<ProcurementList[]>([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast]       = useState('')
  const [accountId, setAccountId] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { navigate('/enterprise/login'); return }

      setProfileId(session.user.id)

      // Get enterprise account
      const { data: member } = await supabase
        .from('enterprise_account_members')
        .select('account_id')
        .eq('profile_id', session.user.id)
        .single()

      if (!member) { setLoading(false); return }
      setAccountId(member.account_id)

      // Load lists
      const { data: listsData } = await supabase
        .from('enterprise_procurement_lists')
        .select('id, name, description, is_default, created_at, updated_at')
        .eq('account_id', member.account_id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (!listsData) { setLoading(false); return }

      // Load items for each list
      const listsWithItems = await Promise.all(
        listsData.map(async (list: any) => {
          const { data: items } = await supabase
            .from('enterprise_procurement_list_items')
            .select('id, product_source, product_name, sku, brand, default_qty, notes, sort_order')
            .eq('list_id', list.id)
            .order('sort_order', { ascending: true })

          return { ...list, items: items ?? [] }
        })
      )

      setLists(listsWithItems)
    } catch (err) {
      console.error('Failed to load procurement lists:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Create list ──
  const handleCreateList = async (name: string, description: string) => {
    if (!accountId || !profileId) return
    try {
      const { data, error } = await supabase
        .from('enterprise_procurement_lists')
        .insert({
          account_id:  accountId,
          created_by:  profileId,
          name,
          description: description || null,
          is_default:  lists.length === 0,
        })
        .select('id, name, description, is_default, created_at, updated_at')
        .single()

      if (error) throw error
      setLists(prev => [{ ...data, items: [] }, ...prev])
      setShowModal(false)
      setExpanded(data.id)
      showToast(`✓ "${name}" created`)
    } catch (err: any) {
      showToast(`Error: ${err.message}`)
    }
  }

  // ── Delete list ──
  const handleDeleteList = async (listId: string) => {
    if (!window.confirm('Delete this list and all its items?')) return
    try {
      await supabase.from('enterprise_procurement_lists').delete().eq('id', listId)
      setLists(prev => prev.filter(l => l.id !== listId))
      if (expanded === listId) setExpanded(null)
      showToast('List deleted')
    } catch (err: any) {
      showToast(`Error: ${err.message}`)
    }
  }

  // ── Delete item ──
  const handleDeleteItem = async (listId: string, itemId: string) => {
    try {
      await supabase.from('enterprise_procurement_list_items').delete().eq('id', itemId)
      setLists(prev => prev.map(l =>
        l.id === listId ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l
      ))
      showToast('Item removed')
    } catch (err: any) {
      showToast(`Error: ${err.message}`)
    }
  }

  // ── Update item qty ──
  const handleUpdateQty = async (listId: string, itemId: string, qty: number) => {
    try {
      await supabase
        .from('enterprise_procurement_list_items')
        .update({ default_qty: qty })
        .eq('id', itemId)

      setLists(prev => prev.map(l =>
        l.id === listId
          ? { ...l, items: l.items.map(i => i.id === itemId ? { ...i, default_qty: qty } : i) }
          : l
      ))
    } catch (err: any) {
      console.error('Failed to update qty:', err)
    }
  }

  // ── Convert list to quote ──
  const handleConvertToQuote = async (list: ProcurementList) => {
    if (list.items.length === 0) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !accountId) return

      const { data: quote, error: qErr } = await supabase
        .from('quote_requests')
        .insert({
          user_id:               session.user.id,
          enterprise_account_id: accountId,
          source:                'enterprise',
          org_name:              `${list.name} — Procurement List`,
          org_type:              'business',
          status:                'pending',
          items:                 list.items.map(i => ({
            name:  i.product_name,
            qty:   i.default_qty,
            sku:   i.sku,
            brand: i.brand,
          })),
          final_amount: 0,
        })
        .select('id, ref')
        .single()

      if (qErr) throw qErr

      // Add line items
      await supabase.from('enterprise_quote_items').insert(
        list.items.map(i => ({
          quote_id:       quote.id,
          product_source: i.product_source,
          product_name:   i.product_name,
          sku:            i.sku,
          brand:          i.brand,
          quantity:       i.default_qty,
          unit_price:     0,
        }))
      )

      showToast(`✓ Quote ${quote.ref ?? quote.id} created from list`)
      setTimeout(() => navigate('/enterprise/quotes'), 1500)
    } catch (err: any) {
      showToast(`Error: ${err.message}`)
    }
  }

  const totalItems = lists.reduce((s, l) => s + l.items.length, 0)

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
              { icon: <TruckIcon/>, label: 'Orders',            path: '/enterprise/orders',    active: false },
              { icon: <ListIcon />, label: 'Procurement Lists', path: '/enterprise/lists',     active: true  },
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
            <h1 style={{ fontSize: 18, fontWeight: 700, color: E.primary, letterSpacing: '-0.02em' }}>Procurement Lists</h1>
            <p style={{ fontSize: 12, color: E.onSurfaceVariant, marginTop: 1 }}>
              Save product sets and convert to quotes in one click
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: E.primary, color: E.onPrimary,
              fontSize: 13, fontWeight: 600, padding: '9px 18px',
              borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <PlusIcon /> New List
          </button>
        </div>

        <div style={{ padding: '28px 32px' }}>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Total Lists',   value: lists.length,    color: E.primary },
              { label: 'Total Items',   value: totalItems,       color: E.blue    },
              { label: 'Default List',  value: lists.find(l => l.is_default)?.name ?? '—', color: E.green, small: true },
            ].map(c => (
              <div key={c.label} style={{
                background: E.surfaceWhite, border: `1px solid ${E.outlineVariant}`,
                borderRadius: 12, padding: '18px 20px',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: E.outline, marginBottom: 6 }}>
                  {c.label}
                </div>
                <div style={{ fontSize: c.small ? 15 : 28, fontWeight: 700, color: c.color }}>
                  {c.value}
                </div>
              </div>
            ))}
          </div>

          {/* How it works info strip */}
          <div style={{
            background: E.surfaceContainer,
            borderRadius: 10, padding: '12px 18px',
            display: 'flex', alignItems: 'center', gap: 24,
            marginBottom: 20, flexWrap: 'wrap',
          }}>
            {[
              { step: '1', label: 'Create a list', sub: 'Name it for a purpose or project' },
              { step: '2', label: 'Add products',  sub: 'Browse catalog and save items to lists' },
              { step: '3', label: 'Set quantities', sub: 'Default qty for each product' },
              { step: '4', label: 'Convert to quote', sub: 'One click — all items go to a new quote' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 140 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', minWidth: 24,
                  background: E.primary, color: E.onPrimary,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {s.step}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: E.primary }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: E.onSurfaceVariant }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2].map(i => (
                <div key={i} style={{
                  background: E.surfaceWhite, border: `1px solid ${E.outlineVariant}`,
                  borderRadius: 12, padding: 20, height: 80,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}>
                  <div style={{ height: 12, background: E.surfaceContainer, borderRadius: 4, width: '30%', marginBottom: 10 }} />
                  <div style={{ height: 10, background: E.surfaceContainer, borderRadius: 4, width: '50%' }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && lists.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>📋</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: E.onSurface, marginBottom: 8 }}>No lists yet</div>
              <p style={{ fontSize: 13, color: E.onSurfaceVariant, marginBottom: 24, lineHeight: 1.65 }}>
                Create your first procurement list to save products for repeat ordering.
              </p>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: E.primary, color: E.onPrimary,
                  fontSize: 13, fontWeight: 600, padding: '11px 24px',
                  borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <PlusIcon /> Create First List
              </button>
            </div>
          )}

          {/* Lists */}
          {!loading && lists.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {lists.map(list => (
                <ListCard
                  key={list.id}
                  list={list}
                  expanded={expanded === list.id}
                  onToggle={() => setExpanded(expanded === list.id ? null : list.id)}
                  onDelete={handleDeleteList}
                  onConvertToQuote={handleConvertToQuote}
                  onDeleteItem={handleDeleteItem}
                  onUpdateQty={handleUpdateQty}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New list modal */}
      {showModal && (
        <NewListModal
          onClose={() => setShowModal(false)}
          onSave={handleCreateList}
        />
      )}

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
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  )
}
