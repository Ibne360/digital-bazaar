"use client";

import Link from "next/link";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Sparkles,
  Palette,
  Code2,
  Globe,
  Shield,
  Wallet,
  LayoutDashboard,
  ShoppingCart,
  Search,
  ArrowDownToLine,
  Receipt,
  Crown,
  HelpCircle,
  LogOut,
  Home,
  ChevronRight,
  Plus,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface MobileNavProps {
  user?: {
    name: string;
    email: string;
    role: string;
    walletBalance: number;
  } | null;
  cartCount: number;
}

const CATEGORIES = [
  { href: "/?category=ai", label: "AI", Icon: Sparkles, gradient: "from-violet-500 to-fuchsia-500" },
  { href: "/?category=design", label: "Design", Icon: Palette, gradient: "from-pink-500 to-rose-500" },
  { href: "/?category=dev", label: "Dev", Icon: Code2, gradient: "from-blue-500 to-cyan-500" },
  { href: "/?category=social", label: "Social", Icon: Globe, gradient: "from-emerald-500 to-teal-500" },
];

export function MobileNav({ user, cartCount }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const close = () => setOpen(false);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = search.trim();
    close();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      close();
      router.push("/");
      router.refresh();
    } catch {
      // ignore — page will redirect anyway
    }
  }

  const isReseller = user?.role === "reseller";
  const isAdmin = user?.role === "admin";
  const roleLabel = isAdmin ? "Admin" : isReseller ? "Reseller" : "Member";
  const roleClass = isAdmin
    ? "bg-rose-500/20 text-rose-100 ring-rose-300/40"
    : isReseller
      ? "bg-amber-500/20 text-amber-100 ring-amber-300/40"
      : "bg-emerald-500/20 text-emerald-100 ring-emerald-300/40";

  return (
    <>
      {/* Hamburger trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm transition-all hover:bg-accent active:scale-95 md:hidden"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-opacity duration-200 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[90%] max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        {/* ───── HERO HEADER (gradient) ───── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-5 pb-5 pt-4 text-white">
          <div className="absolute inset-0 bg-grid-pattern bg-[length:24px_24px] opacity-20" />
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

          {/* Close + brand row */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold tracking-wide">Digital Bazaar</p>
            </div>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 active:scale-95"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Profile / sign-in cta inside hero */}
          {user ? (
            <div className="relative mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-lg font-bold ring-2 ring-white/30 backdrop-blur">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold leading-tight">
                  {user.name}
                </p>
                <p className="truncate text-xs text-white/80">{user.email}</p>
              </div>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
                  roleClass,
                )}
              >
                {roleLabel}
              </span>
            </div>
          ) : (
            <div className="relative mt-5">
              <p className="text-xl font-bold leading-tight">
                Welcome to Digital Bazaar
              </p>
              <p className="mt-1 text-sm text-white/85">
                Sign in to use your wallet & track orders.
              </p>
            </div>
          )}
        </div>

        {/* ───── SCROLLABLE BODY ───── */}
        <div className="flex-1 overflow-y-auto">
          {/* Wallet hero (logged-in only) */}
          {user ? (
            <div className="px-4 pt-4">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg shadow-emerald-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 opacity-80" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-white/80">
                      Wallet balance
                    </span>
                  </div>
                </div>
                <p className="mt-1.5 text-2xl font-bold tracking-tight">
                  {formatCurrency(user.walletBalance)}
                </p>
                <Link
                  href="/dashboard/deposit"
                  onClick={close}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-white text-sm font-semibold text-emerald-700 shadow-sm transition-transform active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Top up
                </Link>
              </div>

              {/* Quick actions — colorful gradient cards */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <QuickAction
                  href="/dashboard/orders"
                  Icon={Receipt}
                  label="Orders"
                  gradient="from-blue-500 to-indigo-500"
                  onClick={close}
                />
                <QuickAction
                  href="/cart"
                  Icon={ShoppingCart}
                  label="Cart"
                  gradient="from-violet-500 to-fuchsia-500"
                  badge={cartCount > 0 ? cartCount : undefined}
                  onClick={close}
                />
                <QuickAction
                  href={isReseller ? "/reseller" : "/reseller/apply"}
                  Icon={Crown}
                  label={isReseller ? "Reseller" : "Apply"}
                  gradient="from-amber-500 to-orange-500"
                  onClick={close}
                />
              </div>
            </div>
          ) : null}

          {/* Search */}
          <form onSubmit={handleSearch} className="px-4 pt-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="h-11 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>
          </form>

          {/* Categories — 4-card colorful grid */}
          <div className="px-4 pt-5">
            <p className="mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Browse categories
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/"
                onClick={close}
                className="group flex items-center gap-2.5 overflow-hidden rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.98]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-sm">
                  <Home className="h-4 w-4" />
                </div>
                <span className="text-sm font-semibold">All</span>
              </Link>
              {CATEGORIES.map(({ href, label, Icon, gradient }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  className="group flex items-center gap-2.5 overflow-hidden rounded-xl border border-border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.98]"
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                      gradient,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Account section (logged-in) */}
          {user ? (
            <div className="px-4 pt-5">
              <p className="mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Account
              </p>
              <div className="space-y-1.5">
                <DrawerLink
                  href="/dashboard"
                  Icon={LayoutDashboard}
                  iconBg="bg-violet-500/15 text-violet-600 dark:text-violet-300"
                  label="Dashboard"
                  onClick={close}
                />
                <DrawerLink
                  href="/dashboard/orders"
                  Icon={Receipt}
                  iconBg="bg-blue-500/15 text-blue-600 dark:text-blue-300"
                  label="Orders"
                  onClick={close}
                />
                <DrawerLink
                  href="/dashboard/deposit"
                  Icon={Wallet}
                  iconBg="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                  label="Wallet & Deposit"
                  onClick={close}
                />
                {isReseller ? (
                  <DrawerLink
                    href="/reseller/withdraw"
                    Icon={ArrowDownToLine}
                    iconBg="bg-amber-500/15 text-amber-600 dark:text-amber-300"
                    label="Withdraw earnings"
                    onClick={close}
                  />
                ) : null}
                {isAdmin ? (
                  <DrawerLink
                    href="/admin"
                    Icon={Shield}
                    iconBg="bg-rose-500/15 text-rose-600 dark:text-rose-300"
                    label="Admin Panel"
                    onClick={close}
                    highlight
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Resources */}
          <div className="px-4 pb-6 pt-5">
            <p className="mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Help
            </p>
            <DrawerLink
              href="/dashboard/support"
              Icon={HelpCircle}
              iconBg="bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
              label="Support center"
              onClick={close}
            />
          </div>
        </div>

        {/* ───── FOOTER ───── */}
        {user ? (
          <div className="border-t border-border bg-card/50 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground/5 py-3 text-sm font-semibold text-foreground/80 transition-colors hover:bg-rose-500/10 hover:text-rose-600 active:scale-[0.98] dark:hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : (
          <div className="border-t border-border bg-card/50 p-4">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={close}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold transition-colors hover:bg-accent active:scale-[0.98]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-md shadow-fuchsia-500/30 transition-transform active:scale-[0.98]"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

/* ─── helpers ──────────────────────────────────────────────────── */

function DrawerLink({
  href,
  Icon,
  iconBg,
  label,
  onClick,
  highlight,
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  label: string;
  onClick?: () => void;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between gap-3 rounded-xl border border-transparent bg-card px-3 py-3 text-sm font-medium transition-all active:scale-[0.99]",
        highlight
          ? "border-rose-500/30 bg-rose-500/5 text-rose-600 hover:border-rose-500/50 hover:bg-rose-500/10 dark:text-rose-300"
          : "text-foreground hover:border-border hover:bg-accent",
      )}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            iconBg,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}

function QuickAction({
  href,
  Icon,
  label,
  gradient,
  badge,
  onClick,
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  gradient: string;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-br p-3 text-center text-white shadow-md transition-transform active:scale-95",
        gradient,
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[11px] font-bold leading-tight">{label}</span>
      {badge !== undefined ? (
        <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-foreground shadow">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
