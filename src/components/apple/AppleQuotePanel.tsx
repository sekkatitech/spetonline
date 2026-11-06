import { useRef } from 'react'
import { Package, X } from 'lucide-react'
import { MAX_QUOTE_QTY, type AppleQuoteItem } from '../../lib/appleQuoteStore'
import { APPLE_QUOTE_TERMS, appleDeliveryNotes } from '../../lib/appleCatalogue'
import { applePrice, formatAppleName, formatAppleTitle } from '../../lib/appleFormat'
import { useDialog } from '../ui/useDialog'
import { AppleButton } from './AppleButton'
import { AppleImage } from './AppleImage'
import { AppleQtyStepper } from './AppleQtyStepper'

export interface QuoteContact {
  name: string
  phone: string
  organisation: string
  notes: string
}

interface AppleQuotePanelProps {
  open: boolean
  items: AppleQuoteItem[]
  reference: string | null
  customerEmailed: boolean
  submitting: boolean
  error: string
  contact: QuoteContact
  onContactChange: (contact: QuoteContact) => void
  onQtyChange: (id: string, qty: number) => void
  onRemove: (id: string) => void
  onSubmit: () => void
  onClose: () => void
  onBrowse: () => void
}

/** The quote basket, as a right drawer on desktop and a sheet on phones. */
export function AppleQuotePanel({
  open,
  items,
  reference,
  customerEmailed,
  submitting,
  error,
  contact,
  onContactChange,
  onQtyChange,
  onRemove,
  onSubmit,
  onClose,
  onBrowse,
}: AppleQuotePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  // Focus the panel itself rather than the close button, so opening the drawer
  // doesn't put a full focus ring around the X.
  useDialog(open, onClose, panelRef, panelRef)

  if (!open) return null

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)
  const canSubmit = items.length > 0 && !submitting && Boolean(contact.name.trim()) && Boolean(contact.phone.trim())
  const deliveries = appleDeliveryNotes(items.map((item) => item.name))

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Quote request"
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-[20px] bg-apple-surface outline-hidden sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[440px] sm:rounded-none"
      >
        <div className="flex items-center justify-between border-b border-apple-line-2 px-5 py-4">
          <h2 className="text-[17px] font-semibold text-apple-ink">
            {reference ? 'Quote request received' : 'Quote request'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quote request"
            className="flex h-9 w-9 items-center justify-center rounded-full text-apple-muted hover:bg-apple-surface-2 hover:text-apple-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {reference ? (
          <div className="flex flex-1 flex-col justify-center px-5 py-10">
            <p className="text-[14px] leading-[22px] text-apple-ink-2">
              Your reference is <strong className="text-apple-ink">{reference}</strong>.
              {customerEmailed ? ' We’ve emailed you a copy.' : ''}
            </p>
            <p className="mt-4 text-[14px] leading-[22px] text-apple-ink-2">
              Our team will confirm product availability and keep you informed throughout your order. If an item is
              temporarily out of stock, we’ll gladly assist with a special order or a suitable alternative.
            </p>
            <AppleButton className="mt-8 w-full" onClick={onClose}>
              Done
            </AppleButton>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Package className="h-8 w-8 text-apple-line" aria-hidden="true" />
                  <p className="mt-4 text-[14px] text-apple-ink-2">No configurations in your quote yet.</p>
                  <AppleButton variant="secondary" className="mt-5" onClick={onBrowse}>
                    Browse the range
                  </AppleButton>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-apple-line-2">
                    {items.map((item) => (
                      <li key={item.id} className="flex gap-3 py-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-apple-surface-2 p-1">
                          {item.image ? (
                            <AppleImage src={item.image} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <Package className="h-5 w-5 text-apple-muted" aria-hidden="true" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium leading-[18px] text-apple-ink">
                            {formatAppleTitle(item.name)}
                          </p>
                          <p className="mt-0.5 text-[12px] leading-[16px] text-apple-muted">{item.sku}</p>
                          <p className="mt-1 text-[12px] text-apple-muted">
                            {applePrice(item.price)} each
                          </p>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <AppleQtyStepper
                              value={item.qty}
                              min={1}
                              max={MAX_QUOTE_QTY}
                              label={`Quantity of ${formatAppleName(item.name)}`}
                              onChange={(qty) => onQtyChange(item.id, qty)}
                            />
                            <span className="text-[13px] font-semibold tabular-nums text-apple-ink">
                              {applePrice(item.price * item.qty)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemove(item.id)}
                          aria-label={`Remove ${formatAppleName(item.name)} from quote`}
                          className="flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-full text-apple-muted hover:bg-apple-surface-2 hover:text-apple-ink"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <fieldset className="mt-6">
                    <legend className="text-[13px] font-medium text-apple-ink">Your details</legend>
                    <div className="mt-3 space-y-3">
                      <div>
                        <label htmlFor="quote-name" className="mb-1 block text-[12px] text-apple-muted">
                          Name
                        </label>
                        <input
                          id="quote-name"
                          autoComplete="name"
                          value={contact.name}
                          onChange={(event) => onContactChange({ ...contact, name: event.target.value })}
                          className="h-11 w-full rounded-[10px] border border-apple-line bg-apple-surface px-3 text-[14px] text-apple-ink"
                        />
                      </div>
                      <div>
                        <label htmlFor="quote-phone" className="mb-1 block text-[12px] text-apple-muted">
                          Phone number
                        </label>
                        <input
                          id="quote-phone"
                          type="tel"
                          autoComplete="tel"
                          value={contact.phone}
                          onChange={(event) => onContactChange({ ...contact, phone: event.target.value })}
                          className="h-11 w-full rounded-[10px] border border-apple-line bg-apple-surface px-3 text-[14px] text-apple-ink"
                        />
                      </div>
                      <div>
                        <label htmlFor="quote-organisation" className="mb-1 block text-[12px] text-apple-muted">
                          Organisation <span className="text-apple-muted">(optional)</span>
                        </label>
                        <input
                          id="quote-organisation"
                          autoComplete="organization"
                          value={contact.organisation}
                          onChange={(event) => onContactChange({ ...contact, organisation: event.target.value })}
                          className="h-11 w-full rounded-[10px] border border-apple-line bg-apple-surface px-3 text-[14px] text-apple-ink"
                        />
                      </div>
                      <div>
                        <label htmlFor="quote-notes" className="mb-1 block text-[12px] text-apple-muted">
                          Notes <span className="text-apple-muted">(optional)</span>
                        </label>
                        <textarea
                          id="quote-notes"
                          rows={3}
                          value={contact.notes}
                          onChange={(event) => onContactChange({ ...contact, notes: event.target.value })}
                          className="w-full rounded-[10px] border border-apple-line bg-apple-surface px-3 py-2 text-[14px] text-apple-ink"
                        />
                      </div>
                    </div>
                  </fieldset>
                </>
              )}
            </div>

            <div className="border-t border-apple-line-2 px-5 pb-6 pt-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[14px] text-apple-ink-2">Estimated total</span>
                <span className="text-[18px] font-semibold tabular-nums text-apple-ink">{applePrice(total)}</span>
              </div>

              <p className="mt-2 text-[12px] leading-[18px] text-apple-muted">
                All prices include VAT. {deliveries.join(' ')} {APPLE_QUOTE_TERMS}
              </p>

              {error && (
                <p role="alert" className="mt-3 text-[13px] leading-[18px] text-apple-alert">
                  {error}
                </p>
              )}

              <AppleButton className="mt-4 w-full" onClick={onSubmit} disabled={!canSubmit}>
                {submitting ? 'Sending…' : 'Submit quote request'}
              </AppleButton>

              {items.length > 0 && !canSubmit && !submitting && (
                <p className="mt-2 text-[12px] text-apple-muted">Add your name and phone number to submit.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
