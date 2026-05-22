import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export function PaymentCancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order_number') || 'Unknown';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a141d] pt-40 flex items-center justify-center transition-colors duration-300 px-4">
      <div className="bg-white dark:bg-lago-900 border border-gray-200 dark:border-lago-800 rounded-3xl p-10 max-w-md w-full text-center shadow-xl">
        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">Payment Cancelled</h1>
        <p className="text-gray-600 dark:text-lago-200 mb-6">
          Your payment for order <span className="font-mono font-bold">{orderNumber}</span> was not completed.
        </p>
        <p className="text-sm text-gray-500 dark:text-lago-400 mb-8">
          Don't worry, your items are still in your cart! You can try placing your order again when you are ready.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/checkout')} className="py-3 rounded-xl bg-lago-600 text-white font-bold hover:bg-lago-700 transition-colors">
            Try Payment Again
          </button>
          <button onClick={() => navigate('/cart')} className="py-3 rounded-xl border border-gray-200 dark:border-lago-700 text-gray-700 dark:text-lago-200 font-semibold hover:bg-gray-50 dark:hover:bg-lago-800 transition-colors">
            Return to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
