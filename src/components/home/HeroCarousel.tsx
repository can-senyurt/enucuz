"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import type { HomeBanner } from "@/lib/home-banners";

/**
 * Campaign banner that moves on its own, calmly: each slide stays long enough
 * to be read (DWELL), then cross-fades into the next one while the photo
 * settles with a slow zoom. Apple-style pill underneath: the active dot fills
 * up like a progress bar and, when full, moves to the next slide.
 *
 * It waits while the visitor interacts (hover, keyboard focus, finger down),
 * while it is off screen, or when paused with the button, and it never moves
 * by itself for people who asked their device to reduce motion.
 * Swipe sideways on a phone; use the arrows or arrow keys on a computer.
 */

const DWELL_MS = 5500;
const SWIPE_PX = 45;

const subscribeReducedMotion = (callback: () => void) => {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const getReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function HeroCarousel({ banners }: { banners: HomeBanner[] }) {
  const count = banners.length;
  const regionId = useId();
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const viewport = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number; swiped: boolean } | null>(
    null,
  );

  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false,
  );
  const paused =
    userPaused || hovering || focused || touching || !onScreen || reduced;

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  // Stop moving while the banner is scrolled out of view.
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    gesture.current = { x: e.clientX, y: e.clientY, swiped: false };
    if (e.pointerType !== "mouse") setTouching(true);
  }
  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const g = gesture.current;
    setTouching(false);
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.2) {
      g.swiped = true;
      go(dx < 0 ? 1 : -1);
      // Keep the flag until the click that follows the release is swallowed.
      window.setTimeout(() => {
        if (gesture.current === g) gesture.current = null;
      }, 0);
    } else {
      gesture.current = null;
    }
  }
  function onPointerCancel() {
    gesture.current = null;
    setTouching(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  }

  const current = banners[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Kampanyalar"
      id={regionId}
      onKeyDown={onKeyDown}
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) setFocused(true);
      }}
      onBlur={() => setFocused(false)}
    >
      <div
        ref={viewport}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHovering(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClickCapture={(e) => {
          if (gesture.current?.swiped) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="bg-mint relative isolate aspect-[16/11] touch-pan-y overflow-hidden rounded-[1.75rem] max-[359px]:aspect-[5/4] sm:aspect-[2/1] sm:rounded-[2.25rem] lg:aspect-auto lg:h-[23rem]"
      >
        {banners.map((b, i) => {
          const active = i === index;
          // Only the slide on screen and its two neighbours load a photo.
          const near =
            i === index ||
            i === (index + 1) % count ||
            (index + count - 1) % count === i;
          return (
            <div
              key={b.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
              aria-hidden={!active}
              className={`absolute inset-0 transition-[opacity,visibility] duration-[900ms] ease-in-out ${
                active ? "visible z-10 opacity-100" : "invisible opacity-0"
              }`}
            >
              {/* Photo: settles with a very slow zoom-out while its slide is shown. */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className={`absolute inset-0 transition-transform duration-[7000ms] ease-out ${
                    active ? "scale-100" : "scale-[1.08]"
                  }`}
                >
                  {near && (
                    <Image
                      src={b.image}
                      alt={b.alt}
                      fill
                      sizes="(min-width: 1200px) 1120px, 100vw"
                      draggable={false}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="object-cover object-[80%_35%] select-none sm:object-[50%_18%]"
                    />
                  )}
                </div>
              </div>

              {/* Dark veil so white text is always readable: from the bottom on a
                  phone, from the left on a wider screen. */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent sm:bg-gradient-to-r sm:from-black/70 sm:via-black/30 sm:to-transparent"
                aria-hidden="true"
              />

              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-5 text-left text-white sm:inset-y-0 sm:right-auto sm:w-[58%] sm:justify-center sm:p-10 lg:w-1/2 lg:p-12 xl:p-14">
                <div
                  className={`flex flex-col items-start transition-[opacity,transform] duration-[800ms] ease-out ${
                    active
                      ? "translate-y-0 opacity-100 delay-300"
                      : "translate-y-3 opacity-0"
                  }`}
                >
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold tracking-wide uppercase sm:text-xs">
                    {b.kicker}
                  </span>
                  <h3 className="mt-3 text-[1.7rem] leading-[1.05] font-semibold tracking-[-0.03em] text-balance max-[359px]:text-[1.45rem] sm:text-4xl lg:text-5xl xl:text-6xl">
                    {b.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 max-w-md text-sm text-pretty text-white/90 max-[359px]:hidden sm:mt-4 sm:text-lg">
                    {b.text}
                  </p>
                  <span className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black sm:mt-6">
                    {b.cta}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </div>
              </div>

              {/* The whole slide is one big link. */}
              <Link
                href={b.href}
                tabIndex={active ? 0 : -1}
                draggable={false}
                className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-offset-[-6px]"
              >
                <span className="sr-only">
                  {b.title}. {b.cta}
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Pill: arrows (wide screens), progress dots, pause button. */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Önceki kampanya"
          aria-controls={regionId}
          className="bg-ink/8 hover:bg-ink/12 hidden size-11 items-center justify-center rounded-full transition-colors active:scale-95 sm:inline-flex"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>

        <div
          className="bg-ink/8 flex h-11 items-center gap-2 rounded-full px-4"
          aria-hidden="true"
        >
          {banners.map((b, i) =>
            i === index ? (
              <span
                key={b.id}
                className="bg-ink/25 relative block h-1.5 w-7 overflow-hidden rounded-full"
              >
                <span
                  key={`${b.id}-${index}`}
                  onAnimationEnd={() => go(1)}
                  style={{
                    animationDuration: `${DWELL_MS}ms`,
                    animationPlayState: paused ? "paused" : "running",
                  }}
                  className={`bg-ink absolute inset-0 block origin-left rounded-full ${
                    reduced ? "" : "animate-banner-progress"
                  }`}
                />
              </span>
            ) : (
              <span
                key={b.id}
                className="bg-ink/40 block size-1.5 rounded-full"
              />
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={userPaused ? "Kampanyaları oynat" : "Kampanyaları durdur"}
          aria-pressed={userPaused}
          className="bg-ink/8 hover:bg-ink/12 inline-flex size-11 items-center justify-center rounded-full transition-colors active:scale-95"
        >
          {userPaused ? (
            <Play className="size-[18px]" aria-hidden="true" />
          ) : (
            <Pause className="size-[18px]" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Sonraki kampanya"
          aria-controls={regionId}
          className="bg-ink/8 hover:bg-ink/12 hidden size-11 items-center justify-center rounded-full transition-colors active:scale-95 sm:inline-flex"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* Which slide is showing, for screen readers (only while paused/manual). */}
      <p role="status" aria-live="polite" className="sr-only">
        {paused ? `${index + 1} / ${count}: ${current.title}` : ""}
      </p>
    </section>
  );
}
