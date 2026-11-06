import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { AppleProduct, AppleLoadStatus } from '../../lib/appleTypes'
import { EMPTY_APPLE_LIST, appleHref } from '../../lib/appleQuery'
import { SectionHeader } from '../ui'
import { AppleButton } from './AppleButton'
import { AppleNotice } from './AppleNotice'
import { AppleProductCard } from './AppleProductCard'
import { AppleGridSkeleton } from './AppleSkeleton'

interface AppleSearchResultsProps {
  query: string
  products: AppleProduct[]
  total: number
  status: AppleLoadStatus
  onRetry: () => void
  onBuy: (product: AppleProduct) => void
  onAddToQuote: (product: AppleProduct) => void
}

const GRID = 'grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4'

/**
 * The Apple range inside store search. It keeps the Apple card — including the
 * "while stocks last" and pre-order states — rather than dressing the range as another
 * supplier, and sends the shopper to the full Apple results when they want more than a shelf.
 */
export function AppleSearchResults({ query, products, total, status, onRetry, onBuy, onAddToQuote }: AppleSearchResultsProps) {
  const viewAll = appleHref({ list: { ...EMPTY_APPLE_LIST, q: query } })

  if (status === 'loading') {
    return (
      <section aria-label="Apple" aria-busy="true">
        <SectionHeader title="Apple" description="Searching the Apple range…" />
        <AppleGridSkeleton count={4} />
      </section>
    )
  }

  if (status === 'error') {
    return (
      <section aria-label="Apple">
        <SectionHeader title="Apple" />
        <AppleNotice
          tone="error"
          title="We couldn’t search the Apple range"
          description="The Apple catalogue didn’t respond. The other results on this page are unaffected."
          action={<AppleButton onClick={onRetry}>Try again</AppleButton>}
        />
      </section>
    )
  }

  if (products.length === 0) return null

  const more = total > products.length

  return (
    <section aria-label="Apple">
      <SectionHeader
        title="Apple"
        description={
          more
            ? `Showing ${products.length} of ${total} configuration${total === 1 ? '' : 's'}`
            : `${total} configuration${total === 1 ? '' : 's'}`
        }
        action={
          <Link
            to={viewAll}
            className="flex min-h-11 shrink-0 items-center gap-1 text-[13px] font-semibold text-spet-link hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />
      <div className={GRID}>
        {products.map((product, index) => (
          <AppleProductCard
            key={product.id}
            product={product}
            onBuy={onBuy}
            onAddToQuote={onAddToQuote}
            priority={index < 4}
          />
        ))}
      </div>
    </section>
  )
}
