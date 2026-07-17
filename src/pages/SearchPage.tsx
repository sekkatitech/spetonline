// @ts-nocheck
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SafeImage } from '../components/SafeImage';
import { useCartStore } from '../lib/cartStore';
import { NavSpacer } from '../components/Layout';
import { useSEO } from '../lib/useSEO';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';

  // Internal search results shouldn't be indexed — thin/duplicate content per Google's own guidance
  useSEO({
    title: q ? `Search results for "${q}"` : 'Search',
    description: q ? `Search results for "${q}" on SPET Online.` : 'Search SPET Online for electronics and tech products.',
    noindex: true,
  });

  const [esquireResults, setEsquireResults] = useState<any[]>([]);
  const [syntechResults, setSyntechResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!q.trim()) return;
    setLoading(true);

    Promise.all([
      // Search Esquire products
      supabase
        .from('products')
        .select('id, ProductName, ProductCode, Brand, Price, image, slug, AvailableQty')
        .eq('is_active', true)
        .ilike('ProductName', `%${q}%`)
        .order('ProductName', { ascending: true })
        .limit(20),

      // Search Syntech products
      supabase
        .from('syntech_products')
        .select('id, name, sku, brand, price_display, thumbnail_url, stock_qty')
        .eq('is_active', true)
        .ilike('name', `%${q}%`)
        .order('name', { ascending: true })
        .limit(20),
    ]).then(([esquire, syntech]) => {
      setEsquireResults(esquire.data ?? []);
      setSyntechResults(syntech.data ?? []);
      setLoading(false);
    });
  }, [q]);

  const total = esquireResults.length + syntechResults.length;

  function handleAddEsquire(e: any, product: any) {
    e.preventDefault();
    addItem({
      id: product.id,
      product_id: product.id,
      name: product.ProductName,
      brand: product.Brand ?? '',
      price: product.Price,
      image: product.image ?? '',
      sku: product.ProductCode,
      supplier: 'esquire',
    });
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => setAddedIds((prev) => prev.filter((id) => id !== product.id)), 1800);
  }

  function handleAddSyntech(e: any, product: any) {
    e.preventDefault();
    addItem({
      id: product.id,
      product_id: product.id,
      name: product.name,
      brand: product.brand ?? '',
      price: product.price_display,
      image: product.thumbnail_url ?? '',
      sku: product.sku,
      supplier: 'syntech',
    });
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(() => setAddedIds((prev) => prev.filter((id) => id !== product.id)), 1800);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d]">
      <NavSpacer />
      <div className="container mx-auto px-4 md:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-1">
            {q ? `Results for "${q}"` : 'Search Products'}
          </h1>
          <p className="text-gray-500 dark:text-lago-400 text-sm">
            {loading ? 'Searching...' : q ? `${total} product${total !== 1 ? 's' : ''} found across all suppliers` : 'Enter a search term above'}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-lago-900 rounded-2xl border border-gray-200 dark:border-lago-800 aspect-square animate-pulse" />
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && q && total === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-lago-800 flex items-center justify-center mx-auto mb-6">
              <Search className="w-9 h-9 text-gray-400 dark:text-lago-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-lago-400 mb-6">Try a different search term.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/shop/home" className="px-6 py-2.5 rounded-full bg-lago-600 text-white font-semibold hover:bg-lago-700 transition-colors">
                Browse Home & Entertainment
              </Link>
              <Link to="/shop/tech" className="px-6 py-2.5 rounded-full border border-lago-600 text-lago-600 font-semibold hover:bg-lago-50 transition-colors">
                Browse Gaming & Computing
              </Link>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && total > 0 && (
          <div className="space-y-10">

            {/* Esquire results */}
            {esquireResults.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Home & Entertainment
                    <span className="text-sm font-normal text-gray-500 dark:text-lago-400">({esquireResults.length} results)</span>
                  </h2>
                  <Link to={`/shop/home?search=${encodeURIComponent(q)}`} className="text-sm font-semibold text-lago-600 dark:text-lago-400 hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {esquireResults.map((p) => (
                    <Link key={p.id} to={`/product/${p.slug || p.id}`}
                      className="group bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl overflow-hidden hover:border-lago-400 hover:shadow-lg transition-all flex flex-col">
                      <div className="aspect-square bg-gray-50 dark:bg-lago-800 p-3">
                        <SafeImage src={p.image} brand={p.Brand} alt={p.ProductName}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="p-3 flex flex-col flex-1">
                        {p.Brand && <p className="text-[10px] font-bold text-lago-500 uppercase tracking-wide mb-1">{p.Brand}</p>}
                        <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 flex-1">{p.ProductName}</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                          R {(p.Price ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </p>
                        <button
                          onClick={(e) => handleAddEsquire(e, p)}
                          disabled={p.AvailableQty === 0}
                          className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                            addedIds.includes(p.id) ? 'bg-green-500 text-white' :
                            p.AvailableQty > 0 ? 'bg-lago-600 hover:bg-lago-700 text-white' :
                            'bg-gray-200 dark:bg-lago-800 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingCart className="w-3 h-3" />
                          {addedIds.includes(p.id) ? 'Added!' : p.AvailableQty > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Syntech results */}
            {syntechResults.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Gaming & Computing
                    <span className="text-sm font-normal text-gray-500 dark:text-lago-400">({syntechResults.length} results)</span>
                  </h2>
                  <Link to={`/shop/tech?search=${encodeURIComponent(q)}`} className="text-sm font-semibold text-lago-600 dark:text-lago-400 hover:underline">
                    View all →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {syntechResults.map((p) => (
                    <Link key={p.id} to={`/shop/tech/product/${p.id}`}
                      className="group bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl overflow-hidden hover:border-lago-400 hover:shadow-lg transition-all flex flex-col">
                      <div className="aspect-square bg-gray-50 dark:bg-lago-800 p-3">
                        <SafeImage src={p.thumbnail_url} brand={p.brand} alt={p.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer" />
                      </div>
                      <div className="p-3 flex flex-col flex-1">
                        {p.brand && <p className="text-[10px] font-bold text-lago-500 uppercase tracking-wide mb-1">{p.brand}</p>}
                        <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 flex-1">{p.name}</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                          R {(p.price_display ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </p>
                        <button
                          onClick={(e) => handleAddSyntech(e, p)}
                          disabled={p.stock_qty === 0}
                          className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                            addedIds.includes(p.id) ? 'bg-green-500 text-white' :
                            p.stock_qty > 0 ? 'bg-lago-600 hover:bg-lago-700 text-white' :
                            'bg-gray-200 dark:bg-lago-800 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingCart className="w-3 h-3" />
                          {addedIds.includes(p.id) ? 'Added!' : p.stock_qty > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}