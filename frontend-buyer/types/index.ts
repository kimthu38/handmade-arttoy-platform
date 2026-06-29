// ─── API Envelope ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'buyer' | 'vendor' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  provider: string | null;
  created_at: string;
}

export interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  street: string;
  ward: string | null;
  district: string;
  city: string;
  is_default: boolean;
}

export interface AuthResult {
  access_token: string;
  user: User;
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ShopSummary {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string; // Decimal serialized as string
  stock: number;
  images: string[];
  video_url: string | null;
  materials: string[];
  // Domain-specific
  is_preorder: boolean;
  estimated_days: number | null;
  allow_custom: boolean;
  // Relations
  shop: ShopSummary;
  category: Category | null;
  created_at: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  custom_note: string | null;
  product: Product;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type PaymentMethod = 'cod' | 'vnpay' | 'momo';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus =
  | 'awaiting_confirmation'
  | 'ready_to_ship'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  unit_price: string;
  quantity: number;
  custom_note: string | null;
}

export interface SubOrder {
  id: string;
  shop_id: string;
  subtotal: string;
  shipping_fee: string;
  status: OrderStatus;
  tracking_number: string | null;
  items: OrderItem[];
  shop: { name: string; slug: string };
}

export interface Order {
  id: string;
  total_amount: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  shipping_address: Address;
  sub_orders: SubOrder[];
  created_at: string;
}
