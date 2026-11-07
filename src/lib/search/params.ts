import { z } from "zod";
import type { SearchParams, SortKey } from "@/types";

/**
 * URL <-> filter state for the listing pages (/ara and /kategori/[slug]).
 * Everything from the URL is untrusted input, so it is validated with Zod.
 * Prices are written in whole liras in the URL and converted to kuruş here.
 */

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "oneri", label: "Önerilen" },
  { key: "fiyat-artan", label: "En düşük fiyat" },
  { key: "fiyat-azalan", label: "En yüksek fiyat" },
  { key: "skor", label: "İndirim skoru" },
];

export interface ListingState {
  q: string;
  kategori: string;
  marka: string[];
  beden: string[];
  renk: string[];
  min?: number; // liras
  max?: number; // liras
  firsat: boolean;
  sirala: SortKey;
  sayfa: number;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

const text = z.string().trim().max(100);
const word = z.string().trim().min(1).max(40);
const lira = z.coerce.number().int().min(0).max(1_000_000);
const sortSchema = z.enum(["oneri", "fiyat-artan", "fiyat-azalan", "skor"]);
const pageSchema = z.coerce.number().int().min(1).max(1000);

const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;
const all = (v: string | string[] | undefined) =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

function optionalLira(v: string | string[] | undefined): number | undefined {
  const raw = first(v);
  if (raw === undefined || raw.trim() === "") return undefined;
  const parsed = lira.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}

function wordList(v: string | string[] | undefined): string[] {
  return all(v)
    .map((x) => word.safeParse(x))
    .flatMap((r) => (r.success ? [r.data] : []))
    .slice(0, 20);
}

export function parseListingState(raw: RawSearchParams): ListingState {
  const q = text.safeParse(first(raw.q));
  const kategori = word.safeParse(first(raw.kategori));
  const sirala = sortSchema.safeParse(first(raw.sirala));
  const sayfa = pageSchema.safeParse(first(raw.sayfa));
  const min = optionalLira(raw.min);
  const max = optionalLira(raw.max);
  return {
    q: q.success ? q.data : "",
    kategori: kategori.success ? kategori.data : "",
    marka: wordList(raw.marka),
    beden: wordList(raw.beden),
    renk: wordList(raw.renk),
    min,
    max,
    firsat: first(raw.firsat) === "1",
    sirala: sirala.success ? sirala.data : "oneri",
    sayfa: sayfa.success ? sayfa.data : 1,
  };
}

/** Converts the URL state to repository search params (liras -> kuruş). */
export function toSearchParams(
  state: ListingState,
  fixedCategory?: string,
): SearchParams {
  return {
    q: state.q || undefined,
    category: fixedCategory ?? (state.kategori || undefined),
    brands: state.marka.length ? state.marka : undefined,
    sizes: state.beden.length ? state.beden : undefined,
    colors: state.renk.length ? state.renk : undefined,
    minPrice: state.min !== undefined ? state.min * 100 : undefined,
    maxPrice: state.max !== undefined ? state.max * 100 : undefined,
    onlyRealDeals: state.firsat || undefined,
    sort: state.sirala,
    page: state.sayfa,
  };
}

/** Builds a listing URL from a state plus changes. Changing a filter resets the page. */
export function buildListingHref(
  basePath: string,
  state: ListingState,
  patch: Partial<ListingState> = {},
): string {
  const next: ListingState = {
    ...state,
    ...patch,
    sayfa: patch.sayfa ?? 1,
  };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.kategori) params.set("kategori", next.kategori);
  next.marka.forEach((v) => params.append("marka", v));
  next.beden.forEach((v) => params.append("beden", v));
  next.renk.forEach((v) => params.append("renk", v));
  if (next.min !== undefined) params.set("min", String(next.min));
  if (next.max !== undefined) params.set("max", String(next.max));
  if (next.firsat) params.set("firsat", "1");
  if (next.sirala !== "oneri") params.set("sirala", next.sirala);
  if (next.sayfa > 1) params.set("sayfa", String(next.sayfa));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Number of active filters (not counting search text, sort or page). */
export function countActiveFilters(
  state: ListingState,
  hasFixedCategory: boolean,
): number {
  return (
    (state.kategori && !hasFixedCategory ? 1 : 0) +
    state.marka.length +
    state.beden.length +
    state.renk.length +
    (state.min !== undefined ? 1 : 0) +
    (state.max !== undefined ? 1 : 0) +
    (state.firsat ? 1 : 0)
  );
}
