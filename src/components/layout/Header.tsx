import Link from "next/link";
import { Search } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [{ href: "/firsatlar", label: "Fırsatlar" }];

export function Header() {
  return (
    <header className="border-line bg-bg/70 sticky top-0 z-50 border-b pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 text-lg font-semibold tracking-tight"
          aria-label={`${siteConfig.name} ana sayfa`}
        >
          <span
            className="bg-accent inline-block size-3 rounded-full"
            aria-hidden="true"
          />
          {siteConfig.name}
        </Link>
        <nav aria-label="Ana menü" className="flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:bg-ink/5 inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/ara"
            aria-label="Ara"
            className="hover:bg-ink/5 inline-flex size-11 items-center justify-center rounded-full"
          >
            <Search className="size-5" aria-hidden="true" />
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
