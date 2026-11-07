import { describe, expect, it } from "vitest";
import {
  buildListingHref,
  parseListingState,
  toSearchParams,
} from "@/lib/search/params";
import { buildSmartLabels } from "@/lib/smart-labels";
import { calculateDealScore } from "@/lib/deal-score";

describe("parseListingState", () => {
  it("uses safe defaults for an empty URL", () => {
    const s = parseListingState({});
    expect(s).toMatchObject({
      q: "",
      sirala: "oneri",
      sayfa: 1,
      firsat: false,
    });
    expect(s.marka).toEqual([]);
  });

  it("rejects invalid values instead of trusting them", () => {
    const s = parseListingState({
      sirala: "hack",
      sayfa: "-5",
      min: "abc",
      max: "1e99",
    });
    expect(s.sirala).toBe("oneri");
    expect(s.sayfa).toBe(1);
    expect(s.min).toBeUndefined();
    expect(s.max).toBeUndefined();
  });

  it("accepts single and repeated values", () => {
    const s = parseListingState({ marka: ["nordika", "ayaz"], renk: "siyah" });
    expect(s.marka).toEqual(["nordika", "ayaz"]);
    expect(s.renk).toEqual(["siyah"]);
  });

  it("converts liras to kuruş", () => {
    const sp = toSearchParams(parseListingState({ min: "100", max: "2500" }));
    expect(sp.minPrice).toBe(10000);
    expect(sp.maxPrice).toBe(250000);
  });
});

describe("buildListingHref", () => {
  it("round-trips state and resets the page when a filter changes", () => {
    const state = parseListingState({
      q: "ceket",
      marka: "nordika",
      sayfa: "3",
    });
    expect(buildListingHref("/ara", state, { firsat: true })).toBe(
      "/ara?q=ceket&marka=nordika&firsat=1",
    );
  });

  it("omits defaults and returns the bare path when empty", () => {
    expect(buildListingHref("/ara", parseListingState({}))).toBe("/ara");
  });
});

const flat = (p: number, n: number) => Array<number>(n).fill(p);

describe("buildSmartLabels", () => {
  it("shows the record-low label for a real deal", () => {
    const deal = calculateDealScore({
      current: 65000,
      history: [...flat(100000, 80), ...flat(65000, 10)],
      listPrice: 100000,
    });
    const labels = buildSmartLabels(deal, 12).map((l) => l.text);
    expect(labels).toContain("Bu fiyat son 90 günün en düşüğü");
    expect(labels).toContain("Fiyat son 7 günde %12 düştü");
  });

  it("warns on inflated discounts", () => {
    const deal = calculateDealScore({
      current: 72000,
      history: flat(72000, 90),
      listPrice: 120000,
    });
    expect(buildSmartLabels(deal, 0).some((l) => l.tone === "warn")).toBe(true);
  });

  it("explains missing data", () => {
    const deal = calculateDealScore({ current: 5000, history: flat(5000, 5) });
    expect(buildSmartLabels(deal, 0)[0].text).toMatch(/yeterli fiyat geçmişi/);
  });
});
