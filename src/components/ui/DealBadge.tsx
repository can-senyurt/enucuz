import { dealLabelText, dealShortLabel } from "@/lib/deal-score";
import type { DealScoreResult } from "@/types";

const DOT: Record<DealScoreResult["label"], string> = {
  "real-deal": "bg-deal",
  good: "bg-deal/60",
  normal: "bg-muted",
  inflated: "bg-warn",
  insufficient: "bg-muted/60",
};

/**
 * Small frosted pill with a coloured dot. The text always carries the
 * meaning; the dot colour is only a hint. Sits well on any image tint.
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
      className={`border-line bg-surface/85 text-ink inline-flex max-w-full items-center gap-1.5 rounded-full border py-1 pr-2.5 pl-2 text-[11px] leading-none font-semibold whitespace-nowrap shadow-sm backdrop-blur-md ${className}`}
    >
      <span
        className={`size-2 shrink-0 rounded-full ${DOT[deal.label]}`}
        aria-hidden="true"
      />
      <span className="truncate">{text}</span>
      {deal.score !== null && deal.label !== "inflated" && (
        <span className="price text-muted">{deal.score}</span>
      )}
    </span>
  );
}
