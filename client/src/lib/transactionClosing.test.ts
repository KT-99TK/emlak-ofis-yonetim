import { describe, expect, it } from "vitest";
import { addOptionalCollection, closeTransaction, createTransactionFromContract, declareCollection, transactionRisks, verifyCollection } from "./transactionClosing";
import type { OfflineRecord } from "./offlineStore";

const record = (details: object): OfflineRecord => ({ id: "contract-1", entity: "contract", title: "Sözleşme", details: JSON.stringify(details), status: "draft", deviceId: "device-1", updatedAt: "2026-08-23T10:00:00.000Z", userId: "deniz", recordVersion: 1 });

describe("offline transaction closing", () => {
  it("creates separate service fee and VAT collection items from a sales authority", () => {
    const source = record({ schema: "global1881-offline-authority-v2", contractNo: "YET-2026-DY-001", mode: "sale", price: "1.000.000", currency: "TRY", serviceFeeRate: "2", vatCollection: "separate", contractDate: "2026-08-23", consultantName: "Deniz Yılmaz", consultantCode: "DY" });
    const transaction = createTransactionFromContract(source, [source], "deniz");
    expect(transaction).toMatchObject({ transactionNo: "ISK-2026-001", kind: "sale", sourceContractNo: "YET-2026-DY-001" });
    expect(transaction?.collections.map((item) => [item.category, item.expectedAmount])).toEqual([["serviceFee", 20000], ["vat", 4000]]);
  });

  it("requires a documented collection before manager verification and supports a justified exception closure", () => {
    const source = record({ schema: "global1881-offline-authority-v2", contractNo: "YET-2026-DY-001", mode: "sale", price: "100000", currency: "TRY", serviceFeeRate: "2", vatCollection: "separate", contractDate: "2026-08-23", consultantName: "Deniz Yılmaz", consultantCode: "DY" });
    const draft = createTransactionFromContract(source, [source], "deniz")!;
    const fee = draft.collections[0]!;
    const declared = declareCollection(draft, fee.id, { collectedAmount: 1000, method: "bankTransfer", reference: "EFT-123", collectedAt: "2026-08-23" }, "deniz");
    expect(transactionRisks(declared).some((risk) => risk.severity === "critical")).toBe(true);
    expect(() => verifyCollection(declared, fee.id, "broker")).toThrow("Eksik tahsilat");
    expect(closeTransaction(declared, "broker", "Alıcı ile yazılı taksit mutabakatı yapıldı.").managerApproval?.decision).toBe("exception");
  });

  it("keeps the reservation payment optional until the consultant adds it", () => {
    const source = record({ schema: "global1881-offline-authority-v2", contractNo: "YET-2026-DY-001", mode: "sale", price: "100000", currency: "TRY", serviceFeeRate: "2", vatCollection: "included", contractDate: "2026-08-23", consultantName: "Deniz Yılmaz", consultantCode: "DY" });
    const draft = createTransactionFromContract(source, [source], "deniz")!;
    const withReservation = addOptionalCollection(draft, { category: "reservation", expectedAmount: 50000, dueDate: "2026-08-24" }, "deniz");
    expect(withReservation.collections.at(-1)).toMatchObject({ category: "reservation", expectedAmount: 50000, state: "planned" });
  });
});
