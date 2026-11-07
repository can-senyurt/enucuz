import { siteConfig } from "@/lib/config";

export function Footer() {
  return (
    <footer className="border-line text-muted border-t pb-[max(1.5rem,env(safe-area-inset-bottom))] text-sm">
      <div className="mx-auto max-w-6xl px-[max(1rem,env(safe-area-inset-left))] py-8 pr-[max(1rem,env(safe-area-inset-right))]">
        <p className="text-ink font-semibold tracking-tight">
          {siteConfig.name}
        </p>
        <p className="mt-2 max-w-prose">
          Fiyatlar anlık değişebilir. Gösterilen fiyatların güncelliği her
          teklifin yanında belirtilir.
        </p>
        <p className="mt-6">© {siteConfig.name}</p>
      </div>
    </footer>
  );
}
