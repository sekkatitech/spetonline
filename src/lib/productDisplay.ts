import type { Product } from './api';
import type { CartItem } from './cartStore';

export type ProductSupplier = 'esquire' | 'syntech' | 'axiz' | 'pinnacle';

/**
 * Normalised, display-ready view of a catalogue product.
 *
 * The catalogue mixes fields from different suppliers (Esquire rows use
 * `ProductName`/`Price`, Syntech rows use `name`/`price_display`), so this
 * helper is the single place that decides what the storefront shows.
 */
export interface ProductView {
  id: string;
  name: string;
  brand: string;
  image: string | null;
  price: number;
  /** Only present when a genuine higher reference price exists. */
  wasPrice: number | null;
  saving: number | null;
  inStock: boolean;
  stockQty: number;
  sku: string;
  supplier: ProductSupplier;
  href: string;
  /** Condition or range the shopper should know about before buying. */
  note: 'Unboxed' | 'Clearance' | null;
}

const SUPPLIER_DETAIL_PATH: Record<Exclude<ProductSupplier, 'esquire'>, string> = {
  syntech: '/shop/tech/product',
  axiz: '/shop/axiz/product',
  pinnacle: '/shop/pinnacle/product',
};

export function productHref(supplier: ProductSupplier, id: string, slug?: string | null): string {
  return supplier === 'esquire' ? `/product/${slug || id}` : `${SUPPLIER_DETAIL_PATH[supplier]}/${id}`;
}

export function firstImage(images: unknown): string | null {
  return Array.isArray(images) && typeof images[0] === 'string' ? images[0] : null;
}

export function toProductView(product: Product, supplier: ProductSupplier = 'esquire'): ProductView {
  const name = product.ProductName ?? product.name ?? 'Product';
  const brand = product.Brand ?? product.brand ?? '';
  const image = product.thumbnail_url ?? product.image ?? firstImage(product.images);

  // sale_price only counts on a row flagged as on sale: the feed also holds
  // stale values and zeros on rows that are not.
  const salePrice = product.is_on_sale && product.sale_price ? product.sale_price : null;
  const price = product.price_display ?? salePrice ?? product.Price ?? 0;

  const reference =
    product.price_rrp ??
    ((product.is_on_sale || product.is_clearance) ? product.Price : null);

  const wasPrice = reference && reference > price ? reference : null;

  const stockQty = product.stock_qty ?? product.AvailableQty ?? 0;

  return {
    id: product.id,
    name,
    brand,
    image,
    price,
    wasPrice,
    saving: wasPrice ? wasPrice - price : null,
    inStock: stockQty > 0 && price > 0,
    stockQty,
    sku: product.ProductCode ?? product.sku ?? '',
    supplier,
    href: productHref(supplier, product.id, product.slug),
    note: product.is_unboxed ? 'Unboxed' : product.is_clearance ? 'Clearance' : null,
  };
}

/** ZAR formatting used across the storefront: R13 499 (no cents). */
export function formatRand(value: number): string {
  const rounded = Math.round(value);
  return `R${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
}

/** Shelf price, or a plain label for feed rows that have no price yet. */
export function formatPrice(value: number): string {
  return value > 0 ? formatRand(value) : 'Price unavailable';
}

/** Cart and order totals: keeps cents when a discount or shipping fee produces them. */
export function formatMoney(value: number): string {
  const safe = Number(value) || 0;
  if (Number.isInteger(safe)) return formatRand(safe);
  const [whole, cents] = safe.toFixed(2).split('.');
  return `${formatRand(Number(whole))}.${cents}`;
}

export function toCartPayload(view: ProductView): Omit<CartItem, 'qty'> {
  return {
    id: view.id,
    product_id: view.id,
    name: view.name,
    brand: view.brand,
    price: view.price,
    image: view.image ?? '',
    sku: view.sku,
    supplier: view.supplier,
  };
}
