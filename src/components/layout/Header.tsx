import Link from "next/link";
import { Search } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { MenuDrawer } from "./MenuDrawer";
import { getMenuData } from "./menu-data";
import { ThemeToggle } from "./ThemeToggle";

export async function Header() {
  const menu = await getMenuData();

  return (
    <header className="border-line bg-bg/70 sticky top-0 z-50 border-b pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="flex min-w-0 items-center gap-1">
          <MenuDrawer data={menu} />
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
        </div>
        <nav aria-label="Hızlı erişim" className="flex items-center gap-1">
          {/* Hidden on small phones: the same link lives in the side menu. */}
          <Link
            href="/firsatlar"
            className="hover:bg-ink/5 hidden min-h-11 items-center rounded-full px-3 text-sm font-medium sm:inline-flex"
          >
            Fırsatlar
          </Link>
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
