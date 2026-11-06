import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';
import { validatePromoCode } from '../lib/api';
import { formatMoney, productHref } from '../lib/productDisplay';
import { useSEO } from '../lib/useSEO';
import { SafeImage } from '../components/SafeImage';
import { Button, ButtonLink, EmptyState, IconButton, PageShell, QtyStepper, TextField, panelStyles } from '../components/ui';

const PAYMENT_LOGOS = [
  { src: '/payment-logos/Visa_Brandmark_Blue_RGB_2021.png', alt: 'Visa' },
  { src: '/payment-logos/mastercard_logo.png', alt: 'Mastercard' },
  { src: '/payment-logos/Bob_Pay_Instant_EFT_new.png', alt: 'Bob Pay Instant EFT' },
  { src: '/payment-logos/Capitec pay logo.png', alt: 'Capitec Pay' },
  { src: '/payment-logos/Apple_Pay_Logo_new.png', alt: 'Apple Pay' },
  { src: '/payment-logos/Google Pay.png', alt: 'Google Pay' },
];

interface PromoResult {
  valid: boolean;
  message: string;
  discount?: number;
  promotion?: { id?: string };
}

export function CartPage() {
  useSEO({ title: 'Your Cart', description: 'Review the items in your SPET Online cart.', noindex: true });

  const { items, removeItem, updateQty, subtotal } = useCartStore();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [shipping, setShipping] = useState(90);
  const [shippingLoading, setShippingLoading] = useState(true);

  const sub = Number(subtotal()) || 0;
  const discount = Number(promoResult?.discount) || 0;
  const total = sub - discount + shipping;

  useEffect(() => {
    if (items.length === 0) return;
    let cancelled = false;
    setShippingLoading(true);
    fetch('/.netlify/functions/calculate-shipping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((i) => ({ product_id: i.product_id, supplier: i.supplier ?? 'esquire', qty: i.qty })),
        orderValue: sub - discount,
      }),
    })
      .then((res) => res.json())
      .then((result) => { if (!cancelled) setShipping(Number(result.shipping) || 0); })
      .catch(() => { if (!cancelled) setShipping(90); })
      .finally(() => { if (!cancelled) setShippingLoading(false); });
    return () => { cancelled = true; };
  }, [items, sub, discount]);

  async function applyPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    const result = await validatePromoCode(promoCode.trim(), sub);
    setPromoResult(result);
    setPromoLoading(false);
  }

  if (items.length === 0) {
    return (
      <PageShell breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} title="Cart">
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Your cart is empty"
          description="You haven’t added anything to your cart yet."
          action={
            <ButtonLink to="/shop">
              Start shopping <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Cart' }]}
      title="Cart"
      description={`${items.length} item${items.length === 1 ? '' : 's'}`}
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ul className={`${panelStyles} divide-y divide-spet-line-2`}>
            {items.map((item) => {
              const href = productHref(item.supplier ?? 'esquire', item.product_id);
              const lineTotal = (Number(item.price) || 0) * (Number(item.qty) || 1);
              return (
                <li key={item.product_id} className="flex gap-3 p-4 md:gap-4 md:p-5">
                  <Link
                    to={href}
                    aria-label={item.name}
                    className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-spet-line bg-white p-2 md:h-28 md:w-28"
                  >
                    <SafeImage src={item.image} brand={item.brand} alt="" referrerPolicy="no-referrer" className="max-h-full max-w-full object-contain" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-spet-muted">{item.brand}</p>
                    <Link to={href} className="mt-0.5 line-clamp-2 text-[14px] font-medium leading-snug text-spet-ink hover:text-spet-blue">
                      {item.name}
                    </Link>
                    <p className="mt-1 text-[12px] text-spet-muted">SKU {item.sku}</p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <QtyStepper value={item.qty} onChange={(qty) => updateQty(item.product_id, qty)} label={`Quantity of ${item.name}`} />
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-semibold tabular-nums text-spet-ink">{formatMoney(lineTotal)}</p>
                        <IconButton label={`Remove ${item.name} from cart`} onClick={() => removeItem(item.product_id)}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <ButtonLink to="/shop" variant="ghost" className="-ml-2 mt-2">
            Continue shopping
          </ButtonLink>
        </div>

        <aside aria-label="Order summary" className={`${panelStyles} p-5 md:p-6 lg:sticky lg:top-[160px]`}>
          <h2 className="font-display text-[20px] font-semibold text-spet-ink">Order summary</h2>

          <div className="mt-4">
            <div className="flex items-start gap-2">
              <TextField
                id="promo-code"
                label="Promo code"
                wrapperClassName="min-w-0 flex-1"
                value={promoCode}
                onChange={(event) => {
                  setPromoCode(event.target.value.toUpperCase());
                  setPromoResult(null);
                }}
                className="font-mono uppercase tracking-widest"
                autoComplete="off"
              />
              <Button variant="secondary" className="mt-[26px]" onClick={applyPromo} loading={promoLoading} disabled={!promoCode.trim()}>
                Apply
              </Button>
            </div>
            {promoResult && (
              <p role="status" className={`mt-2 text-[12px] font-semibold ${promoResult.valid ? 'text-spet-stock' : 'text-red-600 dark:text-red-400'}`}>
                {promoResult.message}
              </p>
            )}
          </div>

          <dl className="mt-5 space-y-2.5 text-[14px]">
            <div className="flex justify-between gap-3 text-spet-ink-2">
              <dt>Subtotal</dt>
              <dd className="font-medium tabular-nums">{formatMoney(sub)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between gap-3 text-spet-stock">
                <dt>Discount</dt>
                <dd className="font-medium tabular-nums">−{formatMoney(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-3 text-spet-ink-2">
              <dt>Shipping</dt>
              <dd className="font-medium tabular-nums">
                {shippingLoading ? 'Calculating…' : shipping === 0 ? <span className="text-spet-stock">Free</span> : formatMoney(shipping)}
              </dd>
            </div>
            {!shippingLoading && shipping > 0 && <p className="text-[12px] text-spet-muted">Free delivery on orders over R2 500.</p>}
            <div className="flex justify-between gap-3 border-t border-spet-line-2 pt-3 text-[18px] font-semibold text-spet-ink">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(total)}</dd>
            </div>
          </dl>

          <Button
            size="lg"
            className="mt-5 w-full"
            onClick={() =>
              navigate('/checkout', {
                state: {
                  promoDiscount: discount,
                  promoCode: promoResult?.valid ? promoCode.trim() : null,
                  promoId: promoResult?.promotion?.id ?? null,
                },
              })
            }
          >
            Proceed to checkout <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>

          <div className="mt-5 border-t border-spet-line-2 pt-4">
            <p className="mb-2 text-center text-[12px] text-spet-muted">Secure payments</p>
            <div className="flex flex-wrap justify-center gap-2">
              {PAYMENT_LOGOS.map((logo) => (
                <div key={logo.alt} className="flex h-7 items-center rounded-md border border-spet-line bg-white px-2">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    loading="lazy"
                    className="h-4 w-auto object-contain"
                    onError={(event) => { (event.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
