import { dealLabelText } from "@/lib/deal-score";
import type { DealScoreResult } from "@/types";

const STYLE: Record<DealScoreResult["label"], string> = {
  "real-deal": "bg-deal/15 text-deal-text",
  good: "bg-deal/10 text-deal-text",
  normal: "bg-ink/8 text-muted",
  inflated: "bg-warn/20 text-warn-text",
  insufficient: "bg-ink/8 text-muted",
};

/** Label pill. The text always carries the meaning; colour is only a hint. */
export function DealBadge({
  deal,
  showScore = true,
  className = "",
}: {
  deal: DealScoreResult;
  showScore?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STYLE[deal.label]} ${className}`}
    >
      <span>{dealLabelText[deal.label]}</span>
      {showScore && deal.score !== null && deal.label !== "inflated" && (
        <span className="price opacity-80">· {deal.score}</span>
      )}
    </span>
  );
}
