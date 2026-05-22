import { Search, User, Heart, ShoppingCart, Menu, X, MapPin, Phone, Mail, ChevronDown, ChevronUp, Facebook, Youtube, Linkedin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { LegalModal } from './LegalModal';
import { LegalKey } from '../lib/legalContent';
import { useCartStore } from '../lib/cartStore';
import { useAuth } from '../lib/AuthContext';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.totalItems());
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col pointer-events-none">
      {/* Top Utility Bar with Sales Support Number */}
      <div className="pointer-events-auto bg-lago-900 dark:bg-lago-950 text-white py-2 text-xs border-b border-lago-800 hidden md:block select-none">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-lago-200">
              <Phone className="w-3.5 h-3.5 text-lago-400" />
              Sales Support: <a href="tel:0870881483" className="text-white hover:underline font-bold">0870 881 483</a>
            </span>
            <span className="text-lago-700">|</span>
            <span className="flex items-center gap-1.5 text-lago-200">
              <Mail className="w-3.5 h-3.5 text-lago-400" />
              <a href="mailto:sales@spetonline.co.za" className="text-white hover:underline">sales@spetonline.co.za</a>
            </span>
          </div>
          <div className="flex items-center gap-4 text-lago-300 font-semibold">
            <span>🇿🇦 Delivers Nationwide across South Africa</span>
          </div>
        </div>
      </div>

      <div className={`pointer-events-auto transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-lago-900/95 backdrop-blur-md border-b border-gray-200 dark:border-lago-800 py-3 shadow-sm'
          : 'bg-white/90 dark:bg-transparent py-4 md:py-5 backdrop-blur-sm dark:backdrop-blur-none border-b border-gray-200/50 dark:border-transparent'
      }`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between pointer-events-auto">

            {/* Mobile toggle */}
            <button className="md:hidden text-gray-600 dark:text-lago-100 hover:text-gray-900 dark:hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img src="/logo-main.png" alt="SPET Online" className="h-14 md:h-16 w-auto object-contain" />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-semibold text-lago-600 dark:text-lago-400 border-b-2 border-lago-500 pb-1">Home</Link>
              <Link to="/shop" className="text-sm font-medium text-gray-700 dark:text-lago-100 hover:text-lago-600 dark:hover:text-white transition-colors">Shop</Link>
              <Link to="/categories" className="text-sm font-medium text-gray-700 dark:text-lago-100 hover:text-lago-600 dark:hover:text-white transition-colors">Categories</Link>
              <Link to="/deals" className="text-sm font-semibold text-accent-orange hover:text-orange-700 dark:hover:text-white transition-colors flex items-center gap-1.5">
                Deals
                <span className="flex w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
              </Link>
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-4 md:gap-5">
              <ThemeToggle />
              <Link to="/account" className="hidden md:block text-gray-600 dark:text-lago-100 hover:text-lago-600 dark:hover:text-white transition-colors" aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
              <Link to="/account" className="hidden md:block text-gray-600 dark:text-lago-100 hover:text-lago-600 dark:hover:text-white transition-colors" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
              </Link>
              <Link to="/cart" className="text-gray-600 dark:text-lago-100 hover:text-lago-600 dark:hover:text-white transition-colors relative" aria-label="Cart">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-lago-600 text-[10px] font-bold flex items-center justify-center rounded-full text-white">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className={`pointer-events-auto transition-all duration-300 w-full ${
        isScrolled
          ? 'bg-gray-50/95 dark:bg-[#0a141d]/95 backdrop-blur-md border-b border-gray-200 dark:border-lago-800 py-2.5 shadow-sm'
          : 'bg-transparent py-2'
      }`}>
        <div className="container mx-auto px-4 md:px-6">
          <form
            className="relative max-w-3xl mx-auto flex w-full"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get('search');
              if (q) navigate(`/shop?search=${encodeURIComponent(q as string)}`);
            }}
          >
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400 dark:text-lago-500" />
            </div>
            <input
              name="search"
              type="text"
              placeholder="Search products, brands, SKU, categories..."
              className="w-full bg-white dark:bg-lago-900 border border-gray-300 dark:border-lago-700 text-gray-900 dark:text-white rounded-full py-2.5 pl-11 pr-28 focus:outline-none focus:border-lago-500 shadow-sm dark:shadow-none text-sm"
            />
            <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 bg-lago-600 hover:bg-lago-700 text-white px-5 rounded-full font-semibold transition-colors text-sm">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute top-full left-0 right-0 bg-white dark:bg-lago-900 border-b border-gray-200 dark:border-lago-800 md:hidden pb-4 pt-2 shadow-2xl">
          <div className="flex flex-col gap-4 px-6">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-lago-600 dark:text-lago-400 border-b border-gray-100 dark:border-lago-800 pb-3">Home</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="font-medium text-gray-700 dark:text-lago-100 border-b border-gray-100 dark:border-lago-800 pb-3">Shop</Link>
            <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="font-medium text-gray-700 dark:text-lago-100 border-b border-gray-100 dark:border-lago-800 pb-3">Categories</Link>
            <Link to="/deals" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-accent-orange">Deals 🔥</Link>
            <div className="flex gap-6 mt-1 pt-3 border-t border-gray-100 dark:border-lago-800">
              <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-lago-200">
                <User className="w-5 h-5" /> Account
              </Link>
              <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-lago-200">
                <Heart className="w-5 h-5" /> Wishlist
              </Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-lago-200 relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && <span className="absolute -top-1 -right-2 w-4 h-4 bg-lago-600 text-[9px] font-bold flex items-center justify-center rounded-full text-white">{totalItems}</span>}
                Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const [legalDoc, setLegalDoc] = useState<LegalKey | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const paymentLogos = [
    { src: '/payment-logos/Visa_Brandmark_Blue_RGB_2021.png', alt: 'Visa' },
    { src: '/payment-logos/mastercard_logo.png', alt: 'Mastercard' },
    { src: '/payment-logos/Bob_Pay_Instant_EFT_new.png', alt: 'Bob Pay Instant EFT' },
    { src: '/payment-logos/Bob_Pay_Manual_EFT_new.png', alt: 'Bob Pay Manual EFT' },
    { src: '/payment-logos/Capitec pay logo.png', alt: 'Capitec Pay' },
    { src: '/payment-logos/absa_pay.png', alt: 'ABSA Pay' },
    { src: '/payment-logos/pay_shap.png', alt: 'PayShap' },
    { src: '/payment-logos/Apple_Pay_Logo_new.png', alt: 'Apple Pay' },
    { src: '/payment-logos/Google Pay.png', alt: 'Google Pay' },
    { src: '/payment-logos/amex.png', alt: 'American Express' },
  ];

  return (
    <>
      <LegalModal docKey={legalDoc} onClose={() => setLegalDoc(null)} />

      <footer style={{ backgroundColor: '#1e3d58' }} className="pt-16 pb-8 border-t border-lago-700">
        <div className="container mx-auto px-4 md:px-6">

          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

            {/* Brand col */}
            <div className="lg:col-span-2">
              <img src="/logo-main2.png" alt="SPET Online" className="h-12 w-auto object-contain mb-5" />
              <p className="text-lago-200 mb-6 max-w-sm text-sm leading-relaxed">
                SPET Online — your trusted South African online technology retailer.
              </p>
              {/* Contact info */}
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-start gap-3 text-lago-200">
                  <MapPin className="w-4 h-4 text-lago-400 mt-0.5 flex-shrink-0" />
                  <span>Pretoria, Gauteng, South Africa</span>
                </div>
                <div className="flex items-start gap-3 text-lago-200">
                  <Phone className="w-4 h-4 text-lago-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">Sales: <a href="tel:0870881483" className="hover:underline">0870 881 483</a></p>
                    <p className="text-xs text-lago-300">Support: <a href="tel:+27743507142" className="hover:underline">+27 74 350 7142</a></p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-lago-200">
                  <Mail className="w-4 h-4 text-lago-400 flex-shrink-0" />
                  <a href="mailto:sales@spetonline.co.za" className="hover:text-white transition-colors">sales@spetonline.co.za</a>
                </div>
              </div>
              {/* Social */}
              <div className="flex items-center gap-3">
                {[
                  { label: 'Facebook', icon: <Facebook className="w-4 h-4" />, href: 'https://facebook.com' },
                  {
                    label: 'TikTok',
                    icon: (
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.87 1.02 2.03 1.76 3.32 2.13.01 1.34-.01 2.68.01 4.02-1.2-.13-2.38-.59-3.39-1.28-.9-.63-1.63-1.46-2.1-2.43-.04 2.85.02 5.71-.03 8.56-.09 1.63-.58 3.24-1.47 4.61-1.3 1.98-3.52 3.25-5.92 3.26-2.22.02-4.43-.91-5.88-2.6-1.57-1.83-2.12-4.38-1.49-6.72.51-1.95 1.78-3.66 3.51-4.66 1.45-.84 3.12-1.18 4.77-.96v4.06c-.85-.18-1.74-.08-2.52.31-.9.46-1.56 1.34-1.74 2.33-.31 1.64.67 3.33 2.27 3.69 1.25.29 2.62-.2 3.31-1.25.43-.64.59-1.42.57-2.19-.02-3.41-.01-6.82-.01-10.23z" />
                      </svg>
                    ),
                    href: 'https://tiktok.com'
                  },
                  { label: 'YouTube', icon: <Youtube className="w-4 h-4" />, href: 'https://youtube.com' },
                  { label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, href: 'https://linkedin.com' },
                ].map((s) => (
                  <a href={s.href} target="_blank" rel="noopener noreferrer" key={s.label} aria-label={s.label} className="w-9 h-9 rounded-full bg-lago-800/60 flex items-center justify-center text-lago-300 hover:bg-lago-600 hover:text-white cursor-pointer transition-colors border border-lago-700">
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Shop links */}
            <div>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Shop</h4>
              <ul className="space-y-3">
                {[
                  { label: 'All Products', to: '/shop' },
                  { label: 'Categories', to: '/categories' },
                  { label: 'Deals & Promos', to: '/deals' },
                  { label: 'Brands', to: '/shop' },
                ].map((l) => (
                  <li key={l.label}><Link to={l.to} className="text-lago-300 hover:text-white transition-colors text-sm">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Customer links */}
            <div>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Customer</h4>
              <ul className="space-y-3">
                {[
                  { label: 'My Account', to: '/account' },
                  { label: 'Track Order', to: '/account' },
                  { label: 'Wishlist', to: '/account' },
                  { label: 'Support', to: '/account' },
                ].map((l) => (
                  <li key={l.label}><Link to={l.to} className="text-lago-300 hover:text-white transition-colors text-sm">{l.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3">
                {([
                  { label: 'Privacy Policy (POPIA)', key: 'privacy' },
                  { label: 'Terms & Conditions', key: 'terms' },
                  { label: 'Return & Refund Policy', key: 'returns' },
                  { label: 'Warranty Policy', key: 'warranty' },
                  { label: 'Cancellation Policy', key: 'cancellation' },
                  { label: 'Pricing Policy', key: 'pricing' },
                  { label: 'Disclaimer', key: 'disclaimer' },
                  { label: 'FAQ', key: 'faq' },
                ] as { label: string; key: LegalKey }[]).map((l) => (
                  <li key={l.key}>
                    <button
                      onClick={() => setLegalDoc(l.key)}
                      className="text-lago-300 hover:text-white transition-colors text-sm text-left"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment logos */}
          <div className="border-t border-lago-700/50 pt-8 mb-8">
            <p className="text-lago-400 text-xs font-semibold uppercase tracking-widest text-center mb-5">Secure payment methods</p>
            <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4">
              {paymentLogos.map((logo) => (
                <div key={logo.alt} className="h-8 bg-white rounded-md px-2 flex items-center justify-center">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="h-5 w-auto object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-lago-700/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-lago-400 text-xs">© 2026 SPET Online. All rights reserved.</p>
            <p className="text-lago-500 text-xs">VAT included on all prices · Delivers across South Africa</p>
          </div>

          {/* Legal Registration Bar */}
          <div className="border-t border-lago-700/30 mt-6 pt-6">
            <div className="text-center space-y-1">
              <p className="text-lago-300 text-[11px] font-semibold tracking-wide uppercase">
                SEKKATI PETROLEUM ENERGY AND TECHNOLOGY (PTY) LTD
              </p>
              <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-lago-400 text-[10px]">
                <span>Registration Number: 2013/228320/07</span>
                <span className="hidden sm:inline text-lago-600">·</span>
                <span>Trading as: SPET ONLINE</span>
                <span className="hidden sm:inline text-lago-600">·</span>
                <span>BEE Level: —</span>
                <span className="hidden sm:inline text-lago-600">·</span>
                <span>Tax No: —</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp chat widget */}
      <a
        href="https://wa.me/27743507142"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group cursor-pointer pointer-events-auto"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none" />
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.02 14.069.992 11.46.99c-5.448 0-9.873 4.372-9.877 9.802-.001 1.768.461 3.49 1.336 5.031L1.87 21.057l5.35-1.402zm12.554-5.265c-.29-.146-1.72-.85-1.987-.948-.268-.098-.463-.146-.659.146-.196.29-.757.948-.929 1.144-.171.196-.341.22-.63.074-1.666-.83-2.73-1.41-3.793-3.238-.282-.486.282-.45.807-1.498.087-.176.044-.33-.022-.477-.065-.146-.659-1.587-.903-2.172-.238-.574-.479-.496-.659-.505-.17-.008-.365-.009-.56-.009-.196 0-.516.073-.785.365-.268.29-1.023 1.002-1.023 2.443 0 1.44 1.047 2.83 1.193 3.025.147.196 2.062 3.148 4.996 4.413.698.302 1.243.483 1.668.618.702.223 1.342.192 1.847.116.563-.085 1.72-.703 1.962-1.383.243-.68.243-1.264.17-1.383-.073-.12-.268-.195-.558-.34z" />
        </svg>
        <span className="absolute right-16 bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 text-gray-900 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 pointer-events-none">
          Chat with us on WhatsApp
        </span>
      </a>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 z-50 w-12 h-12 bg-lago-600 hover:bg-lago-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 animate-fade-in pointer-events-auto"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
