// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ChevronLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SafeImage } from '../components/SafeImage';
import { useCartStore } from '../lib/cartStore';
import { useAuth } from '../lib/AuthContext';
import { useWishlist } from '../lib/api';
import { NavSpacer } from '../components/Layout';
import { useSEO } from '../lib/useSEO';

export function PinnacleProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qty,     setQty]     = useState(1);
  const [added,     setAdded]     = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeTab,   setActiveTab]   = useState<'description' | 'specs'>('description');

  const addItem  = useCartStore((s) => s.addItem);
  const { user } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist(user?.id ?? null);
  const navigate = useNavigate();

  // Plain navigate(-1) is a dead end if the user landed here directly (shared
  // link, new tab, refresh) with no prior in-app history — fall back to the
  // category page in that case, same guard used on ProductPage/ShopPage.
  function goBack() {
    if (window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate('/shop/pinnacle');
  }

  useEffect(() => {
    if (!id) return;
    supabase
      .from('pinnacle_products')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setProduct(data);
        setActiveImage(data?.thumbnail_url ?? data?.images?.[0] ?? null);
        setLoading(false);
      });
  }, [id]);

  const seoPlainDescription = product
    ? `${product.name} — shop at SPET Online.`
    : 'Shop the Pinnacle range at SPET Online.';

  useSEO({
    title: product ? `${product.name}${product.brand ? ` | ${product.brand}` : ''}` : 'Product',
    description: seoPlainDescription,
    image: product?.thumbnail_url ?? product?.images?.[0],
    jsonLd: product ? {
      '@type': 'Product',
      name: product.name,
      image: product.thumbnail_url ? [product.thumbnail_url] : (product.images ?? undefined),
      description: seoPlainDescription,
      sku: product.sku,
      brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'ZAR',
        price: product.price_display,
        availability: (product.stock_qty ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `https://spetonline.co.za/shop/pinnacle/product/${product.id}`,
      },
    } : undefined,
  });

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d]">
      <NavSpacer />
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d]">
      <NavSpacer />
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Product not found.</p>
        <Link to="/shop/pinnacle" className="mt-4 inline-block text-teal-600 hover:underline">← Back to Pinnacle</Link>
      </div>
    </div>
  );

  const price    = product.price_display ?? 0;
  const inStock  = (product.stock_qty ?? 0) > 0;
  const images   = [product.thumbnail_url, ...(product.images ?? [])].filter(Boolean) as string[];
  const inWishlist = wishlist.includes(product.id);
  const specs    = product.specifications ?? {};

  function handleAddToCart() {
    addItem({
      id:         product.id,
      product_id: product.id,
      name:       product.name,
      brand:      product.brand ?? '',
      price,
      image:      activeImage || '',
      sku:        product.sku,
      supplier:   'pinnacle',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d]">
      <NavSpacer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <button
            onClick={() => goBack()}
            className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-1 font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <span>›</span>
          <Link to="/shop/pinnacle" className="hover:text-teal-600 transition-colors">Pinnacle</Link>
          {product.category && <>
            <span>›</span>
            <span className="text-gray-500">{product.category}</span>
          </>}
          <span>›</span>
          <span className="text-gray-700 dark:text-white line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* ── Image gallery ── */}
          <div className="relative">
            <div className="bg-white dark:bg-lago-900 rounded-2xl border border-gray-200 dark:border-lago-800 aspect-square overflow-hidden mb-4 p-6">
              <SafeImage
                src={activeImage}
                brand={product.brand ?? ''}
                alt={product.name}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.slice(0, 6).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden bg-white dark:bg-lago-900 transition-all ${
                      activeImage === img
                        ? 'border-teal-600 shadow-md'
                        : 'border-gray-200 dark:border-lago-700 hover:border-teal-400'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product details ── */}
          <div>
            {product.brand && (
              <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-2">
                {product.brand}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 dark:text-white leading-tight mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-black text-gray-900 dark:text-white">
                R {price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-6">incl. VAT</p>

            {/* Stock status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 ${
              inStock
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
              {inStock ? `In Stock (${product.stock_qty} available)` : 'Out of Stock'}
            </div>

            {/* Short description */}
            {product.short_description && (
              <p className="text-gray-600 dark:text-lago-300 text-sm leading-relaxed mb-6">
                {product.short_description}
              </p>
            )}

            {/* Quantity + Add to cart */}
            {inStock && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-300 dark:border-lago-700 rounded-xl overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-11 flex items-center justify-center text-gray-600 dark:text-lago-300 hover:bg-gray-100 dark:hover:bg-lago-800 transition-colors font-bold text-lg">
                    −
                  </button>
                  <span className="w-12 h-11 flex items-center justify-center text-gray-900 dark:text-white font-bold border-x border-gray-300 dark:border-lago-700">
                    {qty}
                  </span>
                  <button onClick={() => setQty((q) => Math.min(product.stock_qty, q + 1))}
                    className="w-10 h-11 flex items-center justify-center text-gray-600 dark:text-lago-300 hover:bg-gray-100 dark:hover:bg-lago-800 transition-colors font-bold text-lg">
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  added
                    ? 'bg-green-500 text-white'
                    : inStock
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-gray-200 dark:bg-lago-800 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {added ? 'Added to Cart!' : inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-colors ${
                  inWishlist
                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500'
                    : 'border-gray-300 dark:border-lago-700 text-gray-400 hover:border-red-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500' : ''}`} />
              </button>
            </div>

            {/* Trust icons */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Truck,        label: 'Free delivery over R2,500' },
                { icon: ShieldCheck,  label: 'Official warranty' },
                { icon: RefreshCw,    label: '7-day returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-xl text-center">
                  <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span className="text-[10px] text-gray-500 dark:text-lago-400 font-medium leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Specs + Description tabs ── */}
        <div className="mt-12 bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-2 border-b border-gray-200 dark:border-lago-800">
            <button
              onClick={() => setActiveTab('description')}
              className={`py-4 text-sm font-bold transition-colors ${
                activeTab === 'description'
                  ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                  : 'text-gray-500 dark:text-lago-500 hover:text-gray-700 dark:hover:text-lago-300'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-4 text-sm font-bold transition-colors ${
                activeTab === 'specs'
                  ? 'text-teal-600 dark:text-teal-400 border-b-2 border-teal-600 dark:border-teal-400'
                  : 'text-gray-500 dark:text-lago-500 hover:text-gray-700 dark:hover:text-lago-300'
              }`}
            >
              Specifications
            </button>
          </div>
          <div className="p-6">
            {activeTab === 'description' ? (
              product.full_description ? (
                <p className="text-gray-600 dark:text-lago-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {product.full_description}
                </p>
              ) : product.short_description ? (
                <p className="text-gray-600 dark:text-lago-300 text-sm leading-relaxed">
                  {product.short_description}
                </p>
              ) : (
                <p className="text-gray-400 dark:text-lago-500 text-sm">No description available for this product.</p>
              )
            ) : (
              Object.keys(specs).length > 0 ? (
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(specs).filter(([, v]) => v).map(([k, v], i) => (
                      <tr key={k} className={i % 2 === 0 ? 'bg-gray-50 dark:bg-lago-800/30' : ''}>
                        <td className="py-2.5 px-4 font-semibold text-gray-600 dark:text-lago-300 capitalize w-1/3">
                          {k}
                        </td>
                        <td className="py-2.5 px-4 text-gray-900 dark:text-white">{String(v)}</td>
                      </tr>
                    ))}
                    <tr className={Object.keys(specs).length % 2 === 0 ? 'bg-gray-50 dark:bg-lago-800/30' : ''}>
                      <td className="py-2.5 px-4 font-semibold text-gray-600 dark:text-lago-300 w-1/3">Stock</td>
                      <td className="py-2.5 px-4 text-gray-900 dark:text-white">{product.stock_qty} units available</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-gray-600 dark:text-lago-300 w-1/3">SKU</td>
                      <td className="py-2.5 px-4 text-gray-900 dark:text-white font-mono text-xs">{product.sku}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400 dark:text-lago-500 text-sm">No specifications available for this product.</p>
              )
            )}
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => goBack()}
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to previous page
          </button>
        </div>

      </div>
    </div>
  );
}
