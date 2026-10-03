export type Currency = 'SDG' | 'USD' | 'SAR';
export type ProductStatus = 'active' | 'sold' | 'expired' | 'banned';
export type UserRole = 'trader' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  state: string | null;
  city: string | null;
  is_verified: boolean;
  is_banned: boolean;
  rating_avg: number;
  rating_count: number;
}

export interface Category {
  id: number;
  slug: string;
  name_ar: string;
  icon: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  trader_id: string;
  name: string;
  description: string | null;
  category_id: number | null;
  emoji: string | null;
  qty: number;
  unit: string;
  price: number;
  currency: Currency;
  price_usd: number | null;
  state: string;
  city: string | null;
  market: string | null;
  min_order: number;
  status: ProductStatus;
  views_count: number;
  whatsapp_clicks: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
  trader_name?: string;
  trader_phone?: string;
  trader_rating?: number;
  trader_rating_count?: number;
  trader_verified?: boolean;
  category_name?: string;
  category_slug?: string;
  category_icon?: string;
}

export interface Report {
  id: string;
  product_id: string;
  reporter_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  product?: { name: string };
  reporter?: { full_name: string };
}

export const STATES = [
  'الخرطوم', 'الجزيرة', 'البحر الأحمر', 'كسلا', 'القضارف', 'سنار',
  'النيل الأزرق', 'النيل الأبيض', 'شمال كردفان', 'جنوب كردفان',
  'غرب كردفان', 'شمال دارفور', 'جنوب دارفور', 'غرب دارفور',
  'شرق دارفور', 'وسط دارفور', 'نهر النيل', 'الشمالية'
] as const;

export const UNITS = [
  'قطعة', 'كيلو', 'جرام', 'لتر', 'جوال', 'كرتون', 'طن', 'متر', 'علبة'
] as const;
