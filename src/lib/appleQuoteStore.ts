import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppleQuoteItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  image: string | null;
  qty: number;
}

export const MAX_QUOTE_QTY = 999;

interface AppleQuoteStore {
  items: AppleQuoteItem[];
  addItem: (item: Omit<AppleQuoteItem, 'qty'>, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

/** Saved in the browser so the basket survives page changes and logging in. */
export const useAppleQuoteStore = create<AppleQuoteStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, qty = 1) => set((state) => {
        const existing = state.items.find((i) => i.id === item.id);
        if (!existing) return { items: [...state.items, { ...item, qty }] };
        return {
          items: state.items.map((i) => (
            i.id === item.id ? { ...i, qty: Math.min(MAX_QUOTE_QTY, i.qty + qty) } : i
          )),
        };
      }),

      setQty: (id, qty) => set((state) => ({
        items: state.items.map((i) => (
          i.id === id ? { ...i, qty: Math.min(MAX_QUOTE_QTY, Math.max(1, qty)) } : i
        )),
      })),

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      clear: () => set({ items: [] }),
    }),
    { name: 'spet-apple-quote' }
  )
);
