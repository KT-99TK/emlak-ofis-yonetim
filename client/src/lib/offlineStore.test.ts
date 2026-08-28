import { webcrypto } from "node:crypto";
import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { applyWithRollback, decryptBackupPayload, encryptBackupPayload, exportOfflineBackup, importOfflineBackup, listOfflineAuditEvents, recordOfflineAudit, validateBackupPassword } from "./offlineStore";

if (!globalThis.crypto) Object.defineProperty(globalThis, "crypto", { configurable: true, value: webcrypto });

describe("offline encrypted backup crypto", () => {
  it("records audit events through the real export and import flow", async () => {
    const values = new Map<string, string>([["global1881-user-id", "manager-test"]]);
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem: (key: string) => values.get(key) ?? null,
          setItem: (key: string, value: string) => { values.set(key, value); },
        },
      },
    });
    const backup = await exportOfflineBackup("Global1881!backup");
    const importedFile = { name: "global1881-backup.json", text: () => backup.text() } as File;
    await importOfflineBackup(importedFile, "Global1881!backup");
    const events = listOfflineAuditEvents();
    expect(events.map((event) => event.action)).toEqual(["backup-exported", "backup-verified", "records-applied"]);
    expect(events[0]).toMatchObject({ userId: "manager-test", metadata: { recordCount: 0, encrypted: true } });
    expect(events[1]).toMatchObject({ metadata: { recordCount: 0, checksumVerified: true, signatureVerified: true } });
    expect(events[2]).toMatchObject({ metadata: { recordCount: 0 } });
  });

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

  it("records and reads the backup lifecycle audit events without exposing backup payloads", () => {
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem: (key: string) => values.get(key) ?? null,
          setItem: (key: string, value: string) => { values.set(key, value); },
        },
      },
    });
    recordOfflineAudit("backup-exported", { recordCount: 2, encrypted: true });
    recordOfflineAudit("backup-verified", { recordCount: 2, checksumVerified: true, signatureVerified: true });
    recordOfflineAudit("records-applied", { recordCount: 2 });
    expect(listOfflineAuditEvents().map((event) => event.action)).toEqual(["backup-exported", "backup-verified", "records-applied"]);
    expect(listOfflineAuditEvents()[1]).toMatchObject({ metadata: { checksumVerified: true, signatureVerified: true } });
  });

  it("rolls back when backup creation fails after records were applied", async () => {
    const calls: string[] = [];
    const outcome = await applyWithRollback({
      createSnapshot: async () => { calls.push("snapshot"); },
      applyRecords: async () => { calls.push("apply"); },
      createBackup: async () => { calls.push("backup"); throw new Error("disk full"); },
      restoreSnapshot: async () => { calls.push("restore"); },
    });
    expect(outcome).toMatchObject({ success: false, rollbackApplied: true });
    expect(calls).toEqual(["snapshot", "apply", "backup", "restore"]);
  });
});
