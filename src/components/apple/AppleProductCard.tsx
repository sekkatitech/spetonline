import { Link } from 'react-router-dom'
import type { AppleProduct } from '../../lib/appleTypes'
import { appleAvailability, appleImage, isWhileStocksLast } from '../../lib/appleTypes'
import { applePrice, appleSaving, formatAppleName, formatAppleTitle, specHighlights } from '../../lib/appleFormat'
import { appleProductHref } from '../../lib/appleQuery'
import { isApplePreorder } from '../../lib/appleCatalogue'
import { AppleButton } from './AppleButton'
import { AppleImage } from './AppleImage'

interface AppleProductCardProps {
  product: AppleProduct
  onBuy: (product: AppleProduct) => void
  onAddToQuote: (product: AppleProduct) => void
  /** The first row is above the fold, so its images load eagerly. */
  priority?: boolean
}

/**
 * One configuration. The image, name and price stay on the page surface; only
 * the product photograph gets a well, and the buying actions sit at the bottom
 * so they line up across a row.
 */
export function AppleProductCard({ product, onBuy, onAddToQuote, priority = false }: AppleProductCardProps) {
  const name = formatAppleName(product.name)
  // The feed name carries the whole build after a colon; the heading takes the
  // model and the specification line carries chip, memory and finish.
  const title = formatAppleTitle(product.name)
  const href = appleProductHref(product.id)
  const image = appleImage(product)
  // Anything the heading already states isn't repeated beside it. This compares against
  // the heading, not the raw feed name: Mac names carry the whole build after a colon and
  // the heading drops it, so matching the raw name blanked the line and left four
  // identically titled finishes.
  const highlights = specHighlights(product, ['storage']).filter(
    (value) => !title.toLowerCase().includes(value.toLowerCase())
  )
  const saving = appleSaving(product)
  const availability = appleAvailability(product)
  const preorder = isApplePreorder(product.name)

  return (
    <article className="flex h-full flex-col">
      <Link
        to={href}
        tabIndex={-1}
        aria-hidden="true"
        className="group block overflow-hidden rounded-[18px] bg-apple-surface"
      >
        <div className="relative flex aspect-square items-center justify-center p-5">
          <AppleImage
            src={image}
            alt=""
            priority={priority}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {preorder && (
            <span className="absolute left-3 top-3 rounded-full bg-apple-alert px-2.5 py-1 text-[11px] font-semibold leading-none text-white">
              Pre-order
            </span>
          )}
        </div>
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        {isWhileStocksLast(product) && (
          <p className="mb-1 text-[12px] font-medium text-apple-alert">{availability}</p>
        )}

        <h3 className="text-[15px] font-medium leading-[21px] text-apple-ink">
          <Link to={href} aria-label={name} className="line-clamp-2 transition-colors hover:text-apple-blue">
            {title}
          </Link>
        </h3>

        {highlights.length > 0 && (
          <p className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-1 text-[13px] leading-[18px] text-apple-muted">
            {highlights.map((value) => (
              <span key={value}>{value}</span>
            ))}
          </p>
        )}

        <p className="mt-1 text-[12px] leading-[16px] text-apple-muted">{product.sku}</p>
      </div>

      <div className="mt-3">
        <p className="text-[17px] font-semibold leading-[22px] tabular-nums text-apple-ink">
          {applePrice(product.price_display)}
        </p>
        <p className="mt-0.5 text-[12px] leading-[16px] text-apple-muted">
          {saving !== null ? `Save ${applePrice(saving)} on RRP` : '\u00a0'}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {preorder ? (
          <AppleButton onClick={() => onAddToQuote(product)} size="sm" className="h-10">
            Pre-order
          </AppleButton>
        ) : (
          <>
            <AppleButton
              onClick={() => onBuy(product)}
              size="sm"
              className="h-10"
              aria-label={`Buy ${name} and continue to checkout`}
            >
              Buy
            </AppleButton>
            <AppleButton
              onClick={() => onAddToQuote(product)}
              variant="secondary"
              size="sm"
              className="h-10"
              aria-label={`Add ${name} to quote`}
            >
              Add to Quote
            </AppleButton>
          </>
        )}
      </div>
    </article>
  )
}
