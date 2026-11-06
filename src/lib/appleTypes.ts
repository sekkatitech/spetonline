// Shared shapes for the Apple range. The catalogue arrives through the
// apple-catalogue server function, which only returns customer-safe columns.

export interface AppleProduct {
  id: string
  sku: string
  name: string
  category_main: string
  category_sub: string
  rrp_inc_vat: number
  price_display: number
  /** Only `while_stocks_last` is customer-facing; everything else arrives as 'active'. */
  status: string
  specs: Record<string, string> | null
  thumbnail_url: string | null
  image_urls: string[] | null
}

export interface AppleProductDetail extends AppleProduct {
  short_description: string | null
  full_description: string | null
  weight_kg: number | null
}

/** `missing` means the row genuinely isn't in the range; `error` means the request failed. */
export type AppleLoadStatus = 'loading' | 'ready' | 'error' | 'missing'

export const isWhileStocksLast = (product: Pick<AppleProduct, 'status'>) =>
  product.status === 'while_stocks_last'

/** Apple sells these with delivery pending stock, so the only customer-facing state is the range flag. */
export const appleAvailability = (product: Pick<AppleProduct, 'status'>): string | null =>
  isWhileStocksLast(product) ? 'While stocks last' : null

export const appleImage = (
  product: Pick<AppleProduct, 'thumbnail_url' | 'image_urls'>
): string | null => product.thumbnail_url || product.image_urls?.[0] || null

/** Every distinct image for the product, hero first. */
export function appleGallery(product: Pick<AppleProduct, 'thumbnail_url' | 'image_urls'> | null): string[] {
  if (!product) return []
  const urls = [
    ...(product.image_urls ?? []),
    ...(product.thumbnail_url ? [product.thumbnail_url] : []),
  ].filter((url): url is string => Boolean(url))
  return [...new Set(urls)]
}
