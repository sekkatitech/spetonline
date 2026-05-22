import React, { useState } from 'react';
import { Package } from 'lucide-react';

export function formatImageUrl(url: string | null | undefined, brand?: string | null): string {
  if (!url) return '';

  let formatted = url;
  // Convert http to https to bypass Mixed Content blocks
  if (formatted.startsWith('http://')) {
    formatted = formatted.replace('http://', 'https://');
  }

  return formatted;
}

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  brand?: string | null;
  fallbackClassName?: string;
}

export function SafeImage({ src, brand, alt, className = '', fallbackClassName = '', ...props }: SafeImageProps) {
  const [error, setError] = useState(false);
  const formattedUrl = formatImageUrl(src, brand);

  const isInvalid = !formattedUrl || formattedUrl.includes('laptop-add-1') || formattedUrl.includes('laptop-add') || error;

  if (isInvalid) {
    return (
      <div 
        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200/50 dark:from-lago-950 dark:to-lago-900/50 border border-gray-200/50 dark:border-lago-800/50 rounded-2xl p-4 transition-all duration-300 ${fallbackClassName}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-lago-50 dark:bg-lago-950/60 flex items-center justify-center mb-2.5 border border-lago-100/50 dark:border-lago-800/40 shadow-sm">
          <Package className="w-6 h-6 text-lago-500 dark:text-lago-400" />
        </div>
        <span className="text-[11px] font-bold text-lago-500/80 dark:text-lago-400/80 uppercase tracking-widest text-center">
          Image Coming Soon
        </span>
      </div>
    );
  }

  return (
    <img
      src={formattedUrl}
      alt={alt || 'Product Image'}
      className={className}
      onError={() => setError(true)}
      {...props}
    />
  );
}
