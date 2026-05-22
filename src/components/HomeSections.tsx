import { motion } from 'motion/react';
import { Truck, ShieldCheck, Zap, RefreshCw, HeadphonesIcon, ArrowRight, Mail } from 'lucide-react';
import { useState } from 'react';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden">
      {/* Store background photo */}
      <div className="absolute inset-0">
        <img
          src="/images/store-hero.png"
          alt="SPET Online Store"
          className="w-full h-full object-cover object-center"
        />
        {/* Dark overlay — stronger at left for text readability, lighter at right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a141d]/90 via-[#0a141d]/70 to-[#0a141d]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a141d]/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-36 pb-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wide uppercase">New Arrivals 2026</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[1.05] mb-6 text-white">
              Experience the <span className="text-lago-400">Future</span> of Electronics
            </h1>

            <p className="text-lg md:text-xl text-lago-100 mb-10 max-w-lg leading-relaxed">
              Shop the latest TVs, laptops, gaming gear and accessories from the world's top premium brands — delivered across South Africa.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <a href="/shop" className="px-8 py-4 rounded-full bg-lago-600 hover:bg-lago-700 text-white font-bold transition-colors shadow-lg shadow-lago-900/40">
                Shop Now
              </a>
              <a href="/deals" className="px-8 py-4 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold transition-all backdrop-blur-sm">
                Explore Deals
              </a>
            </div>

            <div className="flex items-center gap-8 text-sm font-medium text-lago-200">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-lago-400" />
                <span>Nationwide Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-lago-400" />
                <span>Official Warranties</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Brand-to-domain mapping for logo.dev API
const BRAND_DATA = [
  { name: 'Samsung', domain: 'samsung.com' },
  { name: 'HP', domain: 'hp.com' },
  { name: 'Dell', domain: 'dell.com' },
  { name: 'Lenovo', domain: 'lenovo.com' },
  { name: 'ASUS', domain: 'asus.com' },
  { name: 'Apple', domain: 'apple.com' },
  { name: 'LG', domain: 'lg.com' },
  { name: 'Sony', domain: 'sony.com' },
  { name: 'Microsoft', domain: 'microsoft.com' },
  { name: 'Logitech', domain: 'logitech.com' },
  { name: 'TP-Link', domain: 'tp-link.com' },
  { name: 'Epson', domain: 'epson.com' },
  { name: 'Canon', domain: 'canon.com' },
  { name: 'Hisense', domain: 'hisense.com' },
  { name: 'Acer', domain: 'acer.com' },
  { name: 'MSI', domain: 'msi.com' },
  { name: 'Razer', domain: 'razer.com' },
  { name: 'Intel', domain: 'intel.com' },
  { name: 'AMD', domain: 'amd.com' },
  { name: 'Seagate', domain: 'seagate.com' },
  { name: 'Western Digital', domain: 'westerndigital.com' },
  { name: 'Kingston', domain: 'kingston.com' },
  { name: 'Corsair', domain: 'corsair.com' },
  { name: 'Xiaomi', domain: 'xiaomi.com' },
  { name: 'Huawei', domain: 'huawei.com' },
  { name: 'Brother', domain: 'brother.com' },
  { name: 'Hikvision', domain: 'hikvision.com' },
  { name: 'Dahua', domain: 'dahua.com' },
  { name: 'Ubiquiti', domain: 'ui.com' },
  { name: 'D-Link', domain: 'dlink.com' },
  { name: 'Netgear', domain: 'netgear.com' },
  { name: 'SteelSeries', domain: 'steelseries.com' },
  { name: 'HyperX', domain: 'hyperx.com' },
  { name: 'BenQ', domain: 'benq.com' },
  { name: 'ViewSonic', domain: 'viewsonic.com' },
  { name: 'Bose', domain: 'bose.com' },
];

const LOGO_API_TOKEN = 'pk_RSkNTnvvScKErzhoXO5UUg';
const BRANDS_PER_PAGE = 18; // 6 columns × 3 rows

export function BrandShowcase() {
  const [page, setPage] = useState(0);
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(BRAND_DATA.length / BRANDS_PER_PAGE);
  const currentBrands = BRAND_DATA.slice(page * BRANDS_PER_PAGE, (page + 1) * BRANDS_PER_PAGE);

  function getLogoUrl(domain: string) {
    return `https://img.logo.dev/${domain}?token=${LOGO_API_TOKEN}&format=png&size=128`;
  }

  return (
    <section className="py-16 bg-gray-50/80 dark:bg-[#0a141d]/80 border-y border-gray-200 dark:border-lago-800 overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-center text-gray-500 dark:text-lago-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">
          Trusted by Global Tech Leaders
        </p>
        <p className="text-center text-gray-400 dark:text-lago-500 text-sm mb-10">
          We stock products from the world's most recognized technology brands
        </p>

        {/* 6-column × 3-row grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5 mb-8">
          {currentBrands.map((brand) => (
            <motion.a
              key={brand.name}
              href={`/shop?brand=${encodeURIComponent(brand.name)}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-lago-900/80 border border-gray-200 dark:border-lago-700/50 hover:border-lago-400 dark:hover:border-lago-500 shadow-sm hover:shadow-xl dark:hover:shadow-lago-900/60 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-3">
                {imgErrors.has(brand.domain) ? (
                  <span className="text-xl md:text-2xl font-display font-black tracking-tighter text-gray-300 dark:text-lago-500 group-hover:text-lago-600 dark:group-hover:text-lago-300 transition-colors">
                    {brand.name}
                  </span>
                ) : (
                  <img
                    src={getLogoUrl(brand.domain)}
                    alt={`${brand.name} logo`}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={() => setImgErrors((prev) => new Set(prev).add(brand.domain))}
                  />
                )}
              </div>
              <span className="text-xs font-bold text-gray-500 dark:text-lago-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors text-center leading-tight">
                {brand.name}
              </span>
            </motion.a>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-700 text-sm font-semibold text-gray-600 dark:text-lago-200 hover:border-lago-500 hover:text-lago-600 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              ← Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${
                    i === page
                      ? 'bg-lago-600 text-white shadow-lg shadow-lago-600/30'
                      : 'bg-white dark:bg-lago-800 text-gray-500 dark:text-lago-400 border border-gray-200 dark:border-lago-700 hover:border-lago-500'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-700 text-sm font-semibold text-gray-600 dark:text-lago-200 hover:border-lago-500 hover:text-lago-600 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next →
            </button>
          </div>
        )}

        <p className="text-center text-gray-400 dark:text-lago-600 text-[10px] mt-6">
          Logos provided by <a href="https://logo.dev" target="_blank" rel="noopener noreferrer" className="underline hover:text-lago-500">Logo.dev</a>
        </p>
      </div>
    </section>
  );
}

export function PromoBanner() {
  return (
    <section className="py-6 px-4 md:px-6 container mx-auto">
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 30 }}
        viewport={{ once: true }}
        className="relative rounded-[2rem] overflow-hidden bg-gray-900 min-h-[380px] flex items-center shadow-xl"
      >
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/images/hero-picture-promo.png"
            alt="Current Promotions"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a141d] via-[#0a141d]/80 to-transparent" />
        </div>
        <div className="relative z-10 p-8 md:p-16 max-w-2xl">
          <div className="inline-block bg-accent-orange text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-sm mb-6">
            Limited Time Offer
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-black mb-6 leading-tight text-white">
            Upgrade Your Tech Experience
          </h2>
          <p className="text-lg text-lago-100 mb-8 max-w-md">
            Immerse yourself in premium displays, cinematic sound, and the latest computing power.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/shop" className="px-6 py-3 rounded-full bg-accent-orange hover:bg-orange-600 text-white font-bold transition-colors">
              Shop Now
            </a>
            <a href="/deals" className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold transition-colors border border-white/20">
              View Promotions
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

const TRUST_FEATURES = [
  { icon: Truck, title: 'Nationwide Delivery', desc: 'Fast shipping across South Africa' },
  { icon: ShieldCheck, title: 'Secure Checkout', desc: '100% safe & encrypted payments' },
  { icon: Zap, title: 'Official Brands', desc: 'Manufacturer warranties on all products' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '7-day hassle-free return policy' },
  { icon: HeadphonesIcon, title: 'Warranty Support', desc: 'Dedicated tech assistance' },
];

export function TrustSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-lago-900 border-t border-gray-200 dark:border-lago-800 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {TRUST_FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-[#0a141d] border border-gray-200 dark:border-lago-800 hover:border-lago-500 transition-colors shadow-sm dark:shadow-none"
            >
              <div className="w-14 h-14 rounded-full bg-lago-50 dark:bg-lago-800/50 flex items-center justify-center mb-5 text-lago-600 dark:text-lago-400">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-lago-200">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AccountBenefits() {
  return (
    <section className="py-24 bg-white dark:bg-[#0a141d] transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-8 text-gray-900 dark:text-white">
              Unlock the Ultimate Shopping Experience
            </h2>
            <ul className="space-y-5 mb-10">
              {[
                'Save favourite products & build wishlists',
                'Track orders in real-time',
                'Faster checkout with stored addresses',
                'View complete purchase history',
                'Receive exclusive member promotions',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-lago-100 dark:bg-lago-600/20 text-lago-600 dark:text-lago-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M10.5 1L4.5 7L1.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span className="text-lg text-gray-600 dark:text-lago-100">{item}</span>
                </li>
              ))}
            </ul>
            <a href="/account" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-lago-600 hover:bg-lago-700 text-white font-bold transition-colors shadow-lg shadow-lago-900/20">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-[2rem] overflow-hidden border border-lago-700 shadow-2xl">
              <img src="/images/hero-picture-2.png" alt="Premium electronics" className="w-full h-auto object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-lago-900/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function Newsletter() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-lago-800 border-y border-gray-200 dark:border-lago-700 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 mx-auto bg-white dark:bg-lago-700 rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-gray-200 dark:border-lago-600">
            <Mail className="w-7 h-7 text-lago-600 dark:text-lago-300" />
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-5 text-gray-900 dark:text-white">
            Get Exclusive Tech Deals
          </h2>
          <p className="text-gray-600 dark:text-lago-200 mb-10 text-lg">
            Join our newsletter for early access to sales, new product drops, and insider tech news.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="flex-grow">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full h-14 bg-white dark:bg-[#0a141d] border border-gray-300 dark:border-lago-700 rounded-full px-6 text-gray-900 dark:text-white focus:outline-none focus:border-lago-500 focus:ring-1 focus:ring-lago-500 transition-all shadow-sm"
                required
              />
            </div>
            <button type="submit" className="h-14 px-8 rounded-full bg-lago-600 dark:bg-white text-white dark:text-[#0a141d] font-bold hover:bg-lago-700 dark:hover:bg-lago-100 transition-colors flex-shrink-0">
              Subscribe
            </button>
          </form>
          <p className="text-gray-500 dark:text-lago-400 text-xs mt-4">
            By subscribing you agree to our Terms & Conditions and Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  );
}
