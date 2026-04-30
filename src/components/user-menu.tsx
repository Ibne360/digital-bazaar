"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User as UserIcon,
  Wallet,
  ShieldCheck,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function UserMenu({
  user,
}: {
  user: { name: string; email: string; role: "user" | "admin" };
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const initial = user.name.trim().charAt(0).toUpperCase() || "U";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card pl-1 pr-3 text-sm transition-colors hover:bg-accent"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold text-white">
          {initial}
        </span>
        <span className="hidden sm:block max-w-[140px] truncate">
          {user.name}
        </span>
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          <div className="border-b border-border p-3">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            <div
              className={cn(
                "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                user.role === "admin"
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-300"
                  : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
              )}
            >
              {user.role}
            </div>
          </div>
          <div className="p-1">
            <MenuItem href="/dashboard" onClick={() => setOpen(false)} icon={<LayoutDashboard className="h-4 w-4" />}>
              My Dashboard
            </MenuItem>
            <MenuItem href="/dashboard/orders" onClick={() => setOpen(false)} icon={<UserIcon className="h-4 w-4" />}>
              Orders & Subs
            </MenuItem>
            {user.role === "admin" ? (
              <MenuItem href="/admin" onClick={() => setOpen(false)} icon={<ShieldCheck className="h-4 w-4" />}>
                Admin Panel
              </MenuItem>
            ) : null}
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-rose-500 hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  href,
  children,
  icon,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
    >
      {icon}
      {children}
    </Link>
  );
}
