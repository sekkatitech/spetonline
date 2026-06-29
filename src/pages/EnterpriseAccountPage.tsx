import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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

interface Account {
  id:                  string
  company_name:        string
  registration_number: string | null
  vat_number:          string | null
  industry:            string | null
  company_size:        string | null
  website:             string | null
  physical_address:    string | null
  city:                string | null
  province:            string | null
  postal_code:         string | null
  status:              string
  account_tier:        string
  credit_terms:        number
}

interface Profile {
  id:        string
  full_name: string | null
  email:     string
  enterprise_status: string
}

interface Member {
  id:         string
  profile_id: string
  role:       string
  full_name:  string | null
  email:      string | null
}

// ── Icons ──
function DashIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> }
function BoxIcon()     { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> }
function DocIcon()     { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function TruckIcon()   { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8zM5.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18.5 21a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/></svg> }
function ListIcon()    { return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function LogoutIcon()  { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
function UserIcon()    { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function BuildingIcon(){ return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg> }
function LockIcon()    { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> }
function TeamIcon()    { return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> }
function SaveIcon()    { return <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> }

const INDUSTRIES = ['Education','Government & Municipal','Corporate & Enterprise','Mining & Industrial','Healthcare','Retail & Hospitality','Financial Services','Construction','Agriculture','Other']
const PROVINCES  = ['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Limpopo','Mpumalanga','North West','Free State','Northern Cape']

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', fontSize: 14,
  border: `1px solid ${E.outlineVariant}`, borderRadius: 8,
  outline: 'none', fontFamily: 'inherit',
  color: E.onSurface, background: E.surfaceWhite,
  boxSizing: 'border-box' as const,
}

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 500,
  color: E.onSurfaceVariant, display: 'block', marginBottom: 6,
}

const sectionTitle: React.CSSProperties = {
  fontSize: 15, fontWeight: 600, color: E.primary,
  marginBottom: 20, paddingBottom: 12,
  borderBottom: `1px solid ${E.outlineVariant}`,
  display: 'flex', alignItems: 'center', gap: 8,
}

export default function EnterpriseAccountPage() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab]   = useState<'company' | 'contact' | 'team' | 'security'>('company')
  const [account, setAccount]       = useState<Account | null>(null)
  const [profile, setProfile]       = useState<Profile | null>(null)
  const [members, setMembers]       = useState<Member[]>([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [toast, setToast]           = useState('')

  // Company form
  const [companyForm, setCompanyForm] = useState({
    company_name: '', registration_number: '', vat_number: '',
    industry: '', company_size: '', website: '',
    physical_address: '', city: '', province: '', postal_code: '',
  })

  // Contact form
  const [contactForm, setContactForm] = useState({
    full_name: '', email: '',
  })

  // Password form
  const [pwForm, setPwForm] = useState({
    current: '', newPw: '', confirm: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState('')

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

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email, enterprise_status')
        .eq('id', session.user.id)
        .maybeSingle()

      const prof = profileData ?? {
        id: session.user.id,
        full_name: session.user.user_metadata?.full_name ?? '',
        email: session.user.email ?? '',
        enterprise_status: 'approved',
      }
      setProfile({ ...prof, email: session.user.email ?? '' })
      setContactForm({ full_name: prof.full_name ?? '', email: session.user.email ?? '' })

      // Load enterprise account
      const { data: member } = await supabase
        .from('enterprise_account_members')
        .select('account_id')
        .eq('profile_id', session.user.id)
        .single()

      if (member) {
        const { data: accountData } = await supabase
          .from('enterprise_accounts')
          .select('*')
          .eq('id', member.account_id)
          .single()

        if (accountData) {
          setAccount(accountData)
          setCompanyForm({
            company_name:        accountData.company_name ?? '',
            registration_number: accountData.registration_number ?? '',
            vat_number:          accountData.vat_number ?? '',
            industry:            accountData.industry ?? '',
            company_size:        accountData.company_size ?? '',
            website:             accountData.website ?? '',
            physical_address:    accountData.physical_address ?? '',
            city:                accountData.city ?? '',
            province:            accountData.province ?? '',
            postal_code:         accountData.postal_code ?? '',
          })

          // Load team members
          const { data: membersData } = await supabase
            .from('enterprise_account_members')
            .select('id, profile_id, role')
            .eq('account_id', member.account_id)

          if (membersData) {
            const withProfiles = await Promise.all(
              membersData.map(async m => {
                const { data: p } = await supabase
                  .from('profiles')
                  .select('full_name')
                  .eq('id', m.profile_id)
                  .maybeSingle()
                const { data: u } = await supabase.auth.admin?.getUserById?.(m.profile_id)
                  .catch(() => ({ data: null })) ?? { data: null }
                return { ...m, full_name: p?.full_name ?? null, email: null }
              })
            )
            setMembers(withProfiles)
          }
        }
      }
    } catch (err) {
      console.error('Failed to load account:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Save company details ──
  const saveCompany = async () => {
    if (!account) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('enterprise_accounts')
        .update({
          company_name:        companyForm.company_name,
          registration_number: companyForm.registration_number || null,
          vat_number:          companyForm.vat_number || null,
          industry:            companyForm.industry || null,
          company_size:        companyForm.company_size || null,
          website:             companyForm.website || null,
          physical_address:    companyForm.physical_address || null,
          city:                companyForm.city || null,
          province:            companyForm.province || null,
          postal_code:         companyForm.postal_code || null,
        })
        .eq('id', account.id)

      if (error) throw error
      showToast('✓ Company details saved')
    } catch (err: any) {
      showToast(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // ── Save contact details ──
  const saveContact = async () => {
    if (!profile) return
    setSaving(true)
    try {
      await supabase
        .from('profiles')
        .update({ full_name: contactForm.full_name })
        .eq('id', profile.id)
      showToast('✓ Contact details saved')
    } catch (err: any) {
      showToast(`Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // ── Change password ──
  const changePassword = async () => {
    setPwError('')
    if (!pwForm.newPw) { setPwError('New password is required'); return }
    if (pwForm.newPw.length < 8) { setPwError('Minimum 8 characters'); return }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match'); return }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.newPw })
      if (error) throw error
      setPwForm({ current: '', newPw: '', confirm: '' })
      showToast('✓ Password updated successfully')
    } catch (err: any) {
      setPwError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const TABS = [
    { key: 'company',  label: 'Company Details', icon: <BuildingIcon /> },
    { key: 'contact',  label: 'My Profile',      icon: <UserIcon />    },
    { key: 'team',     label: 'Team Members',    icon: <TeamIcon />    },
    { key: 'security', label: 'Security',        icon: <LockIcon />    },
  ] as const

  const tierColors: Record<string, { bg: string; color: string }> = {
    standard:   { bg: E.surfaceContainer, color: E.onSurfaceVariant },
    preferred:  { bg: '#dbeafe',          color: E.blue             },
    enterprise: { bg: E.primaryContainer, color: '#fff'             },
  }
  const tierStyle = tierColors[account?.account_tier ?? 'standard']

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: E.surface, color: E.onSurface,
      WebkitFontSmoothing: 'antialiased',
      display: 'flex', minHeight: '100vh',
    }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, minWidth: 220, background: E.surfaceWhite,
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
              { icon: <ListIcon />, label: 'Procurement Lists', path: '/enterprise/lists',     active: false },
            ].map(item => (
              <button key={item.label} onClick={() => navigate(item.path)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 12px', borderRadius: 8, border: 'none',
                background: 'none', color: E.onSurfaceVariant,
                fontSize: 13, fontWeight: 400,
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', marginBottom: 2,
              }}>
                <span style={{ color: E.outline }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div style={{ padding: '12px 10px', borderTop: `1px solid ${E.outlineVariant}` }}>
          {/* Account info */}
          {account && (
            <div style={{
              padding: '12px 14px', borderRadius: 8,
              background: E.surfaceLow, marginBottom: 8,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: E.primary, marginBottom: 2 }}>
                {account.company_name}
              </div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px',
                borderRadius: 9999, ...tierStyle,
              }}>
                {account.account_tier} tier
              </span>
            </div>
          )}
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
            <h1 style={{ fontSize: 18, fontWeight: 700, color: E.primary, letterSpacing: '-0.02em' }}>Account Settings</h1>
            <p style={{ fontSize: 12, color: E.onSurfaceVariant, marginTop: 1 }}>
              Manage your company profile, team, and security settings
            </p>
          </div>
          {account && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 12, fontWeight: 600,
                padding: '4px 12px', borderRadius: 9999,
                background: account.status === 'approved' ? E.greenBg : E.amberBg,
                color: account.status === 'approved' ? E.green : E.amber,
              }}>
                {account.status === 'approved' ? '✓ Approved Account' : 'Pending Approval'}
              </span>
            </div>
          )}
        </div>

        <div style={{ padding: '28px 32px' }}>

          {/* Account tier info strip */}
          {account && (
            <div style={{
              background: E.primaryContainer, borderRadius: 12,
              padding: '20px 24px', marginBottom: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 16,
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(124,131,155,1)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Account Overview
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{account.company_name}</div>
              </div>
              <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                {[
                  { label: 'Account Tier',   val: account.account_tier ?? '—' },
                  { label: 'Credit Terms',   val: account.credit_terms ? `Net ${account.credit_terms}` : 'Net 0' },
                  { label: 'Account Status', val: account.status },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'rgba(124,131,155,1)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 4, marginBottom: 24,
            background: E.surfaceWhite, border: `1px solid ${E.outlineVariant}`,
            borderRadius: 10, padding: 4, width: 'fit-content',
          }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 16px', borderRadius: 7, border: 'none',
                  background: activeTab === tab.key ? E.primary : 'none',
                  color: activeTab === tab.key ? E.onPrimary : E.onSurfaceVariant,
                  fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0', color: E.onSurfaceVariant, fontSize: 13 }}>
              Loading account details…
            </div>
          )}

          {/* ── Company Details Tab ── */}
          {!loading && activeTab === 'company' && (
            <div style={{ background: E.surfaceWhite, border: `1px solid ${E.outlineVariant}`, borderRadius: 12, padding: '28px 32px', maxWidth: 720 }}>
              <div style={sectionTitle}><BuildingIcon /> Company Information</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Company Name *</label>
                  <input style={inputStyle} value={companyForm.company_name} onChange={e => setCompanyForm(p => ({ ...p, company_name: e.target.value }))} placeholder="Your company name" />
                </div>
                <div>
                  <label style={labelStyle}>Registration Number (CIPC)</label>
                  <input style={inputStyle} value={companyForm.registration_number} onChange={e => setCompanyForm(p => ({ ...p, registration_number: e.target.value }))} placeholder="e.g. 2024/123456/07" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>VAT Number</label>
                  <input style={inputStyle} value={companyForm.vat_number} onChange={e => setCompanyForm(p => ({ ...p, vat_number: e.target.value }))} placeholder="e.g. 4123456789" />
                </div>
                <div>
                  <label style={labelStyle}>Industry</label>
                  <select style={{ ...inputStyle, appearance: 'none' as const }} value={companyForm.industry} onChange={e => setCompanyForm(p => ({ ...p, industry: e.target.value }))}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Company Size</label>
                  <select style={{ ...inputStyle, appearance: 'none' as const }} value={companyForm.company_size} onChange={e => setCompanyForm(p => ({ ...p, company_size: e.target.value }))}>
                    <option value="">Select size</option>
                    {['1-50','51-500','500+'].map(s => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Website</label>
                  <input style={inputStyle} value={companyForm.website} onChange={e => setCompanyForm(p => ({ ...p, website: e.target.value }))} placeholder="https://www.company.co.za" type="url" />
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${E.outlineVariant}`, paddingTop: 20, marginTop: 8, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: E.onSurface, marginBottom: 16 }}>Delivery Address</div>
                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>Street Address</label>
                  <input style={inputStyle} value={companyForm.physical_address} onChange={e => setCompanyForm(p => ({ ...p, physical_address: e.target.value }))} placeholder="e.g. 12 Main Street" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input style={inputStyle} value={companyForm.city} onChange={e => setCompanyForm(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Johannesburg" />
                  </div>
                  <div>
                    <label style={labelStyle}>Province</label>
                    <select style={{ ...inputStyle, appearance: 'none' as const }} value={companyForm.province} onChange={e => setCompanyForm(p => ({ ...p, province: e.target.value }))}>
                      <option value="">Select province</option>
                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Postal Code</label>
                    <input style={inputStyle} value={companyForm.postal_code} onChange={e => setCompanyForm(p => ({ ...p, postal_code: e.target.value }))} placeholder="e.g. 2001" maxLength={4} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: `1px solid ${E.outlineVariant}` }}>
                <button onClick={saveCompany} disabled={saving} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: E.primary, color: E.onPrimary,
                  fontSize: 13, fontWeight: 600, padding: '11px 24px',
                  borderRadius: 8, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
                }}>
                  <SaveIcon /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* ── My Profile Tab ── */}
          {!loading && activeTab === 'contact' && (
            <div style={{ background: E.surfaceWhite, border: `1px solid ${E.outlineVariant}`, borderRadius: 12, padding: '28px 32px', maxWidth: 560 }}>
              <div style={sectionTitle}><UserIcon /> My Profile</div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} value={contactForm.full_name} onChange={e => setContactForm(p => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Email Address</label>
                <input style={{ ...inputStyle, color: E.outline, background: E.surfaceLow }} value={contactForm.email} disabled />
                <p style={{ fontSize: 12, color: E.outline, marginTop: 6 }}>Email cannot be changed. Contact support if you need to update it.</p>
              </div>

              {/* Enterprise status badge */}
              <div style={{ padding: '14px 16px', background: E.surfaceLow, borderRadius: 8, marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: E.onSurfaceVariant, marginBottom: 6 }}>Enterprise Access</div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 12, fontWeight: 600, padding: '3px 10px',
                  borderRadius: 9999,
                  background: profile?.enterprise_status === 'approved' ? E.greenBg : E.amberBg,
                  color: profile?.enterprise_status === 'approved' ? E.green : E.amber,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                  {profile?.enterprise_status === 'approved' ? 'Approved' : 'Pending'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={saveContact} disabled={saving} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: E.primary, color: E.onPrimary,
                  fontSize: 13, fontWeight: 600, padding: '11px 24px',
                  borderRadius: 8, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
                }}>
                  <SaveIcon /> {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {/* ── Team Members Tab ── */}
          {!loading && activeTab === 'team' && (
            <div style={{ background: E.surfaceWhite, border: `1px solid ${E.outlineVariant}`, borderRadius: 12, padding: '28px 32px', maxWidth: 720 }}>
              <div style={sectionTitle}><TeamIcon /> Team Members</div>

              {members.length > 0 ? (
                <div style={{ border: `1px solid ${E.outlineVariant}`, borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px', padding: '10px 16px', background: E.surfaceLow, borderBottom: `1px solid ${E.outlineVariant}` }}>
                    {['Member', 'Role', 'Status'].map(h => (
                      <span key={h} style={{ fontSize: 11, fontWeight: 600, color: E.outline, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
                    ))}
                  </div>
                  {members.map((m, i) => (
                    <div key={m.id} style={{
                      display: 'grid', gridTemplateColumns: '1fr 120px 100px',
                      padding: '14px 16px', alignItems: 'center',
                      borderBottom: i < members.length - 1 ? `1px solid ${E.outlineVariant}` : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: E.primaryContainer, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700,
                        }}>
                          {(m.full_name ?? 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: E.onSurface }}>{m.full_name ?? 'Team Member'}</div>
                          <div style={{ fontSize: 12, color: E.outline }}>{m.email ?? '—'}</div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px',
                        borderRadius: 9999, textTransform: 'capitalize',
                        background: m.role === 'owner' ? E.primaryContainer : E.surfaceContainer,
                        color: m.role === 'owner' ? '#fff' : E.onSurfaceVariant,
                        width: 'fit-content',
                      }}>
                        {m.role}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px',
                        borderRadius: 9999, background: E.greenBg, color: E.green, width: 'fit-content',
                      }}>
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px', color: E.onSurfaceVariant, fontSize: 13, marginBottom: 24 }}>
                  No other team members yet.
                </div>
              )}

              <div style={{ background: E.surfaceLow, borderRadius: 8, padding: '16px 20px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: E.primary, marginBottom: 4 }}>Add team members</div>
                <div style={{ fontSize: 12, color: E.onSurfaceVariant, lineHeight: 1.6, marginBottom: 12 }}>
                  To add team members to your enterprise account, contact SPET support at <strong>sales@spetonline.co.za</strong> with the name and email of each person you'd like to add.
                </div>
                <a href="mailto:sales@spetonline.co.za?subject=Enterprise Team Member Request" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 600, color: E.blue, textDecoration: 'none',
                }}>
                  Email us to add members →
                </a>
              </div>
            </div>
          )}

          {/* ── Security Tab ── */}
          {!loading && activeTab === 'security' && (
            <div style={{ background: E.surfaceWhite, border: `1px solid ${E.outlineVariant}`, borderRadius: 12, padding: '28px 32px', maxWidth: 500 }}>
              <div style={sectionTitle}><LockIcon /> Change Password</div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>New Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    style={inputStyle}
                    type={showPw ? 'text' : 'password'}
                    value={pwForm.newPw}
                    onChange={e => { setPwForm(p => ({ ...p, newPw: e.target.value })); setPwError('') }}
                    placeholder="Minimum 8 characters"
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: E.outline, fontFamily: 'inherit',
                  }}>
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Confirm New Password *</label>
                <input
                  style={inputStyle}
                  type={showPw ? 'text' : 'password'}
                  value={pwForm.confirm}
                  onChange={e => { setPwForm(p => ({ ...p, confirm: e.target.value })); setPwError('') }}
                  placeholder="Repeat new password"
                />
              </div>

              {pwError && (
                <div style={{ background: E.redBg, border: `1px solid ${E.red}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: E.red, marginBottom: 16 }}>
                  {pwError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={changePassword} disabled={saving} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: E.primary, color: E.onPrimary,
                  fontSize: 13, fontWeight: 600, padding: '11px 24px',
                  borderRadius: 8, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', opacity: saving ? 0.7 : 1,
                }}>
                  <LockIcon /> {saving ? 'Updating…' : 'Update Password'}
                </button>
              </div>

              {/* Security info */}
              <div style={{ marginTop: 24, padding: '16px', background: E.surfaceLow, borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: E.onSurface, marginBottom: 8 }}>Security tips</div>
                {['Use at least 8 characters', 'Mix uppercase, lowercase, numbers and symbols', 'Never share your password with anyone', 'Use a unique password for this account'].map(tip => (
                  <div key={tip} style={{ fontSize: 12, color: E.onSurfaceVariant, padding: '3px 0', display: 'flex', gap: 6 }}>
                    <span style={{ color: E.green }}>✓</span> {tip}
                  </div>
                ))}
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
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  )
}
