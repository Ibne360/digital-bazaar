import Link from "next/link";
import {
  ShoppingCart,
  Sparkles,
  LayoutDashboard,
  Wallet,
  Plus,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { readCart, cartCount } from "@/lib/cart";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";
import { buttonVariants } from "./ui/button";
import { SITE } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const count = cartCount(readCart());

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="container flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-md shadow-fuchsia-500/30 sm:h-9 sm:w-9">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="hidden xs:block">
            <p className="text-sm font-bold leading-none tracking-tight">
              {SITE.name}
            </p>
            <p className="hidden text-[10px] uppercase tracking-widest text-muted-foreground sm:block">
              Digital Marketplace
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          <Link
            href="/?category=ai"
            className="rounded-lg px-3 py-1.5 text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
          >
            AI
          </Link>
          <Link
            href="/?category=design"
            className="rounded-lg px-3 py-1.5 text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
          >
            Design
          </Link>
          <Link
            href="/?category=dev"
            className="rounded-lg px-3 py-1.5 text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
          >
            Dev
          </Link>
          <Link
            href="/?category=social"
            className="rounded-lg px-3 py-1.5 text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
          >
            Social
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          {/* Cart — always visible (mobile + desktop) */}
          <Link
            href="/cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground/80 transition-colors hover:bg-accent"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4" />
            {count > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {count}
              </span>
            ) : null}
          </Link>

          {user ? (
            <>
              {/* Wallet quick-access — icon only on mobile, full label on sm+ */}
              <Link
                href="/dashboard/deposit"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-300 sm:px-3"
                title="Wallet balance"
              >
                <Wallet className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden xs:inline">
                  {formatCurrency(user.walletBalance)}
                </span>
                <Plus className="hidden h-3.5 w-3.5 opacity-60 sm:inline" />
              </Link>
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "hidden md:inline-flex",
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Admin
                </Link>
              ) : null}
              <div className="hidden md:block">
                <UserMenu user={{ name: user.name, email: user.email, role: user.role }} />
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={buttonVariants({ variant: "gradient", size: "sm" })}
              >
                Get started
              </Link>
            </div>
          )}

          {/* Mobile drawer trigger (handles cart, wallet, auth on small screens) */}
          <MobileNav
            user={
              user
                ? {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    walletBalance: user.walletBalance,
                  }
                : null
            }
            cartCount={count}
          />
        </div>
      </div>
    </header>
  );
}
