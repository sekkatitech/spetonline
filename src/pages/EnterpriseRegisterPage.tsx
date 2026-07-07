import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Truck, CreditCard } from 'lucide-react'
import { supabase } from '../lib/supabase'

// ── Design tokens (same as EnterprisePage) ──
const E = {
  primary:            '#000000',
  primaryContainer:   '#131b2e',
  onPrimary:          '#ffffff',
  secondary:          '#515f74',
  secondaryContainer: '#d5e3fd',
  onSecondaryContainer:'#57657b',
  surface:            '#f7f9fb',
  surfaceLow:         '#f2f4f6',
  surfaceContainer:   '#eceef0',
  surfaceWhite:       '#ffffff',
  onSurface:          '#191c1e',
  onSurfaceVariant:   '#45464d',
  outline:            '#76777d',
  outlineVariant:     '#c6c6cd',
  blue:               '#497cff',
  error:              '#ba1a1a',
  errorBg:            '#ffdad6',
  successBg:          '#e8f5e9',
  successText:        '#2e7d32',
}

// ── Types ──
interface FormData {
  // Step 1 — Company
  company_name:        string
  registration_number: string
  vat_number:          string
  industry:            string
  company_size:        string
  website:             string
  id_document_url:                    string
  company_registration_document_url:  string
  proof_of_address_document_url:      string
  // Step 2 — Contact
  contact_first_name:  string
  contact_last_name:   string
  contact_email:       string
  contact_phone:       string
  contact_role:        string
  // Step 3 — Address + procurement
  physical_address:    string
  city:                string
  province:            string
  postal_code:         string
  password:            string
  confirm_password:    string
}

const INITIAL: FormData = {
  company_name: '', registration_number: '', vat_number: '',
  industry: '', company_size: '', website: '',
  id_document_url: '', company_registration_document_url: '', proof_of_address_document_url: '',
  contact_first_name: '', contact_last_name: '', contact_email: '',
  contact_phone: '', contact_role: '',
  physical_address: '', city: '', province: '', postal_code: '',
  password: '', confirm_password: '',
}

const INDUSTRIES = [
  'Education', 'Government & Municipal', 'Corporate & Enterprise',
  'Mining & Industrial', 'Healthcare', 'Retail & Hospitality',
  'Financial Services', 'Construction', 'Agriculture', 'Other',
]

const PROVINCES = [
  'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
  'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape',
]

const STEPS = [
  { num: '01', label: 'Company Details' },
  { num: '02', label: 'Contact Info' },
  { num: '03', label: 'Address & Access' },
]

// ── Shared style helpers ──
const inputStyle = (error?: boolean): React.CSSProperties => ({
  width: '100%', padding: '10px 14px',
  fontSize: 14, color: E.onSurface,
  background: E.surfaceWhite,
  border: `1px solid ${error ? E.error : E.outlineVariant}`,
  borderRadius: 8, outline: 'none',
  transition: 'border-color 0.15s',
  fontFamily: 'inherit',
})

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 500,
  color: E.onSurfaceVariant, marginBottom: 6, display: 'block',
}

const fieldWrap: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 0,
}

const errorText: React.CSSProperties = {
  fontSize: 12, color: E.error, marginTop: 4,
}

// ── Header ──
function RegisterHeader() {
  const navigate = useNavigate()
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: E.surfaceWhite,
      borderBottom: `1px solid ${E.outlineVariant}`,
    }}>
      <div style={{
        maxWidth: 1320, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <a href="/enterprise" style={{ display: 'flex', alignItems: 'baseline', gap: 6, textDecoration: 'none' }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: E.primary, letterSpacing: '-0.03em' }}>SPET</span>
          <span style={{ fontSize: 14, fontWeight: 300, color: E.secondary }}>Enterprise</span>
        </a>
        <button
          onClick={() => navigate('/enterprise/login')}
          style={{
            fontSize: 13, fontWeight: 600, color: E.primary,
            background: 'none', border: `1px solid ${E.outlineVariant}`,
            borderRadius: 6, padding: '8px 16px', cursor: 'pointer',
          }}
        >
          Already registered? Login
        </button>
      </div>
    </header>
  )
}

// ── Step indicator ──
function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${E.outlineVariant}`, marginBottom: 32 }}>
      {STEPS.map((step, i) => {
        const active  = i === current
        const done    = i < current
        return (
          <div key={step.num} style={{
            flex: 1, padding: '14px 16px',
            borderBottom: active ? `2px solid ${E.primary}` : '2px solid transparent',
            display: 'flex', alignItems: 'center', gap: 10,
            cursor: done ? 'pointer' : 'default',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              background: done ? E.primary : active ? E.primary : E.surfaceContainer,
              color: done || active ? E.onPrimary : E.onSurfaceVariant,
            }}>
              {done ? <Check size={14} /> : step.num}
            </div>
            <span style={{
              fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? E.primary : done ? E.onSurfaceVariant : E.outline,
              display: 'none',
            }}
              className="step-label"
            >
              {step.label}
            </span>
            <span style={{
              fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? E.primary : done ? E.onSurfaceVariant : E.outline,
            }}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── KYC document upload field ──
function KycFileUpload({
  label, hint, field, value, error, onChange,
}: {
  label: string
  hint: string
  field: keyof FormData
  value: string
  error?: string
  onChange: (field: keyof FormData, val: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [uploadError, setUploadError] = useState('')
  const inputId = `kyc-upload-${field}`

  const handleFile = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const ext = file.name.split('.').pop()
      const path = `${crypto.randomUUID()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('kyc-documents')
        .upload(path, file, { contentType: file.type })
      if (uploadErr) throw uploadErr
      setFileName(file.name)
      onChange(field, path)
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={fieldWrap}>
      <label style={labelStyle}>{label} *</label>
      <p style={{ fontSize: 12, color: E.onSurfaceVariant, margin: '0 0 8px' }}>{hint}</p>
      <input
        id={inputId}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
      <label
        htmlFor={inputId}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          border: `1.5px dashed ${error ? E.error : (value ? '#4caf50' : E.outlineVariant)}`,
          borderRadius: 8, cursor: 'pointer',
          background: value ? '#f1f8f2' : E.surfaceWhite,
          fontSize: 13.5, color: value ? '#2e7d32' : E.onSurfaceVariant,
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        <span>
          {uploading ? 'Uploading…' : value ? `✓ ${fileName || 'File uploaded'}` : 'Click to browse for a file…'}
        </span>
        <span style={{
          fontSize: 12, fontWeight: 600, color: E.primary,
          padding: '5px 12px', borderRadius: 980, background: E.surfaceLow,
          flexShrink: 0, marginLeft: 12,
        }}>
          {value ? 'Replace' : 'Browse'}
        </span>
      </label>
      {uploadError && <span style={errorText}>{uploadError}</span>}
      {error && !uploadError && <span style={errorText}>{error}</span>}
    </div>
  )
}

// ── Step 1: Company Details ──
function Step1({
  data, onChange, errors,
}: {
  data: FormData
  onChange: (field: keyof FormData, val: string) => void
  errors: Partial<Record<keyof FormData, string>>
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Company Name *</label>
          <input
            style={inputStyle(!!errors.company_name)}
            value={data.company_name}
            onChange={e => onChange('company_name', e.target.value)}
            placeholder="e.g. Acme Tech Solutions"
          />
          {errors.company_name && <span style={errorText}>{errors.company_name}</span>}
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Registration Number (CIPC)</label>
          <input
            style={inputStyle()}
            value={data.registration_number}
            onChange={e => onChange('registration_number', e.target.value)}
            placeholder="e.g. 2024/123456/07"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>VAT Number</label>
          <input
            style={inputStyle()}
            value={data.vat_number}
            onChange={e => onChange('vat_number', e.target.value)}
            placeholder="e.g. 4123456789"
          />
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Industry *</label>
          <select
            style={{ ...inputStyle(!!errors.industry), appearance: 'none' }}
            value={data.industry}
            onChange={e => onChange('industry', e.target.value)}
          >
            <option value="">Select industry</option>
            {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
          {errors.industry && <span style={errorText}>{errors.industry}</span>}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: E.onSurface, marginBottom: 4 }}>KYC Verification Documents</p>
        <p style={{ fontSize: 12, color: E.onSurfaceVariant, marginBottom: 14, lineHeight: 1.5 }}>
          Required to verify your business and prevent fraud, in accordance with POPIA.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <KycFileUpload
            label="ID or Passport"
            hint="Upload a PDF or JPEG of your ID or passport."
            field="id_document_url"
            value={data.id_document_url}
            error={errors.id_document_url}
            onChange={onChange}
          />
          <KycFileUpload
            label="Company Registration Documents (CIPC)"
            hint="Upload a PDF of your company registration (CIPC) documents."
            field="company_registration_document_url"
            value={data.company_registration_document_url}
            error={errors.company_registration_document_url}
            onChange={onChange}
          />
          <KycFileUpload
            label="Proof of Address"
            hint="Upload a PDF or JPEG, dated within the last 3 months."
            field="proof_of_address_document_url"
            value={data.proof_of_address_document_url}
            error={errors.proof_of_address_document_url}
            onChange={onChange}
          />
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Number of Employees *</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {(['1-50', '51-500', '500+'] as const).map(size => (
            <label key={size} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px',
              border: `1.5px solid ${data.company_size === size ? E.primary : E.outlineVariant}`,
              borderRadius: 8, cursor: 'pointer',
              background: data.company_size === size ? E.surfaceLow : E.surfaceWhite,
              transition: 'border-color 0.15s, background 0.15s',
              fontSize: 14, fontWeight: data.company_size === size ? 600 : 400,
              color: E.onSurface,
            }}>
              <input
                type="radio"
                name="company_size"
                value={size}
                checked={data.company_size === size}
                onChange={() => onChange('company_size', size)}
                style={{ accentColor: E.primary }}
              />
              {size}
            </label>
          ))}
        </div>
        {errors.company_size && <span style={errorText}>{errors.company_size}</span>}
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Website (optional)</label>
        <input
          style={inputStyle()}
          value={data.website}
          onChange={e => onChange('website', e.target.value)}
          placeholder="https://www.yourcompany.co.za"
          type="url"
        />
      </div>
    </div>
  )
}

// ── Step 2: Contact Info ──
function Step2({
  data, onChange, errors,
}: {
  data: FormData
  onChange: (field: keyof FormData, val: string) => void
  errors: Partial<Record<keyof FormData, string>>
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        background: E.secondaryContainer,
        borderRadius: 8, padding: '12px 16px',
        fontSize: 13, color: E.onSecondaryContainer, lineHeight: 1.6,
      }}>
        This will be the primary contact person for the enterprise account. You can add more team members after approval.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>First Name *</label>
          <input
            style={inputStyle(!!errors.contact_first_name)}
            value={data.contact_first_name}
            onChange={e => onChange('contact_first_name', e.target.value)}
            placeholder="e.g. Thabo"
          />
          {errors.contact_first_name && <span style={errorText}>{errors.contact_first_name}</span>}
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Last Name *</label>
          <input
            style={inputStyle(!!errors.contact_last_name)}
            value={data.contact_last_name}
            onChange={e => onChange('contact_last_name', e.target.value)}
            placeholder="e.g. Nkosi"
          />
          {errors.contact_last_name && <span style={errorText}>{errors.contact_last_name}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Work Email *</label>
          <input
            style={inputStyle(!!errors.contact_email)}
            value={data.contact_email}
            onChange={e => onChange('contact_email', e.target.value)}
            placeholder="you@company.co.za"
            type="email"
          />
          {errors.contact_email && <span style={errorText}>{errors.contact_email}</span>}
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Phone Number *</label>
          <input
            style={inputStyle(!!errors.contact_phone)}
            value={data.contact_phone}
            onChange={e => onChange('contact_phone', e.target.value)}
            placeholder="e.g. 011 234 5678"
            type="tel"
          />
          {errors.contact_phone && <span style={errorText}>{errors.contact_phone}</span>}
        </div>
      </div>

      <div style={fieldWrap}>
        <label style={labelStyle}>Your Role / Job Title *</label>
        <input
          style={inputStyle(!!errors.contact_role)}
          value={data.contact_role}
          onChange={e => onChange('contact_role', e.target.value)}
          placeholder="e.g. Procurement Officer, IT Manager, CEO"
        />
        {errors.contact_role && <span style={errorText}>{errors.contact_role}</span>}
      </div>
    </div>
  )
}

// ── Step 3: Address + Password ──
function Step3({
  data, onChange, errors,
}: {
  data: FormData
  onChange: (field: keyof FormData, val: string) => void
  errors: Partial<Record<keyof FormData, string>>
}) {
  const [showPw, setShowPw] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={fieldWrap}>
        <label style={labelStyle}>Street Address *</label>
        <input
          style={inputStyle(!!errors.physical_address)}
          value={data.physical_address}
          onChange={e => onChange('physical_address', e.target.value)}
          placeholder="e.g. 12 Jan Smuts Ave"
        />
        {errors.physical_address && <span style={errorText}>{errors.physical_address}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>City *</label>
          <input
            style={inputStyle(!!errors.city)}
            value={data.city}
            onChange={e => onChange('city', e.target.value)}
            placeholder="e.g. Johannesburg"
          />
          {errors.city && <span style={errorText}>{errors.city}</span>}
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Province *</label>
          <select
            style={{ ...inputStyle(!!errors.province), appearance: 'none' }}
            value={data.province}
            onChange={e => onChange('province', e.target.value)}
          >
            <option value="">Select province</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {errors.province && <span style={errorText}>{errors.province}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Postal Code *</label>
          <input
            style={inputStyle(!!errors.postal_code)}
            value={data.postal_code}
            onChange={e => onChange('postal_code', e.target.value)}
            placeholder="e.g. 2001"
            maxLength={4}
          />
          {errors.postal_code && <span style={errorText}>{errors.postal_code}</span>}
        </div>
        <div style={fieldWrap}>
          <label style={labelStyle}>Country</label>
          <input
            style={{ ...inputStyle(), color: E.outline }}
            value="South Africa"
            disabled
          />
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${E.outlineVariant}`, paddingTop: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: E.onSurface, marginBottom: 16 }}>
          Create your portal login
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                style={inputStyle(!!errors.password)}
                value={data.password}
                onChange={e => onChange('password', e.target.value)}
                placeholder="Minimum 8 characters"
                type={showPw ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, color: E.outline,
                }}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span style={errorText}>{errors.password}</span>}
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Confirm Password *</label>
            <input
              style={inputStyle(!!errors.confirm_password)}
              value={data.confirm_password}
              onChange={e => onChange('confirm_password', e.target.value)}
              placeholder="Repeat your password"
              type={showPw ? 'text' : 'password'}
            />
            {errors.confirm_password && <span style={errorText}>{errors.confirm_password}</span>}
          </div>
        </div>
      </div>

      {/* Terms */}
      <p style={{ fontSize: 12, color: E.onSurfaceVariant, lineHeight: 1.6 }}>
        By submitting this form you agree to SPET Enterprise's{' '}
        <a href="/terms" style={{ color: E.blue }}>Terms of Service</a> and{' '}
        <a href="/privacy" style={{ color: E.blue }}>Privacy Policy</a>.
        Your application will be reviewed within 1 business day.
      </p>
    </div>
  )
}

// ── Success screen ──
function SuccessScreen({ email }: { email: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: E.successBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px', color: E.successText,
      }}>
        <Check size={28} />
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: E.primary, marginBottom: 12 }}>
        Application submitted!
      </h2>
      <p style={{ fontSize: 15, color: E.onSurfaceVariant, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 8px' }}>
        We've received your business registration for review. You'll receive a confirmation email at:
      </p>
      <p style={{ fontSize: 15, fontWeight: 600, color: E.primary, marginBottom: 24 }}>{email}</p>
      <p style={{ fontSize: 13, color: E.onSurfaceVariant, lineHeight: 1.65, maxWidth: 400, margin: '0 auto 32px' }}>
        Our team will verify your details and approve your account within <strong>1 business day</strong>.
        Once approved you'll receive login instructions to access the Enterprise Portal.
      </p>
      <a
        href="/enterprise"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: E.primary, color: E.onPrimary,
          fontSize: 14, fontWeight: 600, padding: '12px 24px',
          borderRadius: 8, textDecoration: 'none',
        }}
      >
        Back to Enterprise Home
      </a>
    </div>
  )
}

// ── Validation ──
function validate(step: number, data: FormData): Partial<Record<keyof FormData, string>> {
  const errs: Partial<Record<keyof FormData, string>> = {}
  if (step === 0) {
    if (!data.company_name.trim())  errs.company_name  = 'Company name is required'
    if (!data.industry)             errs.industry      = 'Please select an industry'
    if (!data.company_size)         errs.company_size  = 'Please select company size'
    if (!data.id_document_url)                   errs.id_document_url                  = 'Please upload an ID or passport'
    if (!data.company_registration_document_url) errs.company_registration_document_url = 'Please upload your CIPC registration document'
    if (!data.proof_of_address_document_url)      errs.proof_of_address_document_url     = 'Please upload proof of address'
  }
  if (step === 1) {
    if (!data.contact_first_name.trim()) errs.contact_first_name = 'First name is required'
    if (!data.contact_last_name.trim())  errs.contact_last_name  = 'Last name is required'
    if (!data.contact_email.trim())      errs.contact_email      = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(data.contact_email)) errs.contact_email = 'Enter a valid email'
    if (!data.contact_phone.trim())      errs.contact_phone      = 'Phone number is required'
    if (!data.contact_role.trim())       errs.contact_role       = 'Job title is required'
  }
  if (step === 2) {
    if (!data.physical_address.trim()) errs.physical_address = 'Address is required'
    if (!data.city.trim())             errs.city             = 'City is required'
    if (!data.province)                errs.province         = 'Please select a province'
    if (!data.postal_code.trim())      errs.postal_code      = 'Postal code is required'
    if (!data.password)                errs.password         = 'Password is required'
    else if (data.password.length < 8) errs.password         = 'Minimum 8 characters'
    if (data.password !== data.confirm_password) errs.confirm_password = 'Passwords do not match'
  }
  return errs
}

// ── Main Component ──
export default function EnterpriseRegisterPage() {
  const navigate  = useNavigate()
  const [step, setStep]       = useState(0)
  const [data, setData]       = useState<FormData>(INITIAL)
  const [errors, setErrors]   = useState<Partial<Record<keyof FormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone]       = useState(false)

  const onChange = (field: keyof FormData, val: string) => {
    setData(prev => ({ ...prev, [field]: val }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const handleNext = () => {
    const errs = validate(step, data)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setErrors({})
    setStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    const errs = validate(2, data)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    setSubmitError('')

    try {
      const response = await fetch('/.netlify/functions/create-enterprise-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to register. Please try again.')
      }

      setDone(true)
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      background: E.surface,
      color: E.onSurface,
      minHeight: '100vh',
      WebkitFontSmoothing: 'antialiased',
    }}>
      <RegisterHeader />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        {done ? (
          <SuccessScreen email={data.contact_email} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, alignItems: 'start' }}>

            {/* ── Left sidebar ── */}
            <div style={{ position: 'sticky', top: 88 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: E.primary, letterSpacing: '-0.02em', marginBottom: 12 }}>
                Register Your Business
              </h1>
              <p style={{ fontSize: 14, color: E.onSurfaceVariant, lineHeight: 1.65, marginBottom: 28 }}>
                Join the SPET Enterprise ecosystem. Streamline your B2B procurement with tiered pricing, priority logistics, and a dedicated account manager.
              </p>

              {/* Benefits */}
              {[
                { icon: Check, title: 'Vetted partners', body: 'Access certified IT and infrastructure brands.' },
                { icon: Truck, title: 'Priority logistics', body: 'Dedicated shipping and real-time tracking.' },
                { icon: CreditCard, title: 'Flexible credit', body: 'Net 30/60 terms for verified accounts.' },
              ].map(b => (
                <div key={b.title} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <span style={{ marginTop: 1, color: E.primary }}><b.icon size={16} /></span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: E.primary, marginBottom: 2 }}>{b.title}</div>
                    <div style={{ fontSize: 12, color: E.onSurfaceVariant, lineHeight: 1.5 }}>{b.body}</div>
                  </div>
                </div>
              ))}

              {/* KYC info card */}
              <div style={{
                background: E.primaryContainer,
                borderRadius: 10, padding: '20px',
                marginTop: 24,
              }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginBottom: 10 }}>
                  Why we ask for KYC documents
                </p>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, marginBottom: 14 }}>
                  To protect our customers and prevent fraud, SPET Enterprise may request supporting documents to verify your identity or business before processing certain orders or account applications.
                </p>

                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 8 }}>
                  You may be asked to provide:
                </p>
                <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['ID or Passport', 'Company Registration Documents (CIPC)', 'Proof of Address (within the last 3 months)'].map(item => (
                    <li key={item} style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>•</span> {item}
                    </li>
                  ))}
                </ul>

                <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 8 }}>
                  KYC is required for:
                </p>
                <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Business account registration', 'Enterprise account', 'Credit account application', 'Government department', 'Bulk procurement'].map(item => (
                    <li key={item} style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: '#4ade80', marginTop: 2, flexShrink: 0 }}><Check size={13} /></span> {item}
                    </li>
                  ))}
                </ul>

                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 12 }}>
                  All information is handled securely and in accordance with POPIA.
                </p>
              </div>
            </div>

            {/* ── Right: form ── */}
            <div style={{
              background: E.surfaceWhite,
              border: `1px solid ${E.outlineVariant}`,
              borderRadius: 16, padding: '32px 36px',
            }}>
              <StepIndicator current={step} />

              {step === 0 && <Step1 data={data} onChange={onChange} errors={errors} />}
              {step === 1 && <Step2 data={data} onChange={onChange} errors={errors} />}
              {step === 2 && <Step3 data={data} onChange={onChange} errors={errors} />}

              {/* Submit error */}
              {submitError && (
                <div style={{
                  marginTop: 16, padding: '12px 16px',
                  background: E.errorBg, borderRadius: 8,
                  fontSize: 13, color: E.error, lineHeight: 1.6,
                }}>
                  {submitError}
                </div>
              )}

              {/* Navigation buttons */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginTop: 32,
                paddingTop: 24, borderTop: `1px solid ${E.outlineVariant}`,
              }}>
                {step > 0 ? (
                  <button
                    onClick={handleBack}
                    style={{
                      fontSize: 14, fontWeight: 500, color: E.onSurfaceVariant,
                      background: 'none', border: `1px solid ${E.outlineVariant}`,
                      borderRadius: 8, padding: '11px 24px', cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    ← Back
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/enterprise')}
                    style={{
                      fontSize: 14, fontWeight: 500, color: E.onSurfaceVariant,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    ← Back to Enterprise
                  </button>
                )}

                {step < 2 ? (
                  <button
                    onClick={handleNext}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: E.primary, color: E.onPrimary,
                      fontSize: 14, fontWeight: 600, padding: '12px 28px',
                      borderRadius: 8, border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Next Step →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: loading ? E.outline : E.primary,
                      color: E.onPrimary,
                      fontSize: 14, fontWeight: 600, padding: '12px 28px',
                      borderRadius: 8, border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', transition: 'background 0.15s',
                    }}
                  >
                    {loading ? 'Submitting…' : 'Submit Application →'}
                  </button>
                )}
              </div>

              {/* Step counter */}
              <p style={{ textAlign: 'center', fontSize: 12, color: E.outline, marginTop: 16 }}>
                Step {step + 1} of 3
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .reg-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}