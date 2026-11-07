/**
 * Shared domain types.
 * Money rule: every price is an integer number of kuruş (1.299,90 ₺ = 129990).
 */

export type Gender = "kadin" | "erkek" | "cocuk" | "unisex";

export interface Store {
  id: string;
  name: string;
  slug: string;
  /** Shown as a text badge; real store logos are never used. */
  logoText: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

/** Which placeholder illustration to draw for a product. */
export type ImageKind =
  | "jacket"
  | "tshirt"
  | "shirt"
  | "pants"
  | "dress"
  | "sneaker"
  | "boot"
  | "bag"
  | "beanie"
  | "kids";

export interface PricePoint {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Lowest price across offers on that day, in kuruş. */
  price: number;
}

// ---------- Deal score ----------

export type DealLabel =
  "real-deal" | "good" | "normal" | "inflated" | "insufficient";

export interface DealScoreResult {
  label: DealLabel;
  /** 0–100, or null when there is not enough history. */
  score: number | null;
  isInflated: boolean;
  isLowest90: boolean;
  /** Current lowest price in kuruş. */
  current: number;
  median90: number | null;
  min30: number | null;
  min90: number | null;
  /** 0–1 share by which the current price is below the 90-day median. */
  realDrop: number;
  /** Days of history that were available. */
  historyDays: number;
}

// ---------- Read models ----------

export interface ProductCard {
  id: string;
  slug: string;
  title: string;
  brand: string;
  categoryName: string;
  categorySlug: string;
  gender: Gender;
  imageKind: ImageKind;
  /** Demo photo (4:5) or null: then the generated illustration is shown. */
  photoUrl: string | null;
  /** Colour names; the first one is used for the illustration. */
  colors: string[];
  lowestPrice: number;
  /** Highest list price among offers (the "crossed-out" price). */
  listPrice: number | null;
  storeCount: number;
  deal: DealScoreResult;
  /** Last 30 daily lowest prices, for the mini sparkline. */
  sparkline: number[];
  /** Percentage drop over the last 7 days (0 when none). */
  drop7d: number;
}

export interface OfferView {
  id: string;
  store: Store;
  price: number;
  listPrice: number | null;
  inStock: boolean;
  sizes: string[];
  /** Minutes since the offer was last refreshed (relative to the demo clock). */
  updatedMinutesAgo: number;
}

export interface ProductDetail extends ProductCard {
  description: string;
  sizes: string[];
  offers: OfferView[];
  modelCode: string;
  history30: PricePoint[];
  history90: PricePoint[];
}

// ---------- Repository inputs / outputs ----------

export type SortKey = "oneri" | "fiyat-artan" | "fiyat-azalan" | "skor";

export interface SearchParams {
  q?: string;
  /** Category slug (top-level categories include their children). */
  category?: string;
  brands?: string[];
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  onlyRealDeals?: boolean;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface DealOptions {
  limit?: number;
  categorySlug?: string;
}

export interface FilterOptions {
  brands: { slug: string; name: string }[];
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
}

export interface CategoryDealStat {
  category: Category;
  productCount: number;
  /** Average real discount (0–1) across the category's products. */
  avgRealDrop: number;
  realDealCount: number;
}

export interface BrandStat {
  slug: string;
  name: string;
  productCount: number;
}

/** Everything the side menu needs, prepared on the server. */
export interface MenuData {
  categories: {
    slug: string;
    name: string;
    count: number;
    art: { kind: ImageKind; color: string };
    children: { slug: string; name: string; count: number }[];
  }[];
  brands: BrandStat[];
  featured: {
    slug: string;
    title: string;
    brand: string;
    price: number;
    imageKind: ImageKind;
    color: string;
    photoUrl: string | null;
    label: DealLabel;
  }[];
  totals: { products: number; deals: number; inflated: number };
}

/** Type-ahead results for the search box. */
export interface SuggestResult {
  products: {
    slug: string;
    title: string;
    brand: string;
    price: number;
    imageKind: ImageKind;
    color: string;
    photoUrl: string | null;
  }[];
  categories: { slug: string; name: string; count: number }[];
  brands: { slug: string; name: string; count: number }[];
}
