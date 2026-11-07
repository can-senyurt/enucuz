import { describe, expect, it } from "vitest";
import {
  editDistance,
  highlightSegments,
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

describe("highlightSegments", () => {
  const join = (segs: { text: string; hit: boolean }[]) =>
    segs.map((s) => (s.hit ? `[${s.text}]` : s.text)).join("");

  it("marks the typed part and keeps the original spelling", () => {
    expect(join(highlightSegments("Spor Ayakkabı", "ayak"))).toBe(
      "Spor [Ayak]kabı",
    );
  });

  it("ignores case and Turkish letters in the query", () => {
    expect(join(highlightSegments("Çocuk Kapüşonlu Mont", "kapuson"))).toBe(
      "Çocuk [Kapüşon]lu Mont",
    );
    expect(join(highlightSegments("ISIK İstanbul", "ısık"))).toBe(
      "[ISIK] İstanbul",
    );
  });

  it("highlights each typed word and prefers word starts", () => {
    expect(join(highlightSegments("Siyah Deri Ceket", "deri ce"))).toBe(
      "Siyah [Deri] [Ce]ket",
    );
    expect(join(highlightSegments("Sahil", "ah"))).toBe("S[ah]il"); // no word start: first hit
  });

  it("returns the text unchanged when nothing matches or the query is empty", () => {
    expect(join(highlightSegments("Nordika", "xyz"))).toBe("Nordika");
    expect(join(highlightSegments("Nordika", ""))).toBe("Nordika");
  });
});
