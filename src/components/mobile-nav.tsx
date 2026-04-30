"use client";

import Link from "next/link";
import { useState, useEffect, useRef, type ComponentType, type FormEvent } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    if (!open) return;

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    close();
    router.push(query ? `/?q=${encodeURIComponent(query)}` : "/");
  }

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      close();
      router.push("/");
      router.refresh();
    } catch {
      close();
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
    <div ref={containerRef} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition-all active:scale-95",
          open ? "border-primary/40 bg-primary/5 text-primary" : "hover:bg-accent",
        )}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        className={cn(
          "fixed inset-0 top-14 z-40 bg-slate-950/18 backdrop-blur-[2px] transition-opacity duration-200 sm:top-16",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={close}
        aria-hidden="true"
      />

      <div
        className={cn(
          "fixed inset-x-0 top-[3.85rem] z-50 px-4 transition-all duration-200 sm:top-[4.35rem]",
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <aside
          id="mobile-menu-panel"
          className="ml-auto flex max-h-[calc(100vh-5rem)] w-full max-w-sm flex-col overflow-hidden rounded-[28px] border border-white/60 bg-background/95 shadow-2xl shadow-slate-950/20 backdrop-blur-xl dark:border-white/10"
        >
          <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-950 via-violet-900 to-fuchsia-700 px-4 pb-4 pt-4 text-white">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:22px_22px] opacity-20" />
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-wide">Digital Bazaar</p>
                  <p className="text-xs text-white/70">Mobile menu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {user ? (
              <div className="relative mt-4 rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold ring-1 ring-white/20">
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-white/75">{user.email}</p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ring-1",
                      roleClass,
                    )}
                  >
                    {roleLabel}
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative mt-4 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-lg font-semibold leading-tight">Everything important in one place</p>
                <p className="mt-1 text-sm text-white/75">
                  Sign in to reach wallet, orders, and reseller tools faster.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={close}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={close}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-white text-sm font-bold text-violet-700 shadow-lg shadow-black/10"
                  >
                    Get started
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
            {user ? (
              <div className="rounded-[24px] bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-lg shadow-emerald-500/20">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                      Wallet balance
                    </p>
                    <p className="mt-1 text-2xl font-bold tracking-tight">
                      {formatCurrency(user.walletBalance)}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <Wallet className="h-5 w-5" />
                  </div>
                </div>
                <Link
                  href="/dashboard/deposit"
                  onClick={close}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  Add balance
                </Link>
              </div>
            ) : null}

            <form onSubmit={handleSearch} className="mt-4">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products..."
                  className="h-12 w-full rounded-2xl border border-border bg-card pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </form>

            <section className="mt-5">
              <div className="flex items-center justify-between gap-3 px-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Browse
                </p>
                <Link href="/" onClick={close} className="text-xs font-medium text-primary">
                  View all
                </Link>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <DropdownTile href="/" label="All products" Icon={Home} gradient="from-slate-700 to-slate-900" onClick={close} />
                {CATEGORIES.map(({ href, label, Icon, gradient }) => (
                  <DropdownTile
                    key={href}
                    href={href}
                    label={label}
                    Icon={Icon}
                    gradient={gradient}
                    onClick={close}
                  />
                ))}
              </div>
            </section>

            {user ? (
              <section className="mt-5">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Quick actions
                </p>
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
              </section>
            ) : (
              <section className="mt-5">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Quick links
                </p>
                <div className="mt-3 space-y-2">
                  <DrawerLink
                    href="/cart"
                    Icon={ShoppingCart}
                    iconBg="bg-violet-500/15 text-violet-600 dark:text-violet-300"
                    label={`Cart${cartCount > 0 ? ` (${cartCount})` : ""}`}
                    onClick={close}
                  />
                  <DrawerLink
                    href="/reseller"
                    Icon={Crown}
                    iconBg="bg-amber-500/15 text-amber-600 dark:text-amber-300"
                    label="Reseller program"
                    onClick={close}
                  />
                </div>
              </section>
            )}

            {user ? (
              <section className="mt-5">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Account
                </p>
                <div className="mt-3 space-y-2">
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
                    label="Wallet and deposit"
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
                      label="Admin panel"
                      onClick={close}
                      highlight
                    />
                  ) : null}
                </div>
              </section>
            ) : null}

            <section className="mt-5">
              <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Help
              </p>
              <div className="mt-3 space-y-2">
                <DrawerLink
                  href="/dashboard/support"
                  Icon={HelpCircle}
                  iconBg="bg-cyan-500/15 text-cyan-600 dark:text-cyan-300"
                  label="Support center"
                  onClick={close}
                />
              </div>
            </section>
          </div>

          <div className="border-t border-border bg-card/80 p-4">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-foreground/5 text-sm font-semibold text-foreground/80 transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                Already a member?{" "}
                <Link href="/login" onClick={close} className="font-semibold text-primary">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function DrawerLink({
  href,
  Icon,
  iconBg,
  label,
  onClick,
  highlight,
}: {
  href: string;
  Icon: ComponentType<{ className?: string }>;
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
        "group flex items-center justify-between gap-3 rounded-2xl border border-transparent bg-card px-3 py-3 text-sm font-medium transition-all active:scale-[0.99]",
        highlight
          ? "border-rose-500/30 bg-rose-500/5 text-rose-600 hover:border-rose-500/50 hover:bg-rose-500/10 dark:text-rose-300"
          : "border-border/70 hover:border-border hover:bg-accent",
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl",
            iconBg,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate">{label}</span>
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
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
  Icon: ComponentType<{ className?: string }>;
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
        "relative flex min-h-[84px] flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl bg-gradient-to-br p-3 text-center text-white shadow-md transition-transform active:scale-95",
        gradient,
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-[11px] font-bold leading-tight">{label}</span>
      {badge !== undefined ? (
        <span className="absolute right-2 top-2 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-foreground shadow">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

function DropdownTile({
  href,
  label,
  Icon,
  gradient,
  onClick,
}: {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  gradient: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center gap-3 rounded-3xl border border-border/70 bg-card px-3 py-3 transition-all hover:border-primary/30 hover:bg-accent"
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-sm",
          gradient,
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </Link>
  );
}
