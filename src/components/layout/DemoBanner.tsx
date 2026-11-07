import { isDemoData } from "@/lib/config";

/** CLAUDE.md section 9: demo data must never look like real prices. */
export function DemoBanner() {
  if (!isDemoData) return null;
  return (
    <div
      role="status"
      className="bg-ink text-bg px-4 py-1.5 text-center text-xs font-medium"
    >
      Demo veriler gösteriliyor · Fiyatlar ve mağazalar kurgusaldır
    </div>
  );
}
