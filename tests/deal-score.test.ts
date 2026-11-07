import { describe, expect, it } from "vitest";
import { calculateDealScore, detectInflation, median } from "@/lib/deal-score";

/** n days at a flat price. */
const flat = (price: number, n: number) => Array<number>(n).fill(price);

describe("median", () => {
  it("handles odd and even lengths", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(3); // rounds 2.5 up to a whole kuruş
    expect(median([])).toBe(0);
  });
});

describe("calculateDealScore", () => {
  it("returns 'insufficient' when there are fewer than 14 days of history", () => {
    const r = calculateDealScore({ current: 5000, history: flat(10000, 13) });
    expect(r.label).toBe("insufficient");
    expect(r.score).toBeNull();
    expect(r.historyDays).toBe(13);
  });

  it("scores a genuine, record-low drop as a real deal (75+)", () => {
    const history = [...flat(100000, 80), ...flat(65000, 10)];
    const r = calculateDealScore({
      current: 65000,
      history,
      listPrice: 100000,
    });
    expect(r.isInflated).toBe(false);
    expect(r.isLowest90).toBe(true);
    expect(r.score).toBeGreaterThanOrEqual(75);
    expect(r.label).toBe("real-deal");
  });

  it("scores a flat price as normal with no drop", () => {
    const r = calculateDealScore({
      current: 100000,
      history: flat(100000, 90),
    });
    expect(r.realDrop).toBe(0);
    expect(r.score).toBe(0);
    expect(r.label).toBe("normal");
  });

  it("does not treat a flat price as a 90-day record low", () => {
    const r = calculateDealScore({
      current: 100000,
      history: flat(100000, 90),
    });
    expect(r.isLowest90).toBe(false);
  });

  it("gives a mid score for a moderate drop", () => {
    const history = [...flat(100000, 60), ...flat(85000, 30)];
    const r = calculateDealScore({ current: 85000, history });
    expect(r.score).toBeGreaterThanOrEqual(40);
    expect(r.score).toBeLessThan(75);
    expect(r.label).toBe("good");
  });

  it("caps the score at 30 when the discount is inflated", () => {
    // Price jumps 40% ten days ago, then the store "discounts" back to normal.
    const history = [
      ...flat(100000, 70),
      ...flat(140000, 10),
      ...flat(100000, 10),
    ];
    const r = calculateDealScore({
      current: 100000,
      history,
      listPrice: 140000,
    });
    expect(r.isInflated).toBe(true);
    expect(r.score).not.toBeNull();
    expect(r.score as number).toBeLessThanOrEqual(30);
    expect(r.label).toBe("inflated");
  });

  it("never exceeds 100 and is never negative", () => {
    const high = calculateDealScore({
      current: 1000,
      history: [...flat(100000, 80), ...flat(1000, 10)],
    });
    expect(high.score).toBeLessThanOrEqual(100);
    const low = calculateDealScore({
      current: 200000,
      history: flat(100000, 90),
    });
    expect(low.score).toBeGreaterThanOrEqual(0);
    expect(low.realDrop).toBe(0); // price above median is not a drop
  });

  it("reports min30, min90 and median90", () => {
    const history = [...flat(120000, 60), ...flat(100000, 30)];
    const r = calculateDealScore({ current: 100000, history });
    expect(r.min30).toBe(100000);
    expect(r.min90).toBe(100000);
    expect(r.median90).toBe(120000);
  });
});

describe("detectInflation", () => {
  it("flags a list price that was never charged in the last 90 days", () => {
    expect(
      detectInflation({
        current: 70000,
        history: flat(72000, 90),
        listPrice: 120000,
      }),
    ).toBe(true);
  });

  it("does not flag a list price that was really charged earlier", () => {
    const history = [...flat(120000, 60), ...flat(70000, 30)];
    expect(
      detectInflation({ current: 70000, history, listPrice: 120000 }),
    ).toBe(false);
  });

  it("flags a >15% price rise shortly before the discount", () => {
    const history = [
      ...flat(100000, 69),
      ...flat(125000, 11),
      ...flat(100000, 10),
    ];
    expect(detectInflation({ current: 100000, history })).toBe(true);
  });

  it("ignores small (<=15%) price movements", () => {
    const history = [
      ...flat(100000, 69),
      ...flat(110000, 11),
      ...flat(100000, 10),
    ];
    expect(detectInflation({ current: 100000, history })).toBe(false);
  });
});

describe("price jitter tolerance", () => {
  it("counts a price within 1% of the 90-day low as a record low", () => {
    // Earlier days were 0.5% cheaper than today (jitter), but today is at the low.
    const history = [
      ...flat(100000, 70),
      ...flat(64680, 10),
      ...flat(65000, 10),
    ];
    const r = calculateDealScore({ current: 65000, history });
    expect(r.isLowest90).toBe(true);
  });

  it("does not count a price 5% above the low as a record low", () => {
    const history = [
      ...flat(100000, 70),
      ...flat(62000, 5),
      ...flat(65200, 15),
    ];
    const r = calculateDealScore({ current: 65200, history });
    expect(r.isLowest90).toBe(false);
  });
});
