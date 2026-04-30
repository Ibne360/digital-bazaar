"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Ensures every full route navigation lands at the top of the page.
 *
 * Why this exists:
 * - After a server-action `redirect()` Next.js sometimes preserves the previous
 *   scroll position, so new pages open mid-page (footer visible at top).
 * - We listen to pathname only — that way `scroll={false}` query-param
 *   navigations (e.g. deposit method tabs) keep working as designed.
 */
export function ScrollRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname]);

  return null;
}
