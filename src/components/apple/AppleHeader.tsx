import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { APPLE_CATEGORIES } from '../../lib/appleCategories'
import { appleHref } from '../../lib/appleQuery'

const RESELLER_MARK = '/enterprice-images/Apple Reseller Program Logo.png'

interface AppleHeaderProps {
  /** null means the Apple home page is showing. */
  activeCategory: string | null
  counts?: Record<string, number>
  quoteCount: number
  onOpenQuote: () => void
}

function RangeLink({
  to,
  active,
  count,
  children,
}: {
  to: string
  active: boolean
  count?: number
  children: React.ReactNode
}) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`relative flex h-11 shrink-0 items-center gap-1.5 px-2.5 text-[13px] transition-colors after:absolute after:inset-x-2.5 after:bottom-0 after:h-[2px] sm:px-3 sm:after:inset-x-3 ${
        active
          ? 'font-medium text-apple-ink after:bg-apple-ink'
          : 'text-apple-muted after:bg-transparent hover:text-apple-ink'
      }`}
    >
      {children}
      {count ? <span className="hidden text-[11px] tabular-nums text-apple-muted sm:inline">{count}</span> : null}
    </Link>
  )
}

/**
 * The Apple portal bar. Two rows on every breakpoint so the Quote button never
 * wraps and the range links scroll as one line.
 */
export function AppleHeader({ activeCategory, counts = {}, quoteCount, onOpenQuote }: AppleHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-apple-line-2 bg-apple-surface">
      <div className="mx-auto flex h-[52px] max-w-[1200px] items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <Link
            to="/enterprise"
            className="flex shrink-0 items-center gap-1 text-[13px] text-apple-muted transition-colors hover:text-apple-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Enterprise
          </Link>
          <span aria-hidden="true" className="h-4 w-px shrink-0 bg-apple-line" />
          <img
            src={RESELLER_MARK}
            alt="Apple Reseller Program"
            className="h-5 w-auto max-w-[128px] shrink object-contain object-left sm:h-6 sm:max-w-none"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
          <span className="hidden truncate text-[13px] text-apple-muted md:inline">Enterprise range</span>
        </div>

        <button
          type="button"
          onClick={onOpenQuote}
          className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-medium transition-colors ${
            quoteCount > 0
              ? 'bg-apple-blue text-white hover:bg-apple-blue-dark'
              : 'bg-apple-surface-2 text-apple-ink hover:bg-apple-line-2'
          }`}
        >
          Quote
          {quoteCount > 0 && (
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold tabular-nums ${
                quoteCount > 0 ? 'bg-white text-apple-blue' : ''
              }`}
            >
              {quoteCount}
            </span>
          )}
        </button>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 md:px-8">
        <nav
          aria-label="Apple product ranges"
          className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <RangeLink to="/enterprise/apple" active={!activeCategory}>
            Apple Home
          </RangeLink>
          {APPLE_CATEGORIES.map((category) => (
            <RangeLink
              key={category.key}
              to={appleHref({ cat: category.key })}
              active={activeCategory === category.key}
              count={counts[category.key]}
            >
              {category.label}
            </RangeLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
