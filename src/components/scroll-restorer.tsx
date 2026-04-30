"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

// Avoid the SSR warning for useLayoutEffect; behaves identically on the client.
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Ensures every full route navigation lands at the top of the page.
 *
 * Why this exists:
 * - When the user navigates from a long page (e.g. product details, scrolled
 *   down) to a short page (e.g. cart, login, register), the browser keeps the
 *   previous scroll offset, so the new page opens mid-page or even at the
 *   footer. This component force-scrolls to the top on every pathname change.
 * - `useLayoutEffect` fires synchronously before the browser paints, so the
 *   user never sees the wrong scroll position. A second pass via
 *   `requestAnimationFrame` corrects any late layout shifts (fonts, images,
 *   server-action redirects).
 * - We listen to pathname only — query-param `scroll={false}` navigations
 *   (e.g. deposit method tabs) keep working as designed.
 */
export function ScrollRestorer() {
  const pathname = usePathname();

  useIsoLayoutEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
    const id = window.requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
