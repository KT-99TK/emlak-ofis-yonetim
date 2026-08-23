import { describe, expect, it } from "vitest";
import { presentOfflineRecord } from "./offlineRecordPresentation";
import type { OfflineRecord } from "./offlineStore";

const record = (entity: OfflineRecord["entity"], details: object): OfflineRecord => ({ id: "r-1", entity, title: "Başlık", details: JSON.stringify(details), status: "open", deviceId: "d-1", userId: "ayse", updatedAt: "2026-08-23T12:00:00.000Z", recordVersion: 1 });

describe("offline record presentation", () => {
  it("never exposes raw customer request snapshot JSON in the local list", () => {
    const value = presentOfflineRecord(record("request", { schema: "global1881-offline-customer-request-v1", operation: "sale", location: "atatürk", propertyType: "villa", minBudget: 15000000, maxBudget: 20000000, requesterName: "ayşe yılmaz", notes: "Gizli müşteri notu" }));
    expect(value).toEqual({ label: "Müşteri talebi", summary: "Satılık · Atatürk · Villa · ₺15.000.000–₺20.000.000 · Talep sahibi: Ayşe Yılmaz" });
    expect(value.summary).not.toContain("schema");
    expect(value.summary).not.toContain("Gizli müşteri notu");
  });

  it("summarizes annual targets without showing implementation fields", () => {
    const value = presentOfflineRecord(record("target", { schema: "global1881-offline-annual-target-v1", year: "2026", targetAmount: 2000000, currency: "TRY" }));
    expect(value).toEqual({ label: "Ciro hedefi", summary: "2026 · Hedef: ₺2.000.000" });
  });
});
