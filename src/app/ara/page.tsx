import type { Metadata } from "next";
import { Suspense } from "react";
import {
  ListingSkeleton,
  ProductListing,
} from "@/components/search/ProductListing";

export const metadata: Metadata = { title: "Arama" };

export default function SearchPage({ searchParams }: PageProps<"/ara">) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="sr-only">Arama sonuçları</h1>
      {/* searchParams is request-time data, so it is read inside Suspense. */}
      <Suspense fallback={<ListingSkeleton />}>
        <ProductListing
          basePath="/ara"
          searchParams={searchParams}
          showSearchBar
        />
      </Suspense>
    </section>
  );
}
