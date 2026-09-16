import { describe, expect, it } from "vitest";
import { createOfflineAuthoritySnapshot, emptyAuthorityDetails } from "./authorityContract";
import { maskIdentityOrTaxNo, maskPhone } from "./privacy";
import { createOfflineRentalSnapshot, emptyRentalDetails } from "./rentalContract";

describe("offline sözleşme mahremiyeti", () => {
  it("yeni kira snapshot’ına ham telefon ve kimlik değerini yazmaz", () => {
    const snapshot = createOfflineRentalSnapshot({ ...emptyRentalDetails(), ownerIdentity: "12345678901", ownerPhone: "05321234567", tenantIdentity: "10987654321", tenantPhone: "05431234567" }, "KIR-KT1-001");
    expect(JSON.stringify(snapshot)).not.toContain("05321234567");
    expect(JSON.stringify(snapshot)).not.toContain("12345678901");
    expect(snapshot.ownerPhone).toBe("05•• ••• •• 67");
    expect(snapshot.tenantIdentity).toBe("10*******21");
  });

  it("yeni yetki snapshot’ına ham malik telefonu ve kimlik noyu yazmaz", () => {
    const snapshot = createOfflineAuthoritySnapshot({ ...emptyAuthorityDetails(), ownerIdentity: "12345678901", ownerPhone: "05321234567" }, "YET-KT1-001");
    expect(JSON.stringify(snapshot)).not.toContain("05321234567");
    expect(JSON.stringify(snapshot)).not.toContain("12345678901");
    expect(snapshot.ownerIdentity).toBe("12*******01");
  });

  it("maske yardımcıları tekrar uygulandığında değeri bozmaz", () => {
    expect(maskPhone("05•• ••• •• 67")).toBe("05•• ••• •• 67");
    expect(maskIdentityOrTaxNo("12*******01")).toBe("12*******01");
  });
});
