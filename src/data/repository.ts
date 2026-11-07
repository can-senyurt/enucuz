import type {
  Category,
  CategoryDealStat,
  DealOptions,
  FilterOptions,
  Paginated,
  PricePoint,
  ProductCard,
  ProductDetail,
  SearchParams,
} from "@/types";
import { mockRepository } from "./mock/repository";

/**
 * The ONLY door to product data. Pages and components import from here and
 * never from ./mock or ./supabase directly. In Phase 2 the factory below will
 * pick the Supabase implementation when DATA_SOURCE=supabase; no page code changes.
 */
export interface ProductRepository {
  search(params: SearchParams): Promise<Paginated<ProductCard>>;
  getBySlug(slug: string): Promise<ProductDetail | null>;
  /** Products with a genuine deal (label "real-deal"), best score first. */
  getDeals(opts?: DealOptions): Promise<ProductCard[]>;
  /** Biggest price drops over the last 7 days. */
  getTopDrops(opts?: DealOptions): Promise<ProductCard[]>;
  /** Products whose discount looks inflated (shown as a warning list). */
  getInflatedDeals(opts?: DealOptions): Promise<ProductCard[]>;
  getDealCount(): Promise<number>;
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getCategoryDealIndex(): Promise<CategoryDealStat[]>;
  getFilterOptions(): Promise<FilterOptions>;
  getPriceHistory(productId: string, days: 30 | 90): Promise<PricePoint[]>;
  getAllProductSlugs(): Promise<string[]>;
}

export function getRepository(): ProductRepository {
  // Phase 2: switch on process.env.DATA_SOURCE ("mock" | "supabase").
  return mockRepository;
}
