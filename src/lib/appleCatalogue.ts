// Storefront access to the Apple catalogue. Goes through a server function, which returns
// customer-safe columns only, so never query core_products directly from the browser.

const ENDPOINT = '/.netlify/functions/apple-catalogue'

export const APPLE_DELIVERY_NOTE = 'Delivery in 3 to 14 days, pending stock availability. If an item isn\'t available, we\'ll email you and you can cancel for a 100% refund.'
// Core's price list requires this qualification on quotes to customers.
export const APPLE_QUOTE_TERMS = 'Prices remain subject to change up to delivery, and the price payable is the list price on the date of delivery. E&OE.'

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
