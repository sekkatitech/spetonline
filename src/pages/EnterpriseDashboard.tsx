import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  surfaceHigh:         '#e6e8ea',
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

// ── Types ──
interface Account {
  id:           string
  company_name: string
  account_tier: string
  status:       string
  city:         string
  province:     string
  credit_terms: number
}

interface Profile {
  id:        string
  full_name: string
  email:     string
  role:      string
  enterprise_status: string
}

interface StatCard {
  label: string
  value: string | number
  icon:  React.ReactNode
  color?: string
}

// ── Sidebar nav items ──
const NAV = [
  { icon: <DashIcon />, label: 'Dashboard',        path: '/enterprise/dashboard', active: true  },
  { icon: <BoxIcon />,  label: 'Products',          path: '/enterprise/products',  active: false },
  { icon: <WrenchIcon/>,label: 'Services',          path: '/enterprise/services',  active: false },
  { icon: <DocIcon />,  label: 'Quotations',        path: '/enterprise/quotes',    active: false },
  { icon: <TruckIcon/>, label: 'Orders',            path: '/enterprise/orders',    active: false },
  { icon: <ListIcon />, label: 'Procurement Lists', path: '/enterprise/lists',     active: false },
]

const NAV_BOTTOM = [
  { icon: <SupportIcon />, label: 'Support', path: '/enterprise/support' },
  { icon: <UserIcon />,    label: 'Account', path: '/enterprise/account' },
]

// ── Recent activity mock data (will be replaced with real data in Phase 2) ──
const ACTIVITY = [
  { icon: <DocIcon />,  title: 'Quote #QT-2026-0001', sub: 'Application registered',   time: 'Just now',    status: 'SUCCESS',  statusColor: E.green,  statusBg: E.greenBg },
  { icon: <TruckIcon/>, title: 'Account Under Review', sub: 'Pending admin approval',  time: '1 min ago',   status: 'PENDING',  statusColor: E.amber,  statusBg: E.amberBg },
  { icon: <DocIcon />,  title: 'Welcome to SPET',      sub: 'Enterprise portal access',time: 'Today',       status: 'DOC',      statusColor: E.secondary, statusBg: E.surfaceContainer },
]

// ── Shared styles ──
const card = (extra?: React.CSSProperties): React.CSSProperties => ({
  background:   E.surfaceWhite,
  border:       `1px solid ${E.outlineVariant}`,
  borderRadius: 12,
  padding:      24,
  ...extra,
})

// ── Icons ──
function DashIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> }
function BoxIcon()     { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> }
function WrenchIcon()  { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg> }
function DocIcon()     { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function TruckIcon()   { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg> }
function ListIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function SupportIcon() { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
function UserIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function QuoteIcon()   { return <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> }
function SearchIcon()  { return <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function BookIcon()    { return <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg> }
function DownloadIcon(){ return <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> }
function LogoutIcon()  { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
function BellIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> }

// ── Sidebar ──
function Sidebar({ account, profile, onLogout }: {
  account: Account | null
  profile: Profile | null
  onLogout: () => void
}) {
  const navigate = useNavigate()

  const tierColor = {
    standard:   { bg: E.surfaceContainer,  text: E.onSurfaceVariant },
    preferred:  { bg: E.secondaryContainer, text: E.blue },
    enterprise: { bg: E.primaryContainer,  text: '#fff' },
  }[account?.account_tier ?? 'standard'] ?? { bg: E.surfaceContainer, text: E.onSurfaceVariant }

  return (
    <aside style={{
      width: 220, minWidth: 220,
      background: E.surfaceWhite,
      borderRight: `1px solid ${E.outlineVariant}`,
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh', position: 'sticky', top: 0,
      overflow: 'hidden',
    }}>
      {/* Top: logo + account info */}
      <div>
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${E.outlineVariant}` }}>
          <a href="/enterprise" style={{ display: 'flex', alignItems: 'baseline', gap: 5, textDecoration: 'none', marginBottom: 16 }}>
            <span style={{ fontSize: 17, fontWeight: 800, color: E.primary, letterSpacing: '-0.03em' }}>SPET</span>
            <span style={{ fontSize: 12, fontWeight: 300, color: E.secondary }}>Enterprise</span>
          </a>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: E.outline, marginBottom: 4 }}>
            Account Overview
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: E.primary, marginBottom: 2 }}>
            {profile?.full_name ?? 'User'}
          </div>
          <div style={{ fontSize: 12, color: E.onSurfaceVariant, marginBottom: 10 }}>
            {account?.company_name ?? 'SPET Enterprise Account'}
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: tierColor.bg, color: tierColor.text,
            fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', padding: '3px 10px',
            borderRadius: 9999,
          }}>
            {account?.account_tier ?? 'Standard'} tier
          </div>
        </div>

        {/* Main nav */}
        <nav style={{ padding: '12px 10px' }}>
          {NAV.map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 12px',
                borderRadius: 8, border: 'none',
                background: item.active ? E.surfaceLow : 'none',
                color: item.active ? E.primary : E.onSurfaceVariant,
                fontSize: 13, fontWeight: item.active ? 600 : 400,
                cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit',
                marginBottom: 2,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!item.active) (e.currentTarget as HTMLButtonElement).style.background = E.surfaceLow }}
              onMouseLeave={e => { if (!item.active) (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
            >
              <span style={{ color: item.active ? E.primary : E.outline }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom nav */}
      <div style={{ padding: '12px 10px', borderTop: `1px solid ${E.outlineVariant}` }}>
        {NAV_BOTTOM.map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '9px 12px',
              borderRadius: 8, border: 'none', background: 'none',
              color: E.onSurfaceVariant, fontSize: 13, fontWeight: 400,
              cursor: 'pointer', fontFamily: 'inherit', marginBottom: 2,
              textAlign: 'left',
            }}
          >
            <span style={{ color: E.outline }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '9px 12px',
            borderRadius: 8, border: 'none', background: 'none',
            color: E.red, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
            textAlign: 'left', marginTop: 4,
          }}
        >
          <LogoutIcon /> Sign Out
        </button>
      </div>
    </aside>
  )
}

// ── Top bar ──
function TopBar({ profile, account }: { profile: Profile | null; account: Account | null }) {
  const navigate = useNavigate()
  const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' })

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 64,
      borderBottom: `1px solid ${E.outlineVariant}`,
      background: E.surfaceWhite,
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {/* Page title */}
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: E.primary, letterSpacing: '-0.02em' }}>
          Welcome Back, {account?.company_name ?? 'Enterprise Client'}.
        </h1>
        <p style={{ fontSize: 12, color: E.onSurfaceVariant, marginTop: 2 }}>
          Here is an overview of your procurement activities for {month}.
        </p>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Notification bell */}
        <button style={{
          width: 36, height: 36, borderRadius: 8,
          background: E.surfaceLow, border: `1px solid ${E.outlineVariant}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', position: 'relative',
          color: E.onSurfaceVariant,
        }}>
          <BellIcon />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, borderRadius: '50%',
            background: E.red, border: `2px solid ${E.surfaceWhite}`,
          }} />
        </button>

        {/* Request Quote CTA */}
        <button
          onClick={() => navigate('/enterprise/quotes/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: E.primary, color: E.onPrimary,
            fontSize: 13, fontWeight: 600, padding: '8px 18px',
            borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <QuoteIcon /> Request Quote
        </button>

        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: E.primaryContainer,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff',
          cursor: 'pointer',
        }}>
          {(profile?.full_name ?? 'U').charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  )
}

// ── Stat cards row ──
function StatCards({ account }: { account: Account | null }) {
  const stats: StatCard[] = [
    {
      label: 'Active Quotes',
      value: 0,
      icon: <DocIcon />,
      color: E.blue,
    },
    {
      label: 'Pending Orders',
      value: 0,
      icon: <TruckIcon />,
      color: E.amber,
    },
    {
      label: 'Monthly Spend',
      value: 'R 0',
      icon: <span style={{ fontSize: 18, fontWeight: 700 }}>R</span>,
      color: E.green,
    },
    {
      label: 'Open Invoices',
      value: 0,
      icon: <DocIcon />,
      color: E.red,
    },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
      {stats.map(stat => (
        <div key={stat.label} style={card()}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: E.onSurfaceVariant, marginBottom: 10 }}>
            {stat.label}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ fontSize: stat.label === 'Monthly Spend' ? 28 : 40, fontWeight: 700, color: E.primary, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: E.surfaceLow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: stat.color,
            }}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Quick Actions ──
function QuickActions() {
  const navigate = useNavigate()

  const actions = [
    { icon: <QuoteIcon />,    label: 'Request\nQuote',     dark: true,  onClick: () => navigate('/enterprise/quotes/new') },
    { icon: <SearchIcon />,   label: 'Browse\nProducts',   dark: false, onClick: () => navigate('/enterprise/products') },
    { icon: <BookIcon />,     label: 'Book\nService',      dark: false, onClick: () => navigate('/enterprise/services') },
    { icon: <DownloadIcon />, label: 'Download\nStatement',dark: false, onClick: () => navigate('/enterprise/statements') },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: E.primary, marginBottom: 14 }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {actions.map(a => (
          <button
            key={a.label}
            onClick={a.onClick}
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 10, padding: '20px 16px',
              background: a.dark ? E.primary : E.surfaceWhite,
              border: `1px solid ${a.dark ? E.primary : E.outlineVariant}`,
              borderRadius: 12, cursor: 'pointer',
              color: a.dark ? E.onPrimary : E.onSurfaceVariant,
              fontFamily: 'inherit', textAlign: 'center',
              transition: 'transform 0.15s, box-shadow 0.15s',
              minHeight: 100,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = ''
              ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
            }}
          >
            {a.icon}
            <span style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, whiteSpace: 'pre-line' }}>
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Featured product banner ──
function FeaturedBanner() {
  return (
    <div style={{
      marginTop: 20,
      background: E.primaryContainer,
      borderRadius: 12, padding: '24px 28px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
      }} />
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        background: 'rgba(255,255,255,0.12)',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase',
        padding: '3px 10px', borderRadius: 9999, marginBottom: 10,
      }}>
        New Arrival
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
        Enterprise Tech Catalogue — June 2026
      </h3>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 16, lineHeight: 1.5 }}>
        Bulk discounts now available for verified enterprise partners across all HP, Dell and Lenovo ranges.
      </p>
      <button style={{
        background: '#fff', color: E.primary,
        fontSize: 13, fontWeight: 600, padding: '8px 20px',
        borderRadius: 6, border: 'none', cursor: 'pointer',
        fontFamily: 'inherit',
      }}>
        Browse Catalogue →
      </button>
    </div>
  )
}

// ── Recent Activity ──
function RecentActivity() {
  return (
    <div style={{ ...card(), height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: E.primary }}>Recent Activity</h2>
        <button style={{
          fontSize: 12, fontWeight: 600, color: E.blue,
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          View All
        </button>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto',
        padding: '6px 0', borderBottom: `1px solid ${E.outlineVariant}`,
        marginBottom: 4,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: E.outline, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: E.outline, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
      </div>

      {ACTIVITY.map((item, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '1fr auto',
          alignItems: 'center', padding: '12px 0',
          borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${E.outlineVariant}` : 'none',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{
              width: 32, height: 32, minWidth: 32, borderRadius: 8,
              background: E.surfaceLow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: E.onSurfaceVariant, marginTop: 2,
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: E.primary, marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: E.onSurfaceVariant }}>{item.sub}</div>
              <div style={{ fontSize: 11, color: E.outline, marginTop: 3 }}>{item.time}</div>
            </div>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            padding: '3px 8px', borderRadius: 9999,
            background: item.statusBg, color: item.statusColor,
            whiteSpace: 'nowrap',
          }}>
            {item.status}
          </span>
        </div>
      ))}

      {/* Empty state hint */}
      <div style={{
        marginTop: 16, padding: '14px 16px',
        background: E.surfaceLow, borderRadius: 8,
        fontSize: 12, color: E.onSurfaceVariant, lineHeight: 1.6,
        textAlign: 'center',
      }}>
        Your quotes and orders will appear here once your account is approved.
      </div>
    </div>
  )
}

// ── Pending approval banner ──
function PendingBanner({ company }: { company: string }) {
  return (
    <div style={{
      background: E.amberBg,
      border: `1px solid ${E.amber}`,
      borderRadius: 12, padding: '16px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
      marginBottom: 24,
    }}>
      <div style={{
        width: 36, height: 36, minWidth: 36, borderRadius: '50%',
        background: E.amber,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, color: '#fff',
      }}>
        ⏳
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: E.amber, marginBottom: 2 }}>
          Account Pending Approval
        </div>
        <div style={{ fontSize: 13, color: E.onSurfaceVariant, lineHeight: 1.5 }}>
          <strong>{company}</strong>'s application is under review. Our team will approve your account within 1 business day.
          You'll receive an email at the address you registered with once approved.
        </div>
      </div>
    </div>
  )
}

// ── Loading skeleton ──
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: E.surface,
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: `3px solid ${E.outlineVariant}`,
        borderTopColor: E.primary,
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontSize: 14, color: E.onSurfaceVariant, fontFamily: 'Inter, sans-serif' }}>
        Loading your dashboard…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Main Dashboard Component ──
export default function EnterpriseDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [account, setAccount]   = useState<Account | null>(null)
  const [loading, setLoading]   = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      // 1. Check auth session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/enterprise/login')
        return
      }

      // 2. Load profile — use maybeSingle to handle RLS gracefully
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, enterprise_status')
        .eq('id', session.user.id)
        .maybeSingle()

      // If profile row not yet available, build from session metadata
      const profile = profileData ?? {
        id:                session.user.id,
        full_name:         session.user.user_metadata?.full_name ?? 'User',
        email:             session.user.email ?? '',
        role:              session.user.user_metadata?.role ?? 'enterprise',
        enterprise_status: 'approved',
      }

      // 3. Check access — allow admin, super_admin and approved/pending enterprise
      const hasAccess =
        ['admin', 'super_admin'].includes(profile.role) ||
        ['approved', 'pending'].includes(profile.enterprise_status)

      if (!hasAccess) {
        navigate('/enterprise/login')
        return
      }

      setProfile({ ...profile, email: session.user.email ?? '' })

      // 4. Load enterprise account
      const { data: memberData } = await supabase
        .from('enterprise_account_members')
        .select('account_id, role')
        .eq('profile_id', session.user.id)
        .single()

      if (memberData) {
        const { data: accountData } = await supabase
          .from('enterprise_accounts')
          .select('id, company_name, account_tier, status, city, province, credit_terms')
          .eq('id', memberData.account_id)
          .single()

        if (accountData) setAccount(accountData)
      }

    } catch (err) {
      setAuthError('Something went wrong loading your dashboard.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/enterprise')
  }

  if (loading) return <LoadingScreen />

  if (authError) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: E.surface, fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 380 }}>
          <p style={{ fontSize: 15, color: E.red, marginBottom: 16 }}>{authError}</p>
          <button
            onClick={() => navigate('/enterprise/login')}
            style={{
              background: E.primary, color: E.onPrimary,
              fontSize: 14, fontWeight: 600, padding: '11px 24px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  const isPending = profile?.enterprise_status === 'pending' || account?.status === 'pending'

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: E.surface,
      color: E.onSurface,
      WebkitFontSmoothing: 'antialiased',
      display: 'flex',
      minHeight: '100vh',
    }}>
      {/* Sidebar */}
      <Sidebar account={account} profile={profile} onLogout={handleLogout} />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <TopBar profile={profile} account={account} />

        {/* Page body */}
        <main style={{ padding: '28px 32px', flex: 1 }}>
          {/* Pending approval banner */}
          {isPending && account && (
            <PendingBanner company={account.company_name} />
          )}

          {/* Stat cards */}
          <StatCards account={account} />

          {/* Two column layout: actions + activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            {/* Left: quick actions + featured banner */}
            <div>
              <QuickActions />
              <FeaturedBanner />
            </div>

            {/* Right: recent activity */}
            <RecentActivity />
          </div>

          {/* Account info strip */}
          <div style={{
            marginTop: 24,
            ...card({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }),
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: E.outline, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>
                Account Details
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: E.primary }}>
                {account?.company_name} · {account?.city}, {account?.province}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              {[
                { label: 'Account Tier',   val: account?.account_tier ?? '—' },
                { label: 'Credit Terms',   val: account?.credit_terms ? `Net ${account.credit_terms}` : 'Net 0' },
                { label: 'Account Status', val: account?.status ?? '—' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: E.outline, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: item.val === 'approved' ? E.green : item.val === 'pending' ? E.amber : E.primary,
                    textTransform: 'capitalize',
                  }}>
                    {item.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}