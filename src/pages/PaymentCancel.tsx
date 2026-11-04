import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';
import { supabase } from '../lib/supabase';
import { useSEO } from '../lib/useSEO';
import { ButtonLink, PageShell, panelStyles } from '../components/ui';

export function PaymentCancel() {
  useSEO({ title: 'Payment cancelled', description: 'Your SPET Online payment was not completed.', noindex: true });

  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order_number') || 'Unknown';
  const pendingOrder = useCartStore((state) => state.pendingOrder);

  useEffect(() => {
    if (orderNumber === 'Unknown') return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) return;
      return fetch('/.netlify/functions/cancel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: session.access_token, orderId: orderNumber }),
      });
    }).catch((err) => console.error('Failed to cancel order:', err));
  }, [orderNumber]);

  return (
    <PageShell>
      <div className="flex min-h-[52vh] items-center justify-center py-6">
        <div className={`${panelStyles} w-full max-w-md p-6 text-center md:p-10`}>
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 dark:text-red-400" aria-hidden="true" />
          <h1 className="mt-4 font-display text-[26px] font-semibold tracking-tight text-spet-ink">Payment cancelled</h1>
          <p className="mt-2 text-[14px] text-spet-ink-2">
            Your payment for order <span className="break-all font-mono font-semibold">{orderNumber}</span> was not completed.
          </p>
          <p className="mt-4 text-[13px] leading-relaxed text-spet-ink-2">
            Don't worry, your items are still in your cart! You can try placing your order again when you are ready.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <ButtonLink to="/checkout" state={pendingOrder}>Try payment again</ButtonLink>
            <ButtonLink to="/cart" variant="secondary">Return to cart</ButtonLink>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
