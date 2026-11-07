"use client";

import { useMemo, useState, type PointerEvent } from "react";
import { formatPrice, formatShortDate } from "@/lib/format";
import type { PricePoint } from "@/types";

const W = 600;
const H = 230;
const PAD = { top: 22, right: 12, bottom: 34, left: 12 };

type Range = 30 | 90;

/**
 * "Fiyat Nabzı": price history for the last 30 / 90 days.
 * Touch or drag on the chart to read the price of a specific day.
 */
export function PriceChart({
  history30,
  history90,
}: {
  history30: PricePoint[];
  history90: PricePoint[];
}) {
  const [range, setRange] = useState<Range>(90);
  const [active, setActive] = useState<number | null>(null);
  const data = range === 30 ? history30 : history90;

  const geo = useMemo(() => {
    const prices = data.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const span = max - min || max * 0.1 || 1;
    const lo = min - span * 0.15;
    const hi = max + span * 0.15;
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const x = (i: number) =>
      PAD.left +
      (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * innerH;
    const line = data
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.price).toFixed(1)}`,
      )
      .join(" ");
    const area = `${line} L${x(data.length - 1).toFixed(1)} ${H - PAD.bottom} L${x(0).toFixed(1)} ${H - PAD.bottom} Z`;
    const minIdx = prices.indexOf(min);
    const maxIdx = prices.indexOf(max);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    return { x, y, line, area, min, max, minIdx, maxIdx, avg, lo, hi };
  }, [data]);

  function onMove(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const px = ratio * W;
    const t = (px - PAD.left) / (W - PAD.left - PAD.right);
    setActive(
      Math.max(0, Math.min(data.length - 1, Math.round(t * (data.length - 1)))),
    );
  }

  const shown = active !== null ? data[active] : data[data.length - 1];
  const gridValues = [geo.hi, (geo.hi + geo.lo) / 2, geo.lo];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div aria-live="polite">
          <p className="price text-2xl font-semibold tracking-tight">
            {formatPrice(shown.price)}
          </p>
          <p className="text-muted text-xs">
            {active !== null
              ? formatShortDate(shown.date)
              : `Bugün · ${formatShortDate(shown.date)}`}
          </p>
        </div>
        <div
          role="group"
          aria-label="Zaman aralığı"
          className="bg-ink/5 inline-flex rounded-full p-1"
        >
          {([30, 90] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRange(r);
                setActive(null);
              }}
              aria-pressed={range === r}
              className={`min-h-9 rounded-full px-4 text-sm font-semibold transition-colors ${
                range === r ? "bg-surface text-ink shadow-sm" : "text-muted"
              }`}
            >
              {r} gün
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-pan-y select-none"
        role="img"
        aria-label={`Son ${range} günün fiyat grafiği. En düşük ${formatPrice(geo.min)}, en yüksek ${formatPrice(geo.max)}, ortalama ${formatPrice(geo.avg)}.`}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id="pulse-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridValues.map((v, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={geo.y(v)}
              y2={geo.y(v)}
              stroke="var(--line)"
              strokeDasharray="3 5"
            />
            <text
              x={PAD.left + 2}
              y={geo.y(v) - 6}
              fontSize="17"
              fill="var(--muted)"
              className="price"
            >
              {formatPrice(Math.round(v / 100) * 100)}
            </text>
          </g>
        ))}
        <path
          key={`area-${range}`}
          d={geo.area}
          fill="url(#pulse-fill)"
          className="animate-fade-up"
          style={{ "--d": "500ms" } as React.CSSProperties}
        />
        <path
          key={`line-${range}`}
          d={geo.line}
          pathLength={1}
          className="draw-line"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* lowest point */}
        <circle
          cx={geo.x(geo.minIdx)}
          cy={geo.y(geo.min)}
          r="5"
          fill="var(--deal)"
          stroke="var(--surface)"
          strokeWidth="2"
        />
        {/* highlighted / latest point */}
        <circle
          cx={geo.x(active ?? data.length - 1)}
          cy={geo.y(shown.price)}
          r="6"
          fill="var(--accent)"
          stroke="var(--surface)"
          strokeWidth="2.5"
        />
        {active !== null && (
          <line
            x1={geo.x(active)}
            x2={geo.x(active)}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="var(--muted)"
            strokeOpacity="0.4"
          />
        )}

        <text x={PAD.left} y={H - 8} fontSize="17" fill="var(--muted)">
          {formatShortDate(data[0].date)}
        </text>
        <text
          x={W - PAD.right}
          y={H - 8}
          fontSize="17"
          fill="var(--muted)"
          textAnchor="end"
        >
          {formatShortDate(data[data.length - 1].date)}
        </text>
      </svg>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "En düşük", value: geo.min, tone: "text-deal-text" },
          { label: "Ortalama", value: geo.avg, tone: "" },
          { label: "En yüksek", value: geo.max, tone: "" },
        ].map((s) => (
          <div key={s.label} className="bg-ink/5 rounded-2xl px-2 py-3">
            <dt className="text-muted text-xs">{s.label}</dt>
            <dd className={`price mt-0.5 text-sm font-semibold ${s.tone}`}>
              {formatPrice(s.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
