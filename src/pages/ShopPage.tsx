import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useProducts, useBrands, useCategories, useCategoryHeads } from '../lib/api';
import { ProductCard, ProductSkeleton } from '../components/ProductSections';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'featured', label: 'Featured' },
];

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const navigate = useNavigate();

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
  const [sortBy, setSortBy] = useState<any>(searchParams.get('sort') ?? 'newest');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStock') === 'true');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10) || 1);
  const PER_PAGE = 20;

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
    setSelectedBrands((prev) => prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]);
  }
  function toggleCategory(name: string) {
    setSelectedCategories((prev) => prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]);
  }
  function toggleCategoryHead(name: string) {
    setSelectedCategoryHeads((prev) => prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]);
  }
  function clearAll() {
    setSearch(''); setSelectedBrands([]); setSelectedCategories([]); setSelectedCategoryHeads([]); setSortBy('newest'); setInStockOnly(false); setPage(1);
  }

  const hasFilters = search || selectedBrands.length > 0 || selectedCategories.length > 0 || selectedCategoryHeads.length > 0 || inStockOnly;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] transition-colors duration-300 pt-32 md:pt-36">
      <div className="container mx-auto px-4 md:px-6 py-8">

        {/* Back Navigation */}
        <button
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate('/');
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-700 text-sm font-semibold text-gray-600 dark:text-lago-200 hover:border-lago-500 hover:text-lago-600 dark:hover:text-white transition-all shadow-sm mb-6"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white">
              {search ? `Results for "${search}"` : 'Shop All Products'}
            </h1>
            <p className="text-gray-500 dark:text-lago-400 mt-1 text-sm">
              {loading ? 'Loading...' : `${total.toLocaleString()} product${total !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-sm font-semibold text-gray-700 dark:text-white hover:border-lago-500 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters {hasFilters && <span className="w-5 h-5 bg-lago-600 text-white text-[10px] rounded-full flex items-center justify-center">{selectedBrands.length + selectedCategories.length + selectedCategoryHeads.length + (inStockOnly ? 1 : 0)}</span>}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-sm font-semibold text-gray-700 dark:text-white hover:border-lago-500 transition-colors shadow-sm focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Active filters strip */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {search && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lago-100 dark:bg-lago-800 text-lago-700 dark:text-lago-200 text-sm font-medium">
                Search: {search}
                <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {selectedCategoryHeads.map((name) => (
              <span key={name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lago-100 dark:bg-lago-800 text-lago-700 dark:text-lago-200 text-sm font-medium">
                {name} <button onClick={() => toggleCategoryHead(name)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {selectedCategories.map((name) => (
              <span key={name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lago-100 dark:bg-lago-800 text-lago-700 dark:text-lago-200 text-sm font-medium">
                {name} <button onClick={() => toggleCategory(name)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {selectedBrands.map((name) => (
              <span key={name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lago-100 dark:bg-lago-800 text-lago-700 dark:text-lago-200 text-sm font-medium">
                {name} <button onClick={() => toggleBrand(name)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {inStockOnly && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                In Stock Only <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearAll} className="text-xs text-gray-500 dark:text-lago-400 hover:text-red-500 dark:hover:text-red-400 font-medium underline ml-2">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-5 sticky top-36 shadow-sm max-h-[80vh] overflow-y-auto">

              {/* Search within shop */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-lago-400 mb-3">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Product name, code..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-lago-800 border border-gray-200 dark:border-lago-700 text-gray-900 dark:text-white focus:outline-none focus:border-lago-500"
                  />
                </div>
              </div>

              {/* In stock toggle */}
              <div className="mb-6 flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-lago-400">In Stock Only</label>
                <button
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${inStockOnly ? 'bg-lago-600' : 'bg-gray-300 dark:bg-lago-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${inStockOnly ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              {/* Category Heads (top-level) */}
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-lago-400 mb-3">Departments</p>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {categoryHeads.length === 0
                    ? <p className="text-xs text-gray-400 dark:text-lago-500">Loading...</p>
                    : categoryHeads.map((name) => (
                        <label key={name} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCategoryHeads.includes(name)}
                            onChange={() => toggleCategoryHead(name)}
                            className="w-4 h-4 rounded text-lago-600 border-gray-300 dark:border-lago-600 bg-white dark:bg-lago-800 focus:ring-lago-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-lago-100 group-hover:text-lago-600 dark:group-hover:text-white transition-colors">{name}</span>
                        </label>
                      ))
                  }
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-lago-400 mb-3">Categories</p>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {categories.length === 0
                    ? <p className="text-xs text-gray-400 dark:text-lago-500">Loading...</p>
                    : categories.map((cat) => (
                        <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.name)}
                            onChange={() => toggleCategory(cat.name)}
                            className="w-4 h-4 rounded text-lago-600 border-gray-300 dark:border-lago-600 bg-white dark:bg-lago-800 focus:ring-lago-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-lago-100 group-hover:text-lago-600 dark:group-hover:text-white transition-colors">{cat.name}</span>
                        </label>
                      ))
                  }
                </div>
              </div>

              {/* Brands */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-lago-400 mb-3">Brands</p>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {brands.length === 0
                    ? <p className="text-xs text-gray-400 dark:text-lago-500">Loading...</p>
                    : brands.map((brand) => (
                        <label key={brand.id} className="flex items-center gap-2.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand.name)}
                            onChange={() => toggleBrand(brand.name)}
                            className="w-4 h-4 rounded text-lago-600 border-gray-300 dark:border-lago-600 bg-white dark:bg-lago-800 focus:ring-lago-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-lago-100 group-hover:text-lago-600 dark:group-hover:text-white transition-colors">{brand.name}</span>
                        </label>
                      ))
                  }
                </div>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: PER_PAGE }).map((_, i) => <ProductSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-lago-800 flex items-center justify-center mb-6">
                  <Search className="w-9 h-9 text-gray-400 dark:text-lago-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
                <p className="text-gray-500 dark:text-lago-400 mb-6">Try adjusting your filters or search term.</p>
                <button onClick={clearAll} className="px-6 py-2.5 rounded-full bg-lago-600 text-white font-semibold hover:bg-lago-700 transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-300 dark:border-lago-700 text-gray-600 dark:text-lago-200 hover:bg-white dark:hover:bg-lago-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .map((p, idx, arr) => (
                        <span key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-gray-400 mx-1">…</span>}
                          <button
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 inline-flex items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                              p === page
                                ? 'bg-lago-600 text-white shadow-lg shadow-lago-600/20'
                                : 'border border-gray-300 dark:border-lago-700 text-gray-600 dark:text-lago-200 hover:bg-white dark:hover:bg-lago-800'
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      ))
                    }
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-300 dark:border-lago-700 text-gray-600 dark:text-lago-200 hover:bg-white dark:hover:bg-lago-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
