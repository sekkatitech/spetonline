import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useCartStore } from './cartStore';
import { useAppleQuoteStore } from './appleQuoteStore';

export interface AppleBuyable {
  id: string;
  sku: string;
  name: string;
  price_display: number;
  thumbnail_url: string | null;
  image_urls: string[] | null;
}

const productImage = (p: AppleBuyable) => p.thumbnail_url || p.image_urls?.[0] || null;
const productName = (p: AppleBuyable) => p.name.replace(/\s+/g, ' ').trim();

/** Buy and Quote ask for login first, then return the customer to the product. */
export function useAppleBuying() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const signedIn = (productId: string) => {
    if (user) return true;
    if (!loading) navigate(`/auth?redirect=${encodeURIComponent(`/enterprise/apple/${productId}`)}`);
    return false;
  };

  const buy = (product: AppleBuyable, qty = 1) => {
    if (!signedIn(product.id)) return;
    const cart = useCartStore.getState();
    if (cart.items.some((i) => i.product_id === product.id)) {
      cart.updateQty(product.id, qty);
    } else {
      cart.addItem({
        id: product.id,
        product_id: product.id,
        name: productName(product),
        brand: 'Apple',
        price: Number(product.price_display),
        image: productImage(product) ?? '',
        sku: product.sku,
        supplier: 'apple',
      }, qty);
    }
    navigate('/checkout');
  };

  const addToQuote = (product: AppleBuyable, qty = 1) => {
    if (!signedIn(product.id)) return false;
    useAppleQuoteStore.getState().addItem({
      id: product.id,
      sku: product.sku,
      name: productName(product),
      price: Number(product.price_display),
      image: productImage(product),
    }, qty);
    return true;
  };

  return { buy, addToQuote };
}
