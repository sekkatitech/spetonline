import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          profile_id: string;
          label: string;
          full_name: string;
          phone: string | null;
          address_line1: string;
          address_line2: string | null;
          city: string;
          province: string;
          postal_code: string;
          country: string;
          is_default: boolean;
          created_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          profile_id: string | null;
          status: string;
          subtotal: number;
          discount_amount: number;
          shipping_cost: number;
          tax_amount: number;
          total: number;
          promotion_id: string | null;
          shipping_address: any;
          billing_address: any;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          product_name: string;
          sku: string;
          qty: number;
          unit_price: number;
          total: number;
        };
      };
      carts: {
        Row: {
          id: string;
          profile_id: string | null;
          session_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      wishlists: {
        Row: {
          id: string;
          profile_id: string;
          product_id: string;
          created_at: string;
        };
      };
      promotions: {
        Row: {
          id: string;
          name: string;
          type: string;
          value: number | null;
          code: string | null;
          starts_at: string | null;
          ends_at: string | null;
          is_active: boolean;
          min_order_value: number | null;
          max_uses: number | null;
          uses_count: number;
          created_at: string;
        };
      };
    };
  };
};
