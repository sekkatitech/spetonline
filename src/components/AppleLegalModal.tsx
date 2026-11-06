import { useRef } from 'react'
import { X } from 'lucide-react'
import { useDialog } from './ui/useDialog'

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
  const panelRef = useRef<HTMLDivElement>(null)
  useDialog(true, onClose, panelRef, panelRef)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="relative max-h-[82vh] w-full max-w-[720px] overflow-y-auto rounded-[20px] bg-apple-surface p-6 text-apple-ink outline-hidden md:p-10"
      >
        <h2 className="pr-10 font-display text-[21px] font-semibold leading-[27px]">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close disclaimers"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-apple-muted hover:bg-apple-surface-2 hover:text-apple-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="mt-5">
          {sections.map((section) => (
            <div key={section.title} className="mb-5">
              {sections.length > 1 && (
                <h3 className="mb-1.5 text-[13px] font-semibold text-apple-ink">{section.title}</h3>
              )}
              {section.lines.map((line) => (
                <p key={line} className="mb-2 text-[12.5px] leading-[19px] text-apple-muted">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
