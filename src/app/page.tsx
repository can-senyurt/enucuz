import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Store,
  type LucideIcon,
} from "lucide-react";
import { getRepository } from "@/data/repository";
import { siteConfig } from "@/lib/config";
import { formatPercent } from "@/lib/format";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionHeader } from "@/components/ui/SectionHeader";

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

export default async function Home() {
  const repo = getRepository();
  const [dealCount, categories, deals, drops, index] = await Promise.all([
    repo.getDealCount(),
    repo.getCategories(),
    repo.getDeals({ limit: 8 }),
    repo.getTopDrops({ limit: 8 }),
    repo.getCategoryDealIndex(),
  ]);
  const topLevel = categories.filter((c) => c.parentId === null);
  const maxDrop = Math.max(...index.map((i) => i.avgRealDrop), 0.01);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto flex min-h-[72dvh] max-w-6xl flex-col items-center justify-center px-4 py-14 text-center">
        <Link
          href="/firsatlar"
          className="border-line bg-surface mb-6 inline-flex min-h-11 items-center gap-2.5 rounded-full border px-4 text-sm"
        >
          <span className="relative flex size-2.5" aria-hidden="true">
            <span className="bg-deal absolute inline-flex size-full rounded-full opacity-60 motion-safe:animate-ping" />
            <span className="bg-deal relative inline-flex size-2.5 rounded-full" />
          </span>
          <span>
            Bugün <strong className="price font-semibold">{dealCount}</strong>{" "}
            üründe gerçek indirim var
          </span>
          <ArrowRight className="text-muted size-4" aria-hidden="true" />
        </Link>

        <h1 className="max-w-3xl text-5xl font-semibold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
          {siteConfig.tagline}
        </h1>
        <p className="text-muted mt-5 max-w-xl text-lg text-pretty">
          {siteConfig.description}
        </p>

        <div className="mt-9 w-full">
          <SearchBar />
        </div>

        <nav
          aria-label="Popüler aramalar"
          className="no-scrollbar mt-5 flex w-full max-w-xl snap-x scroll-px-4 gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:justify-center"
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

      {/* Category chips */}
      <section
        aria-label="Kategoriler"
        className="mx-auto max-w-6xl px-4 pb-12"
      >
        <ul className="no-scrollbar -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1">
          {topLevel.map((c) => (
            <li key={c.id} className="snap-start">
              <Link
                href={`/kategori/${c.slug}`}
                className="bg-surface border-line hover:border-ink/30 inline-flex min-h-12 items-center rounded-full border px-6 text-base font-medium whitespace-nowrap transition-colors"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Günün Fırsatları */}
      <section
        aria-labelledby="gunun-firsatlari"
        className="mx-auto max-w-6xl px-4 pb-16"
      >
        <Reveal>
          <SectionHeader
            id="gunun-firsatlari"
            title="Günün Fırsatları"
            subtitle="Fiyat geçmişine göre gerçekten ucuzlayan ürünler."
            href="/firsatlar"
          />
          <ProductGrid products={deals.slice(0, 6)} />
        </Reveal>
      </section>

      {/* En Çok Düşenler */}
      <section
        aria-labelledby="en-cok-dusenler"
        className="mx-auto max-w-6xl px-4 pb-16"
      >
        <Reveal>
          <SectionHeader
            id="en-cok-dusenler"
            title="En Çok Düşenler"
            subtitle="Son 7 günde fiyatı en çok azalan ürünler."
          />
          <ul className="no-scrollbar relative -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:gap-4">
            {drops.map((p) => (
              <li key={p.id} className="w-[44vw] max-w-56 shrink-0 snap-start">
                <ProductCard product={p} showDrop />
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Kategorilere Göre İndirimler */}
      <section
        aria-labelledby="kategori-indirimleri"
        className="mx-auto max-w-6xl px-4 pb-16"
      >
        <Reveal>
          <SectionHeader
            id="kategori-indirimleri"
            title="Kategorilere Göre İndirimler"
            subtitle="Kategorinin ortalama gerçek indirimi. Şişirilmiş indirimler sayılmaz."
          />
          <ul className="grid gap-3 md:grid-cols-2">
            {index.map((s) => (
              <li key={s.category.id}>
                <Link
                  href={`/kategori/${s.category.slug}`}
                  className="border-line bg-surface block rounded-3xl border p-5 transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {s.category.name}
                    </h3>
                    <p className="price text-deal-text text-2xl font-semibold tracking-tight">
                      {formatPercent(s.avgRealDrop)}
                    </p>
                  </div>
                  <div
                    className="bg-ink/8 mt-3 h-2 overflow-hidden rounded-full"
                    role="img"
                    aria-label={`Ortalama gerçek indirim ${formatPercent(s.avgRealDrop)}`}
                  >
                    <div
                      className="bg-deal h-full rounded-full"
                      style={{
                        width: `${Math.max(4, (s.avgRealDrop / maxDrop) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-muted mt-3 text-sm">
                    {s.productCount} ürün · {s.realDealCount} gerçek fırsat
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Explainer */}
      <section aria-labelledby="neden" className="mx-auto max-w-6xl px-4 pb-24">
        <Reveal>
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
        </Reveal>
      </section>
    </>
  );
}
