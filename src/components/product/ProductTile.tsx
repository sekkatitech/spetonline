import { useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Check, Heart, ShoppingCart } from 'lucide-react';
import type { Product } from '../../lib/api';
import { useCartStore } from '../../lib/cartStore';
import { formatPrice, formatRand, toCartPayload, toProductView, type ProductSupplier } from '../../lib/productDisplay';
import { SafeImage } from '../SafeImage';
import { useWishlistState } from '../WishlistProvider';

interface ProductTileProps {
  product: Product;
  /** `grid` is the shelf tile; `row` is the compact deals card. */
  variant?: 'grid' | 'row';
  buttonStyle?: 'solid' | 'outline';
  supplier?: ProductSupplier;
}

export function ProductTile({ product, variant = 'grid', buttonStyle = 'solid', supplier = 'esquire' }: ProductTileProps) {
  const view = toProductView(product, supplier);
  const addItem = useCartStore((state) => state.addItem);
  const wishlist = useWishlistState();
  const [added, setAdded] = useState(false);

  const inWishlist = wishlist?.ids.includes(view.id) ?? false;

  function handleAddToCart(event: MouseEvent) {
    event.preventDefault();
    addItem(toCartPayload(view));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  function handleWishlist(event: MouseEvent) {
    event.preventDefault();
    wishlist?.toggle(view.id);
  }

  const wishlistButton = wishlist ? (
    <button
      type="button"
      onClick={handleWishlist}
      aria-label={inWishlist ? `Remove ${view.name} from wishlist` : `Add ${view.name} to wishlist`}
      aria-pressed={inWishlist}
      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-spet-line bg-spet-surface text-spet-muted transition-colors after:absolute after:-inset-1.5 hover:border-spet-orange hover:text-spet-orange"
    >
      <Heart className={`h-[15px] w-[15px] ${inWishlist ? 'fill-spet-orange text-spet-orange' : ''}`} aria-hidden="true" />
    </button>
  ) : null;

  const priceBlock = (
    <>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className={`font-semibold tabular-nums text-spet-ink ${view.price > 0 ? 'text-[19px]' : 'text-[14px]'}`}>{formatPrice(view.price)}</span>
        {view.wasPrice && (
          <span className="text-[12px] tabular-nums text-spet-was line-through">{formatRand(view.wasPrice)}</span>
        )}
      </div>
      <p
        aria-hidden={!view.saving}
        className={`text-[12px] font-semibold text-spet-orange ${view.saving ? '' : 'invisible'}`}
      >
        {view.saving ? `Save ${formatRand(view.saving)}` : 'No saving'}
      </p>
    </>
  );

  const stockLabel = (
    <span className={`flex items-center gap-1.5 text-[11px] ${view.inStock ? 'text-spet-stock' : 'text-spet-muted'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${view.inStock ? 'bg-spet-stock' : 'bg-spet-muted'}`} aria-hidden="true" />
      {view.inStock ? 'In stock' : 'Out of stock'}
    </span>
  );

  if (variant === 'row') {
    return (
      <article className="group flex gap-3 rounded-xl border border-spet-line bg-spet-surface p-3 transition-colors hover:border-spet-blue">
        <Link
          to={view.href}
          className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-lg bg-white p-2"
          aria-label={view.name}
        >
          <SafeImage
            src={view.image}
            brand={view.brand}
            alt={view.name}
            className="max-h-[72px] max-w-full object-contain"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-1.5">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-spet-muted">{view.brand}</p>
            {stockLabel}
          </div>

          <Link
            to={view.href}
            className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-spet-ink transition-colors group-hover:text-spet-blue"
          >
            {view.name}
          </Link>

          <div className="mt-auto flex items-end justify-between gap-2 pt-2">
            <div>
              <p className="text-[15px] font-semibold leading-none tabular-nums text-spet-ink">{formatPrice(view.price)}</p>
              {view.wasPrice && view.saving && (
                <p className="mt-1 text-[11px] tabular-nums text-spet-was">
                  <span className="line-through">{formatRand(view.wasPrice)}</span>{' '}
                  <span className="font-semibold text-spet-orange">Save {formatRand(view.saving)}</span>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!view.inStock}
              aria-label={`Add ${view.name} to cart`}
              className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-spet-blue text-white transition-colors after:absolute after:-inset-1.5 hover:bg-spet-blue-dark disabled:cursor-not-allowed disabled:bg-spet-line disabled:text-spet-muted"
            >
              {added ? <Check className="h-[14px] w-[14px]" aria-hidden="true" /> : <ShoppingCart className="h-[14px] w-[14px]" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col p-3 md:p-5">
      <div className="relative">
        <Link
          to={view.href}
          className="flex h-[112px] items-center justify-center rounded-xl border border-spet-line bg-white p-3 transition-colors group-hover:border-spet-blue md:h-[156px] md:p-4"
          aria-label={view.name}
        >
          <SafeImage
            src={view.image}
            brand={view.brand}
            alt={view.name}
            className="max-h-[86px] max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03] md:max-h-[124px]"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </Link>
        {wishlistButton}
      </div>

      <p className="mt-3 truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-spet-muted md:mt-4 md:text-[11px]">{view.brand}</p>

      <Link
        to={view.href}
        className="mt-1 line-clamp-2 min-h-[34px] text-[13px] font-medium leading-snug text-spet-ink transition-colors hover:text-spet-blue md:min-h-[40px] md:text-[14px]"
      >
        {view.name}
      </Link>

      <div className="mt-2">
        {priceBlock}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {stockLabel}
          {view.note && <span className="text-[11px] font-medium text-spet-ink-2">{view.note}</span>}
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!view.inStock}
        className={`mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-lg text-[12px] font-semibold transition-colors md:gap-2 md:text-[13px] disabled:cursor-not-allowed disabled:border-spet-line disabled:bg-spet-surface-2 disabled:text-spet-muted ${
          buttonStyle === 'outline'
            ? 'border border-spet-blue text-spet-blue hover:bg-spet-blue hover:text-white'
            : 'bg-spet-blue text-white hover:bg-spet-blue-dark'
        }`}
      >
        {added ? <Check className="h-[15px] w-[15px]" aria-hidden="true" /> : <ShoppingCart className="h-[15px] w-[15px]" aria-hidden="true" />}
        {added ? 'Added to cart' : view.inStock ? 'Add to cart' : 'Out of stock'}
      </button>
    </article>
  );
}

export function ProductTileSkeleton({ variant = 'grid' }: { variant?: 'grid' | 'row' }) {
  if (variant === 'row') {
    return (
      <div className="flex animate-pulse gap-3 rounded-xl border border-spet-line bg-spet-surface p-3">
        <div className="h-[88px] w-[88px] shrink-0 rounded-lg bg-spet-surface-2" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 w-1/3 rounded bg-spet-surface-2" />
          <div className="h-3.5 w-full rounded bg-spet-surface-2" />
          <div className="h-4 w-1/2 rounded bg-spet-surface-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse p-4 md:p-5">
      <div className="h-[140px] rounded-xl bg-spet-surface-2 md:h-[156px]" />
      <div className="mt-4 h-2.5 w-1/3 rounded bg-spet-surface-2" />
      <div className="mt-3 h-4 w-full rounded bg-spet-surface-2" />
      <div className="mt-2 h-4 w-3/4 rounded bg-spet-surface-2" />
      <div className="mt-4 h-5 w-1/3 rounded bg-spet-surface-2" />
      <div className="mt-4 h-10 w-full rounded-lg bg-spet-surface-2" />
    </div>
  );
}
