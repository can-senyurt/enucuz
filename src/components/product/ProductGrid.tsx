import type { ProductCard as ProductCardData } from "@/types";
import { Reveal } from "@/components/ui/Reveal";
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
      {products.map((p, i) => (
        <li key={p.id}>
          {/* Stagger by column so rows cascade left to right. */}
          <Reveal delay={(i % 4) * 70} className="h-full">
            <ProductCard product={p} showDrop={showDrop} />
          </Reveal>
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
          className="border-line bg-surface overflow-hidden rounded-[1.75rem] border"
        >
          <div className="skeleton aspect-[4/5]" />
          <div className="space-y-2.5 p-4">
            <div className="skeleton h-3 w-1/3 rounded-full" />
            <div className="skeleton h-4 w-4/5 rounded-full" />
            <div className="skeleton mt-4 h-5 w-1/2 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}
