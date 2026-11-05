// Storefront access to the Apple catalogue. Goes through a server function, which returns
// customer-safe columns only, so never query core_products directly from the browser.

const ENDPOINT = '/.netlify/functions/apple-catalogue'

export const APPLE_DELIVERY_NOTE = 'Delivery in 3 to 14 days, pending stock availability. If an item isn\'t available, we\'ll email you and you can cancel for a 100% refund.'
export const APPLE_QUOTE_ONLY_NOTE = 'MacBook Pro with PROLED XDR Display, Apple HomeView and HomePod can only be pre-ordered by quote for now. Please remove them from your cart, then press Pre-order on the product.'
// These ranges are pre-order by quote for now, with no online payment.
// netlify/functions/create-order.js, send-order-email.js and apple-quote.js use the same tests.
const APPLE_PREORDER_RANGES: Array<[RegExp, string]> = [
  [/PROLED/i, 'MacBook Pro with PROLED XDR Display'],
  [/HOMEVIEW/i, 'Apple HomeView'],
  [/HOMEPOD/i, 'HomePod'],
]
export const isApplePreorder = (name?: string | null) => APPLE_PREORDER_RANGES.some(([test]) => test.test(name || ''))
const applePreorderNote = (names: string[]) => {
  const ranges = APPLE_PREORDER_RANGES.filter(([test]) => names.some(n => test.test(n))).map(([, label]) => label).join(' and ')
  return `Pre-order by quote (${ranges}): not in stock yet, so you'll need to wait for delivery. You don't pay anything now. We'll email you to confirm the delivery date and price when we have them, and you can cancel for a 100% refund before delivery.`
}
// The delivery wording for a set of Apple products, by product name.
export const appleDeliveryNotes = (names: string[]) => [
  ...(names.some(n => !isApplePreorder(n)) ? [APPLE_DELIVERY_NOTE] : []),
  ...(names.some(isApplePreorder) ? [applePreorderNote(names)] : []),
]
// Core's price list requires this qualification on quotes to customers.
export const APPLE_QUOTE_TERMS = 'Prices remain subject to change up to delivery, and the price payable is the list price on the date of delivery. E&OE.'

// A stored full description holds the selling text, then optional "Please note" and "Legal" sections.
export function parseAppleDescription(full: string | null) {
  const lines = (text: string) => text.split('\n').map(l => l.trim()).filter(Boolean)
  const [beforeLegal, legal = ''] = (full || '').split(/\n+Legal\n+/)
  const [body, notes = ''] = beforeLegal.split(/\n+Please note\n+/)
  return { body: body.trim(), notes: lines(notes), legal: lines(legal) }
}

export interface AppleQuoteRequest {
  accessToken: string
  items: Array<{ product_id: string; qty: number }>
  contactName: string
  contactPhone: string
  organisation: string
  notes: string
}

export async function submitAppleQuote(request: AppleQuoteRequest): Promise<{ reference: string; customerEmailed: boolean }> {
  const response = await fetch('/.netlify/functions/apple-quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok || !result?.reference) {
    throw new Error(result?.error || 'We couldn\'t save your quote. Please try again.')
  }
  return { reference: result.reference, customerEmailed: result.customerEmailed === true }
}

async function request<T>(query: string): Promise<T> {
  const response = await fetch(`${ENDPOINT}?${query}`)
  if (!response.ok) throw new Error(`Apple catalogue request failed: ${response.status}`)
  return response.json() as Promise<T>
}

export const fetchAppleCounts = () =>
  request<{ counts: Record<string, number> }>('counts=1').then((r) => r.counts)

export const fetchAppleProducts = <T>(category: string) =>
  request<{ products: T[] }>(`category=${encodeURIComponent(category)}`).then((r) => r.products)

export const fetchAppleProduct = <T>(id: string) =>
  request<{ product: T; related: T[] }>(`id=${encodeURIComponent(id)}`)
