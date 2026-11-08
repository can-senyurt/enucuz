"use client";

import { useEffect, useState } from "react";
import { Heart, UserRound } from "lucide-react";

/**
 * Favourites and account buttons in the header.
 * Both features arrive with membership (Phase 5), so for now a tap shows a
 * small "coming soon" note under the buttons instead of opening a page.
 */

const actions = [
  {
    key: "favorites",
    label: "Favoriler",
    Icon: Heart,
    notice: "Favoriler çok yakında burada olacak.",
  },
  {
    key: "account",
    label: "Giriş yap",
    Icon: UserRound,
    notice: "Üyelik ve giriş çok yakında burada olacak.",
  },
] as const;

export function HeaderActions() {
  const [notice, setNotice] = useState<string | null>(null);

  // The note disappears by itself after a few seconds.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <div className="relative flex items-center gap-1">
      {actions.map(({ key, label, Icon, notice: text }) => (
        <button
          key={key}
          type="button"
          aria-label={label}
          onClick={() => setNotice(text)}
          className="hover:bg-ink/5 inline-flex size-11 items-center justify-center rounded-full transition-transform duration-200 active:scale-90"
        >
          <Icon className="size-5" aria-hidden="true" />
        </button>
      ))}

      {/* Announced to screen readers; sits under the buttons, inside the header. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none absolute top-full right-0 z-10 mt-2 w-max max-w-[min(16rem,calc(100vw-2rem))]"
      >
        {notice && (
          <p className="animate-toast-in bg-ink text-bg rounded-2xl px-4 py-3 text-sm shadow-2xl">
            {notice}
          </p>
        )}
      </div>
    </div>
  );
}
