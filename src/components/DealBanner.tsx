import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { DealBanner as DealBannerType } from '../lib/api';

/** Admin-uploaded promotional banner. */
export function BannerCard({ banner }: { banner: DealBannerType }) {
  const isLarge = banner.size === 'large';

  return (
    <div className={isLarge ? 'md:col-span-3' : ''}>
      <Link
        to={banner.link_url}
        className={`group relative block overflow-hidden rounded-2xl border border-spet-line ${isLarge ? 'h-[360px]' : 'h-[260px]'}`}
      >
        <img
          src={banner.image_url}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

        {banner.badge_label && (
          <div className="absolute left-4 top-4 rounded-lg bg-spet-orange px-3 py-1 text-[12px] font-semibold text-white">
            {banner.badge_label}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-6">
          <div className="min-w-0">
            <p className={`font-display font-semibold leading-tight text-white ${isLarge ? 'text-[24px] md:text-[36px]' : 'text-[18px]'}`}>
              {banner.title}
            </p>
            {banner.subtitle && (
              <p className={`mt-1 text-white/85 ${isLarge ? 'max-w-md text-[15px]' : 'line-clamp-1 text-[13px]'}`}>{banner.subtitle}</p>
            )}
          </div>
          <ArrowRight className="mb-1 h-5 w-5 shrink-0 text-white" aria-hidden="true" />
        </div>
      </Link>
    </div>
  );
}
