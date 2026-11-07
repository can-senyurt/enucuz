import { describe, expect, it } from "vitest";
import {
  editDistance,
  matchToken,
  normalizeText,
  tokenize,
} from "@/lib/search/normalize";

describe("normalizeText", () => {
  it("handles the Turkish dotted/dotless i correctly", () => {
    expect(normalizeText("IŞIK")).toBe("isik"); // I -> ı -> i
    expect(normalizeText("İstanbul")).toBe("istanbul");
    expect(normalizeText("ıspanak")).toBe("ispanak");
  });

  it("folds Turkish letters to ASCII", () => {
    expect(normalizeText("Çanta Şapka Öğrenci Ürün")).toBe(
      "canta sapka ogrenci urun",
    );
  });

  it("strips punctuation and collapses spaces", () => {
    expect(normalizeText("  Nike   Air-Force 1! ")).toBe("nike air force 1");
  });
});

describe("tokenize", () => {
  it("returns an empty array for blank input", () => {
    expect(tokenize("   ")).toEqual([]);
    expect(tokenize("Siyah Deri Ceket")).toEqual(["siyah", "deri", "ceket"]);
  });
});

describe("editDistance / matchToken", () => {
  it("computes edit distance", () => {
    expect(editDistance("ayakabi", "ayakkabi")).toBe(1);
    expect(editDistance("ceket", "ceket")).toBe(0);
  });

  it("tolerates a single typo for longer words", () => {
    expect(matchToken("ayakabi", ["spor", "ayakkabi"])).toBe(1);
  });

  it("ranks exact above prefix above substring", () => {
    expect(matchToken("ceket", ["ceket"])).toBe(3);
    expect(matchToken("cek", ["ceket"])).toBe(2);
    expect(matchToken("eke", ["ceket"])).toBe(1.5);
    expect(matchToken("pantolon", ["ceket"])).toBe(0);
  });
});
