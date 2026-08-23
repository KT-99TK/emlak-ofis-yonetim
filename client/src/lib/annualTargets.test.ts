import { describe, expect, it } from "vitest";
import { ANNUAL_TARGET_SCHEMA, buildBrokerAnnualTargetProgress, calculateAnnualTargetProgress } from "./annualTargets";
import type { OfflineRecord } from "./offlineStore";

const record = (partial: Partial<OfflineRecord>): OfflineRecord => ({ id: crypto.randomUUID(), entity: "contract", title: "Kayıt", details: "{}", status: "draft", deviceId: "d", userId: "u", recordVersion: 1, updatedAt: "2026-01-10T00:00:00.000Z", ...partial });
describe("annual targets", () => {
  it("uses the latest yearly target revision and calculates own service revenue", () => {
    const records = [record({ id: "old", entity: "target", userId: "ayse", updatedAt: "2026-01-01T00:00:00.000Z", details: JSON.stringify({ schema: ANNUAL_TARGET_SCHEMA, year: "2026", targetAmount: 100000, currency: "TRY" }) }), record({ id: "new", entity: "target", userId: "ayse", updatedAt: "2026-02-01T00:00:00.000Z", details: JSON.stringify({ schema: ANNUAL_TARGET_SCHEMA, year: "2026", targetAmount: 120000, currency: "TRY", previousTargetRecordId: "old" }) }), record({ id: "sale", userId: "ayse", details: JSON.stringify({ schema: "global1881-offline-authority-v2", mode: "sale", consultantName: "Ayşe", contractDate: "2026-03-01", price: "500000", currency: "TRY", serviceFeeRate: "2" }) })];
    expect(calculateAnnualTargetProgress(records, "ayse", "2026")).toMatchObject({ targetAmount: 120000, actualAmount: 10000, remainingAmount: 110000, progressPercent: 8.3, revisionCount: 2 });
  });
  it("builds broker rows only for users with yearly targets", () => {
    const records = [record({ entity: "target", userId: "ayse", details: JSON.stringify({ schema: ANNUAL_TARGET_SCHEMA, year: "2026", targetAmount: 100, currency: "TRY" }) }), record({ entity: "target", userId: "mehmet", details: JSON.stringify({ schema: ANNUAL_TARGET_SCHEMA, year: "2026", targetAmount: 200, currency: "TRY" }) })];
    expect(buildBrokerAnnualTargetProgress(records, "2026").map((item) => item.userId).sort()).toEqual(["ayse", "mehmet"]);
  });
});
