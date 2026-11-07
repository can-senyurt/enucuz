import { formatPercent } from "@/lib/format";
import type { DealScoreResult } from "@/types";

export type SmartLabelTone = "good" | "warn" | "info";
export interface SmartLabel {
  tone: SmartLabelTone;
  text: string;
}

/**
 * Plain-language labels shown on the product page, derived from the deal
 * score result and the 7-day drop. Pure function, easy to test.
 */
export function buildSmartLabels(
  deal: DealScoreResult,
  drop7d: number,
): SmartLabel[] {
  const labels: SmartLabel[] = [];

  if (deal.label === "insufficient") {
    labels.push({
      tone: "info",
      text: "Henüz yeterli fiyat geçmişi yok (en az 14 gün gerekir)",
    });
    return labels;
  }

  if (deal.isInflated) {
    labels.push({
      tone: "warn",
      text: "Mağazanın gösterdiği eski fiyat son 90 günde gerçekten uygulanmamış olabilir",
    });
  }

  if (deal.isLowest90) {
    labels.push({ tone: "good", text: "Bu fiyat son 90 günün en düşüğü" });
  } else if (deal.min30 !== null && deal.current <= deal.min30 * 1.01) {
    labels.push({ tone: "good", text: "Bu fiyat son 30 günün en düşüğü" });
  }

  if (drop7d > 0) {
    labels.push({ tone: "good", text: `Fiyat son 7 günde %${drop7d} düştü` });
  }

  if (deal.realDrop >= 0.05) {
    labels.push({
      tone: deal.isInflated ? "info" : "good",
      text: `90 günlük medyan fiyatın ${formatPercent(deal.realDrop)} altında`,
    });
  } else if (deal.median90 !== null && deal.current > deal.median90 * 1.05) {
    const above = (deal.current - deal.median90) / deal.median90;
    labels.push({
      tone: "info",
      text: `Fiyat 90 günlük medyanın ${formatPercent(above)} üzerinde`,
    });
  } else if (!deal.isInflated) {
    labels.push({ tone: "info", text: "Fiyat son 90 günün ortalamasında" });
  }

  return labels;
}
