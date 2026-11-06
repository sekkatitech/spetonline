import { useEffect, useState } from 'react'

/**
 * The value, once it has stopped changing for `delay` milliseconds. Used where a keystroke
 * would otherwise become a request — the Apple search hits the catalogue function, so typing
 * "macbook air" should cost one search, not eleven.
 */
export function useDebounced<T>(value: T, delay = 300): T {
  const [settled, setSettled] = useState(value)

  useEffect(() => {
    if (value === settled) return
    const timer = window.setTimeout(() => setSettled(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay, settled])

  return settled
}
