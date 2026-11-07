import { dealLabelText } from "@/lib/deal-score";
import type { DealScoreResult } from "@/types";

const TONE: Record<DealScoreResult["label"], { stroke: string; text: string }> =
  {
    "real-deal": { stroke: "var(--deal)", text: "text-deal-text" },
    good: { stroke: "var(--deal)", text: "text-deal-text" },
    normal: { stroke: "var(--muted)", text: "text-muted" },
    inflated: { stroke: "var(--warn)", text: "text-warn-text" },
    insufficient: { stroke: "var(--muted)", text: "text-muted" },
  };

/** Circular deal-score gauge: green (deal), amber (inflated), gray (normal / no data). */
export function DealRing({
  deal,
  size = 96,
}: {
  deal: DealScoreResult;
  size?: number;
}) {
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const score = deal.score ?? 0;
  const tone = TONE[deal.label];
  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        deal.score === null
          ? "İndirim skoru yok: yeterli veri yok"
          : `İndirim skoru ${deal.score} / 100: ${dealLabelText[deal.label]}`
      }
    >
      <svg
        viewBox="0 0 100 100"
        className="-rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth="8"
        />
        {deal.score !== null && (
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={tone.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
          />
        )}
      </svg>
      <span
        className={`absolute text-center leading-none font-semibold tracking-tight ${tone.text}`}
      >
        <span className="price text-2xl">{deal.score ?? "–"}</span>
        {deal.score !== null && (
          <span className="block text-[10px] font-medium opacity-80">
            / 100
          </span>
        )}
      </span>
    </div>
  );
}
