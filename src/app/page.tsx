import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getRepository } from "@/data/repository";
import { siteConfig } from "@/lib/config";
import { formatPercent } from "@/lib/format";
import type { DealLabel, DealScoreResult } from "@/types";
import { CategoryStories } from "@/components/home/CategoryStories";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { DealRing } from "@/components/ui/DealRing";
import { Reveal } from "@/components/ui/Reveal";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionHeader } from "@/components/ui/SectionHeader";

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
  const [dealCount, deals, drops, index] = await Promise.all([
    repo.getDealCount(),
    repo.getDeals({ limit: 8 }),
    repo.getTopDrops({ limit: 8 }),
    repo.getCategoryDealIndex(),
  ]);
  const maxDrop = Math.max(...index.map((i) => i.avgRealDrop), 0.01);

  return (
    <>
      {/* ---------- Hero: search first, right under the header ---------- */}
      {/* Static page: no entrance animation here, so the first paint is final. */}
      <section className="hero-bg relative">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-5 pb-14 text-center sm:pt-8 sm:pb-20">
          {/* Invisible page title (screen readers, search engines). */}
          <h1 className="sr-only">{siteConfig.tagline}</h1>
          <div className="w-full">
            <SearchBar placeholder="En uygun ürünler?" />
          </div>

          <nav
            aria-label="En çok aranan ürünler"
            className="no-scrollbar mt-4 flex w-full max-w-xl snap-x scroll-px-4 gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:justify-center"
          >
            {siteConfig.popularSearches.map((term) => (
              <Link
                key={term}
                href={`/ara?q=${encodeURIComponent(term)}`}
                className="border-line bg-surface hover:bg-ink hover:text-bg hover:border-ink inline-flex min-h-11 shrink-0 snap-start items-center rounded-full border px-4 text-sm whitespace-nowrap transition-[background-color,color,border-color,transform] duration-200 active:scale-95"
              >
                {term}
              </Link>
            ))}
          </nav>

          <Link
            href="/firsatlar"
            className="border-line bg-surface group mt-6 inline-flex min-h-11 max-w-full items-center gap-2.5 rounded-full border px-4 py-2 text-sm shadow-sm"
          >
            <span
              className="relative flex size-2.5 shrink-0"
              aria-hidden="true"
            >
              <span className="bg-deal absolute inline-flex size-full rounded-full opacity-60 motion-safe:animate-ping" />
              <span className="bg-deal relative inline-flex size-2.5 rounded-full" />
            </span>
            <span className="text-balance">
              Bugün <strong className="price font-semibold">{dealCount}</strong>{" "}
              üründe gerçek indirim var
            </span>
            <ArrowRight
              className="text-muted size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>

          {/* Category story circles */}
          <div aria-label="Kategoriler" role="region" className="mt-9 w-full">
            <CategoryStories />
          </div>
        </div>
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
