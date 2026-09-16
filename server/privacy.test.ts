import { describe, expect, it } from "vitest";
import {
  assertSafeRevealReason,
  decryptSensitiveValue,
  encryptSensitiveValue,
  maskIdentityOrTaxNo,
  maskPhone,
  protectContractDetails,
} from "./privacy";
import { canRevealSensitiveForScope } from "./db";

describe("hassas veri mahremiyeti", () => {
  it("telefon ve kimlik değerlerini varsayılan yanıtta maskeler", () => {
    expect(maskPhone("0532 123 45 67")).toBe("05•• ••• •• 67");
    expect(maskIdentityOrTaxNo("12345678901")).toBe("12*******01");
  });

  it("yeni sözleşme ayrıntılarında ham değer yerine maskeyi bırakır", () => {
    const rawPhone = "05321234567";
    const rawIdentity = "12345678901";
    const result = protectContractDetails(JSON.stringify({ ownerPhone: rawPhone, tenantIdentity: rawIdentity }));
    expect(result.maskedDetails).not.toContain(rawPhone);
    expect(result.maskedDetails).not.toContain(rawIdentity);
    expect(result.maskedDetails).toContain("05•• ••• •• 67");
    expect(result.maskedDetails).toContain("12*******01");
    expect(result.sensitiveFields).toEqual([
      { fieldPath: "ownerPhone", value: rawPhone },
      { fieldPath: "tenantIdentity", value: rawIdentity },
    ]);
  });

  it("şifreli kasa değerinin düz metni içermediğini ve sunucuda çözüldüğünü doğrular", () => {
    process.env.JWT_SECRET = "test-only-jwt-secret";
    const encrypted = encryptSensitiveValue("12345678901");
    expect(encrypted.ciphertext).not.toContain("12345678901");
    expect(decryptSensitiveValue(encrypted)).toBe("12345678901");
  });

  it("gerekçeye yanlışlıkla hassas değer yazılmasını reddeder", () => {
    expect(assertSafeRevealReason("Fizikî dosya eşleştirmesi")).toBe("Fizikî dosya eşleştirmesi");
    expect(() => assertSafeRevealReason("0532 123 45 67 için arama")).toThrow();
  });

  it("broker manager ve yalnız atanmış danışmanın hassas değeri açabildiğini doğrular", () => {
    expect(canRevealSensitiveForScope({ actorUserId: 1, isManager: true, officeRole: "broker_manager", assignedUserId: 21 })).toBe(true);
    expect(canRevealSensitiveForScope({ actorUserId: 21, isManager: false, officeRole: "consultant", assignedUserId: 21 })).toBe(true);
    expect(canRevealSensitiveForScope({ actorUserId: 22, isManager: false, officeRole: "consultant", assignedUserId: 21 })).toBe(false);
    expect(canRevealSensitiveForScope({ actorUserId: 7, isManager: false, officeRole: "office_assistant", assignedUserId: 21 })).toBe(false);
  });
});
