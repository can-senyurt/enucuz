"use client";

import { Moon, Sun } from "lucide-react";

/**
 * Switches between light and dark. The icons are swapped with CSS (dark:)
 * so no React state is needed and there is no hydration flicker.
 */
export function ThemeToggle() {
  function toggle() {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked (private mode); the toggle still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Koyu / açık temayı değiştir"
      className="text-ink hover:bg-ink/5 inline-flex size-11 items-center justify-center rounded-full transition-colors"
    >
      <Moon className="size-5 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-5 dark:block" aria-hidden="true" />
    </button>
  );
}
