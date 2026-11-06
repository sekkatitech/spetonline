import { useNavigate } from 'react-router-dom';
import { canUseApple, withAppleReturn } from './appleAccess';
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

/** Buy and Quote send anyone without an enterprise account to the business form, then back to the product. */
export function useAppleBuying() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  const signedIn = (productId: string) => {
    if (loading || (user && !profile)) return false;
    if (canUseApple(profile)) return true;
    const returnPath = `/enterprise/apple/${productId}`;
    // A suspended account already has a login, and the login page explains the suspension.
    const page = profile?.enterprise_status === 'suspended' ? '/enterprise/login' : '/enterprise/register';
    navigate(withAppleReturn(page, returnPath));
    return false;
  };

  const buy = (product: AppleBuyable, qty = 1) => {
    if (!signedIn(product.id)) return;
    // Adds to the quantity already in the cart, the same way every other
    // supplier's add-to-cart works — buying a second one shouldn't overwrite it.
    useCartStore.getState().addItem({
      id: product.id,
      product_id: product.id,
      name: productName(product),
      brand: 'Apple',
      price: Number(product.price_display),
      image: productImage(product) ?? '',
      sku: product.sku,
      supplier: 'apple',
    }, qty);
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
