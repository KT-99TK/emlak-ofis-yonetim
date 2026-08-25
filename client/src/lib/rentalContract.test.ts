import { describe, expect, it } from "vitest";
import { calculateRentalSummary, createOfflineRentalSnapshot, emptyRentalDetails, firstPaymentDeadline, fixtureItemsFromLegacy, fixtureItemsToLegacy, formatWholeRentalAmount, RENTAL_APPENDIX_TEMPLATE_VERSION, renderRentalContract } from "./rentalContract";
import { RENTAL_CONDITIONS_TEMPLATE_VERSION, rentalContractConditions } from "./rentalConditions";

describe("offline rental contract calculations", () => {
  it("calculates annual rent, end date and notice date", () => {
    const summary = calculateRentalSummary({ ...emptyRentalDetails(), startDate: "2026-01-15", durationMonths: "12", noticeDays: "60", paymentDay: "31", monthlyRent: "25000" });
    expect(summary.annualRent).toBe(300000);
    expect(summary.paymentDay).toBe(28);
    expect(summary.endDate).toBe("2027-01-15");
    expect(summary.noticeDate).toBe("2026-11-16");
    expect(summary.firstDueDate).toBe("2026-01-20");
    expect(summary.maxFirstPaymentDate).toBe("2026-01-20");
  });

  it("builds a versioned offline rental snapshot with supplied residential conditions", () => {
    const details = { ...emptyRentalDetails(), startDate: "2026-08-23", ownerName: "Ayşe Malik", tenantName: "Mehmet Kiracı", monthlyRent: "18000", signedByParties: true, signedAt: "2026-08-23", electricityMeterNo: "ELEK-34017", waterMeterNo: "SU-9821", naturalGasMeterNo: "DOG-4410", daskPolicyNo: "DASK-2026-1881" };
    const snapshot = createOfflineRentalSnapshot(details, " KIR-OF-01 ");
    expect(snapshot.contractNo).toBe("KIR-OF-01");
    expect(snapshot.schema).toBe("global1881-offline-rental-v6");
    expect(snapshot.signedByParties).toBe(true);
    expect(snapshot.signedAt).toBe("2026-08-23");
    expect(snapshot.conditionTemplateVersion).toBe(RENTAL_CONDITIONS_TEMPLATE_VERSION);
    expect(snapshot.appendixTemplateVersion).toBe(RENTAL_APPENDIX_TEMPLATE_VERSION);
    expect(snapshot.appendices.fixtures.fixtures).toBe(details.fixtures);
    expect(snapshot.appendices.handover.includedInPackage).toBe(true);
    expect(snapshot.deliveryAppendix).toMatchObject({ electricityMeterNo: "ELEK-34017", waterMeterNo: "SU-9821", naturalGasMeterNo: "DOG-4410", daskPolicyNo: "DASK-2026-1881" });
    expect(snapshot.appendices.handover).toMatchObject({ electricityMeterNo: "ELEK-34017", waterMeterNo: "SU-9821", naturalGasMeterNo: "DOG-4410" });
    expect(snapshot.conditions).toEqual(rentalContractConditions(details, "2027-08-23"));
    expect(formatWholeRentalAmount("1250000")).toBe("1.250.000");
    expect(renderRentalContract(details)).toContain("KONUT KİRA SÖZLEŞMESİ");
    expect(renderRentalContract(details)).toContain("Ayşe Malik");
    expect(renderRentalContract(details)).toContain("SÖZLEŞME KOŞULLARI");
    expect(renderRentalContract(details)).toContain("DASK poliçe no: DASK-2026-1881");
  });

  it("caps the first rent due date at five days after the contract date", () => {
    const details = { ...emptyRentalDetails(), startDate: "2026-08-23", firstPaymentDueDate: "2026-09-10" };
    expect(firstPaymentDeadline("2026-08-23")).toBe("2026-08-28");
    expect(calculateRentalSummary(details).firstDueDate).toBe("2026-08-28");
    expect(renderRentalContract(details)).toContain("İlk kira son ödeme tarihi: 2026-08-28 (sözleşmeden en geç 5 gün sonra)");
  });

  it("keeps Claude-compatible fixture rows in the snapshot while parsing legacy fixture text", () => {
    const rows = fixtureItemsFromLegacy("Vestel klima | 2 | Çalışır, temiz\nDaire anahtarı | 3 | Teslim edildi");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ item: "Vestel klima", quantity: "2", condition: "Çalışır, temiz" });
    const details = { ...emptyRentalDetails(), fixtureItems: rows };
    const snapshot = createOfflineRentalSnapshot(details, "KIR-OF-02");
    expect(fixtureItemsToLegacy(rows)).toContain("Daire anahtarı | 3 | Teslim edildi");
    expect(snapshot.appendices.fixtures.fixtureItems[1]).toMatchObject({ item: "Daire anahtarı", quantity: "3" });
    expect(snapshot.appendices.handover.fixtureItems[1]).toMatchObject({ item: "Daire anahtarı", quantity: "3", condition: "Teslim edildi" });
    expect(snapshot.appendices.return.fixtureItems[0]).toMatchObject({ item: "Vestel klima", quantity: "2" });
    expect(renderRentalContract(details)).toContain("Vestel klima | 2 | Çalışır, temiz");
  });

  it("uses a distinct commercial conditions set and adds guarantor condition only when selected", () => {
    const commercial = { ...emptyRentalDetails(), useType: "commercial" as const, hasGuarantor: true, guarantorName: "Kefil Kişi", monthlyRent: "90000" };
    const conditions = rentalContractConditions(commercial, "2027-08-23");
    expect(conditions[0]).toContain("KİRA SÜRESİ");
    expect(conditions.some((condition) => condition.includes("KEFALET"))).toBe(true);
    expect(rentalContractConditions({ ...commercial, hasGuarantor: false }, "2027-08-23").some((condition) => condition.includes("KEFALET"))).toBe(false);
  });
});
