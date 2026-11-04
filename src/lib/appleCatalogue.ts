// Storefront access to the Apple catalogue. Goes through a server function, which returns
// customer-safe columns only, so never query core_products directly from the browser.

const ENDPOINT = '/.netlify/functions/apple-catalogue'

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
