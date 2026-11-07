import { matchToken, normalizeText, tokenize } from "@/lib/search/normalize";
import type {
  BrandStat,
  Category,
  CategoryDealStat,
  DealOptions,
  FilterOptions,
  Paginated,
  ProductCard,
  SearchParams,
  SuggestResult,
} from "@/types";
import type { ProductRepository } from "../repository";
import { categories } from "./catalog";
import {
  getGeneratedProducts,
  toDetail,
  type GeneratedProduct,
} from "./generate";

const DEFAULT_PAGE_SIZE = 12;

const SIZE_ORDER = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "28",
  "29",
  "30",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "4-5 Yaş",
  "6-7 Yaş",
  "8-9 Yaş",
  "10-11 Yaş",
  "Tek Beden",
];

const GENDER_WORDS: Record<string, string[]> = {
  kadin: ["kadin", "bayan"],
  erkek: ["erkek", "bay"],
  cocuk: ["cocuk"],
  unisex: ["unisex"],
};

function categoryAndChildren(slug: string): Set<string> {
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return new Set();
  const slugs = new Set([cat.slug]);
  for (const c of categories) if (c.parentId === cat.id) slugs.add(c.slug);
  return slugs;
}

function haystackWords(p: GeneratedProduct): string[] {
  const parent = categories.find((c) => c.id === p.category.parentId);
  return [
    ...tokenize(p.spec.title),
    ...tokenize(p.brand.name),
    ...tokenize(p.category.name),
    ...(parent ? tokenize(parent.name) : []),
    ...GENDER_WORDS[p.spec.gender],
    ...p.spec.colors.flatMap(tokenize),
  ];
}

/** Returns 0 when any query word fails to match (AND semantics). */
function relevance(p: GeneratedProduct, tokens: string[]): number {
  if (tokens.length === 0) return 1;
  const words = haystackWords(p);
  let total = 0;
  for (const token of tokens) {
    const score = matchToken(token, words);
    if (score === 0) return 0;
    total += score;
  }
  return total;
}

function scoreOf(card: ProductCard): number {
  return card.deal.score ?? -1;
}

function pick(cards: ProductCard[], opts?: DealOptions): ProductCard[] {
  const filtered = opts?.categorySlug
    ? cards.filter((c) =>
        categoryAndChildren(opts.categorySlug as string).has(c.categorySlug),
      )
    : cards;
  return opts?.limit ? filtered.slice(0, opts.limit) : filtered;
}

export const mockRepository: ProductRepository = {
  async search(params: SearchParams): Promise<Paginated<ProductCard>> {
    const tokens = tokenize(params.q ?? "");
    const categorySet = params.category
      ? categoryAndChildren(params.category)
      : null;
    const brandSet = params.brands?.length ? new Set(params.brands) : null;
    const sizeSet = params.sizes?.length ? new Set(params.sizes) : null;
    const colorSet = params.colors?.length
      ? new Set(params.colors.map(normalizeText))
      : null;

    const matches = getGeneratedProducts()
      .map((p) => ({ p, rel: relevance(p, tokens) }))
      .filter(({ p, rel }) => {
        if (rel === 0) return false;
        const c = p.card;
        if (categorySet && !categorySet.has(c.categorySlug)) return false;
        if (brandSet && !brandSet.has(p.brand.slug)) return false;
        if (sizeSet && !p.sizes.some((s) => sizeSet.has(s))) return false;
        if (colorSet && !c.colors.some((x) => colorSet.has(normalizeText(x))))
          return false;
        if (params.minPrice !== undefined && c.lowestPrice < params.minPrice)
          return false;
        if (params.maxPrice !== undefined && c.lowestPrice > params.maxPrice)
          return false;
        if (params.onlyRealDeals && c.deal.label !== "real-deal") return false;
        return true;
      });

    const sort = params.sort ?? "oneri";
    matches.sort((a, b) => {
      switch (sort) {
        case "fiyat-artan":
          return a.p.card.lowestPrice - b.p.card.lowestPrice;
        case "fiyat-azalan":
          return b.p.card.lowestPrice - a.p.card.lowestPrice;
        case "skor":
          return (
            scoreOf(b.p.card) - scoreOf(a.p.card) ||
            a.p.card.lowestPrice - b.p.card.lowestPrice
          );
        default:
          // relevance -> deal score -> price
          return (
            b.rel - a.rel ||
            scoreOf(b.p.card) - scoreOf(a.p.card) ||
            a.p.card.lowestPrice - b.p.card.lowestPrice
          );
      }
    });

    const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
    const total = matches.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, params.page ?? 1), pageCount);
    return {
      items: matches
        .slice((page - 1) * pageSize, page * pageSize)
        .map(({ p }) => p.card),
      total,
      page,
      pageSize,
      pageCount,
    };
  },

  async getBySlug(slug) {
    const found = getGeneratedProducts().find((p) => p.spec.slug === slug);
    return found ? toDetail(found) : null;
  },

  async getDeals(opts) {
    const cards = getGeneratedProducts()
      .map((p) => p.card)
      .filter((c) => c.deal.label === "real-deal")
      .sort((a, b) => scoreOf(b) - scoreOf(a));
    return pick(cards, opts);
  },

  async getTopDrops(opts) {
    const cards = getGeneratedProducts()
      .map((p) => p.card)
      .filter((c) => c.drop7d > 0)
      .sort((a, b) => b.drop7d - a.drop7d);
    return pick(cards, opts);
  },

  async getInflatedDeals(opts) {
    const cards = getGeneratedProducts()
      .map((p) => p.card)
      .filter((c) => c.deal.isInflated);
    return pick(cards, opts);
  },

  async getDealCount() {
    return getGeneratedProducts().filter(
      (p) => p.card.deal.label === "real-deal",
    ).length;
  },

  async getCategories(): Promise<Category[]> {
    return categories;
  },

  async getCategoryBySlug(slug) {
    return categories.find((c) => c.slug === slug) ?? null;
  },

  async getCategoryDealIndex(): Promise<CategoryDealStat[]> {
    const all = getGeneratedProducts();
    return categories
      .filter((c) => c.parentId === null)
      .map((category) => {
        const set = categoryAndChildren(category.slug);
        const inCat = all.filter((p) => set.has(p.card.categorySlug));
        const scored = inCat.filter((p) => p.card.deal.score !== null);
        // Inflated discounts do not count towards the "real" discount index.
        const avgRealDrop =
          scored.length === 0
            ? 0
            : scored.reduce(
                (sum, p) =>
                  sum + (p.card.deal.isInflated ? 0 : p.card.deal.realDrop),
                0,
              ) / scored.length;
        return {
          category,
          productCount: inCat.length,
          avgRealDrop,
          realDealCount: inCat.filter((p) => p.card.deal.label === "real-deal")
            .length,
        };
      })
      .sort((a, b) => b.avgRealDrop - a.avgRealDrop);
  },

  async getFilterOptions(): Promise<FilterOptions> {
    const all = getGeneratedProducts();
    const brandMap = new Map<string, string>();
    const sizes = new Set<string>();
    const colors = new Set<string>();
    for (const p of all) {
      brandMap.set(p.brand.slug, p.brand.name);
      p.sizes.forEach((s) => sizes.add(s));
      p.card.colors.forEach((c) => colors.add(c));
    }
    const prices = all.map((p) => p.card.lowestPrice);
    return {
      brands: [...brandMap]
        .map(([slug, name]) => ({ slug, name }))
        .sort((a, b) => a.name.localeCompare(b.name, "tr")),
      sizes: [...sizes].sort(
        (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b),
      ),
      colors: [...colors].sort((a, b) => a.localeCompare(b, "tr")),
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  },

  async getPriceHistory(productId, days) {
    const found = getGeneratedProducts().find((p) => p.id === productId);
    return found ? found.history.slice(-days) : [];
  },

  async getAllProductSlugs() {
    return getGeneratedProducts().map((p) => p.spec.slug);
  },

  async getBrands(): Promise<BrandStat[]> {
    const counts = new Map<string, BrandStat>();
    for (const p of getGeneratedProducts()) {
      const entry = counts.get(p.brand.slug) ?? {
        slug: p.brand.slug,
        name: p.brand.name,
        productCount: 0,
      };
      entry.productCount += 1;
      counts.set(p.brand.slug, entry);
    }
    return [...counts.values()].sort(
      (a, b) =>
        b.productCount - a.productCount || a.name.localeCompare(b.name, "tr"),
    );
  },

  async getCategoryCounts(): Promise<Record<string, number>> {
    const all = getGeneratedProducts();
    const result: Record<string, number> = {};
    for (const c of categories) {
      const set = categoryAndChildren(c.slug);
      result[c.slug] = all.filter((p) => set.has(p.card.categorySlug)).length;
    }
    return result;
  },

  async suggest(query: string, limit = 4): Promise<SuggestResult> {
    const tokens = tokenize(query);
    const empty: SuggestResult = { products: [], categories: [], brands: [] };
    if (tokens.length === 0) return empty;

    // Every typed word must match (prefix, part of a word, or one typo).
    const matchAll = (words: string[]): number => {
      let total = 0;
      for (const token of tokens) {
        const score = matchToken(token, words);
        if (score === 0) return 0;
        total += score;
      }
      return total;
    };

    const products = getGeneratedProducts()
      .map((p) => ({ p, rel: relevance(p, tokens) }))
      .filter(({ rel }) => rel > 0)
      .sort(
        (a, b) =>
          b.rel - a.rel ||
          scoreOf(b.p.card) - scoreOf(a.p.card) ||
          a.p.card.lowestPrice - b.p.card.lowestPrice,
      )
      .slice(0, limit)
      .map(({ p }) => ({
        slug: p.spec.slug,
        title: p.spec.title,
        brand: p.brand.name,
        price: p.card.lowestPrice,
        imageKind: p.card.imageKind,
        color: p.card.colors[0],
      }));

    const counts = await mockRepository.getCategoryCounts();
    const parentName = new Map(categories.map((c) => [c.id, c.name]));
    const cats = categories
      .map((c) => {
        const own = tokenize(c.name);
        const parent = c.parentId
          ? tokenize(parentName.get(c.parentId) ?? "")
          : [];
        return { c, rel: matchAll([...own, ...parent]) };
      })
      .filter(({ rel, c }) => rel > 0 && (counts[c.slug] ?? 0) > 0)
      .sort(
        (a, b) =>
          b.rel - a.rel || (counts[b.c.slug] ?? 0) - (counts[a.c.slug] ?? 0),
      )
      .slice(0, 3)
      .map(({ c }) => ({
        slug: c.slug,
        name: c.name,
        count: counts[c.slug] ?? 0,
      }));

    const brandList = await mockRepository.getBrands();
    const brands = brandList
      .map((b) => ({ b, rel: matchAll(tokenize(b.name)) }))
      .filter(({ rel }) => rel > 0)
      .sort((a, b) => b.rel - a.rel || b.b.productCount - a.b.productCount)
      .slice(0, 3)
      .map(({ b }) => ({ slug: b.slug, name: b.name, count: b.productCount }));

    return { products, categories: cats, brands };
  },
};
