import { describe, expect, it } from "vitest";
import { calculateRentalSummary, createOfflineRentalSnapshot, emptyRentalDetails, renderRentalContract } from "./rentalContract";

describe("offline rental contract calculations", () => {
  it("calculates annual rent, end date and notice date", () => {
    const summary = calculateRentalSummary({ ...emptyRentalDetails(), startDate: "2026-01-15", durationMonths: "12", noticeDays: "60", paymentDay: "31", monthlyRent: "25000" });
    expect(summary.annualRent).toBe(300000);
    expect(summary.paymentDay).toBe(28);
    expect(summary.endDate).toBe("2027-01-15");
    expect(summary.noticeDate).toBe("2026-11-16");
    expect(summary.firstDueDate).toBe("2026-01-28");
  });

  it("builds an offline rental snapshot and readable preview", () => {
    const details = { ...emptyRentalDetails(), ownerName: "Ayşe Malik", tenantName: "Mehmet Kiracı", monthlyRent: "18000" };
    expect(createOfflineRentalSnapshot(details, " KIR-OF-01 ").contractNo).toBe("KIR-OF-01");
    expect(renderRentalContract(details)).toContain("KONUT KİRA SÖZLEŞMESİ");
    expect(renderRentalContract(details)).toContain("Ayşe Malik");
  });
});
