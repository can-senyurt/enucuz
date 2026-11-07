import Image from "next/image";
import type { ImageKind } from "@/types";
import { ProductImage } from "./ProductImage";

/**
 * Shows the product photo when there is one, otherwise the generated
 * illustration. The parent must be `relative` and have a size (photos fill it
 * and are cropped to cover, so use 4:5 photos for 4:5 frames).
 */
export function ProductVisual({
  kind,
  color,
  alt,
  photoUrl,
  sizes,
  priority = false,
  decorative = false,
  className = "",
}: {
  kind: ImageKind;
  color: string;
  alt: string;
  photoUrl: string | null;
  /** Image `sizes` hint so phones download a small file. */
  sizes: string;
  priority?: boolean;
  decorative?: boolean;
  className?: string;
}) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={decorative ? "" : alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <ProductImage
      kind={kind}
      color={color}
      alt={alt}
      decorative={decorative}
      className={className}
    />
  );
}
