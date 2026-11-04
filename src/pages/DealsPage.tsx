import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import { useActivePromotions, useDealBanners, useProducts, type Promotion } from '../lib/api';
import { formatRand } from '../lib/productDisplay';
import { useSEO } from '../lib/useSEO';
import { BannerCard } from '../components/DealBanner';
import { WishlistProvider } from '../components/WishlistProvider';
import { ProductTile, ProductTileSkeleton } from '../components/product/ProductTile';
import { ButtonLink, EmptyState, PageShell, SectionHeader, Skeleton, panelStyles } from '../components/ui';

function isCurrent(promotion: Promotion): boolean {
  const now = Date.now();
  if (promotion.starts_at && new Date(promotion.starts_at).getTime() > now) return false;
  if (promotion.ends_at && new Date(promotion.ends_at).getTime() <= now) return false;
  return true;
}

function endDate(endsAt: string): string {
  return new Date(endsAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
}

function PromotionCard({ promotion }: { promotion: Promotion }) {
  const value = promotion.value ?? 0;

  return (
    <article className={`${panelStyles} flex flex-col p-5`}>
      <h3 className="font-display text-[18px] font-semibold text-spet-ink">{promotion.name}</h3>
      <p className="mt-1 text-[14px] text-spet-ink-2">
        <span className="font-semibold text-spet-orange">{promotion.type === 'percentage' ? `${value}% off` : `${formatRand(value)} off`}</span>
        {promotion.min_order_value ? ` on orders over ${formatRand(promotion.min_order_value)}` : ''}
      </p>
      {promotion.ends_at && (
        <p className="mt-2 flex items-center gap-1.5 text-[12px] text-spet-muted">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          Ends {endDate(promotion.ends_at)}
        </p>
      )}
      {promotion.code && (
        <div className="mt-4 flex items-center gap-2">
          <code className="flex h-11 flex-1 items-center justify-center rounded-lg border border-spet-line bg-spet-surface-2 font-mono text-[14px] font-semibold tracking-widest text-spet-ink">
            {promotion.code}
          </code>
          <ButtonLink to="/cart">Use in cart</ButtonLink>
        </div>
      )}
    </article>
  );
}

export function DealsPage() {
  useSEO({
    title: 'Deals & Promotions',
    description: 'Active promo codes and current specials from SPET Online, delivered across South Africa.',
  });

  const { promotions, loading: promotionsLoading } = useActivePromotions();
  const { banners, loading: bannersLoading } = useDealBanners();
  const { products, loading: productsLoading } = useProducts({ onSaleOnly: true, perPage: 8, sortBy: 'newest' });

  const currentPromotions = promotions.filter(isCurrent);
  const nothingActive =
    !promotionsLoading && !bannersLoading && !productsLoading && currentPromotions.length === 0 && banners.length === 0 && products.length === 0;

  return (
    <WishlistProvider>
      <PageShell
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Deals' }]}
        title="Deals"
        description="Current promo codes and products on sale."
      >
        {nothingActive && (
          <EmptyState
            icon={<Tag className="h-6 w-6" />}
            title="No active promotions"
            description="There are no promotions running right now. Check back soon, or browse the full range."
            action={<ButtonLink to="/shop">Go to shop</ButtonLink>}
          />
        )}

        {(promotionsLoading || currentPromotions.length > 0) && (
          <section aria-label="Promo codes" className="mb-10">
            <SectionHeader title="Promo codes" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {promotionsLoading
                ? [0, 1, 2].map((index) => <Skeleton key={index} className="h-40 rounded-2xl" />)
                : currentPromotions.map((promotion) => <PromotionCard key={promotion.id} promotion={promotion} />)}
            </div>
          </section>
        )}

        {(bannersLoading || banners.length > 0) && (
          <section aria-label="Specials" className="mb-10">
            <SectionHeader title="Specials" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {bannersLoading
                ? [0, 1, 2].map((index) => <Skeleton key={index} className="h-64 rounded-2xl" />)
                : banners.map((banner) => <BannerCard key={banner.id} banner={banner} />)}
            </div>
          </section>
        )}

        {(productsLoading || products.length > 0) && (
          <section aria-label="On sale">
            <SectionHeader
              title="On sale"
              action={
                <Link to="/shop" className="flex min-h-11 shrink-0 items-center gap-1 text-[13px] font-semibold text-spet-link hover:underline">
                  Shop all <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              }
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {productsLoading
                ? [0, 1, 2, 3].map((index) => <ProductTileSkeleton key={index} />)
                : products.map((product) => <ProductTile key={product.id} product={product} />)}
            </div>
          </section>
        )}
      </PageShell>
    </WishlistProvider>
  );
}
