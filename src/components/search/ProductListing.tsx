import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getRepository } from "@/data/repository";
import { formatPrice } from "@/lib/format";
import {
  SORT_OPTIONS,
  buildListingHref,
  countActiveFilters,
  parseListingState,
  toSearchParams,
  type ListingState,
  type RawSearchParams,
} from "@/lib/search/params";
import {
  ProductGrid,
  ProductGridSkeleton,
} from "@/components/product/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterForm } from "./FilterForm";
import { FilterSheet } from "./FilterSheet";

/**
 * Shared results view for /ara and /kategori/[slug].
 * Reads searchParams, so pages must render it inside <Suspense>.
 */
export async function ProductListing({
  basePath,
  searchParams,
  fixedCategory,
  showSearchBar = false,
}: {
  basePath: string;
  searchParams: Promise<RawSearchParams>;
  fixedCategory?: string;
  showSearchBar?: boolean;
}) {
  const repo = getRepository();
  const state = parseListingState(await searchParams);
  const [result, options, categories] = await Promise.all([
    repo.search(toSearchParams(state, fixedCategory)),
    repo.getFilterOptions(),
    repo.getCategories(),
  ]);

  const activeCount = countActiveFilters(state, Boolean(fixedCategory));
  const hasAnyFilter = activeCount > 0 || state.q !== "";
  const href = (patch: Partial<ListingState>) =>
    buildListingHref(basePath, state, patch);

  const form = (idPrefix: string) => (
    <FilterForm
      idPrefix={idPrefix}
      action={basePath}
      state={state}
      options={options}
      categories={categories}
      fixedCategory={fixedCategory}
    />
  );

  // Removable chips for each active filter.
  const chips: { label: string; href: string }[] = [];
  if (state.kategori && !fixedCategory) {
    const name =
      categories.find((c) => c.slug === state.kategori)?.name ?? state.kategori;
    chips.push({ label: name, href: href({ kategori: "" }) });
  }
  for (const slug of state.marka) {
    chips.push({
      label: options.brands.find((b) => b.slug === slug)?.name ?? slug,
      href: href({ marka: state.marka.filter((x) => x !== slug) }),
    });
  }
  for (const s of state.beden)
    chips.push({
      label: `Beden ${s}`,
      href: href({ beden: state.beden.filter((x) => x !== s) }),
    });
  for (const c of state.renk)
    chips.push({
      label: c,
      href: href({ renk: state.renk.filter((x) => x !== c) }),
    });
  if (state.min !== undefined)
    chips.push({
      label: `En az ${formatPrice(state.min * 100)}`,
      href: href({ min: undefined }),
    });
  if (state.max !== undefined)
    chips.push({
      label: `En çok ${formatPrice(state.max * 100)}`,
      href: href({ max: undefined }),
    });
  if (state.firsat)
    chips.push({
      label: "Sadece gerçek fırsatlar",
      href: href({ firsat: false }),
    });

  return (
    <div>
      {showSearchBar && (
        <div className="mb-6">
          <SearchBar defaultValue={state.q} />
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[18rem_1fr] lg:gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block" aria-label="Filtreler">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">
            Filtreler
          </h2>
          {form("masaustu")}
        </aside>

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted text-sm" aria-live="polite">
              {state.q ? (
                <>
                  <span className="text-ink font-semibold">“{state.q}”</span>{" "}
                  için{" "}
                </>
              ) : null}
              <span className="text-ink price font-semibold">
                {result.total}
              </span>{" "}
              ürün
            </p>
            <div className="lg:hidden">
              <FilterSheet activeCount={activeCount}>
                {form("mobil")}
              </FilterSheet>
            </div>
          </div>

          {/* Sort */}
          <nav
            aria-label="Sıralama"
            className="no-scrollbar -mx-4 mt-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1"
          >
            {SORT_OPTIONS.map((o) => {
              const current = state.sirala === o.key;
              return (
                <Link
                  key={o.key}
                  href={href({ sirala: o.key })}
                  aria-current={current ? "true" : undefined}
                  className={`inline-flex min-h-11 shrink-0 snap-start items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap ${
                    current
                      ? "border-ink bg-ink text-bg"
                      : "border-line bg-surface"
                  }`}
                >
                  {o.label}
                </Link>
              );
            })}
          </nav>

          {chips.length > 0 && (
            <ul
              className="mt-3 flex flex-wrap items-center gap-2"
              aria-label="Aktif filtreler"
            >
              {chips.map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.href}
                    className="bg-accent/15 text-accent-text inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium"
                  >
                    {c.label}
                    <X className="size-4" aria-hidden="true" />
                    <span className="sr-only">filtresini kaldır</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={buildListingHref(
                    basePath,
                    parseListingState({ q: state.q }),
                  )}
                  className="text-muted inline-flex min-h-11 items-center px-2 text-sm underline underline-offset-4"
                >
                  Tümünü temizle
                </Link>
              </li>
            </ul>
          )}

          <div className="mt-5">
            {result.items.length === 0 ? (
              <EmptyState
                title="Sonuç bulunamadı"
                text={
                  state.q
                    ? `“${state.q}” için eşleşen ürün yok. Yazımı kontrol et ya da filtreleri gevşetmeyi dene.`
                    : "Bu filtrelere uyan ürün yok. Filtreleri gevşetmeyi dene."
                }
                actionHref={hasAnyFilter ? basePath : undefined}
                actionLabel={hasAnyFilter ? "Filtreleri temizle" : undefined}
              />
            ) : (
              <ProductGrid products={result.items} />
            )}
          </div>

          {result.pageCount > 1 && (
            <nav
              aria-label="Sayfalama"
              className="mt-8 flex items-center justify-between gap-3"
            >
              {result.page > 1 ? (
                <Link
                  href={href({ sayfa: result.page - 1 })}
                  className="border-line bg-surface inline-flex h-11 items-center gap-1 rounded-full border pr-5 pl-3 text-sm font-semibold"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" /> Önceki
                </Link>
              ) : (
                <span />
              )}
              <p className="text-muted price text-sm">
                Sayfa {result.page} / {result.pageCount}
              </p>
              {result.page < result.pageCount ? (
                <Link
                  href={href({ sayfa: result.page + 1 })}
                  className="border-line bg-surface inline-flex h-11 items-center gap-1 rounded-full border pr-3 pl-5 text-sm font-semibold"
                >
                  Sonraki <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

export function ListingSkeleton() {
  return (
    <div aria-busy="true">
      <div className="skeleton mb-6 h-14 w-full max-w-xl rounded-full" />
      <div className="skeleton mb-4 h-5 w-24 rounded-full" />
      <ProductGridSkeleton count={8} />
    </div>
  );
}
