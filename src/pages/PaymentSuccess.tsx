import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useCartStore } from '../lib/cartStore';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order_number') || 'Unknown';
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear the cart once the payment is successful
    clearCart();
    // In a real app, you would also use the PayFast ITN (notify_url) to verify
    // the payment signature on your backend and update the order status.
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-40 flex items-center justify-center transition-colors duration-300 px-4">
      <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-3xl p-10 max-w-md w-full text-center shadow-xl">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">Payment Successful!</h1>
        <p className="text-gray-600 dark:text-lago-200 mb-2">Thank you for your order.</p>
        <p className="text-sm font-mono bg-gray-100 dark:bg-lago-800 text-lago-600 dark:text-lago-300 px-4 py-2 rounded-xl mb-6 font-bold tracking-wider">{orderNumber}</p>
        <p className="text-sm text-gray-500 dark:text-lago-400 mb-8">You will receive an email confirmation shortly. Delivery takes 3–7 business days.</p>
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/account')} className="py-3 rounded-xl bg-lago-600 text-white font-bold hover:bg-lago-700 transition-colors">
            Track My Order
          </button>
          <button onClick={() => navigate('/shop')} className="py-3 rounded-xl border border-gray-200 dark:border-lago-700 text-gray-700 dark:text-lago-200 font-semibold hover:bg-gray-50 dark:hover:bg-lago-800 transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
