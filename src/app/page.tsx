import Link from "next/link";
import { Activity, ShieldCheck, Store, type LucideIcon } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { SearchBar } from "@/components/ui/SearchBar";

const features: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: ShieldCheck,
    title: "Gerçek İndirim Skoru",
    text: "Fiyat geçmişine bakar; indirimin gerçek mi yoksa önce zam, sonra indirim mi olduğunu 0–100 arası bir skorla gösterir.",
  },
  {
    icon: Activity,
    title: "Fiyat Nabzı",
    text: "Her ürünün son 30 ve 90 günlük fiyat grafiği. Alacağın fiyatın iyi olup olmadığını bir bakışta gör.",
  },
  {
    icon: Store,
    title: "En ucuz mağaza, tek tıkla",
    text: "Aynı ürünü farklı mağazalarda yan yana karşılaştır, en düşük fiyatlı mağazaya doğrudan git.",
  },
];

export default function Home() {
  return (
    <>
      <section className="mx-auto flex min-h-[78dvh] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-accent-text mb-4 text-sm font-semibold tracking-wide">
          Akıllı alışveriş arkadaşın
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
          {siteConfig.tagline}
        </h1>
        <p className="text-muted mt-5 max-w-xl text-lg text-pretty">
          {siteConfig.description}
        </p>

        <div className="mt-10 w-full">
          <SearchBar />
        </div>

        <nav
          aria-label="Popüler aramalar"
          className="no-scrollbar mt-6 flex w-full max-w-xl snap-x gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:justify-center"
        >
          {siteConfig.popularSearches.map((term) => (
            <Link
              key={term}
              href={`/ara?q=${encodeURIComponent(term)}`}
              className="border-line bg-surface hover:border-ink/30 inline-flex min-h-11 shrink-0 snap-start items-center rounded-full border px-4 text-sm whitespace-nowrap transition-colors"
            >
              {term}
            </Link>
          ))}
        </nav>
      </section>

      <section aria-labelledby="neden" className="mx-auto max-w-6xl px-4 pb-24">
        <h2
          id="neden"
          className="mb-8 text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          İndirimin gerçeğini gör.
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <li
              key={title}
              className="border-line bg-surface rounded-3xl border p-6"
            >
              <span className="bg-accent/15 text-accent-text inline-flex size-11 items-center justify-center rounded-2xl">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">
                {title}
              </h3>
              <p className="text-muted mt-2 text-pretty">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
