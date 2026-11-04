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
  supplier: 'esquire' | 'syntech' | 'axiz' | 'pinnacle' | 'apple';  // ← tells server which table to verify price in
}

/** The order last sent to PayFast, kept until it is paid so a retry can reuse its promo. */
export interface PendingOrder {
  id: string;
  promoDiscount: number;
  promoCode: string | null;
  promoId: string | null;
}

interface CartStore {
  items: CartItem[];
  pendingOrder: PendingOrder | null;
  setPendingOrder: (order: PendingOrder) => void;
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
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
      pendingOrder: null,

      setPendingOrder: (order) => set({ pendingOrder: order }),

      addItem: (item, qty = 1) => {
        const quantity = Math.max(1, Math.floor(qty) || 1);
        const existing = get().items.find((i) => i.product_id === item.product_id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product_id === item.product_id ? { ...i, qty: i.qty + quantity } : i
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, { ...item, qty: quantity }] }));
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

      clearCart: () => set({ items: [], pendingOrder: null }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: 'spet-cart' }
  )
);