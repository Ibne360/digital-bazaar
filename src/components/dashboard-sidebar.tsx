"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  HelpCircle,
  Crown,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

export interface SidebarUser {
  role: UserRole;
  resellerStatus?: "none" | "pending" | "approved" | "rejected";
}

interface NavItem {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  roles?: ("user" | "reseller" | "admin")[];
  exact?: boolean;
}

const USER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/dashboard/orders", label: "My orders", Icon: ShoppingBag },
  { href: "/dashboard/deposit", label: "Wallet & deposit", Icon: Wallet },
  { href: "/dashboard/support", label: "Support", Icon: HelpCircle },
];

const RESELLER_NAV: NavItem[] = [
  { href: "/reseller", label: "Reseller hub", Icon: Crown, exact: true },
  { href: "/reseller/catalog", label: "Wholesale catalog", Icon: Crown },
  { href: "/reseller/withdraw", label: "Withdraw", Icon: Wallet },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", Icon: ShieldCheck, exact: true },
  { href: "/admin/products", label: "Products", Icon: ShoppingBag },
  { href: "/admin/deposits", label: "Deposits", Icon: Wallet },
  { href: "/admin/withdraws", label: "Withdrawals", Icon: Wallet },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/users", label: "Users & resellers", Icon: Settings },
  { href: "/admin/tickets", label: "Support tickets", Icon: HelpCircle },
];

export function DashboardSidebar({
  user,
  variant = "user",
}: {
  user: SidebarUser;
  variant?: "user" | "reseller" | "admin";
}) {
  const pathname = usePathname() || "";
  let nav: NavItem[];
  let title: string;
  let subtitle: string;
  if (variant === "admin") {
    nav = ADMIN_NAV;
    title = "Admin Console";
    subtitle = "Operations & analytics";
  } else if (variant === "reseller") {
    nav = RESELLER_NAV;
    title = "Reseller Hub";
    subtitle = "Wholesale, earnings & withdrawals";
  } else {
    nav = USER_NAV;
    title = "My Dashboard";
    subtitle = "Wallet, orders & support";
  }

  const cross: { label: string; href: string; Icon: NavItem["Icon"] }[] = [];
  if (variant !== "user") {
    cross.push({ label: "User dashboard", href: "/dashboard", Icon: LayoutDashboard });
  }
  if (variant !== "reseller" && (user.role === "reseller" || user.resellerStatus === "approved")) {
    cross.push({ label: "Reseller hub", href: "/reseller", Icon: Crown });
  }
  if (variant !== "admin" && user.role === "admin") {
    cross.push({ label: "Admin console", href: "/admin", Icon: ShieldCheck });
  }

  return (
    <aside className="w-full shrink-0 lg:w-64">
      {/* Mobile: horizontal scroll tabs */}
      <div className="lg:hidden">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-base font-bold">{title}</p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 scrollbar-thin">
          <div className="flex gap-2 pb-2">
            {nav.map(({ href, label, Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-foreground/80 hover:bg-accent",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
            {cross.map(({ label, href, Icon }) => (
              <Link
                key={`cross-${href}`}
                href={href}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-dashed border-border bg-card px-3 py-1.5 text-xs text-foreground/70 hover:bg-accent"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: vertical sidebar */}
      <div className="hidden rounded-2xl border border-border bg-card p-4 lg:block">
        <div className="px-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {subtitle}
          </p>
          <p className="mt-0.5 text-sm font-bold">{title}</p>
        </div>
        <nav className="mt-4 space-y-1">
          {nav.map(({ href, label, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground/80 hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        {cross.length > 0 ? (
          <div className="mt-4 border-t border-border pt-4">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Switch view
            </p>
            <div className="mt-2 space-y-1">
              {cross.map(({ label, href, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-accent hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
