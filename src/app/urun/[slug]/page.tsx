import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRepository } from "@/data/repository";
import { formatPrice } from "@/lib/format";
import { PriceChart } from "@/components/product/PriceChart";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductHero } from "@/components/product/ProductHero";

export async function generateStaticParams() {
  const slugs = await getRepository().getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/urun/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getRepository().getBySlug(slug);
  if (!product) return { title: "Ürün bulunamadı" };
  return {
    title: product.title,
    description: `${product.brand} ${product.title}: ${product.storeCount} mağazada en düşük fiyat ${formatPrice(product.lowestPrice)}.`,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/urun/[slug]">) {
  const { slug } = await params;
  const repo = getRepository();
  const product = await repo.getBySlug(slug);
  if (!product) notFound();

  const similar = (
    await repo.search({
      category: product.categorySlug,
      sort: "skor",
      pageSize: 5,
    })
  ).items
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <nav aria-label="Konum" className="text-muted mb-5 text-sm">
        <Link href="/" className="underline-offset-4 hover:underline">
          Ana sayfa
        </Link>
        {" / "}
        <Link
          href={`/kategori/${product.categorySlug}`}
          className="underline-offset-4 hover:underline"
        >
          {product.categoryName}
        </Link>
      </nav>

      <ProductHero product={product} />

      <section
        aria-labelledby="fiyat-nabzi"
        className="border-line bg-surface mt-12 rounded-[2rem] border p-5 sm:p-8"
      >
        <h2
          id="fiyat-nabzi"
          className="mb-5 text-2xl font-semibold tracking-tight"
        >
          Fiyat Nabzı
        </h2>
        <PriceChart
          history30={product.history30}
          history90={product.history90}
        />
      </section>

      <section
        aria-labelledby="urun-bilgisi"
        className="mt-12 grid gap-8 md:grid-cols-2"
      >
        <div>
          <h2
            id="urun-bilgisi"
            className="text-2xl font-semibold tracking-tight"
          >
            Ürün hakkında
          </h2>
          <p className="text-muted mt-3 text-pretty">{product.description}</p>
        </div>
        <dl className="border-line bg-surface grid grid-cols-2 gap-x-4 gap-y-3 rounded-3xl border p-5 text-sm">
          <dt className="text-muted">Marka</dt>
          <dd className="font-medium">{product.brand}</dd>
          <dt className="text-muted">Kategori</dt>
          <dd className="font-medium">{product.categoryName}</dd>
          <dt className="text-muted">Model kodu</dt>
          <dd className="price font-medium">{product.modelCode}</dd>
          <dt className="text-muted">Renkler</dt>
          <dd className="font-medium">{product.colors.join(", ")}</dd>
        </dl>
      </section>

      {similar.length > 0 && (
        <section aria-labelledby="benzer" className="mt-16">
          <h2
            id="benzer"
            className="mb-5 text-2xl font-semibold tracking-tight"
          >
            Benzer ürünler
          </h2>
          <ProductGrid products={similar} />
        </section>
      )}
    </article>
  );
}
