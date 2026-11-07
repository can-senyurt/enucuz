import { getRepository } from "@/data/repository";
import { CATEGORY_ART, DEFAULT_CATEGORY_ART } from "@/lib/category-art";
import type { MenuData } from "@/types";

/** Builds the side-menu content from the repository (runs on the server). */
export async function getMenuData(): Promise<MenuData> {
  const repo = getRepository();
  const [categories, counts, brands, deals, inflated, all] = await Promise.all([
    repo.getCategories(),
    repo.getCategoryCounts(),
    repo.getBrands(),
    repo.getDeals({ limit: 4 }),
    repo.getInflatedDeals(),
    repo.search({ pageSize: 1 }),
  ]);
  const dealCount = await repo.getDealCount();

  return {
    categories: categories
      .filter((c) => c.parentId === null)
      .map((parent) => ({
        slug: parent.slug,
        name: parent.name,
        count: counts[parent.slug] ?? 0,
        art: CATEGORY_ART[parent.slug] ?? DEFAULT_CATEGORY_ART,
        children: categories
          .filter((c) => c.parentId === parent.id)
          .map((c) => ({
            slug: c.slug,
            name: c.name,
            count: counts[c.slug] ?? 0,
          })),
      })),
    brands,
    featured: deals.map((p) => ({
      slug: p.slug,
      title: p.title,
      brand: p.brand,
      price: p.lowestPrice,
      imageKind: p.imageKind,
      color: p.colors[0],
      label: p.deal.label,
    })),
    totals: {
      products: all.total,
      deals: dealCount,
      inflated: inflated.length,
    },
  };
}
