import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify, { type Config as PurifyConfig } from 'dompurify';
import { Check, ChevronLeft, Heart, RefreshCw, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import { useCartStore } from '../../lib/cartStore';
import { useProductDetail, useRelatedProducts, type ProductDetail } from '../../lib/productAdapters';
import { toCartPayload, type ProductSupplier } from '../../lib/productDisplay';
import { useSEO } from '../../lib/useSEO';
import { SafeImage } from '../SafeImage';
import { useWishlistState, WishlistProvider } from '../WishlistProvider';
import { Button, ButtonLink, EmptyState, PageShell, PriceTag, QtyStepper, SectionHeader, Skeleton, StockPill, Tabs, panelStyles } from '../ui';
import { ProductTile } from './ProductTile';

const TRUST_ROWS = [
  { icon: Truck, label: 'Nationwide delivery', detail: 'Free over R2 500. 3–7 business days.' },
  { icon: ShieldCheck, label: 'Manufacturer warranty', detail: 'On every product.' },
  { icon: RefreshCw, label: '7-day returns', detail: 'Under the ECT Act.' },
];

export function ProductDetailTemplate({ supplier, idOrSlug, fallbackRoute }: { supplier: ProductSupplier; idOrSlug?: string; fallbackRoute: string }) {
  const { detail, loading } = useProductDetail(supplier, idOrSlug);

  useSEO({
    title: detail ? `${detail.view.name}${detail.view.brand ? ` | ${detail.view.brand}` : ''}` : 'Product',
    description: detail?.seoDescription ?? 'Shop electronics at SPET Online.',
    image: detail?.view.image ?? undefined,
    jsonLd: detail
      ? {
          '@type': 'Product',
          name: detail.view.name,
          image: detail.images.length > 0 ? detail.images : undefined,
          description: detail.seoDescription,
          sku: detail.view.sku,
          brand: detail.view.brand ? { '@type': 'Brand', name: detail.view.brand } : undefined,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'ZAR',
            price: detail.view.price,
            availability: detail.view.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `https://spetonline.co.za${detail.canonicalPath}`,
          },
        }
      : undefined,
  });

  if (loading) {
    return (
      <PageShell>
        <div className="grid grid-cols-1 gap-8 pt-4 lg:grid-cols-2 lg:gap-12" aria-busy="true">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!detail) {
    return (
      <PageShell breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: 'Product not found' }]} title="Product not found">
        <EmptyState
          title="This product isn’t available"
          description="It may have been removed from the range."
          action={<ButtonLink to={fallbackRoute}>Back to shop</ButtonLink>}
        />
      </PageShell>
    );
  }

  return (
    <WishlistProvider>
      <ProductDetailContent key={detail.view.id} detail={detail} />
    </WishlistProvider>
  );
}

function ProductDetailContent({ detail }: { detail: ProductDetail }) {
  const { view, images, summary, warrantyMonths, condition, crumbs, backRoute } = detail;
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const wishlist = useWishlistState();
  const related = useRelatedProducts(detail.related, view.id);

  const [activeImage, setActiveImage] = useState(images[0] ?? null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    if (!added) return;
    const timer = window.setTimeout(() => setAdded(false), 2000);
    return () => window.clearTimeout(timer);
  }, [added]);

  const inWishlist = wishlist?.ids.includes(view.id) ?? false;

  function handleAddToCart() {
    addItem(toCartPayload(view), qty);
    setAdded(true);
  }

  // Plain navigate(-1) is a dead end when the shopper landed here directly
  // (shared link, new tab, refresh), so fall back to the product's own range.
  function goBack() {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(backRoute);
  }

  return (
    <PageShell breadcrumbs={crumbs}>
      <Button variant="ghost" className="-ml-2 mb-3" onClick={goBack}>
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <div className="flex aspect-square items-center justify-center rounded-2xl border border-spet-line bg-white p-6 md:p-10">
            <SafeImage
              src={activeImage}
              brand={view.brand}
              alt={view.name}
              decoding="async"
              referrerPolicy="no-referrer"
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Product images">
              {images.slice(0, 6).map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={image === activeImage ? 'true' : undefined}
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border bg-white p-1.5 transition-colors ${
                    image === activeImage ? 'border-spet-blue' : 'border-spet-line hover:border-spet-blue'
                  }`}
                >
                  <SafeImage src={image} alt="" loading="lazy" referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0">
          {view.brand && <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-spet-muted">{view.brand}</p>}
          <h1 className="mt-1 font-display text-[24px] font-semibold leading-snug tracking-tight text-spet-ink md:text-[32px]">{view.name}</h1>

          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-spet-muted">
            {view.sku && (
              <div className="flex gap-1">
                <dt>SKU</dt>
                <dd className="font-medium text-spet-ink-2">{view.sku}</dd>
              </div>
            )}
            {condition && (
              <div className="flex gap-1">
                <dt>Condition</dt>
                <dd className="font-medium text-spet-ink-2">{condition}</dd>
              </div>
            )}
            {warrantyMonths && (
              <div className="flex gap-1">
                <dt>Warranty</dt>
                <dd className="font-medium text-spet-ink-2">{warrantyMonths} months</dd>
              </div>
            )}
          </dl>

          <PriceTag price={view.price} wasPrice={view.wasPrice} saving={view.saving} size="lg" className="mt-5" />

          <StockPill inStock={view.inStock} className="mt-3 text-[13px]" />

          {summary && <p className="mt-4 text-[14px] leading-relaxed text-spet-ink-2">{summary}</p>}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {view.inStock && <QtyStepper value={qty} onChange={setQty} max={Math.max(1, view.stockQty)} />}
            <Button size="lg" className="min-w-0 flex-1 basis-48" onClick={handleAddToCart} disabled={!view.inStock}>
              {added ? <Check className="h-4 w-4" aria-hidden="true" /> : <ShoppingCart className="h-4 w-4" aria-hidden="true" />}
              {added ? 'Added to cart' : view.inStock ? 'Add to cart' : 'Out of stock'}
            </Button>
            {wishlist && (
              <button
                type="button"
                onClick={() => wishlist.toggle(view.id)}
                aria-label={inWishlist ? `Remove ${view.name} from wishlist` : `Add ${view.name} to wishlist`}
                aria-pressed={inWishlist}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-spet-line bg-spet-surface text-spet-muted transition-colors hover:border-spet-orange hover:text-spet-orange"
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-spet-orange text-spet-orange' : ''}`} aria-hidden="true" />
              </button>
            )}
          </div>

          <ul className={`${panelStyles} mt-6 divide-y divide-spet-line-2`}>
            {TRUST_ROWS.map(({ icon: Icon, label, detail: rowDetail }) => (
              <li key={label} className="flex items-center gap-3 px-4 py-3">
                <Icon className="h-5 w-5 shrink-0 text-spet-blue" aria-hidden="true" />
                <span className="text-[13px] leading-snug">
                  <span className="font-semibold text-spet-ink">{label}</span>
                  <span className="block text-spet-ink-2">{rowDetail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section aria-label="Product information" className={`${panelStyles} mt-10 overflow-hidden`}>
        <Tabs
          label="Product information"
          items={[
            { id: 'description', label: 'Description' },
            { id: 'specs', label: 'Specifications' },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
        <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} className="p-4 md:p-6">
          {activeTab === 'description' ? <DescriptionPanel detail={detail} /> : <SpecsPanel detail={detail} />}
        </div>
      </section>

      {related.length > 0 && (
        <section aria-label="Related products" className="mt-10">
          <SectionHeader title="Related products" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {related.map((product) => (
              <ProductTile key={product.id} product={product} supplier={view.supplier} />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}

// Supplier feeds and AI drafts supply this HTML, so scripts, event handlers, forms and
// frames are removed before it reaches the page.
const DESCRIPTION_PURIFY: PurifyConfig = {
  FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed'],
};

function DescriptionPanel({ detail }: { detail: ProductDetail }) {
  const { description } = detail;
  const safeHtml = useMemo(
    () => (description && description.kind !== 'text' ? String(DOMPurify.sanitize(description.value, DESCRIPTION_PURIFY)) : ''),
    [description],
  );

  if (!description) {
    return <p className="text-[14px] text-spet-muted">No description is available for this product. Contact us for more information.</p>;
  }
  if (description.kind === 'text') {
    return <p className="max-w-3xl whitespace-pre-wrap text-[14px] leading-relaxed text-spet-ink-2">{description.value}</p>;
  }
  return <div className="product-description max-w-3xl" dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}

function SpecsPanel({ detail }: { detail: ProductDetail }) {
  if (detail.specs.length === 0) {
    return <p className="text-[14px] text-spet-muted">No specifications are available for this product.</p>;
  }

  return (
    <div className="max-w-3xl overflow-x-auto">
      <table className="w-full text-[13px]">
        <tbody className="divide-y divide-spet-line-2">
          {detail.specs.map((spec) => (
            <tr key={spec.label}>
              <th scope="row" className="w-2/5 py-2.5 pr-4 text-left align-top font-semibold text-spet-ink-2">
                {spec.label}
              </th>
              <td className="py-2.5 align-top text-spet-ink">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
