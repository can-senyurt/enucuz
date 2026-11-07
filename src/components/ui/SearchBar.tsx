import { Search } from "lucide-react";

/** Big hero search. A plain GET form, so it works without JavaScript. */
export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form
      action="/ara"
      role="search"
      className="border-line bg-surface focus-within:border-accent mx-auto flex h-14 w-full max-w-xl items-center gap-2 rounded-full border pr-2 pl-5 shadow-sm transition-transform duration-200 focus-within:shadow-md motion-safe:focus-within:scale-[1.02]"
    >
      <Search className="text-muted size-5 shrink-0" aria-hidden="true" />
      <label htmlFor="q" className="sr-only">
        Ürün ara
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Ürün, marka veya model ara"
        autoComplete="off"
        enterKeyHint="search"
        className="placeholder:text-muted h-full min-w-0 flex-1 bg-transparent text-base outline-none"
      />
      <button
        type="submit"
        className="bg-accent text-on-accent h-11 shrink-0 rounded-full px-5 text-sm font-semibold transition-opacity hover:opacity-90"
      >
        Ara
      </button>
    </form>
  );
}
