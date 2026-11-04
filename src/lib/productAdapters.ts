import { useEffect, useState } from 'react';
import { fetchProductBySlug, type Product } from './api';
import { firstImage, toProductView, type ProductSupplier, type ProductView } from './productDisplay';
import { supabase } from './supabase';
import { SUPPLIERS, type SupplierKey } from './supplierCatalog';

export interface ProductDescription {
  kind: 'html' | 'text';
  value: string;
}

export interface ProductCrumb {
  label: string;
  to?: string;
}

/** What the product detail template renders, whichever table the row came from. */
export interface ProductDetail {
  view: ProductView;
  images: string[];
  summary: string | null;
  description: ProductDescription | null;
  specs: { label: string; value: string }[];
  warrantyMonths: number | null;
  condition: string | null;
  crumbs: ProductCrumb[];
  backRoute: string;
  seoDescription: string;
  canonicalPath: string;
  related: { table: string; column: string; value: string | null };
}

/** Feed columns already shown elsewhere on the page. */
const RAW_DATA_HIDDEN_KEYS = new Set([
  'ITEMID', 'ITEMNAME', 'ITEMPRICE', 'AVAILTOSELL', 'Image Url',
  'IMAGEURL2', 'IMAGEURL3', 'IMAGEURL4', 'IMAGEURL5', 'PRODCAT', 'Brand',
]);

export function htmlToText(html: string): string {
  const text = new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
  return text.replace(/\s+/g, ' ').trim();
}

function specLabel(key: string): string {
  const spaced = key.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function toSpecRows(source: Record<string, unknown> | null | undefined, hidden?: Set<string>) {
  return Object.entries(source ?? {})
    .filter(([key, value]) => !hidden?.has(key) && value !== null && value !== undefined && String(value).trim() !== '')
    .map(([key, value]) => ({ label: specLabel(key), value: String(value) }));
}

function present(rows: { label: string; value: string | number | null | undefined }[]) {
  return rows
    .filter((row) => row.value !== null && row.value !== undefined && String(row.value).trim() !== '')
    .map((row) => ({ label: row.label, value: String(row.value) }));
}

function looksLikeHtml(value: string): boolean {
  return /<[a-z][^>]*>/i.test(value);
}

function toDescription(value: string | null | undefined): ProductDescription | null {
  if (!value?.trim()) return null;
  return { kind: looksLikeHtml(value) ? 'html' : 'text', value };
}

function uniqueImages(...sources: unknown[]): string[] {
  const urls = sources.flatMap((source) => (Array.isArray(source) ? source : [source]));
  return [...new Set(urls.filter((url): url is string => typeof url === 'string' && url.length > 0))];
}

function fromEsquire(product: Product): ProductDetail {
  const view = toProductView(product, 'esquire');
  const summary = product.ProductSummary || null;

  const crumbs: ProductCrumb[] = [{ label: 'Home', to: '/' }, { label: 'Shop', to: '/shop' }];
  if (product.CategoryHead) crumbs.push({ label: product.CategoryHead, to: `/shop/home?categoryHead=${encodeURIComponent(product.CategoryHead)}` });
  if (product.Category) crumbs.push({ label: product.Category, to: `/shop/home?category=${encodeURIComponent(product.Category)}` });
  crumbs.push({ label: view.name });

  const plainDescription = product.ProductDescription ? htmlToText(product.ProductDescription).slice(0, 300) : null;

  return {
    view,
    images: uniqueImages(view.image, product.images),
    summary,
    description: toDescription(product.ProductDescription) ?? toDescription(product.ProductSummary),
    specs: present([
      { label: 'Product code', value: product.ProductCode },
      { label: 'Brand', value: product.Brand },
      { label: 'Category', value: product.Category },
      { label: 'Condition', value: product.Condition },
      { label: 'Length', value: product.LengthCM ? `${product.LengthCM} cm` : null },
      { label: 'Width', value: product.WidthCM ? `${product.WidthCM} cm` : null },
      { label: 'Height', value: product.HeightCM ? `${product.HeightCM} cm` : null },
      { label: 'Weight', value: product.MassKG ? `${product.MassKG} kg` : null },
    ]),
    warrantyMonths: null,
    condition: product.Condition,
    crumbs,
    backRoute: '/shop/home',
    seoDescription: summary || plainDescription || `${view.name} — shop at SPET Online.`,
    canonicalPath: view.href,
    related: { table: 'products', column: 'Category', value: product.Category },
  };
}

function fromSupplier(product: Product, supplier: SupplierKey): ProductDetail {
  const config = SUPPLIERS[supplier];
  const view = toProductView(product, supplier);
  const summary = product.short_description ? htmlToText(product.short_description) : null;

  const specSource =
    config.specSource === 'raw_data' ? toSpecRows(product.raw_data, RAW_DATA_HIDDEN_KEYS) : toSpecRows(product.specifications);

  const crumbs: ProductCrumb[] = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    { label: config.label, to: config.route },
  ];
  if (product.category) crumbs.push({ label: product.category, to: `${config.route}?category=${encodeURIComponent(product.category)}` });
  crumbs.push({ label: view.name });

  return {
    view,
    images: uniqueImages(product.thumbnail_url, product.images, firstImage(product.images)),
    summary,
    description: toDescription(product.full_description) ?? toDescription(product.short_description),
    specs: [
      ...specSource,
      ...present([
        { label: 'Colour', value: product.colour },
        { label: 'SKU', value: product.sku },
      ]),
    ],
    warrantyMonths: product.warranty_months ?? null,
    condition: view.note,
    crumbs,
    backRoute: config.route,
    seoDescription: summary?.slice(0, 300) || `${view.name} — shop at SPET Online.`,
    canonicalPath: view.href,
    related: { table: config.table, column: 'category', value: product.category ?? null },
  };
}

export function useProductDetail(supplier: ProductSupplier, idOrSlug: string | undefined) {
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const request =
      supplier === 'esquire'
        ? fetchProductBySlug(idOrSlug).then(({ data }) => (data ? fromEsquire(data) : null))
        : Promise.resolve(supabase.from(SUPPLIERS[supplier].table).select('*').eq('id', idOrSlug).single()).then(({ data }) =>
            data ? fromSupplier(data as Product, supplier) : null
          );

    request.then((result) => {
      if (cancelled) return;
      setDetail(result);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [supplier, idOrSlug]);

  return { detail, loading };
}

/** Up to four other active products from the same category. */
export function useRelatedProducts(related: ProductDetail['related'] | undefined, currentId: string | undefined) {
  const [products, setProducts] = useState<Product[]>([]);

  const table = related?.table;
  const column = related?.column;
  const value = related?.value;

  useEffect(() => {
    if (!table || !column || !value) {
      setProducts([]);
      return;
    }

    let cancelled = false;
    supabase
      .from(table)
      .select('*')
      .eq('is_active', true)
      .eq(column, value)
      .limit(5)
      .then(({ data }) => {
        if (cancelled) return;
        setProducts(((data ?? []) as Product[]).filter((product) => product.id !== currentId).slice(0, 4));
      });

    return () => {
      cancelled = true;
    };
  }, [table, column, value, currentId]);

  return products;
}

export interface WishlistProduct {
  product: Product;
  supplier: ProductSupplier;
}

/** Loads saved products by ID from every catalogue table. */
export function useWishlistProducts(ids: string[]) {
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const key = [...ids].sort().join(',');

  useEffect(() => {
    if (!key) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const idList = key.split(',');
    const sources: { table: string; supplier: ProductSupplier }[] = [
      { table: 'products', supplier: 'esquire' },
      ...Object.values(SUPPLIERS).map((config) => ({ table: config.table, supplier: config.key })),
    ];

    Promise.all(
      sources.map(async ({ table, supplier }) => {
        const { data } = await supabase.from(table).select('*').eq('is_active', true).in('id', idList);
        return ((data ?? []) as Product[]).map((product) => ({ product, supplier }));
      })
    ).then((groups) => {
      if (cancelled) return;
      setItems(groups.flat());
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return { items, loading };
}
