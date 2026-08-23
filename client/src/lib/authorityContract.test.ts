import { describe, expect, it } from "vitest";
import { authorityContractTitle, createOfflineAuthoritySnapshot, emptyAuthorityDetails, renderAuthorityContract } from "./authorityContract";

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
    expect(output).toContain("Sözleşmeye esas satış bedeli: 4500000 ₺");
  });

  it("serializes an explicit offline snapshot schema and record references", () => {
    const snapshot = createOfflineAuthoritySnapshot({ ...emptyAuthorityDetails(), ownerName: "Ayşe Malik" }, " YET-OF-001 ", "client-1", "property-1");
    expect(snapshot.schema).toBe("global1881-offline-authority-v1");
    expect(snapshot.contractNo).toBe("YET-OF-001");
    expect(snapshot.ownerName).toBe("Ayşe Malik");
    expect(snapshot.sourceClientRecordId).toBe("client-1");
  });
});
