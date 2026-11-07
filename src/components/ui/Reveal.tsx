"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Content gently slides up as it scrolls into view.
 * Renders visible on the server (so nothing is hidden without JavaScript) and
 * only hides elements that start below the fold. Respects reduced motion.
 * `delay` (ms) staggers neighbouring items.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    // Hiding the element after mount only affects content below the fold.
    setHidden(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHidden(false);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: hidden ? "0ms" : `${delay}ms` }}
      className={`transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        hidden ? "translate-y-8 opacity-0" : "translate-y-0 opacity-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}
