import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 container mx-auto px-4 md:px-6 flex flex-col items-center justify-center text-center">
      <h1 className="text-8xl md:text-9xl font-display font-black text-lago-600 dark:text-lago-500 mb-6 tracking-tighter">404</h1>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h2>
      <p className="text-gray-600 dark:text-lago-200 text-lg max-w-md mx-auto mb-10">
        We couldn't find the page you're looking for. It might have been moved or doesn't exist anymore.
      </p>
      
      <Link 
        to="/" 
        className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full bg-lago-600 hover:bg-lago-700 text-white font-bold transition-colors shadow-[0_4px_14px_rgba(5,125,205,0.3)] hover:shadow-[0_6px_20px_rgba(5,125,205,0.4)]"
      >
        <Home className="w-5 h-5" /> Back to Home
      </Link>
    </div>
  );
}
