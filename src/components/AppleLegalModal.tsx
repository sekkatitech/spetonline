import { useEffect } from 'react'
import { X } from 'lucide-react'

export interface AppleLegalSection {
  title: string
  // Product ranges this section belongs to. Leave out for notes that apply to the whole page.
  subs?: string[]
  lines: string[]
}

export default function AppleLegalModal({ title, sections, onClose }: {
  title: string
  sections: AppleLegalSection[]
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 1000 }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, maxWidth: 720, width: '100%', maxHeight: '82vh', overflow: 'auto', padding: '32px clamp(20px, 5vw, 44px)', position: 'relative', color: '#1d1d1f', textAlign: 'left' }}
      >
        <button
          onClick={onClose}
          aria-label="Close disclaimers"
          style={{ position: 'absolute', top: 18, right: 18, width: 34, height: 34, borderRadius: '50%', border: 'none', background: '#f5f5f7', cursor: 'pointer', color: '#6e6e73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        ><X size={16} /></button>
        <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 20px', paddingRight: 40 }}>{title}</h2>
        {sections.map(section => (
          <div key={section.title} style={{ marginBottom: 22 }}>
            {sections.length > 1 && <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>{section.title}</h3>}
            {section.lines.map(line => (
              <p key={line} style={{ fontSize: 12.5, lineHeight: 1.55, color: '#6e6e73', margin: '0 0 8px' }}>{line}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
