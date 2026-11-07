import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  title,
  subtitle,
  href,
  hrefLabel = "Tümünü gör",
  id,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  id?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2
          id={id}
          className="text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted mt-1 text-sm text-pretty">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="text-accent-text inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold"
        >
          {hrefLabel}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
