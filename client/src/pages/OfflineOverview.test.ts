import { describe, expect, it } from "vitest";
import { offlineOverviewCounts } from "./OfflineOverview";
import type { OfflineRecord } from "@/lib/offlineStore";

const record = (overrides: Partial<OfflineRecord>): OfflineRecord => ({
  id: "record-1",
  entity: "contract",
  title: "Kayıt",
  status: "pending",
  updatedAt: "2026-08-29T00:00:00.000Z",
  userId: "KT1",
  ...overrides,
});

describe("OfflineOverview", () => {
  it("yerel kayıt sayaçlarını Genel Bakış kartlarına güvenli biçimde bağlar", () => {
    expect(offlineOverviewCounts([
      record({ id: "contract-1", entity: "contract" }),
      record({ id: "transaction-1", entity: "transaction" }),
      record({ id: "open-1", entity: "obligation", dueDate: "2026-09-03" }),
      record({ id: "paid-1", entity: "obligation", status: "paid", dueDate: "2026-09-04" }),
      record({ id: "ledger-1", entity: "ledger", ledgerType: "income" }),
    ])).toEqual({ contracts: 2, openObligations: 1, ledger: 1 });
  });
});
