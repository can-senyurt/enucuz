import type { ProductCard as ProductCardData } from "@/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({
  products,
  showDrop = false,
}: {
  products: ProductCardData[];
  showDrop?: boolean;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} showDrop={showDrop} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul
      className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Ürünler yükleniyor"
    >
      {Array.from({ length: count }, (_, i) => (
        <li
          key={i}
          className="border-line bg-surface overflow-hidden rounded-3xl border"
        >
          <div className="bg-ink/5 aspect-[4/5] animate-pulse" />
          <div className="space-y-2 p-4">
            <div className="bg-ink/5 h-3 w-1/3 animate-pulse rounded" />
            <div className="bg-ink/5 h-4 w-4/5 animate-pulse rounded" />
            <div className="bg-ink/5 mt-4 h-5 w-1/2 animate-pulse rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}
