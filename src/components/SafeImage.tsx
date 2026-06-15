// @ts-nocheck
import React from 'react';

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  brand?: string | null;
  fallbackClassName?: string;
}

export function SafeImage({
  src,
  brand,
  alt = '',
  className = '',
  fallbackClassName = '',
  ...props
}: SafeImageProps) {
  const [errored, setErrored] = React.useState(false);

  const logoUrl = brand
    ? `https://img.logo.dev/${encodeURIComponent(brand.toLowerCase())}.com?token=pk_RSkNTnvvScKErzhoXO5UUg&size=64`
    : null;

  const fallback = logoUrl || '/main-icon.png';

  if (!src || errored) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={fallbackClassName || className}
        onError={(e) => { (e.target as HTMLImageElement).src = '/main-icon.png'; }}
        {...props}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setErrored(true)}
      {...props}
    />
  );
}