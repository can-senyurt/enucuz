import { describe, expect, it } from "vitest";
import { formatMinutesAgo, formatPercent, formatPrice } from "@/lib/format";

describe("formatPrice", () => {
  it("formats kuruş in Turkish style", () => {
    expect(formatPrice(129990)).toBe("1.299,90\u00A0₺");
    expect(formatPrice(99)).toBe("0,99\u00A0₺");
  });

  it("drops decimals for whole liras", () => {
    expect(formatPrice(129900)).toBe("1.299\u00A0₺");
    expect(formatPrice(50000)).toBe("500\u00A0₺");
  });
});

describe("formatPercent / formatMinutesAgo", () => {
  it("rounds percentages", () => {
    expect(formatPercent(0.2534)).toBe("%25");
  });

  it("formats relative minutes", () => {
    expect(formatMinutesAgo(0)).toBe("az önce");
    expect(formatMinutesAgo(12)).toBe("12 dk önce");
    expect(formatMinutesAgo(180)).toBe("3 saat önce");
    expect(formatMinutesAgo(60 * 48)).toBe("2 gün önce");
  });
});
