"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Info, TriangleAlert } from "lucide-react";
import { formatMinutesAgo, formatPrice } from "@/lib/format";
import { buildSmartLabels } from "@/lib/smart-labels";
import { dealLabelText } from "@/lib/deal-score";
import type { ProductDetail } from "@/types";
import { DealRing } from "@/components/ui/DealRing";
import { ProductImage } from "@/components/ui/ProductImage";

const TONE_STYLE = {
  good: "bg-deal/12 text-deal-text",
  warn: "bg-warn/20 text-warn-text",
  info: "bg-ink/6 text-muted",
} as const;

/**
 * Interactive top of the product page: colour + size pickers drive the
 * illustration and the store price table.
 */
const storeNotice = (store: string) =>
  `${store} bağlantısı demo modunda kapalı. Gerçek veriyle bu düğme seni mağazanın ürün sayfasına götürecek.`;

export function ProductHero({ product }: { product: ProductDetail }) {
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [barVisible, setBarVisible] = useState(false);
  const offersRef = useRef<HTMLElement>(null);

  // The toast disappears by itself after a few seconds.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Lets the back-to-top button step above the buy bar while the bar is showing.
  useEffect(() => {
    document.body.dataset.buyBar = barVisible ? "on" : "off";
    return () => {
      delete document.body.dataset.buyBar;
    };
  }, [barVisible]);

  // Mobile buy bar: shown while the offers list is out of view.
  useEffect(() => {
    const el = offersRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setBarVisible(!entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const labels = useMemo(
    () => buildSmartLabels(product.deal, product.drop7d),
    [product.deal, product.drop7d],
  );

  const rows = useMemo(() => {
    const withAvailability = product.offers.map((o) => ({
      offer: o,
      available: o.inStock && (size === null || o.sizes.includes(size)),
      reason: !o.inStock ? "Stokta yok" : "Bu bedende yok",
    }));
    const cheapest = withAvailability
      .filter((r) => r.available)
      .reduce<string | null>((best, r) => {
        const current = withAvailability.find((x) => x.offer.id === best);
        return !current || r.offer.price < current.offer.price
          ? r.offer.id
          : best;
      }, null);
    return withAvailability.map((r) => ({
      ...r,
      isCheapest: r.offer.id === cheapest,
    }));
  }, [product.offers, size]);

  // A size is selectable if at least one in-stock offer carries it.
  const sizeAvailable = (s: string) =>
    product.offers.some((o) => o.inStock && o.sizes.includes(s));

  const best = rows.find((r) => r.isCheapest);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Image */}
      <div className="bg-surface border-line relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border lg:max-w-none">
        <div className="animate-float h-full w-full">
          <ProductImage
            kind={product.imageKind}
            color={color}
            alt={`${product.title}, ${color}`}
          />
        </div>
        <span className="bg-ink/70 text-bg absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-medium backdrop-blur">
          Örnek çizim · {color}
        </span>
      </div>

      {/* Details */}
      <div>
        <p className="text-muted text-sm font-medium">{product.brand}</p>
        <h1 className="mt-1 text-4xl leading-[1.05] font-semibold tracking-tighter text-balance sm:text-5xl">
          {product.title}
        </h1>

        <div className="mt-5 flex items-center gap-4">
          <DealRing deal={product.deal} size={88} />
          <div>
            <p className="text-sm font-semibold">
              {dealLabelText[product.deal.label]}
            </p>
            <p className="text-muted mt-0.5 text-sm text-pretty">
              {product.deal.score === null
                ? "Skor için en az 14 günlük fiyat geçmişi gerekir."
                : "İndirim Skoru, fiyatın son 90 gündeki gerçek durumunu gösterir."}
            </p>
          </div>
        </div>

        {labels.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2">
            {labels.map((l) => (
              <li
                key={l.text}
                className={`inline-flex items-start gap-1.5 rounded-2xl px-3 py-2 text-sm font-medium ${TONE_STYLE[l.tone]}`}
              >
                {l.tone === "good" ? (
                  <Check
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                ) : l.tone === "warn" ? (
                  <TriangleAlert
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                )}
                <span>{l.text}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Colour */}
        <fieldset className="mt-7">
          <legend className="text-sm font-semibold">
            Renk: <span className="text-muted font-normal">{color}</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <label key={c} className="cursor-pointer">
                <input
                  type="radio"
                  name="renk"
                  value={c}
                  checked={color === c}
                  onChange={() => setColor(c)}
                  className="peer sr-only"
                />
                <span className="border-line bg-surface peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bg peer-focus-visible:outline-accent inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                  {c}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Size */}
        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">
            Beden:{" "}
            <span className="text-muted font-normal">
              {size ?? "Seçilmedi"}
            </span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const ok = sizeAvailable(s);
              return (
                <label
                  key={s}
                  className={ok ? "cursor-pointer" : "cursor-not-allowed"}
                >
                  <input
                    type="radio"
                    name="beden"
                    value={s}
                    checked={size === s}
                    disabled={!ok}
                    onChange={() => setSize(s)}
                    className="peer sr-only"
                  />
                  <span className="border-line bg-surface peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bg peer-focus-visible:outline-accent peer-disabled:text-muted inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-medium peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-disabled:line-through peer-disabled:opacity-50">
                    {s}
                  </span>
                </label>
              );
            })}
          </div>
          {size !== null && product.sizes.length > 1 && (
            <button
              type="button"
              onClick={() => setSize(null)}
              className="text-muted mt-2 min-h-11 text-sm underline underline-offset-4"
            >
              Beden seçimini temizle
            </button>
          )}
        </fieldset>

        {/* Offers */}
        <section ref={offersRef} aria-labelledby="magazalar" className="mt-8">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="magazalar" className="text-xl font-semibold tracking-tight">
              Mağazalarda fiyat
            </h2>
            <p className="text-muted text-sm">{product.offers.length} mağaza</p>
          </div>

          <ul className="mt-3 space-y-3">
            {rows.map(({ offer, available, isCheapest, reason }) => (
              <li
                key={offer.id}
                className={`rounded-3xl border p-4 ${
                  isCheapest
                    ? "border-deal bg-deal/8"
                    : "border-line bg-surface"
                } ${available ? "" : "opacity-60"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-ink/8 rounded-full px-2.5 py-1 text-xs font-bold tracking-tight">
                        {offer.store.logoText}
                      </span>
                      {isCheapest && (
                        <span className="bg-deal text-on-accent rounded-full px-2.5 py-1 text-xs font-bold">
                          En ucuz
                        </span>
                      )}
                    </div>
                    <p className="text-muted mt-2 text-xs">
                      {offer.store.name} ·{" "}
                      {formatMinutesAgo(offer.updatedMinutesAgo)} güncellendi
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="price text-xl font-semibold tracking-tight">
                      {formatPrice(offer.price)}
                    </p>
                    {offer.listPrice !== null &&
                      offer.listPrice > offer.price && (
                        <p className="price text-muted text-xs line-through">
                          <span className="sr-only">Eski fiyat: </span>
                          {formatPrice(offer.listPrice)}
                        </p>
                      )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-sm">
                    {available ? (
                      <span className="text-deal-text font-medium">
                        {size ? `${size} bedeni stokta` : "Stokta"}
                      </span>
                    ) : (
                      <span className="text-muted font-medium">{reason}</span>
                    )}
                  </p>
                  <button
                    type="button"
                    disabled={!available}
                    onClick={() => setNotice(storeNotice(offer.store.name))}
                    className={`inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${
                      isCheapest
                        ? "bg-accent text-on-accent hover:opacity-90"
                        : "border-ink/20 hover:bg-ink/5 border bg-transparent"
                    }`}
                  >
                    Mağazaya Git
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {best === undefined && (
            <p className="text-warn-text mt-2 text-sm font-medium">
              Seçtiğin bedende şu an stokta mağaza yok. Başka bir beden dene.
            </p>
          )}
        </section>
      </div>

      {/* Toast (announced to screen readers) */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-50 flex justify-center lg:bottom-8"
      >
        {notice && (
          <p className="animate-toast-in bg-ink text-bg pointer-events-auto max-w-sm rounded-2xl px-4 py-3 text-sm shadow-2xl">
            {notice}
          </p>
        )}
      </div>

      {/* Mobile buy bar: best available price + one tap to the store */}
      {best && (
        <div
          aria-hidden={!barVisible}
          className={`border-line bg-bg/85 fixed inset-x-0 bottom-0 z-40 border-t px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
            barVisible ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-muted text-xs">
                En ucuz · {best.offer.store.name}
              </p>
              <p className="price text-xl leading-tight font-semibold tracking-tight whitespace-nowrap">
                {formatPrice(best.offer.price)}
              </p>
            </div>
            <button
              type="button"
              tabIndex={barVisible ? 0 : -1}
              onClick={() => setNotice(storeNotice(best.offer.store.name))}
              className="bg-accent text-on-accent h-12 shrink-0 rounded-full px-6 text-sm font-semibold transition-transform active:scale-95"
            >
              Mağazaya Git
            </button>
          </div>
        </div>
      )}

      {/* Keeps the last content clear of the buy bar on phones */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
    </div>
  );
}
