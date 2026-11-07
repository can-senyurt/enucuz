import type { ImageKind } from "@/types";

/** Illustration + colour used for each top-level category (home tiles and side menu). */
export const CATEGORY_ART: Record<string, { kind: ImageKind; color: string }> =
  {
    kadin: { kind: "dress", color: "Bordo" },
    erkek: { kind: "jacket", color: "Lacivert" },
    cocuk: { kind: "kids", color: "Sarı" },
    ayakkabi: { kind: "sneaker", color: "Mavi" },
    aksesuar: { kind: "bag", color: "Kahverengi" },
  };

export const DEFAULT_CATEGORY_ART = CATEGORY_ART.kadin;
