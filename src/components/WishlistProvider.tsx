import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useWishlist } from '../lib/api';

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
}

const WishlistContext = createContext<WishlistState | null>(null);

/**
 * One wishlist query shared by every product tile on a page.
 * Cards used to call useWishlist() individually, which meant one Supabase
 * request per card on catalogue pages.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist(user?.id ?? null);

  return (
    <WishlistContext.Provider value={{ ids: wishlist, toggle: toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistState(): WishlistState | null {
  return useContext(WishlistContext);
}
