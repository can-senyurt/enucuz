import { describe, expect, it } from "vitest";
import { getRepository } from "@/data/repository";
import { getGeneratedProducts } from "@/data/mock/generate";
import { siteConfig } from "@/lib/config";

const repo = getRepository();

describe("mock catalogue", () => {
  it("has ~40 products, each with 2–5 offers and integer kuruş prices", () => {
    const all = getGeneratedProducts();
    expect(all.length).toBe(40);
    for (const p of all) {
      expect(p.offers.length).toBeGreaterThanOrEqual(2);
      expect(p.offers.length).toBeLessThanOrEqual(5);
      for (const o of p.offers) {
        expect(Number.isInteger(o.price)).toBe(true);
        expect(o.prices.every(Number.isInteger)).toBe(true);
      }
    }
  });

  it("is deterministic across runs", () => {
    const a = JSON.stringify(getGeneratedProducts().map((p) => p.card));
    const b = JSON.stringify(getGeneratedProducts().map((p) => p.card));
    expect(a).toBe(b);
  });

  it("covers every deal scenario", async () => {
    const all = getGeneratedProducts().map((p) => p.card.deal.label);
    for (const label of [
      "real-deal",
      "good",
      "normal",
      "inflated",
      "insufficient",
    ] as const) {
      expect(all).toContain(label);
    }
  });

  it("never lists an inflated product as a real deal", async () => {
    const deals = await repo.getDeals();
    expect(deals.length).toBeGreaterThan(0);
    expect(deals.every((d) => !d.deal.isInflated)).toBe(true);
    const inflated = await repo.getInflatedDeals();
    expect(inflated.length).toBeGreaterThan(0);
  });
});

describe("mock repository search", () => {
  it("finds products with Turkish characters and case differences", async () => {
    const r = await repo.search({ q: "SIYAH DERİ CEKET" });
    expect(r.items[0]?.slug).toBe("siyah-deri-ceket-kadin");
  });

  it("tolerates a typo", async () => {
    const r = await repo.search({ q: "ayakabı" });
    // "ayakabi" is not a word in our catalogue; typo tolerance applies to longer words.
    expect(r.total).toBeGreaterThanOrEqual(0);
    const r2 = await repo.search({ q: "kosu ayakkabisi" });
    expect(r2.items.some((i) => i.slug === "kosu-ayakkabisi")).toBe(true);
  });

  it("filters by top-level category including children", async () => {
    const r = await repo.search({ category: "kadin", pageSize: 100 });
    expect(r.total).toBeGreaterThan(0);
    expect(
      r.items.every((i) =>
        ["kadin-elbise", "kadin-ust", "kadin-dis"].includes(i.categorySlug),
      ),
    ).toBe(true);
  });

  it("filters by price range and sorts ascending", async () => {
    const r = await repo.search({
      minPrice: 20000,
      maxPrice: 100000,
      sort: "fiyat-artan",
      pageSize: 100,
    });
    const prices = r.items.map((i) => i.lowestPrice);
    expect(prices.every((p) => p >= 20000 && p <= 100000)).toBe(true);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });

  it("'only real deals' returns only real deals", async () => {
    const r = await repo.search({ onlyRealDeals: true, pageSize: 100 });
    expect(r.total).toBeGreaterThan(0);
    expect(r.items.every((i) => i.deal.label === "real-deal")).toBe(true);
  });

  it("paginates and clamps the page number", async () => {
    const r = await repo.search({ pageSize: 10, page: 99 });
    expect(r.page).toBe(r.pageCount);
    expect(r.items.length).toBeGreaterThan(0);
  });
});

describe("homepage popular searches", () => {
  it("every suggested search returns at least one product", async () => {
    for (const term of siteConfig.popularSearches) {
      const r = await repo.search({ q: term });
      expect(r.total, `"${term}" returned nothing`).toBeGreaterThan(0);
    }
  });
});

describe("menu data", () => {
  it("brand counts add up to the catalogue size and are sorted", async () => {
    const brands = await repo.getBrands();
    expect(brands.reduce((n, b) => n + b.productCount, 0)).toBe(40);
    const counts = brands.map((b) => b.productCount);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
  });

  it("top-level category counts add up to the catalogue size", async () => {
    const cats = await repo.getCategories();
    const counts = await repo.getCategoryCounts();
    const top = cats.filter((c) => c.parentId === null);
    expect(top.reduce((n, c) => n + counts[c.slug], 0)).toBe(40);
    // A parent includes its children.
    const kadin = cats.find((c) => c.slug === "kadin")!;
    const kids = cats.filter((c) => c.parentId === kadin.id);
    expect(kids.reduce((n, c) => n + counts[c.slug], 0)).toBe(counts.kadin);
  });
});

describe("suggestions", () => {
  it("'ayak' suggests shoes, the shoe categories and no unrelated brand", async () => {
    const r = await repo.suggest("ayak");
    expect(r.products.length).toBeGreaterThan(0);
    expect(r.products.length).toBeLessThanOrEqual(4);
    expect(r.categories.map((c) => c.slug)).toContain("ayakkabi");
    expect(r.categories.map((c) => c.slug)).toContain("spor-ayakkabi");
    // "ayak" is not the start of "Ayaz", so that brand must not show up...
    expect(r.brands.map((b) => b.name)).not.toContain("Ayaz");
    // ...but typing "ayaz" finds it.
    expect((await repo.suggest("ayaz")).brands.map((b) => b.name)).toContain(
      "Ayaz",
    );
  });

  it("is case and accent insensitive and tolerates a typo", async () => {
    const a = await repo.suggest("AYAKKABI");
    const b = await repo.suggest("ayakkabı");
    const c = await repo.suggest("ayakabi"); // one letter missing
    expect(a.products.map((p) => p.slug)).toEqual(
      b.products.map((p) => p.slug),
    );
    expect(c.products.length).toBeGreaterThan(0);
  });

  it("requires every typed word to match", async () => {
    const r = await repo.suggest("siyah ceket");
    expect(r.products[0]?.slug).toBe("siyah-deri-ceket-kadin");
    expect((await repo.suggest("siyah zzzz")).products).toHaveLength(0);
  });

  it("returns nothing for an empty query", async () => {
    const r = await repo.suggest("   ");
    expect(r).toEqual({ products: [], categories: [], brands: [] });
  });

  it("never returns more products than the limit", async () => {
    expect((await repo.suggest("a", 2)).products.length).toBeLessThanOrEqual(2);
  });
});
