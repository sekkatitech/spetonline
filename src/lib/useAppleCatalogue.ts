// Loads the Apple catalogue with a cache, so moving between a product and its
// siblings doesn't refetch a category, and so the catalogue can tell a failed
// request apart from a genuinely empty result.

import { useCallback, useEffect, useState } from 'react'
import { fetchAppleCounts, fetchAppleProduct, fetchAppleProducts, fetchAppleSearch } from './appleCatalogue'
import type { AppleLoadStatus, AppleProduct, AppleProductDetail } from './appleTypes'

interface ListState {
  products: AppleProduct[]
  status: AppleLoadStatus
  error: string | null
}

interface DetailState {
  product: AppleProductDetail | null
  related: AppleProduct[]
  status: AppleLoadStatus
  error: string | null
}

const LOAD_ERROR = 'We couldn’t load the Apple range. Please try again.'

interface SearchState {
  products: AppleProduct[]
  total: number
  status: AppleLoadStatus
  error: string | null
}

const listData = new Map<string, AppleProduct[]>()
const listPending = new Map<string, Promise<AppleProduct[]>>()
const detailData = new Map<string, { product: AppleProductDetail; related: AppleProduct[] }>()
const searchData = new Map<string, { products: AppleProduct[]; total: number }>()
const searchPending = new Map<string, Promise<{ products: AppleProduct[]; total: number }>>()
let countsData: Record<string, number> | null = null
let countsPending: Promise<Record<string, number>> | null = null

/** Short terms are noise and the function ignores them, so they never leave the browser. */
const MIN_SEARCH_LENGTH = 2
const searchKey = (term: string, limit: number) => `${term.trim().toLowerCase()}|${limit}`

function loadList(category: string): Promise<AppleProduct[]> {
  const cached = listData.get(category)
  if (cached) return Promise.resolve(cached)

  const pending = listPending.get(category)
  if (pending) return pending

  const request = fetchAppleProducts<AppleProduct>(category)
    .then((products) => {
      listData.set(category, products)
      return products
    })
    .finally(() => listPending.delete(category))

  listPending.set(category, request)
  return request
}

function loadSearch(term: string, limit: number): Promise<{ products: AppleProduct[]; total: number }> {
  const key = searchKey(term, limit)
  const cached = searchData.get(key)
  if (cached) return Promise.resolve(cached)

  const pending = searchPending.get(key)
  if (pending) return pending

  const request = fetchAppleSearch(term, limit)
    .then((result) => {
      searchData.set(key, result)
      return result
    })
    .finally(() => searchPending.delete(key))

  searchPending.set(key, request)
  return request
}

function loadCounts(): Promise<Record<string, number>> {
  if (countsData) return Promise.resolve(countsData)
  if (countsPending) return countsPending

  countsPending = fetchAppleCounts()
    .then((counts) => {
      countsData = counts
      return counts
    })
    .finally(() => { countsPending = null })

  return countsPending
}

/** Drops every cached response. Used by the retry actions. */
export function refreshAppleCatalogue() {
  listData.clear()
  listPending.clear()
  detailData.clear()
  searchData.clear()
  searchPending.clear()
  countsData = null
  countsPending = null
}

/**
 * The Apple range matching a search term. Results are cached per term so stepping into a
 * product and back doesn't search again.
 */
export function useAppleSearch(term: string, limit = 24) {
  const query = term.trim()
  const usable = query.length >= MIN_SEARCH_LENGTH

  const [state, setState] = useState<SearchState>(() => {
    if (!usable) return { products: [], total: 0, status: 'ready', error: null }
    const cached = searchData.get(searchKey(query, limit))
    return cached
      ? { products: cached.products, total: cached.total, status: 'ready', error: null }
      : { products: [], total: 0, status: 'loading', error: null }
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!usable) {
      setState({ products: [], total: 0, status: 'ready', error: null })
      return
    }

    const cached = searchData.get(searchKey(query, limit))
    if (cached) {
      setState({ products: cached.products, total: cached.total, status: 'ready', error: null })
      return
    }

    let cancelled = false
    setState({ products: [], total: 0, status: 'loading', error: null })

    loadSearch(query, limit)
      .then((result) => {
        if (!cancelled) setState({ products: result.products, total: result.total, status: 'ready', error: null })
      })
      .catch(() => {
        if (!cancelled) setState({ products: [], total: 0, status: 'error', error: LOAD_ERROR })
      })

    return () => { cancelled = true }
  }, [query, limit, usable, attempt])

  const retry = useCallback(() => {
    searchData.delete(searchKey(query, limit))
    searchPending.delete(searchKey(query, limit))
    setAttempt((value) => value + 1)
  }, [query, limit])

  return { ...state, retry }
}

export function useAppleList(category: string | null) {
  const [state, setState] = useState<ListState>(() => {
    if (!category) return { products: [], status: 'ready', error: null }
    const cached = listData.get(category)
    return cached
      ? { products: cached, status: 'ready', error: null }
      : { products: [], status: 'loading', error: null }
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!category) {
      setState({ products: [], status: 'ready', error: null })
      return
    }

    const cached = listData.get(category)
    if (cached) {
      setState({ products: cached, status: 'ready', error: null })
      return
    }

    let cancelled = false
    setState({ products: [], status: 'loading', error: null })

    loadList(category)
      .then((products) => {
        if (!cancelled) setState({ products, status: 'ready', error: null })
      })
      .catch(() => {
        if (!cancelled) setState({ products: [], status: 'error', error: LOAD_ERROR })
      })

    return () => { cancelled = true }
  }, [category, attempt])

  const retry = useCallback(() => {
    if (category) listData.delete(category)
    listPending.delete(category ?? '')
    setAttempt((value) => value + 1)
  }, [category])

  return { ...state, retry }
}

export function useAppleDetail(id: string | undefined) {
  const [state, setState] = useState<DetailState>(() => {
    const cached = id ? detailData.get(id) : undefined
    return cached
      ? { product: cached.product, related: cached.related, status: 'ready', error: null }
      : { product: null, related: [], status: id ? 'loading' : 'missing', error: null }
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!id) {
      setState({ product: null, related: [], status: 'missing', error: null })
      return
    }

    const cached = detailData.get(id)
    if (cached) {
      setState({ product: cached.product, related: cached.related, status: 'ready', error: null })
      return
    }

    let cancelled = false
    setState({ product: null, related: [], status: 'loading', error: null })

    fetchAppleProduct<AppleProductDetail>(id)
      .then(({ product, related }) => {
        detailData.set(id, { product, related })
        if (!cancelled) setState({ product, related, status: 'ready', error: null })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const status = errorStatus(error)
        setState({
          product: null,
          related: [],
          status: status === 404 ? 'missing' : 'error',
          error: status === 404 ? null : LOAD_ERROR,
        })
      })

    return () => { cancelled = true }
  }, [id, attempt])

  const retry = useCallback(() => {
    if (id) detailData.delete(id)
    setAttempt((value) => value + 1)
  }, [id])

  return { ...state, retry }
}

export function useAppleCounts() {
  const [counts, setCounts] = useState<Record<string, number>>(countsData ?? {})

  useEffect(() => {
    let cancelled = false
    loadCounts()
      .then((next) => { if (!cancelled) setCounts(next) })
      .catch(() => { /* counts only decorate the tabs; a failure must not break the page */ })
    return () => { cancelled = true }
  }, [])

  return counts
}

function errorStatus(error: unknown): number | null {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: unknown }).status
    return typeof status === 'number' ? status : null
  }
  return null
}
