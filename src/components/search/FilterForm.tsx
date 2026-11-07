import { useId } from "react";
import Form from "next/form";
import type { Category, FilterOptions } from "@/types";
import type { ListingState } from "@/lib/search/params";

/**
 * Filter form. It is a plain GET form (next/form), so the state lives in the
 * URL: shareable, back-button friendly, and it works without extra client code.
 */
export function FilterForm({
  idPrefix,
  action,
  state,
  options,
  categories,
  fixedCategory,
}: {
  idPrefix: string;
  action: string;
  state: ListingState;
  options: FilterOptions;
  categories: Category[];
  fixedCategory?: string;
}) {
  // Unique per instance: the mobile sheet and desktop sidebar both render this form,
  // and Next keeps previous pages hidden in the DOM.
  const uid = useId();
  const topLevel = categories.filter((c) => c.parentId === null);
  const chip =
    "border-line bg-surface peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bg peer-focus-visible:outline-accent inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-medium peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2";
  const numberInput =
    "border-line bg-surface focus:border-accent h-12 w-full rounded-2xl border px-4 text-base outline-none";

  return (
    <Form action={action} className="space-y-7">
      {/* Keep search text and sort when filters are applied. */}
      {state.q && <input type="hidden" name="q" value={state.q} />}
      {state.sirala !== "oneri" && (
        <input type="hidden" name="sirala" value={state.sirala} />
      )}

      {!fixedCategory && (
        <div>
          <label
            htmlFor={`${uid}${idPrefix}-kategori`}
            className="text-sm font-semibold"
          >
            Kategori
          </label>
          <select
            id={`${uid}${idPrefix}-kategori`}
            name="kategori"
            defaultValue={state.kategori}
            className="border-line bg-surface mt-2 h-12 w-full rounded-2xl border px-4 text-base"
          >
            <option value="">Tüm kategoriler</option>
            {topLevel.map((parent) => (
              <optgroup key={parent.id} label={parent.name}>
                <option value={parent.slug}>Tüm {parent.name}</option>
                {categories
                  .filter((c) => c.parentId === parent.id)
                  .map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      <fieldset>
        <legend className="text-sm font-semibold">Fiyat aralığı (₺)</legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${uid}${idPrefix}-min`} className="sr-only">
              En az fiyat
            </label>
            <input
              id={`${uid}${idPrefix}-min`}
              name="min"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="En az"
              defaultValue={state.min}
              className={numberInput}
            />
          </div>
          <div>
            <label htmlFor={`${uid}${idPrefix}-max`} className="sr-only">
              En çok fiyat
            </label>
            <input
              id={`${uid}${idPrefix}-max`}
              name="max"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="En çok"
              defaultValue={state.max}
              className={numberInput}
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Marka</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {options.brands.map((b) => (
            <label key={b.slug} className="cursor-pointer">
              <input
                type="checkbox"
                name="marka"
                value={b.slug}
                defaultChecked={state.marka.includes(b.slug)}
                className="peer sr-only"
              />
              <span className={chip}>{b.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Beden</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {options.sizes.map((s) => (
            <label key={s} className="cursor-pointer">
              <input
                type="checkbox"
                name="beden"
                value={s}
                defaultChecked={state.beden.includes(s)}
                className="peer sr-only"
              />
              <span className={chip}>{s}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Renk</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {options.colors.map((c) => (
            <label key={c} className="cursor-pointer">
              <input
                type="checkbox"
                name="renk"
                value={c}
                defaultChecked={state.renk.includes(c)}
                className="peer sr-only"
              />
              <span className={chip}>{c}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="border-line bg-surface flex min-h-14 cursor-pointer items-center justify-between gap-4 rounded-2xl border px-4">
        <span>
          <span className="block text-sm font-semibold">
            Sadece gerçek fırsatlar
          </span>
          <span className="text-muted block text-xs">
            İndirim skoru 75 ve üzeri, şişirilmemiş
          </span>
        </span>
        <input
          type="checkbox"
          name="firsat"
          value="1"
          defaultChecked={state.firsat}
          className="accent-accent size-6 shrink-0"
        />
      </label>

      {/* On phones the button stays pinned to the bottom of the sheet. */}
      <div className="max-lg:bg-bg max-lg:border-line max-lg:sticky max-lg:bottom-0 max-lg:-mx-5 max-lg:border-t max-lg:px-5 max-lg:pt-3 max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="submit"
          className="bg-accent text-on-accent h-12 w-full rounded-full text-sm font-semibold"
        >
          Sonuçları göster
        </button>
      </div>
    </Form>
  );
}
