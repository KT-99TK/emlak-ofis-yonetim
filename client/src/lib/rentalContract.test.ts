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
    expect(renderRentalContract(details)).toContain("HUSUSİ ŞARTLAR");
    expect(renderRentalContract(details)).toContain("Hususi şartlar kira sözleşmesinin ayrılmaz bir parçasıdır.");
    expect(renderRentalContract(details)).toContain("DASK poliçe no: DASK-2026-1881");
  });

  it("caps the first rent due date at five days after the contract date", () => {
    const details = { ...emptyRentalDetails(), startDate: "2026-08-23", firstPaymentDueDate: "2026-09-10" };
    expect(firstPaymentDeadline("2026-08-23")).toBe("2026-08-28");
    expect(calculateRentalSummary(details).firstDueDate).toBe("2026-08-28");
    expect(renderRentalContract(details)).toContain("İlk kira son ödeme tarihi: 28.08.2026 (sözleşmeden en geç 5 gün sonra)");
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
    expect(snapshot.appendices.evacuation).toMatchObject({ plannedDate: "", commitmentDate: "" });
    expect(renderRentalContract(details)).toContain("Vestel klima | 2 | Çalışır, temiz");
  });

  it("uses the new commercial conditions set without adding the removed guarantor clause", () => {
    const commercial = { ...emptyRentalDetails(), useType: "commercial" as const, hasGuarantor: true, guarantorName: "Kefil Kişi", monthlyRent: "90000" };
    const conditions = rentalContractConditions(commercial, "2027-08-23");
    expect(conditions[0]).toContain("1. KİRA SÜRESİ VE YENİLEME");
    expect(conditions).toHaveLength(21);
    expect(conditions.some((condition) => condition.includes("KEFALET"))).toBe(false);
    expect(conditions.some((condition) => condition.includes("Aylık net kira bedeli"))).toBe(true);

    const residential = { ...emptyRentalDetails(), useType: "residential" as const, hasGuarantor: true, guarantorName: "Konut Kefil", monthlyRent: "40000" };
    const residentialConditions = rentalContractConditions(residential, "2027-08-23");
    expect(residentialConditions).toHaveLength(22);
    expect(residentialConditions.some((condition) => condition.includes("Aylık kira bedeli net"))).toBe(true);
    expect(residentialConditions).not.toEqual(conditions);
  });

  it("uses the supplied 22-item hususi şart set only for residential contracts", () => {
    const residential = {
      ...emptyRentalDetails(),
      useType: "residential" as const,
      monthlyRent: "40000",
      deposit: "850",
      paymentDay: "5",
      durationMonths: "12",
      startDate: "2026-08-03",
      documentPlace: "Ankara",
      courtCity: "Çankaya",
    };
    const conditions = rentalContractConditions(residential, "2027-08-03");

    expect(conditions).toHaveLength(22);
    expect(conditions[0]).toContain("Mecur, Kiracı'ya sağlam, tam ve kullanılmaya elverişli şekilde teslim edilmiştir.");
    expect(conditions[3]).toContain("40.000 ₺");
    expect(conditions[3]).toContain("her ayın en geç 5. günü");
    expect(conditions[4]).toContain("aylık %5 faiz uygulanır");
    expect(conditions[6]).toContain("850 ₺ sözleşme tarihinde nakit olarak öder");
    expect(conditions[10]).toContain("Kira süresi 12 ay olup");
    expect(conditions[18]).toContain("Çankaya Mahkemeleri ve İcra Daireleri yetkilidir");
    expect(conditions[21]).toContain("22 hususi şarttan ibaret olup, 2026-08-03 tarihinde Ankara'da");
    expect(conditions.join(" ")).not.toContain("turizm amaçlı");

    const commercial = rentalContractConditions(
      { ...residential, useType: "commercial" as const },
      "2027-08-03"
    );
    expect(commercial[0]).toContain("KİRA SÜRESİ");
    expect(commercial.join(" ")).not.toContain("aylık %5 faiz uygulanır");
  });
});
