import { AppleButton } from './AppleButton'

interface ApplePagerProps {
  page: number
  pageCount: number
  pageSize: number
  total: number
  onPage: (page: number) => void
}

/** Paging for ranges that run past one screen of configurations. */
export function ApplePager({ page, pageCount, pageSize, total, onPage }: ApplePagerProps) {
  if (pageCount <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <nav
      aria-label="Product pages"
      className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-apple-line-2 pt-5"
    >
      <p className="text-[13px] tabular-nums text-apple-muted">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-3">
        <AppleButton variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </AppleButton>
        <span className="text-[13px] tabular-nums text-apple-ink">
          Page {page} of {pageCount}
        </span>
        <AppleButton
          variant="secondary"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          Next
        </AppleButton>
      </div>
    </nav>
  )
}
