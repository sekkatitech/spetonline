import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Clock, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import type { Product } from '../../lib/api';
import { SafeImage } from '../SafeImage';
import { toProductView } from '../../lib/productDisplay';
import { departmentHref, formatHeadLabel, headHref, type ShopperDepartment } from './departments';
import { ProductTile, ProductTileSkeleton } from '../product/ProductTile';

interface DepartmentAssortmentProps {
  department: ShopperDepartment;
  products: Product[];
  loading: boolean;
}

const FACTS = [
  { icon: Truck, label: 'Free delivery over R2 500' },
  { icon: Clock, label: '3–7 business days nationwide' },
  { icon: RotateCcw, label: '7-day returns' },
  { icon: ShieldCheck, label: 'Manufacturer warranty' },
];

export function DepartmentAssortment({ department, products, loading }: DepartmentAssortmentProps) {
  const shelfProducts = products.slice(0, 4);
  const first = products[0];
  const second =
    (first && products.slice(1).find((product) => product.CategoryHead !== first.CategoryHead)) ??
    products[1];
  const heroProducts = [first, second].filter(Boolean).map((product) => toProductView(product!));
  const subcategories = department.heads.slice(0, 4);

  return (
    <section aria-labelledby="department-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h1
          id="department-title"
          className="font-display text-[30px] font-semibold leading-none tracking-tight text-spet-ink md:text-[40px]"
        >
          {department.label}
        </h1>
        <Link
          to={departmentHref(department)}
          className="flex shrink-0 items-center gap-1.5 pb-1 text-[13px] font-semibold text-spet-blue transition-colors hover:text-spet-blue-dark md:text-[14px]"
        >
          View department
          <ArrowRight className="h-[15px] w-[15px]" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid items-center gap-6 rounded-2xl border border-spet-tint-line bg-spet-tint px-4 py-5 md:px-6 lg:grid-cols-[300px_1fr]">
        <div>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-1">
            {subcategories.map((head, index) => (
              <li key={head} className={index >= 2 ? 'hidden sm:block' : ''}>
                <Link
                  to={headHref(head)}
                  className="flex items-center justify-between gap-2 border-b border-spet-tint-line py-1.5 text-[12px] leading-tight text-spet-link transition-colors hover:text-spet-blue md:text-[14px]"
                >
                  <span className="min-w-0">{formatHeadLabel(head)}</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to={departmentHref(department)}
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-spet-blue px-4 text-[13px] font-semibold text-white transition-colors hover:bg-spet-blue-dark"
          >
            {department.cta}
            <ArrowRight className="h-[14px] w-[14px]" aria-hidden="true" />
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-8 lg:gap-12">
          {loading
            ? [0, 1].map((index) => (
                <div
                  key={index}
                  className={`animate-pulse rounded-xl bg-white ${index === 0 ? 'h-[120px] w-[150px] lg:h-[148px] lg:w-[250px]' : 'h-[110px] w-[140px] lg:h-[132px] lg:w-[232px]'}`}
                />
              ))
            : heroProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`flex items-center justify-center rounded-xl bg-white p-3 shadow-sm ${
                    index === 0
                      ? 'h-[120px] w-[150px] lg:h-[148px] lg:w-[250px]'
                      : 'h-[110px] w-[140px] lg:h-[132px] lg:w-[232px]'
                  }`}
                >
                  <SafeImage
                    src={product.image}
                    brand={product.brand}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-2xl border border-spet-line bg-spet-surface lg:grid-cols-4 lg:divide-x lg:divide-spet-line-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => <ProductTileSkeleton key={index} />)
        ) : shelfProducts.length > 0 ? (
          shelfProducts.map((product) => <ProductTile key={product.id} product={product} />)
        ) : (
          <div className="col-span-full px-6 py-10 text-center">
            <p className="text-[14px] text-spet-ink-2">No {department.label.toLowerCase()} products are available right now.</p>
            <Link
              to="/categories"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-spet-blue hover:text-spet-blue-dark"
            >
              Browse all categories
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[12px] text-spet-ink-2 md:text-[13px]">
        {FACTS.map((fact) => (
          <span key={fact.label} className="flex items-center gap-1.5">
            <fact.icon className="h-4 w-4 text-spet-muted" aria-hidden="true" />
            {fact.label}
          </span>
        ))}
      </div>
    </section>
  );
}
