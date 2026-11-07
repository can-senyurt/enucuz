/** Tiny decorative price trend line. The numbers are announced by the card text. */
export function Sparkline({
  values,
  className = "",
  tone = "accent",
}: {
  values: number[];
  className?: string;
  tone?: "accent" | "deal" | "muted";
}) {
  if (values.length < 2) return null;
  const w = 100;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - 3 - ((v - min) / span) * (h - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const color =
    tone === "deal"
      ? "var(--deal)"
      : tone === "muted"
        ? "var(--muted)"
        : "var(--accent)";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
