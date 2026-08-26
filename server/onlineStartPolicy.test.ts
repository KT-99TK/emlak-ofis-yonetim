import { describe, expect, it } from "vitest";
import { assertCentralRecordDateIsAllowed, assertFreshStartConfirmation, ONLINE_START_CONFIRMATION, startOfTurkeyBusinessDay, turkeyBusinessDateKey } from "./onlineStartPolicy";

describe("temiz online başlangıç politikası", () => {
  const policy = { effectiveAt: new Date("2026-09-01T00:00:00.000Z"), noBalanceCarry: true, noOfflineImport: true };

  it("başlangıç tarihi tanımlanmadan merkezi kayıt açılmasını engeller", () => {
    expect(() => assertCentralRecordDateIsAllowed(undefined, new Date("2026-09-02T00:00:00.000Z"))).toThrow("henüz ayarlanmadı");
  });

  it("geçiş tarihinden önceki merkezi kayıtları engeller, geçiş anı ve sonrasına izin verir", () => {
    expect(() => assertCentralRecordDateIsAllowed(policy, new Date("2026-08-31T23:59:59.000Z"))).toThrow("yalnız geçiş tarihinden sonraki");
    expect(() => assertCentralRecordDateIsAllowed(policy, new Date("2026-09-01T00:00:00.000Z"))).not.toThrow();
    expect(() => assertCentralRecordDateIsAllowed(policy, new Date("2026-09-02T00:00:00.000Z"))).not.toThrow();
  });

  it("yalnız tam teyit metniyle sıfır bakiyeli başlangıca izin verir", () => {
    expect(() => assertFreshStartConfirmation("TEMİZ BAŞLANGIÇ")).toThrow("tam teyit metni");
    expect(() => assertFreshStartConfirmation(ONLINE_START_CONFIRMATION)).not.toThrow();
  });

  it("geçiş gününü Türkiye iş günü başlangıcı olarak sabitler", () => {
    expect(turkeyBusinessDateKey(new Date("2026-08-26T20:59:59.000Z"))).toBe("2026-08-26");
    expect(turkeyBusinessDateKey(new Date("2026-08-26T21:00:00.000Z"))).toBe("2026-08-27");
    expect(startOfTurkeyBusinessDay(new Date("2026-08-27T12:00:00.000Z")).toISOString()).toBe("2026-08-26T21:00:00.000Z");
  });
});
