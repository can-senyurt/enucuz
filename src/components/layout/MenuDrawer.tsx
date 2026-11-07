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
import { usePathname } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { dealShortLabel } from "@/lib/deal-score";
import { formatPrice } from "@/lib/format";
import type { MenuData } from "@/types";
import { ProductVisual } from "@/components/ui/ProductVisual";
import { SearchBar } from "@/components/ui/SearchBar";

/**
 * Site menu in the spirit of apple.com's phone navigation: the header stays,
 * its menu button turns into an X, and a calm full-height sheet slides in from
 * the left with big, bold, icon-free links that rise in one after another.
 */

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
const subscribeNever = () => () => {};

/** Page regions that must not be reachable while the menu is open. */
const BACKGROUND_SELECTORS = ["main", "footer", "[data-back-to-top]"];

export function MenuDrawer({ data }: { data: MenuData }) {
  const panelId = useId();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [dragX, setDragX] = useState<number | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number; locked: boolean } | null>(null);
  const wasOpen = useRef(false);

  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const isDark = useSyncExternalStore(subscribeTheme, getIsDark, () => false);

  const close = useCallback(() => setOpen(false), []);

  function openMenu() {
    // The sheet starts right below the header (and the demo banner above it).
    const header = document.querySelector("header");
    setTop(Math.round(header?.getBoundingClientRect().bottom ?? 56));
    setOpen(true);
  }

  // Close whenever the route changes (a menu link was followed).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  // Scroll lock, Escape, background inert, focus return.
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

    const background = BACKGROUND_SELECTORS.flatMap((sel) => [
      ...document.querySelectorAll<HTMLElement>(sel),
    ]);
    background.forEach((el) => el.setAttribute("inert", ""));

    const focusTimer = window.setTimeout(
      () => panelRef.current?.focus({ preventScroll: true }),
      60,
    );

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      background.forEach((el) => el.removeAttribute("inert"));
      html.style.overflow = prev.html;
      body.style.overflow = prev.body;
    };
  }, [open]);

  // Swipe left on the sheet to close it.
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
  const toggleSection = (id: string) =>
    setExpanded((cur) => (cur === id ? null : id));

  const panel = (
    <div
      style={{ top }}
      className={`fixed inset-x-0 bottom-0 z-[45] ${open ? "menu-open" : "pointer-events-none"}`}
    >
      {/* Dimmed backdrop (only visible beside the sheet on wide screens) */}
      <div
        aria-hidden="true"
        onClick={close}
        style={backdropStyle}
        className={`absolute inset-0 bg-black/35 transition-[opacity,visibility] duration-[450ms] ease-out ${
          open
            ? "pointer-events-auto visible opacity-100"
            : "invisible opacity-0"
        }`}
      />

      <nav
        id={panelId}
        ref={panelRef}
        tabIndex={-1}
        aria-label="Ana menü"
        inert={!open}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={panelStyle}
        className={`bg-bg absolute inset-y-0 left-0 w-full overflow-y-auto overscroll-contain outline-none sm:w-[26rem] sm:rounded-br-[2rem] sm:shadow-[0_0_60px_rgb(0_0_0/0.25)] ${
          open
            ? "pointer-events-auto visible translate-x-0 opacity-100 [transition:transform_520ms_cubic-bezier(0.32,0.72,0,1),opacity_300ms_ease,visibility_0s_0s]"
            : "invisible -translate-x-full opacity-0 [transition:transform_460ms_cubic-bezier(0.32,0.72,0,1),opacity_300ms_ease_80ms,visibility_0s_460ms]"
        }`}
      >
        <div className="px-6 pt-6 pb-[max(3rem,env(safe-area-inset-bottom))]">
          {/* Search (with type-ahead suggestions) */}
          <div style={item()} className="menu-item">
            <SearchBar variant="menu" onNavigate={close} />
          </div>

          {/* Primary list: big, bold, no icons */}
          <ul className="mt-6" aria-label="Bölümler">
            <Section
              id={`${panelId}-firsat`}
              label="Fırsatlar"
              open={expanded === `${panelId}-firsat`}
              onToggle={() => toggleSection(`${panelId}-firsat`)}
              style={item()}
            >
              <ul className="space-y-1 pt-1 pb-3">
                {data.featured.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/urun/${p.slug}`}
                      onClick={close}
                      className="hover:bg-ink/[0.05] active:bg-ink/[0.08] -mx-2 flex min-h-16 items-center gap-3 rounded-2xl p-2 transition-colors"
                    >
                      <span className="from-ink/[0.03] to-ink/[0.08] relative block size-14 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b p-1">
                        <ProductVisual
                          kind={p.imageKind}
                          color={p.color}
                          alt={p.title}
                          photoUrl={p.photoUrl}
                          sizes="56px"
                          decorative
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-muted block truncate text-xs">
                          {p.brand}
                        </span>
                        <span className="block truncate text-[17px] leading-snug font-semibold tracking-tight">
                          {p.title}
                        </span>
                        <span className="text-muted price block text-sm">
                          {formatPrice(p.price)} · {dealShortLabel[p.label]}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <SeeAll href="/firsatlar" onNavigate={close}>
                    Tüm fırsatlar ({data.totals.deals})
                  </SeeAll>
                </li>
              </ul>
            </Section>

            {data.categories.map((cat) => (
              <Section
                key={cat.slug}
                id={`${panelId}-${cat.slug}`}
                label={cat.name}
                open={expanded === `${panelId}-${cat.slug}`}
                onToggle={() => toggleSection(`${panelId}-${cat.slug}`)}
                style={item()}
              >
                <ul className="space-y-0.5 pt-1 pb-3">
                  {cat.children.map((child) => (
                    <li key={child.slug}>
                      <SubLink
                        href={`/kategori/${child.slug}`}
                        onNavigate={close}
                      >
                        {child.name}
                        <span className="text-muted price ml-2 text-base font-normal">
                          {child.count}
                        </span>
                      </SubLink>
                    </li>
                  ))}
                  <li>
                    <SeeAll href={`/kategori/${cat.slug}`} onNavigate={close}>
                      Tümünü gör ({cat.count})
                    </SeeAll>
                  </li>
                </ul>
              </Section>
            ))}

            <Section
              id={`${panelId}-marka`}
              label="Markalar"
              open={expanded === `${panelId}-marka`}
              onToggle={() => toggleSection(`${panelId}-marka`)}
              style={item()}
            >
              <ul className="space-y-0.5 pt-1 pb-3">
                {data.brands.map((b) => (
                  <li key={b.slug}>
                    <SubLink href={`/ara?marka=${b.slug}`} onNavigate={close}>
                      {b.name}
                      <span className="text-muted price ml-2 text-base font-normal">
                        {b.productCount}
                      </span>
                    </SubLink>
                  </li>
                ))}
              </ul>
            </Section>
          </ul>

          {/* Secondary list: small, quiet */}
          <ul
            aria-label="Diğer bağlantılar"
            style={item()}
            className="menu-item border-line mt-6 space-y-0.5 border-t pt-5"
          >
            <li>
              <MiniLink href="/ara" onNavigate={close}>
                Tüm ürünler{" "}
                <span className="price">({data.totals.products})</span>
              </MiniLink>
            </li>
            <li>
              <MiniLink href="/firsatlar#sisirilmis" onNavigate={close}>
                Dikkat listesi{" "}
                <span className="price">({data.totals.inflated})</span>
              </MiniLink>
            </li>
            <li>
              <MiniLink href="/#neden" onNavigate={close}>
                İndirim skoru nasıl çalışır?
              </MiniLink>
            </li>
            <li>
              <button
                type="button"
                role="switch"
                aria-checked={isDark}
                onClick={toggleTheme}
                className="text-muted hover:text-ink flex min-h-11 w-full items-center justify-between text-[15px] font-medium transition-colors"
              >
                Koyu görünüm
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
            </li>
          </ul>

          <p style={item()} className="menu-item text-muted mt-8 text-xs">
            EnUcuz · Demo veriler kurgusaldır
          </p>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : openMenu())}
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        aria-expanded={open}
        aria-controls={panelId}
        className="-ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
      >
        {/* Two lines that turn into an X */}
        <span aria-hidden="true" className="relative block h-3 w-[22px]">
          <span
            className={`bg-ink absolute left-0 h-[1.5px] w-full rounded-full transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "top-[5.25px] rotate-45" : "top-0 rotate-0"
            }`}
          />
          <span
            className={`bg-ink absolute left-0 h-[1.5px] w-full rounded-full transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "top-[5.25px] -rotate-45" : "top-[10.5px] rotate-0"
            }`}
          />
        </span>
      </button>
      {/* A portal: the header uses backdrop-filter, which would otherwise trap
          position:fixed children inside the header's own box. */}
      {mounted ? createPortal(panel, document.body) : null}
    </>
  );
}

/* ---------- building blocks ---------- */

/** A big headline row that expands to show its links (one open at a time). */
function Section({
  id,
  label,
  open,
  onToggle,
  style,
  children,
}: {
  id: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  style: CSSProperties;
  children: ReactNode;
}) {
  return (
    <li style={style} className="menu-item">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="group flex min-h-[3.4rem] w-full items-center justify-between gap-4 py-1.5 text-left"
      >
        <span
          className={`text-[1.85rem] leading-tight font-semibold tracking-tight transition-colors duration-300 ${
            open ? "text-ink" : "text-ink/90 group-hover:text-ink"
          }`}
        >
          {label}
        </span>
        <Plus
          className={`text-muted size-6 shrink-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "rotate-45" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        id={id}
        className={`grid transition-[grid-template-rows,opacity] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden" inert={!open}>
          {children}
        </div>
      </div>
    </li>
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
      className="text-ink/80 hover:text-ink active:text-ink flex min-h-12 items-baseline py-2 text-[1.3rem] leading-tight font-semibold tracking-tight transition-colors"
    >
      {children}
    </Link>
  );
}

function SeeAll({
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
      className="text-accent-text group inline-flex min-h-12 items-center gap-1.5 text-[17px] font-semibold"
    >
      {children}
      <ArrowRight
        className="size-4 transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </Link>
  );
}

function MiniLink({
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
      className="text-muted hover:text-ink flex min-h-11 items-center gap-1.5 text-[15px] font-medium transition-colors"
    >
      {children}
    </Link>
  );
}
