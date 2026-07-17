import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, ImagePlus } from 'lucide-react';
import type { DealBanner as DealBannerType } from '../lib/api';

// ─── Real banner, admin-uploaded ────────────────────────────────────────────

export function BannerCard({ banner }: { banner: DealBannerType }) {
  const isLarge = banner.size === 'large';

  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
      viewport={{ once: true }}
      className={isLarge ? 'md:col-span-3' : ''}
    >
      <Link
        to={banner.link_url}
        className="group relative rounded-2xl overflow-hidden block border border-gray-200 dark:border-lago-800"
        style={{ height: isLarge ? '360px' : '260px' }}
      >
        <img
          src={banner.image_url}
          alt={banner.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {banner.badge_label && (
          <div className="absolute top-4 left-4 bg-accent-orange text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm">
            {banner.badge_label}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-white font-display font-black leading-tight ${isLarge ? 'text-2xl md:text-4xl' : 'text-lg'}`}>
              {banner.title}
            </p>
            {banner.subtitle && (
              <p className={`text-lago-100 mt-1 ${isLarge ? 'text-base max-w-md' : 'text-xs line-clamp-1'}`}>
                {banner.subtitle}
              </p>
            )}
          </div>
          <ArrowRight className="w-5 h-5 text-white flex-shrink-0 mb-1" />
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Empty-state placeholder — doubles as a Canva sizing guide ─────────────

export function PlaceholderBannerCard({
  size,
  dimensions,
}: {
  size: 'large' | 'standard';
  dimensions: string;
}) {
  const isLarge = size === 'large';

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 dark:border-lago-700 bg-gray-50 dark:bg-lago-900/50 text-center px-4 ${isLarge ? 'md:col-span-3' : ''}`}
      style={{ height: isLarge ? '360px' : '260px' }}
    >
      <ImagePlus className="w-7 h-7 text-gray-300 dark:text-lago-700" />
      <p className="text-sm font-semibold text-gray-400 dark:text-lago-600">
        {isLarge ? 'Large Banner' : 'Standard Banner'}
      </p>
      <p className="text-xs text-gray-400 dark:text-lago-600">{dimensions} recommended</p>
      <p className="text-[11px] text-gray-400 dark:text-lago-600 max-w-[220px]">
        Add via Admin Dashboard → Deals &amp; Banners
      </p>
    </div>
  );
}
