import { useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import type { AppleProduct } from '../../lib/appleTypes'
import { isWhileStocksLast } from '../../lib/appleTypes'
import { sortStorageValues } from '../../lib/appleFormat'
import { colourHex } from '../../lib/appleColours'
import {
  APPLE_SORTS,
  EMPTY_APPLE_LIST,
  activeFilterCount,
  type AppleListState,
} from '../../lib/appleQuery'
import { useDialog } from '../ui/useDialog'
import { AppleButton } from './AppleButton'

interface AppleFilterBarProps {
  /** The whole range, so an option never disappears when another filter hides its only product. */
  products: AppleProduct[]
  list: AppleListState
  onChange: (next: AppleListState) => void
  resultCount: number
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 appearance-none rounded-full border border-apple-line bg-apple-surface pl-4 pr-9 text-[13px] text-apple-ink transition-colors hover:border-apple-ink"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-apple-ink-2" aria-hidden="true" />
    </label>
  )
}

function ColourChips({
  colours,
  value,
  onSelect,
}: {
  colours: string[]
  value: string
  onSelect: (colour: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {colours.map((colour) => {
        const active = value === colour
        return (
          <button
            key={colour}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(active ? '' : colour)}
            className={`inline-flex h-9 items-center gap-2 rounded-full border pl-1.5 pr-3 text-[13px] transition-colors ${
              active
                ? 'border-apple-ink bg-apple-ink text-white'
                : 'border-apple-line bg-apple-surface text-apple-ink-2 hover:border-apple-ink'
            }`}
          >
            <span
              aria-hidden="true"
              className="h-5 w-5 rounded-full border border-black/15"
              style={{ backgroundColor: colourHex(colour) }}
            />
            {colour}
            {active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  )
}

function StoragePills({
  storages,
  value,
  onSelect,
}: {
  storages: string[]
  value: string
  onSelect: (storage: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {storages.map((storage) => {
        const active = value === storage
        return (
          <button
            key={storage}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(active ? '' : storage)}
            className={`h-9 rounded-full border px-4 text-[13px] tabular-nums transition-colors ${
              active
                ? 'border-apple-ink bg-apple-ink text-white'
                : 'border-apple-line bg-apple-surface text-apple-ink-2 hover:border-apple-ink'
            }`}
          >
            {storage}
          </button>
        )
      })}
    </div>
  )
}

/** Search, colour, storage, availability and sort for the Apple catalogue. */
export function AppleFilterBar({ products, list, onChange, resultCount }: AppleFilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const colours = useMemo(
    () =>
      [...new Set(products.map((product) => product.specs?.colour).filter((value): value is string => Boolean(value)))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [products]
  )

  const storages = useMemo(
    () =>
      sortStorageValues(
        products.map((product) => product.specs?.storage).filter((value): value is string => Boolean(value))
      ),
    [products]
  )

  const showAvailability = products.some(isWhileStocksLast)
  const filterCount = activeFilterCount(list)

  const patch = (next: Partial<AppleListState>) => onChange({ ...list, ...next })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative min-w-0 w-full lg:max-w-[360px]">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-apple-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={list.q}
            onChange={(event) => patch({ q: event.target.value })}
            placeholder="Search by name or SKU"
            aria-label="Search by product name or SKU"
            className="h-11 w-full rounded-full border border-apple-line bg-apple-surface pl-10 pr-10 text-[15px] text-apple-ink placeholder:text-apple-muted transition-colors [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />
          {list.q && (
            <button
              type="button"
              onClick={() => patch({ q: '' })}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-apple-muted hover:text-apple-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-apple-line bg-apple-surface px-4 text-[13px] font-medium text-apple-ink transition-colors hover:border-apple-ink lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            {filterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-apple-ink px-1 text-[11px] font-semibold tabular-nums text-white">
                {filterCount}
              </span>
            )}
          </button>

          <div className="ml-auto lg:ml-0">
            <FilterSelect
              label="Sort products"
              value={list.sort}
              options={APPLE_SORTS.map((option) => ({ value: option.value, label: option.label }))}
              onChange={(value) => patch({ sort: value as AppleListState['sort'] })}
            />
          </div>
        </div>
      </div>

      <div className="hidden flex-wrap items-center gap-x-6 gap-y-4 lg:flex">
        {colours.length > 0 && (
          <fieldset className="min-w-0">
            <legend className="sr-only">Colour</legend>
            <ColourChips colours={colours} value={list.colour} onSelect={(colour) => patch({ colour })} />
          </fieldset>
        )}

        {storages.length > 0 && (
          <fieldset className="min-w-0">
            <legend className="sr-only">Storage</legend>
            <StoragePills storages={storages} value={list.storage} onSelect={(storage) => patch({ storage })} />
          </fieldset>
        )}

        {showAvailability && (
          <FilterSelect
            label="Availability"
            value={list.avail}
            options={[
              { value: '', label: 'Any availability' },
              { value: 'while_stocks_last', label: 'While stocks last' },
            ]}
            onChange={(value) => patch({ avail: value })}
          />
        )}

        {filterCount > 0 && (
          <AppleButton variant="plain" size="sm" onClick={() => onChange(EMPTY_APPLE_LIST)}>
            Clear filters
          </AppleButton>
        )}
      </div>

      <AppleFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        colours={colours}
        storages={storages}
        showAvailability={showAvailability}
        list={list}
        onChange={onChange}
        resultCount={resultCount}
      />
    </div>
  )
}

function AppleFilterSheet({
  open,
  onClose,
  colours,
  storages,
  showAvailability,
  list,
  onChange,
  resultCount,
}: {
  open: boolean
  onClose: () => void
  colours: string[]
  storages: string[]
  showAvailability: boolean
  list: AppleListState
  onChange: (next: AppleListState) => void
  resultCount: number
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  useDialog(open, onClose, panelRef, panelRef)

  if (!open) return null
  const patch = (next: Partial<AppleListState>) => onChange({ ...list, ...next })

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filter Apple products"
        tabIndex={-1}
        className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-[20px] bg-apple-surface px-5 pb-6 pt-5 outline-hidden"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-apple-ink">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-9 w-9 items-center justify-center rounded-full text-apple-muted hover:bg-apple-surface-2 hover:text-apple-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {colours.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium text-apple-ink">Colour</legend>
              <ColourChips colours={colours} value={list.colour} onSelect={(colour) => patch({ colour })} />
            </fieldset>
          )}

          {storages.length > 0 && (
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium text-apple-ink">Storage</legend>
              <StoragePills storages={storages} value={list.storage} onSelect={(storage) => patch({ storage })} />
            </fieldset>
          )}

          {showAvailability && (
            <fieldset>
              <legend className="mb-2 text-[13px] font-medium text-apple-ink">Availability</legend>
              <div className="w-full">
                <FilterSelect
                  label="Availability"
                  value={list.avail}
                  options={[
                    { value: '', label: 'Any availability' },
                    { value: 'while_stocks_last', label: 'While stocks last' },
                  ]}
                  onChange={(value) => patch({ avail: value })}
                />
              </div>
            </fieldset>
          )}
        </div>

        <div className="mt-7 flex items-center gap-3">
          <AppleButton className="flex-1" onClick={onClose}>
            Show {resultCount} {resultCount === 1 ? 'product' : 'products'}
          </AppleButton>
          {activeFilterCount(list) > 0 && (
            <AppleButton variant="secondary" onClick={() => onChange(EMPTY_APPLE_LIST)}>
              Clear
            </AppleButton>
          )}
        </div>
      </div>
    </div>
  )
}
