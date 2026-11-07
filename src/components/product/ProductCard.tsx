import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductCard as ProductCardData } from "@/types";
import { DealBadge } from "@/components/ui/DealBadge";
import { ProductImage } from "@/components/ui/ProductImage";
import { Sparkline } from "@/components/ui/Sparkline";

export function ProductCard({
  product,
  showDrop = false,
}: {
  product: ProductCardData;
  /** Highlights the 7-day drop (used in "En Çok Düşenler"). */
  showDrop?: boolean;
}) {
  const { deal } = product;
  const hasDiscount =
    product.listPrice !== null && product.listPrice > product.lowestPrice;
  const sparkTone =
    deal.label === "real-deal" || deal.label === "good"
      ? "deal"
      : deal.label === "inflated"
        ? "muted"
        : "accent";

  return (
    <Link
      href={`/urun/${product.slug}`}
      className="group border-line bg-surface relative flex h-full flex-col overflow-hidden rounded-3xl border transition-shadow hover:shadow-lg"
    >
      <div className="bg-bg relative aspect-[4/5] overflow-hidden">
        <ProductImage
          kind={product.imageKind}
          color={product.colors[0]}
          alt={`${product.title}, ${product.colors[0]}`}
          className="transition-transform duration-300 motion-safe:group-hover:scale-105"
        />
        <DealBadge deal={deal} className="absolute top-3 left-3" />
        {showDrop && product.drop7d > 0 && (
          <span className="bg-accent text-on-accent price absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold">
            −%{product.drop7d}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-muted text-xs font-medium">{product.brand}</p>
        <h3 className="mt-0.5 line-clamp-2 text-[15px] leading-snug font-semibold tracking-tight">
          {product.title}
        </h3>

        <div className="mt-auto pt-3">
          <p className="price text-lg leading-tight font-semibold tracking-tight whitespace-nowrap">
            {formatPrice(product.lowestPrice)}
          </p>
          {hasDiscount && (
            <p className="price text-muted text-xs whitespace-nowrap line-through">
              <span className="sr-only">Eski fiyat: </span>
              {formatPrice(product.listPrice as number)}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-muted text-xs">{product.storeCount} mağazada</p>
            <Sparkline
              values={product.sparkline}
              tone={sparkTone}
              className="h-6 w-14 shrink-0"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
