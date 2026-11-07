import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  href,
  hrefLabel = "Tümünü gör",
  id,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  href?: string;
  hrefLabel?: string;
  id?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <div>
        {eyebrow && (
          <p className="text-accent-text mb-2 text-sm font-semibold tracking-wide">
            {eyebrow}
          </p>
        )}
        <h2
          id={id}
          className="text-3xl leading-[1.05] font-semibold tracking-tighter text-balance sm:text-5xl"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted mt-2 max-w-xl text-base text-pretty sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="text-accent-text group inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold"
        >
          {hrefLabel}
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}
