// Display formatting for the Apple range: product naming, ZAR prices and the
// specification values shown beside a product.
//
// The feed stores names in capitals ("IPHONE 17 PRO MAX"), so the grid used to
// title-case every word and render "Iphone 17 Pro Max". Naming now runs through
// one function that restores Apple's own casing and is shared by the grid, the
// detail page, related products and the quote basket.

import { formatMoney } from './productDisplay'
import type { AppleProduct } from './appleTypes'

/** Words the feed capitalises that Apple writes with specific casing. */
const BRAND_WORDS: Record<string, string> = {
  Iphone: 'iPhone',
  Iphones: 'iPhones',
  Ipad: 'iPad',
  Ipads: 'iPads',
  Ipod: 'iPod',
  Imac: 'iMac',
  Macbook: 'MacBook',
  Macbooks: 'MacBooks',
  Macos: 'macOS',
  Airpods: 'AirPods',
  Homepod: 'HomePod',
  Homeview: 'HomeView',
  Xdr: 'XDR',
  Proled: 'PROLED',
  Se: 'SE',
  Tv: 'TV',
  Usb: 'USB',
  Hdmi: 'HDMI',
  Ssd: 'SSD',
  Hdd: 'HDD',
  Rgb: 'RGB',
  Gpu: 'GPU',
  Cpu: 'CPU',
}

const SMALL_WORDS = new Set(['a', 'an', 'and', 'for', 'of', 'the', 'to', 'with'])

function titleCase(value: string): string {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word, index) => {
      const lower = word.toLowerCase()
      if (index > 0 && SMALL_WORDS.has(lower)) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join(' ')
}

/** Restores Apple's casing on a name the feed stored in capitals. */
function applyBrandCasing(value: string): string {
  let out = value.replace(/\bWi[- ]?Fi\b/gi, 'Wi-Fi')
  out = out.replace(/\bMac Mini\b/g, 'Mac mini')
  for (const [from, to] of Object.entries(BRAND_WORDS)) {
    out = out.replace(new RegExp(`\\b${from}\\b`, 'g'), to)
  }
  // 16gb → 16GB, 1tb → 1TB
  return out.replace(/(\d+)\s?(gb|tb|mb)\b/gi, (_, size: string, unit: string) => `${size}${unit.toUpperCase()}`)
}

/**
 * The name to show for a product. Collapses whitespace, drops the trailing
 * market code ("- ZA") and fixes casing without touching numbers or sizes.
 */
export function formatAppleName(raw: string | null | undefined): string {
  if (!raw) return 'Apple product'

  let name = raw.replace(/\s+/g, ' ').trim()
  name = name.replace(/\s*[-–|]\s*[A-Z]{2}$/, '')

  const letters = name.replace(/[^A-Za-z]/g, '')
  const shouty = letters.length > 0 && letters === letters.toUpperCase()
  if (shouty) name = titleCase(name)

  return applyBrandCasing(name)
}

/** Display label for a `category_sub` value, e.g. "Iphone 18 pro max" → "iPhone 18 Pro Max". */
export function formatAppleModel(sub: string | null | undefined): string {
  if (!sub) return ''
  return applyBrandCasing(titleCase(sub.replace(/\s+/g, ' ').trim()))
}

/**
 * The heading form of a name. The feed stores the model plus its whole build in
 * one string ("13-INCH MACBOOK NEO: APPLE A18 PRO CHIP …, 8GB, 256GB SSD - BLUSH"),
 * so headings take the model part and let the chip, memory, storage and colour
 * come from the specification fields instead of repeating them.
 */
export function formatAppleTitle(raw: string | null | undefined): string {
  const full = formatAppleName(raw)
  const cut = full.indexOf(':')
  if (cut === -1) return full
  const head = full.slice(0, cut).trim()
  return head || full
}

/** Prices are VAT-inclusive rand; cents only appear when the price actually has them. */
export function applePrice(value: number): string {
  return value > 0 ? formatMoney(value) : 'Price unavailable'
}

/** Reference price only counts when it is genuinely higher than the price asked. */
export function appleSaving(product: Pick<AppleProduct, 'rrp_inc_vat' | 'price_display'>): number | null {
  const reference = Number(product.rrp_inc_vat) || 0
  const price = Number(product.price_display) || 0
  return reference > price && price > 0 ? reference - price : null
}

const HIGHLIGHT_KEYS = ['chip', 'ram', 'colour', 'screen_size', 'storage'] as const

/** The short specification line for cards and lists. */
export function specHighlights(product: Pick<AppleProduct, 'specs'>, exclude: readonly string[] = []): string[] {
  const specs = product.specs ?? {}
  return HIGHLIGHT_KEYS
    .filter((key) => !exclude.includes(key))
    .map((key) => specs[key])
    .filter((value): value is string => Boolean(value))
    .slice(0, 3)
}

/** Specs in the order they matter to a buyer, with their labels. */
export function specRows(specs: Record<string, string> | null): Array<{ label: string; value: string }> {
  if (!specs) return []
  const order = ['chip', 'ram', 'storage', 'colour', 'screen_size']
  const entries = Object.entries(specs).filter(([, value]) => Boolean(value))
  return entries
    .sort(([a], [b]) => {
      const ai = order.indexOf(a)
      const bi = order.indexOf(b)
      return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi)
    })
    .map(([label, value]) => ({ label: specLabel(label), value }))
}

function specLabel(key: string): string {
  const known: Record<string, string> = {
    chip: 'Chip',
    ram: 'Memory',
    storage: 'Storage',
    colour: 'Colour',
    screen_size: 'Display',
    connectivity: 'Connectivity',
    battery: 'Battery',
  }
  const label = known[key] ?? key.replace(/_/g, ' ')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** 256GB before 1TB regardless of the order the feed returned. */
export function sortStorageValues(values: string[]): string[] {
  const weight = (value: string) => {
    const match = value.match(/(\d+(?:[.,]\d+)?)\s*(TB|GB|MB)/i)
    if (!match) return Number.MAX_SAFE_INTEGER
    const size = Number(match[1].replace(',', '.'))
    const unit = match[2].toUpperCase()
    if (unit === 'TB') return size * 1024
    if (unit === 'GB') return size
    return size / 1024
  }
  return [...new Set(values)].sort((a, b) => weight(a) - weight(b) || a.localeCompare(b))
}

/** Index-safe access to a spec value. */
export const specValue = (product: Pick<AppleProduct, 'specs'>, key: string): string =>
  product.specs?.[key]?.trim() ?? ''
