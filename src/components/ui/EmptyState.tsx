import Link from "next/link";
import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

export function EmptyState({
  title,
  text,
  actionHref,
  actionLabel,
  icon,
}: {
  title: string;
  text: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="border-line bg-surface mx-auto flex max-w-md flex-col items-center rounded-3xl border px-6 py-12 text-center">
      <span className="bg-ink/5 text-muted inline-flex size-14 items-center justify-center rounded-full">
        {icon ?? <SearchX className="size-6" aria-hidden="true" />}
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-muted mt-2 text-pretty">{text}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="bg-accent text-on-accent mt-6 inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
