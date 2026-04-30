import { cookies } from "next/headers";
import type { CartLine } from "./types";

const CART_COOKIE = "bz_cart";

export function readCart(): CartLine[] {
  const raw = cookies().get(CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l) =>
        l && typeof l.productId === "string" && typeof l.quantity === "number",
    );
  } catch {
    return [];
  }
}

export function writeCart(lines: CartLine[]) {
  cookies().set(CART_COOKIE, JSON.stringify(lines), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function addToCart(productId: string, quantity = 1): CartLine[] {
  const lines = readCart();
  const existing = lines.find((l) => l.productId === productId);
  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + quantity);
  } else {
    lines.push({ productId, quantity });
  }
  writeCart(lines);
  return lines;
}

export function updateLineQuantity(productId: string, quantity: number) {
  const lines = readCart();
  const existing = lines.find((l) => l.productId === productId);
  if (!existing) return lines;
  if (quantity <= 0) {
    const next = lines.filter((l) => l.productId !== productId);
    writeCart(next);
    return next;
  }
  existing.quantity = Math.min(99, quantity);
  writeCart(lines);
  return lines;
}

export function removeFromCart(productId: string) {
  const lines = readCart().filter((l) => l.productId !== productId);
  writeCart(lines);
  return lines;
}

export function clearCart() {
  writeCart([]);
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
