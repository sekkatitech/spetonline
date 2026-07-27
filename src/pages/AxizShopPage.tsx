// @ts-nocheck
import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SafeImage } from '../components/SafeImage';
import { useCartStore } from '../lib/cartStore';
import { NavSpacer } from '../components/Layout';
import { useSEO } from '../lib/useSEO';

const PER_PAGE = 40;

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

// ── Product card ──────────────────────────────────────────────────────────────
function AxizProductCard({ product }: { product: any }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const price   = product.price_display ?? 0;
  const image   = product.thumbnail_url ?? product.images?.[0] ?? null;
  const brand   = product.brand ?? '';
  const inStock = (product.stock_qty ?? 0) > 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      supplier: 'axiz',
      id:         product.id,
      product_id: product.id,
      name:       product.name,
      brand,
      price,
      image:      image || '',
      sku:        product.sku,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    // No dedicated public product-detail page for Axiz yet (only the
    // Enterprise B2B one exists, which is the wrong UI/context for a
    // retail shopper) — card stays in-place, Add to Cart is the only action.
    <div
      className="group bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl overflow-hidden hover:border-lago-400 dark:hover:border-lago-600 hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative bg-gray-50 dark:bg-lago-800/50 aspect-square overflow-hidden">
        <SafeImage
          src={image}
          brand={brand}
          alt={product.name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {!inStock && (
          <span className="absolute top-3 left-3 bg-gray-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">OUT OF STOCK</span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {brand && (
          <p className="text-[10px] font-bold text-lago-500 dark:text-lago-400 uppercase tracking-widest mb-1">{brand}</p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-3 line-clamp-2 group-hover:text-lago-600 dark:group-hover:text-lago-400 transition-colors">
          {product.name}
        </h3>
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-0.5">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              R {price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">incl. VAT</p>
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
              added
                ? 'bg-green-500 text-white'
                : inStock
                ? 'bg-lago-600 hover:bg-lago-700 text-white'
                : 'bg-gray-100 dark:bg-lago-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            {added ? '✓ Added to Cart' : inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function AxizShopPage() {
  useSEO({
    title: 'Axiz Digital Products',
    description: 'Shop the Axiz Digital range on SPET Online, with fast delivery across South Africa.',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const [products,     setProducts]     = useState<any[]>([]);
  const [loading,       setLoading]     = useState(true);
  const [total,           setTotal]     = useState(0);
  const [page,             setPage]     = useState(() => parseInt(searchParams.get('page') || '1', 10));
  const [search,         setSearch]     = useState('');
  const [sortBy,         setSortBy]     = useState('newest');
  const [inStockOnly,   setInStockOnly] = useState(false);
  const [selectedBrands,     setSelectedBrands]     = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [brands,     setBrands]     = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Populate brand/category filter options once, from the full active set
  useEffect(() => {
    supabase
      .from('axiz_products')
      .select('brand, category')
      .eq('is_active', true)
      .then(({ data }) => {
        if (!data) return;
        setBrands([...new Set(data.map((p: any) => p.brand).filter(Boolean))].sort());
        setCategories([...new Set(data.map((p: any) => p.category).filter(Boolean))].sort());
      });
  }, []);

  // Sync page number to URL so back button preserves position
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) params.set('page', page.toString());
    else params.delete('page');
    setSearchParams(params, { replace: true });
  }, [page]);

  // Load products
  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from('axiz_products')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (search)                        query = query.ilike('name', `%${search}%`);
    if (inStockOnly)                   query = query.gt('stock_qty', 0);
    if (selectedBrands.length > 0)     query = query.in('brand', selectedBrands);
    if (selectedCategories.length > 0) query = query.in('category', selectedCategories);

    switch (sortBy) {
      case 'price_asc':  query = query.order('price_display', { ascending: true });  break;
      case 'price_desc': query = query.order('price_display', { ascending: false }); break;
      default:           query = query.order('last_synced_at', { ascending: false });
    }

    const from = (page - 1) * PER_PAGE;
    query = query.range(from, from + PER_PAGE - 1);

    query.then(({ data, count }) => {
      setProducts(data ?? []);
      setTotal(count ?? 0);
      setLoading(false);
    });
  }, [search, sortBy, inStockOnly, selectedBrands, selectedCategories, page]);

  function toggleBrand(name: string) {
    setSelectedBrands((prev) => prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]);
    setPage(1);
  }
  function toggleCategory(name: string) {
    setSelectedCategories((prev) => prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]);
    setPage(1);
  }
  function clearAll() {
    setSearch(''); setSelectedBrands([]); setSelectedCategories([]); setInStockOnly(false); setPage(1);
  }

  const hasFilters = !!(search || selectedBrands.length || selectedCategories.length || inStockOnly);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d]">

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-br from-orange-800 via-orange-900 to-[#1a0e00] pb-10 px-4">
        <NavSpacer />
        <div className="max-w-7xl mx-auto">
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-orange-300 hover:text-white text-sm font-medium transition-colors mb-6">
            ← Back to Shop
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white">
              Axiz Digital
            </h1>
          </div>
          <p className="text-orange-200 text-base">
            Distributor range, sourced fresh from Axiz Digital's price list
          </p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <p className="text-gray-500 dark:text-lago-400 text-sm">
            {loading ? 'Loading...' : `${total.toLocaleString()} product${total !== 1 ? 's' : ''} found`}
            {hasFilters && (
              <button onClick={clearAll} className="ml-3 text-xs text-red-500 hover:underline">Clear all</button>
            )}
          </p>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products..."
                className="pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-orange-500 w-52"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-sm font-semibold text-gray-700 dark:text-white hover:border-orange-500 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="w-5 h-5 bg-orange-600 text-white text-[10px] rounded-full flex items-center justify-center">
                  {selectedBrands.length + selectedCategories.length + (inStockOnly ? 1 : 0)}
                </span>
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-sm font-semibold text-gray-700 dark:text-white hover:border-orange-500 transition-colors shadow-sm focus:outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-lago-400 mb-3">Stock</p>
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  onClick={() => { setInStockOnly(!inStockOnly); setPage(1); }}
                  className={`relative w-11 h-6 rounded-full transition-colors ${inStockOnly ? 'bg-orange-600' : 'bg-gray-300 dark:bg-lago-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${inStockOnly ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-sm text-gray-700 dark:text-lago-200">In stock only</span>
              </label>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-lago-400 mb-3">Category</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)}
                      className="w-4 h-4 rounded text-orange-600 border-gray-300 dark:border-lago-600 bg-white dark:bg-lago-800 focus:ring-orange-500" />
                    <span className="text-sm text-gray-700 dark:text-lago-100 group-hover:text-orange-600 dark:group-hover:text-white transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-lago-400 mb-3">Brand</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands.map((b) => (
                  <label key={b} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)}
                      className="w-4 h-4 rounded text-orange-600 border-gray-300 dark:border-lago-600 bg-white dark:bg-lago-800 focus:ring-orange-500" />
                    <span className="text-sm text-gray-700 dark:text-lago-100 group-hover:text-orange-600 dark:group-hover:text-white transition-colors">{b}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedBrands.map((b) => (
              <span key={b} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200 text-sm font-medium">
                {b} <button onClick={() => toggleBrand(b)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {selectedCategories.map((c) => (
              <span key={c} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200 text-sm font-medium">
                {c} <button onClick={() => toggleCategory(c)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {inStockOnly && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium">
                In Stock Only <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl aspect-square animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No products found</p>
            {hasFilters && <button onClick={clearAll} className="mt-4 text-orange-600 text-sm hover:underline">Clear all filters</button>}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <AxizProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-gray-700 dark:text-white text-sm font-semibold disabled:opacity-30 hover:border-orange-500 transition-colors shadow-sm">
              « First
            </button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-gray-700 dark:text-white text-sm font-semibold disabled:opacity-30 hover:border-orange-500 transition-colors shadow-sm">
              ‹ Prev
            </button>

            {(() => {
              const delta = 2;
              const start = Math.max(1, page - delta);
              const end   = Math.min(totalPages, page + delta);
              const pages = [];
              if (start > 1) pages.push(<span key="start-ellipsis" className="text-gray-400 px-1">...</span>);
              for (let p = start; p <= end; p++) {
                pages.push(
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                      page === p
                        ? 'bg-orange-600 text-white border border-orange-600'
                        : 'bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-gray-700 dark:text-white hover:border-orange-500'
                    }`}>
                    {p}
                  </button>
                );
              }
              if (end < totalPages) pages.push(<span key="end-ellipsis" className="text-gray-400 px-1">...</span>);
              return pages;
            })()}

            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-gray-700 dark:text-white text-sm font-semibold disabled:opacity-30 hover:border-orange-500 transition-colors shadow-sm">
              Next ›
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-gray-700 dark:text-white text-sm font-semibold disabled:opacity-30 hover:border-orange-500 transition-colors shadow-sm">
              Last »
            </button>
            <span className="text-gray-400 text-sm ml-2">
              Page {page} of {totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
