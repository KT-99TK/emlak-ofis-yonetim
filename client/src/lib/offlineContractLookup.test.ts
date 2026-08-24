import { describe, expect, it } from "vitest";
import { listOfflineContractLookups, searchOfflineContractLookups } from "./offlineContractLookup";

const record = (id: string, details: Record<string, unknown>) => ({ id, entity: "contract" as const, title: "Yerel sözleşme", details: JSON.stringify(details), status: "draft", deviceId: "device", updatedAt: "2026-08-24T10:00:00.000Z", userId: "cahit", recordVersion: 1 });

describe("offline contract lookup", () => {
  const rows = listOfflineContractLookups([
    record("authority", { schema: "global1881-offline-authority-v2", contractNo: "CY-2026-004", ownerName: "Mert Somuncu", contractDate: "2026-08-10" }),
    record("rental", { schema: "global1881-offline-rental-v6", contractNo: "KIR-2026-011", ownerName: "Ayşe Demir", tenantName: "Cahit Yılmaz", startDate: "2026-08-12" }),
  ]);

  it("extracts both authority owner and rental owner/tenant names without treating archive entries as active contracts", () => {
    expect(rows).toHaveLength(2);
    expect(rows.find((row) => row.recordId === "rental")?.customerNames).toEqual(["Cahit Yılmaz", "Ayşe Demir"]);
    expect(rows.find((row) => row.recordId === "authority")?.customerNames).toEqual(["Mert Somuncu"]);
  });

  it("keeps customer digital archive records out of active contract recall results", () => {
    const archiveOnly = { ...record("archive", { schema: "global1881-offline-contract-archive-v1", customerName: "Mert Somuncu" }), entity: "contractArchive" as const };
    expect(listOfflineContractLookups([archiveOnly])).toEqual([]);
  });

  it("finds the same offline contract by contract number or customer name and surname", () => {
    expect(searchOfflineContractLookups(rows, "KIR-2026-011").map((row) => row.recordId)).toEqual(["rental"]);
    expect(searchOfflineContractLookups(rows, "yılmaz").map((row) => row.recordId)).toEqual(["rental"]);
    expect(searchOfflineContractLookups(rows, "mert somuncu").map((row) => row.recordId)).toEqual(["authority"]);
  });
});
