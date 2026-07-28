import { Hero, BrandShowcase, BrandCollageBanner, PromoBanner, TrustSection, AccountBenefits, Newsletter } from '../components/HomeSections';
import { FeaturedCategories, FeaturedProducts } from '../components/ProductSections';
import { useSEO } from '../lib/useSEO';

export function HomePage() {
  useSEO({
    title: 'SPET Online | Premium Electronics Store in South Africa',
    description: 'Shop premium electronics at the best prices — smartphones, laptops, TVs, audio and more. Fast delivery across South Africa.',
    bare: true,
  });

  return (
    <>
      <Hero />
      <BrandShowcase />
      <BrandCollageBanner />
      <FeaturedCategories />
      <FeaturedProducts />
      <PromoBanner />
      <TrustSection />
      <AccountBenefits />
      <Newsletter />
    </>
  );
}
