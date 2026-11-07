import type { DealLabel, DealScoreResult } from "@/types";

/**
 * Deal score (0–100). Pure function, no I/O, so it is easy to unit test.
 * Spec: CLAUDE.md section 6.
 *
 * All prices are integers in kuruş.
 */

export const MIN_HISTORY_DAYS = 14;
export const INFLATED_SCORE_CAP = 30;
/** A rise bigger than this shortly before a "discount" counts as inflation. */
export const INFLATION_RISE = 0.15;
/** How far back we look for a suspicious price rise. */
export const INFLATION_WINDOW_DAYS = 21;
/**
 * A price within 1% of the 90-day (or 30-day) low counts as "at the low", so
 * day-to-day price jitter does not hide a genuine record-low price.
 */
export const LOW_TOLERANCE = 0.01;
/** Real drop at which the base score reaches 80 (before bonuses). */
const FULL_DROP = 0.35;

export interface DealScoreInput {
  /** Lowest current price across stores. */
  current: number;
  /** Daily lowest prices, oldest first, newest last (up to the last 90 days). */
  history: number[];
  /** The crossed-out price a store shows, if any. */
  listPrice?: number | null;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Inflated discount detection:
 *  1. the store's list price was never actually charged in the last 90 days, or
 *  2. the price was raised by more than 15% shortly before the "discount".
 */
export function detectInflation(input: DealScoreInput): boolean {
  const { current, history, listPrice } = input;
  const window = history.slice(-90);

  // 1) Fake list price: shown as the "old" price but never seen in the history.
  if (listPrice != null && listPrice > current) {
    const chargedAtListPrice = window.some((p) => p >= listPrice * 0.97);
    if (!chargedAtListPrice) return true;
  }

  // 2) Price hiked >15% in the recent window, then "discounted" from the peak.
  const recent = window.slice(-INFLATION_WINDOW_DAYS);
  const earlier = window.slice(0, window.length - INFLATION_WINDOW_DAYS);
  if (recent.length > 0 && earlier.length >= 7) {
    const baseline = median(earlier);
    const peak = Math.max(...recent);
    if (peak >= baseline * (1 + INFLATION_RISE) && current < peak) {
      return true;
    }
  }
  return false;
}

export function labelFor(score: number | null, isInflated: boolean): DealLabel {
  if (score === null) return "insufficient";
  if (isInflated) return "inflated";
  if (score >= 75) return "real-deal";
  if (score >= 40) return "good";
  return "normal";
}

export function calculateDealScore(input: DealScoreInput): DealScoreResult {
  const { current, history } = input;
  const window = history.slice(-90);
  const historyDays = window.length;

  if (historyDays < MIN_HISTORY_DAYS) {
    return {
      label: "insufficient",
      score: null,
      isInflated: false,
      isLowest90: false,
      current,
      median90: null,
      min30: null,
      min90: null,
      realDrop: 0,
      historyDays,
    };
  }

  const median90 = median(window);
  const min30 = Math.min(...window.slice(-30), current);
  const min90 = Math.min(...window, current);
  const realDrop = clamp((median90 - current) / median90, 0, 1);

  // Lowest in 90 days: no earlier day was cheaper AND the price really is below
  // its usual level, so a price that never moved does not count as a record low.
  const earlierMin = Math.min(...window.slice(0, -1));
  const isLowest90 =
    window.length > 1 &&
    current <= earlierMin * (1 + LOW_TOLERANCE) &&
    current < median90;

  const isInflated = detectInflation(input);

  let score = Math.round((realDrop / FULL_DROP) * 80);
  if (isLowest90 && realDrop > 0) score += 15;
  else if (current <= min30 * (1 + LOW_TOLERANCE) && realDrop > 0) score += 5;
  score = clamp(score, 0, 100);
  if (isInflated) score = Math.min(score, INFLATED_SCORE_CAP);

  return {
    label: labelFor(score, isInflated),
    score,
    isInflated,
    isLowest90,
    current,
    median90,
    min30,
    min90,
    realDrop,
    historyDays,
  };
}

export const dealLabelText: Record<DealLabel, string> = {
  "real-deal": "Gerçek Fırsat",
  good: "İyi Fiyat",
  normal: "Normal",
  inflated: "Dikkat: İndirim şişirilmiş olabilir",
  insufficient: "Yeterli veri yok",
};
