import Link from "next/link";
import {
  ArrowRight,
  Baby,
  Footprints,
  PersonStanding,
  Shirt,
  Watch,
  type LucideIcon,
} from "lucide-react";
import { getRepository } from "@/data/repository";
import { siteConfig } from "@/lib/config";
import { formatPercent } from "@/lib/format";
import type { DealLabel, DealScoreResult } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { DealRing } from "@/components/ui/DealRing";
import { Reveal } from "@/components/ui/Reveal";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionHeader } from "@/components/ui/SectionHeader";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  kadin: Shirt,
  erkek: PersonStanding,
  cocuk: Baby,
  ayakkabi: Footprints,
  aksesuar: Watch,
};

/** Illustrative scores for the "how it works" section (not real products). */
function sampleDeal(label: DealLabel, score: number | null): DealScoreResult {
  return {
    label,
    score,
    isInflated: label === "inflated",
    isLowest90: label === "real-deal",
    current: 0,
    median90: null,
    min30: null,
    min90: null,
    realDrop: 0,
    historyDays: 90,
  };
}

const explainers: {
  deal: DealScoreResult;
  title: string;
  text: string;
}[] = [
  {
    deal: sampleDeal("real-deal", 92),
    title: "Gerçek fırsat",
    text: "Fiyat, son 90 günün medyanının belirgin şekilde altında ve genelde en düşük seviyede.",
  },
  {
    deal: sampleDeal("inflated", 18),
    title: "Şişirilmiş indirim",
    text: "Eski fiyat hiç uygulanmamış ya da indirimden hemen önce zam yapılmış. Skor en fazla 30 olur.",
  },
  {
    deal: sampleDeal("normal", 0),
    title: "Normal fiyat",
    text: "Fiyat alışılmış seviyesinde. Acele etmene gerek yok, Fiyat Nabzı'ndan izleyebilirsin.",
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
  const countBySlug = new Map(
    index.map((s) => [s.category.slug, s.productCount]),
  );
  const maxDrop = Math.max(...index.map((i) => i.avgRealDrop), 0.01);
  const [before, highlight, after] = siteConfig.taglineParts;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden">
        {/* Soft ambient glow behind the headline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]"
        >
          <div className="bg-accent/15 absolute -top-32 left-1/2 size-[34rem] -translate-x-1/2 rounded-full blur-[110px] dark:opacity-60" />
          <div className="bg-warn/12 absolute top-40 -right-24 size-80 rounded-full blur-[100px] dark:opacity-40" />
        </div>

        <div className="mx-auto flex min-h-[74dvh] max-w-6xl flex-col items-center justify-center px-4 py-14 text-center">
          <Link
            href="/firsatlar"
            style={{ "--d": "0ms" } as React.CSSProperties}
            className="animate-fade-up border-line bg-surface/80 group mb-7 inline-flex min-h-11 items-center gap-2.5 rounded-full border px-4 text-sm shadow-sm backdrop-blur-md"
          >
            <span className="relative flex size-2.5" aria-hidden="true">
              <span className="bg-deal absolute inline-flex size-full rounded-full opacity-60 motion-safe:animate-ping" />
              <span className="bg-deal relative inline-flex size-2.5 rounded-full" />
            </span>
            <span>
              Bugün <strong className="price font-semibold">{dealCount}</strong>{" "}
              üründe gerçek indirim var
            </span>
            <ArrowRight
              className="text-muted size-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>

          <h1
            style={{ "--d": "90ms" } as React.CSSProperties}
            className="animate-fade-up max-w-3xl text-[2.9rem] leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-7xl lg:text-8xl"
          >
            {before}
            <span className="text-gradient-accent">{highlight}</span>
            {after}
          </h1>
          <p
            style={{ "--d": "180ms" } as React.CSSProperties}
            className="animate-fade-up text-muted mt-6 max-w-xl text-lg text-pretty sm:text-xl"
          >
            {siteConfig.description}
          </p>

          <div
            style={{ "--d": "270ms" } as React.CSSProperties}
            className="animate-fade-up mt-10 w-full"
          >
            <SearchBar />
          </div>

          <nav
            aria-label="Popüler aramalar"
            style={{ "--d": "360ms" } as React.CSSProperties}
            className="animate-fade-up no-scrollbar mt-5 flex w-full max-w-xl snap-x scroll-px-4 gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:justify-center"
          >
            {siteConfig.popularSearches.map((term) => (
              <Link
                key={term}
                href={`/ara?q=${encodeURIComponent(term)}`}
                className="border-line bg-surface/80 hover:bg-ink hover:text-bg hover:border-ink inline-flex min-h-11 shrink-0 snap-start items-center rounded-full border px-4 text-sm whitespace-nowrap backdrop-blur-md transition-[background-color,color,border-color,transform] duration-200 active:scale-95"
              >
                {term}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      <section
        aria-label="Kategoriler"
        className="mx-auto max-w-6xl px-4 pb-16 sm:pb-24"
      >
        <Reveal>
          <ul className="no-scrollbar edge-fade-x relative -mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:[mask-image:none] sm:px-0">
            {topLevel.map((c) => {
              const Icon = CATEGORY_ICONS[c.slug] ?? Shirt;
              return (
                <li key={c.id} className="w-36 shrink-0 snap-start sm:w-auto">
                  <Link
                    href={`/kategori/${c.slug}`}
                    className="border-line bg-surface group flex h-full flex-col gap-4 rounded-3xl border p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_-14px_rgb(0_0_0/0.2)] active:scale-[0.97]"
                  >
                    <span className="bg-accent/12 text-accent-text inline-flex size-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-base font-semibold tracking-tight">
                        {c.name}
                      </span>
                      <span className="text-muted price block text-xs">
                        {countBySlug.get(c.slug) ?? 0} ürün
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </section>

      {/* ---------- Günün Fırsatları ---------- */}
      <section
        aria-labelledby="gunun-firsatlari"
        className="mx-auto max-w-6xl px-4 pb-20 sm:pb-28"
      >
        <Reveal>
          <SectionHeader
            id="gunun-firsatlari"
            eyebrow="Gerçek indirimler"
            title="Günün Fırsatları"
            subtitle="Fiyat geçmişine göre gerçekten ucuzlayan ürünler."
            href="/firsatlar"
          />
        </Reveal>
        <ProductGrid products={deals.slice(0, 6)} />
      </section>

      {/* ---------- En Çok Düşenler ---------- */}
      <section
        aria-labelledby="en-cok-dusenler"
        className="mx-auto max-w-6xl pb-20 sm:pb-28"
      >
        <div className="px-4">
          <Reveal>
            <SectionHeader
              id="en-cok-dusenler"
              eyebrow="Bu hafta"
              title="En Çok Düşenler"
              subtitle="Son 7 günde fiyatı en çok azalan ürünler."
            />
          </Reveal>
        </div>
        <Reveal>
          <ul className="no-scrollbar edge-fade-x relative flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 sm:gap-4">
            {drops.map((p) => (
              <li key={p.id} className="w-[64vw] max-w-60 shrink-0 snap-start">
                <ProductCard product={p} showDrop />
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* ---------- Kategorilere Göre İndirimler ---------- */}
      <section
        aria-labelledby="kategori-indirimleri"
        className="mx-auto max-w-6xl px-4 pb-20 sm:pb-28"
      >
        <Reveal>
          <SectionHeader
            id="kategori-indirimleri"
            eyebrow="Kategori endeksi"
            title="Kategorilere Göre İndirimler"
            subtitle="Kategorinin ortalama gerçek indirimi. Şişirilmiş indirimler sayılmaz."
          />
        </Reveal>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {index.map((s, i) => (
            <li key={s.category.id} className={i === 0 ? "col-span-2" : ""}>
              <Reveal delay={i * 70} className="h-full">
                <Link
                  href={`/kategori/${s.category.slug}`}
                  className="border-line bg-surface group flex h-full flex-col justify-between gap-5 rounded-[2rem] border p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgb(0_0_0/0.2)] active:scale-[0.985] sm:gap-6 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold tracking-tight">
                      {s.category.name}
                    </h3>
                    <ArrowRight
                      className="text-muted size-5 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="price text-deal-text text-5xl leading-none font-semibold tracking-tighter sm:text-6xl">
                      {formatPercent(s.avgRealDrop)}
                    </p>
                    <p className="text-muted mt-2 text-sm">
                      ortalama gerçek indirim
                    </p>
                    <div
                      className="bg-ink/8 mt-4 h-1.5 overflow-hidden rounded-full"
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
                  </div>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- How the score works ---------- */}
      <section
        aria-labelledby="neden"
        className="mx-auto max-w-6xl px-4 pb-24 sm:pb-32"
      >
        <Reveal>
          <SectionHeader
            id="neden"
            eyebrow="İndirim Skoru"
            title="İndirimin gerçeğini gör."
            subtitle="Her ürüne 0–100 arası bir skor veriyoruz. Skor, fiyatın son 90 gündeki gerçek durumuna bakar."
          />
        </Reveal>
        <ul className="grid gap-3 md:grid-cols-3">
          {explainers.map((e, i) => (
            <li key={e.title}>
              <Reveal delay={i * 90} className="h-full">
                <div className="border-line bg-surface flex h-full flex-col items-start gap-5 rounded-[2rem] border p-6">
                  <DealRing deal={e.deal} size={84} />
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">
                      {e.title}
                    </h3>
                    <p className="text-muted mt-2 text-pretty">{e.text}</p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
