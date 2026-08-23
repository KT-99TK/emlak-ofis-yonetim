import { describe, expect, it } from "vitest";
import { buildAuthorityPerformance, sumAuthorityPerformance } from "./authorityPerformance";
import type { OfflineRecord } from "./offlineStore";

function contract(snapshot: Record<string, unknown>): OfflineRecord {
  return { id: crypto.randomUUID(), entity: "contract", title: "Yetki", details: JSON.stringify(snapshot), status: "draft", deviceId: "device-1", userId: "manager", recordVersion: 1, updatedAt: "2026-08-23T00:00:00.000Z" };
}

describe("authority performance", () => {
  it("groups authority contracts by consultant and keeps currencies separate", () => {
    const rows = buildAuthorityPerformance([
      contract({ schema: "global1881-offline-authority-v2", consultantName: "ayşe yılmaz", consultantCode: "D-01", contractDate: "2026-08-01", price: "1.250.000,50", currency: "TRY", serviceFeeAmount: "25000,50" }),
      contract({ schema: "global1881-offline-authority-v2", consultantName: "Ayşe Yılmaz", consultantCode: "D-01", contractDate: "2026-08-10", price: "100000", currency: "USD", serviceFeeRate: "2" }),
      contract({ schema: "global1881-offline-rental-v1", consultantName: "Ignored" }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ consultantName: "Ayşe Yılmaz", initials: "AY", contractCount: 2, latestContractDate: "2026-08-10" });
    expect(rows[0]?.contractAmountByCurrency).toEqual({ TRY: 1250000.5, USD: 100000 });
    expect(rows[0]?.serviceFeeByCurrency).toEqual({ TRY: 25000.5, USD: 2000 });
  });

  it("adds report totals without mixing currencies", () => {
    const rows = buildAuthorityPerformance([contract({ schema: "global1881-offline-authority-v2", consultantName: "A", price: "1000", currency: "TRY", serviceFeeAmount: "20" })]);
    expect(sumAuthorityPerformance(rows)).toEqual({ contractCount: 1, contractAmountByCurrency: { TRY: 1000 }, serviceFeeByCurrency: { TRY: 20 } });
  });
});
