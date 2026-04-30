import { SITE } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="container flex items-center justify-center py-6 text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
