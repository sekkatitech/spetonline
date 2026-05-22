import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  sku: string;
  qty: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (product_id: string) => void;
  updateQty: (product_id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.product_id === item.product_id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product_id === item.product_id ? { ...i, qty: i.qty + 1 } : i
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, { ...item, qty: 1 }] }));
        }
      },

      removeItem: (product_id) => {
        set((state) => ({ items: state.items.filter((i) => i.product_id !== product_id) }));
      },

      updateQty: (product_id, qty) => {
        if (qty <= 0) {
          get().removeItem(product_id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.product_id === product_id ? { ...i, qty } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: 'spet-cart' }
  )
);
