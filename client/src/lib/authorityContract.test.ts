import { describe, expect, it } from "vitest";
import { AUTHORITY_CONDITIONS_TEMPLATE_VERSION, authorityContractConditions, authorityContractTitle, calculateAuthoritySummary, consultantInitials, createOfflineAuthoritySnapshot, emptyAuthorityDetails, formatWholeCurrencyInput, nextAuthorityContractNo, renderAuthorityContract, toInternationalPhone, toTurkishTitleCase } from "./authorityContract";

describe("authority contract template", () => {
  it("renders the rent template with safe placeholders", () => {
    const output = renderAuthorityContract(emptyAuthorityDetails());
    expect(authorityContractTitle("rent")).toBe("KİRALAMA YETKİ SÖZLEŞMESİ");
    expect(output).toContain("Global 1881 Gayrimenkul");
    expect(output).toContain("................................");
  });

  it("changes title, action and amount label for a sale authority", () => {
    const output = renderAuthorityContract({ ...emptyAuthorityDetails(), mode: "sale", ownerName: "Ayşe Malik", price: "4500000" });
    expect(output).toContain("SATIŞ YETKİ SÖZLEŞMESİ");
    expect(output).toContain("taşınmazın satış işlemleri");
    expect(output).toContain("Sözleşmeye esas satış bedeli: ₺4.500.000");
  });

  it("does not create an owner service fee or KDV obligation for a rental authority", () => {
    const details = { ...emptyAuthorityDetails(), mode: "rent" as const, price: "25000", serviceFeeRate: "2", serviceFeeAmount: "500" };
    expect(calculateAuthoritySummary(details)).toMatchObject({ contractAmount: 25000, serviceFeeRate: 0, serviceFeeAmount: 0 });
    expect(authorityContractConditions(details)[0]).toContain("malikine hizmet bedeli veya KDV tahakkuku doğurmaz");
    expect(renderAuthorityContract(details)).not.toContain("Hizmet bedeli:");
  });

  it("serializes an explicit offline snapshot schema and record references", () => {
    const snapshot = createOfflineAuthoritySnapshot({ ...emptyAuthorityDetails(), ownerName: "Ayşe Malik" }, " YET-OF-001 ", "client-1", "property-1");
    expect(snapshot.schema).toBe("global1881-offline-authority-v2");
    expect(snapshot.contractNo).toBe("YET-OF-001");
    expect(snapshot.ownerName).toBe("Ayşe Malik");
    expect(snapshot.sourceClientRecordId).toBe("client-1");
  });

  it("creates a consultant-initialled year sequence and normalizes text/phones", () => {
    expect(consultantInitials("ayşe yılmaz")).toBe("AY");
    expect(nextAuthorityContractNo(["YET-2026-AY-001", "YET-2026-AY-004"], "Ayşe Yılmaz", "2026-08-23")).toBe("YET-2026-AY-005");
    expect(toTurkishTitleCase("ayşe yıldız-şahin")).toBe("Ayşe Yıldız-Şahin");
    expect(toInternationalPhone("0532 123 45 67")).toBe("+905321234567");
  });

  it("calculates amount and service fee from Turkish or plain decimal input", () => {
    expect(calculateAuthoritySummary({ ...emptyAuthorityDetails(), mode: "sale", price: "1.250.000,50", serviceFeeRate: "2" })).toMatchObject({ contractAmount: 1250001, serviceFeeAmount: 25000 });
    expect(calculateAuthoritySummary({ ...emptyAuthorityDetails(), mode: "sale", price: "2500.50", serviceFeeAmount: "125.25" })).toMatchObject({ contractAmount: 2501, serviceFeeAmount: 125 });
    expect(formatWholeCurrencyInput("1250000")).toBe("1.250.000");
  });

  it("includes the complete ten-item supplied conditions as a versioned snapshot", () => {
    const details = { ...emptyAuthorityDetails(), mode: "sale", consultantName: "Cahit Tercan", officeName: "Terpa Gayrimenkul" };
    const conditions = authorityContractConditions(details);
    const snapshot = createOfflineAuthoritySnapshot(details, "YET-2026-CT-001");
    expect(conditions).toHaveLength(10);
    expect(conditions[0]).toContain("%2 + KDV");
    expect(conditions[9]).toContain("İzmir Mahkemeleri");
    expect(snapshot.conditionTemplateVersion).toBe(AUTHORITY_CONDITIONS_TEMPLATE_VERSION);
    expect(snapshot.conditions).toEqual(conditions);
  });
});
