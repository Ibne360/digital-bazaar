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

const BROWSE_LINKS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/?category=ai", label: "AI & Automation", Icon: Sparkles },
  { href: "/?category=design", label: "Design", Icon: Palette },
  { href: "/?category=dev", label: "Dev & Coding", Icon: Code2 },
  { href: "/?category=social", label: "Social & Premium", Icon: Globe },
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

  return (
    <>
      {/* Hamburger trigger — high-contrast, larger tap target */}
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
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[88%] max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 md:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        aria-hidden={!open}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/30">
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="text-base font-bold tracking-tight">Menu</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground/80 transition-colors hover:bg-accent active:scale-95"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Profile card (logged-in) */}
          {user ? (
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    isAdmin
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-300"
                      : isReseller
                        ? "bg-violet-500/15 text-violet-600 dark:text-violet-300"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
                  )}
                >
                  {user.role}
                </span>
              </div>

              {/* Wallet card */}
              <Link
                href="/dashboard/deposit"
                onClick={close}
                className="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-3 transition-colors hover:from-emerald-500/15 hover:to-teal-500/15"
              >
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    Wallet balance
                  </span>
                </div>
                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(user.walletBalance)}
                </span>
              </Link>

              {/* Quick actions */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <QuickAction
                  href="/dashboard/deposit"
                  Icon={ArrowDownToLine}
                  label="Deposit"
                  color="text-emerald-600 dark:text-emerald-300"
                  onClick={close}
                />
                <QuickAction
                  href="/dashboard/orders"
                  Icon={Receipt}
                  label="Orders"
                  color="text-blue-600 dark:text-blue-300"
                  onClick={close}
                />
                <QuickAction
                  href="/cart"
                  Icon={ShoppingCart}
                  label="Cart"
                  color="text-violet-600 dark:text-violet-300"
                  badge={cartCount > 0 ? cartCount : undefined}
                  onClick={close}
                />
              </div>
            </div>
          ) : null}

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="border-b border-border p-4"
          >
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </form>

          {/* Browse */}
          <nav className="p-4">
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Browse
            </p>
            <div className="space-y-0.5">
              {BROWSE_LINKS.map(({ href, label, Icon }) => (
                <DrawerLink
                  key={href}
                  href={href}
                  Icon={Icon}
                  label={label}
                  onClick={close}
                />
              ))}
            </div>

            {/* Account section (logged-in) */}
            {user ? (
              <>
                <p className="mb-2 mt-5 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Account
                </p>
                <div className="space-y-0.5">
                  <DrawerLink
                    href="/dashboard"
                    Icon={LayoutDashboard}
                    label="Dashboard"
                    onClick={close}
                  />
                  <DrawerLink
                    href="/dashboard/orders"
                    Icon={Receipt}
                    label="Orders & Subscriptions"
                    onClick={close}
                  />
                  <DrawerLink
                    href="/dashboard/deposit"
                    Icon={Wallet}
                    label="Deposit / Wallet"
                    onClick={close}
                  />
                  <DrawerLink
                    href="/reseller"
                    Icon={Crown}
                    label={isReseller ? "Reseller Hub" : "Become a Reseller"}
                    onClick={close}
                  />
                  {isReseller ? (
                    <DrawerLink
                      href="/reseller/withdraw"
                      Icon={Wallet}
                      label="Withdraw earnings"
                      onClick={close}
                    />
                  ) : null}
                  {isAdmin ? (
                    <DrawerLink
                      href="/admin"
                      Icon={Shield}
                      label="Admin Panel"
                      onClick={close}
                      highlight="rose"
                    />
                  ) : null}
                </div>
              </>
            ) : null}

            {/* Resources */}
            <p className="mb-2 mt-5 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Resources
            </p>
            <div className="space-y-0.5">
              <DrawerLink
                href="/dashboard/support"
                Icon={HelpCircle}
                label="Support"
                onClick={close}
              />
            </div>
          </nav>
        </div>

        {/* Footer */}
        {user ? (
          <div className="border-t border-border p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-500/20 active:scale-[0.98] dark:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : (
          <div className="border-t border-border p-4">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={close}
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card text-sm font-medium transition-colors hover:bg-accent"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={close}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow shadow-fuchsia-500/30"
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
  label,
  onClick,
  highlight,
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  highlight?: "rose";
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        highlight === "rose"
          ? "text-rose-600 hover:bg-rose-500/10 dark:text-rose-300"
          : "text-foreground/85 hover:bg-accent hover:text-foreground",
      )}
    >
      <span className="flex items-center gap-3">
        <Icon
          className={cn(
            "h-4 w-4",
            highlight === "rose"
              ? "text-rose-500"
              : "text-muted-foreground group-hover:text-foreground",
          )}
        />
        {label}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

function QuickAction({
  href,
  Icon,
  label,
  color,
  badge,
  onClick,
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card p-2.5 text-center transition-colors hover:bg-accent active:scale-95"
    >
      <Icon className={cn("h-5 w-5", color)} />
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
      {badge !== undefined ? (
        <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
