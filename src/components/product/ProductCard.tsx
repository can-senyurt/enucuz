import Link from "next/link";
import { TrendingDown } from "lucide-react";
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
  /** Shows the 7-day price drop under the price (used in "En Çok Düşenler"). */
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
      className="group border-line bg-surface @container relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgb(0_0_0/0.18)] active:scale-[0.985] active:duration-100"
    >
      <div className="from-ink/[0.03] to-ink/[0.07] relative aspect-[4/5] overflow-hidden bg-gradient-to-b">
        <ProductImage
          kind={product.imageKind}
          color={product.colors[0]}
          alt={`${product.title}, ${product.colors[0]}`}
          className="transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.06]"
        />
        <div className="absolute inset-x-3 top-3 flex justify-center">
          <DealBadge deal={deal} compact />
        </div>
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

          {showDrop && product.drop7d > 0 && (
            <p className="bg-deal/12 text-deal-text mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-2xl px-2 py-1.5 text-xs font-semibold">
              <TrendingDown className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="min-w-0 truncate">
                <span className="price">%{product.drop7d}</span> düştü
                <span className="sr-only"> son 7 günde</span>
              </span>
            </p>
          )}

          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-muted min-w-0 truncate text-xs">
              {product.storeCount} mağazada
            </p>
            {/* Hidden when the card is too narrow to hold it (small phones / zoomed pages). */}
            <Sparkline
              values={product.sparkline}
              tone={sparkTone}
              className="hidden h-6 w-12 shrink-0 @min-[9.75rem]:block"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
