import { motion } from 'motion/react';
import { Tag, Clock, Percent, Zap, ArrowRight, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActivePromotions, useDealBanners } from '../lib/api';
import { useProducts } from '../lib/api';
import { ProductCard } from '../components/ProductSections';
import { BannerCard, PlaceholderBannerCard } from '../components/DealBanner';
import { useSEO } from '../lib/useSEO';

function timeRemaining(endsAt: string | null): string {
  if (!endsAt) return 'Ongoing';
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h left`;
  return `${h}h left`;
}

export function DealsPage() {
  useSEO({
    title: 'Deals & Promotions',
    description: 'Exclusive discounts, limited-time offers and the best tech prices in South Africa — active promo codes and current specials from SPET Online.',
  });

  const { promotions, loading: promoLoading } = useActivePromotions();
  const { banners, loading: bannersLoading } = useDealBanners();
  const { products: customerFavorites, loading: productsLoading } = useProducts({ skus: ['HTPNEOH86', '65P8K', 'NT23SMNFTV', 'U-RUGKING-PAD2-PRO-8-128'], perPage: 4 });

  const fallbackPromos = [
    { id: 'p1', name: 'Winter Tech Sale', type: 'percentage', value: 15, code: 'WINTER15', starts_at: null, ends_at: new Date(Date.now() + 7 * 86400000).toISOString(), min_order_value: 2000 },
    { id: 'p2', name: 'Free Delivery Special', type: 'fixed', value: 150, code: 'FREEDEL', starts_at: null, ends_at: new Date(Date.now() + 3 * 86400000).toISOString(), min_order_value: 1000 },
    { id: 'p3', name: 'Student Discount', type: 'percentage', value: 10, code: 'STUDENT10', starts_at: null, ends_at: null, min_order_value: 0 },
  ];

  const displayPromos = promoLoading ? [] : (promotions.length > 0 ? promotions : fallbackPromos);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-32 md:pt-36 transition-colors duration-300">

      {/* Hero banner */}
      <section className="relative overflow-hidden mb-12">
        <div className="absolute inset-0">
          <img src="/images/xiaomi-bike-banner.jpg" alt="Deals" className="w-full h-full object-cover opacity-60 dark:opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a141d] via-[#0a141d]/80 to-[#0a141d]/60" />
        </div>
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-20 relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex w-3 h-3 rounded-full bg-accent-orange animate-pulse" />
            <span className="text-accent-orange font-bold text-sm uppercase tracking-widest">Active Now</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-white mb-4 leading-tight">
            Deals & <span className="text-lago-400">Promotions</span>
          </h1>
          <p className="text-lago-100 text-lg max-w-xl">
            Exclusive discounts, limited-time offers, and the best tech prices in South Africa.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 pb-20 space-y-12">

        {/* Active promo codes — full-width strip */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Tag className="w-5 h-5 text-accent-orange" />
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Active Promo Codes</h2>
          </div>
          {promoLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-36 rounded-2xl bg-gray-200 dark:bg-lago-800 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayPromos.map((promo: any) => (
                <motion.div
                  key={promo.id}
                  whileHover={{ y: -2 }}
                  className="relative bg-gradient-to-br from-lago-900 to-[#0a141d] border border-lago-700 rounded-2xl p-5 overflow-hidden"
                >
                  {/* Decorative circle */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-lago-600/20" />
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-accent-orange/10" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-lago-600/30 flex items-center justify-center">
                        {promo.type === 'percentage' ? <Percent className="w-5 h-5 text-lago-400" /> : <Zap className="w-5 h-5 text-accent-orange" />}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-lago-400 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" /> {timeRemaining(promo.ends_at)}
                        </p>
                      </div>
                    </div>

                    <h3 className="font-bold text-white mb-1">{promo.name}</h3>
                    <p className="text-sm text-lago-300 mb-3">
                      {promo.type === 'percentage' ? `${promo.value}% off` : `R${promo.value} off`}
                      {promo.min_order_value ? ` on orders over R${promo.min_order_value}` : ''}
                    </p>

                    {promo.code && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-xl py-2 px-3 font-mono text-sm font-bold text-white tracking-widest text-center border border-white/20">
                          {promo.code}
                        </div>
                        <Link to="/cart" className="px-3 py-2 rounded-xl bg-lago-600 text-white text-xs font-bold hover:bg-lago-500 transition-colors">
                          Use
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Promo banners — admin-managed via /admin */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-accent-orange" />
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Specials &amp; Upcoming</h2>
          </div>
          {bannersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-2xl bg-gray-200 dark:bg-lago-800 animate-pulse" />)}
            </div>
          ) : banners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {banners.map((banner) => <BannerCard key={banner.id} banner={banner} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PlaceholderBannerCard size="large" dimensions="1200×400px" />
              <PlaceholderBannerCard size="standard" dimensions="400×280px" />
              <PlaceholderBannerCard size="standard" dimensions="400×280px" />
            </div>
          )}
        </div>

        {/* Customer Favorites */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent-orange" />
              <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Customer Favorites</h2>
            </div>
            <Link to="/shop" className="text-sm font-semibold text-lago-600 dark:text-lago-400 hover:text-lago-800 dark:hover:text-white transition-colors flex items-center gap-1">
              Shop All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
            {productsLoading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="w-[240px] shrink-0 h-64 rounded-2xl bg-gray-200 dark:bg-lago-800 animate-pulse snap-start" />)
              : (customerFavorites.length > 0 ? customerFavorites : []).map((p) => (
                  <div key={p.id} className="w-[240px] md:w-[260px] shrink-0 snap-start">
                    <ProductCard product={p} />
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
