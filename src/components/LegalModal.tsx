import { useRef } from 'react';
import { X } from 'lucide-react';
import { LEGAL_DOCS, LegalKey } from '../lib/legalContent';
import { IconButton } from './ui/Button';
import { useDialog } from './ui/useDialog';

interface LegalModalProps {
  docKey: LegalKey | null;
  onClose: () => void;
}

export function LegalModal({ docKey, onClose }: LegalModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useDialog(Boolean(docKey), onClose, panelRef, closeRef);

  if (!docKey) return null;
  const doc = LEGAL_DOCS[docKey];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-title"
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-spet-line bg-spet-surface shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-spet-line px-5 py-4 md:px-8">
          <div>
            <h2 id="legal-title" className="font-display text-[20px] font-semibold text-spet-ink">
              {doc.title}
            </h2>
            <p className="text-[12px] text-spet-muted">SPET Online. Effective 14 May 2026.</p>
          </div>
          <IconButton ref={closeRef} label="Close" variant="secondary" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6 md:px-8">
          {doc.sections.map((section, index) => (
            <div key={index}>
              <h3 className="mb-2 text-[14px] font-semibold text-spet-ink">{section.heading}</h3>
              <div className="whitespace-pre-line text-[14px] leading-relaxed text-spet-ink-2">{section.body}</div>
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-spet-line bg-spet-surface-2 px-5 py-4 md:px-8">
          <p className="text-[12px] text-spet-muted">
            <span className="font-semibold">South African law reference: </span>
            {doc.legal}
          </p>
        </div>
      </div>
    </div>
  );
}
