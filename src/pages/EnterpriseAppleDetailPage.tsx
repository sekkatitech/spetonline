import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { appleDeliveryNotes, isApplePreorder, parseAppleDescription } from '../lib/appleCatalogue'
import { useAppleBuying } from '../lib/useAppleBuying'
import { useAppleQuoteStore } from '../lib/appleQuoteStore'
import { useAppleCounts, useAppleDetail, useAppleList } from '../lib/useAppleCatalogue'
import { buildVariantIndex, type VariantSelection } from '../lib/appleVariants'
import { appleAvailability, appleGallery } from '../lib/appleTypes'
import { applePrice, appleSaving, formatAppleModel, formatAppleName, formatAppleTitle, specRows } from '../lib/appleFormat'
import { appleHref, appleProductHref } from '../lib/appleQuery'
import { APPLE_CATEGORIES } from '../lib/appleCategories'
import { useSEO } from '../lib/useSEO'
import AppleLegalModal from '../components/AppleLegalModal'
import ApplePreorderBadge from '../components/ApplePreorderBadge'
import { AppleHeader } from '../components/apple/AppleHeader'
import { AppleGallery } from '../components/apple/AppleGallery'
import { AppleImage } from '../components/apple/AppleImage'
import { AppleModelLinks, AppleVariantPicker } from '../components/apple/AppleVariantPicker'
import { AppleQtyStepper } from '../components/apple/AppleQtyStepper'
import { AppleNotice } from '../components/apple/AppleNotice'
import { AppleDetailSkeleton } from '../components/apple/AppleSkeleton'
import { AppleButton, AppleLinkButton } from '../components/apple/AppleButton'

export default function EnterpriseAppleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { product, related, status, error, retry } = useAppleDetail(id)
  const categoryProducts = useAppleList(product?.category_main ?? null)
  const counts = useAppleCounts()
  const { buy, addToQuote } = useAppleBuying()
  const quoteCount = useAppleQuoteStore((state) => state.items.length)

  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [pending, setPending] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showLegal, setShowLegal] = useState(false)
  const [live, setLive] = useState('')

  const name = product ? formatAppleName(product.name) : 'Apple product'
  const title = product ? formatAppleTitle(product.name) : 'Apple product'
  const images = useMemo(() => appleGallery(product), [product])
  const specs = useMemo(() => specRows(product?.specs ?? null), [product])
  const description = useMemo(() => parseAppleDescription(product?.full_description ?? null), [product])
  const index = useMemo(
    () => (product ? buildVariantIndex(product, categoryProducts.products) : null),
    [product, categoryProducts.products]
  )

  const category =
    product && APPLE_CATEGORIES.some((entry) => entry.key === product.category_main) ? product.category_main : null
  const quoteHref = appleHref({ cat: category ?? undefined, view: 'shop', quote: true })
  const preorder = product ? isApplePreorder(product.name) : false

  useEffect(() => {
    setQty(1)
    setAdded(false)
    setPending(false)
    setExpanded(false)
  }, [id])

  useEffect(() => {
    if (!product) return
    const configuration = [product.specs?.colour, product.specs?.storage].filter(Boolean).join(', ')
    setLive(`${formatAppleName(product.name)}${configuration ? `, ${configuration}` : ''}. ${applePrice(product.price_display)}.`)
  }, [product])

  const jsonLd = useMemo(() => {
    if (!product) return undefined
    return {
      '@type': 'Product',
      name: formatAppleName(product.name),
      sku: product.sku,
      image: appleGallery(product).slice(0, 4),
      brand: { '@type': 'Brand', name: 'Apple' },
      offers: {
        '@type': 'Offer',
        price: Number(product.price_display).toFixed(2),
        priceCurrency: 'ZAR',
        availability: 'https://schema.org/InStock',
        url: `https://spetonline.co.za${appleProductHref(product.id)}`,
      },
    }
  }, [product])

  const shortDescription = product?.short_description?.replace(/\s+/g, ' ').trim() ?? ''
  // Only offer the expand control when the copy actually runs long.
  const longDescription = description.body.length > 700

  useSEO({
    title: product ? `${title} ${product.sku}` : 'Apple product',
    description:
      product && product.short_description
        ? `${name}. ${product.short_description.replace(/\s+/g, ' ').trim()}`.slice(0, 300)
        : `${name} from the Apple range at SPET Online. Prices include VAT.`,
    image: images[0],
    canonicalPath: product ? appleProductHref(product.id) : '/enterprise/apple',
    jsonLd,
  })

  const changeVariant = (selection: VariantSelection) => {
    if (!product || !index) return
    const next = index.resolve(selection)
    if (!next || next.id === product.id) return
    setPending(true)
    navigate(appleProductHref(next.id))
  }

  const modelCrumbs = product ? formatAppleModel(product.category_sub) : ''

  return (
    <div className="min-h-screen bg-apple-canvas pb-20">
      <AppleHeader
        activeCategory={category}
        counts={counts}
        quoteCount={quoteCount}
        onOpenQuote={() => navigate(quoteHref)}
      />

      <main className="mx-auto max-w-[1200px] px-4 pt-5 md:px-8 md:pt-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[12px] text-apple-muted">
          <Link to="/enterprise/apple" className="transition-colors hover:text-apple-ink">
            Apple
          </Link>
          <span aria-hidden="true">/</span>
          {category ? (
            <>
              <Link to={appleHref({ cat: category })} className="transition-colors hover:text-apple-ink">
                {category}
              </Link>
              <span aria-hidden="true">/</span>
            </>
          ) : null}
          <span className="text-apple-ink">{product ? modelCrumbs || name : 'Product'}</span>
        </nav>

        <div className="mt-5">
          {status === 'loading' && <AppleDetailSkeleton />}

          {status === 'error' && (
            <AppleNotice
              tone="error"
              title="We couldn’t load this product"
              description={error ?? 'The Apple catalogue didn’t respond. Check your connection and try again.'}
              action={<AppleButton onClick={retry}>Try again</AppleButton>}
            />
          )}

          {status === 'missing' && (
            <AppleNotice
              title="This configuration isn’t in the range"
              description="It may have been replaced by a newer model. The rest of the range is still available."
              action={
                <AppleLinkButton to={category ? appleHref({ cat: category, view: 'shop' }) : '/enterprise/apple'}>
                  Back to the range
                </AppleLinkButton>
              }
            />
          )}

          {status === 'ready' && product && (
            <>
              <div className="grid gap-10 lg:grid-cols-[minmax(0,652px)_minmax(0,1fr)] lg:gap-11">
                <div>
                  <AppleGallery images={images} name={name} />
                </div>

                <div className="lg:sticky lg:top-[124px] lg:self-start">
                  <div className="flex flex-wrap items-center gap-2">
                    {preorder && <ApplePreorderBadge inline />}
                    {appleAvailability(product) && (
                      <span className="text-[12px] font-medium text-apple-alert">{appleAvailability(product)}</span>
                    )}
                  </div>

                  <h1 className="mt-2 font-display text-[26px] font-semibold leading-[32px] tracking-[-0.02em] text-apple-ink md:text-[30px] md:leading-[36px]">
                    {title}
                  </h1>
                  <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] leading-[16px] text-apple-muted">
                    <span>{product.sku}</span>
                    {[product.specs?.chip, product.specs?.ram, product.specs?.screen_size]
                      .filter(Boolean)
                      .map((value) => (
                        <span key={value}>{value}</span>
                      ))}
                  </p>

                  <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-[24px] font-semibold leading-[28px] tabular-nums text-apple-ink">
                      {applePrice(product.price_display)}
                    </span>
                    {appleSaving(product) !== null && (
                      <span className="text-[13px] text-apple-muted">Save {applePrice(appleSaving(product)!)} on RRP</span>
                    )}
                  </div>
                  <p className="mt-1 text-[12px] leading-[16px] text-apple-muted">Price includes VAT</p>

                  {shortDescription && (
                    <p className="mt-4 max-w-[52ch] text-[14px] leading-[22px] text-apple-ink-2">{shortDescription}</p>
                  )}

                  {index && index.hasVariants && (
                    <AppleVariantPicker index={index} product={product} pending={pending} onChange={changeVariant} />
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <AppleQtyStepper
                      value={qty}
                      onChange={setQty}
                      disabled={pending}
                      label="Quantity"
                      max={999}
                    />
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    {preorder ? (
                      <AppleButton
                        className="flex-1"
                        onClick={() => {
                          if (addToQuote(product, qty)) setAdded(true)
                        }}
                      >
                        Pre-order
                      </AppleButton>
                    ) : (
                      <>
                        <AppleButton
                          className="flex-1"
                          disabled={pending}
                          aria-label={`Buy ${name} and continue to checkout`}
                          onClick={() => buy(product, qty)}
                        >
                          Buy
                        </AppleButton>
                        <AppleButton
                          variant="secondary"
                          className="flex-1"
                          disabled={pending}
                          aria-label={`Add ${name} to quote`}
                          onClick={() => {
                            if (addToQuote(product, qty)) setAdded(true)
                          }}
                        >
                          Add to Quote
                        </AppleButton>
                      </>
                    )}
                  </div>

                  {added && (
                    <AppleLinkButton to={quoteHref} variant="plain" className="mt-3">
                      Added to your quote. View quote
                    </AppleLinkButton>
                  )}

                  <p className="mt-4 max-w-[52ch] text-[13px] leading-[19px] text-apple-muted">
                    {appleDeliveryNotes([product.name]).join(' ')}
                  </p>

                  {index && index.models.length > 0 && (
                    <AppleModelLinks
                      models={index.models}
                      hrefFor={(modelSub) =>
                        appleHref({ cat: category ?? product.category_main, sub: modelSub, view: 'shop' })
                      }
                    />
                  )}
                </div>
              </div>

              {specs.length > 0 && (
                <section className="mt-14 border-t border-apple-line pt-8" aria-labelledby="apple-specs-heading">
                  <h2
                    id="apple-specs-heading"
                    className="font-display text-[22px] font-semibold leading-[28px] text-apple-ink"
                  >
                    Specifications
                  </h2>
                  <dl className="mt-4 grid gap-x-12 sm:grid-cols-2">
                    {specs.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-baseline justify-between gap-4 border-b border-apple-line-2 py-2.5"
                      >
                        <dt className="text-[13px] leading-[19px] text-apple-muted">{row.label}</dt>
                        <dd className="text-right text-[13px] font-medium leading-[19px] text-apple-ink">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              {(description.body || description.notes.length > 0) && (
                <section className="mt-12 border-t border-apple-line pt-8" aria-labelledby="apple-about-heading">
                  <h2
                    id="apple-about-heading"
                    className="font-display text-[22px] font-semibold leading-[28px] text-apple-ink"
                  >
                    About this model
                  </h2>

                  {description.body && (
                    <>
                      <div
                        className={`mt-4 max-w-[76ch] whitespace-pre-line text-[14px] leading-[23px] text-apple-ink-2 ${
                          longDescription && !expanded ? 'line-clamp-[12]' : ''
                        }`}
                      >
                        {description.body}
                      </div>
                      {longDescription && !expanded && (
                        <AppleButton variant="plain" size="sm" className="mt-2" onClick={() => setExpanded(true)}>
                          Show full description
                        </AppleButton>
                      )}
                    </>
                  )}

                  {description.notes.length > 0 && (
                    <div className="mt-6 max-w-[76ch]">
                      <h3 className="text-[13px] font-semibold text-apple-ink">Please note</h3>
                      {description.notes.map((note) => (
                        <p key={note} className="mt-1.5 text-[13px] leading-[20px] text-apple-muted">
                          {note}
                        </p>
                      ))}
                    </div>
                  )}

                  {description.legal.length > 0 && (
                    <AppleButton variant="plain" size="sm" className="mt-4" onClick={() => setShowLegal(true)}>
                      {formatAppleModel(product.category_main)} disclaimers
                    </AppleButton>
                  )}
                </section>
              )}

              {related.length > 0 && (
                <section className="mt-12 border-t border-apple-line pt-8" aria-labelledby="apple-related-heading">
                  <h2
                    id="apple-related-heading"
                    className="font-display text-[22px] font-semibold leading-[28px] text-apple-ink"
                  >
                    More {product.category_main}
                  </h2>
                  <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-6">
                    {related.slice(0, 4).map((item) => (
                      <Link key={item.id} to={appleProductHref(item.id)} className="group">
                        <div className="flex aspect-square items-center justify-center rounded-[18px] bg-apple-surface p-4">
                          <AppleImage
                            src={item.thumbnail_url}
                            alt=""
                            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                        <p className="mt-3 text-[14px] font-medium leading-[20px] text-apple-ink transition-colors group-hover:text-apple-blue">
                          {formatAppleName(item.name)}
                        </p>
                        <p className="mt-1 text-[14px] font-semibold tabular-nums text-apple-ink">
                          {applePrice(item.price_display)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {showLegal && product && (
        <AppleLegalModal
          title={`${formatAppleModel(product.category_main)} disclaimers`}
          sections={[{ title: name, lines: description.legal }]}
          onClose={() => setShowLegal(false)}
        />
      )}

      <p aria-live="polite" role="status" className="sr-only">
        {live}
      </p>
    </div>
  )
}
