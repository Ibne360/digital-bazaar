export type UserRole = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  walletBalance: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  color: string;
}

export type DeliveryType =
  | "account"
  | "license_key"
  | "invite_link"
  | "credits"
  | "manual";

export interface DigitalItem {
  id: string;
  productId: string;
  payload: string;
  status: "available" | "delivered" | "reserved";
  deliveredAt?: string;
  orderId?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  retailPrice: number;
  duration: string;
  warranty: string;
  deliveryType: DeliveryType;
  deliveryInstructions: string;
  badges: string[];
  imageUrl?: string;
  iconBg: string;
  featured: boolean;
  active: boolean;
  createdAt: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  deliveredItems: { itemId: string; payload: string }[];
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "delivered"
  | "refunded"
  | "failed";

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  walletBalanceBefore: number;
  walletBalanceAfter: number;
  couponCode?: string;
  createdAt: string;
  paidAt?: string;
  deliveredAt?: string;
}

export type DepositMethod =
  | "bkash"
  | "nagad"
  | "rocket"
  | "bank"
  | "binance"
  | "usdt";

export type DepositStatus = "pending" | "approved" | "rejected";

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  method: DepositMethod;
  transactionId: string;
  senderInfo?: string;
  screenshotUrl?: string;
  note?: string;
  status: DepositStatus;
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

export type WithdrawStatus = "pending" | "approved" | "rejected";

export interface Withdraw {
  id: string;
  userId: string;
  amount: number;
  method: DepositMethod;
  destination: string;
  status: WithdrawStatus;
  createdAt: string;
  reviewedAt?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  orderId?: string;
  subject: string;
  message: string;
  status: "open" | "answered" | "closed";
  reply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  expiresAt?: string;
}

export interface Database {
  users: User[];
  categories: Category[];
  products: Product[];
  inventory: DigitalItem[];
  orders: Order[];
  deposits: Deposit[];
  withdraws: Withdraw[];
  tickets: SupportTicket[];
  coupons: Coupon[];
}

export interface SessionPayload {
  userId: string;
  role: UserRole;
  email: string;
  name: string;
}
