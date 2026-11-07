import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Arama" };

// Placeholder: real search arrives in Phase 1.
export default function SearchPlaceholderPage() {
  return (
    <section className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Arama yakında</h1>
      <p className="text-muted mt-3">
        Ürün arama bir sonraki aşamada (Faz 1) açılacak.
      </p>
      <Link
        href="/"
        className="bg-accent text-on-accent mt-8 inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold"
      >
        Ana sayfaya dön
      </Link>
    </section>
  );
}
