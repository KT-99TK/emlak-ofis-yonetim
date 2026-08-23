import { describe, expect, it } from "vitest";
import { authorityContractTitle, emptyAuthorityDetails, renderAuthorityContract } from "./authorityContract";

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
});
