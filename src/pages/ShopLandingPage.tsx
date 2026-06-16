// @ts-nocheck
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../lib/api';
import { ProductCard, ProductSkeleton } from '../components/ProductSections';
import { supabase } from '../lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import { SafeImage } from '../components/SafeImage';
import { NavSpacer } from '../components/Layout';

// ── Rotating banner carousel ─────────────────────────────────────────────────
const BANNERS = [
  { src: '/images/network-banner.jpg',  alt: 'Network & Accessories' },
  { src: '/images/expreso-banner.jpg',  alt: 'Home Appliances' },
  { src: '/images/xiaomi-banner.jpg',   alt: 'Xiaomi Products' },
  { src: '/images/gaming-banner.jpg',   alt: 'Computing Power' },
];
function BannerCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % BANNERS.length), []);
  const prev = () => setCurrent((c) => (c - 1 + BANNERS.length) % BANNERS.length);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full overflow-hidden bg-gray-900" style={{ height: '210px' }}>
      {BANNERS.map((banner, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img src={banner.src} alt={banner.alt} className="w-full h-full object-cover object-center" />
        </div>
      ))}
      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors" aria-label="Previous banner">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors" aria-label="Next banner">
        <ChevronRight className="w-4 h-4" />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
            aria-label={`Go to banner ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}

// ── Syntech featured products ────────────────────────────────────────────────
function useSyntechFeatured() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('syntech_products')
      .select('*')
      .eq('is_active', true)
      .gt('stock_qty', 0)
      .order('last_synced_at', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setProducts(data ?? []);
        setLoading(false);
      });
  }, []);

  return { products, loading };
}

// ── Syntech product card ─────────────────────────────────────────────────────
function SyntechCard({ product }: { product: any }) {
  const price   = product.price_display ?? 0;
  const image   = product.thumbnail_url ?? (product.images?.[0] ?? null);
  const brand   = product.brand ?? '';
  const inStock = (product.stock_qty ?? 0) > 0;

  return (
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
        {!inStock && (
          <span className="absolute top-3 left-3 bg-gray-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">OUT OF STOCK</span>
        )}
        {product.is_clearance && inStock && (
          <span className="absolute top-3 left-3 bg-lago-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">CLEARANCE</span>
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
            {product.price_rrp && product.price_rrp > price && (
              <p className="text-xs text-gray-400 line-through">
                R {product.price_rrp.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">incl. VAT</p>
        </div>
      </div>
    </Link>
  );
}

// ── Main shop landing page ────────────────────────────────────────────────────
export function ShopLandingPage() {
  const { products: esquireProducts, loading: esquireLoading } = useProducts({
    sortBy: 'featured',
    perPage: 8,
    inStockOnly: true,
  });

  const { products: syntechProducts, loading: syntechLoading } = useSyntechFeatured();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d]">
      <NavSpacer />

      {/* ── Rotating banner carousel ── */}
      <BannerCarousel />

      {/* ── Page heading ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl md:text-5xl font-display font-black text-gray-900 dark:text-white mb-2">
          Shop SPET Online
        </h1>
        <p className="text-gray-500 dark:text-lago-400 text-lg">
          Choose your section or browse featured products below. A Valid TV License is required for purchasing a TV in the Republic of South Africa.
        </p>
      </div>

      {/* ── Two section banners ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Home & Entertainment */}
          <Link
            to="/shop/home"
            className="group relative overflow-hidden rounded-3xl min-h-[320px] flex flex-col justify-end p-8 hover:shadow-2xl transition-all duration-500"
            style={{
              backgroundImage: 'url(/images/home-entertainment.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Subtle dark overlay at bottom only for button visibility */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 bg-white text-lago-700 font-bold text-sm px-5 py-2.5 rounded-full group-hover:bg-lago-100 transition-colors w-fit">
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Gaming & Computing */}
          <Link
            to="/shop/tech"
            className="group relative overflow-hidden rounded-3xl min-h-[320px] flex flex-col justify-end p-8 hover:shadow-2xl hover:shadow-cyan-900/30 transition-all duration-500"
            style={{
              backgroundImage: 'url(/images/gaming-computing.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Subtle dark overlay at bottom only for button visibility */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 bg-cyan-500 text-white font-bold text-sm px-5 py-2.5 rounded-full group-hover:bg-cyan-400 transition-colors w-fit">
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

        </div>
      </div>

      {/* ── Featured — Home & Entertainment ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              Featured — Home & Entertainment
            </h2>
            <p className="text-sm text-gray-500 dark:text-lago-400 mt-0.5">
              Top picks from our home and entertainment range
            </p>
          </div>
          <Link to="/shop/home" className="flex items-center gap-1.5 text-sm font-semibold text-lago-600 dark:text-lago-400 hover:text-lago-700 dark:hover:text-lago-300 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {esquireLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : esquireProducts.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </div>

      {/* ── Featured — Gaming & Computing ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              Featured — Gaming & Computing
            </h2>
            <p className="text-sm text-gray-500 dark:text-lago-400 mt-0.5">
              Top picks from our gaming and computing range
            </p>
          </div>
          <Link to="/shop/tech" className="flex items-center gap-1.5 text-sm font-semibold text-lago-600 dark:text-lago-400 hover:text-lago-700 dark:hover:text-lago-300 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {syntechLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : syntechProducts.map((p) => <SyntechCard key={p.id} product={p} />)
          }
        </div>
      </div>

    </div>
  );
}