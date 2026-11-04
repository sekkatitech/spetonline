import { useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';
import { useDialog } from './useDialog';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** Mobile filter drawer with Escape close, focus trap and focus restore. */
export function FilterSheet({ open, onClose, title = 'Filters', children }: FilterSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useDialog(open, onClose, panelRef, closeRef);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-[min(360px,92vw)] flex-col bg-spet-surface shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-spet-line px-5 py-4">
          <h2 className="font-display text-[20px] font-semibold text-spet-ink">{title}</h2>
          <IconButton ref={closeRef} label={`Close ${title.toLowerCase()}`} variant="secondary" onClick={onClose}>
            <X className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
