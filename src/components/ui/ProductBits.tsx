import { formatPrice, formatRand } from '../../lib/productDisplay';

export function StockPill({ inStock, className = '' }: { inStock: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] ${inStock ? 'text-spet-stock' : 'text-spet-muted'} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-spet-stock' : 'bg-spet-muted'}`} aria-hidden="true" />
      {inStock ? 'In stock' : 'Out of stock'}
    </span>
  );
}

interface PriceTagProps {
  price: number;
  wasPrice?: number | null;
  saving?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceTag({ price, wasPrice, saving, size = 'md', className = '' }: PriceTagProps) {
  const priceSize = size === 'lg' ? 'text-[26px]' : size === 'sm' ? 'text-[15px]' : 'text-[19px]';

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className={`${priceSize} font-semibold tabular-nums text-spet-ink`}>{formatPrice(price)}</span>
        {wasPrice && <span className="text-[12px] tabular-nums text-spet-was line-through">{formatRand(wasPrice)}</span>}
      </div>
      {saving ? (
        <p className="text-[12px] font-semibold text-spet-orange">Save {formatRand(saving)}</p>
      ) : null}
    </div>
  );
}
