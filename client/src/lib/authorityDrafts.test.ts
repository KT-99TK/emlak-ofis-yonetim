import { describe, expect, it } from "vitest";
import { filterOfflineAuthorityDrafts, listOfflineAuthorityDrafts } from "./authorityDrafts";
import type { OfflineRecord } from "./offlineStore";

function record(id: string, updatedAt: string, snapshot: Record<string, unknown>): OfflineRecord {
  return { id, entity: "contract", title: "Yetki", details: JSON.stringify(snapshot), status: "draft", deviceId: "device", userId: "advisor", recordVersion: 1, updatedAt };
}

describe("offline authority draft lookup", () => {
  it("reads old and current authority snapshots but excludes other contracts", () => {
    const drafts = listOfflineAuthorityDrafts([
      record("old", "2026-08-01T09:00:00.000Z", { schema: "global1881-offline-authority-v1", contractNo: "YET-2026-MS-001", ownerName: "mert somuncu", propertyAddress: "izmir alsancak", consultantName: "ayşe yılmaz" }),
      record("new", "2026-08-02T09:00:00.000Z", { schema: "global1881-offline-authority-v2", contractNo: "YET-2026-AY-002", ownerName: "deniz akın", propertyAddress: "ankara çankaya", consultantName: "ayşe yılmaz", currency: "TRY" }),
      record("rental", "2026-08-03T09:00:00.000Z", { schema: "global1881-offline-rental-v1", contractNo: "KIR-1" }),
    ]);
    expect(drafts.map((draft) => draft.recordId)).toEqual(["new", "old"]);
    expect(drafts[1]).toMatchObject({ contractNo: "YET-2026-MS-001", ownerName: "MERT SOMUNCU", propertyAddress: "İZMİR ALSANCAK" });
  });

  it("finds a prior draft by owner, address, consultant or number", () => {
    const drafts = listOfflineAuthorityDrafts([record("old", "2026-08-01T09:00:00.000Z", { schema: "global1881-offline-authority-v1", contractNo: "YET-2026-MS-001", ownerName: "Mert Somuncu", propertyAddress: "İzmir Alsancak", consultantName: "Ayşe Yılmaz" })]);
    expect(filterOfflineAuthorityDrafts(drafts, "Somuncu")).toHaveLength(1);
    expect(filterOfflineAuthorityDrafts(drafts, "YET-2026-MS")).toHaveLength(1);
    expect(filterOfflineAuthorityDrafts(drafts, "bulunmayan")).toHaveLength(0);
  });
});
