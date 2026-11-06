import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { canUseApple, withAppleReturn } from '../lib/appleAccess'
import { submitAppleQuote } from '../lib/appleCatalogue'
import { useAppleBuying } from '../lib/useAppleBuying'
import { useAppleQuoteStore } from '../lib/appleQuoteStore'
import { APPLE_CATEGORIES, appleCategoryNav } from '../lib/appleCategories'
import {
  appleHref,
  appleListParams,
  readAppleList,
  selectAppleProducts,
  APPLE_PAGE_SIZE,
  EMPTY_APPLE_LIST,
  activeFilterCount,
  type AppleListState,
} from '../lib/appleQuery'
import { formatAppleModel } from '../lib/appleFormat'
import { useAppleCounts, useAppleList, useAppleSearch } from '../lib/useAppleCatalogue'
import type { AppleProduct } from '../lib/appleTypes'
import { useDebounced } from '../lib/useDebounced'
import { useSEO } from '../lib/useSEO'
import AppleHome from '../components/AppleHome'
import AppleCategoryLanding, { LANDING_CONFIGS } from '../components/AppleCategoryLanding'
import AppleRangeDisclaimers from '../components/AppleRangeDisclaimers'
import { AppleHeader } from '../components/apple/AppleHeader'
import { AppleProductCard } from '../components/apple/AppleProductCard'
import { AppleFilterBar } from '../components/apple/AppleFilterBar'
import { AppleNotice } from '../components/apple/AppleNotice'
import { AppleGridSkeleton } from '../components/apple/AppleSkeleton'
import { AppleButton, AppleLinkButton } from '../components/apple/AppleButton'
import { AppleQuotePanel, type QuoteContact } from '../components/apple/AppleQuotePanel'
import { ApplePager } from '../components/apple/ApplePager'

const SEARCH_FILTER_KEYS = ['q', 'colour', 'storage', 'avail', 'sort', 'page']
/** The function caps a search at 200; the grid pages through whatever comes back. */
const APPLE_SEARCH_LIMIT = 200

export default function EnterpriseApplePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, session, profile } = useAuth()
  const { buy, addToQuote: addProductToQuote } = useAppleBuying()

  const catParam = searchParams.get('cat')
  const activeCategory = APPLE_CATEGORIES.some((category) => category.key === catParam) ? catParam : null
  const landingConfig = activeCategory ? LANDING_CONFIGS[activeCategory] : undefined
  const wantsShop = searchParams.get('view') === 'shop' || Boolean(searchParams.get('sub'))
  const term = (searchParams.get('q') ?? '').trim()
  const mode: 'home' | 'landing' | 'shop' | 'search' = !activeCategory
    ? term ? 'search' : 'home'
    : landingConfig && !wantsShop
      ? 'landing'
      : 'shop'

  const nav = appleCategoryNav(activeCategory)
  const list = readAppleList(searchParams)
  const sub = searchParams.get('sub') ?? ''

  const catalogue = useAppleList(mode === 'home' || mode === 'search' ? null : activeCategory)
  const counts = useAppleCounts()

  // Searching the whole range is a server query, so the term is debounced rather than
  // firing a request per keystroke.
  const settledTerm = useDebounced(term, 300)
  const found = useAppleSearch(mode === 'search' ? settledTerm : '', APPLE_SEARCH_LIMIT)

  const source = mode === 'search'
    ? { products: found.products, total: found.total, status: found.status, error: found.error, retry: found.retry }
    : { products: catalogue.products, total: catalogue.products.length, status: catalogue.status, error: catalogue.error, retry: catalogue.retry }

  // Search ranks by relevance unless the shopper picks a sort, and in search mode the
  // function has already matched the term, so the grid only applies colour, storage,
  // availability and sort — otherwise the settled term would fight the one in the box.
  const effectiveList: AppleListState =
    mode === 'search' && !searchParams.get('sort') ? { ...list, sort: 'relevance' } : list
  const visible = mode === 'search'
    ? selectAppleProducts(source.products, { ...effectiveList, q: '' }, sub)
    : mode === 'shop'
      ? selectAppleProducts(source.products, list, sub)
      : source.products
  const pageCount = Math.max(1, Math.ceil(visible.length / APPLE_PAGE_SIZE))
  const currentPage = Math.min(list.page, pageCount)
  const paged = visible.slice((currentPage - 1) * APPLE_PAGE_SIZE, currentPage * APPLE_PAGE_SIZE)

  const quoteItems = useAppleQuoteStore((state) => state.items)
  const setQuoteQty = useAppleQuoteStore((state) => state.setQty)
  const removeQuoteItem = useAppleQuoteStore((state) => state.removeItem)
  const clearQuote = useAppleQuoteStore((state) => state.clear)

  const [showQuote, setShowQuote] = useState(searchParams.get('quote') === 'open')
  const [contact, setContact] = useState<QuoteContact>({ name: '', phone: '', organisation: '', notes: '' })
  const [reference, setReference] = useState<string | null>(null)
  const [emailed, setEmailed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [quoteError, setQuoteError] = useState('')
  const [live, setLive] = useState('')

  useSEO({
    title:
      mode === 'search'
        ? `Apple results for “${term}”`
        : mode === 'home'
          ? 'Apple range for business'
          : `Apple ${nav.label} for business`,
    description:
      mode === 'search'
        ? `Apple configurations matching “${term}” from SPET Online, with prices including VAT.`
        : mode === 'home'
          ? 'The Apple range for business from SPET Online: Mac, iPhone, iPad, Apple Watch and AirPods, with prices including VAT.'
          : `Apple ${nav.label} configurations for business from SPET Online. Prices include VAT. Buy online or request a quote.`,
    // A search result page is thin content and shouldn't be indexed.
    noindex: mode === 'search',
    canonicalPath:
      mode === 'search'
        ? undefined
        : mode === 'home'
          ? '/enterprise/apple'
          : `/enterprise/apple?cat=${encodeURIComponent(nav.key)}${mode === 'shop' ? '&view=shop' : ''}`,
  })

  // Fill in what we already know, without overwriting anything the customer typed.
  useEffect(() => {
    if (!profile) return
    setContact((current) => ({
      ...current,
      name:
        current.name ||
        profile.full_name ||
        [profile.first_name, profile.last_name].filter(Boolean).join(' '),
      phone: current.phone || profile.phone || '',
      organisation: current.organisation || profile.org_name || '',
    }))
  }, [profile])

  /** Changing a filter always returns to the first page of results. */
  const setList = (next: AppleListState) => {
    const params = new URLSearchParams(searchParams)
    SEARCH_FILTER_KEYS.forEach((key) => params.delete(key))
    for (const [key, value] of Object.entries(appleListParams({ ...next, page: 1 }))) params.set(key, value)
    setSearchParams(params, { replace: true })
  }

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams)
    SEARCH_FILTER_KEYS.forEach((key) => params.delete(key))
    for (const [key, value] of Object.entries(appleListParams({ ...list, page }))) params.set(key, value)
    setSearchParams(params)
    window.scrollTo({ top: 0 })
  }

  const clearModel = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('sub')
    setSearchParams(params, { replace: true })
  }

  const openQuote = () => {
    setShowQuote(true)
    const params = new URLSearchParams(searchParams)
    params.set('quote', 'open')
    setSearchParams(params, { replace: true })
  }

  const closeQuote = () => {
    setShowQuote(false)
    setReference(null)
    setQuoteError('')
    setEmailed(false)
    if (searchParams.get('quote')) {
      const params = new URLSearchParams(searchParams)
      params.delete('quote')
      setSearchParams(params, { replace: true })
    }
  }

  const addToQuote = (product: AppleProduct) => {
    if (!addProductToQuote(product, 1)) return
    setReference(null)
    setShowQuote(true)
    setLive(`${product.name} added to your quote.`)
  }

  const handleSubmitQuote = async () => {
    if (!user || !session || !canUseApple(profile)) {
      const here = appleHref({ cat: activeCategory, view: 'shop', quote: true })
      navigate(withAppleReturn('/enterprise/register', here))
      return
    }
    setSubmitting(true)
    setQuoteError('')
    try {
      const result = await submitAppleQuote({
        accessToken: session.access_token,
        items: quoteItems.map((item) => ({ product_id: item.id, qty: item.qty })),
        contactName: contact.name,
        contactPhone: contact.phone,
        organisation: contact.organisation,
        notes: contact.notes,
      })
      clearQuote()
      setContact((current) => ({ ...current, notes: '' }))
      setReference(result.reference)
      setEmailed(result.customerEmailed)
      setLive(`Quote request submitted. Your reference is ${result.reference}.`)
    } catch (error) {
      setQuoteError(error instanceof Error ? error.message : 'We couldn’t save your quote. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const filterCount = activeFilterCount(list)

  return (
    <div className="min-h-screen bg-apple-canvas pb-16">
      <AppleHeader
        activeCategory={activeCategory}
        counts={counts}
        quoteCount={quoteItems.length}
        onOpenQuote={openQuote}
      />

      <main className="mx-auto max-w-[1200px] px-4 pt-6 md:px-8 md:pt-10">
        {mode === 'home' && <AppleHome counts={counts} />}

        {mode === 'landing' && landingConfig && activeCategory && (
          <AppleCategoryLanding config={landingConfig} category={activeCategory} products={catalogue.products} />
        )}

        {(mode === 'shop' || mode === 'search') && (
          <section aria-labelledby="apple-range-heading">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] text-apple-muted">
              <Link to="/enterprise/apple" className="transition-colors hover:text-apple-ink">
                Apple
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-apple-ink">{mode === 'search' ? 'Search' : nav.label}</span>
            </nav>

            <h1
              id="apple-range-heading"
              className="mt-1.5 font-display text-[28px] font-semibold leading-[34px] tracking-[-0.02em] text-apple-ink md:text-[34px] md:leading-[40px]"
            >
              {mode === 'search' ? `Results for “${term}”` : sub ? formatAppleModel(sub) : nav.label}
            </h1>
            {mode === 'shop' && (
              <p className="mt-1 text-[14px] leading-[20px] text-apple-muted">
                {sub ? `${nav.label} range` : nav.tagline}
              </p>
            )}

            {sub && (
              <button
                type="button"
                onClick={clearModel}
                className="mt-3 inline-flex h-8 items-center gap-2 rounded-full border border-apple-line bg-apple-surface px-3 text-[12px] text-apple-ink transition-colors hover:border-apple-ink"
              >
                {formatAppleModel(sub)}
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">Clear model filter</span>
              </button>
            )}

            <div className="mt-6">
              <AppleFilterBar
                products={source.products}
                list={effectiveList}
                onChange={setList}
                resultCount={visible.length}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2 border-b border-apple-line-2 pb-3">
              <p className="text-[13px] text-apple-muted" aria-live="polite">
                {source.status === 'ready'
                  ? mode === 'search'
                    ? `${visible.length} of ${source.total} matching configurations`
                    : `${visible.length} of ${source.products.length} configurations`
                  : source.status === 'loading'
                    ? 'Loading configurations'
                    : 'Configurations unavailable'}
              </p>
              <p className="text-[12px] text-apple-muted">Prices include VAT</p>
            </div>

            <div className="mt-8">
              {source.status === 'loading' && <AppleGridSkeleton />}

              {source.status === 'error' && (
                <AppleNotice
                  tone="error"
                  title={mode === 'search' ? 'We couldn’t search the Apple range' : 'We couldn’t load this range'}
                  description="The Apple catalogue didn’t respond. Check your connection and try again."
                  action={<AppleButton onClick={source.retry}>Try again</AppleButton>}
                />
              )}

              {source.status === 'ready' && visible.length === 0 && (
                <AppleNotice
                  title={
                    mode === 'search'
                      ? source.total > 0
                        ? 'No configurations match those filters'
                        : `No Apple products match “${term}”`
                      : filterCount > 0
                        ? 'No configurations match those filters'
                        : 'Nothing in this range yet'
                  }
                  description={
                    mode === 'search'
                      ? source.total > 0
                        ? 'Try a different colour, storage size or availability.'
                        : 'Try a product name, model or SKU, or browse a range instead.'
                      : filterCount > 0
                        ? 'Try a different colour, storage size or search term.'
                        : 'This range has no configurations loaded at the moment.'
                  }
                  action={
                    (mode === 'search' ? source.total > 0 : filterCount > 0) ? (
                      <AppleButton variant="secondary" onClick={() => setList(EMPTY_APPLE_LIST)}>
                        Clear filters
                      </AppleButton>
                    ) : (
                      <AppleLinkButton to="/enterprise/apple" variant="secondary">
                        Back to the Apple range
                      </AppleLinkButton>
                    )
                  }
                />
              )}

              {source.status === 'ready' && visible.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:gap-x-8 xl:grid-cols-4">
                    {paged.map((product, index) => (
                      <AppleProductCard
                        key={product.id}
                        product={product}
                        onBuy={buy}
                        onAddToQuote={addToQuote}
                        priority={index < 4}
                      />
                    ))}
                  </div>

                  <ApplePager
                    page={currentPage}
                    pageCount={pageCount}
                    pageSize={APPLE_PAGE_SIZE}
                    total={visible.length}
                    onPage={setPage}
                  />
                </>
              )}
            </div>
          </section>
        )}

        {mode !== 'home' && activeCategory && <AppleRangeDisclaimers category={activeCategory} sub={sub} />}
      </main>

      <AppleQuotePanel
        open={showQuote}
        items={quoteItems}
        reference={reference}
        customerEmailed={emailed}
        submitting={submitting}
        error={quoteError}
        contact={contact}
        onContactChange={setContact}
        onQtyChange={setQuoteQty}
        onRemove={removeQuoteItem}
        onSubmit={handleSubmitQuote}
        onClose={closeQuote}
        onBrowse={() => {
          closeQuote()
          if (activeCategory) navigate(appleHref({ cat: activeCategory, view: 'shop' }))
        }}
      />

      <p aria-live="polite" role="status" className="sr-only">
        {live}
      </p>
    </div>
  )
}
