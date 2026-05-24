import { Search, User, Heart, ShoppingCart, Menu, X, MapPin, Phone, Mail, ChevronDown, ChevronUp, Facebook, Youtube, Linkedin, Truck, Instagram, Globe } from 'lucide-react';
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
      {/* ✅ Top Utility Bar — taller, bigger font */}
      <div className="pointer-events-auto bg-lago-900 dark:bg-lago-950 text-white py-4 border-b border-lago-800 hidden md:block select-none">
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-3 items-center">

          {/* LEFT: Phone & Email — bigger font */}
          <div className="flex items-center gap-5 justify-start">
            <span className="flex items-center gap-2 text-lago-200">
              <Phone className="w-5 h-5 text-lago-400" />
              <a href="tel:0870881483" className="text-white hover:underline font-bold text-base">0870 881 483</a>
            </span>
            <span className="text-lago-700 text-lg">|</span>
            <span className="flex items-center gap-2 text-lago-200">
              <Mail className="w-5 h-5 text-lago-400" />
              <a href="mailto:sales@spetonline.co.za" className="text-white hover:underline text-base">sales@spetonline.co.za</a>
            </span>
          </div>

          {/* ✅ MIDDLE: Free Delivery — centered, van icon, bigger text */}
          <div className="flex items-center justify-center gap-3 text-white font-bold">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-lago-700 border border-lago-600">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-extrabold uppercase tracking-wider text-white">Free Delivery</span>
              <span className="text-xs text-lago-300 font-normal tracking-wide">on orders over R2,500</span>
            </div>
          </div>

          {/* RIGHT: Nationwide delivery */}
          <div className="flex items-center gap-3 justify-end text-lago-300 font-medium">
            <MapPin className="w-5 h-5 text-lago-400" />
            <span className="text-sm">Delivers Nationwide across South Africa</span>
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

      <footer className="w-full mt-auto">

        {/* ✅ TOP PART: BLACK — Logo, links, contact */}
        <div className="bg-[#111111] pt-12 pb-10 md:pt-16 md:pb-14 border-t-4 border-lago-600">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">

              {/* Logo & Intro */}
              <div className="lg:col-span-2">
                <img src="/logo-main.png" alt="SPET Online" className="h-14 md:h-16 w-auto object-contain mb-5 md:mb-6 bg-white p-2 rounded-xl" />
                <p className="text-gray-400 mb-6 md:mb-8 max-w-sm text-sm leading-relaxed">
                  SPET Online — your trusted South African online technology retailer.
                </p>
                <div className="flex items-center gap-3">
                  {[
                    { label: 'Facebook', icon: <Facebook className="w-4 h-4" />, href: 'https://www.facebook.com/SPET.GROUP' },
                    { label: 'Instagram', icon: <Instagram className="w-4 h-4" />, href: 'https://www.instagram.com/sekkatitech/' },
                    { label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, href: 'https://www.linkedin.com/in/sekkati-technology/' },
                  ].map((s) => (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" key={s.label} aria-label={s.label} className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-lago-600 hover:text-white cursor-pointer transition-colors border border-gray-700">
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Need Help? */}
              <div className="lg:col-span-1">
                <h4 className="text-white font-bold mb-5 md:mb-6 text-sm uppercase tracking-wider">Need Help?</h4>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3 text-gray-400">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="leading-snug">Pretoria, Gauteng, South Africa</span>
                  </div>
                  <div className="flex items-start gap-3 text-gray-400">
                    <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-white mb-0.5">Sales: <a href="tel:0870881483" className="hover:text-lago-400 transition-colors">0870 881 483</a></p>
                      <p className="text-xs text-gray-500">Support: <a href="tel:+27743507142" className="hover:text-lago-400 transition-colors">+27 74 350 7142</a></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <a href="mailto:sales@spetonline.co.za" className="hover:text-white transition-colors break-words min-w-0 flex-1">sales@spetonline.co.za</a>
                  </div>
                  <div className="flex items-start gap-3 text-gray-400 pt-1">
                    <Globe className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                      <a href="https://www.sekkatitech.co.za" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors break-words">www.sekkatitech.co.za</a>
                      <a href="https://www.spetonline.co.za" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors break-words">www.spetonline.co.za</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shop & Customer Links - Side by Side on Mobile */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-6 md:gap-10">
                {/* Shop Links */}
                <div>
                  <h4 className="text-white font-bold mb-5 md:mb-6 text-sm uppercase tracking-wider">Shop</h4>
                  <ul className="space-y-3">
                    {[
                      { label: 'All Products', to: '/shop' },
                      { label: 'Categories', to: '/categories' },
                      { label: 'Deals & Promos', to: '/deals' },
                      { label: 'Brands', to: '/shop' },
                    ].map((l) => (
                      <li key={l.label}><Link to={l.to} className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transform transition-all text-sm">{l.label}</Link></li>
                    ))}
                  </ul>
                </div>

                {/* Customer Links */}
                <div>
                  <h4 className="text-white font-bold mb-5 md:mb-6 text-sm uppercase tracking-wider">Customer</h4>
                  <ul className="space-y-3">
                    {[
                      { label: 'My Account', to: '/account' },
                      { label: 'Track Order', to: '/account' },
                      { label: 'Wishlist', to: '/account' },
                      { label: 'Support', to: '/account' },
                    ].map((l) => (
                      <li key={l.label}><Link to={l.to} className="text-gray-400 hover:text-white hover:translate-x-1 inline-block transform transition-all text-sm">{l.label}</Link></li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ✅ MIDDLE PART: BLUE — Payment logos (same blue, no change) */}
        <div style={{ backgroundColor: '#1e3d58' }} className="py-6 border-b border-lago-800 shadow-inner">
          <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-center gap-6">
            <span className="text-lago-200 text-[11px] font-bold uppercase tracking-[0.2em] hidden md:inline-block">Secured By</span>
            <div className="flex flex-wrap justify-center items-center gap-3">
              {paymentLogos.map((logo) => (
                <div key={logo.alt} className="h-9 bg-white rounded flex items-center justify-center px-3 shadow-sm border border-gray-200">
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
        </div>

        {/* ✅ BOTTOM PART: WHITE background — legal links + copyright in dark text */}
        <div className="bg-white py-8 border-t border-gray-200">
          <div className="container mx-auto px-4 md:px-6">

            {/* Legal links — horizontal line, dark text on white */}
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 mb-6">
              <div className="w-full flex flex-wrap justify-center items-center gap-x-0 gap-y-2">
                {([
                  { label: 'Privacy Policy', key: 'privacy' },
                  { label: 'Terms & Conditions', key: 'terms' },
                  { label: 'Return Policy', key: 'returns' },
                  { label: 'Warranty Policy', key: 'warranty' },
                  { label: 'FAQ', key: 'faq' }
                ] as const).map((l, i, arr) => (
                  <span key={l.key} className="flex items-center">
                    <button
                      onClick={() => setLegalDoc(l.key as LegalKey)}
                      className="text-gray-700 hover:text-lago-600 text-[13px] font-semibold transition-colors px-3 py-1"
                    >
                      {l.label}
                    </button>
                    {i < arr.length - 1 && (
                      <span className="text-gray-300 text-sm select-none">|</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Copyright — dark text on white */}
            <div className="text-center space-y-2 border-t border-gray-100 pt-6">
              <p className="text-gray-600 text-[13px] font-medium">
                Copyright © 2013–2026 SEKKATI PETROLEUM ENERGY AND TECHNOLOGY (PTY) LTD. All rights reserved.
              </p>
              <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-gray-400 text-xs">
                <span>Registration Number: 2013/228320/07</span>
                <span className="hidden sm:inline text-gray-300">|</span>
                <span>Trading as: SPET ONLINE</span>
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