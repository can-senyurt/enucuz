"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LayoutGrid, Search } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { highlightSegments } from "@/lib/search/normalize";
import type { SuggestResult } from "@/types";
import { ProductImage } from "./ProductImage";

/**
 * Search box with type-ahead suggestions (products, categories, brands).
 *
 *  - "hero": the big pill on the home / search pages; suggestions float below it.
 *  - "menu": the compact field inside the side menu; suggestions flow inline.
 *
 * It is a normal GET form, so searching also works without JavaScript.
 * Keyboard: ↑ ↓ move, Enter opens the highlighted row, Esc closes.
 */

type Variant = "hero" | "menu";
const MIN_CHARS = 2;
const DEBOUNCE_MS = 130;

const MONOGRAM_COLORS = [
  "#1f3358",
  "#7a1f35",
  "#2f6f4f",
  "#6b4a2b",
  "#4b3f8f",
  "#a14b1e",
  "#1d5f73",
  "#5c2d6e",
];
function monogramColor(slug: string): string {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return MONOGRAM_COLORS[h % MONOGRAM_COLORS.length];
}

interface Row {
  id: string;
  href: string;
}

/** Text with the typed part in bold, the rest quieter. */
function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightSegments(text, query).map((s, i) =>
        s.hit ? (
          <mark key={i} className="text-ink bg-transparent font-semibold">
            {s.text}
          </mark>
        ) : (
          <span key={i} className="text-ink/75">
            {s.text}
          </span>
        ),
      )}
    </>
  );
}

export function SearchBar({
  defaultValue = "",
  variant = "hero",
  onNavigate,
}: {
  defaultValue?: string;
  variant?: Variant;
  /** Called when a suggestion is chosen or the form is submitted (e.g. to close the menu). */
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const uid = useId();
  const inputId = `${uid}-input`;
  const listId = `${uid}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const cache = useRef(new Map<string, SuggestResult>());

  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [data, setData] = useState<{ q: string; result: SuggestResult } | null>(
    null,
  );

  const query = value.trim();
  const searching = query.length >= MIN_CHARS;
  const fresh = data?.q === query;
  const result = searching ? (data?.result ?? null) : null;

  // Fetch suggestions shortly after the user stops typing.
  useEffect(() => {
    if (!open || !searching) return;
    const key = query.toLocaleLowerCase("tr-TR");
    const cached = cache.current.get(key);
    if (cached) {
      const t = window.setTimeout(
        () => setData({ q: query, result: cached }),
        0,
      );
      return () => window.clearTimeout(t);
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/oner?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const json = (await res.json()) as SuggestResult;
        cache.current.set(key, json);
        setData({ q: query, result: json });
      } catch {
        // Aborted or offline: keep whatever is already shown.
      }
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, open, searching]);

  // The suggestion list may use only the space that is really visible: on a phone
  // the keyboard covers the bottom of the screen, so we read the visual viewport.
  const [listMaxHeight, setListMaxHeight] = useState(420);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!open || variant !== "hero") return;
    function measure() {
      const vv = window.visualViewport;
      const bottom = formRef.current?.getBoundingClientRect().bottom ?? 0;
      const viewportHeight = vv?.height ?? window.innerHeight;
      const top = vv?.offsetTop ?? 0;
      const room = viewportHeight - (bottom - top) - 28;
      setListMaxHeight(Math.round(Math.min(480, Math.max(230, room))));
    }
    const frame = window.requestAnimationFrame(measure);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", measure);
    vv?.addEventListener("scroll", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      vv?.removeEventListener("resize", measure);
      vv?.removeEventListener("scroll", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [open, variant]);

  // Close when tapping or clicking anywhere outside (works on iOS, where taps
  // on links do not reliably move focus).
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Flat list of selectable rows, in the order they are shown.
  const rows = useMemo<Row[]>(() => {
    if (!searching) {
      return siteConfig.popularSearches.map((term, i) => ({
        id: `${uid}-p${i}`,
        href: `/ara?q=${encodeURIComponent(term)}`,
      }));
    }
    const list: Row[] = [];
    result?.products.forEach((p) =>
      list.push({ id: `${uid}-pr-${p.slug}`, href: `/urun/${p.slug}` }),
    );
    result?.categories.forEach((c) =>
      list.push({ id: `${uid}-c-${c.slug}`, href: `/kategori/${c.slug}` }),
    );
    result?.brands.forEach((b) =>
      list.push({ id: `${uid}-b-${b.slug}`, href: `/ara?marka=${b.slug}` }),
    );
    list.push({
      id: `${uid}-all`,
      href: `/ara?q=${encodeURIComponent(query)}`,
    });
    return list;
  }, [searching, result, query, uid]);

  const indexOf = (id: string) => rows.findIndex((r) => r.id === id);
  const activeId =
    active >= 0 && active < rows.length ? rows[active].id : undefined;

  function choose(href: string) {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (open) {
        // First Escape only closes the suggestions (not a surrounding menu).
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        setActive(-1);
      }
      return;
    }
    if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!open) {
        setOpen(true);
        return;
      }
      e.preventDefault();
      const last = rows.length - 1;
      setActive((cur) => {
        if (e.key === "ArrowDown") return cur >= last ? 0 : cur + 1;
        return cur <= 0 ? last : cur - 1;
      });
      return;
    }
    if (e.key === "Enter" && open && activeId) {
      e.preventDefault();
      choose(rows[active].href);
    }
  }

  function onFocus() {
    setOpen(true);
    // On the home page the box sits mid-screen: lift it so the list stays above the keyboard.
    if (variant === "hero" && rootRef.current) {
      const top = rootRef.current.getBoundingClientRect().top;
      if (top > 190) {
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({
          top: window.scrollY + top - 96,
          behavior: reduce ? "auto" : "smooth",
        });
      }
    }
  }

  const isHero = variant === "hero";
  const showList = open;
  const empty =
    searching &&
    fresh &&
    result &&
    !result.products.length &&
    !result.categories.length &&
    !result.brands.length;

  const rowBase =
    "flex w-full items-center gap-3 rounded-2xl px-2.5 text-left transition-colors";
  const rowState = (id: string) =>
    indexOf(id) === active ? "bg-ink/[0.07]" : "hover:bg-ink/[0.05]";

  const heading = (text: string) => (
    <p
      className="text-muted px-3 pt-3 pb-1 text-xs font-semibold tracking-wider uppercase"
      role="presentation"
    >
      {text}
    </p>
  );

  const list = (
    <div
      id={listId}
      role="listbox"
      aria-label="Arama önerileri"
      style={isHero ? { maxHeight: listMaxHeight } : undefined}
      className={
        isHero
          ? "animate-pop border-line bg-surface absolute inset-x-0 top-full z-30 mt-2 overflow-y-auto overscroll-contain rounded-[1.75rem] border p-2 text-left shadow-[0_28px_70px_-24px_rgb(0_0_0/0.35)]"
          : "animate-pop mt-3"
      }
    >
      {!searching && (
        <>
          {heading("Popüler aramalar")}
          {siteConfig.popularSearches.map((term, i) => {
            const id = `${uid}-p${i}`;
            return (
              <div
                key={id}
                role="option"
                id={id}
                aria-selected={indexOf(id) === active}
              >
                <Link
                  href={`/ara?q=${encodeURIComponent(term)}`}
                  onClick={() => choose(`/ara?q=${encodeURIComponent(term)}`)}
                  tabIndex={-1}
                  className={`${rowBase} min-h-12 ${rowState(id)}`}
                >
                  <Search
                    className="text-muted size-[18px] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-[15px] font-medium">{term}</span>
                </Link>
              </div>
            );
          })}
        </>
      )}

      {searching && (
        <div
          className={
            !fresh && result
              ? "opacity-60 transition-opacity"
              : "transition-opacity"
          }
        >
          {result && result.products.length > 0 && (
            <>
              {heading("Ürünler")}
              {result.products.map((p) => {
                const id = `${uid}-pr-${p.slug}`;
                return (
                  <div
                    key={id}
                    role="option"
                    id={id}
                    aria-selected={indexOf(id) === active}
                  >
                    <Link
                      href={`/urun/${p.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        choose(`/urun/${p.slug}`);
                      }}
                      tabIndex={-1}
                      className={`${rowBase} min-h-16 py-2 ${rowState(id)}`}
                    >
                      <span className="from-ink/[0.03] to-ink/[0.08] block size-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b p-0.5">
                        <ProductImage
                          kind={p.imageKind}
                          color={p.color}
                          alt={p.title}
                          decorative
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] leading-snug font-medium">
                          <Highlight text={p.title} query={query} />
                        </span>
                        <span className="text-muted block truncate text-xs">
                          <Highlight text={p.brand} query={query} />
                          <span className="price">
                            {" "}
                            · {formatPrice(p.price)}
                          </span>
                        </span>
                      </span>
                    </Link>
                  </div>
                );
              })}
            </>
          )}

          {result && result.categories.length > 0 && (
            <>
              {heading("Kategoriler")}
              {result.categories.map((c) => {
                const id = `${uid}-c-${c.slug}`;
                return (
                  <div
                    key={id}
                    role="option"
                    id={id}
                    aria-selected={indexOf(id) === active}
                  >
                    <Link
                      href={`/kategori/${c.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        choose(`/kategori/${c.slug}`);
                      }}
                      tabIndex={-1}
                      className={`${rowBase} min-h-12 ${rowState(id)}`}
                    >
                      <span className="bg-ink/[0.06] text-muted inline-flex size-9 shrink-0 items-center justify-center rounded-xl">
                        <LayoutGrid
                          className="size-[17px]"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                        <Highlight text={c.name} query={query} />
                      </span>
                      <span className="text-muted price shrink-0 text-xs">
                        {c.count} ürün
                      </span>
                    </Link>
                  </div>
                );
              })}
            </>
          )}

          {result && result.brands.length > 0 && (
            <>
              {heading("Markalar")}
              {result.brands.map((b) => {
                const id = `${uid}-b-${b.slug}`;
                return (
                  <div
                    key={id}
                    role="option"
                    id={id}
                    aria-selected={indexOf(id) === active}
                  >
                    <Link
                      href={`/ara?marka=${b.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        choose(`/ara?marka=${b.slug}`);
                      }}
                      tabIndex={-1}
                      className={`${rowBase} min-h-12 ${rowState(id)}`}
                    >
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: monogramColor(b.slug) }}
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      >
                        {b.name.charAt(0)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                        <Highlight text={b.name} query={query} />
                      </span>
                      <span className="text-muted price shrink-0 text-xs">
                        {b.count} ürün
                      </span>
                    </Link>
                  </div>
                );
              })}
            </>
          )}

          {empty && (
            <p className="text-muted px-3 py-4 text-sm text-pretty">
              “{query}” için öneri bulamadık. Yine de tüm ürünlerde
              arayabilirsin.
            </p>
          )}

          <div
            role="option"
            id={`${uid}-all`}
            aria-selected={indexOf(`${uid}-all`) === active}
            className="bg-surface border-line sticky bottom-0 z-10 -mx-2 mt-1 -mb-2 border-t px-2 pt-1 pb-2"
          >
            <Link
              href={`/ara?q=${encodeURIComponent(query)}`}
              onClick={(e) => {
                e.preventDefault();
                choose(`/ara?q=${encodeURIComponent(query)}`);
              }}
              tabIndex={-1}
              className={`${rowBase} text-accent-text group min-h-12 font-semibold ${rowState(`${uid}-all`)}`}
            >
              <Search className="size-[18px] shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-[15px]">
                “{query}” için tüm sonuçlar
              </span>
              <ArrowRight
                className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  const announce = !open
    ? ""
    : !searching
      ? "Popüler aramalar gösteriliyor"
      : fresh && result
        ? `${result.products.length} ürün, ${result.categories.length} kategori, ${result.brands.length} marka önerisi`
        : "";

  return (
    <div
      ref={rootRef}
      className={`relative ${isHero ? "mx-auto w-full max-w-xl" : "w-full"}`}
    >
      <Form
        ref={formRef}
        action="/ara"
        role="search"
        onSubmit={() => {
          setOpen(false);
          onNavigate?.();
        }}
        className={
          isHero
            ? "border-line bg-surface focus-within:border-accent focus-within:ring-accent/20 flex h-14 w-full items-center gap-2 rounded-full border pr-2 pl-5 shadow-[0_8px_30px_-8px_rgb(0_0_0/0.12)] transition-[transform,box-shadow,border-color] duration-300 ease-out focus-within:ring-4 motion-safe:focus-within:scale-[1.015] sm:h-16"
            : "bg-ink/[0.06] focus-within:bg-ink/[0.09] flex h-12 items-center gap-2.5 rounded-xl px-3.5 transition-colors"
        }
      >
        <Search
          className={`text-muted shrink-0 ${isHero ? "size-5" : "size-[18px]"}`}
          aria-hidden="true"
        />
        <label htmlFor={inputId} className="sr-only">
          Ürün ara
        </label>
        <input
          id={inputId}
          name="q"
          type="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? activeId : undefined}
          placeholder={isHero ? "Ne arıyorsun?" : "EnUcuz'da ara"}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          className="placeholder:text-muted h-full min-w-0 flex-1 appearance-none bg-transparent text-base outline-none focus:outline-none focus-visible:outline-none"
        />
        {isHero && (
          <button
            type="submit"
            className="bg-accent text-on-accent h-11 shrink-0 rounded-full px-6 text-sm font-semibold transition-[transform,opacity] duration-200 hover:opacity-90 active:scale-95 sm:h-12"
          >
            Ara
          </button>
        )}
      </Form>

      {showList && list}
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
    </div>
  );
}
