import { describe, expect, it } from "vitest";
import { isConsultantCode, isContractNumberForCode, nextContractNumber, normalizeConsultantCode } from "./consultantCode";

describe("consultantCode", () => {
  it("danışman kodlarını boşluksuz ve büyük harfle standartlaştırır", () => {
    expect(normalizeConsultantCode(" ıp1 ")).toBe("IP1");
    expect(isConsultantCode("kt1")).toBe(true);
    expect(isConsultantCode("KT")).toBe(false);
    expect(isConsultantCode("KT-1")).toBe(false);
  });

  it("aynı danışmanın en yüksek üç haneli sözleşme sırasından sonraki numarayı üretir", () => {
    expect(nextContractNumber("ip1", ["IP1-001", "IP1-009", "KT1-013", "IP1-002"])).toBe("IP1-010");
    expect(nextContractNumber("CT1", [])).toBe("CT1-001");
  });

  it("sözleşme numarasının danışman koduyla aynı olmasını zorunlu tutar", () => {
    expect(isContractNumberForCode("ip1-001", "IP1")).toBe(true);
    expect(isContractNumberForCode("KT1-001", "IP1")).toBe(false);
    expect(isContractNumberForCode("IP1-01", "IP1")).toBe(false);
  });
});
