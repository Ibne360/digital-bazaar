/**
 * Mappers: convert Supabase row types (snake_case) into existing domain types
 * (camelCase) used across pages. This lets us keep page code largely unchanged
 * after migrating from JSON-file backend to Supabase.
 */
import type {
  Category,
  Coupon,
  Deposit,
  DigitalItem,
  Order,
  OrderItem,
  Product,
  SupportTicket,
  User,
  Withdraw,
} from "./types";
import type {
  CategoryRow,
  CouponRow,
  DepositRow,
  InventoryItemRow,
  OrderItemRow,
  OrderRow,
  ProductRow,
  ProfileRow,
  SupportTicketRow,
  WithdrawRow,
} from "./supabase/types";

const num = (x: unknown): number => {
  // Postgres numeric is returned as string by supabase-js; coerce to number.
  if (typeof x === "number") return x;
  if (typeof x === "string") return Number(x) || 0;
  return 0;
};

export function mapProfileToUser(row: ProfileRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: "", // not used in Supabase Auth flow; kept for type compat
    role: row.role,
    walletBalance: num(row.wallet_balance),
    createdAt: row.created_at,
  };
}

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    description: row.description,
    color: row.color,
  };
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    shortDescription: row.short_description,
    description: row.description,
    retailPrice: num(row.retail_price),
    duration: row.duration,
    warranty: row.warranty,
    deliveryType: row.delivery_type,
    deliveryInstructions: row.delivery_instructions,
    badges: row.badges ?? [],
    imageUrl: row.image_url ?? undefined,
    iconBg: row.icon_bg,
    featured: row.featured,
    active: row.active,
    createdAt: row.created_at,
  };
}

export function mapInventory(row: InventoryItemRow): DigitalItem {
  return {
    id: row.id,
    productId: row.product_id,
    payload: row.payload,
    status: row.status,
    deliveredAt: row.delivered_at ?? undefined,
    orderId: row.order_id ?? undefined,
  };
}

export function mapOrderItem(row: OrderItemRow): OrderItem {
  return {
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    unitPrice: num(row.unit_price),
    total: num(row.total),
    deliveredItems: Array.isArray(row.delivered_payloads)
      ? row.delivered_payloads
      : [],
  };
}

export function mapOrder(
  row: OrderRow,
  items: OrderItemRow[] = [],
): Order {
  return {
    id: row.id,
    userId: row.user_id,
    items: items.map(mapOrderItem),
    subtotal: num(row.subtotal),
    discount: num(row.discount),
    total: num(row.total),
    status: row.status,
    walletBalanceBefore: num(row.wallet_balance_before),
    walletBalanceAfter: num(row.wallet_balance_after),
    couponCode: row.coupon_code ?? undefined,
    createdAt: row.created_at,
    paidAt: row.paid_at ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
  };
}

export function mapDeposit(row: DepositRow): Deposit {
  return {
    id: row.id,
    userId: row.user_id,
    amount: num(row.amount),
    method: row.method,
    transactionId: row.transaction_id,
    senderInfo: row.sender_info ?? undefined,
    screenshotUrl: row.screenshot_url ?? undefined,
    note: row.note ?? undefined,
    status: row.status,
    adminNote: row.admin_note ?? undefined,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}

export function mapWithdraw(row: WithdrawRow): Withdraw {
  return {
    id: row.id,
    userId: row.user_id,
    amount: num(row.amount),
    method: row.method,
    destination: row.destination,
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}

export function mapTicket(row: SupportTicketRow): SupportTicket {
  return {
    id: row.id,
    userId: row.user_id,
    orderId: row.order_id ?? undefined,
    subject: row.subject,
    message: row.message,
    status: row.status,
    reply: row.reply ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCoupon(row: CouponRow): Coupon {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: num(row.value),
    active: row.active,
    expiresAt: row.expires_at ?? undefined,
  };
}

