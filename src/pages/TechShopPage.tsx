// @ts-nocheck
import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SafeImage } from '../components/SafeImage';
import { useCartStore } from '../lib/cartStore';
import { useAuth } from '../lib/AuthContext';
import { useWishlist } from '../lib/api';
import { NavSpacer } from '../components/Layout';

// ── All actual Syntech brands with logo.dev API (reliable, token-based) ──────
const LOGO_TOKEN = 'pk_RSkNTnvvScKErzhoXO5UUg';

const SYNTECH_BRANDS = [
  { name: 'Xiaomi',       domain: 'xiaomi.com' },
  { name: 'Ugreen',       domain: 'ugreen.com' },
  { name: 'ASUS',         domain: 'asus.com' },
  { name: 'Port',         domain: 'portdesigns.com' },
  { name: 'Redragon',     domain: 'redragon.com' },
  { name: 'MSI',          domain: 'msi.com' },
  { name: 'Patriot',      domain: 'patriotmemory.com' },
  { name: 'Gizzu',        domain: 'gizzu.co.za' },
  { name: 'Winx',         domain: 'winxdesign.com' },
  { name: 'HIKSEMI',      domain: 'hiksemi.com' },
  { name: 'Cudy',         domain: 'cudy.net' },
  { name: 'Keychron',     domain: 'keychron.com' },
  { name: 'PCBuilder',    domain: 'pcbuilder.net' },
  { name: 'Antec',        domain: 'antec.com' },
  { name: 'FSP',          domain: 'fsp-group.com' },
  { name: 'Crucial',      domain: 'crucial.com' },
  { name: 'AMD',          domain: 'amd.com' },
  { name: 'ASRock',       domain: 'asrock.com' },
  { name: 'DEEPCOOL',     domain: 'deepcool.com' },
  { name: 'GeIL',         domain: 'geil.com.tw' },
  { name: 'LG',           domain: 'lg.com' },
  { name: 'Intel',        domain: 'intel.com' },
  { name: 'Acer',         domain: 'acer.com' },
  { name: 'PXN',          domain: 'pxn-game.com' },
  { name: 'Seagate',      domain: 'seagate.com' },
  { name: 'HIKVISION',    domain: 'hikvision.com' },
  { name: 'OWC',          domain: 'owc.com' },
  { name: 'Wanbo',        domain: 'wanbotech.com' },
  { name: 'Microsoft',    domain: 'microsoft.com' },
  { name: 'Micron',       domain: 'micron.com' },
  { name: 'Orico',        domain: 'orico.com' },
  { name: 'Romoss',       domain: 'romoss.com' },
  { name: 'Silverstone',  domain: 'silverstonetek.com' },
  { name: 'Minisforum',   domain: 'minisforum.com' },
];

const PER_PAGE = 40;

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

// ── Product card ──────────────────────────────────────────────────────────────
function TechProductCard({ product }: { product: any }) {
  const addItem  = useCartStore((s) => s.addItem);
  const { user } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist(user?.id ?? null);
  const [added, setAdded] = useState(false);

  const price   = product.price_display ?? 0;
  const image   = product.thumbnail_url ?? product.images?.[0] ?? null;
  const brand   = product.brand ?? '';
  const inStock = (product.stock_qty ?? 0) > 0;
  const inWishlist = wishlist.includes(product.id);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({supplier: 'syntech',
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
    // Link uses product UUID — TechProductPage handles it
    <Link
      to={`/shop/tech/product/${product.id}`}
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
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {!inStock && (
            <span className="bg-gray-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">OUT OF STOCK</span>
          )}
          {product.is_clearance && inStock && (
            <span className="bg-lago-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">CLEARANCE</span>
          )}
          {product.is_unboxed && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">UNBOXED</span>
          )}
        </div>
        {/* Warranty */}
        {product.warranty_months && (
          <div className="absolute top-3 right-3 bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-700/40">
            {product.warranty_months}M warranty
          </div>
        )}
        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white dark:bg-lago-800 border border-gray-200 dark:border-lago-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-110"
          aria-label="Add to wishlist"
        >
          <span className={`text-sm ${inWishlist ? 'text-red-500' : 'text-gray-400'}`}>♥</span>
        </button>
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
            {product.price_rrp && product.price_rrp > price && (
              <p className="text-xs text-gray-400 line-through">
                R {product.price_rrp.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            )}
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
    </Link>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function TechShopPage() {
  const [searchParams] = useSearchParams();
  const [products,           setProducts]           = useState<any[]>([]);
  const [loading,            setLoading]            = useState(true);
  const [total,              setTotal]              = useState(0);
  const [page,               setPage]               = useState(1);
  const [search,             setSearch]             = useState('');
  const [sortBy,             setSortBy]             = useState('newest');
  const [inStockOnly,        setInStockOnly]        = useState(false);
  const [selectedBrands,     setSelectedBrands]     = useState<string[]>(() => {
    const b = searchParams.get('brand');
    return b ? b.split(',') : [];
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const c = searchParams.get('category');
    return c ? [c] : [];
  });
  const [categories,         setCategories]         = useState<string[]>([]);
  const [filtersOpen,        setFiltersOpen]        = useState(() => {
    // Auto-open filters if coming from categories page with a filter
    return !!searchParams.get('category') || !!searchParams.get('brand');
  });

  // Load categories
  useEffect(() => {
    supabase
      .from('syntech_products')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null)
      .then(({ data }) => {
        const unique = [...new Set((data ?? []).map((d: any) => d.category).filter(Boolean))].sort();
        setCategories(unique as string[]);
      });
  }, []);

  // Load products
  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from('syntech_products')
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

  const hasFilters  = !!(search || selectedBrands.length || selectedCategories.length || inStockOnly);
  const totalPages  = Math.ceil(total / PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d]">

      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-br from-lago-800 via-lago-900 to-[#0a1628] pb-10 px-4">
        <NavSpacer />
        <div className="max-w-7xl mx-auto">
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-lago-300 hover:text-white text-sm font-medium transition-colors mb-6">
            ← Back to Shop
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white">
              Gaming & Computing
            </h1>
          </div>
          <p className="text-lago-300 text-base mb-8">
            Storage, memory, components, peripherals, gaming gear & power solutions
          </p>

          {/* Brand logo strip — square tiles, single auto-scrolling row */}
          <div className="relative overflow-hidden mt-2">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-lago-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-lago-900 to-transparent z-10 pointer-events-none" />

            {/* Scrolling track */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {SYNTECH_BRANDS.map((b) => (
                <button
                  key={b.name}
                  onClick={() => toggleBrand(b.name)}
                  title={b.name}
                  className={`relative flex-shrink-0 flex flex-col items-center justify-center gap-1.5 w-20 h-20 rounded-xl border-2 transition-all duration-200 ${
                    selectedBrands.includes(b.name)
                      ? 'bg-white border-lago-400 shadow-lg shadow-lago-900/40 scale-105'
                      : 'bg-white/95 border-white/10 hover:border-lago-300 hover:scale-105'
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img
                      src={`https://img.logo.dev/${b.domain}?token=${LOGO_TOKEN}&format=png&size=80`}
                      alt={b.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = 'none';
                        if (el.parentElement) {
                          el.parentElement.innerHTML = `<span style="font-size:11px;font-weight:900;color:#1a365d;text-align:center;line-height:1.2">${b.name.substring(0,4)}</span>`;
                        }
                      }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold leading-tight text-center px-1 truncate w-full ${
                    selectedBrands.includes(b.name) ? 'text-lago-700' : 'text-gray-700'
                  }`}>
                    {b.name}
                  </span>
                  {selectedBrands.includes(b.name) && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-lago-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-[8px] font-black">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
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
                className="pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:border-lago-500 w-52"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-sm font-semibold text-gray-700 dark:text-white hover:border-lago-500 transition-colors shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="w-5 h-5 bg-lago-600 text-white text-[10px] rounded-full flex items-center justify-center">
                  {selectedBrands.length + selectedCategories.length + (inStockOnly ? 1 : 0)}
                </span>
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-sm font-semibold text-gray-700 dark:text-white hover:border-lago-500 transition-colors shadow-sm focus:outline-none cursor-pointer"
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
                  className={`relative w-11 h-6 rounded-full transition-colors ${inStockOnly ? 'bg-lago-600' : 'bg-gray-300 dark:bg-lago-700'}`}
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
                      className="w-4 h-4 rounded text-lago-600 border-gray-300 dark:border-lago-600 bg-white dark:bg-lago-800 focus:ring-lago-500" />
                    <span className="text-sm text-gray-700 dark:text-lago-100 group-hover:text-lago-600 dark:group-hover:text-white transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-lago-400 mb-3">Brand</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {SYNTECH_BRANDS.map((b) => (
                  <label key={b.name} className="flex items-center gap-2.5 cursor-pointer group">
                    <input type="checkbox" checked={selectedBrands.includes(b.name)} onChange={() => toggleBrand(b.name)}
                      className="w-4 h-4 rounded text-lago-600 border-gray-300 dark:border-lago-600 bg-white dark:bg-lago-800 focus:ring-lago-500" />
                    <span className="text-sm text-gray-700 dark:text-lago-100 group-hover:text-lago-600 dark:group-hover:text-white transition-colors">{b.name}</span>
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
              <span key={b} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lago-100 dark:bg-lago-800 text-lago-700 dark:text-lago-200 text-sm font-medium">
                {b} <button onClick={() => toggleBrand(b)}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {selectedCategories.map((c) => (
              <span key={c} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lago-100 dark:bg-lago-800 text-lago-700 dark:text-lago-200 text-sm font-medium">
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
            <Zap className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">No products found</p>
            <button onClick={clearAll} className="mt-4 text-lago-600 text-sm hover:underline">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <TechProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
            {/* First page */}
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-gray-700 dark:text-white text-sm font-semibold disabled:opacity-30 hover:border-lago-500 transition-colors shadow-sm">
              « First
            </button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-gray-700 dark:text-white text-sm font-semibold disabled:opacity-30 hover:border-lago-500 transition-colors shadow-sm">
              ‹ Prev
            </button>

            {/* Smart page numbers — show window of 5 around current page */}
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
                        ? 'bg-lago-600 text-white border border-lago-600'
                        : 'bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-gray-700 dark:text-white hover:border-lago-500'
                    }`}>
                    {p}
                  </button>
                );
              }
              if (end < totalPages) pages.push(<span key="end-ellipsis" className="text-gray-400 px-1">...</span>);
              return pages;
            })()}

            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-gray-700 dark:text-white text-sm font-semibold disabled:opacity-30 hover:border-lago-500 transition-colors shadow-sm">
              Next ›
            </button>
            {/* Last page */}
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-4 py-2 rounded-xl bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-gray-700 dark:text-white text-sm font-semibold disabled:opacity-30 hover:border-lago-500 transition-colors shadow-sm">
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
