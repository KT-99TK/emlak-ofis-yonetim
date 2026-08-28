// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { role: "admin", name: "Test Manager" }, loading: false }),
}));
vi.mock("@/components/OfflineOfficeFlowPanel", () => ({ default: () => null }));
vi.mock("@/lib/offlineStore", () => ({
  getUserId: () => "TEST-MANAGER",
  listOfflineRecords: vi.fn(async () => [{
    id: "transaction-record-1",
    entity: "transaction",
    title: "Kira işlem dosyası",
    userId: "TEST-MANAGER",
    recordVersion: 1,
    updatedAt: "2026-08-28T10:00:00.000Z",
    details: JSON.stringify({
      schema: "global1881-offline-transaction-v1",
      transactionNo: "ISK-2026-001",
      kind: "rental",
      sourceContractRecordId: "contract-1",
      sourceContractNo: "KOD-001",
      propertyLabel: "Urla · Merkez",
      consultantName: "Test Danışman",
      consultantCode: "TD1",
      ownerApproval: "approved",
      vatCollection: "separate",
      status: "collectionPending",
      collections: [{ id: "rent-1", category: "rentalFirstMonth", label: "İlk kira", payer: "tenant", expectedAmount: 10000, collectedAmount: 0, currency: "TRY", dueDate: "2026-09-15", state: "planned" }],
      events: [],
    }),
  }]),
}));

import OfflineTransactionClosings from "./OfflineTransactionClosings";

let root: Root | undefined;

describe("OfflineTransactionClosings tarih renderı", () => {
  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    document.body.innerHTML = "";
  });

  it("renders collection due dates as GG.AA.YYYY in the visible closing screen", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal("React", React);
    await act(async () => {
      root?.render(<OfflineTransactionClosings />);
      await Promise.resolve();
    });

    expect(container.textContent).toContain("15.09.2026");
    expect(container.textContent).not.toContain("2026-09-15");
  });
});
