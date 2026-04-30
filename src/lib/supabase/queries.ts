/**
 * Server-only Supabase data access helpers.
 * - Used by RSC pages and server actions.
 * - Returns mapped domain types for backward compatibility with existing UI.
 * - Reads rely on RLS: anon/authenticated session is enough; admin-only reads
 *   work because admin's session passes the `is_admin()` policy check.
 */
import "server-only";

import { createSupabaseServerClient, createSupabaseAdminClient } from "./server";
import type {
  CategoryRow,
  CouponRow,
  DepositRow,
  InventoryItemRow,
  OrderItemRow,
  OrderRow,
  ProductRow,
  ProfileRow,
  ReferralRow,
  SupportTicketRow,
  WithdrawRow,
} from "./types";
import {
  mapCategory,
  mapCoupon,
  mapDeposit,
  mapInventory,
  mapOrder,
  mapProduct,
  mapProfileToUser,
  mapReferral,
  mapTicket,
  mapWithdraw,
} from "../mappers";
import type {
  Category,
  Coupon,
  Deposit,
  DigitalItem,
  Order,
  Product,
  ReferralEvent,
  SupportTicket,
  User,
  Withdraw,
} from "../types";

// ============================================================================
// Categories
// ============================================================================
export async function getAllCategories(): Promise<Category[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as CategoryRow[]).map(mapCategory);
}

// ============================================================================
// Products
// ============================================================================
export async function getAllProducts(opts?: {
  includeInactive?: boolean;
}): Promise<Product[]> {
  const sb = createSupabaseServerClient();
  let q = sb.from("products").select("*").order("created_at", { ascending: false });
  if (!opts?.includeInactive) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as ProductRow) : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as ProductRow) : null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("products")
    .select("*")
    .in("id", ids);
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("products")
    .select("*")
    .eq("active", true)
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

// ============================================================================
// Inventory (admin: row-level; users get aggregate via stockCount)
// ============================================================================
export async function getStockCountByProduct(): Promise<Record<string, number>> {
  // Admin client bypasses RLS so users can see stock numbers (only counts, not payloads).
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("inventory_items")
    .select("product_id")
    .eq("status", "available");
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { product_id: string }[]) {
    counts[row.product_id] = (counts[row.product_id] ?? 0) + 1;
  }
  return counts;
}

export async function getStockForProduct(productId: string): Promise<number> {
  const sb = createSupabaseAdminClient();
  const { count, error } = await sb
    .from("inventory_items")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId)
    .eq("status", "available");
  if (error) throw error;
  return count ?? 0;
}

export async function getInventoryForProduct(
  productId: string,
): Promise<DigitalItem[]> {
  // admin-only
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("inventory_items")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as InventoryItemRow[]).map(mapInventory);
}

// ============================================================================
// Coupons
// ============================================================================
export async function getCouponByCode(code: string): Promise<Coupon | null> {
  if (!code) return null;
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("coupons")
    .select("*")
    .ilike("code", code)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapCoupon(data as CouponRow) : null;
}

export async function getAllCoupons(): Promise<Coupon[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as CouponRow[]).map(mapCoupon);
}

// ============================================================================
// Profiles
// ============================================================================
export async function getProfileById(id: string): Promise<User | null> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfileToUser(data as ProfileRow) : null;
}

export async function getAllProfiles(): Promise<User[]> {
  // Admin-only via RLS (admin sees all)
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ProfileRow[]).map(mapProfileToUser);
}

export async function getProfilesByIds(ids: string[]): Promise<User[]> {
  if (ids.length === 0) return [];
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .in("id", ids);
  if (error) throw error;
  return ((data ?? []) as ProfileRow[]).map(mapProfileToUser);
}

export async function getResellerByReferralCode(
  code: string,
): Promise<User | null> {
  if (!code) return null;
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .ilike("referral_code", code)
    .eq("role", "reseller")
    .eq("reseller_status", "approved")
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfileToUser(data as ProfileRow) : null;
}

// ============================================================================
// Orders
// ============================================================================
async function attachOrderItems(rows: OrderRow[]): Promise<Order[]> {
  if (rows.length === 0) return [];
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("order_items")
    .select("*")
    .in(
      "order_id",
      rows.map((r) => r.id),
    );
  if (error) throw error;
  const itemsByOrder: Record<string, OrderItemRow[]> = {};
  for (const it of (data ?? []) as OrderItemRow[]) {
    (itemsByOrder[it.order_id] ||= []).push(it);
  }
  return rows.map((r) => mapOrder(r, itemsByOrder[r.id] ?? []));
}

export async function getOrderById(id: string): Promise<Order | null> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const list = await attachOrderItems([data as OrderRow]);
  return list[0] ?? null;
}

export async function getOrdersForUser(
  userId: string,
  limit?: number,
): Promise<Order[]> {
  const sb = createSupabaseServerClient();
  let q = sb
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return attachOrderItems(((data ?? []) as OrderRow[]));
}

export async function getAllOrders(limit?: number): Promise<Order[]> {
  const sb = createSupabaseServerClient();
  let q = sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return attachOrderItems(((data ?? []) as OrderRow[]));
}

// ============================================================================
// Deposits
// ============================================================================
export async function getDepositsForUser(
  userId: string,
  limit?: number,
): Promise<Deposit[]> {
  const sb = createSupabaseServerClient();
  let q = sb
    .from("deposits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return ((data ?? []) as DepositRow[]).map(mapDeposit);
}

export async function getAllDeposits(limit?: number): Promise<Deposit[]> {
  const sb = createSupabaseServerClient();
  let q = sb
    .from("deposits")
    .select("*")
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return ((data ?? []) as DepositRow[]).map(mapDeposit);
}

// ============================================================================
// Withdraws
// ============================================================================
export async function getWithdrawsForUser(
  userId: string,
  limit?: number,
): Promise<Withdraw[]> {
  const sb = createSupabaseServerClient();
  let q = sb
    .from("withdraws")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return ((data ?? []) as WithdrawRow[]).map(mapWithdraw);
}

export async function getAllWithdraws(limit?: number): Promise<Withdraw[]> {
  const sb = createSupabaseServerClient();
  let q = sb
    .from("withdraws")
    .select("*")
    .order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error) throw error;
  return ((data ?? []) as WithdrawRow[]).map(mapWithdraw);
}

// ============================================================================
// Tickets
// ============================================================================
export async function getTicketsForUser(
  userId: string,
): Promise<SupportTicket[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("support_tickets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as SupportTicketRow[]).map(mapTicket);
}

export async function getAllTickets(): Promise<SupportTicket[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as SupportTicketRow[]).map(mapTicket);
}

// ============================================================================
// Referrals
// ============================================================================
export async function getReferralsForUser(
  userId: string,
): Promise<ReferralEvent[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("referrals")
    .select("*")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ReferralRow[]).map(mapReferral);
}
