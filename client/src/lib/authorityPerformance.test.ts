import { describe, expect, it } from "vitest";
import { buildAuthorityPerformance, buildYearlyVatCollectionSummary, sumAuthorityPerformance } from "./authorityPerformance";
import type { OfflineRecord } from "./offlineStore";

function contract(snapshot: Record<string, unknown>): OfflineRecord {
  return { id: crypto.randomUUID(), entity: "contract", title: "Yetki", details: JSON.stringify(snapshot), status: "draft", deviceId: "device-1", userId: "manager", recordVersion: 1, updatedAt: "2026-08-23T00:00:00.000Z" };
}

describe("authority performance", () => {
  it("groups authority contracts by consultant and keeps currencies separate", () => {
    const rows = buildAuthorityPerformance([
      contract({ schema: "global1881-offline-authority-v2", mode: "sale", consultantName: "ayşe yılmaz", consultantCode: "D-01", contractDate: "2026-08-01", price: "1.250.000,50", currency: "TRY", serviceFeeAmount: "25000,50" }),
      contract({ schema: "global1881-offline-authority-v2", mode: "sale", consultantName: "Ayşe Yılmaz", consultantCode: "D-01", contractDate: "2026-08-10", price: "100000", currency: "USD", serviceFeeRate: "2" }),
      contract({ schema: "global1881-offline-rental-v2", consultantName: "Ayşe Yılmaz", consultantCode: "D-01", startDate: "2026-08-15", monthlyRent: "12000", vatCollection: "included" }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ consultantName: "Ayşe Yılmaz", initials: "AY", contractCount: 3, saleContractCount: 2, rentalContractCount: 1, latestContractDate: "2026-08-15" });
    expect(rows[0]?.contractAmountByCurrency).toEqual({ TRY: 1262001, USD: 100000 });
    expect(rows[0]?.serviceFeeByCurrency).toEqual({ TRY: 37001, USD: 2000 });
    expect(rows[0]?.absorbedVatLossByCurrency).toEqual({ TRY: 2000, USD: 0 });
  });

  it("adds report totals without mixing currencies", () => {
    const rows = buildAuthorityPerformance([contract({ schema: "global1881-offline-authority-v2", mode: "sale", consultantName: "A", price: "1000", currency: "TRY", serviceFeeAmount: "20" })]);
    expect(sumAuthorityPerformance(rows)).toEqual({ contractCount: 1, saleContractCount: 1, rentalContractCount: 0, contractAmountByCurrency: { TRY: 1000 }, serviceFeeByCurrency: { TRY: 20 }, expectedVatByCurrency: { TRY: 4 }, netServiceIncomeByCurrency: { TRY: 20 }, absorbedVatLossByCurrency: { TRY: 0 } });
  });

  it("does not count a rental authority as service fee revenue before a rental contract exists", () => {
    const rows = buildAuthorityPerformance([contract({ schema: "global1881-offline-authority-v2", mode: "rent", consultantName: "A", contractDate: "2026-08-01", price: "25000", serviceFeeAmount: "25000" })]);
    expect(rows).toEqual([]);
  });

  it("reports yearly KDV loss when collected total is invoiced as KDV included", () => {
    const yearly = buildYearlyVatCollectionSummary([contract({ schema: "global1881-offline-authority-v2", consultantName: "A", contractDate: "2026-02-01", mode: "sale", price: "500000", serviceFeeAmount: "10000", vatCollection: "included" })]);
    expect(yearly).toEqual([{ year: "2026", contractCount: 1, expectedVatByCurrency: { TRY: 2000 }, netServiceIncomeByCurrency: { TRY: 8333.33 }, absorbedVatLossByCurrency: { TRY: 1666.67 } }]);
  });
});
