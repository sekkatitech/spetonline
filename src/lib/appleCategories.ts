// Navigation entries for the Apple range. Each key is a `category_main` value in
// the catalogue, so the tab counts and the shop filter always agree.

export interface AppleCategoryNav {
  key: string
  label: string
  /** Shown above the product grid for that range. */
  tagline: string
}

export const APPLE_CATEGORIES: AppleCategoryNav[] = [
  { key: 'Mac', label: 'Mac', tagline: 'Supercharged for what’s next.' },
  { key: 'iPhone', label: 'iPhone', tagline: 'Built for Apple Intelligence.' },
  { key: 'iPad', label: 'iPad', tagline: 'Loveable. Drawable. Magical.' },
  { key: 'Watch', label: 'Apple Watch', tagline: 'The ultimate device for a healthier life.' },
  { key: 'AirPods', label: 'AirPods', tagline: 'Wireless audio. Perfected.' },
  { key: 'Accessories', label: 'Accessories', tagline: 'Everything you need to do more.' },
  { key: 'HomePod', label: 'HomePod', tagline: 'Profound sound. Smart home control.' },
  { key: 'HomeView', label: 'HomeView', tagline: 'Welcome, Apple HomeView.' },
  { key: 'Apple TV', label: 'Apple TV', tagline: 'Your TV experience, elevated.' },
]

/** Ranges that arrive with pre-order restrictions in the catalogue feed. */
export const DEFAULT_APPLE_CATEGORY = 'Mac'

export function appleCategoryNav(key: string | null | undefined): AppleCategoryNav {
  return APPLE_CATEGORIES.find((category) => key && category.key === key) ?? APPLE_CATEGORIES[0]
}
