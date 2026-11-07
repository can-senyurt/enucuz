import Link from "next/link";
import { siteConfig } from "@/lib/config";

const links = [
  { href: "/firsatlar", label: "Fırsatlar" },
  { href: "/ara", label: "Ara" },
  { href: "/kategori/kadin", label: "Kadın" },
  { href: "/kategori/erkek", label: "Erkek" },
  { href: "/kategori/ayakkabi", label: "Ayakkabı" },
];

export function Footer() {
  return (
    <footer className="border-line text-muted mt-8 border-t pb-[max(1.5rem,env(safe-area-inset-bottom))] text-sm">
      <div className="mx-auto max-w-6xl px-[max(1rem,env(safe-area-inset-left))] py-10 pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-ink flex items-center gap-2 text-lg font-semibold tracking-tight">
              <span
                className="bg-accent inline-block size-2.5 rounded-full"
                aria-hidden="true"
              />
              {siteConfig.name}
            </p>
            <p className="mt-3 text-pretty">
              Giyimde gerçek indirimi bul. Fiyatlar anlık değişebilir;
              gösterilen fiyatların güncelliği her teklifin yanında belirtilir.
            </p>
          </div>
          <nav aria-label="Alt menü">
            <ul className="flex flex-wrap gap-x-1 gap-y-0 sm:max-w-xs sm:justify-end">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="hover:text-ink inline-flex min-h-11 items-center rounded-full px-3 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 text-xs">
          © {siteConfig.name} · Demo veriler kurgusaldır
        </p>
      </div>
    </footer>
  );
}
