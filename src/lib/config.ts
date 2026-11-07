/**
 * Single source of truth for brand and site-wide constants.
 * Changing the brand name here updates the whole site.
 */
export const siteConfig = {
  name: "EnUcuz",
  tagline: "Giyimde gerçek indirimi bul.",
  description:
    "Giyim ürünlerinin fiyatlarını mağazalar arasında karşılaştır, en ucuz mağazayı bul ve indirimin gerçek olup olmadığını gör.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "tr-TR",
  currency: "TRY",
  popularSearches: [
    "Siyah deri ceket",
    "Spor ayakkabı",
    "Kot pantolon",
    "Basic tişört",
    "Kışlık mont",
    "Sırt çantası",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
