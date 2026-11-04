import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { escapeLike, type Product } from '../lib/api';
import type { ProductSupplier } from '../lib/productDisplay';
import { supabase } from '../lib/supabase';
import { SUPPLIERS } from '../lib/supplierCatalog';
import { useSEO } from '../lib/useSEO';
import { WishlistProvider } from '../components/WishlistProvider';
import { ProductTile, ProductTileSkeleton } from '../components/product/ProductTile';
import { ButtonLink, EmptyState, PageShell, SectionHeader } from '../components/ui';

interface SearchSection {
  supplier: ProductSupplier;
  label: string;
  route: string;
  table: string;
  nameColumn: string;
}

const SECTIONS: SearchSection[] = [
  { supplier: 'esquire', label: 'Home & entertainment', route: '/shop/home', table: 'products', nameColumn: 'ProductName' },
  ...Object.values(SUPPLIERS).map((config) => ({
    supplier: config.key,
    label: config.label,
    route: config.route,
    table: config.table,
    nameColumn: 'name',
  })),
];

const GRID = 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';

  // Internal search results shouldn't be indexed — thin/duplicate content per Google's own guidance
  useSEO({
    title: q ? `Search results for "${q}"` : 'Search',
    description: q ? `Search results for "${q}" on SPET Online.` : 'Search SPET Online for electronics and tech products.',
    noindex: true,
  });

  const [results, setResults] = useState<Partial<Record<ProductSupplier, Product[]>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      SECTIONS.map((section) =>
        supabase
          .from(section.table)
          .select('*')
          .eq('is_active', true)
          .ilike(section.nameColumn, `%${escapeLike(term)}%`)
          .order(section.nameColumn, { ascending: true })
          .limit(20)
      )
    ).then((responses) => {
      if (cancelled) return;
      const next: Partial<Record<ProductSupplier, Product[]>> = {};
      responses.forEach((response, index) => {
        next[SECTIONS[index].supplier] = (response.data ?? []) as Product[];
      });
      setResults(next);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [q]);

  const total = SECTIONS.reduce((sum, section) => sum + (results[section.supplier]?.length ?? 0), 0);

  return (
    <WishlistProvider>
      <PageShell
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Search' }]}
        title={q ? `Results for “${q}”` : 'Search products'}
        description={
          loading ? 'Searching…' : q ? `${total} product${total === 1 ? '' : 's'} found` : 'Enter a search term in the bar above.'
        }
      >
        {loading && (
          <div className={GRID}>
            {Array.from({ length: 10 }).map((_, index) => (
              <ProductTileSkeleton key={index} />
            ))}
          </div>
        )}

        {!loading && q && total === 0 && (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="No products found"
            description="Try a different search term, or browse the departments."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <ButtonLink to="/categories">Browse categories</ButtonLink>
                <ButtonLink to="/shop" variant="secondary">
                  Go to shop
                </ButtonLink>
              </div>
            }
          />
        )}

        {!loading && total > 0 && (
          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <SearchResultsSection key={section.supplier} section={section} query={q} products={results[section.supplier] ?? []} />
            ))}
          </div>
        )}
      </PageShell>
    </WishlistProvider>
  );
}

function SearchResultsSection({ section, query, products }: { section: SearchSection; query: string; products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section aria-label={section.label}>
      <SectionHeader
        title={section.label}
        description={`${products.length} result${products.length === 1 ? '' : 's'}`}
        action={
          <Link
            to={`${section.route}?search=${encodeURIComponent(query)}`}
            className="flex min-h-11 shrink-0 items-center gap-1 text-[13px] font-semibold text-spet-link hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />
      <div className={GRID}>
        {products.map((product) => (
          <ProductTile key={product.id} product={product} supplier={section.supplier} />
        ))}
      </div>
    </section>
  );
}
