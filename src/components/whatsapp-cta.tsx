import { ArrowRight } from "lucide-react";
import { WHATSAPP_GROUP_URL } from "@/lib/constants";

/**
 * WhatsApp support call-to-action.
 * - Compact icon-pill on mobile (≤sm)
 * - Detailed card with title + arrow on tablet/desktop
 *
 * Tap target on mobile is at least 44px high (Apple HIG / WCAG).
 */
export function WhatsAppCTA() {
  return (
    <a
      href={WHATSAPP_GROUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-2.5 pr-3 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/40 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/40 active:scale-[0.98] sm:gap-3 sm:p-3 sm:pr-4"
      aria-label="Join WhatsApp support group"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur sm:h-10 sm:w-10">
        <WhatsAppIcon className="h-5 w-5 sm:h-6 sm:w-6" />
      </span>
      <span className="flex flex-col text-left leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80">
          Live support
        </span>
        <span className="text-sm font-bold sm:text-[15px]">
          Join WhatsApp group
        </span>
      </span>
      <ArrowRight className="ml-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

/* Lucide doesn't ship a WhatsApp glyph, so use the official inline SVG. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
