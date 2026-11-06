import { useState } from 'react'
import AppleLegalModal, { type AppleLegalSection } from './AppleLegalModal'

// Loaded on demand because the legal text is long. Add a range here once its document is loaded.
const LOADERS: Record<string, () => Promise<AppleLegalSection[]>> = {
  Mac: () => import('../data/appleLegalMac').then(m => m.MAC_LEGAL),
  iPhone: () => import('../data/appleLegalIphone').then(m => m.IPHONE_LEGAL),
  iPad: () => import('../data/appleLegalIpad').then(m => m.IPAD_LEGAL),
  HomeView: () => import('../data/appleLegalHomeView').then(m => m.HOMEVIEW_LEGAL),
  HomePod: () => import('../data/appleLegalHomePod').then(m => m.HOMEPOD_LEGAL),
}

// "Disclaimers" link shown below the products of a range. On a filtered view it opens with that range's notes only.
export default function AppleRangeDisclaimers({ category, sub }: { category: string; sub?: string }) {
  const [sections, setSections] = useState<AppleLegalSection[] | null>(null)
  const load = LOADERS[category]
  if (!load) return null

  const shown = (sections || []).filter(
    section => !sub || !section.subs || section.subs.some(value => value.toLowerCase() === sub.toLowerCase())
  )

  return (
    <div className="mt-12 border-t border-apple-line pt-5 text-center">
      <button
        type="button"
        onClick={() => { load().then(setSections).catch(console.error) }}
        className="text-[13px] text-apple-blue transition-colors hover:underline"
      >
        {category} disclaimers
      </button>
      {sections && (
        <AppleLegalModal title={`${category} disclaimers`} sections={shown} onClose={() => setSections(null)} />
      )}
    </div>
  )
}
