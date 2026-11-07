import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <EmptyState
        title="Sayfa bulunamadı"
        text="Aradığın sayfa taşınmış ya da hiç var olmamış olabilir."
        actionHref="/"
        actionLabel="Ana sayfaya dön"
      />
    </div>
  );
}
