import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, MessageSquarePlus, X } from 'lucide-react';
import { useEngagement, type EngagementPanel } from '../../lib/engagement';
import { FeedbackForm } from './FeedbackForm';
import { NewsletterForm } from './NewsletterForm';

// Checkout and the payment result pages stay free of anything that competes with paying.
const HIDDEN_ON = [/^\/checkout/, /^\/payment-/, /^\/admin/, /^\/newsletter\//];

/**
 * "Share feedback" and "Stay connected" buttons on the middle of the left edge, clear of the
 * WhatsApp and assistant buttons (bottom right), the scroll-to-top button (bottom left) and
 * the add-to-cart / checkout bars at the foot of the screen on mobile.
 */
export function EngagementDock() {
  const { pathname } = useLocation();
  const { open, setOpen, toggle } = useEngagement();
  const dockRef = useRef<HTMLDivElement>(null);
  const hidden = HIDDEN_ON.some((re) => re.test(pathname));

  // A new page closes whatever was open.
  useEffect(() => setOpen(null), [pathname, setOpen]);

  // Escape or a click elsewhere on the page closes the panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(null);
    const onPointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (dockRef.current?.contains(target)) return;
      // The privacy dialog opened from inside a panel renders outside it.
      if (target.closest('[role="dialog"]')) return;
      // Footer and tester-page links that open a panel.
      if (target.closest('[data-engagement-open]')) return;
      setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, setOpen]);

  if (hidden) return null;

  return (
    <div ref={dockRef}>
      <div
        className="fixed left-0 top-1/2 z-[45] flex -translate-y-1/2 flex-col gap-1 rounded-r-2xl bg-spet-surface py-1.5 pl-1 pr-1.5 shadow-[0_0_0_1px_rgba(16,24,32,0.14),0_8px_24px_rgba(10,20,29,0.12)] md:py-1.5 md:pl-1.5 md:pr-2"
        role="group"
        aria-label="Feedback and newsletter"
      >
        <DockButton
          panel="feedback"
          open={open}
          label="Share feedback"
          onClick={() => toggle('feedback')}
          className="bg-spet-orange text-[#101820] hover:brightness-105"
        >
          <MessageSquarePlus className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </DockButton>
        <DockButton
          panel="newsletter"
          open={open}
          label="Stay connected"
          onClick={() => toggle('newsletter')}
          className="text-spet-blue hover:bg-spet-tint"
        >
          <Mail className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </DockButton>
      </div>

      {open === 'feedback' && (
        <EdgePanel id="engagement-feedback" title="Share feedback" onClose={() => setOpen(null)}>
          <p className="-mt-2 mb-5 text-[13.5px] leading-relaxed text-spet-muted">
            Help us improve SPET Online. No account needed. Your feedback stays private.
          </p>
          <FeedbackForm idPrefix="dock-feedback" source="widget" onDone={() => setOpen(null)} />
        </EdgePanel>
      )}

      {open === 'newsletter' && (
        <EdgePanel id="engagement-newsletter" title="Stay connected with SPET Online" onClose={() => setOpen(null)}>
          <p className="-mt-2 mb-5 text-[14px] leading-relaxed text-spet-ink-2">
            Get updates on IT products, new arrivals and special offers for your business.
          </p>
          <NewsletterForm idPrefix="dock-newsletter" source="side_panel" variant="panel" />
        </EdgePanel>
      )}
    </div>
  );
}

function DockButton({
  panel,
  open,
  label,
  onClick,
  className,
  children,
}: {
  panel: Exclude<EngagementPanel, null>;
  open: EngagementPanel;
  label: string;
  onClick: () => void;
  className: string;
  children: ReactNode;
}) {
  const active = open === panel;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      aria-controls={`engagement-${panel}`}
      aria-label={label}
      className={`group relative grid h-11 w-11 place-content-center rounded-xl transition-[translate,box-shadow] duration-200 md:h-12 md:w-12 ${className} ${
        active ? 'shadow-[0_0_0_2px_var(--color-spet-blue)] md:translate-x-0.5' : ''
      }`}
    >
      {children}
      <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 hidden -translate-y-1/2 -translate-x-1 whitespace-nowrap rounded-lg bg-spet-ink px-2.5 py-1.5 text-[12.5px] font-medium text-spet-surface opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 md:block">
        {active ? 'Close' : label}
      </span>
    </button>
  );
}

function EdgePanel({ id, title, onClose, children }: { id: string; title: string; onClose: () => void; children: ReactNode }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Focus moves into the panel when it opens and back to the button that opened it when it
  // closes, unless the visitor has already clicked into something else on the page.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    headingRef.current?.focus();
    return () => {
      const now = document.activeElement;
      if (!now || now === document.body) opener?.focus();
    };
  }, []);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="fixed left-[60px] right-3 top-[108px] z-[46] max-h-[calc(100dvh-108px-172px)] overflow-y-auto overscroll-contain rounded-2xl bg-spet-surface p-5 shadow-[0_0_0_1px_rgba(16,24,32,0.14),0_12px_32px_rgba(10,20,29,0.14)] motion-safe:animate-[engagement-slide_.4s_cubic-bezier(.34,1.4,.64,1)_both] md:left-[80px] md:right-auto md:top-[160px] md:max-h-[calc(100dvh-184px)] md:w-[392px] md:p-6"
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <h2
          id={`${id}-title`}
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-[21px] font-semibold leading-tight tracking-[-0.01em] text-spet-ink outline-none md:text-[22px]"
        >
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-2 -mt-1 grid h-9 w-9 flex-none place-content-center rounded-xl text-spet-muted transition-colors hover:bg-spet-canvas hover:text-spet-ink"
        >
          <X className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>
      </div>
      {children}
    </section>
  );
}
