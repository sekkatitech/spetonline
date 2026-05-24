import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Lock, ChevronDown, AlertTriangle, ArrowLeft, Mail } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';
import { useAuth } from '../lib/AuthContext';
import { useAddresses, createOrder } from '../lib/api';
import { SafeImage } from '../components/SafeImage';

const SA_PROVINCES = ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','Northern Cape','North West','Western Cape'];

const PAYMENT_LOGOS = [
  { src: '/payment-logos/Visa_Brandmark_Blue_RGB_2021.png', alt: 'Visa' },
  { src: '/payment-logos/mastercard_logo.png', alt: 'Mastercard' },
  { src: '/payment-logos/Bob_Pay_Instant_EFT_new.png', alt: 'Bob Pay Instant EFT' },
  { src: '/payment-logos/Bob_Pay_Manual_EFT_new.png', alt: 'Bob Pay EFT' },
  { src: '/payment-logos/Capitec pay logo.png', alt: 'Capitec Pay' },
  { src: '/payment-logos/absa_pay.png', alt: 'ABSA Pay' },
  { src: '/payment-logos/Apple_Pay_Logo_new.png', alt: 'Apple Pay' },
  { src: '/payment-logos/Google Pay.png', alt: 'Google Pay' },
  { src: '/payment-logos/pay_shap.png', alt: 'PayShap' },
  { src: '/payment-logos/amex.png', alt: 'Amex' },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading: authLoading, isEmailVerified } = useAuth();
  const { items, subtotal, clearCart } = useCartStore();
  const { addresses, saveAddress } = useAddresses(user?.id ?? null);

  const promoDiscount = location.state?.promoDiscount ?? 0;
  const promoId = location.state?.promoId ?? null;

  const sub = Number(subtotal()) || 0;
  const discount = Number(promoDiscount) || 0;
  const shipping = sub - discount >= 2500 ? 0 : 150;
  const total = sub - discount + shipping;

  // ✅ AUTH GATE: redirect to login if not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/checkout', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const [useExisting, setUseExisting] = useState(false);
  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);

  useEffect(() => {
    if (addresses.length > 0) {
      setUseExisting(true);
      setSelectedAddr((prev) => prev || addresses[0]?.id || null);
    }
  }, [addresses]);

  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderError, setOrderError] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() : '',
    phone: profile?.phone ?? '',
    address_line1: '',
    address_line2: '',
    city: '',
    province: 'Gauteng',
    postal_code: '',
    country: 'ZA',
    save_address: false,
  });

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));
      setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
    };
  }

  const inputClass = (fieldName?: string) => `w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-lago-800 border ${fieldName && errors[fieldName] ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-lago-700'} text-gray-900 dark:text-white text-sm focus:outline-none focus:border-lago-500 transition-colors`;

  function validateForm(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (useExisting && selectedAddr) return errs;

    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    else if (form.full_name.trim().split(/\s+/).length < 2) errs.full_name = 'Please enter first and last name';

    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^(\+27|0)[0-9]{9,}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Enter a valid SA phone number (e.g. 082 000 0000)';

    if (!form.address_line1.trim()) errs.address_line1 = 'Street address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.province) errs.province = 'Province is required';

    if (!form.postal_code.trim()) errs.postal_code = 'Postal code is required';
    else if (!/^\d{4}$/.test(form.postal_code.trim())) errs.postal_code = 'Postal code must be 4 digits';

    return errs;
  }

  async function placeOrder() {
    if (items.length === 0) return;
    setOrderError(null);

    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = document.querySelector('[data-error="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setPlacing(true);

    try {
      let shippingAddress = form;
      if (useExisting && selectedAddr) {
        const addr = addresses.find((a) => a.id === selectedAddr);
        if (addr) shippingAddress = addr as any;
      } else if (form.save_address && user) {
        await saveAddress({ ...form, profile_id: user.id, is_default: addresses.length === 0 });
      }

      const { order, error } = await createOrder({
        profile_id: user?.id ?? null,
        items: items.map((i) => ({ product_id: i.product_id, product_name: i.name, sku: i.sku, qty: i.qty, unit_price: i.price })),
        subtotal: sub,
        discount_amount: discount,
        shipping_cost: shipping,
        tax_amount: 0,
        total,
        promotion_id: promoId,
        shipping_address: shippingAddress,
      });

      setPlacing(false);
      if (error) {
        setOrderError(typeof error === 'string' ? error : (error as any).message || JSON.stringify(error) || 'Something went wrong. Please try again.');
      } else if (order) {
        const pfForm = document.createElement('form');
        pfForm.method = 'POST';
        pfForm.action = 'https://sandbox.payfast.co.za/eng/process';

        const returnUrl = `${window.location.origin}/payment-success?order_number=${order.order_number}`;
        const cancelUrl = `${window.location.origin}/payment-cancel?order_number=${order.order_number}`;

        const pfData: Record<string, string> = {
          merchant_id: '10000100',
          merchant_key: '46f0cd694581a',
          return_url: returnUrl,
          cancel_url: cancelUrl,
          name_first: form.full_name.split(' ')[0] || 'Customer',
          name_last: form.full_name.split(' ').slice(1).join(' ') || 'Name',
          email_address: user?.email || 'test@example.com',
          m_payment_id: order.order_number,
          amount: total.toFixed(2),
          item_name: `SPET Online Order ${order.order_number}`,
        };

        for (const key in pfData) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = pfData[key];
          pfForm.appendChild(input);
        }

        document.body.appendChild(pfForm);
        pfForm.submit();
      }
    } catch (err: any) {
      setPlacing(false);
      setOrderError(err?.message || 'An unexpected error occurred. Please try again.');
    }
  }

  // ✅ Show nothing while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-32 flex items-center justify-center">
        <div className="text-gray-500 dark:text-lago-400">Loading...</div>
      </div>
    );
  }

  // ✅ Should not render if not logged in (redirect above handles it),
  // but guard here just in case
  if (!user) return null;

  // ✅ EMAIL VERIFICATION GATE
  if (!isEmailVerified) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-32 md:pt-36 flex items-center justify-center px-4 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-3xl shadow-xl p-10 text-center">
          <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Verify Your Email</h2>
          <p className="text-gray-500 dark:text-lago-400 text-sm mb-6 leading-relaxed">
            Before you can checkout, please verify your email address. We sent a verification link to{' '}
            <span className="font-semibold text-gray-800 dark:text-white">{user.email}</span>.
          </p>
          <p className="text-gray-400 dark:text-lago-500 text-xs mb-6">
            Check your inbox (and spam folder). Once verified, refresh this page.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-lago-600 hover:bg-lago-700 text-white font-bold transition-colors"
            >
              I've Verified — Continue
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="w-full py-3 rounded-xl bg-gray-100 dark:bg-lago-800 hover:bg-gray-200 dark:hover:bg-lago-700 text-gray-700 dark:text-lago-200 font-semibold transition-colors text-sm"
            >
              ← Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-32 md:pt-36 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <button
          onClick={() => navigate('/cart')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-700 text-sm font-semibold text-gray-600 dark:text-lago-200 hover:border-lago-500 hover:text-lago-600 dark:hover:text-white transition-all shadow-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </button>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white mb-2">Checkout</h1>
        <p className="text-gray-500 dark:text-lago-400 text-sm mb-8 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5" /> Secure, encrypted checkout
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Shipping */}
          <div className="lg:col-span-2 space-y-6">

            {/* Existing addresses */}
            {addresses.length > 0 && (
              <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Saved Addresses</h2>
                <div className="space-y-3 mb-4">
                  {addresses.map((addr) => (
                    <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddr === addr.id && useExisting ? 'border-lago-500 bg-lago-50 dark:bg-lago-800/50' : 'border-gray-200 dark:border-lago-800 hover:border-lago-300'}`}>
                      <input type="radio" name="addr" checked={selectedAddr === addr.id && useExisting} onChange={() => { setSelectedAddr(addr.id); setUseExisting(true); }} className="mt-1 text-lago-600" />
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{addr.full_name} <span className="font-normal text-gray-500 dark:text-lago-400">({addr.label})</span></p>
                        <p className="text-sm text-gray-600 dark:text-lago-200">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                        <p className="text-sm text-gray-600 dark:text-lago-200">{addr.city}, {addr.province}, {addr.postal_code}</p>
                      </div>
                    </label>
                  ))}
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${!useExisting ? 'border-lago-500 bg-lago-50 dark:bg-lago-800/50' : 'border-gray-200 dark:border-lago-800 hover:border-lago-300'}`}>
                    <input type="radio" name="addr" checked={!useExisting} onChange={() => setUseExisting(false)} className="text-lago-600" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">+ Use a different address</span>
                  </label>
                </div>
              </div>
            )}

            {/* New address form */}
            {(!useExisting || addresses.length === 0) && (
              <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Shipping Address</h2>

                {Object.keys(errors).length > 0 && (
                  <div className="mb-5 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-700 dark:text-red-400">Please fix the errors below</p>
                      <p className="text-xs text-red-600 dark:text-red-400/80 mt-1">{Object.keys(errors).length} field{Object.keys(errors).length > 1 ? 's' : ''} need{Object.keys(errors).length === 1 ? 's' : ''} your attention</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Full Name *</label>
                    <input value={form.full_name} onChange={field('full_name')} data-error={!!errors.full_name || undefined} className={inputClass('full_name')} placeholder="First and last name" />
                    {errors.full_name && <p className="mt-1.5 text-xs font-semibold text-red-500 dark:text-red-400">{errors.full_name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Phone Number *</label>
                    <input value={form.phone} onChange={field('phone')} type="tel" data-error={!!errors.phone || undefined} className={inputClass('phone')} placeholder="e.g. 082 000 0000" />
                    {errors.phone && <p className="mt-1.5 text-xs font-semibold text-red-500 dark:text-red-400">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Province *</label>
                    <div className="relative">
                      <select value={form.province} onChange={field('province')} data-error={!!errors.province || undefined} className={inputClass('province') + ' appearance-none pr-9 cursor-pointer'}>
                        {SA_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.province && <p className="mt-1.5 text-xs font-semibold text-red-500 dark:text-red-400">{errors.province}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Address Line 1 *</label>
                    <input value={form.address_line1} onChange={field('address_line1')} data-error={!!errors.address_line1 || undefined} className={inputClass('address_line1')} placeholder="Street address, house/unit number" />
                    {errors.address_line1 && <p className="mt-1.5 text-xs font-semibold text-red-500 dark:text-red-400">{errors.address_line1}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Address Line 2</label>
                    <input value={form.address_line2} onChange={field('address_line2')} className={inputClass()} placeholder="Apartment, complex, suburb (optional)" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">City / Town *</label>
                    <input value={form.city} onChange={field('city')} data-error={!!errors.city || undefined} className={inputClass('city')} placeholder="e.g. Johannesburg" />
                    {errors.city && <p className="mt-1.5 text-xs font-semibold text-red-500 dark:text-red-400">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-lago-400 uppercase tracking-wide mb-1.5">Postal Code *</label>
                    <input value={form.postal_code} onChange={field('postal_code')} data-error={!!errors.postal_code || undefined} className={inputClass('postal_code')} placeholder="e.g. 2196" maxLength={4} />
                    {errors.postal_code && <p className="mt-1.5 text-xs font-semibold text-red-500 dark:text-red-400">{errors.postal_code}</p>}
                  </div>
                  {user && (
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={form.save_address} onChange={field('save_address')} className="w-4 h-4 rounded text-lago-600 border-gray-300" />
                        <span className="text-sm text-gray-700 dark:text-lago-100 font-medium">Save this address for future orders</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment method section */}
            <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-500" /> Payment Method
              </h2>
              <p className="text-sm text-gray-600 dark:text-lago-200 mb-5">
                Select your preferred payment method at the secure payment gateway. We support:
              </p>
              <div className="flex flex-wrap gap-2.5 mb-4">
                {PAYMENT_LOGOS.map((logo) => (
                  <div key={logo.alt} className="h-9 bg-gray-50 dark:bg-white rounded-lg px-3 flex items-center justify-center border border-gray-200 shadow-sm">
                    <img src={logo.src} alt={logo.alt} className="h-5 w-auto object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-lago-400">
                🔒 All transactions are processed securely via <strong>Bob Pay</strong>. SPET Online never stores your card details.
              </p>
            </div>
          </div>

          {/* Right: Order summary */}
          <div>
            <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-2xl p-6 shadow-sm sticky top-36">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-3 text-sm">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-lago-800 rounded-lg flex-shrink-0 border border-gray-200 dark:border-lago-700 overflow-hidden">
                      <SafeImage src={item.image} brand={item.brand} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white line-clamp-1 text-xs">{item.name}</p>
                      <p className="text-gray-400 dark:text-lago-400 text-xs">Qty: {item.qty}</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white text-xs flex-shrink-0">R {((Number(item.price) || 0) * (Number(item.qty) || 1)).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-lago-800 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-lago-200">
                  <span>Subtotal</span>
                  <span>R {sub.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>−R {discount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-lago-200">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600 dark:text-green-400 font-semibold">FREE</span> : `R ${shipping.toFixed(2)}`}</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-lago-500">VAT (15%) included in prices</p>
                <div className="border-t border-gray-200 dark:border-lago-800 pt-3 flex justify-between font-black text-xl text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>R {total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing || items.length === 0}
                className="mt-6 w-full py-4 rounded-xl bg-lago-600 hover:bg-lago-700 text-white font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-lago-600/20"
              >
                <Lock className="w-4 h-4" />
                {placing ? 'Placing Order...' : `Place Order — R ${total.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`}
              </button>

              {orderError && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">{orderError}</p>
                </div>
              )}

              <p className="text-xs text-gray-400 dark:text-lago-500 text-center mt-3 leading-relaxed">
                By placing your order you agree to our Terms & Conditions, Privacy Policy, and Return Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
