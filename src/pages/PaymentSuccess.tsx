import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';
import { supabase } from '../lib/supabase';
import { useSEO } from '../lib/useSEO';
import { ButtonLink, PageShell, panelStyles } from '../components/ui';

export function PaymentSuccess() {
  useSEO({ title: 'Payment successful', description: 'Your SPET Online payment was successful.', noindex: true });

  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order_number') || 'Unknown';
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear the cart once the payment is successful
    clearCart();

    // Trigger the Mailtrap Order Confirmation email
    const sent = sessionStorage.getItem(`email_sent_${orderNumber}`);
    if (orderNumber && orderNumber !== 'Unknown' && !sent) {
      sessionStorage.setItem(`email_sent_${orderNumber}`, 'true');
      supabase.functions.invoke('send-mailtrap', {
        body: { type: 'order', payload: { order_number: orderNumber } }
      }).catch(err => console.error("Failed to trigger order email:", err));
    }
  }, [clearCart, orderNumber]);

  return (
    <PageShell>
      <div className="flex min-h-[52vh] items-center justify-center py-6">
        <div className={`${panelStyles} w-full max-w-md p-6 text-center md:p-10`}>
          <CheckCircle className="mx-auto h-12 w-12 text-spet-stock" aria-hidden="true" />
          <h1 className="mt-4 font-display text-[26px] font-semibold tracking-tight text-spet-ink">Payment successful</h1>
          <p className="mt-2 text-[14px] text-spet-ink-2">Thank you for your order.</p>
          <p className="mt-4 break-all rounded-lg bg-spet-tint px-4 py-2 font-mono text-[13px] font-semibold text-spet-link">{orderNumber}</p>
          <p className="mt-4 text-[13px] leading-relaxed text-spet-ink-2">
            You will receive an email confirmation shortly. Delivery takes 3–7 business days.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <ButtonLink to="/account">Track my order</ButtonLink>
            <ButtonLink to="/shop" variant="secondary">Continue shopping</ButtonLink>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
