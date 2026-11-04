import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Lock, Mail } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';
import { useAuth } from '../lib/AuthContext';
import { useAddresses } from '../lib/api';
import type { LegalKey } from '../lib/legalContent';
import { formatMoney } from '../lib/productDisplay';
import { supabase } from '../lib/supabase';
import { useSEO } from '../lib/useSEO';
import { LegalModal } from '../components/LegalModal';
import { SafeImage } from '../components/SafeImage';
import { Button, ButtonLink, CheckboxField, PageShell, SelectField, Skeleton, TextField, panelStyles } from '../components/ui';

const SA_PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'];
const PROVINCE_OPTIONS = SA_PROVINCES.map((province) => ({ value: province, label: province }));

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
  useSEO({ title: 'Checkout', description: 'Complete your SPET Online purchase.', noindex: true });

  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading: authLoading, isEmailVerified } = useAuth();
  const { items, subtotal, pendingOrder, setPendingOrder } = useCartStore();
  const { addresses, saveAddress } = useAddresses(user?.id ?? null);

  const promoDiscount = location.state?.promoDiscount ?? 0;
  const promoCode = location.state?.promoCode ?? null;
  const promoId = location.state?.promoId ?? null;

  // NOTE: This is a display-only estimate — create-order.js recalculates the
  // authoritative shipping amount server-side using the same function.
  const sub = Number(subtotal()) || 0;
  const discount = Number(promoDiscount) || 0;
  const [shipping, setShipping] = useState(90);
  const [shippingLoading, setShippingLoading] = useState(true);
  const total = sub - discount + shipping;

  // AUTH GATE: redirect to login if not signed in
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderError, setOrderError] = useState<string | null>(null);
  const [legalDoc, setLegalDoc] = useState<LegalKey | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [submitAttempt, setSubmitAttempt] = useState(0);

  // The button stays locked during the PayFast redirect, so unlock it if the
  // browser restores this page from its back/forward cache.
  useEffect(() => {
    const unlock = (event: PageTransitionEvent) => { if (event.persisted) setPlacing(false); };
    window.addEventListener('pageshow', unlock);
    return () => window.removeEventListener('pageshow', unlock);
  }, []);

  const [form, setForm] = useState({
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
    phone: profile?.phone ?? '',
    address_line1: '',
    address_line2: '',
    city: '',
    province: 'Gauteng',
    postal_code: '',
    country: 'ZA',
    save_address: false,
  });

  const activePostalCode = useExisting && selectedAddr
    ? addresses.find((a) => a.id === selectedAddr)?.postal_code
    : form.postal_code;

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setShippingLoading(true);
      fetch('/.netlify/functions/calculate-shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ product_id: i.product_id, supplier: i.supplier ?? 'esquire', qty: i.qty })),
          orderValue: sub - discount,
          postalCode: activePostalCode || undefined,
        }),
      })
        .then((res) => res.json())
        .then((result) => { if (!cancelled) setShipping(Number(result.shipping) || 0); })
        .catch(() => { if (!cancelled) setShipping(90); })
        .finally(() => { if (!cancelled) setShippingLoading(false); });
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [items, sub, discount, activePostalCode]);

  useEffect(() => {
    if (submitAttempt > 0 && Object.keys(errors).length > 0) errorSummaryRef.current?.focus();
    // Only move focus when a submit fails, not while errors clear during typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitAttempt]);

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));
      setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
    };
  }

  function validateForm(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (useExisting && selectedAddr) return errs;

    if (!form.first_name.trim()) errs.first_name = 'First name is required';
    if (!form.last_name.trim()) errs.last_name = 'Last name is required';

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
      setSubmitAttempt((attempt) => attempt + 1);
      return;
    }

    setPlacing(true);

    try {
      // ── Resolve shipping address ────────────────────────────────────────────
      let shippingAddress: any = {
        ...form,
        full_name: `${form.first_name} ${form.last_name}`.trim(),
      };
      if (useExisting && selectedAddr) {
        const addr = addresses.find((a) => a.id === selectedAddr);
        if (addr) shippingAddress = addr as any;
      } else if (form.save_address && user) {
        await saveAddress({ ...shippingAddress, profile_id: user.id, is_default: addresses.length === 0 });
      }

      // ── Get user's access token to send to the server function ─────────────
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setOrderError('Session expired. Please log in again.');
        setPlacing(false);
        return;
      }

      // ── Call server-side Netlify Function ──────────────────────────────────
      // Cart items include supplier so the server knows which table to verify prices in
      const cartPayload = items.map((i) => ({
        product_id: i.product_id,
        sku: i.sku,
        qty: i.qty,
        supplier: i.supplier ?? 'esquire',   // cartStore items should carry supplier field
      }));

      const response = await fetch('/.netlify/functions/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: session.access_token,
          items: cartPayload,
          shippingAddress,
          promoCode,
          promoId,
          previousOrderId: pendingOrder?.id ?? null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setPlacing(false);
        setOrderError(result.error || 'Something went wrong. Please try again.');
        return;
      }

      // ── Order created successfully — submit to PayFast ─────────────────────
      const { payfast } = result;

      const pfForm = document.createElement('form');
      pfForm.method = 'POST';
      pfForm.action = payfast.url;

      for (const [key, value] of Object.entries(payfast.fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        pfForm.appendChild(input);
      }

      // The cart stays full until the payment succeeds, so a cancelled payment can be retried.
      setPendingOrder({ id: result.orderId, promoDiscount: discount, promoCode, promoId });

      document.body.appendChild(pfForm);
      pfForm.submit();

    } catch (err: any) {
      setPlacing(false);
      setOrderError(err?.message || 'An unexpected error occurred. Please try again.');
    }
  }

  if (authLoading) {
    return (
      <PageShell title="Checkout">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3" aria-busy="true">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </PageShell>
    );
  }

  if (!user) return null;

  // EMAIL VERIFICATION GATE
  if (!isEmailVerified) {
    return (
      <PageShell>
        <div className="flex min-h-[52vh] items-center justify-center py-6">
          <div className={`${panelStyles} w-full max-w-md p-6 text-center md:p-10`}>
            <Mail className="mx-auto h-10 w-10 text-spet-blue" aria-hidden="true" />
            <h1 className="mt-4 font-display text-[26px] font-semibold tracking-tight text-spet-ink">Verify your email</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-spet-ink-2">
              Before you can check out, please verify your email address. We sent a verification link to{' '}
              <span className="font-semibold text-spet-ink">{user.email}</span>.
            </p>
            <p className="mt-3 text-[13px] text-spet-muted">Check your inbox and spam folder. Once verified, refresh this page.</p>
            <div className="mt-6 flex flex-col gap-3">
              <Button onClick={() => window.location.reload()}>I’ve verified, continue</Button>
              <ButtonLink to="/cart" variant="secondary">Back to cart</ButtonLink>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  const errorEntries = Object.entries(errors);
  const showNewAddress = !useExisting || addresses.length === 0;

  return (
    <PageShell
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]}
      title="Checkout"
      description="Secure, encrypted checkout."
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {addresses.length > 0 && (
            <fieldset className={`${panelStyles} p-5 md:p-6`}>
              <legend className="float-left mb-4 w-full font-display text-[20px] font-semibold text-spet-ink">Saved addresses</legend>
              <div className="clear-both space-y-3">
                {addresses.map((addr) => {
                  const checked = selectedAddr === addr.id && useExisting;
                  return (
                    <label
                      key={addr.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                        checked ? 'border-spet-blue bg-spet-tint' : 'border-spet-line hover:border-spet-blue'
                      }`}
                    >
                      <input
                        type="radio"
                        name="addr"
                        checked={checked}
                        onChange={() => { setSelectedAddr(addr.id); setUseExisting(true); setErrors({}); }}
                        className="mt-0.5 h-4 w-4 accent-spet-blue"
                      />
                      <span className="min-w-0 text-[13px] leading-relaxed text-spet-ink-2">
                        <span className="block font-semibold text-spet-ink">
                          {addr.full_name} {addr.label && <span className="font-normal text-spet-muted">({addr.label})</span>}
                        </span>
                        <span className="block">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</span>
                        <span className="block">{addr.city}, {addr.province}, {addr.postal_code}</span>
                      </span>
                    </label>
                  );
                })}
                <label
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                    !useExisting ? 'border-spet-blue bg-spet-tint' : 'border-spet-line hover:border-spet-blue'
                  }`}
                >
                  <input type="radio" name="addr" checked={!useExisting} onChange={() => setUseExisting(false)} className="h-4 w-4 accent-spet-blue" />
                  <span className="text-[13px] font-semibold text-spet-ink">Use a different address</span>
                </label>
              </div>
            </fieldset>
          )}

          {showNewAddress && (
            <section aria-labelledby="shipping-title" className={`${panelStyles} p-5 md:p-6`}>
              <h2 id="shipping-title" className="mb-4 font-display text-[20px] font-semibold text-spet-ink">Shipping address</h2>

              {errorEntries.length > 0 && (
                <div
                  ref={errorSummaryRef}
                  tabIndex={-1}
                  role="alert"
                  className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/40"
                >
                  <p className="flex items-center gap-2 text-[14px] font-semibold text-red-700 dark:text-red-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Please fix {errorEntries.length === 1 ? '1 field' : `${errorEntries.length} fields`}
                  </p>
                  <ul className="mt-2 space-y-1 pl-6 text-[13px]">
                    {errorEntries.map(([key, message]) => (
                      <li key={key}>
                        <a href={`#checkout-${key}`} className="text-red-700 underline dark:text-red-300">{message}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TextField id="checkout-first_name" label="First name" autoComplete="given-name" value={form.first_name} onChange={field('first_name')} error={errors.first_name} />
                <TextField id="checkout-last_name" label="Last name" autoComplete="family-name" value={form.last_name} onChange={field('last_name')} error={errors.last_name} />
                <TextField id="checkout-phone" label="Phone number" type="tel" autoComplete="tel" placeholder="082 000 0000" value={form.phone} onChange={field('phone')} error={errors.phone} />
                <SelectField id="checkout-province" label="Province" options={PROVINCE_OPTIONS} value={form.province} onChange={field('province')} error={errors.province} />
                <TextField id="checkout-address_line1" wrapperClassName="md:col-span-2" label="Address line 1" autoComplete="address-line1" placeholder="Street address, house or unit number" value={form.address_line1} onChange={field('address_line1')} error={errors.address_line1} />
                <TextField id="checkout-address_line2" wrapperClassName="md:col-span-2" label="Address line 2 (optional)" autoComplete="address-line2" placeholder="Apartment, complex, suburb" value={form.address_line2} onChange={field('address_line2')} />
                <TextField id="checkout-city" label="City or town" autoComplete="address-level2" value={form.city} onChange={field('city')} error={errors.city} />
                <TextField id="checkout-postal_code" label="Postal code" autoComplete="postal-code" inputMode="numeric" maxLength={4} value={form.postal_code} onChange={field('postal_code')} error={errors.postal_code} />
                <div className="md:col-span-2">
                  <CheckboxField id="checkout-save_address" label="Save this address for future orders" checked={form.save_address} onChange={field('save_address')} />
                </div>
              </div>
            </section>
          )}

          <section aria-labelledby="payment-title" className={`${panelStyles} p-5 md:p-6`}>
            <h2 id="payment-title" className="flex items-center gap-2 font-display text-[20px] font-semibold text-spet-ink">
              <Lock className="h-4 w-4 text-spet-stock" aria-hidden="true" /> Payment method
            </h2>
            <p className="mt-2 text-[14px] text-spet-ink-2">You choose how to pay at the secure payment gateway. We support:</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {PAYMENT_LOGOS.map((logo) => (
                <div key={logo.alt} className="flex h-9 items-center justify-center rounded-lg border border-spet-line bg-white px-3">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    loading="lazy"
                    className="h-5 w-auto object-contain"
                    onError={(event) => { (event.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-spet-muted">
              All transactions are processed securely via PayFast. SPET Online never stores your card details.
            </p>
          </section>
        </div>

        <aside aria-label="Order summary" className={`${panelStyles} p-5 md:p-6 lg:sticky lg:top-[160px]`}>
          <h2 className="font-display text-[20px] font-semibold text-spet-ink">Order summary</h2>

          <ul className="mt-4 max-h-60 space-y-3 overflow-y-auto">
            {items.map((item) => (
              <li key={item.product_id} className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-spet-line bg-white p-1">
                  <SafeImage src={item.image} brand={item.brand} alt="" referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[13px] font-medium text-spet-ink">{item.name}</p>
                  <p className="text-[12px] text-spet-muted">Qty {item.qty}</p>
                </div>
                <p className="shrink-0 text-[13px] font-semibold tabular-nums text-spet-ink">
                  {formatMoney((Number(item.price) || 0) * (Number(item.qty) || 1))}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2.5 border-t border-spet-line-2 pt-4 text-[14px]">
            <div className="flex justify-between gap-3 text-spet-ink-2">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(sub)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between gap-3 text-spet-stock">
                <dt>Discount</dt>
                <dd className="tabular-nums">−{formatMoney(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-3 text-spet-ink-2">
              <dt>Shipping</dt>
              <dd className="tabular-nums">
                {shippingLoading ? 'Calculating…' : shipping === 0 ? <span className="font-semibold text-spet-stock">Free</span> : formatMoney(shipping)}
              </dd>
            </div>
            <p className="text-[12px] text-spet-muted">Prices include 15% VAT.</p>
            <div className="flex justify-between gap-3 border-t border-spet-line-2 pt-3 text-[18px] font-semibold text-spet-ink">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(total)}</dd>
            </div>
          </dl>

          <Button size="lg" className="mt-5 w-full" onClick={placeOrder} loading={placing} disabled={items.length === 0}>
            {!placing && <Lock className="h-4 w-4" aria-hidden="true" />}
            {placing ? 'Placing order…' : `Place order: ${formatMoney(total)}`}
          </Button>

          {orderError && (
            <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-[13px] font-medium text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {orderError}
            </p>
          )}

          <p className="mt-3 text-center text-[12px] leading-relaxed text-spet-muted">
            By placing your order you agree to our{' '}
            <button type="button" onClick={() => setLegalDoc('terms')} className="underline hover:text-spet-blue">Terms &amp; Conditions</button>,{' '}
            <button type="button" onClick={() => setLegalDoc('privacy')} className="underline hover:text-spet-blue">Privacy Policy</button> and{' '}
            <button type="button" onClick={() => setLegalDoc('returns')} className="underline hover:text-spet-blue">Return Policy</button>.
          </p>
        </aside>
      </div>

      <LegalModal docKey={legalDoc} onClose={() => setLegalDoc(null)} />
    </PageShell>
  );
}
