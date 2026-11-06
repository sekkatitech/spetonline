// Groups the sibling SKUs of one Apple model so the detail page can offer
// colour and storage choices that each resolve to a real, purchasable record.
//
// Every configuration is its own catalogue row, so a selector is only honest if
// the combination it offers actually exists. Nothing here invents a value: a
// choice that has no row is simply not offered.

import type { AppleProduct } from './appleTypes'
import { formatAppleModel, specValue, sortStorageValues } from './appleFormat'
import { normaliseSub } from './appleQuery'

export const VARIANT_ATTRIBUTES = ['colour', 'storage'] as const
export type VariantAttribute = (typeof VARIANT_ATTRIBUTES)[number]

export type VariantSelection = Partial<Record<VariantAttribute, string>>

export interface AppleModelLink {
  sub: string
  label: string
  count: number
  /** Lowest price in that model, or null when none of its rows has a price. */
  minPrice: number | null
}

export interface AppleVariantIndex {
  siblings: AppleProduct[]
  /** Attributes that genuinely differ between siblings and can be switched. */
  dimensions: VariantAttribute[]
  values: Record<VariantAttribute, string[]>
  models: AppleModelLink[]
  hasVariants: boolean
  /** Options still available given the other choice already made. */
  optionsFor: (attribute: VariantAttribute, selection: VariantSelection) => string[]
  /** The real product for a selection, or null when that combination has no row. */
  resolve: (selection: VariantSelection) => AppleProduct | null
  /** Spec keys that differ between otherwise comparable siblings (chip, memory …). */
  dividingSpecs: string[]
}

const same = (a: string | undefined, b: string | undefined) =>
  (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase()

/** The two specs the picker handles itself; everything else must match. */
const HANDLED_KEYS = VARIANT_ATTRIBUTES as readonly string[]

function buildModels(products: AppleProduct[], currentSub: string): AppleModelLink[] {
  const groups = new Map<string, AppleProduct[]>()
  const currentKey = normaliseSub(currentSub)

  for (const product of products) {
    const key = normaliseSub(product.category_sub)
    if (!key || key === currentKey) continue
    groups.set(key, [...(groups.get(key) ?? []), product])
  }

  return [...groups.values()]
    .map((rows) => {
      const prices = rows.map((row) => Number(row.price_display)).filter((price) => price > 0)
      return {
        sub: rows[0].category_sub,
        label: formatAppleModel(rows[0].category_sub),
        count: rows.length,
        minPrice: prices.length ? Math.min(...prices) : null,
      }
    })
    .sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity) || a.label.localeCompare(b.label))
}

/**
 * Builds the picker for `product` from the rest of its category. Returns an
 * index with no dimensions when the model has a single configuration, so the
 * caller can still show the other models in the range.
 */
export function buildVariantIndex(
  product: AppleProduct,
  categoryProducts: AppleProduct[]
): AppleVariantIndex {
  const subKey = normaliseSub(product.category_sub)
  const pool = subKey
    ? categoryProducts.filter((candidate) => normaliseSub(candidate.category_sub) === subKey)
    : []

  const siblings = pool.length > 0 ? pool : [product]

  // Specs that separate one configuration from another (chip, memory, screen).
  // A row can only be swapped for another that matches on all of them.
  const dividingKeys = [...new Set(siblings.flatMap((sibling) => Object.keys(sibling.specs ?? {})))].filter(
    (key) => !(HANDLED_KEYS as readonly string[]).includes(key)
  )
  const dividingSpecs = dividingKeys.filter(
    (key) => new Set(siblings.map((sibling) => specValue(sibling, key))).size > 1
  )


  const family = siblings.filter((candidate) =>
    dividingSpecs.every((key) => same(specValue(candidate, key), specValue(product, key)))
  )
  const comparableRows = family.length > 0 ? family : [product]

  // Only offer colour or storage when this exact build actually ships in more
  // than one, so the picker never shows a single-option "choice".
  const dimensions = VARIANT_ATTRIBUTES.filter((attribute) => {
    if (!specValue(product, attribute)) return false
    return new Set(comparableRows.map((row) => specValue(row, attribute)).filter(Boolean)).size > 1
  })

  const optionsFor = (attribute: VariantAttribute, selection: VariantSelection): string[] => {
    if (!(dimensions as readonly string[]).includes(attribute)) return []

    const rows = comparableRows.filter((candidate) =>
      dimensions.every((dimension) => {
        if (dimension === attribute) return true
        const chosen = selection[dimension]
        return !chosen || same(specValue(candidate, dimension), chosen)
      })
    )

    const values = [...new Set(rows.map((row) => specValue(row, attribute)).filter(Boolean))]
    return attribute === 'storage'
      ? sortStorageValues(values)
      : values.sort((a, b) => a.localeCompare(b))
  }

  const resolve = (selection: VariantSelection): AppleProduct | null => {
    if (dimensions.length === 0) return product

    const wanted: Record<string, string> = {}
    for (const dimension of dimensions) {
      const chosen = selection[dimension] ?? specValue(product, dimension)
      if (!chosen) return null
      wanted[dimension] = chosen
    }

    const matches = comparableRows.filter((candidate) =>
      dimensions.every((dimension) => same(specValue(candidate, dimension), wanted[dimension]))
    )

    return matches.length === 1 ? matches[0] : null
  }

  return {
    siblings,
    dimensions,
    values: {
      colour: optionsFor('colour', {}),
      storage: optionsFor('storage', {}),
    },
    models: buildModels(categoryProducts, product.category_sub),
    hasVariants: dimensions.length > 0,
    optionsFor,
    resolve,
    dividingSpecs,
  }
}
