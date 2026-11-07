import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { getRepository } from "@/data/repository";
import { ProductGrid } from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Günün Fırsatları",
  description: "Fiyat geçmişine göre gerçekten ucuzlayan ürünler.",
};

export default async function DealsPage() {
  const repo = getRepository();
  const [deals, inflated] = await Promise.all([
    repo.getDeals(),
    repo.getInflatedDeals(),
  ]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Günün Fırsatları
      </h1>
      <p className="text-muted mt-3 max-w-2xl text-lg text-pretty">
        İndirim skoru 75 ve üzeri olan, fiyatı son 90 günde gerçekten düşmüş{" "}
        <strong className="price text-ink">{deals.length}</strong> ürün.
      </p>

      <div className="mt-8">
        {deals.length === 0 ? (
          <EmptyState
            title="Bugün gerçek fırsat yok"
            text="Fiyatlar her gün güncellenir, yarın tekrar bak."
            actionHref="/"
            actionLabel="Ana sayfaya dön"
          />
        ) : (
          <ProductGrid products={deals} showDrop />
        )}
      </div>

      {inflated.length > 0 && (
        <section
          aria-labelledby="sisirilmis"
          className="border-warn/50 bg-warn/8 mt-16 rounded-[2rem] border p-5 sm:p-8"
        >
          <div className="flex items-start gap-3">
            <TriangleAlert
              className="text-warn-text mt-1 size-6 shrink-0"
              aria-hidden="true"
            />
            <div>
              <h2
                id="sisirilmis"
                className="text-2xl font-semibold tracking-tight"
              >
                Dikkat: şişirilmiş olabilir
              </h2>
              <p className="text-muted mt-1 max-w-2xl text-pretty">
                Bu ürünlerde mağazanın gösterdiği “eski fiyat” son 90 günde
                gerçekten uygulanmamış ya da fiyat indirimden kısa süre önce
                yükseltilmiş. İndirim büyük görünse de gerçek tasarruf düşük.
              </p>
            </div>
          </div>
          <div className="mt-6">
            <ProductGrid products={inflated} />
          </div>
        </section>
      )}
    </section>
  );
}
