import { Minus, Plus } from 'lucide-react';

interface QtyStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  disabled?: boolean;
}

export function QtyStepper({ value, onChange, min = 1, max = 99, label = 'Quantity', disabled = false }: QtyStepperProps) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center rounded-lg border border-spet-line bg-spet-surface">
      <button
        type="button"
        onClick={decrease}
        disabled={disabled || value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className="flex h-11 w-11 items-center justify-center text-spet-ink-2 transition-colors hover:bg-spet-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span aria-live="polite" className="min-w-9 text-center text-[13px] font-semibold tabular-nums text-spet-ink">
        {value}
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={disabled || value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className="flex h-11 w-11 items-center justify-center text-spet-ink-2 transition-colors hover:bg-spet-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
