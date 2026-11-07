"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type TouchEvent,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Form from "next/form";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  LayoutGrid,
  Menu,
  Moon,
  Search,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { dealShortLabel } from "@/lib/deal-score";
import { formatPrice } from "@/lib/format";
import type { MenuData } from "@/types";
import { ProductImage } from "@/components/ui/ProductImage";

/** Deep colours for the brand monograms (white text stays readable on all). */
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

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Subscribes to <html data-theme> so the switch always shows the real theme. */
function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}
const getIsDark = () => document.documentElement.dataset.theme === "dark";

/** True only in the browser (the menu panel is rendered through a portal). */
const subscribeNever = () => () => {};

export function MenuDrawer({ data }: { data: MenuData }) {
  const panelId = useId();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dragX, setDragX] = useState<number | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number; locked: boolean } | null>(null);
  const wasOpen = useRef(false);

  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const isDark = useSyncExternalStore(subscribeTheme, getIsDark, () => false);

  const close = useCallback(() => setOpen(false), []);

  // Close whenever the route changes (a menu link was followed).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Scroll lock, Escape, focus trap and focus return.
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) triggerRef.current?.focus({ preventScroll: true });
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const html = document.documentElement;
    const body = document.body;
    const prev = { html: html.style.overflow, body: body.style.overflow };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(
      () => closeRef.current?.focus({ preventScroll: true }),
      60,
    );

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = [
        ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prev.html;
      body.style.overflow = prev.body;
    };
  }, [open]);

  // Swipe left on the panel to close it, like an iOS sheet.
  function onTouchStart(e: TouchEvent) {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY, locked: false };
  }
  function onTouchMove(e: TouchEvent) {
    const s = touch.current;
    if (!s) return;
    const t = e.touches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (!s.locked) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.4 && dx < 0) {
        s.locked = true;
      } else if (Math.abs(dy) > 10) {
        touch.current = null; // a vertical scroll, not a swipe
        return;
      }
    }
    if (s.locked) setDragX(Math.min(0, dx));
  }
  function onTouchEnd() {
    const x = dragX;
    touch.current = null;
    setDragX(null);
    if (x !== null && x < -90) setOpen(false);
  }

  const dragging = dragX !== null;
  const panelStyle: CSSProperties | undefined = dragging
    ? { transform: `translateX(${dragX}px)`, transition: "none" }
    : undefined;
  const backdropStyle: CSSProperties | undefined = dragging
    ? { opacity: Math.max(0, 1 + (dragX as number) / 340), transition: "none" }
    : undefined;

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked; the switch still works for this visit.
    }
  }

  let step = 0;
  const item = () => ({ "--i": step++ }) as CSSProperties;

  const panel = (
    <div
      className={`fixed inset-0 z-[70] ${open ? "menu-open" : "pointer-events-none"}`}
    >
      {/* Dimmed backdrop */}
      <div
        aria-hidden="true"
        onClick={close}
        style={backdropStyle}
        className={`absolute inset-0 bg-black/45 transition-[opacity,visibility] duration-[450ms] ease-out ${
          open ? "visible opacity-100" : "invisible opacity-0"
        } ${open ? "pointer-events-auto" : ""}`}
      />

      <aside
        id={panelId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Ana menü"
        inert={!open}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={panelStyle}
        className={`bg-bg absolute inset-y-0 left-0 flex w-[min(90vw,22rem)] flex-col overflow-hidden rounded-r-[2rem] shadow-[0_0_60px_rgb(0_0_0/0.35)] ${
          open
            ? "pointer-events-auto visible translate-x-0 [transition:transform_500ms_cubic-bezier(0.32,0.72,0,1),visibility_0s_0s]"
            : "invisible -translate-x-full [transition:transform_450ms_cubic-bezier(0.32,0.72,0,1),visibility_0s_450ms]"
        }`}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(2rem,env(safe-area-inset-bottom))]">
          {/* Title + search (stays pinned while the lists scroll) */}
          <div className="bg-bg after:from-bg sticky top-0 z-10 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-3 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-5 after:bg-gradient-to-b after:to-transparent">
            <div
              className="menu-item flex items-center justify-between"
              style={item()}
            >
              <h2 className="text-[2rem] leading-none font-semibold tracking-tight">
                Menü
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Menüyü kapat"
                className="bg-ink/8 hover:bg-ink/12 inline-flex size-11 items-center justify-center rounded-full transition-colors active:scale-95"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <Form
              action="/ara"
              role="search"
              onSubmit={close}
              className="menu-item bg-ink/[0.06] focus-within:bg-ink/[0.09] mt-4 flex h-11 items-center gap-2 rounded-xl px-3 transition-colors"
              style={item()}
            >
              <Search
                className="text-muted size-[18px] shrink-0"
                aria-hidden="true"
              />
              <label htmlFor={`${panelId}-q`} className="sr-only">
                Ürün ara
              </label>
              <input
                id={`${panelId}-q`}
                name="q"
                type="search"
                placeholder="Ürün, marka, kategori"
                autoComplete="off"
                enterKeyHint="search"
                className="placeholder:text-muted h-full min-w-0 flex-1 appearance-none bg-transparent text-base outline-none focus:outline-none focus-visible:outline-none"
              />
            </Form>
          </div>

          <nav aria-label="Menü" className="space-y-6 px-4 pt-2">
            {/* Discover */}
            <Group style={item()}>
              <Row
                href="/firsatlar"
                onNavigate={close}
                style={item()}
                icon={<Sparkles className="size-[18px]" aria-hidden="true" />}
                color="#34c759"
                label="Günün Fırsatları"
                trailing={<Count>{data.totals.deals}</Count>}
              />
              <Row
                href="/ara"
                onNavigate={close}
                style={item()}
                icon={<LayoutGrid className="size-[18px]" aria-hidden="true" />}
                color="#ff5a36"
                label="Tüm Ürünler"
                trailing={<Count>{data.totals.products}</Count>}
              />
              <Row
                href="/firsatlar#sisirilmis"
                onNavigate={close}
                style={item()}
                icon={
                  <TriangleAlert className="size-[18px]" aria-hidden="true" />
                }
                color="#ff9f0a"
                label="Dikkat Listesi"
                trailing={<Count>{data.totals.inflated}</Count>}
              />
            </Group>

            {/* Categories */}
            <section aria-labelledby={`${panelId}-kat`}>
              <SectionTitle id={`${panelId}-kat`} style={item()}>
                Kategoriler
              </SectionTitle>
              <Group style={item()}>
                {data.categories.map((cat) => {
                  const isOpen = expanded === cat.slug;
                  return (
                    <div
                      key={cat.slug}
                      className="menu-item after:bg-line relative after:absolute after:right-0 after:bottom-0 after:left-[3.75rem] after:h-px last:after:hidden"
                      style={item()}
                    >
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : cat.slug)}
                        aria-expanded={isOpen}
                        aria-controls={`${panelId}-${cat.slug}`}
                        className="hover:bg-ink/[0.04] active:bg-ink/[0.07] flex min-h-14 w-full items-center gap-3 px-3 text-left transition-colors"
                      >
                        <span className="from-ink/[0.03] to-ink/[0.08] block size-10 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b p-0.5">
                          <ProductImage
                            kind={cat.art.kind}
                            color={cat.art.color}
                            alt={cat.name}
                            decorative
                          />
                        </span>
                        <span className="min-w-0 flex-1 text-[17px] font-medium tracking-tight">
                          {cat.name}
                        </span>
                        <Count>{cat.count}</Count>
                        <ChevronRight
                          className={`text-muted size-[18px] shrink-0 transition-transform duration-300 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </button>

                      <div
                        id={`${panelId}-${cat.slug}`}
                        className={`grid transition-[grid-template-rows] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <ul className="overflow-hidden" inert={!isOpen}>
                          <li className="border-line mx-3 border-t pt-1">
                            <SubLink
                              href={`/kategori/${cat.slug}`}
                              onNavigate={close}
                            >
                              Tümünü gör <Count>{cat.count}</Count>
                            </SubLink>
                          </li>
                          {cat.children.map((child) => (
                            <li key={child.slug} className="mx-3 last:mb-2">
                              <SubLink
                                href={`/kategori/${child.slug}`}
                                onNavigate={close}
                              >
                                {child.name} <Count>{child.count}</Count>
                              </SubLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </Group>
            </section>

            {/* Brands */}
            <section aria-labelledby={`${panelId}-marka`}>
              <SectionTitle id={`${panelId}-marka`} style={item()}>
                Markalar
              </SectionTitle>
              <ul
                className="menu-item bg-surface grid grid-cols-2 gap-1 rounded-2xl p-1.5"
                style={item()}
              >
                {data.brands.map((b) => (
                  <li key={b.slug}>
                    <Link
                      href={`/ara?marka=${b.slug}`}
                      onClick={close}
                      className="hover:bg-ink/[0.05] active:bg-ink/[0.08] flex min-h-14 items-center gap-2.5 rounded-xl p-2 transition-colors"
                    >
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: monogramColor(b.slug) }}
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      >
                        {b.name.charAt(0)}
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 block text-[15px] leading-tight font-medium">
                          {b.name}
                        </span>
                        <span className="text-muted price block text-xs">
                          {b.productCount} ürün
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Featured products */}
            <section aria-labelledby={`${panelId}-urun`}>
              <SectionTitle id={`${panelId}-urun`} style={item()}>
                Öne çıkan ürünler
              </SectionTitle>
              <Group style={item()}>
                {data.featured.map((p) => (
                  <div
                    key={p.slug}
                    className="menu-item after:bg-line relative after:absolute after:right-0 after:bottom-0 after:left-[4.25rem] after:h-px last:after:hidden"
                    style={item()}
                  >
                    <Link
                      href={`/urun/${p.slug}`}
                      onClick={close}
                      className="hover:bg-ink/[0.04] active:bg-ink/[0.07] flex min-h-[4.25rem] items-center gap-3 px-3 py-2 transition-colors"
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
                        <span className="text-muted block truncate text-xs">
                          {p.brand}
                        </span>
                        <span className="block truncate text-[15px] leading-snug font-medium">
                          {p.title}
                        </span>
                        <span className="price text-sm font-semibold whitespace-nowrap">
                          {formatPrice(p.price)}
                        </span>
                      </span>
                      <span className="bg-deal/12 text-deal-text shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold whitespace-nowrap">
                        {dealShortLabel[p.label]}
                      </span>
                    </Link>
                  </div>
                ))}
              </Group>
            </section>

            {/* Appearance */}
            <section aria-label="Görünüm">
              <Group style={item()}>
                <div className="menu-item" style={item()}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDark}
                    onClick={toggleTheme}
                    className="hover:bg-ink/[0.04] flex min-h-14 w-full items-center gap-3 px-3 text-left transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      style={{ backgroundColor: "#5e5ce6" }}
                      className="inline-flex size-8 shrink-0 items-center justify-center rounded-[0.55rem] text-white"
                    >
                      <Moon className="size-[18px]" />
                    </span>
                    <span className="flex-1 text-[17px] font-medium tracking-tight">
                      Koyu görünüm
                    </span>
                    <span
                      aria-hidden="true"
                      className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-300 ${
                        isDark ? "bg-deal" : "bg-ink/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 size-[27px] rounded-full bg-white shadow-md transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                          isDark ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </Group>
            </section>

            <p
              className="menu-item text-muted px-2 text-center text-xs"
              style={item()}
            >
              Demo veriler kurgusaldır
            </p>
          </nav>
        </div>
      </aside>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        className="hover:bg-ink/5 -ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-[background-color,transform] active:scale-90"
      >
        <Menu className="size-[22px]" aria-hidden="true" />
      </button>
      {/* A portal: the header uses backdrop-filter, which would otherwise trap
          position:fixed children inside the header's own box. */}
      {mounted ? createPortal(panel, document.body) : null}
    </>
  );
}

/* ---------- small building blocks (iOS Settings-style lists) ---------- */

function Group({
  children,
  style,
}: {
  children: ReactNode;
  style: CSSProperties;
}) {
  return (
    <div
      style={style}
      className="menu-item bg-surface overflow-hidden rounded-2xl"
    >
      {children}
    </div>
  );
}

function SectionTitle({
  children,
  id,
  style,
}: {
  children: ReactNode;
  id: string;
  style: CSSProperties;
}) {
  return (
    <h3
      id={id}
      style={style}
      className="menu-item text-muted mb-2 px-3 text-xs font-semibold tracking-wider uppercase"
    >
      {children}
    </h3>
  );
}

function Count({ children }: { children: ReactNode }) {
  return (
    <span className="text-muted price shrink-0 text-[15px]">{children}</span>
  );
}

function Row({
  href,
  icon,
  color,
  label,
  trailing,
  onNavigate,
  style,
}: {
  href: string;
  icon: ReactNode;
  color: string;
  label: string;
  trailing?: ReactNode;
  onNavigate: () => void;
  style: CSSProperties;
}) {
  return (
    <div
      style={style}
      className="menu-item after:bg-line relative after:absolute after:right-0 after:bottom-0 after:left-[3.75rem] after:h-px last:after:hidden"
    >
      <Link
        href={href}
        onClick={onNavigate}
        className="hover:bg-ink/[0.04] active:bg-ink/[0.07] flex min-h-14 items-center gap-3 px-3 transition-colors"
      >
        <span
          aria-hidden="true"
          style={{ backgroundColor: color }}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-[0.55rem] text-white"
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1 text-[17px] font-medium tracking-tight">
          {label}
        </span>
        {trailing}
        <ChevronRight
          className="text-muted size-[18px] shrink-0"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}

function SubLink({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="hover:bg-ink/[0.05] active:bg-ink/[0.08] flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 text-[15px] transition-colors"
    >
      {children}
    </Link>
  );
}
