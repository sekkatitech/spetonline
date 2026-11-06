import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight, Building2, ChevronDown, Clock, Heart, Instagram, Facebook,
  Mail, MapPin, Menu, MessageCircle, MessageSquarePlus, Phone, Search, ShoppingCart, Truck, User, X,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { LegalModal } from './LegalModal';
import { LEGAL_DOCS, LegalKey } from '../lib/legalContent';
import { useEngagement } from '../lib/engagement';
import { NewsletterBand } from './engagement/NewsletterBand';
import { useCartStore } from '../lib/cartStore';
import { supabase } from '../lib/supabase';

// ── Shared header/footer chrome ───────────────────────────────────────────────
// Header: 36px utility bar + 64px main bar + 44px department nav (144px total).
// Mobile: 56px main bar + 44px search row (100px total).
const HEADER_HEIGHT_MOBILE = '100px';
const HEADER_HEIGHT_DESKTOP = '144px';

const DEPARTMENTS = [
  { label: 'TVs & audio', href: '/shop/home?categoryHead=Televisions' },
  { label: 'Laptops & computing', href: '/shop/home?categoryHead=Notebooks%20and%20Laptops' },
  { label: 'Monitors', href: '/shop/home?categoryHead=Computer%20Monitors' },
  { label: 'Gaming', href: '/shop/home?categoryHead=Console%20Gaming%20Units' },
  { label: 'Audio & soundbars', href: '/shop/home?categoryHead=Speakers%20%26%20Audio' },
  { label: 'Networking', href: '/shop/home?categoryHead=Wireless%20Network%20Products' },
  { label: 'Storage', href: '/shop/home?categoryHead=Hard%20Drives%2FStorage' },
  { label: 'Printing', href: '/shop/home?categoryHead=Printers' },
  { label: 'Power backup', href: '/shop/home?categoryHead=Uninterruptible%20Power%20Supply' },
];

// ── Search (used in the header and the mobile bar) ----------------------------
function SearchForm({ id, className = '' }: { id: string; className?: string }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  // On the results page the box keeps the term that produced them, so a shopper can
  // refine a search instead of retyping it.
  const urlQuery = pathname === '/search' ? new URLSearchParams(search).get('q') ?? '' : '';
  const [value, setValue] = useState(urlQuery);

  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery]);

  return (
    <form
      role="search"
      className={`flex items-stretch ${className}`}
      onSubmit={(event) => {
        event.preventDefault();
        const query = String(new FormData(event.currentTarget).get('q') ?? '').trim();
        if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
      }}
    >
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-spet-muted" aria-hidden="true" />
        <input
          id={id}
          name="q"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search TVs, laptops, printers"
          className="h-10 w-full rounded-l-lg border border-r-0 border-spet-line bg-spet-surface pl-10 pr-3 text-sm text-spet-ink placeholder:text-spet-was focus:border-spet-blue focus:outline-hidden"
        />
      </div>
      <button
        type="submit"
        className="h-10 shrink-0 rounded-r-lg bg-spet-blue px-4 text-sm font-semibold text-white transition-colors hover:bg-spet-blue-dark"
      >
        Search
      </button>
    </form>
  );
}

// ── Nav link with active indicator ───────────────────────────────────────────
function NavLink({ to, children, className = '' }: { to: string; children: ReactNode; className?: string }) {
  const { pathname } = useLocation();
  const isActive = to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      aria-current={isActive ? 'page' : undefined}
      className={`text-[14px] font-medium transition-colors ${
        isActive ? 'font-semibold text-spet-blue' : 'text-spet-ink-2 hover:text-spet-blue'
      } ${className}`}
    >
      {children}
    </Link>
  );
}

// ── NavSpacer ─────────────────────────────────────────────────────────────────
export function NavSpacer() {
  return (
    <>
      <div aria-hidden="true" style={{ height: HEADER_HEIGHT_MOBILE }} className="md:hidden" />
      <div aria-hidden="true" style={{ height: HEADER_HEIGHT_DESKTOP }} className="hidden md:block" />
    </>
  );
}

// ── Floating WhatsApp chat button ────────────────────────────────────────────
const WHATSAPP_NUMBER = '27741164295';
const WHATSAPP_MESSAGE = "Hi SPET Online, I'd like some help with a product.";

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/20 transition-transform duration-200 hover:scale-105"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-75" style={{ animationDuration: '2.5s' }} />
      <svg viewBox="0 0 24 24" className="relative h-7 w-7 fill-white" aria-hidden="true">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 004.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.13h-.01a8.2 8.2 0 01-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.37c0-4.54 3.7-8.24 8.26-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 012.42 5.83c0 4.55-3.7 8.24-8.26 8.24zm4.53-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.06 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.23-.17-.48-.29z" />
      </svg>
    </a>
  );
}

// ── Department mega-menu ──────────────────────────────────────────────────────
const MEGA_MENU_COLUMNS = [
  {
    label: 'TV & audio',
    links: [
      { label: 'Televisions', href: '/shop/home?categoryHead=Televisions' },
      { label: 'TV accessories', href: '/shop/home?categoryHead=Televisions-%20Accessories' },
      { label: 'Soundbars & audio', href: '/shop/home?categoryHead=Speakers%20%26%20Audio' },
      { label: 'Projectors', href: '/shop/home?categoryHead=Projectors%20and%20Accessories' },
    ],
  },
  {
    label: 'Computing',
    links: [
      { label: 'Laptops & notebooks', href: '/shop/home?categoryHead=Notebooks%20and%20Laptops' },
      { label: 'Monitors', href: '/shop/home?categoryHead=Computer%20Monitors' },
      { label: 'Components', href: '/shop/home?categoryHead=Computer%20Processors' },
      { label: 'Storage', href: '/shop/home?categoryHead=Hard%20Drives%2FStorage' },
    ],
  },
  {
    label: 'Home & office',
    links: [
      { label: 'Printers', href: '/shop/home?categoryHead=Printers' },
      { label: 'Networking', href: '/shop/home?categoryHead=Wireless%20Network%20Products' },
      { label: 'Power backup', href: '/shop/home?categoryHead=Uninterruptible%20Power%20Supply' },
      { label: 'Security & CCTV', href: '/shop/home?categoryHead=CCTV%20and%20DVR%20Products' },
    ],
  },
];

function ShopMegaMenu() {
  return (
    <div
      className="group relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape') (document.activeElement as HTMLElement | null)?.blur();
      }}
    >
      <Link
        to="/shop"
        className="flex items-center gap-1 text-[14px] font-medium text-spet-ink-2 transition-colors hover:text-spet-blue"
      >
        Shop
        <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
      </Link>

      <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 translate-y-1 pt-4 opacity-0 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="grid w-[720px] max-w-[90vw] grid-cols-4 gap-6 rounded-2xl border border-spet-line bg-spet-surface p-6 shadow-2xl">
          {MEGA_MENU_COLUMNS.map((column) => (
            <div key={column.label}>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-spet-blue">{column.label}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="block truncate text-[13px] text-spet-ink-2 transition-colors hover:text-spet-blue">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="border-l border-spet-line-2 pl-6">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-spet-muted">More</p>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link to="/deals" className="font-semibold text-spet-orange hover:underline">Deals</Link>
              </li>
              <li>
                <Link to="/categories" className="text-spet-ink-2 transition-colors hover:text-spet-blue">All categories</Link>
              </li>
              <li>
                <Link to="/b2b" className="flex items-center gap-1.5 text-spet-ink-2 transition-colors hover:text-spet-blue">
                  <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> Business
                </Link>
              </li>
              <li>
                <Link to="/enterprise/apple" className="text-spet-ink-2 transition-colors hover:text-spet-blue">Apple portal</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const totalItems = useCartStore((state) => state.totalItems());
  const { pathname } = useLocation();
  const pendingOrderId = useCartStore((state) => state.pendingOrder?.id);

  // A shopper can pay and never reach the success page (closed tab, delayed EFT),
  // so empty the cart on the next visit once the order shows as paid.
  useEffect(() => {
    if (!pendingOrderId) return;
    let cancelled = false;
    supabase
      .from('orders')
      .select('payment_status')
      .eq('id', pendingOrderId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data?.payment_status === 'paid') useCartStore.getState().clearCart();
      });
    return () => { cancelled = true; };
  }, [pendingOrderId]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (document.querySelector('script[data-seo-jsonld-site="true"]')) return;
    const el = document.createElement('script');
    el.setAttribute('type', 'application/ld+json');
    el.setAttribute('data-seo-jsonld-site', 'true');
    el.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', name: 'SPET Online', url: 'https://spetonline.co.za', logo: 'https://spetonline.co.za/logo-main.png' },
        {
          '@type': 'WebSite',
          name: 'SPET Online',
          url: 'https://spetonline.co.za',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://spetonline.co.za/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    });
    document.head.appendChild(el);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex flex-col bg-spet-surface">
      {/* Utility bar */}
      <div className="hidden h-9 bg-spet-navy text-[12px] text-white/65 md:block">
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-6 px-6">
          <div className="flex items-center gap-6">
            <a href="tel:0870881483" className="flex items-center gap-2 transition-colors hover:text-white">
              <Phone className="h-[13px] w-[13px]" aria-hidden="true" />
              0870 881 483
            </a>
            <a href="mailto:sales@spetonline.co.za" className="flex items-center gap-2 transition-colors hover:text-white">
              <Mail className="h-[13px] w-[13px]" aria-hidden="true" />
              sales@spetonline.co.za
            </a>
          </div>

          <div className="flex items-center gap-2 text-white/85">
            <Truck className="h-[14px] w-[14px]" aria-hidden="true" />
            Free delivery over R2 500
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-[13px] w-[13px]" aria-hidden="true" />
            Delivered nationwide from Pretoria
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className={`border-b border-spet-line bg-spet-surface transition-shadow duration-200 ${isScrolled ? 'shadow-sm' : ''}`}>
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 md:h-16 md:gap-8 md:px-6">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className="flex h-10 w-10 items-center justify-center text-spet-ink-2 transition-colors hover:text-spet-blue md:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <Link to="/" className="shrink-0" aria-label="SPET Online home">
            <img
              src="/logo-main.png"
              alt="SPET Online"
              className="h-10 w-auto object-contain md:h-11"
              onError={(event) => {
                (event.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </Link>

          <SearchForm id="desktop-search" className="hidden max-w-[620px] flex-1 md:flex" />

          <div className="ml-auto flex items-center gap-3 md:gap-5">
            <ThemeToggle />

            <Link
              to="/account"
              className="hidden items-center gap-2 text-[13px] text-spet-ink-2 transition-colors hover:text-spet-blue md:flex"
            >
              <User className="h-[19px] w-[19px]" aria-hidden="true" />
              <span className="hidden lg:inline">Account</span>
            </Link>

            <Link
              to="/account"
              aria-label="Wishlist"
              className="hidden items-center gap-2 text-[13px] text-spet-ink-2 transition-colors hover:text-spet-blue md:flex"
            >
              <Heart className="h-[19px] w-[19px]" aria-hidden="true" />
              <span className="hidden lg:inline">Wishlist</span>
            </Link>

            <Link
              to="/cart"
              aria-label={`Cart, ${totalItems} item${totalItems === 1 ? '' : 's'}`}
              className="flex items-center gap-2 text-[13px] text-spet-ink-2 transition-colors hover:text-spet-blue"
            >
              <span className="relative">
                <ShoppingCart className="h-[19px] w-[19px]" aria-hidden="true" />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-spet-orange px-1 text-[10px] font-bold text-white">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </span>
              <span className="hidden sm:inline">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile search row */}
      <div className="border-b border-spet-line bg-spet-surface px-4 py-2 md:hidden">
        <SearchForm id="mobile-search" />
      </div>

      {/* Department navigation */}
      <div className="hidden border-b border-spet-line bg-spet-surface md:block">
        <div className="mx-auto flex h-11 max-w-[1400px] items-center justify-between px-6">
          <nav className="flex items-center gap-7" aria-label="Main navigation">
            <ShopMegaMenu />
            <NavLink to="/categories">Categories</NavLink>
            <Link to="/deals" className="flex items-center gap-1.5 text-[14px] font-medium text-spet-orange transition-colors hover:text-[#c96607]">
              Deals
              <span className="h-1.5 w-1.5 rounded-full bg-spet-orange" aria-hidden="true" />
            </Link>
            <NavLink to="/b2b">Business</NavLink>
            <NavLink to="/enterprise/apple">Apple</NavLink>
          </nav>

          <Link
            to="/enterprise"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-spet-blue transition-colors hover:text-spet-blue-dark"
          >
            Enterprise portal
            <ArrowRight className="h-[14px] w-[14px]" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full max-h-[calc(100vh-100px)] overflow-y-auto border-b border-spet-line bg-spet-surface px-4 pb-6 pt-3 shadow-2xl md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col">
            <Link to="/shop" className="flex h-11 items-center border-b border-spet-line-2 font-semibold text-spet-blue">
              Shop all
            </Link>
            {DEPARTMENTS.map((department) => (
              <Link
                key={department.label}
                to={department.href}
                className="flex h-10 items-center border-b border-spet-line-2 pl-3 text-[14px] text-spet-ink-2"
              >
                {department.label}
              </Link>
            ))}
            <Link to="/categories" className="flex h-11 items-center border-b border-spet-line-2 font-medium text-spet-ink">
              Categories
            </Link>
            <Link to="/b2b" className="flex h-11 items-center gap-2 border-b border-spet-line-2 font-medium text-spet-ink">
              <Building2 className="h-4 w-4" aria-hidden="true" /> B2B Enterprise
            </Link>
            <Link to="/deals" className="flex h-11 items-center border-b border-spet-line-2 font-semibold text-spet-orange">
              Deals
            </Link>
            <Link to="/enterprise/apple" className="flex h-11 items-center border-b border-spet-line-2 font-medium text-spet-ink">
              Apple portal
            </Link>

            <div className="mt-4 flex items-center justify-around">
              <Link to="/account" className="flex flex-col items-center gap-1 text-[11px] text-spet-ink-2">
                <User className="h-5 w-5" aria-hidden="true" /> Account
              </Link>
              <Link to="/account" className="flex flex-col items-center gap-1 text-[11px] text-spet-ink-2">
                <Heart className="h-5 w-5" aria-hidden="true" /> Wishlist
              </Link>
              <Link to="/cart" className="relative flex flex-col items-center gap-1 text-[11px] text-spet-ink-2">
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-spet-orange text-[9px] font-bold text-white">
                    {totalItems}
                  </span>
                )}
                Cart
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
const PAYMENT_LOGOS = [
  { src: '/payment-logos/Visa_Brandmark_Blue_RGB_2021.png', alt: 'Visa' },
  { src: '/payment-logos/mastercard_logo.png', alt: 'Mastercard' },
  { src: '/payment-logos/pay_shap.png', alt: 'PayShap' },
  { src: '/payment-logos/Apple_Pay_Logo_new.png', alt: 'Apple Pay' },
];

const SHOP_LINKS = [
  { label: 'TVs & audio', to: '/shop/home?categoryHead=Televisions' },
  { label: 'Laptops & computing', to: '/shop/home?categoryHead=Notebooks%20and%20Laptops' },
  { label: 'Monitors', to: '/shop/home?categoryHead=Computer%20Monitors' },
  { label: 'Gaming', to: '/shop/home?categoryHead=Console%20Gaming%20Units' },
  { label: 'Networking', to: '/shop/home?categoryHead=Wireless%20Network%20Products' },
  { label: 'Power backup', to: '/shop/home?categoryHead=Uninterruptible%20Power%20Supply' },
  { label: 'Deals', to: '/deals' },
];

const DELIVERY_FACTS = [
  'Free delivery over R2 500',
  'R90 flat rate under R2 500',
  '3–7 business days',
  '7-day returns',
];

// Pages where the newsletter section would get in the way of finishing a task.
const NO_NEWSLETTER_BAND = [/^\/checkout/, /^\/payment-/, /^\/admin/, /^\/newsletter\//];

export function Footer() {
  const [legalDoc, setLegalDoc] = useState<LegalKey | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const openPanel = useEngagement((state) => state.setOpen);
  const showBand = !NO_NEWSLETTER_BAND.some((re) => re.test(pathname));

  // Emails link to /?legal=privacy, so a policy can be opened from outside the site.
  const legalParam = searchParams.get('legal');
  useEffect(() => {
    if (legalParam && legalParam in LEGAL_DOCS) setLegalDoc(legalParam as LegalKey);
  }, [legalParam]);

  function closeLegal() {
    setLegalDoc(null);
    if (legalParam) {
      const next = new URLSearchParams(searchParams);
      next.delete('legal');
      setSearchParams(next, { replace: true });
    }
  }

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const legalLinks: [LegalKey, string][] = [
    ['privacy' as LegalKey, 'Privacy'],
    ['terms' as LegalKey, 'Terms'],
    ['returns' as LegalKey, 'Returns'],
    ['warranty' as LegalKey, 'Warranty'],
    ['faq' as LegalKey, 'FAQ'],
  ];

  return (
    <>
      <LegalModal docKey={legalDoc} onClose={closeLegal} />

      {showBand && <NewsletterBand />}

      <footer className="mt-12 w-full bg-spet-navy text-white">
        <div className="mx-auto max-w-[1400px] px-4 pb-8 pt-10 md:px-6 md:pt-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div>
              <div className="inline-flex rounded-lg bg-white p-2">
                <img
                  src="/logo-main.png"
                  alt="SPET Online"
                  className="h-8 w-auto object-contain"
                  onError={(event) => {
                    (event.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <p className="mt-4 max-w-[280px] text-[13px] leading-relaxed text-white/60">
                Electronics retailer in Pretoria. Delivered nationwide.
              </p>

              <div className="mt-4 space-y-2 text-[13px] text-white/70">
                <a href="tel:0870881483" className="flex items-center gap-2 transition-colors hover:text-white">
                  <Phone className="h-[14px] w-[14px] text-white/40" aria-hidden="true" /> 0870 881 483
                </a>
                <a href="mailto:sales@spetonline.co.za" className="flex items-center gap-2 transition-colors hover:text-white">
                  <Mail className="h-[14px] w-[14px] text-white/40" aria-hidden="true" /> sales@spetonline.co.za
                </a>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 transition-colors hover:text-white">
                  <MessageCircle className="h-[14px] w-[14px] text-white/40" aria-hidden="true" /> WhatsApp +27 74 116 4295
                </a>
                <p className="flex items-center gap-2">
                  <Clock className="h-[14px] w-[14px] text-white/40" aria-hidden="true" /> Mon–Fri 08:00–17:00
                </p>
              </div>

              <div className="mt-4 flex gap-2.5">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="SPET Online on Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-spet-blue hover:text-white"
                >
                  <Facebook className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="SPET Online on Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-spet-blue hover:text-white"
                >
                  <Instagram className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chat with SPET Online on WhatsApp"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-green-600 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Shop */}
            <nav aria-label="Shop links">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/70">Shop</h3>
              <ul className="mt-3 space-y-2 text-[13px] text-white/70">
                {SHOP_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Support */}
            <nav aria-label="Support links">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/70">Support</h3>
              <ul className="mt-3 space-y-2 text-[13px] text-white/70">
                <li>
                  <button type="button" onClick={() => setLegalDoc('faq' as LegalKey)} className="transition-colors hover:text-white">
                    Delivery and FAQ
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setLegalDoc('returns' as LegalKey)} className="transition-colors hover:text-white">
                    Returns
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setLegalDoc('warranty' as LegalKey)} className="transition-colors hover:text-white">
                    Warranty
                  </button>
                </li>
                <li>
                  <Link to="/account" className="transition-colors hover:text-white">Track order</Link>
                </li>
                <li>
                  <Link to="/contact" className="transition-colors hover:text-white">Contact us</Link>
                </li>
                <li>
                  <button
                    type="button"
                    data-engagement-open
                    onClick={() => openPanel('feedback')}
                    className="inline-flex items-center gap-1.5 text-white transition-colors hover:text-spet-orange"
                  >
                    Share feedback <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              </ul>
            </nav>

            {/* Company */}
            <nav aria-label="Company links">
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/70">Company</h3>
              <ul className="mt-3 space-y-2 text-[13px] text-white/70">
                <li><Link to="/contact" className="transition-colors hover:text-white">Contact</Link></li>
                <li><Link to="/b2b" className="transition-colors hover:text-white">Business &amp; schools</Link></li>
                <li><Link to="/enterprise/apple" className="transition-colors hover:text-white">Apple portal</Link></li>
                <li><Link to="/account" className="transition-colors hover:text-white">Account</Link></li>
              </ul>
            </nav>

            {/* Delivery */}
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/70">Delivery</h3>
              <ul className="mt-3 space-y-2 text-[13px] text-white/70">
                {DELIVERY_FACTS.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Payments + legal */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[12px] text-white/70">Secure payments</span>
              {PAYMENT_LOGOS.map((logo) => (
                <span key={logo.alt} className="flex h-8 items-center justify-center rounded bg-white px-2.5">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="h-4 w-auto object-contain"
                    loading="lazy"
                    onError={(event) => {
                      (event.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </span>
              ))}
            </div>

            <p className="text-[12px] text-white/70">
              © {new Date().getFullYear()} Sekkati Petroleum Energy and Technology (Pty) Ltd, trading as SPET Online.
            </p>

            <div className="flex flex-wrap gap-4">
              {legalLinks.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLegalDoc(key)}
                  className="text-[12px] text-white/50 transition-colors hover:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-5 left-5 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-spet-line bg-spet-surface text-spet-ink shadow-lg transition-colors hover:bg-spet-surface-2"
          aria-label="Scroll to top"
        >
          <ArrowRight className="h-4 w-4 -rotate-90" aria-hidden="true" />
        </button>
      )}
    </>
  );
}
