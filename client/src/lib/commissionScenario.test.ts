import { describe, expect, it } from "vitest";
import { calculateCommissionScenario, calculateDepartingConsultantSplit } from "./commissionScenario";

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

  it("applies a 70/30 agreement profile to a single consultant", () => {
    const result = calculateCommissionScenario({ netCommission: 100000, scenario: "singleConsultant", consultantRate: 70, officeRate: 30 });
    expect(result.consultantTotal).toBe(70000);
    expect(result.globalOfficeTotal).toBe(30000);
  });

  it("applies an 80/20 agreement profile to an external-office Global pool", () => {
    const result = calculateCommissionScenario({ netCommission: 100000, scenario: "externalOfficeSingleConsultant", consultantRate: 80, officeRate: 20 });
    expect(result.externalOfficeShare).toBe(50000);
    expect(result.consultantTotal).toBe(40000);
    expect(result.globalOfficeTotal).toBe(10000);
  });

  it("rejects agreement rates that do not total 100", () => {
    expect(() => calculateCommissionScenario({ netCommission: 100000, scenario: "singleConsultant", consultantRate: 70, officeRate: 25 })).toThrow("%100");
  });
});


describe("departing consultant rights", () => {
  it("preserves Global office share and splits only the consultant pool", () => {
    expect(calculateDepartingConsultantSplit({ netCommission: 100000 })).toMatchObject({
      globalOfficeShare: 40000,
      consultantPool: 60000,
      originatingConsultantPayout: 30000,
      fulfillingConsultantPayout: 30000,
    });
  });

  it("supports a profile-specific 70/30 split", () => {
    expect(calculateDepartingConsultantSplit({ netCommission: 100000, consultantRate: 70, officeRate: 30 })).toMatchObject({
      globalOfficeShare: 30000,
      consultantPool: 70000,
      originatingConsultantPayout: 35000,
      fulfillingConsultantPayout: 35000,
    });
  });

  it("keeps the corporate office total when it does not pay a consultant", () => {
    expect(calculateDepartingConsultantSplit({ netCommission: 100000, corporateOffice: true, corporateOfficePaysConsultant: false })).toMatchObject({
      globalOfficeShare: 100000,
      consultantPool: 0,
      originatingConsultantPayout: 0,
      fulfillingConsultantPayout: 0,
      corporateOfficePaysConsultant: false,
    });
  });
});
