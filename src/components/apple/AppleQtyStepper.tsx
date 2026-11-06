import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'

interface AppleQtyStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
  disabled?: boolean
}

/**
 * Quantity with a real input, so a buyer ordering ten units doesn't press plus
 * ten times. Same prop shape as the storefront stepper, capped at the quote
 * limit by default.
 */
export function AppleQtyStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  label = 'Quantity',
  disabled = false,
}: AppleQtyStepperProps) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const commit = (raw: string) => {
    const parsed = Number.parseInt(raw, 10)
    if (Number.isNaN(parsed)) {
      setDraft(String(value))
      return
    }
    const next = Math.min(max, Math.max(min, parsed))
    setDraft(String(next))
    if (next !== value) onChange(next)
  }

  return (
    <div className="inline-flex items-center rounded-full border border-apple-line">
      <button
        type="button"
        onClick={() => commit(String(value - 1))}
        disabled={disabled || value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className="flex h-11 w-11 items-center justify-center rounded-l-full text-apple-ink transition-colors hover:bg-apple-surface-2 disabled:cursor-not-allowed disabled:text-apple-line"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={draft}
        disabled={disabled}
        aria-label={label}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={(event) => commit(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit((event.target as HTMLInputElement).value)
          }
        }}
        className="h-11 w-12 border-0 bg-transparent text-center text-[15px] font-semibold tabular-nums text-apple-ink [appearance:textfield] focus-visible:outline-hidden [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => commit(String(value + 1))}
        disabled={disabled || value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className="flex h-11 w-11 items-center justify-center rounded-r-full text-apple-ink transition-colors hover:bg-apple-surface-2 disabled:cursor-not-allowed disabled:text-apple-line"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
