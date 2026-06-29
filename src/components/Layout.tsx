import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { LegalModal } from './LegalModal';
import { LegalKey } from '../lib/legalContent';
import { useCartStore } from '../lib/cartStore';
import { useAuth } from '../lib/AuthContext';
import {
  Phone, Mail, Truck, MapPin, Search, User, Heart,
  ShoppingCart, X, Menu, Building2,
} from 'lucide-react';

// ── Nav link with active indicator ───────────────────────────────────────────
function NavLink({
  to, children, className = '', onClick, transparent,
}: {
  to: string; children: React.ReactNode; className?: string; onClick?: () => void; transparent?: boolean;
}) {
  const { pathname } = useLocation();

  const isActive =
    to === '/'
      ? pathname === '/'
      : pathname === to || pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`text-base font-semibold transition-colors pb-1 ${
        isActive
          ? transparent
            ? 'text-white border-b-2 border-white/70'
            : 'text-lago-600 dark:text-lago-400 border-b-2 border-lago-500'
          : transparent
            ? 'text-white/90 hover:text-white border-b-2 border-transparent'
            : 'text-gray-700 dark:text-lago-100 hover:text-lago-600 dark:hover:text-white border-b-2 border-transparent'
      } ${className}`}
    >
      {children}
    </Link>
  );
}

// ── NavSpacer ─────────────────────────────────────────────────────────────────
export function NavSpacer() {
  return <div className="h-[136px]" aria-hidden="true" />;
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export function Navbar() {
  const [isScrolled,     setIsScrolled]     = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate   = useNavigate();
  const totalItems = useCartStore((s) => s.totalItems());
  const { pathname } = useLocation();

  // On the home page, start transparent and become solid on scroll
  const isHeroPage    = pathname === '/';
  const isTransparent = isHeroPage && !isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col pointer-events-none">

      {/* ── Top utility bar ── */}
      <div className={`pointer-events-auto transition-all duration-300 py-4 border-b hidden md:block select-none ${
        isTransparent
          ? 'bg-transparent border-white/10'
          : 'bg-lago-900 dark:bg-lago-950 border-lago-800'
      }`}>
        <div className="container mx-auto px-4 md:px-6 grid grid-cols-3 items-center">
          <div className="flex items-center gap-5 justify-start">
            <span className="flex items-center gap-2">
              <Phone className={`w-5 h-5 ${isTransparent ? 'text-white/60' : 'text-lago-400'}`} />
              <a href="tel:0870881483" className="text-white hover:underline font-bold text-base">0870 881 483</a>
            </span>
            <span className={`text-lg ${isTransparent ? 'text-white/20' : 'text-lago-700'}`}>|</span>
            <span className="flex items-center gap-2">
              <Mail className={`w-5 h-5 ${isTransparent ? 'text-white/60' : 'text-lago-400'}`} />
              <a href="mailto:sales@spetonline.co.za" className="text-white hover:underline text-base">sales@spetonline.co.za</a>
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 text-white font-bold">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border ${
              isTransparent ? 'bg-white/10 border-white/20' : 'bg-lago-700 border-lago-600'
            }`}>
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-extrabold uppercase tracking-wider text-white">Free Delivery</span>
              <span className={`text-xs font-normal tracking-wide ${isTransparent ? 'text-white/60' : 'text-lago-300'}`}>
                on orders over R2,500
              </span>
            </div>
          </div>
          <div className={`flex items-center gap-3 justify-end font-medium ${isTransparent ? 'text-white/70' : 'text-lago-300'}`}>
            <MapPin className={`w-5 h-5 ${isTransparent ? 'text-white/50' : 'text-lago-400'}`} />
            <span className="text-sm">Delivers Nationwide across South Africa</span>
          </div>
        </div>
      </div>

      {/* ── Main navbar ── */}
      <div className={`pointer-events-auto transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-lago-900/95 backdrop-blur-md border-b border-gray-200 dark:border-lago-800 py-3 shadow-sm'
          : isTransparent
            ? 'bg-transparent py-4 md:py-5 border-b border-transparent'
            : 'bg-white/90 dark:bg-transparent py-4 md:py-5 backdrop-blur-sm dark:backdrop-blur-none border-b border-gray-200/50 dark:border-transparent'
      }`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between pointer-events-auto">

            <button
              className={`md:hidden ${isTransparent ? 'text-white' : 'text-gray-600 dark:text-lago-100 hover:text-gray-900 dark:hover:text-white'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex-shrink-0">
              <img
                src="/logo-main.png"
                alt="SPET Online"
                className={`h-16 md:h-20 w-auto object-contain transition-all duration-300 ${isTransparent ? 'brightness-200' : ''}`}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <NavLink to="/" transparent={isTransparent}>Home</NavLink>
              <NavLink to="/shop" transparent={isTransparent}>Shop</NavLink>
              <NavLink to="/categories" transparent={isTransparent}>Categories</NavLink>
              <NavLink to="/b2b" transparent={isTransparent} className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                B2B Enterprise
              </NavLink>
              <Link
                to="/deals"
                className={`text-base font-semibold transition-colors flex items-center gap-1.5 ${
                  isTransparent
                    ? 'text-orange-300 hover:text-white'
                    : 'text-accent-orange hover:text-orange-700 dark:hover:text-white'
                }`}
              >
                Deals
                <span className="flex w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
              </Link>
            </nav>

            <div className="flex items-center gap-3 md:gap-4">
              <form
                className="hidden md:flex relative items-center"
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = new FormData(e.currentTarget).get('search');
                  if (q) navigate(`/search?q=${encodeURIComponent(q as string)}`);
                }}
              >
                <div className="absolute left-3 flex items-center pointer-events-none">
                  <Search className={`w-4 h-4 ${isTransparent ? 'text-white/60' : 'text-gray-400 dark:text-lago-500'}`} />
                </div>
                <input
                  name="search"
                  type="text"
                  placeholder="Search products..."
                  className={`w-52 border rounded-full py-2 pl-9 pr-16 focus:outline-none focus:w-72 transition-all duration-300 text-sm ${
                    isTransparent
                      ? 'bg-white/15 border-white/30 text-white placeholder-white/50 focus:border-white/60 backdrop-blur-sm'
                      : 'bg-white dark:bg-lago-900 border-gray-300 dark:border-lago-700 text-gray-900 dark:text-white focus:border-lago-500 shadow-sm dark:shadow-none'
                  }`}
                />
                <button
                  type="submit"
                  className={`absolute right-1 top-1 bottom-1 text-white px-3 rounded-full font-semibold transition-colors text-xs ${
                    isTransparent ? 'bg-white/20 hover:bg-white/30' : 'bg-lago-600 hover:bg-lago-700'
                  }`}
                >
                  Go
                </button>
              </form>

              <ThemeToggle />
              <Link to="/account"
                className={`hidden md:block transition-colors ${isTransparent ? 'text-white/80 hover:text-white' : 'text-gray-600 dark:text-lago-100 hover:text-lago-600 dark:hover:text-white'}`}
                aria-label="Account">
                <User className="w-5 h-5" />
              </Link>
              <Link to="/account"
                className={`hidden md:block transition-colors ${isTransparent ? 'text-white/80 hover:text-white' : 'text-gray-600 dark:text-lago-100 hover:text-lago-600 dark:hover:text-white'}`}
                aria-label="Wishlist">
                <Heart className="w-5 h-5" />
              </Link>
              <Link to="/cart"
                className={`transition-colors relative ${isTransparent ? 'text-white/80 hover:text-white' : 'text-gray-600 dark:text-lago-100 hover:text-lago-600 dark:hover:text-white'}`}
                aria-label="Cart">
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

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto absolute top-full left-0 right-0 bg-white dark:bg-lago-900 border-b border-gray-200 dark:border-lago-800 md:hidden pb-4 pt-2 shadow-2xl">
          <div className="flex flex-col gap-4 px-6">
            <Link to="/"           onClick={() => setMobileMenuOpen(false)} className="font-semibold text-lago-600 dark:text-lago-400 border-b border-gray-100 dark:border-lago-800 pb-3">Home</Link>
            <Link to="/shop"       onClick={() => setMobileMenuOpen(false)} className="font-medium text-gray-700 dark:text-lago-100 border-b border-gray-100 dark:border-lago-800 pb-3">Shop</Link>
            <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="font-medium text-gray-700 dark:text-lago-100 border-b border-gray-100 dark:border-lago-800 pb-3">Categories</Link>
            <Link to="/b2b"        onClick={() => setMobileMenuOpen(false)} className="font-medium text-gray-700 dark:text-lago-100 border-b border-gray-100 dark:border-lago-800 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> B2B Enterprise
            </Link>
            <Link to="/deals"      onClick={() => setMobileMenuOpen(false)} className="font-semibold text-accent-orange">Deals 🔥</Link>
            <div className="flex gap-6 mt-1 pt-3 border-t border-gray-100 dark:border-lago-800">
              <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-lago-200">
                <User className="w-5 h-5" /> Account
              </Link>
              <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-lago-200">
                <Heart className="w-5 h-5" /> Wishlist
              </Link>
              <Link to="/cart"    onClick={() => setMobileMenuOpen(false)} className="flex flex-col items-center gap-1 text-xs text-gray-600 dark:text-lago-200 relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-lago-600 text-[9px] font-bold flex items-center justify-center rounded-full text-white">{totalItems}</span>
                )}
                Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
export function Footer() {
  const [legalDoc,      setLegalDoc]      = useState<LegalKey | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const paymentLogos = [
    { src: '/payment-logos/Visa_Brandmark_Blue_RGB_2021.png',  alt: 'Visa' },
    { src: '/payment-logos/mastercard_logo.png',               alt: 'Mastercard' },
    { src: '/payment-logos/Bob_Pay_Instant_EFT_new.png',       alt: 'Bob Pay Instant EFT' },
    { src: '/payment-logos/Bob_Pay_Manual_EFT_new.png',        alt: 'Bob Pay Manual EFT' },
    { src: '/payment-logos/Capitec pay logo.png',              alt: 'Capitec Pay' },
    { src: '/payment-logos/absa_pay.png',                      alt: 'ABSA Pay' },
    { src: '/payment-logos/pay_shap.png',                      alt: 'PayShap' },
    { src: '/payment-logos/Apple_Pay_Logo_new.png',            alt: 'Apple Pay' },
    { src: '/payment-logos/Google Pay.png',                    alt: 'Google Pay' },
    { src: '/payment-logos/amex.png',                          alt: 'American Express' },
  ];

  const legalLinks: [LegalKey, string][] = [
    ['privacy'  as LegalKey, 'Privacy Policy'],
    ['terms'    as LegalKey, 'Terms & Conditions'],
    ['returns'  as LegalKey, 'Returns Policy'],
    ['warranty' as LegalKey, 'Warranty Policy'],
    ['faq'      as LegalKey, 'FAQ'],
  ];

  return (
    <>
      <LegalModal docKey={legalDoc} onClose={() => setLegalDoc(null)} />

      <footer className="w-full mt-auto">

        {/* Top: dark section */}
        <div className="bg-[#111111] pt-12 pb-10 md:pt-16 md:pb-14 border-t-4 border-lago-600">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">

              {/* Col 1: Logo + tagline */}
              <div className="md:col-span-1">
                <img
                  src="/logo-main.png"
                  alt="SPET Online"
                  className="h-14 w-auto object-contain mb-4 brightness-200"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'text-white font-black text-2xl mb-4';
                    fallback.textContent = 'SPET Online';
                    el.parentNode?.insertBefore(fallback, el);
                  }}
                />
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  South Africa's trusted online electronics retailer. Quality products, competitive prices, delivered nationwide.
                </p>
                <div className="flex gap-3">
                  <a href="https://facebook.com" target="_blank" rel="noreferrer"
                    className="w-8 h-8 bg-gray-800 hover:bg-lago-600 rounded-full flex items-center justify-center transition-colors text-gray-400 hover:text-white text-xs font-bold">f</a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer"
                    className="w-8 h-8 bg-gray-800 hover:bg-lago-600 rounded-full flex items-center justify-center transition-colors text-gray-400 hover:text-white text-xs font-bold">in</a>
                  <a href="https://wa.me/27870881483" target="_blank" rel="noreferrer"
                    className="w-8 h-8 bg-gray-800 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors text-gray-400 hover:text-white text-xs font-bold">W</a>
                </div>
              </div>

              {/* Col 2: Shop links */}
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Shop</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: 'Home & Entertainment', to: '/shop/home' },
                    { label: 'Gaming & Computing',   to: '/shop/tech' },
                    { label: 'Deals & Clearance',    to: '/deals' },
                    { label: 'All Categories',       to: '/categories' },
                    { label: 'B2B / Business',       to: '/b2b' },
                  ].map(({ label, to }) => (
                    <li key={to}>
                      <Link to={to} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 3: Quick links */}
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: 'My Account',  to: '/account' },
                    { label: 'Track Order', to: '/account' },
                    { label: 'Cart',        to: '/cart' },
                    { label: 'Contact Us',  to: 'mailto:sales@spetonline.co.za' },
                  ].map(({ label, to }) => (
                    <li key={label}>
                      {to.startsWith('mailto') ? (
                        <a href={to} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</a>
                      ) : (
                        <Link to={to} className="text-gray-400 hover:text-white text-sm transition-colors">{label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 4: Contact + B2B */}
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contact</h4>
                <ul className="space-y-2.5 mb-6">
                  <li className="flex items-center gap-2 text-gray-400 text-sm">
                    <Phone className="w-4 h-4 text-lago-400 flex-shrink-0" />
                    <a href="tel:0870881483" className="hover:text-white transition-colors">0870 881 483</a>
                  </li>
                  <li className="flex items-center gap-2 text-gray-400 text-sm">
                    <Mail className="w-4 h-4 text-lago-400 flex-shrink-0" />
                    <a href="mailto:sales@spetonline.co.za" className="hover:text-white transition-colors">sales@spetonline.co.za</a>
                  </li>
                  <li className="flex items-start gap-2 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 text-lago-400 flex-shrink-0 mt-0.5" />
                    <span>Nationwide delivery across South Africa</span>
                  </li>
                </ul>
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <p className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-lago-400" /> Business & Schools
                  </p>
                  <p className="text-gray-400 text-xs leading-relaxed mb-2">
                    B2B portal coming soon — dedicated pricing for schools and businesses.
                  </p>
                  <a href="mailto:sales@spetonline.co.za?subject=B2B Enquiry"
                    className="text-lago-400 hover:text-lago-300 text-xs font-semibold transition-colors">
                    Register interest →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Navy — payment logos */}
        <div className="bg-[#1e3a5f] py-5">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <span className="text-white text-xs font-bold uppercase tracking-widest mr-4">Secured By</span>
              <div className="flex flex-wrap justify-center gap-2">
                {paymentLogos.map((logo) => (
                  <div key={logo.alt} className="h-9 bg-white rounded-lg px-3 flex items-center justify-center border border-gray-200 shadow-sm">
                    <img src={logo.src} alt={logo.alt} className="h-5 w-auto object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: White — legal links + copyright */}
        <div className="bg-white py-5 border-t border-gray-200">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-gray-500 text-xs text-center md:text-left">
                © {new Date().getFullYear()} Sekkati Petroleum Energy and Technology (Pty) Ltd · Trading as SPET Online · All rights reserved
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {legalLinks.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setLegalDoc(key)}
                    className="text-gray-500 hover:text-gray-800 text-xs transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </footer>

      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-lago-600 hover:bg-lago-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </>
  );
}