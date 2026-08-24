import type { OfflineRecord } from "./offlineStore";

type ContractSnapshot = Record<string, unknown> & { schema?: string; contractNo?: string; ownerName?: string; tenantName?: string; contractDate?: string; startDate?: string };

export type OfflineContractLookup = {
  recordId: string;
  type: "authority" | "rental";
  contractNo: string;
  customerNames: string[];
  date: string;
  snapshot: ContractSnapshot;
};

function customerNames(snapshot: ContractSnapshot, type: OfflineContractLookup["type"]) {
  const values = type === "authority" ? [snapshot.ownerName] : [snapshot.tenantName, snapshot.ownerName];
  return Array.from(new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)));
}

/** Aktif sözleşme kayıtlarından numara ve müşteri adıyla çağırma listesi üretir; erişim filtresi çağıran ekranda uygulanır. */
export function listOfflineContractLookups(records: OfflineRecord[]): OfflineContractLookup[] {
  const rows: OfflineContractLookup[] = [];
  for (const record of records) {
    if (record.entity !== "contract") continue;
    try {
      const snapshot = JSON.parse(record.details) as ContractSnapshot;
      const schema = String(snapshot.schema ?? "");
      const type = schema.startsWith("global1881-offline-authority") ? "authority" : schema.startsWith("global1881-offline-rental") ? "rental" : null;
      if (!type) continue;
      rows.push({ recordId: record.id, type, contractNo: String(snapshot.contractNo ?? "").trim() || "Numarasız eski kayıt", customerNames: customerNames(snapshot, type), date: String(type === "authority" ? snapshot.contractDate ?? record.updatedAt.slice(0, 10) : snapshot.startDate ?? record.updatedAt.slice(0, 10)), snapshot });
    } catch {
      // Bozuk bir snapshot diğer offline sözleşme kayıtlarını gizlemez.
    }
  }
  return rows.sort((left, right) => right.date.localeCompare(left.date));
}

export function searchOfflineContractLookups(rows: OfflineContractLookup[], query: string) {
  const needle = query.trim().toLocaleLowerCase("tr-TR");
  if (!needle) return rows;
  return rows.filter((row) => `${row.contractNo} ${row.customerNames.join(" ")}`.toLocaleLowerCase("tr-TR").includes(needle));
}
