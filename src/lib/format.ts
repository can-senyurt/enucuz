import { siteConfig } from "@/lib/config";

/**
 * Formats a price given in kuruş as Turkish lira: 129990 -> "1.299,90 ₺".
 * Whole-lira amounts drop the decimals: 129900 -> "1.299 ₺".
 * All price formatting in the app goes through this function.
 */
export function formatPrice(kurus: number): string {
  const isWhole = kurus % 100 === 0;
  const formatted = new Intl.NumberFormat(siteConfig.locale, {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(kurus / 100);
  // Non-breaking space so the amount and "₺" never wrap onto two lines.
  return `${formatted}\u00A0₺`;
}

/** 0.2534 -> "%25" */
export function formatPercent(ratio: number): string {
  return `%${Math.round(ratio * 100)}`;
}

/** Minutes ago -> "12 dk önce", "3 saat önce", "2 gün önce". */
export function formatMinutesAgo(minutes: number): string {
  if (minutes < 1) return "az önce";
  if (minutes < 60) return `${Math.round(minutes)} dk önce`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  return `${Math.round(hours / 24)} gün önce`;
}

/** "2026-11-07" -> "7 Kas" */
export function formatShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  // Built from explicit parts at UTC noon so the day never shifts by timezone.
  return new Intl.DateTimeFormat(siteConfig.locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}
