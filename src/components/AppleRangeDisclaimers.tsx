import { useState } from 'react'
import AppleLegalModal, { type AppleLegalSection } from './AppleLegalModal'

// Loaded on demand because the legal text is long. Add a range here once its document is loaded.
const LOADERS: Record<string, () => Promise<AppleLegalSection[]>> = {
  Mac: () => import('../data/appleLegalMac').then(m => m.MAC_LEGAL),
  iPhone: () => import('../data/appleLegalIphone').then(m => m.IPHONE_LEGAL),
}

// "Disclaimers" link shown below the products of a range. On a filtered view it opens with that range's notes only.
export default function AppleRangeDisclaimers({ category, sub }: { category: string; sub?: string }) {
  const [sections, setSections] = useState<AppleLegalSection[] | null>(null)
  const load = LOADERS[category]
  if (!load) return null

  const shown = (sections || []).filter(s => !sub || !s.subs || s.subs.some(x => x.toLowerCase() === sub.toLowerCase()))

  return (
    <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #d2d2d7', textAlign: 'center' }}>
      <button
        onClick={() => { load().then(setSections).catch(console.error) }}
        style={{ background: 'none', border: 'none', color: '#0071e3', fontSize: 13, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
      >
        {category} disclaimers
      </button>
      {sections && <AppleLegalModal title={`${category} disclaimers`} sections={shown} onClose={() => setSections(null)} />}
    </div>
  )
}
