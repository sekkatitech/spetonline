import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useProducts, type Product } from '../lib/api';
import type { ProductSupplier } from '../lib/productDisplay';
import { supabase } from '../lib/supabase';
import { SUPPLIERS, type SupplierConfig } from '../lib/supplierCatalog';
import { useSEO } from '../lib/useSEO';
import { WishlistProvider } from '../components/WishlistProvider';
import { ProductTile, ProductTileSkeleton } from '../components/product/ProductTile';
import { PageShell, SectionHeader, panelStyles } from '../components/ui';

const BANNERS = [
  { src: '/images/acer-banner.jpg', alt: 'Acer Nitro gaming laptops' },
  { src: '/images/intel-banner.jpg', alt: 'Intel gaming' },
  { src: '/images/ipad-banner.jpg', alt: 'Apple iPad' },
  { src: '/images/ipadpro-banner.jpg', alt: 'Apple iPad Pro' },
  { src: '/images/scooter-banner.jpg', alt: 'Xiaomi Electric Scooter 6 Ultra' },
];

const ROTATE_MS = 4000;

function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const next = useCallback(() => setCurrent((index) => (index + 1) % BANNERS.length), []);
  const previous = () => setCurrent((index) => (index - 1 + BANNERS.length) % BANNERS.length);

  const paused = hovered || focused || userPaused;

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(next, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [next, paused]);

  const control =
    'absolute z-20 flex h-11 w-11 items-center justify-center rounded-lg bg-black/45 text-white transition-colors hover:bg-black/65';

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured brands"
      className="relative mb-8 aspect-[25/10] w-full overflow-hidden rounded-2xl bg-spet-navy sm:aspect-[25/7]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {BANNERS.map((banner, index) => (
        <img
          key={banner.src}
          src={banner.src}
          alt={index === current ? banner.alt : ''}
          aria-hidden={index !== current}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 motion-reduce:transition-none ${
            index === current ? 'z-10 opacity-100' : 'z-0 opacity-0'
          }`}
        />
      ))}

      <button type="button" onClick={previous} aria-label="Previous banner" className={`${control} left-2 top-1/2 -translate-y-1/2`}>
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      <button type="button" onClick={next} aria-label="Next banner" className={`${control} right-2 top-1/2 -translate-y-1/2`}>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => setUserPaused((value) => !value)}
        aria-label={userPaused ? 'Play banner rotation' : 'Pause banner rotation'}
        className={`${control} bottom-0 right-2`}
      >
        {userPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
      </button>

      <div className="absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2">
        {BANNERS.map((banner, index) => (
          <button
            key={banner.src}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={`Show banner ${index + 1} of ${BANNERS.length}`}
            aria-current={index === current ? 'true' : undefined}
            className="flex h-11 w-7 items-center justify-center sm:w-11"
          >
            <span className={`h-2 rounded-full transition-all ${index === current ? 'w-5 bg-white' : 'w-2 bg-white/60'}`} />
          </button>
        ))}
      </div>
    </section>
  );
}

function useSupplierFeatured(table: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from(table)
      .select('*')
      .eq('is_active', true)
      .gt('stock_qty', 0)
      .order('last_synced_at', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setProducts((data ?? []) as Product[]);
        setLoading(false);
      });
  }, [table]);

  return { products, loading };
}

const SHOP_SECTIONS = [
  {
    to: '/shop/home',
    label: 'Home & entertainment',
    description: 'TVs, audio, laptops, phones and smart home.',
    image: '/images/home-entertainment.jpg',
  },
  {
    to: SUPPLIERS.syntech.route,
    label: SUPPLIERS.syntech.label,
    description: SUPPLIERS.syntech.description,
    image: '/images/gaming-computing.jpg',
  },
  { to: SUPPLIERS.axiz.route, label: SUPPLIERS.axiz.label, description: SUPPLIERS.axiz.description },
  { to: SUPPLIERS.pinnacle.route, label: SUPPLIERS.pinnacle.label, description: SUPPLIERS.pinnacle.description },
];

function FeaturedShelf({
  title,
  to,
  supplier,
  products,
  loading,
}: {
  title: string;
  to: string;
  supplier: ProductSupplier;
  products: Product[];
  loading: boolean;
}) {
  if (!loading && products.length === 0) return null;

  return (
    <section aria-label={title} className="mt-10">
      <SectionHeader
        title={title}
        action={
          <Link to={to} className="flex min-h-11 shrink-0 items-center gap-1 text-[13px] font-semibold text-spet-link hover:underline">
            View all <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <ProductTileSkeleton key={index} />)
          : products.slice(0, 8).map((product) => <ProductTile key={product.id} product={product} supplier={supplier} />)}
      </div>
    </section>
  );
}

function SupplierShelf({ config }: { config: SupplierConfig }) {
  const { products, loading } = useSupplierFeatured(config.table);
  return <FeaturedShelf title={config.label} to={config.route} supplier={config.key} products={products} loading={loading} />;
}

export function ShopLandingPage() {
  useSEO({
    title: 'Shop All Electronics',
    description:
      'Browse the full SPET Online catalogue — laptops, smartphones, TVs, gaming gear and more, all at competitive prices with fast delivery across South Africa.',
  });

  const { products, loading } = useProducts({ sortBy: 'featured', perPage: 8, inStockOnly: true });

  return (
    <WishlistProvider>
      <PageShell>
        <div className="pt-4">
          <BannerCarousel />

          <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-spet-ink md:text-[36px]">Shop</h1>
          <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-spet-ink-2">
            Choose a section or browse the products below. A valid TV licence is required to buy a TV in South Africa.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SHOP_SECTIONS.map((section) => (
              <Link
                key={section.to}
                to={section.to}
                className={`${panelStyles} group flex flex-col overflow-hidden transition-colors hover:border-spet-blue`}
              >
                {section.image && (
                  <img src={section.image} alt="" loading="lazy" decoding="async" className="aspect-[16/7] w-full object-cover" />
                )}
                <span className="flex flex-1 flex-col p-4">
                  <span className="font-display text-[18px] font-semibold text-spet-ink group-hover:text-spet-blue">{section.label}</span>
                  <span className="mt-1 text-[13px] leading-relaxed text-spet-ink-2">{section.description}</span>
                  <span className="mt-auto flex items-center gap-1 pt-3 text-[13px] font-semibold text-spet-link">
                    Shop now <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <FeaturedShelf title="Home & entertainment" to="/shop/home" supplier="esquire" products={products} loading={loading} />
          <SupplierShelf config={SUPPLIERS.syntech} />
          <SupplierShelf config={SUPPLIERS.axiz} />
          <SupplierShelf config={SUPPLIERS.pinnacle} />
        </div>
      </PageShell>
    </WishlistProvider>
  );
}
