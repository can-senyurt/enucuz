import { dealLabelText, dealShortLabel, dealTinyLabel } from "@/lib/deal-score";
import type { DealScoreResult } from "@/types";

const DOT: Record<DealScoreResult["label"], string> = {
  "real-deal": "bg-deal",
  good: "bg-deal/60",
  normal: "bg-muted",
  inflated: "bg-warn",
  insufficient: "bg-muted/60",
};

/**
 * Small pill with a coloured dot. The text always carries the meaning; the dot
 * colour is only a hint. It never grows past its container: the label shortens
 * with an ellipsis instead of overflowing (important on narrow phones).
 * No backdrop blur on purpose; it is unreliable inside animated layers on iOS.
 */
export function DealBadge({
  deal,
  compact = false,
  className = "",
}: {
  deal: DealScoreResult;
  /** Use the short label (product cards) instead of the full sentence. */
  compact?: boolean;
  className?: string;
}) {
  const text = compact ? dealShortLabel[deal.label] : dealLabelText[deal.label];
  return (
    <span
      className={`border-line bg-surface text-ink inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border py-1 pr-2.5 pl-2 text-[11px] leading-none font-semibold whitespace-nowrap shadow-sm ${className}`}
    >
      <span
        className={`size-2 shrink-0 rounded-full ${DOT[deal.label]}`}
        aria-hidden="true"
      />
      {compact ? (
        <>
          {/* Inside a product card (a size container) the badge adapts to the
              card width: full short label, then a tiny label when very narrow. */}
          <span className="min-w-0 truncate @max-[8.5rem]:hidden">{text}</span>
          <span className="hidden min-w-0 truncate @max-[8.5rem]:inline">
            {dealTinyLabel[deal.label]}
          </span>
        </>
      ) : (
        <span className="min-w-0 truncate">{text}</span>
      )}
      {deal.score !== null && deal.label !== "inflated" && (
        <span
          className={`price text-muted shrink-0 ${compact ? "hidden @min-[10.5rem]:inline" : ""}`}
        >
          {deal.score}
        </span>
      )}
    </span>
  );
}
