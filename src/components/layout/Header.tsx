import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { ThemeToggle } from "./ThemeToggle";

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
        <ThemeToggle />
      </div>
    </header>
  );
}
