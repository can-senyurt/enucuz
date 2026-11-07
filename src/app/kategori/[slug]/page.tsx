import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getRepository } from "@/data/repository";
import { formatPercent } from "@/lib/format";
import {
  ListingSkeleton,
  ProductListing,
} from "@/components/search/ProductListing";

export async function generateStaticParams() {
  const categories = await getRepository().getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/kategori/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getRepository().getCategoryBySlug(slug);
  return { title: category ? category.name : "Kategori" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/kategori/[slug]">) {
  const { slug } = await params;
  const repo = getRepository();
  const category = await repo.getCategoryBySlug(slug);
  if (!category) notFound();

  const [categories, index] = await Promise.all([
    repo.getCategories(),
    repo.getCategoryDealIndex(),
  ]);
  const parent = categories.find((c) => c.id === category.parentId);
  const children = categories.filter((c) => c.parentId === category.id);
  const stat = index.find((s) => s.category.id === category.id);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <nav aria-label="Konum" className="text-muted mb-3 text-sm">
        <Link href="/" className="underline-offset-4 hover:underline">
          Ana sayfa
        </Link>
        {parent && (
          <>
            {" / "}
            <Link
              href={`/kategori/${parent.slug}`}
              className="underline-offset-4 hover:underline"
            >
              {parent.name}
            </Link>
          </>
        )}
      </nav>

      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        {category.name}
      </h1>
      {stat && (
        <p className="text-muted mt-2">
          Ortalama gerçek indirim{" "}
          <strong className="price text-deal-text">
            {formatPercent(stat.avgRealDrop)}
          </strong>
          {" · "}
          {stat.realDealCount} gerçek fırsat
        </p>
      )}

      {children.length > 0 && (
        <ul className="no-scrollbar -mx-4 mt-5 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1">
          {children.map((c) => (
            <li key={c.id} className="snap-start">
              <Link
                href={`/kategori/${c.slug}`}
                className="border-line bg-surface inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <Suspense fallback={<ListingSkeleton />}>
          <ProductListing
            basePath={`/kategori/${slug}`}
            searchParams={searchParams}
            fixedCategory={slug}
          />
        </Suspense>
      </div>
    </section>
  );
}
