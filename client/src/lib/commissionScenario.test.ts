import { describe, expect, it } from "vitest";
import { calculateCommissionScenario } from "./commissionScenario";

describe("commission scenarios", () => {
  it("splits consultant-owned portfolio between buyer and seller consultants", () => {
    const result = calculateCommissionScenario({ netCommission: 100000, scenario: "consultantPortfolioTwoSided" });
    expect(result.participants.map((item) => item.baseShare)).toEqual([50000, 50000]);
    expect(result.consultantTotal).toBe(60000);
    expect(result.globalOfficeTotal).toBe(40000);
  });

  it("keeps office portfolio share separate from consultant pool", () => {
    const result = calculateCommissionScenario({ netCommission: 100000, scenario: "officePortfolioTwoSided" });
    expect(result.portfolioOfficeShare).toBe(50000);
    expect(result.participants.filter((item) => item.role.includes("Consultant") || item.role.includes("consultant")).map((item) => item.baseShare)).toEqual([25000, 25000]);
    expect(result.consultantTotal).toBe(30000);
    expect(result.globalOfficeTotal).toBe(70000);
  });

  it("splits counterparty office and Global external office pool", () => {
    const result = calculateCommissionScenario({ netCommission: 100000, scenario: "externalOfficeSingleConsultant" });
    expect(result.externalOfficeShare).toBe(50000);
    expect(result.consultantTotal).toBe(30000);
    expect(result.globalOfficeTotal).toBe(20000);
  });

  it("handles a single Global consultant", () => {
    const result = calculateCommissionScenario({ netCommission: 50000, scenario: "singleConsultant" });
    expect(result.consultantTotal).toBe(30000);
    expect(result.globalOfficeTotal).toBe(20000);
  });
});
