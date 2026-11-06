// Catalogue state for the Apple range lives in the URL, so the browser's Back
// button returns the shopper to the same filters they left a product from.

import type { AppleProduct } from './appleTypes'
import { isWhileStocksLast } from './appleTypes'

export const APPLE_SORTS = [
  // Only used by search, where the function has already ranked the matches.
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
] as const

export type AppleSort = (typeof APPLE_SORTS)[number]['value']

/** Ranges run to a few hundred rows, so the grid pages rather than rendering them all. */
export const APPLE_PAGE_SIZE = 24

export interface AppleListState {
  q: string
  colour: string
  storage: string
  avail: string
  sort: AppleSort
  page: number
}

export const EMPTY_APPLE_LIST: AppleListState = {
  q: '',
  colour: '',
  storage: '',
  avail: '',
  sort: 'price_asc',
  page: 1,
}

export function readAppleList(params: URLSearchParams): AppleListState {
  const sort = params.get('sort')
  const page = Number.parseInt(params.get('page') ?? '1', 10)
  return {
    q: params.get('q') ?? '',
    colour: params.get('colour') ?? '',
    storage: params.get('storage') ?? '',
    avail: params.get('avail') ?? '',
    sort: APPLE_SORTS.some((option) => option.value === sort) ? (sort as AppleSort) : 'price_asc',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  }
}

export function appleListParams(list: AppleListState): Record<string, string> {
  const params: Record<string, string> = {}
  if (list.q) params.q = list.q
  if (list.colour) params.colour = list.colour
  if (list.storage) params.storage = list.storage
  if (list.avail) params.avail = list.avail
  if (list.sort !== EMPTY_APPLE_LIST.sort) params.sort = list.sort
  if (list.page > 1) params.page = String(list.page)
  return params
}

export function activeFilterCount(list: AppleListState): number {
  return [list.q, list.colour, list.storage, list.avail].filter(Boolean).length
}

interface AppleHrefOptions {
  cat?: string | null
  sub?: string | null
  view?: 'shop' | null
  quote?: boolean
  list?: AppleListState
}

/** One place that builds Apple URLs, so no navigation silently drops a mode. */
export function appleHref({ cat, sub, view, quote, list }: AppleHrefOptions = {}): string {
  const params = new URLSearchParams()
  if (cat) params.set('cat', cat)
  if (sub) params.set('sub', sub)
  if (view === 'shop') params.set('view', 'shop')
  if (quote) params.set('quote', 'open')
  if (list) {
    for (const [key, value] of Object.entries(appleListParams(list))) params.set(key, value)
  }
  const search = params.toString()
  return qs(`/enterprise/apple?${search}`)
}

export const appleProductHref = (id: string) => `/enterprise/apple/${encodeURIComponent(id)}`

function qs(value: string): string {
  return value.endsWith('?') ? value.slice(0, -1) : value
}

/** `category_sub` values mix cases and quote marks between the feed and the landing config. */
export function normaliseSub(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[“”″]/g, '"')
    .replace(/\s+/g, ' ')
}

export function selectAppleProducts(
  products: AppleProduct[],
  list: AppleListState,
  sub?: string | null
): AppleProduct[] {
  const term = list.q.trim().toLowerCase()
  const subKey = normaliseSub(sub)

  const filtered = products.filter((product) => {
    if (subKey && normaliseSub(product.category_sub) !== subKey) return false
    if (list.colour && product.specs?.colour !== list.colour) return false
    if (list.storage && product.specs?.storage !== list.storage) return false
    if (list.avail === 'while_stocks_last' && !isWhileStocksLast(product)) return false
    if (list.avail === 'active' && isWhileStocksLast(product)) return false
    if (term) {
      const haystack = `${product.name} ${product.sku} ${product.category_sub ?? ''}`.toLowerCase()
      if (!haystack.includes(term)) return false
    }
    return true
  })

  // Relevance means the server's ranking is already the right order, so it is left alone.
  if (list.sort === 'relevance') return filtered

  return filtered.sort((a, b) => {
    if (list.sort === 'price_desc') return b.price_display - a.price_display
    if (list.sort === 'name') return a.name.localeCompare(b.name)
    return a.price_display - b.price_display
  })
}
