import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBrands, useCategories, useCategoryHeads, useProducts } from '../lib/api';
import { WishlistProvider } from '../components/WishlistProvider';
import { ActiveFilters, CatalogueBody, FilterPanel, FiltersButton, type ActiveFilter } from '../components/catalogue/CatalogueParts';
import { Button, ButtonLink, PageShell, SelectField } from '../components/ui';
import { useSEO } from '../lib/useSEO';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'featured', label: 'Featured' },
] as const;

type SortBy = (typeof SORT_OPTIONS)[number]['value'];
const PER_PAGE = 40;

function initialSort(value: string | null): SortBy {
  return SORT_OPTIONS.some((option) => option.value === value) ? (value as SortBy) : 'newest';
}

function toggled(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function ShopPage() {
  useSEO({
    title: 'Home & Entertainment Electronics',
    description:
      'Shop laptops, TVs, audio, smart home and more from SPET Online’s Home & Entertainment range, with fast delivery across South Africa.',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand') ? searchParams.get('brand')!.split(',') : []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? searchParams.get('category')!.split(',') : []
  );
  const [selectedCategoryHeads, setSelectedCategoryHeads] = useState<string[]>(
    searchParams.get('categoryHead') ? searchParams.get('categoryHead')!.split(',') : []
  );
  const [sortBy, setSortBy] = useState<SortBy>(initialSort(searchParams.get('sort')));
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10) || 1);

  const { brands } = useBrands();
  const { categories } = useCategories();
  const { categoryHeads } = useCategoryHeads();

  const { products, loading, total } = useProducts({
    search: search || undefined,
    brands: selectedBrands.length > 0 ? selectedBrands : undefined,
    categories: selectedCategories.length > 0 ? selectedCategories : undefined,
    categoryHeads: selectedCategoryHeads.length > 0 ? selectedCategoryHeads : undefined,
    sortBy,
    inStockOnly,
    page,
    perPage: PER_PAGE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }
    setPage(1);
  }, [search, selectedBrands, selectedCategories, selectedCategoryHeads, sortBy, inStockOnly]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedBrands.length) params.set('brand', selectedBrands.join(','));
    if (selectedCategories.length) params.set('category', selectedCategories.join(','));
    if (selectedCategoryHeads.length) params.set('categoryHead', selectedCategoryHeads.join(','));
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (inStockOnly) params.set('inStock', 'true');
    if (page > 1) params.set('page', page.toString());

    setSearchParams(params, { replace: true });
  }, [search, selectedBrands, selectedCategories, selectedCategoryHeads, sortBy, inStockOnly, page, setSearchParams]);

  function toggleBrand(name: string) {
    setSelectedBrands((current) => toggled(current, name));
  }
  function toggleCategory(name: string) {
    setSelectedCategories((current) => toggled(current, name));
  }
  function toggleCategoryHead(name: string) {
    setSelectedCategoryHeads((current) => toggled(current, name));
  }
  function clearAll() {
    setSearch('');
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedCategoryHeads([]);
    setSortBy('newest');
    setInStockOnly(false);
    setPage(1);
  }

  const filterCount =
    selectedBrands.length + selectedCategories.length + selectedCategoryHeads.length + (inStockOnly ? 1 : 0);
  const hasFilters = Boolean(search) || filterCount > 0;

  const activeFilters: ActiveFilter[] = [
    ...(search ? [{ key: 'search', label: `Search: ${search}`, onRemove: () => setSearch('') }] : []),
    ...selectedCategoryHeads.map((name) => ({ key: `head-${name}`, label: name, onRemove: () => toggleCategoryHead(name) })),
    ...selectedCategories.map((name) => ({ key: `category-${name}`, label: name, onRemove: () => toggleCategory(name) })),
    ...selectedBrands.map((name) => ({ key: `brand-${name}`, label: name, onRemove: () => toggleBrand(name) })),
    ...(inStockOnly ? [{ key: 'stock', label: 'In stock only', onRemove: () => setInStockOnly(false) }] : []),
  ];

  return (
    <WishlistProvider>
      <PageShell
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }, { label: 'Home & entertainment' }]}
        title={search ? `Results for “${search}”` : 'Home & entertainment'}
        description={
          loading ? 'Loading products…' : `${total.toLocaleString()} product${total === 1 ? '' : 's'} available`
        }
        actions={
          <div className="flex items-center gap-2">
            <FiltersButton count={filterCount} expanded={filtersOpen} onClick={() => setFiltersOpen(true)} />
            <SelectField
              id="shop-sort"
              label="Sort products"
              hideLabel
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
            />
          </div>
        }
      >
        <ActiveFilters filters={activeFilters} onClear={clearAll} />

        <CatalogueBody
          renderFilters={(idPrefix) => (
            <FilterPanel
              idPrefix={idPrefix}
              search={search}
              onSearch={setSearch}
              inStockOnly={inStockOnly}
              onInStockOnly={setInStockOnly}
              groups={[
                {
                  title: 'Departments',
                  options: categoryHeads.map((name) => ({ value: name, label: name })),
                  selected: selectedCategoryHeads,
                  onToggle: toggleCategoryHead,
                },
                {
                  title: 'Categories',
                  options: categories.map((category) => ({ value: category.name, label: category.name })),
                  selected: selectedCategories,
                  onToggle: toggleCategory,
                },
                {
                  title: 'Brands',
                  options: brands.map((brand) => ({ value: brand.name, label: brand.name })),
                  selected: selectedBrands,
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
          supplier="esquire"
          page={page}
          totalPages={totalPages}
          onPage={setPage}
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

        {!loading && products.length > 0 && (
          <div className="mt-6 flex justify-center">
            <ButtonLink to="/shop" variant="ghost">
              Back to shop sections
            </ButtonLink>
          </div>
        )}
      </PageShell>
    </WishlistProvider>
  );
}
