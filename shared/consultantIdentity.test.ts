import { describe, expect, it } from "vitest";
import { consultantInitialPrefix, nextConsultantCode, normalizeConsultantLogin } from "./consultantIdentity";

describe("danışman login ve kısa kod kuralları", () => {
  it("uzun login adını ve baş harf prefixini üretir", () => {
    expect(normalizeConsultantLogin("Kazım", "Taşlıarmut")).toBe("K-TASLIARMUT");
    expect(normalizeConsultantLogin("İbrahim", "Parin")).toBe("I-PARIN");
    expect(normalizeConsultantLogin("Cahit", "Tercan")).toBe("C-TERCAN");
    expect(consultantInitialPrefix("Cahit", "Tercan")).toBe("CT");
  });

  it("aynı baş harflerinde kullanılmayan en küçük sıra numarasını seçer", () => {
    expect(nextConsultantCode("Cahit", "Tercan", ["IP1", "CT1"])).toBe("CT2");
    expect(nextConsultantCode("Ceren", "Toprak", ["CT1", "CT3"])).toBe("CT2");
    expect(nextConsultantCode("Cem", "Tercan", ["CT1", "CT2", "CT3"])).toBe("CT4");
    expect(nextConsultantCode("Kazım", "Taşlıarmut", ["KT1"])).toBe("KT2");
  });
});
