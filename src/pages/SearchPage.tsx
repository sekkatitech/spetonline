import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { escapeLike, type Product } from '../lib/api';
import { formatAppleName } from '../lib/appleFormat';
import { appleHref } from '../lib/appleQuery';
import type { AppleProduct } from '../lib/appleTypes';
import { useAppleBuying } from '../lib/useAppleBuying';
import { useAppleSearch } from '../lib/useAppleCatalogue';
import type { ProductSupplier } from '../lib/productDisplay';
import { supabase } from '../lib/supabase';
import { SUPPLIERS } from '../lib/supplierCatalog';
import { useSEO } from '../lib/useSEO';
import { WishlistProvider } from '../components/WishlistProvider';
import { AppleSearchResults } from '../components/apple/AppleSearchResults';
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

const SECTION_LIMIT = 20;
/** Apple reads through its own function, so a shelf of eight with a link to the full range. */
const APPLE_LIMIT = 8;

const GRID = 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const term = q.trim();

  // Internal search results shouldn't be indexed — thin/duplicate content per Google's own guidance
  useSEO({
    title: q ? `Search results for "${q}"` : 'Search',
    description: q ? `Search results for "${q}" on SPET Online.` : 'Search SPET Online for electronics and tech products.',
    noindex: true,
  });

  const [results, setResults] = useState<Partial<Record<ProductSupplier, Product[]>>>({});
  const [failed, setFailed] = useState<SearchSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const apple = useAppleSearch(term, APPLE_LIMIT);
  const { buy, addToQuote } = useAppleBuying();
  const [quoteNote, setQuoteNote] = useState('');

  useEffect(() => {
    setQuoteNote('');
  }, [term]);

  useEffect(() => {
    if (!term) {
      setResults({});
      setFailed([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // One department failing shouldn't hide the others, so this settles every query
    // instead of rejecting the whole search on the first error.
    Promise.allSettled(
      SECTIONS.map((section) =>
        supabase
          .from(section.table)
          .select('*')
          .eq('is_active', true)
          .ilike(section.nameColumn, `%${escapeLike(term)}%`)
          .order(section.nameColumn, { ascending: true })
          .limit(SECTION_LIMIT)
      )
    ).then((settled) => {
      if (cancelled) return;

      const next: Partial<Record<ProductSupplier, Product[]>> = {};
      const problems: SearchSection[] = [];

      settled.forEach((outcome, index) => {
        const section = SECTIONS[index];
        if (outcome.status === 'fulfilled' && !outcome.value.error) {
          next[section.supplier] = (outcome.value.data ?? []) as Product[];
        } else {
          next[section.supplier] = [];
          problems.push(section);
        }
      });

      setResults(next);
      setFailed(problems);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [term, attempt]);

  const handleAddToQuote = (product: AppleProduct) => {
    if (!addToQuote(product, 1)) return;
    setQuoteNote(`${formatAppleName(product.name)} added to your quote.`);
  };

  const shopTotal = SECTIONS.reduce((sum, section) => sum + (results[section.supplier]?.length ?? 0), 0);
  const shown = shopTotal + apple.products.length;
  const capped = SECTIONS.some((section) => (results[section.supplier]?.length ?? 0) === SECTION_LIMIT);
  const hasMore = capped || apple.total > apple.products.length;

  const description = loading
    ? 'Searching…'
    : !term
      ? 'Enter a search term in the bar above.'
      : `${shown} product${shown === 1 ? '' : 's'}${hasMore ? ', with more in some departments' : ''}`;

  return (
    <WishlistProvider>
      <PageShell
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Search' }]}
        title={q ? `Results for “${q}”` : 'Search products'}
        description={description}
      >
        {failed.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-spet-line bg-spet-surface px-4 py-3">
            <p className="text-[13px] text-spet-ink">
              {failed.length === 1
                ? `${failed[0].label} didn't load.`
                : `${failed.map((section) => section.label).join(', ')} didn't load.`}{' '}
              The rest of the results are below.
            </p>
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="min-h-11 shrink-0 rounded-lg border border-spet-blue px-4 text-[13px] font-semibold text-spet-blue transition-colors hover:bg-spet-blue hover:text-white"
            >
              Try again
            </button>
          </div>
        )}

        <p aria-live="polite" role="status" className="sr-only">
          {quoteNote}
        </p>

        {quoteNote && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-spet-line bg-spet-surface px-4 py-3">
            <p className="text-[13px] text-spet-ink">{quoteNote}</p>
            <Link
              to={appleHref({ quote: true })}
              className="flex min-h-11 shrink-0 items-center gap-1 text-[13px] font-semibold text-spet-link hover:underline"
            >
              Review quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}

        {term && (
          <div className="space-y-10">
            <AppleSearchResults
              query={term}
              products={apple.products}
              total={apple.total}
              status={apple.status}
              onRetry={apple.retry}
              onBuy={buy}
              onAddToQuote={handleAddToQuote}
            />

            {loading && (
              <div className={GRID} aria-hidden="true">
                {Array.from({ length: 10 }).map((_, index) => (
                  <ProductTileSkeleton key={index} />
                ))}
              </div>
            )}

            {!loading &&
              SECTIONS.map((section) => (
                <SearchResultsSection key={section.supplier} section={section} query={q} products={results[section.supplier] ?? []} />
              ))}
          </div>
        )}

        {!loading && term && shown === 0 && failed.length === 0 && (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="No products found"
            description="Try a different search term, or browse the departments."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <ButtonLink to="/categories">Browse categories</ButtonLink>
                <ButtonLink to="/enterprise/apple" variant="secondary">
                  Browse Apple
                </ButtonLink>
              </div>
            }
          />
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
