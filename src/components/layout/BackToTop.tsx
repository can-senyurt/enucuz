"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Show the button only after the user has scrolled about one screen. */
const SHOW_AFTER = 600;
/** If scrolling stops for this long (past the threshold), the button appears. */
const IDLE_MS = 650;
const RING_LENGTH = 2 * Math.PI * 20; // radius 20 in a 44px box

/**
 * Small round "back to top" button.
 *  - Quiet: hidden near the top and while the user keeps scrolling down;
 *    it appears when they scroll up, stop for a moment, or reach the bottom.
 *  - A thin ring around it shows how far down the page they are.
 *  - Scrolls up with a smooth ease (instantly when the user prefers reduced motion).
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const ringRef = useRef<SVGCircleElement>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    let idleTimer = 0;

    function progress() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      ringRef.current?.style.setProperty(
        "stroke-dashoffset",
        String(RING_LENGTH * (1 - ratio)),
      );
      return { ratio, max };
    }

    function update() {
      frame = 0;
      const y = window.scrollY;
      const { max } = progress();
      const delta = y - lastY;
      lastY = y;

      if (y < SHOW_AFTER) {
        setVisible(false);
      } else if (delta < -4 || (max > 0 && y >= max - 24)) {
        setVisible(true); // scrolling up, or at the very bottom
      } else if (delta > 4) {
        setVisible(false); // browsing downwards: stay out of the way
      }

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        if (window.scrollY >= SHOW_AFTER) setVisible(true);
      }, IDLE_MS);
    }

    function onScroll() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    progress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(idleTimer);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  function scrollToTop() {
    cancelRef.current?.();
    const start = window.scrollY;
    if (start <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, 0);
      return;
    }

    // Own animation so the length feels right on short and very long pages.
    const duration = Math.min(950, Math.max(450, Math.sqrt(start) * 20));
    const t0 = performance.now();
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    let stopped = false;
    const events = ["wheel", "touchstart", "keydown", "mousedown"] as const;
    const stop = () => {
      stopped = true;
      events.forEach((ev) => window.removeEventListener(ev, stop));
    };
    cancelRef.current = stop;
    // Any touch, wheel or key press by the user takes control back immediately.
    events.forEach((ev) =>
      window.addEventListener(ev, stop, { passive: true, once: true }),
    );

    function step(now: number) {
      if (stopped) return;
      const p = Math.min(1, (now - t0) / duration);
      window.scrollTo(0, start * (1 - ease(p)));
      if (p < 1) window.requestAnimationFrame(step);
      else stop();
    }
    window.requestAnimationFrame(step);
  }

  return (
    <button
      type="button"
      data-back-to-top
      onClick={scrollToTop}
      aria-label="Sayfanın başına dön"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`back-to-top border-line bg-surface text-ink hover:bg-bg fixed right-[max(1rem,env(safe-area-inset-right))] z-40 inline-flex size-11 items-center justify-center rounded-full border shadow-[0_6px_22px_-8px_rgb(0_0_0/0.28)] transition-[opacity,transform,visibility,bottom,background-color] duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-90 ${
        visible
          ? "visible translate-y-0 scale-100 opacity-100"
          : "pointer-events-none invisible translate-y-3 scale-90 opacity-0"
      }`}
    >
      <svg
        viewBox="0 0 44 44"
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="var(--line)"
          strokeWidth="2"
        />
        <circle
          ref={ringRef}
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH}
          style={{ transition: "stroke-dashoffset 120ms linear" }}
        />
      </svg>
      <ArrowUp
        className="relative size-[17px]"
        strokeWidth={2.4}
        aria-hidden="true"
      />
    </button>
  );
}
