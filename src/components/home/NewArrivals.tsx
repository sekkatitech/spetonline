import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '../../lib/api';
import { ProductTile, ProductTileSkeleton } from '../product/ProductTile';

interface NewArrivalsProps {
  /** Products already shown in the department shelf, kept out of this shelf. */
  excludeIds?: string[];
}

export function NewArrivals({ excludeIds = [] }: NewArrivalsProps) {
  const { products, loading } = useProducts({ sortBy: 'newest', perPage: 12 });
  const shown = products.filter((product) => !excludeIds.includes(product.id)).slice(0, 4);

  return (
    <section aria-labelledby="new-arrivals-title" className="mt-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2
          id="new-arrivals-title"
          className="font-display text-[24px] font-semibold tracking-tight text-spet-ink md:text-[26px]"
        >
          New arrivals
        </h2>
        <Link
          to="/shop/home?sort=newest"
          className="flex items-center gap-1.5 pb-1 text-[13px] font-semibold text-spet-blue transition-colors hover:text-spet-blue-dark md:text-[14px]"
        >
          View all
          <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {loading
          ? [0, 1, 2, 3].map((index) => <ProductTileSkeleton key={index} />)
          : shown.map((product) => (
              <ProductTile key={product.id} product={product} buttonStyle="outline" />
            ))}
      </div>
    </section>
  );
}
