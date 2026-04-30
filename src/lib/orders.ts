import "server-only";
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "./supabase/server";
import { getCouponByCode, getProductsByIds } from "./supabase/queries";
import type { CartLine, Product, User } from "./types";

/** Decide unit price based on whether the user is an approved reseller. */
export function priceFor(product: Product, user: User | null): number {
  if (user && user.role === "reseller" && user.resellerStatus === "approved") {
    return product.wholesalePrice;
  }
  return product.retailPrice;
}

export interface CartView {
  lines: { product: Product; quantity: number; unit: number; total: number }[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  total: number;
  isReseller: boolean;
}

/**
 * Build a cart view from raw cart cookie lines + Supabase product/coupon data.
 * - Filters out invalid product IDs.
 * - Applies coupon if present and active.
 * - Applies wholesale pricing for approved resellers.
 */
export async function buildCartView(
  rawLines: CartLine[],
  user: User | null,
  couponCode?: string,
): Promise<CartView> {
  const ids = Array.from(new Set(rawLines.map((l) => l.productId)));
  const products = await getProductsByIds(ids);
  const productById = new Map(products.map((p) => [p.id, p]));

  const lines = rawLines
    .map((l) => {
      const product = productById.get(l.productId);
      if (!product) return null;
      const unit = priceFor(product, user);
      return {
        product,
        quantity: l.quantity,
        unit,
        total: unit * l.quantity,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  let discount = 0;
  let appliedCode: string | undefined;
  if (couponCode) {
    const coupon = await getCouponByCode(couponCode);
    if (coupon) {
      appliedCode = coupon.code;
      discount =
        coupon.type === "percent"
          ? Math.round(subtotal * (coupon.value / 100) * 100) / 100
          : Math.min(coupon.value, subtotal);
    }
  }
  const total = Math.max(0, subtotal - discount);
  return {
    lines,
    subtotal,
    discount,
    couponCode: appliedCode,
    total,
    isReseller: user?.role === "reseller" && user.resellerStatus === "approved",
  };
}

export interface CheckoutInput {
  userId: string;
  rawLines: CartLine[];
  couponCode?: string;
  referralCode?: string;
}

export class InsufficientFundsError extends Error {
  needed: number;
  balance: number;
  constructor(needed: number, balance: number) {
    super("Insufficient wallet balance");
    this.needed = needed;
    this.balance = balance;
  }
}

/**
 * Atomic wallet checkout via the `checkout_with_wallet` RPC.
 * Uses the admin client so the function runs with elevated privileges
 * (the RPC is SECURITY DEFINER but still needs auth.uid() context for some
 * checks; admin client is used to call by user_id explicitly).
 *
 * Returns the new order id (uuid).
 */
export async function checkout(input: CheckoutInput): Promise<string> {
  // Pre-flight: get current wallet balance + compute view to detect
  // InsufficientFunds early with helpful redirect data.
  const sb = createSupabaseServerClient();
  const { data: profile } = await sb
    .from("profiles")
    .select("wallet_balance, role, reseller_status")
    .eq("id", input.userId)
    .maybeSingle();
  if (!profile) throw new Error("User not found");

  const userStub: User = {
    id: input.userId,
    email: "",
    name: "",
    passwordHash: "",
    role: (profile as { role: User["role"] }).role,
    resellerStatus: (profile as { reseller_status: User["resellerStatus"] })
      .reseller_status,
    walletBalance: Number((profile as { wallet_balance: number }).wallet_balance),
    totalEarned: 0,
    createdAt: "",
  };
  const view = await buildCartView(input.rawLines, userStub, input.couponCode);
  if (view.lines.length === 0) throw new Error("Cart is empty");
  if (userStub.walletBalance < view.total) {
    throw new InsufficientFundsError(view.total, userStub.walletBalance);
  }

  // Call the atomic RPC. Admin client is used to bypass RLS; the RPC itself
  // takes p_user_id explicitly and locks the row.
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("checkout_with_wallet", {
    p_user_id: input.userId,
    p_lines: input.rawLines.map((l) => ({
      product_id: l.productId,
      quantity: l.quantity,
    })),
    p_coupon_code: input.couponCode ?? null,
    p_referral_code: input.referralCode ?? null,
  });

  if (error) {
    if (/insufficient/i.test(error.message)) {
      throw new InsufficientFundsError(view.total, userStub.walletBalance);
    }
    throw new Error(error.message);
  }
  if (!data) throw new Error("Checkout failed — no order id returned");
  return data as string;
}
