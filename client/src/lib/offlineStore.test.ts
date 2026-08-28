import { webcrypto } from "node:crypto";
import { describe, expect, it } from "vitest";
import { decryptBackupPayload, encryptBackupPayload, validateBackupPassword } from "./offlineStore";

if (!globalThis.crypto) Object.defineProperty(globalThis, "crypto", { configurable: true, value: webcrypto });

describe("offline encrypted backup crypto", () => {
  it("encrypts and decrypts the canonical backup payload", async () => {
    const source = JSON.stringify({ format: "global1881-offline-encrypted-v1", records: [{ id: "r-1", title: "Kira" }, { id: "internal-1", entity: "internalControl", title: "Ofis payı iç denetimi", details: JSON.stringify({ schema: "global1881-office-contribution-v1", sourceTransactionNo: "ISK-2026-001" }) }] });
    const encrypted = await encryptBackupPayload(source, "Global1881!backup");
    expect(encrypted.ciphertext).not.toContain("Kira");
    expect(encrypted.ciphertext).not.toContain("Ofis payı iç denetimi");
    await expect(decryptBackupPayload(encrypted, "Global1881!backup")).resolves.toBe(source);
  });

  it("rejects a wrong password and short passwords", async () => {
    const encrypted = await encryptBackupPayload("sensitive records", "Global1881!backup");
    await expect(decryptBackupPayload(encrypted, "wrong-password")).rejects.toThrow();
    expect(() => validateBackupPassword("short")).toThrow("en az 8 karakter");
  });

  it("rejects a tampered ciphertext instead of returning altered backup data", async () => {
    const encrypted = await encryptBackupPayload("sensitive records", "Global1881!backup");
    const tampered = { ...encrypted, ciphertext: `${encrypted.ciphertext.slice(0, -2)}aa` };
    await expect(decryptBackupPayload(tampered, "Global1881!backup")).rejects.toThrow();
  });
});
