"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Toggle theme"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground/80 transition-colors hover:bg-accent"
      >
        <Icon className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          {(
            [
              { v: "light", label: "Light", I: Sun },
              { v: "dark", label: "Dark", I: Moon },
              { v: "system", label: "System", I: Monitor },
            ] as const
          ).map(({ v, label, I }) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setTheme(v);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent",
                theme === v && "bg-accent",
              )}
            >
              <I className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
