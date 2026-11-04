import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { escapeLike, type Product } from '../lib/api';
import { supabase } from '../lib/supabase';
import { fetchActiveRows, LOGO_TOKEN, type BrandLogo, type SupplierConfig } from '../lib/supplierCatalog';
import { useSEO } from '../lib/useSEO';
import { WishlistProvider } from '../components/WishlistProvider';
import { ActiveFilters, CatalogueBody, FilterPanel, FiltersButton, type ActiveFilter } from '../components/catalogue/CatalogueParts';
import { Button, ButtonLink, PageShell, SelectField } from '../components/ui';

const PER_PAGE = 40;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

/** Accepts both `brand=a,b` (older links) and repeated `brand=a&brand=b`. */
function readBrands(params: URLSearchParams): string[] {
  return params.getAll('brand').flatMap((value) => value.split(',')).filter(Boolean);
}

function toggled(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function withSelected(options: string[], selected: string[]): { value: string; label: string }[] {
  return [...new Set([...options, ...selected])].map((value) => ({ value, label: value }));
}

export function SupplierShopPage({ config }: { config: SupplierConfig }) {
  useSEO({ title: config.seoTitle, description: config.seoDescription });

  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [brands, setBrands] = useState<string[]>(() => readBrands(searchParams));
  const [categories, setCategories] = useState<string[]>(() => searchParams.getAll('category'));
  const [sortBy, setSortBy] = useState(() => searchParams.get('sort') ?? 'newest');
  const [inStockOnly, setInStockOnly] = useState(() => searchParams.get('inStock') === 'true');
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') ?? '1', 10) || 1);

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [brandOptions, setBrandOptions] = useState<string[]>(() =>
    config.brandOptions === 'tiles' ? config.brandTiles.map((brand) => brand.name) : []
  );
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchActiveRows<{ brand: string | null; category: string | null }>(config.table, 'brand, category').then((rows) => {
      if (cancelled) return;
      const unique = (values: (string | null)[]) => [...new Set(values.filter(Boolean) as string[])].sort();
      setCategoryOptions(unique(rows.map((row) => row.category)));
      if (config.brandOptions === 'live') setBrandOptions(unique(rows.map((row) => row.brand)));
    });
    return () => {
      cancelled = true;
    };
  }, [config]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    let query = supabase.from(config.table).select('*', { count: 'exact' }).eq('is_active', true);

    if (search) query = query.ilike('name', `%${escapeLike(search)}%`);
    if (inStockOnly) query = query.gt('stock_qty', 0);
    if (brands.length > 0) query = query.in('brand', brands);
    if (categories.length > 0) query = query.in('category', categories);

    if (sortBy === 'price_asc') query = query.order('price_display', { ascending: true });
    else if (sortBy === 'price_desc') query = query.order('price_display', { ascending: false });
    else query = query.order('last_synced_at', { ascending: false });

    const from = (page - 1) * PER_PAGE;
    query.range(from, from + PER_PAGE - 1).then(({ data, count }) => {
      if (cancelled) return;
      setProducts((data ?? []) as Product[]);
      setTotal(count ?? 0);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [config, search, sortBy, inStockOnly, brands, categories, page]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    brands.forEach((brand) => params.append('brand', brand));
    categories.forEach((category) => params.append('category', category));
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (inStockOnly) params.set('inStock', 'true');
    if (page > 1) params.set('page', String(page));
    setSearchParams(params, { replace: true });
  }, [search, brands, categories, sortBy, inStockOnly, page, setSearchParams]);

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }
  function toggleBrand(name: string) {
    setBrands((current) => toggled(current, name));
    setPage(1);
  }
  function toggleCategory(name: string) {
    setCategories((current) => toggled(current, name));
    setPage(1);
  }
  function changeInStock(value: boolean) {
    setInStockOnly(value);
    setPage(1);
  }
  function clearAll() {
    setSearch('');
    setBrands([]);
    setCategories([]);
    setInStockOnly(false);
    setPage(1);
  }

  const filterCount = brands.length + categories.length + (inStockOnly ? 1 : 0);
  const hasFilters = Boolean(search) || filterCount > 0;

  const activeFilters: ActiveFilter[] = [
    ...(search ? [{ key: 'search', label: `Search: ${search}`, onRemove: () => changeSearch('') }] : []),
    ...categories.map((name) => ({ key: `category-${name}`, label: name, onRemove: () => toggleCategory(name) })),
    ...brands.map((name) => ({ key: `brand-${name}`, label: name, onRemove: () => toggleBrand(name) })),
    ...(inStockOnly ? [{ key: 'stock', label: 'In stock only', onRemove: () => changeInStock(false) }] : []),
  ];

  return (
    <WishlistProvider>
      <PageShell
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: config.label }]}
        title={search ? `Results for “${search}”` : config.label}
        description={loading ? 'Loading products…' : `${total.toLocaleString()} product${total === 1 ? '' : 's'} available`}
        actions={
          <div className="flex items-center gap-2">
            <FiltersButton count={filterCount} expanded={filtersOpen} onClick={() => setFiltersOpen(true)} />
            <SelectField
              id="shop-sort"
              label="Sort products"
              hideLabel
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                setPage(1);
              }}
            />
          </div>
        }
      >
        <p className="-mt-3 mb-4 max-w-3xl text-[13px] text-spet-muted">{config.description}</p>

        <BrandTiles tiles={config.brandTiles} selected={brands} onToggle={toggleBrand} />

        <ActiveFilters filters={activeFilters} onClear={clearAll} />

        <CatalogueBody
          renderFilters={(idPrefix) => (
            <FilterPanel
              idPrefix={idPrefix}
              search={search}
              onSearch={changeSearch}
              inStockOnly={inStockOnly}
              onInStockOnly={changeInStock}
              groups={[
                {
                  title: 'Categories',
                  options: withSelected(categoryOptions, categories),
                  selected: categories,
                  onToggle: toggleCategory,
                },
                {
                  title: 'Brands',
                  options: withSelected(brandOptions, brands),
                  selected: brands,
                  onToggle: toggleBrand,
                },
              ]}
              hasFilters={hasFilters}
              onClear={clearAll}
              onDone={() => setFiltersOpen(false)}
              resultLabel={`Show ${loading ? 'results' : `${total.toLocaleString()} products`}`}
            />
          )}
          filtersOpen={filtersOpen}
          onCloseFilters={() => setFiltersOpen(false)}
          loading={loading}
          products={products}
          supplier={config.key}
          page={page}
          totalPages={Math.max(1, Math.ceil(total / PER_PAGE))}
          onPage={setPage}
          paginationWindow={config.paginationWindow}
          emptyAction={
            <div className="flex flex-wrap items-center justify-center gap-3">
              {hasFilters && (
                <Button variant="secondary" onClick={clearAll}>
                  Clear filters
                </Button>
              )}
              <ButtonLink to="/categories">Browse categories</ButtonLink>
            </div>
          }
        />
      </PageShell>
    </WishlistProvider>
  );
}

function BrandTiles({ tiles, selected, onToggle }: { tiles: BrandLogo[]; selected: string[]; onToggle: (name: string) => void }) {
  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by brand">
      {tiles.map((brand) => {
        const isSelected = selected.includes(brand.name);
        return (
          <button
            key={brand.name}
            type="button"
            onClick={() => onToggle(brand.name)}
            aria-pressed={isSelected}
            className={`relative flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border bg-spet-surface transition-colors ${
              isSelected ? 'border-spet-blue' : 'border-spet-line hover:border-spet-blue'
            }`}
          >
            <span className="flex h-9 w-12 items-center justify-center rounded bg-white p-0.5">
              <BrandLogoImage brand={brand} />
            </span>
            <span className="w-full truncate px-1 text-center text-[11px] font-medium leading-tight text-spet-ink-2">{brand.name}</span>
            {isSelected && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-spet-blue text-white">
                <Check className="h-2.5 w-2.5" aria-hidden="true" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function BrandLogoImage({ brand }: { brand: BrandLogo }) {
  const [failed, setFailed] = useState(false);

  if (failed || !brand.domain) {
    return <span className="text-[11px] font-bold leading-tight text-[#101820]">{brand.name.slice(0, 4)}</span>;
  }

  return (
    <img
      src={`https://img.logo.dev/${brand.domain}?token=${LOGO_TOKEN}&format=png&size=80`}
      alt=""
      loading="lazy"
      decoding="async"
      className="max-h-full max-w-full object-contain"
      onError={() => setFailed(true)}
    />
  );
}
