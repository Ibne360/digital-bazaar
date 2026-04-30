/**
 * Supabase row types — kept in sync with `supabase/schema.sql`.
 * Whenever the backend AI updates the schema, request the regenerated types
 * (or run `supabase gen types typescript --project-id lgsxwrpluxupofyufekd`).
 */

export type UserRole = "user" | "reseller" | "admin";
export type ResellerStatus = "none" | "pending" | "approved" | "rejected";
export type DeliveryType =
  | "account"
  | "license_key"
  | "invite_link"
  | "credits"
  | "manual";
export type DepositMethod =
  | "bkash"
  | "nagad"
  | "rocket"
  | "bank"
  | "binance"
  | "usdt";
export type DepositStatus = "pending" | "approved" | "rejected";
export type WithdrawStatus = "pending" | "approved" | "rejected";
export type OrderStatus =
  | "pending"
  | "paid"
  | "delivered"
  | "refunded"
  | "failed";
export type TicketStatus = "open" | "answered" | "closed";

export interface ProfileRow {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  reseller_status: ResellerStatus;
  wallet_balance: number;
  total_earned: number;
  referral_code: string | null;
  created_at: string;
}

export interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  created_at: string;
}

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  short_description: string;
  description: string;
  retail_price: number;
  wholesale_price: number;
  duration: string;
  warranty: string;
  delivery_type: DeliveryType;
  delivery_instructions: string;
  badges: string[];
  image_url: string | null;
  icon_bg: string;
  featured: boolean;
  active: boolean;
  created_at: string;
}

export interface InventoryItemRow {
  id: string;
  product_id: string;
  payload: string;
  status: "available" | "delivered" | "reserved";
  delivered_at: string | null;
  order_id: string | null;
  created_at: string;
}

export interface OrderRow {
  id: string;
  user_id: string;
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  wallet_balance_before: number;
  wallet_balance_after: number;
  is_reseller: boolean;
  coupon_code: string | null;
  created_at: string;
  paid_at: string | null;
  delivered_at: string | null;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  delivered_payloads: { itemId: string; payload: string }[];
  created_at: string;
}

export interface DepositRow {
  id: string;
  user_id: string;
  amount: number;
  method: DepositMethod;
  transaction_id: string;
  sender_info: string | null;
  screenshot_url: string | null;
  note: string | null;
  status: DepositStatus;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface WithdrawRow {
  id: string;
  user_id: string;
  amount: number;
  method: DepositMethod;
  destination: string;
  status: WithdrawStatus;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface SupportTicketRow {
  id: string;
  user_id: string;
  order_id: string | null;
  subject: string;
  message: string;
  status: TicketStatus;
  reply: string | null;
  created_at: string;
  updated_at: string;
}

export interface CouponRow {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface ReferralRow {
  id: string;
  referrer_id: string;
  order_id: string;
  amount: number;
  commission: number;
  created_at: string;
}
