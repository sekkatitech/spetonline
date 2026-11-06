// Swatch colours for the finishes in the Apple feed. A colour that isn't listed
// still appears in the filter; it just uses the neutral fallback swatch.

export const APPLE_COLOUR_HEX: Record<string, string> = {
  black: '#1d1d1f',
  'space black': '#2e2f31',
  midnight: '#2e3033',
  midnightblack: '#2b2d30',
  'space grey': '#8a8a8f',
  'space gray': '#8e8e93',
  'space grey titanium': '#8e8e93',
  silver: '#e3e4e5',
  starlight: '#efe5d5',
  'star white': '#f1efe9',
  'star light': '#f2e8d9',
  white: '#f5f5f7',
  gold: '#c8a97e',
  blue: '#4a90d9',
  'deep blue': '#2b3f6b',
  'sky blue': '#87ceeb',
  ultramarine: '#4b61d1',
  teal: '#4f7c82',
  green: '#3e7c57',
  sage: '#b6c2b1',
  'sage green': '#4e6f5a',
  yellow: '#f5d547',
  orange: '#e07a35',
  'cosmic orange': '#c96a2b',
  pink: '#f2a7c3',
  'rose pink': '#e8b4b8',
  purple: '#7b5ea7',
  lavender: '#c9bcdf',
  red: '#c41230',
  burgundy: '#6d1f2c',
  glacier: '#c9d4d8',
  'natural titanium': '#c4b9a8',
  'black titanium': '#3a3a3c',
  'white titanium': '#e5e5e7',
  'desert titanium': '#d4b896',
  'blue titanium': '#5c6b7a',
}

export function colourHex(name: string): string {
  return APPLE_COLOUR_HEX[name.trim().toLowerCase()] ?? '#c7c7cc'
}
