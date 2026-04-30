import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a money amount. Wallet & product prices are always USD.
 * Pass currency="BDT" to format as Bangladeshi Taka with the ৳ symbol.
 */
export function formatCurrency(amount: number, currency: "USD" | "BDT" = "USD") {
  const safe = Number.isFinite(amount) ? amount : 0;
  if (currency === "BDT") {
    const formatted = new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: safe % 1 === 0 ? 0 : 2,
    }).format(safe);
    return `৳${formatted}`;
  }
  // USD — always 2 decimals for consistency on dashboards/orders
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
}

/** Convert BDT amount to USD using the fixed deposit rate. */
export function bdtToUsd(bdt: number, rate: number): number {
  if (!Number.isFinite(bdt) || rate <= 0) return 0;
  return Math.round((bdt / rate) * 100) / 100;
}

/** Convert USD amount to BDT using the fixed deposit rate. */
export function usdToBdt(usd: number, rate: number): number {
  if (!Number.isFinite(usd)) return 0;
  return Math.round(usd * rate * 100) / 100;
}

export function formatDate(date: string | number | Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function formatDateTime(date: string | number | Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function generateKey(length = 16) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
    if ((i + 1) % 4 === 0 && i !== length - 1) out += "-";
  }
  return out;
}

export function timeAgo(date: string | number | Date) {
  const d = new Date(date).getTime();
  const diff = Date.now() - d;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return formatDate(date);
}
