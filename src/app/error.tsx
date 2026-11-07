"use client";

import { TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <EmptyState
        title="Bir şeyler ters gitti"
        text="Sayfa yüklenirken beklenmedik bir hata oluştu. Tekrar denemek genelde işe yarar."
        icon={<TriangleAlert className="size-6" aria-hidden="true" />}
      />
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={reset}
          className="bg-accent text-on-accent h-11 rounded-full px-6 text-sm font-semibold"
        >
          Tekrar dene
        </button>
      </div>
    </div>
  );
}
