import { describe, expect, it } from "vitest";
import { buildOfficeFlowData } from "./Home";
import homeSource from "./Home.tsx?raw";

describe("Home merkezi Ofis Akışı veri kaynağı", () => {
  it("merkezi obligations/contracts/ledger verisini açık işlem sayıları için hazırlar", () => {
    const result = buildOfficeFlowData({
      obligations: [
        { id: 1, title: "Gizli müşteri / adres", dueDate: "2026-08-29", status: "open" },
        { id: 2, title: "Ödenmiş kayıt", dueDate: "2026-08-29", status: "paid" },
      ],
      contracts: [
        { id: 11, status: "draft" },
        { id: 12, status: "active" },
      ],
      ledgerEntries: [
        { id: 21, entryType: "receivable", status: "pending" },
      ],
    });

    expect(result.openObligations).toHaveLength(1);
    expect(result.openObligations[0]?.title).toContain("Gizli müşteri");
    expect(result.contracts).toHaveLength(2);
    expect(result.ledgerEntries).toHaveLength(1);
  });

  it("Home route’unun OfficeFlowPanel verisini merkezi query’lerden bağladığını korur", () => {
    expect(homeSource).toContain("trpc.obligations.list.useQuery");
    expect(homeSource).toContain("trpc.contracts.list.useQuery");
    expect(homeSource).toContain("trpc.ledger.list.useQuery");
    expect(homeSource).toContain("obligations={officeFlowData.openObligations}");
    expect(homeSource).toContain("contracts={officeFlowData.contracts}");
    expect(homeSource).toContain("ledgerEntries={officeFlowData.ledgerEntries}");
  });
});
