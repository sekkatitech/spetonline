import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Grid3x3 } from 'lucide-react';
import { useCategories, useCategoryHeads } from '../lib/api';
import { fetchActiveRows, SUPPLIERS, type SupplierConfig, type SupplierKey } from '../lib/supplierCatalog';
import { useSEO } from '../lib/useSEO';
import { SafeImage } from '../components/SafeImage';
import { ButtonLink, PageShell, SectionHeader, Skeleton, Tabs, panelStyles } from '../components/ui';

// Syntech categories with friendly display names
const CATEGORY_LABELS: Record<string, string> = {
  'Computer peripherals': 'Computer peripherals',
  Components: 'PC components',
  Cables: 'Cables & adapters',
  'Bags & luggage': 'Bags & luggage',
  Appliances: 'Appliances',
  Power: 'Power solutions',
  'Networking & security': 'Networking & security',
  'TV & audio': 'TV & audio',
  Mobile: 'Mobile accessories',
  Software: 'Software',
  'Lifestyle & home tech': 'Lifestyle & home tech',
  Computers: 'Computers',
};

type TabId = 'home' | 'gaming' | 'axiz' | 'pinnacle';

const SUPPLIER_TABS: { id: Exclude<TabId, 'home'>; supplier: SupplierKey }[] = [
  { id: 'gaming', supplier: 'syntech' },
  { id: 'axiz', supplier: 'axiz' },
  { id: 'pinnacle', supplier: 'pinnacle' },
];

const TABS = [
  { id: 'home', label: 'Home & entertainment' },
  ...SUPPLIER_TABS.map(({ id, supplier }) => ({ id, label: SUPPLIERS[supplier].label })),
];

const GRID = 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5';

interface SupplierCategory {
  name: string;
  count: number;
  image: string | null;
}

/** One query per supplier: counts and a representative image for every category. */
function useSupplierCategories(table: string) {
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchActiveRows<{ category: string | null; thumbnail_url: string | null }>(table, 'category, thumbnail_url').then((rows) => {
      if (cancelled) return;
      const byName = new Map<string, SupplierCategory>();
      for (const row of rows) {
        if (!row.category) continue;
        const entry = byName.get(row.category) ?? { name: row.category, count: 0, image: null };
        entry.count += 1;
        entry.image = entry.image ?? row.thumbnail_url;
        byName.set(row.category, entry);
      }
      setCategories([...byName.values()].sort((a, b) => b.count - a.count));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [table]);

  return { categories, loading };
}

function CategoryCard({ to, title, meta, image }: { to: string; title: string; meta: string; image: string | null }) {
  return (
    <Link to={to} className={`${panelStyles} group block overflow-hidden transition-colors hover:border-spet-blue`}>
      <div className="flex aspect-[4/3] items-center justify-center bg-white p-4">
        {image ? (
          <SafeImage
            src={image}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
          />
        ) : (
          <Grid3x3 className="h-8 w-8 text-spet-was" aria-hidden="true" />
        )}
      </div>
      <div className="p-3.5">
        <h3 className="text-[14px] font-semibold leading-snug text-spet-ink group-hover:text-spet-blue">{title}</h3>
        <p className="mt-0.5 text-[12px] text-spet-muted">{meta}</p>
      </div>
    </Link>
  );
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className={GRID}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="aspect-[4/3] rounded-2xl" />
      ))}
    </div>
  );
}

function AllProductsLink({ to }: { to: string }) {
  return (
    <Link to={to} className="flex min-h-11 shrink-0 items-center gap-1 text-[13px] font-semibold text-spet-link hover:underline">
      All products <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

function HomeTab() {
  const { categories, loading } = useCategories();
  const { categoryHeads, categoryImages, loading: headsLoading } = useCategoryHeads();
  const isLoading = loading || headsLoading;

  const subCategoryCount = new Map<string, number>();
  for (const category of categories) {
    const head = category.parent_id || 'Other';
    subCategoryCount.set(head, (subCategoryCount.get(head) ?? 0) + 1);
  }

  return (
    <>
      <SectionHeader title="Shop by department" action={<AllProductsLink to="/shop/home" />} />
      {isLoading ? (
        <SkeletonGrid count={10} />
      ) : (
        <div className={GRID}>
          {categoryHeads.map((head) => {
            const count = subCategoryCount.get(head) ?? 0;
            return (
              <CategoryCard
                key={head}
                to={`/shop/home?categoryHead=${encodeURIComponent(head)}`}
                title={head}
                meta={count > 0 ? `${count} sub-categor${count === 1 ? 'y' : 'ies'}` : 'View products'}
                image={categoryImages[head] ?? null}
              />
            );
          })}
        </div>
      )}

      {!isLoading && categories.length > 0 && (
        <div className="mt-10">
          <SectionHeader title="All sub-categories" />
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  to={`/shop/home?category=${encodeURIComponent(category.name)}`}
                  className="flex h-full min-h-11 flex-col justify-center rounded-lg border border-spet-line bg-spet-surface px-3 py-2 transition-colors hover:border-spet-blue"
                >
                  <span className="text-[13px] font-medium leading-snug text-spet-ink">{category.name}</span>
                  {category.parent_id && <span className="mt-0.5 text-[11px] text-spet-muted">{category.parent_id}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function SupplierTab({ config }: { config: SupplierConfig }) {
  const { categories, loading } = useSupplierCategories(config.table);

  return (
    <>
      <SectionHeader title={config.label} action={<AllProductsLink to={config.route} />} />
      {loading ? (
        <SkeletonGrid count={12} />
      ) : (
        <div className={GRID}>
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              to={`${config.route}?category=${encodeURIComponent(category.name)}`}
              title={CATEGORY_LABELS[category.name] ?? category.name}
              meta={`${category.count} product${category.count === 1 ? '' : 's'}`}
              image={category.image}
            />
          ))}
        </div>
      )}
    </>
  );
}

export function CategoriesPage() {
  useSEO({
    title: 'Shop by Category',
    description: 'Browse SPET Online by category — laptops, smartphones, TVs, gaming, audio and more, all in one place.',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab');
  const activeTab: TabId = SUPPLIER_TABS.some((tab) => tab.id === requested) ? (requested as TabId) : 'home';
  const activeSupplier = SUPPLIER_TABS.find((tab) => tab.id === activeTab)?.supplier;

  return (
    <PageShell
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Categories' }]}
      title="All categories"
      description="Browse the full range across every department."
    >
      <Tabs
        label="Category sections"
        items={TABS}
        value={activeTab}
        onChange={(id) => setSearchParams(id === 'home' ? {} : { tab: id })}
        className="mb-6"
      />

      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeSupplier ? <SupplierTab key={activeSupplier} config={SUPPLIERS[activeSupplier]} /> : <HomeTab />}
      </div>

      <div className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl bg-spet-navy p-6 md:flex-row md:items-center md:p-8">
        <div>
          <h2 className="font-display text-[24px] font-semibold tracking-tight text-white">Can’t find what you’re looking for?</h2>
          <p className="mt-1 text-[14px] text-white/70">Browse a full range or contact our sales team.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/shop">Go to shop</ButtonLink>
          <Link
            to="/contact"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-white/30 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
          >
            Contact us
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
