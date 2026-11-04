import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '../../lib/api';
import { ProductTile } from '../product/ProductTile';

/**
 * Real on-sale products only. If the catalogue currently has no active sale
 * rows, the shelf is omitted rather than showing a fake discount.
 */
export function DealShelf() {
  const { products, loading } = useProducts({ onSaleOnly: true, perPage: 4, sortBy: 'newest' });

  if (!loading && products.length === 0) return null;

  // The catalogue rarely has four active sale rows. Adapt the shelf to the
  // real count instead of rendering a four-column grid with empty cells.
  const gridClass =
    products.length === 1
      ? 'grid-cols-1'
      : products.length === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : products.length === 3
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <section aria-labelledby="deals-title" className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 id="deals-title" className="font-display text-[24px] font-semibold tracking-tight text-spet-ink md:text-[26px]">
          Deals
        </h2>
        <Link
          to="/deals"
          className="flex items-center gap-1.5 pb-1 text-[13px] font-semibold text-spet-blue transition-colors hover:text-spet-blue-dark md:text-[14px]"
        >
          View deals
          <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" />
        </Link>
      </div>

      <div
        className={`grid gap-3 ${products.length === 1 && !loading ? 'max-w-[560px]' : ''} ${
          loading ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : gridClass
        }`}
      >
        {loading
          ? [0, 1, 2, 3].map((index) => <ProductTileRowSkeleton key={index} />)
          : products.map((product) => (
              <ProductTile key={product.id} product={product} variant="row" />
            ))}
      </div>
    </section>
  );
}

function ProductTileRowSkeleton() {
  return (
    <div className="flex animate-pulse gap-3 rounded-xl border border-spet-line bg-spet-surface p-3">
      <div className="h-[88px] w-[88px] shrink-0 rounded-lg bg-spet-surface-2" />
      <div className="flex-1 space-y-2">
        <div className="h-2.5 w-1/3 rounded bg-spet-surface-2" />
        <div className="h-3.5 w-full rounded bg-spet-surface-2" />
        <div className="h-4 w-1/2 rounded bg-spet-surface-2" />
      </div>
    </div>
  );
}
