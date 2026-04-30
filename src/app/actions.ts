"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addToCart as cartAdd,
  removeFromCart as cartRemove,
  updateLineQuantity,
  clearCart,
  readCart,
} from "@/lib/cart";
import {
  getCurrentUser,
  registerUser,
  loginUser,
  destroySession,
} from "@/lib/auth";
import { checkout, InsufficientFundsError } from "@/lib/orders";
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "@/lib/supabase/server";
import { generateId, slugify, bdtToUsd, formatCurrency } from "@/lib/utils";
import type { DepositMethod, Product } from "@/lib/types";
import {
  MIN_DEPOSIT,
  MIN_DEPOSIT_BDT,
  MIN_WITHDRAW,
  BDT_PER_USD,
  depositMethodMeta,
} from "@/lib/constants";

async function requireAdmin() {
  const me = await getCurrentUser();
  if (!me || me.role !== "admin") throw new Error("Forbidden");
  return me;
}

export async function actionAddToCart(productId: string, quantity = 1) {
  cartAdd(productId, quantity);
  revalidatePath("/", "layout");
}

export async function actionUpdateCart(productId: string, quantity: number) {
  updateLineQuantity(productId, quantity);
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function actionRemoveFromCart(productId: string) {
  cartRemove(productId);
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function actionCheckout(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const couponCode = (formData.get("couponCode") as string | null) || undefined;
  const referralCode =
    (formData.get("referralCode") as string | null) || undefined;
  const lines = readCart();

  let orderId: string | null = null;
  try {
    orderId = await checkout({
      userId: user.id,
      rawLines: lines,
      couponCode,
      referralCode,
    });
    clearCart();
  } catch (e) {
    if (e instanceof InsufficientFundsError) {
      redirect(
        `/dashboard/deposit?need=${Math.ceil(e.needed - e.balance)}&from=checkout`,
      );
    }
    throw e;
  }
  revalidatePath("/", "layout");
  redirect(`/checkout/success?order=${orderId}`);
}

export async function actionBuyNow(productId: string, referralCode?: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/products/${productId}`);

  let orderId: string | null = null;
  try {
    orderId = await checkout({
      userId: user.id,
      rawLines: [{ productId, quantity: 1 }],
      referralCode,
    });
  } catch (e) {
    if (e instanceof InsufficientFundsError) {
      redirect(
        `/dashboard/deposit?need=${Math.ceil(e.needed - e.balance)}&from=product`,
      );
    }
    throw e;
  }
  revalidatePath("/", "layout");
  redirect(`/checkout/success?order=${orderId}`);
}

export async function actionRequestDeposit(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/deposit");

  const inputAmount = Number(formData.get("amount") || 0);
  const method = String(formData.get("method") || "") as DepositMethod;
  const transactionId = String(formData.get("transactionId") || "").trim();
  const senderInfo =
    String(formData.get("senderInfo") || "").trim() || null;
  const screenshotUrl =
    String(formData.get("screenshotUrl") || "").trim() || null;
  const userNote = String(formData.get("note") || "").trim();

  if (!method) throw new Error("Payment method required.");
  if (!transactionId) throw new Error("Transaction ID required.");

  const meta = depositMethodMeta(method);
  if (!meta) throw new Error("Invalid payment method.");

  // Convert pay-currency to USD (wallet base currency).
  let usdAmount: number;
  let conversionNote: string | null = null;
  if (meta.payCurrency === "BDT") {
    if (!Number.isFinite(inputAmount) || inputAmount < MIN_DEPOSIT_BDT) {
      throw new Error(
        `Minimum deposit is ৳${MIN_DEPOSIT_BDT} (= ${formatCurrency(MIN_DEPOSIT)}).`,
      );
    }
    usdAmount = bdtToUsd(inputAmount, BDT_PER_USD);
    conversionNote = `Paid ৳${inputAmount} via ${meta.label} @ ${BDT_PER_USD} BDT/USD → credited ${formatCurrency(usdAmount)}`;
  } else {
    if (!Number.isFinite(inputAmount) || inputAmount < MIN_DEPOSIT) {
      throw new Error(
        `Minimum deposit is ${formatCurrency(MIN_DEPOSIT)}.`,
      );
    }
    usdAmount = Math.round(inputAmount * 100) / 100;
  }

  const note = [conversionNote, userNote].filter(Boolean).join(" — ") || null;

  const sb = createSupabaseServerClient();
  const { error } = await sb.from("deposits").insert({
    user_id: user.id,
    amount: usdAmount,
    method,
    transaction_id: transactionId,
    sender_info: senderInfo,
    screenshot_url: screenshotUrl,
    note,
    status: "pending",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard", "layout");
  revalidatePath("/admin", "layout");
  redirect("/dashboard/deposit?ok=1");
}

export async function actionApproveDeposit(
  depositId: string,
  adminNote?: string,
) {
  await requireAdmin();
  const sb = createSupabaseServerClient();
  const { error } = await sb.rpc("approve_deposit", {
    p_deposit_id: depositId,
    p_admin_note: adminNote ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function actionRejectDeposit(
  depositId: string,
  adminNote?: string,
) {
  await requireAdmin();
  const sb = createSupabaseServerClient();
  const { error } = await sb.rpc("reject_deposit", {
    p_deposit_id: depositId,
    p_admin_note: adminNote ?? null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function actionRequestWithdraw(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/reseller/withdraw");
  const amount = Number(formData.get("amount") || 0);
  const method = String(formData.get("method") || "") as DepositMethod;
  const destination = String(formData.get("destination") || "").trim();
  if (amount < MIN_WITHDRAW)
    throw new Error(`Minimum withdraw is ${formatCurrency(MIN_WITHDRAW)}.`);
  if (!destination) throw new Error("Destination required");

  const sb = createSupabaseServerClient();
  const { error } = await sb.rpc("request_withdraw", {
    p_amount: amount,
    p_method: method,
    p_destination: destination,
  });
  if (error) {
    if (/insufficient/i.test(error.message))
      throw new Error("Insufficient balance");
    throw new Error(error.message);
  }
  revalidatePath("/reseller", "layout");
  revalidatePath("/admin", "layout");
}

export async function actionApproveWithdraw(withdrawId: string) {
  await requireAdmin();
  const sb = createSupabaseServerClient();
  const { error } = await sb.rpc("approve_withdraw", {
    p_withdraw_id: withdrawId,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
  revalidatePath("/reseller", "layout");
}

export async function actionRejectWithdraw(withdrawId: string) {
  await requireAdmin();
  const sb = createSupabaseServerClient();
  const { error } = await sb.rpc("reject_withdraw", {
    p_withdraw_id: withdrawId,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
  revalidatePath("/reseller", "layout");
}

export async function actionAdminAdjustBalance(
  userId: string,
  delta: number,
  _reason: string,
) {
  await requireAdmin();
  const admin = createSupabaseAdminClient();
  const { data: profile, error: readErr } = await admin
    .from("profiles")
    .select("wallet_balance")
    .eq("id", userId)
    .maybeSingle();
  if (readErr || !profile) throw new Error("User missing");
  const current = Number(
    (profile as { wallet_balance: number }).wallet_balance,
  );
  const next = Math.max(0, Math.round((current + delta) * 100) / 100);
  const { error } = await admin
    .from("profiles")
    .update({ wallet_balance: next })
    .eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export async function actionLogin(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/dashboard");
  await loginUser({ email, password });
  revalidatePath("/", "layout");
  redirect(next || "/dashboard");
}

export async function actionRegister(formData: FormData) {
  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  if (password.length < 6) throw new Error("Password must be at least 6 characters.");
  await registerUser({ name, email, password });
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function actionLogout() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function actionApplyReseller() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/reseller/apply");
  const sb = createSupabaseServerClient();
  const { error } = await sb
    .from("profiles")
    .update({ reseller_status: "pending" })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/reseller", "layout");
  redirect("/reseller");
}

export async function actionApproveReseller(userId: string) {
  await requireAdmin();
  const sb = createSupabaseServerClient();
  const { error } = await sb.rpc("approve_reseller", { p_user_id: userId });
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export async function actionRejectReseller(userId: string) {
  await requireAdmin();
  const sb = createSupabaseServerClient();
  const { error } = await sb.rpc("reject_reseller", { p_user_id: userId });
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export async function actionCreateTicket(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const orderId = (formData.get("orderId") as string | null) || null;
  if (!subject || !message) throw new Error("Subject and message required.");

  const sb = createSupabaseServerClient();
  const { error } = await sb.from("support_tickets").insert({
    user_id: user.id,
    order_id: orderId,
    subject,
    message,
    status: "open",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/support");
}

export async function actionReplyTicket(ticketId: string, reply: string) {
  await requireAdmin();
  const sb = createSupabaseServerClient();
  const { error } = await sb
    .from("support_tickets")
    .update({ reply, status: "answered", updated_at: new Date().toISOString() })
    .eq("id", ticketId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard/support");
}


export async function actionSaveProduct(formData: FormData) {
  await requireAdmin();
  const id = (formData.get("id") as string | null) || undefined;
  const name = String(formData.get("name") || "").trim();
  const categoryId = String(formData.get("categoryId") || "");
  const shortDescription = String(
    formData.get("shortDescription") || "",
  ).trim();
  const description = String(formData.get("description") || "").trim();
  const retailPrice = Number(formData.get("retailPrice") || 0);
  const wholesalePrice = Number(formData.get("wholesalePrice") || 0);
  const duration = String(formData.get("duration") || "").trim();
  const warranty = String(formData.get("warranty") || "").trim();
  const deliveryType = String(
    formData.get("deliveryType") || "manual",
  ) as Product["deliveryType"];
  const deliveryInstructions = String(
    formData.get("deliveryInstructions") || "",
  ).trim();
  const imageUrl =
    String(formData.get("imageUrl") || "").trim() || null;
  const iconBg = String(
    formData.get("iconBg") || "from-indigo-500 to-violet-600",
  );
  const featured = formData.get("featured") === "on";
  const active =
    formData.get("active") !== null ? formData.get("active") === "on" : true;
  const badges = String(formData.get("badges") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!name || !categoryId) throw new Error("Name and category required");

  const sb = createSupabaseServerClient();
  const baseRow = {
    name,
    category_id: categoryId,
    short_description: shortDescription,
    description,
    retail_price: retailPrice,
    wholesale_price: wholesalePrice,
    duration,
    warranty,
    delivery_type: deliveryType,
    delivery_instructions: deliveryInstructions,
    image_url: imageUrl,
    icon_bg: iconBg,
    featured,
    active,
    badges,
  };

  if (id) {
    const { error } = await sb
      .from("products")
      .update({ ...baseRow, slug: slugify(name) })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const newId = generateId("prod");
    const slug =
      slugify(name) + "-" + Math.random().toString(36).slice(2, 6);
    const { error } = await sb.from("products").insert({
      id: newId,
      slug,
      ...baseRow,
    });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/products", "layout");
  redirect("/admin/products");
}

export async function actionDeleteProduct(productId: string) {
  await requireAdmin();
  const sb = createSupabaseServerClient();
  // inventory_items has ON DELETE CASCADE on product_id, so they go too.
  const { error } = await sb.from("products").delete().eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export async function actionAddInventory(productId: string, payload: string) {
  await requireAdmin();
  const rows = payload
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({ product_id: productId, payload: p, status: "available" }));
  if (rows.length === 0) return;
  const sb = createSupabaseServerClient();
  const { error } = await sb.from("inventory_items").insert(rows);
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export async function actionAddInventoryForm(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") || "");
  const payload = String(formData.get("payload") || "");
  if (!productId || !payload.trim()) return;
  await actionAddInventory(productId, payload);
}

export async function actionDeleteInventory(inventoryId: string) {
  await requireAdmin();
  const sb = createSupabaseServerClient();
  const { error } = await sb
    .from("inventory_items")
    .delete()
    .eq("id", inventoryId)
    .eq("status", "available");
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export async function actionReplyTicketForm(formData: FormData) {
  await requireAdmin();
  const ticketId = String(formData.get("ticketId") || "");
  const reply = String(formData.get("reply") || "").trim();
  if (!ticketId || !reply) return;
  await actionReplyTicket(ticketId, reply);
}

export async function actionApproveDepositForm(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("depositId") || "");
  const note = String(formData.get("adminNote") || "") || undefined;
  await actionApproveDeposit(id, note);
}

export async function actionRejectDepositForm(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("depositId") || "");
  const note = String(formData.get("adminNote") || "") || undefined;
  await actionRejectDeposit(id, note);
}
