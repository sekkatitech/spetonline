import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';
import { validatePromoCode } from '../lib/api';
import { SafeImage } from '../components/SafeImage';

const PAYMENT_LOGOS = [
  { src: '/payment-logos/Visa_Brandmark_Blue_RGB_2021.png', alt: 'Visa' },
  { src: '/payment-logos/mastercard_logo.png', alt: 'Mastercard' },
  { src: '/payment-logos/Bob_Pay_Instant_EFT_new.png', alt: 'Bob Pay Instant EFT' },
  { src: '/payment-logos/Capitec pay logo.png', alt: 'Capitec Pay' },
  { src: '/payment-logos/Apple_Pay_Logo_new.png', alt: 'Apple Pay' },
  { src: '/payment-logos/Google Pay.png', alt: 'Google Pay' },
];

export function CartPage() {
  const { items, removeItem, updateQty, subtotal } = useCartStore();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; message: string; discount?: number; promotion?: any } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const sub = Number(subtotal()) || 0;
  const discount = Number(promoResult?.discount) || 0;
  const shipping = sub - discount >= 1500 ? 0 : 150;
  const total = sub - discount + shipping;

  async function applyPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    const result = await validatePromoCode(promoCode.trim(), sub);
    setPromoResult(result);
    setPromoLoading(false);
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-32 md:pt-36 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-lago-50 dark:bg-lago-900 flex items-center justify-center mx-auto mb-6 text-lago-600 dark:text-lago-400">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-black text-gray-900 dark:text-white mb-3">
            Your cart is empty
          </h1>
          <p className="text-gray-500 dark:text-lago-400 mb-8">
            Looks like you haven't added anything to your cart yet. Browse our shop to find the best deals!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-lago-600 hover:bg-lago-500 text-white font-bold transition-colors shadow-lg shadow-lago-900/40"
          >
            Start Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-32 md:pt-36 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-8">
          Shopping Cart <span className="text-lg font-normal text-gray-500 dark:text-lago-400">({items.length} item{items.length !== 1 ? 's' : ''})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product_id} className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-4 md:p-5 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                <Link to={`/product/${item.product_id}`} className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28 bg-gray-50 dark:bg-lago-800 rounded-xl overflow-hidden border border-gray-200 dark:border-lago-700">
                  <SafeImage src={item.image} brand={item.brand} alt={item.name} className="w-full h-full object-contain p-2" />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-lago-500 dark:text-lago-400 uppercase mb-1">{item.brand}</p>
                  <Link to={`/product/${item.product_id}`} className="font-bold text-gray-900 dark:text-white hover:text-lago-600 dark:hover:text-lago-400 transition-colors line-clamp-2 text-sm md:text-base leading-snug">
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-400 dark:text-lago-500 mt-1 mb-3">SKU: {item.sku}</p>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center border border-gray-200 dark:border-lago-700 rounded-xl overflow-hidden">
                      <button onClick={() => updateQty(item.product_id, item.qty - 1)} className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-lago-200 hover:bg-gray-100 dark:hover:bg-lago-800 transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-900 dark:text-white">{item.qty}</span>
                      <button onClick={() => updateQty(item.product_id, item.qty + 1)} className="w-9 h-9 flex items-center justify-center text-gray-600 dark:text-lago-200 hover:bg-gray-100 dark:hover:bg-lago-800 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-gray-900 dark:text-white">
                        R {((Number(item.price) || 0) * (Number(item.qty) || 1)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </p>
                      <button onClick={() => removeItem(item.product_id)} className="text-gray-400 hover:text-red-500 dark:text-lago-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link to="/shop" className="flex items-center gap-2 text-sm font-semibold text-lago-600 dark:text-lago-400 hover:text-lago-800 dark:hover:text-white transition-colors mt-2">
              ← Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-6 shadow-sm sticky top-36">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

              {/* Promo code */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wider mb-2 block">Promo Code</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); }}
                      placeholder="ENTER CODE"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-lago-800 border border-gray-200 dark:border-lago-700 text-gray-900 dark:text-white focus:outline-none focus:border-lago-500 uppercase font-mono tracking-widest"
                    />
                  </div>
                  <button
                    onClick={applyPromo}
                    disabled={promoLoading || !promoCode.trim()}
                    className="px-4 py-2.5 rounded-xl bg-lago-600 text-white text-sm font-bold hover:bg-lago-700 disabled:opacity-50 transition-colors"
                  >
                    {promoLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {promoResult && (
                  <p className={`mt-2 text-xs font-semibold ${promoResult.valid ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                    {promoResult.valid ? '✓ ' : '✗ '}{promoResult.message}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-gray-600 dark:text-lago-200">
                  <span>Subtotal</span>
                  <span className="font-semibold">R {sub.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span className="font-semibold">−R {discount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-lago-200">
                  <span>Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? <span className="text-green-600 dark:text-green-400">FREE</span> : `R ${shipping.toFixed(2)}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-gray-400 dark:text-lago-500">Free shipping on orders over R1,500</p>
                )}
                <p className="text-xs text-gray-400 dark:text-lago-500">VAT (15%) included in all prices</p>
                <div className="border-t border-gray-200 dark:border-lago-800 pt-3 flex justify-between font-black text-lg text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>R {total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout', { state: { promoDiscount: discount, promoId: promoResult?.promotion?.id ?? null } })}
                className="w-full py-4 rounded-xl bg-lago-600 hover:bg-lago-700 text-white font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-lago-600/20 text-sm"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              {/* Payment logos */}
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-lago-800">
                <p className="text-[10px] text-gray-400 dark:text-lago-500 text-center mb-3 font-semibold uppercase tracking-wider">Secure payment via</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {PAYMENT_LOGOS.map((logo) => (
                    <div key={logo.alt} className="h-7 bg-gray-50 dark:bg-white rounded-md px-2 flex items-center">
                      <img src={logo.src} alt={logo.alt} className="h-4 w-auto object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
