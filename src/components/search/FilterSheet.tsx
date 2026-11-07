"use client";

import { useRef, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";

/**
 * Mobile filter panel that slides up from the bottom (native <dialog>, so
 * focus trapping, Escape and the backdrop come for free).
 */
export function FilterSheet({
  children,
  activeCount,
}: {
  children: ReactNode;
  activeCount: number;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="border-line bg-surface inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filtrele
        {activeCount > 0 && (
          <span className="bg-accent text-on-accent price inline-flex size-5 items-center justify-center rounded-full text-xs font-bold">
            {activeCount}
          </span>
        )}
      </button>

      <dialog
        ref={ref}
        aria-label="Filtreler"
        onClick={(e) => {
          // Clicking the dimmed backdrop (the dialog element itself) closes it.
          if (e.target === ref.current) ref.current?.close();
        }}
        onSubmit={() => ref.current?.close()}
        className="bg-bg text-ink fixed inset-x-0 top-auto bottom-0 m-0 max-h-[88dvh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-[2rem] p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="bg-bg/90 border-line sticky top-0 z-10 flex items-center justify-between border-b px-5 py-3 backdrop-blur">
          <h2 className="text-lg font-semibold tracking-tight">Filtreler</h2>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Filtreleri kapat"
            className="hover:bg-ink/5 inline-flex size-11 items-center justify-center rounded-full"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 pt-4">{children}</div>
      </dialog>
    </>
  );
}
