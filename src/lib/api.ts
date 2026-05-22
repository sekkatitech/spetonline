import { useState, useEffect } from 'react';
import { supabase } from './supabase';

// ─── Products ───────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  ProductName: string;
  ProductCode: string;
  Category: string | null;
  Price: number;
  AvailableQty: number;
  Condition: string | null;
  Brand: string | null;
  Location: string | null;
  image: string | null;
  images: any;
  ShippingProductClass: string | null;
  ProductSummary: string | null;
  ProductDescription: string | null;
  LengthCM: number | null;
  WidthCM: number | null;
  HeightCM: number | null;
  MassKG: number | null;
  CategoryHead: string | null;
  slug: string;
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  sale_price: number | null;
}

export interface ShopFilters {
  search?: string;
  brands?: string[];
  categories?: string[];
  categoryHeads?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'featured';
  page?: number;
  perPage?: number;
}

export async function fetchProducts(filters: ShopFilters = {}) {
  const { search, brands, categories, categoryHeads, minPrice, maxPrice, inStockOnly, sortBy = 'newest', page = 1, perPage = 20 } = filters;

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  if (search) {
    query = query.ilike('ProductName', `%${search}%`);
  }
  if (brands && brands.length > 0) {
    query = query.in('Brand', brands);
  }
  if (categories && categories.length > 0) {
    query = query.in('Category', categories);
  }
  if (categoryHeads && categoryHeads.length > 0) {
    query = query.in('CategoryHead', categoryHeads);
  }
  if (minPrice !== undefined) {
    query = query.gte('Price', minPrice);
  }
  if (maxPrice !== undefined) {
    query = query.lte('Price', maxPrice);
  }
  if (inStockOnly) {
    query = query.gt('AvailableQty', 0);
  }

  switch (sortBy) {
    case 'price_asc':
      query = query.order('Price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('Price', { ascending: false });
      break;
    case 'featured':
      query = query.order('is_featured', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data, error, count } = await query;
  return { data: (data as Product[]) ?? [], error, count: count ?? 0 };
}

export function useProducts(filters: ShopFilters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProducts(filters).then(({ data, error, count }) => {
      if (cancelled) return;
      if (error) setError(error.message);
      else { setProducts(data); setTotal(count); }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [JSON.stringify(filters)]);

  return { products, loading, error, total };
}

export async function fetchProductBySlug(slug: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  let query = supabase.from('products').select('*').eq('is_active', true);
  if (isUuid) {
    query = query.eq('id', slug);
  } else {
    query = query.eq('slug', slug);
  }
  const { data, error } = await query.single();
  return { data: data as Product | null, error };
}

// ─── Brands (distinct from products table) ──────────────────────────────────

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('Brand')
      .eq('is_active', true)
      .not('Brand', 'is', null)
      .then(({ data }) => {
        // Get unique brands
        const uniqueBrands = [...new Set((data ?? []).map((d: any) => d.Brand).filter(Boolean))].sort();
        setBrands(uniqueBrands.map((name: string) => ({
          id: name,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          logo_url: null,
        })));
        setLoading(false);
      });
  }, []);

  return { brands, loading };
}

// ─── Categories (distinct from products table) ───────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('Category, CategoryHead')
      .eq('is_active', true)
      .not('Category', 'is', null)
      .then(({ data }) => {
        // Get unique categories
        const uniqueCats = [...new Set((data ?? []).map((d: any) => d.Category).filter(Boolean))].sort();
        setCategories(uniqueCats.map((name: string) => {
          const parentRow = (data ?? []).find((d: any) => d.Category === name);
          return {
            id: name,
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            image_url: null,
            parent_id: parentRow?.CategoryHead || null,
          };
        }));
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}

// ─── Category Heads (top-level categories) ───────────────────────────────────

export function useCategoryHeads() {
  const [categoryHeads, setCategoryHeads] = useState<string[]>([]);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('products')
      .select('CategoryHead, image')
      .eq('is_active', true)
      .not('CategoryHead', 'is', null)
      .not('image', 'is', null)
      .then(({ data }) => {
        const unique = [...new Set((data ?? []).map((d: any) => d.CategoryHead).filter(Boolean))].sort();
        const imagesMap: Record<string, string> = {};
        for (const item of data ?? []) {
          if (item.CategoryHead && item.image) {
            if (!item.image.includes('laptop-add-1') && !item.image.includes('laptop-add')) {
              imagesMap[item.CategoryHead] = item.image;
            }
          }
        }
        setCategoryHeads(unique as string[]);
        setCategoryImages(imagesMap);
        setLoading(false);
      });
  }, []);

  return { categoryHeads, categoryImages, loading };
}

// ─── Promotions ──────────────────────────────────────────────────────────────

export interface Promotion {
  id: string;
  name: string;
  type: string;
  value: number | null;
  code: string | null;
  starts_at: string | null;
  ends_at: string | null;
  min_order_value: number | null;
}

export function useActivePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Promotions table may not exist yet, so handle gracefully
    supabase
      .from('promotions')
      .select('id, name, type, value, code, starts_at, ends_at, min_order_value')
      .eq('is_active', true)
      .then(({ data, error }) => {
        if (error) {
          // Table doesn't exist yet, that's fine
          setPromotions([]);
        } else {
          setPromotions(data ?? []);
        }
        setLoading(false);
      });
  }, []);

  return { promotions, loading };
}

export async function validatePromoCode(code: string, orderTotal: number) {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !data) return { valid: false, message: 'Invalid promo code.' };

  if (data.starts_at && new Date(data.starts_at) > new Date()) return { valid: false, message: 'This promo has not started yet.' };
  if (data.ends_at && new Date(data.ends_at) < new Date()) return { valid: false, message: 'This promo has expired.' };
  if (data.min_order_value && orderTotal < data.min_order_value) return { valid: false, message: `Minimum order of R${data.min_order_value.toFixed(2)} required.` };
  if (data.max_uses && data.uses_count >= data.max_uses) return { valid: false, message: 'This promo code has reached its usage limit.' };

  let discount = 0;
  if (data.type === 'percentage' && data.value) discount = orderTotal * (data.value / 100);
  if (data.type === 'fixed' && data.value) discount = data.value;

  return { valid: true, discount, promotion: data, message: `${data.name} applied!` };
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function createOrder(orderData: {
  profile_id: string | null;
  items: { product_id: string; product_name: string; sku: string; qty: number; unit_price: number }[];
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  total: number;
  promotion_id: string | null;
  shipping_address: any;
}) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: orderData.profile_id,
      status: 'pending',
      subtotal: orderData.subtotal,
      discount_amount: orderData.discount_amount,
      shipping: orderData.shipping_cost,
      vat_amount: orderData.tax_amount,
      total: orderData.total,
      promotion_id: orderData.promotion_id,
    })
    .select()
    .single();

  if (orderError || !order) return { error: orderError };

  const orderItems = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    sku: item.sku,
    qty: item.qty,
    unit_price: item.unit_price,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) return { error: itemsError };

  const mappedOrder = {
    ...order,
    order_number: `SPET-${order.id.slice(0, 8).toUpperCase()}`,
    profile_id: order.user_id,
    shipping_cost: order.shipping,
    tax_amount: order.vat_amount,
  };

  return { order: mappedOrder, error: null };
}

export function useOrders(profileId: string | null) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', profileId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const mapped = (data ?? []).map((o: any) => ({
          ...o,
          order_number: `SPET-${o.id.slice(0, 8).toUpperCase()}`,
          profile_id: o.user_id,
          shipping_cost: o.shipping,
          tax_amount: o.vat_amount,
        }));
        setOrders(mapped);
        setLoading(false);
      });
  }, [profileId]);

  return { orders, loading };
}

// ─── Addresses ───────────────────────────────────────────────────────────────

export function useAddresses(profileId: string | null) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) { setLoading(false); return; }
    supabase
      .from('addresses')
      .select('*')
      .eq('profile_id', profileId)
      .order('is_default', { ascending: false })
      .then(({ data }) => {
        setAddresses(data ?? []);
        setLoading(false);
      });
  }, [profileId]);

  async function saveAddress(addr: any) {
    if (addr.id) {
      const { data } = await supabase.from('addresses').update(addr).eq('id', addr.id).select().single();
      setAddresses((prev) => prev.map((a) => (a.id === addr.id ? data : a)));
    } else {
      const { data } = await supabase.from('addresses').insert({ ...addr, profile_id: profileId }).select().single();
      if (data) setAddresses((prev) => [...prev, data]);
    }
  }

  return { addresses, loading, saveAddress };
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export function useWishlist(profileId: string | null) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (!profileId) return;
    supabase.from('wishlists').select('product_id').eq('profile_id', profileId)
      .then(({ data }) => setWishlist(data?.map((w) => w.product_id) ?? []));
  }, [profileId]);

  async function toggleWishlist(productId: string) {
    if (!profileId) return;
    if (wishlist.includes(productId)) {
      await supabase.from('wishlists').delete().eq('profile_id', profileId).eq('product_id', productId);
      setWishlist((prev) => prev.filter((id) => id !== productId));
    } else {
      await supabase.from('wishlists').insert({ profile_id: profileId, product_id: productId });
      setWishlist((prev) => [...prev, productId]);
    }
  }

  return { wishlist, toggleWishlist };
}
