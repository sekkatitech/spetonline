import { Link } from 'react-router-dom'
import type { AppleProduct } from '../../lib/appleTypes'
import { specValue } from '../../lib/appleFormat'
import { colourHex } from '../../lib/appleColours'
import type { AppleModelLink, AppleVariantIndex, VariantSelection } from '../../lib/appleVariants'

interface AppleVariantPickerProps {
  index: AppleVariantIndex
  product: AppleProduct
  /** True while the next SKU is loading, so a stale Buy button can't be pressed. */
  pending?: boolean
  onChange: (selection: VariantSelection) => void
}

export function AppleVariantPicker({ index, product, pending = false, onChange }: AppleVariantPickerProps) {
  const colour = specValue(product, 'colour')
  const storage = specValue(product, 'storage')
  const showColour = index.dimensions.includes('colour')
  const showStorage = index.dimensions.includes('storage')

  if (!showColour || index.values.colour.length === 0) {
    if (!showStorage || index.values.storage.length === 0) return null
  }

  const chooseColour = (next: string) => {
    const storageOptions = index.optionsFor('storage', { colour: next })
    const nextStorage = storage && storageOptions.includes(storage) ? storage : storageOptions[0]
    onChange({ colour: next, storage: nextStorage })
  }

  return (
    <div className="mt-6 space-y-5">
      {showColour && index.values.colour.length > 0 && (
        <fieldset>
          <legend className="sr-only">Colour</legend>
          <div className="flex items-baseline justify-between">
            <span aria-hidden="true" className="text-[13px] font-medium text-apple-ink">
              Colour
            </span>
            <span className="text-[13px] text-apple-muted">{colour}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {index.values.colour.map((value) => {
              const active = value === colour
              return (
                <button
                  key={value}
                  type="button"
                  disabled={pending}
                  aria-pressed={active}
                  aria-label={value}
                  title={value}
                  onClick={() => !active && chooseColour(value)}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-shadow disabled:cursor-wait ${
                    active
                      ? 'border-apple-ink ring-2 ring-apple-ink ring-offset-2 ring-offset-apple-canvas'
                      : 'border-apple-line hover:border-apple-ink'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-full w-full rounded-full border border-black/15"
                    style={{ backgroundColor: colourHex(value) }}
                  />
                  <span className="sr-only">{active ? 'Selected' : ''}</span>
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      {showStorage && index.values.storage.length > 0 && (
        <fieldset>
          <legend className="sr-only">Storage</legend>
          <div className="flex items-baseline justify-between">
            <span aria-hidden="true" className="text-[13px] font-medium text-apple-ink">
              Storage
            </span>
            <span className="text-[13px] tabular-nums text-apple-muted">{storage}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {index.values.storage.map((value) => {
              const active = value === storage
              return (
                <button
                  key={value}
                  type="button"
                  disabled={pending}
                  aria-pressed={active}
                  onClick={() => !active && onChange({ colour, storage: value })}
                  className={`h-10 rounded-full border px-5 text-[13px] tabular-nums transition-colors disabled:cursor-wait ${
                    active
                      ? 'border-apple-ink bg-apple-ink text-white'
                      : 'border-apple-line bg-apple-surface text-apple-ink hover:border-apple-ink'
                  }`}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}
    </div>
  )
}

interface AppleModelLinksProps {
  models: AppleModelLink[]
  hrefFor: (sub: string) => string
}

/** The other models in the range, reached from a product page. */
export function AppleModelLinks({ models, hrefFor }: AppleModelLinksProps) {
  if (models.length === 0) return null

  return (
    <div className="mt-10 border-t border-apple-line pt-6">
      <h2 className="text-[15px] font-semibold text-apple-ink">Other models in this range</h2>
      <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        {models.map((model) => (
          <li key={model.sub}>
            <Link to={hrefFor(model.sub)} className="text-[13px] text-apple-blue hover:underline">
              {model.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
