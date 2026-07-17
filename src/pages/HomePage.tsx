import { Hero, BrandShowcase, PromoBanner, TrustSection, AccountBenefits, Newsletter } from '../components/HomeSections';
import { FeaturedCategories, FeaturedProducts, BestSellers } from '../components/ProductSections';
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
      <FeaturedCategories />
      <FeaturedProducts />
      <PromoBanner />
      <BestSellers />
      <TrustSection />
      <AccountBenefits />
      <Newsletter />
    </>
  );
}
