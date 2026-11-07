import { useId } from "react";
import { Search } from "lucide-react";

/**
 * Big hero search. A plain GET form, so it works without JavaScript.
 * The focus state is drawn on the pill itself (border + soft ring + gentle
 * grow); the inner input deliberately shows no separate outline.
 */
export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  // A fixed id would be duplicated while the previous page is kept hidden in the DOM.
  const id = useId();
  return (
    <form
      action="/ara"
      role="search"
      className="border-line bg-surface focus-within:border-accent focus-within:ring-accent/20 mx-auto flex h-14 w-full max-w-xl items-center gap-2 rounded-full border pr-2 pl-5 shadow-[0_8px_30px_-8px_rgb(0_0_0/0.12)] transition-[transform,box-shadow,border-color] duration-300 ease-out focus-within:ring-4 motion-safe:focus-within:scale-[1.015] sm:h-16"
    >
      <Search className="text-muted size-5 shrink-0" aria-hidden="true" />
      <label htmlFor={id} className="sr-only">
        Ürün ara
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Ne arıyorsun?"
        autoComplete="off"
        enterKeyHint="search"
        className="placeholder:text-muted h-full min-w-0 flex-1 appearance-none bg-transparent text-base outline-none focus:outline-none focus-visible:outline-none"
      />
      <button
        type="submit"
        className="bg-accent text-on-accent h-11 shrink-0 rounded-full px-6 text-sm font-semibold transition-[transform,opacity] duration-200 hover:opacity-90 active:scale-95 sm:h-12"
      >
        Ara
      </button>
    </form>
  );
}
