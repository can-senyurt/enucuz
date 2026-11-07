import { calculateDealScore } from "@/lib/deal-score";
import type {
  Brand,
  Category,
  DealScoreResult,
  OfferView,
  PricePoint,
  ProductCard,
  ProductDetail,
  Store,
} from "@/types";
import {
  brands,
  categories,
  products as specs,
  stores,
  type ProductSpec,
  type Scenario,
} from "./catalog";

/**
 * Deterministic demo-data generator.
 *
 * Everything is derived from fixed seeds and a FIXED demo clock, never from
 * Date.now() or Math.random(), so every build and every request produces
 * identical data (and pages can be prerendered).
 */

/** Demo "today" (UTC). Price histories end on this day. */
export const DEMO_TODAY = "2026-11-07";
const HISTORY_DAYS = 90;
const NEW_PRODUCT_DAYS = 10;

// ---------- helpers ----------

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small, fast, seedable PRNG (mulberry32). */
function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rounds to whole 10 ₺ steps ending in ,90 -> e.g. 129990 (1.299,90 ₺). */
function toRetailPrice(kurus: number): number {
  return Math.max(1990, Math.round(kurus / 1000) * 1000 - 10);
}

/** ISO dates for the last `days` days, oldest first, ending at DEMO_TODAY. */
function buildDates(days: number): string[] {
  const [y, m, d] = DEMO_TODAY.split("-").map(Number);
  const end = Date.UTC(y, m - 1, d);
  return Array.from({ length: days }, (_, i) => {
    const ts = end - (days - 1 - i) * 86_400_000;
    return new Date(ts).toISOString().slice(0, 10);
  });
}

const DATES = buildDates(HISTORY_DAYS);

// ---------- sizes ----------

const CLOTHING = ["XS", "S", "M", "L", "XL"];
const MEN_CLOTHING = ["S", "M", "L", "XL", "XXL"];
const WAIST = ["30", "32", "34", "36", "38"];
const KIDS = ["4-5 Yaş", "6-7 Yaş", "8-9 Yaş", "10-11 Yaş"];
const SHOES = ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"];
const KIDS_SHOES = ["28", "29", "30", "31", "32", "33", "34", "35"];
const ONE_SIZE = ["Tek Beden"];

function sizesFor(spec: ProductSpec): string[] {
  if (spec.categorySlug === "spor-ayakkabi" || spec.categorySlug === "bot") {
    return spec.gender === "cocuk" ? KIDS_SHOES : SHOES;
  }
  if (spec.gender === "cocuk") return KIDS;
  if (spec.categorySlug === "canta" || spec.categorySlug === "sapka-atki") {
    return ONE_SIZE;
  }
  if (spec.categorySlug === "erkek-alt") return WAIST;
  if (spec.gender === "erkek") return MEN_CLOTHING;
  return CLOTHING;
}

// ---------- price curves ----------

interface ScenarioParams {
  /** Price multiplier by "days ago" (0 = today). */
  factor: (daysAgo: number) => number;
  /** Multiplier of the offer's regular price shown as crossed-out price. */
  listFactor: number | null;
}

function scenarioParams(scenario: Scenario, rng: () => number): ScenarioParams {
  switch (scenario) {
    case "real": {
      const drop = 0.28 + rng() * 0.14; // 28–42 %
      const length = 4 + Math.floor(rng() * 8); // dropped 4–11 days ago
      return {
        factor: (d) =>
          d < length ? 1 - drop : d === length ? 1 - drop / 2 : 1,
        listFactor: 1,
      };
    }
    case "good": {
      const drop = 0.17 + rng() * 0.06; // 17–23 %
      const length = 18 + Math.floor(rng() * 10);
      return {
        factor: (d) => (d < length ? 1 - drop : 1),
        listFactor: 1,
      };
    }
    case "hiked": {
      // 35% hike 11–25 days ago, then "discount" back to the usual price.
      return {
        factor: (d) => (d >= 11 && d <= 25 ? 1.35 : 1),
        listFactor: 1.35,
      };
    }
    case "fakelist":
      // Price never moves, but the shop shows a far higher "old" price.
      return { factor: () => 1, listFactor: 1.5 };
    case "rising":
      return {
        factor: (d) => 1 + 0.1 * (1 - d / (HISTORY_DAYS - 1)),
        listFactor: null,
      };
    case "new":
    case "steady":
    default:
      return { factor: () => 1, listFactor: null };
  }
}

// ---------- build ----------

interface GeneratedOffer {
  id: string;
  store: Store;
  /** Daily prices aligned to the LAST n entries of DATES. */
  prices: number[];
  price: number;
  listPrice: number | null;
  inStock: boolean;
  sizes: string[];
  updatedMinutesAgo: number;
}

export interface GeneratedProduct {
  spec: ProductSpec;
  id: string;
  brand: Brand;
  category: Category;
  sizes: string[];
  offers: GeneratedOffer[];
  /** Daily lowest price across offers, aligned to the last n DATES. */
  history: PricePoint[];
  card: ProductCard;
}

function buildProduct(spec: ProductSpec, index: number): GeneratedProduct {
  const rng = createRng(hashString(spec.slug));
  const brand = brands.find((b) => b.slug === spec.brandSlug) as Brand;
  const category = categories.find(
    (c) => c.slug === spec.categorySlug,
  ) as Category;
  const sizes = sizesFor(spec);
  const params = scenarioParams(spec.scenario, rng);
  const days = spec.scenario === "new" ? NEW_PRODUCT_DAYS : HISTORY_DAYS;

  // 2–5 offers from distinct stores.
  const offerCount = 2 + Math.floor(rng() * 4);
  const pool = [...stores];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const shuffled = pool.slice(0, offerCount);
  const baseKurus = spec.baseTl * 100;

  const draft = shuffled.map((store, i) => {
    const storeFactor = 0.96 + rng() * 0.1; // each store prices a bit differently
    const regular = baseKurus * storeFactor;
    const prices = Array.from({ length: days }, (_, k) => {
      const daysAgo = days - 1 - k;
      const noise = 1 + (rng() - 0.5) * 0.02;
      return toRetailPrice(regular * params.factor(daysAgo) * noise);
    });
    const price = prices[prices.length - 1];
    const listPrice =
      params.listFactor === null
        ? null
        : toRetailPrice(regular * params.listFactor);
    return { id: `${spec.slug}-o${i + 1}`, store, prices, price, listPrice };
  });

  // The cheapest offer is always in stock; others are occasionally out.
  const cheapest = draft.reduce((a, b) => (b.price < a.price ? b : a));
  const offers: GeneratedOffer[] = draft.map((o) => {
    const inStock = o === cheapest ? true : rng() > 0.15;
    const oneSize = sizes.length === 1;
    const available = oneSize
      ? sizes
      : sizes.filter((_, si) =>
          o === cheapest ? si !== 0 || rng() > 0.3 : rng() > 0.35,
        );
    return {
      ...o,
      inStock,
      sizes:
        available.length > 0
          ? available
          : [sizes[Math.floor(sizes.length / 2)]],
      updatedMinutesAgo: 3 + Math.floor(rng() * 300),
    };
  });
  offers.sort((a, b) => a.price - b.price);

  // Product-level history: lowest price across offers on each day.
  const history: PricePoint[] = Array.from({ length: days }, (_, k) => ({
    date: DATES[HISTORY_DAYS - days + k],
    price: Math.min(...offers.map((o) => o.prices[k])),
  }));

  const best = offers[0];
  const deal: DealScoreResult = calculateDealScore({
    current: best.price,
    history: history.map((p) => p.price),
    listPrice: best.listPrice,
  });

  const priceWeekAgo = history[Math.max(0, history.length - 8)].price;
  const drop7d =
    priceWeekAgo > best.price
      ? Math.round(((priceWeekAgo - best.price) / priceWeekAgo) * 100)
      : 0;

  const card: ProductCard = {
    id: `p${index + 1}`,
    slug: spec.slug,
    title: spec.title,
    brand: brand.name,
    categoryName: category.name,
    categorySlug: category.slug,
    gender: spec.gender,
    imageKind: spec.kind,
    photoUrl: spec.photo ?? null,
    colors: spec.colors,
    lowestPrice: best.price,
    listPrice: best.listPrice,
    storeCount: offers.length,
    deal,
    sparkline: history.slice(-30).map((p) => p.price),
    drop7d,
  };

  return {
    spec,
    id: card.id,
    brand,
    category,
    sizes,
    offers,
    history,
    card,
  };
}

let cache: GeneratedProduct[] | null = null;

export function getGeneratedProducts(): GeneratedProduct[] {
  if (!cache) cache = specs.map(buildProduct);
  return cache;
}

export function toOfferView(o: GeneratedOffer): OfferView {
  return {
    id: o.id,
    store: o.store,
    price: o.price,
    listPrice: o.listPrice,
    inStock: o.inStock,
    sizes: o.sizes,
    updatedMinutesAgo: o.updatedMinutesAgo,
  };
}

export function toDetail(p: GeneratedProduct): ProductDetail {
  return {
    ...p.card,
    description: p.spec.description,
    sizes: p.sizes,
    modelCode: `${p.brand.slug.slice(0, 3).toUpperCase()}-${String(
      hashString(p.spec.slug) % 100000,
    ).padStart(5, "0")}`,
    offers: p.offers.map(toOfferView),
    history30: p.history.slice(-30),
    history90: p.history,
  };
}
