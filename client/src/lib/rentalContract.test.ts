import { describe, expect, it } from "vitest";
import { calculateRentalSummary, createOfflineRentalSnapshot, emptyRentalDetails, formatWholeRentalAmount, RENTAL_APPENDIX_TEMPLATE_VERSION, renderRentalContract } from "./rentalContract";
import { RENTAL_CONDITIONS_TEMPLATE_VERSION, rentalContractConditions } from "./rentalConditions";

describe("offline rental contract calculations", () => {
  it("calculates annual rent, end date and notice date", () => {
    const summary = calculateRentalSummary({ ...emptyRentalDetails(), startDate: "2026-01-15", durationMonths: "12", noticeDays: "60", paymentDay: "31", monthlyRent: "25000" });
    expect(summary.annualRent).toBe(300000);
    expect(summary.paymentDay).toBe(28);
    expect(summary.endDate).toBe("2027-01-15");
    expect(summary.noticeDate).toBe("2026-11-16");
    expect(summary.firstDueDate).toBe("2026-01-28");
  });

  it("builds a versioned offline rental snapshot with supplied residential conditions", () => {
    const details = { ...emptyRentalDetails(), ownerName: "Ayşe Malik", tenantName: "Mehmet Kiracı", monthlyRent: "18000" };
    const snapshot = createOfflineRentalSnapshot(details, " KIR-OF-01 ");
    expect(snapshot.contractNo).toBe("KIR-OF-01");
    expect(snapshot.schema).toBe("global1881-offline-rental-v2");
    expect(snapshot.conditionTemplateVersion).toBe(RENTAL_CONDITIONS_TEMPLATE_VERSION);
    expect(snapshot.appendixTemplateVersion).toBe(RENTAL_APPENDIX_TEMPLATE_VERSION);
    expect(snapshot.appendices.fixtures.fixtures).toBe(details.fixtures);
    expect(snapshot.conditions).toEqual(rentalContractConditions(details, "2027-08-23"));
    expect(formatWholeRentalAmount("1250000")).toBe("1.250.000");
    expect(renderRentalContract(details)).toContain("KONUT KİRA SÖZLEŞMESİ");
    expect(renderRentalContract(details)).toContain("Ayşe Malik");
    expect(renderRentalContract(details)).toContain("SÖZLEŞME KOŞULLARI");
  });

  it("uses a distinct commercial conditions set and adds guarantor condition only when selected", () => {
    const commercial = { ...emptyRentalDetails(), useType: "commercial" as const, hasGuarantor: true, guarantorName: "Kefil Kişi", monthlyRent: "90000" };
    const conditions = rentalContractConditions(commercial, "2027-08-23");
    expect(conditions[0]).toContain("KİRA SÜRESİ");
    expect(conditions.some((condition) => condition.includes("KEFALET"))).toBe(true);
    expect(rentalContractConditions({ ...commercial, hasGuarantor: false }, "2027-08-23").some((condition) => condition.includes("KEFALET"))).toBe(false);
  });
});
