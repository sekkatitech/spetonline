import { Hero, BrandShowcase, PromoBanner, TrustSection, AccountBenefits, Newsletter } from '../components/HomeSections';
import { FeaturedCategories, FeaturedProducts, BestSellers } from '../components/ProductSections';

export function HomePage() {
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
