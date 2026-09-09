import { describe, expect, it } from "vitest";
import {
  addOfficeShareTransfer,
  buildBudgetSummary,
  buildYearlyBudgetSummary,
  buildConsultantContributionRows,
  createBudgetExpense,
  createBudgetTransfer,
  createOfficeContribution,
  createMultiPartyOfficeContribution,
  defaultInternalControlSettings,
  verifyOfficeContribution,
  type InternalBudgetPlan,
} from "./internalControl";
import type { OfflineRecord } from "./offlineStore";

const record = (details: unknown, updatedAt = "2026-01-15T09:00:00.000Z"): OfflineRecord => ({
  id: `record-${updatedAt}`,
  entity: "internalControl",
  title: "İç denetim kaydı",
  details: JSON.stringify(details),
  status: "saved",
  deviceId: "device-test",
  updatedAt,
  userId: "broker-manager",
  recordVersion: 1,
});

describe("internalControl", () => {
  it("uses the approved 3.000 TL representation threshold and keeps lower records as normal actuals", () => {
    const settings = defaultInternalControlSettings();
    const lower = createBudgetExpense({ year: "2026", month: 1, occurredOn: "2026-01-15", categoryCode: "770.06", amount: 2_999, paymentSource: "cash", supplier: "Tedarikçi", reference: "MK-1", declaredBy: "assistant" }, settings);
    const threshold = createBudgetExpense({ year: "2026", month: 1, occurredOn: "2026-01-15", categoryCode: "770.06", amount: 3_000, paymentSource: "cash", supplier: "Tedarikçi", reference: "MK-2", declaredBy: "assistant" }, settings);

    expect(settings.representationThreshold).toBe(3_000);
    expect(lower).toMatchObject({ expenseKind: "actual", status: "declared" });
    expect(threshold).toMatchObject({ expenseKind: "commitment", status: "pendingApproval" });
  });

  it("shows original, transferred, revised, actual, commitment and remaining budget separately", () => {
    const plan: InternalBudgetPlan = { schema: "global1881-internal-budget-plan-v1", year: "2026", month: 1, categoryCode: "760.01", originalBudget: 10_000 };
    const records = [record(plan), record({ schema: "global1881-internal-budget-expense-v1", id: "expense-1", year: "2026", month: 1, occurredOn: "2026-01-11", categoryCode: "760.01", amount: 2_000, expenseKind: "actual", paymentSource: "bank", supplier: "Portal", reference: "EFT-1", status: "declared", declaredBy: "assistant" })];
    const initialSummary = buildBudgetSummary(records, "2026", 1);
    const transfer = createBudgetTransfer({ year: "2026", month: 1, sourceCategoryCode: "760.01", targetCategoryCode: "760.02", amount: 3_000, reason: "Kampanya ihtiyacı", transferredBy: "broker-manager", transferredAt: "2026-01-12" }, initialSummary);
    const summary = buildBudgetSummary([...records, record(transfer)], "2026", 1);
    const source = summary.find((row) => row.category.code === "760.01");
    const target = summary.find((row) => row.category.code === "760.02");

    expect(source).toMatchObject({ originalBudget: 10_000, transfersOut: 3_000, revisedBudget: 7_000, actual: 2_000, remaining: 5_000 });
    expect(target).toMatchObject({ originalBudget: 0, transfersIn: 3_000, revisedBudget: 3_000, remaining: 3_000 });
    expect(() => createBudgetTransfer({ year: "2026", month: 1, sourceCategoryCode: "760.01", targetCategoryCode: "760.02", amount: 5_001, reason: "Aşan aktarım", transferredBy: "broker-manager", transferredAt: "2026-01-12" }, summary)).toThrow("kullanılabilir kalan bütçesini aşamaz");
  });

  it("aggregates the annual plan while keeping monthly actuals attributable to their periods", () => {
    const january: InternalBudgetPlan = { schema: "global1881-internal-budget-plan-v1", year: "2026", month: 1, categoryCode: "770.01", originalBudget: 8_000 };
    const february: InternalBudgetPlan = { schema: "global1881-internal-budget-plan-v1", year: "2026", month: 2, categoryCode: "770.01", originalBudget: 9_000 };
    const februaryExpense = { schema: "global1881-internal-budget-expense-v1", id: "expense-february", year: "2026", month: 2, occurredOn: "2026-02-10", categoryCode: "770.01", amount: 8_500, expenseKind: "actual", paymentSource: "bank", supplier: "Mal Sahibi", reference: "EFT-02", status: "declared", declaredBy: "assistant" };
    const annual = buildYearlyBudgetSummary([record(january), record(february, "2026-02-01T09:00:00.000Z"), record(februaryExpense, "2026-02-10T09:00:00.000Z")], "2026");

    expect(annual.find((row) => row.category.code === "770.01")).toMatchObject({ originalBudget: 17_000, revisedBudget: 17_000, actual: 8_500, remaining: 8_500 });
  });

  it("splits only the KDV-excluded service fee at 60/40 and settles office cash without creating a second collection", () => {
    const settings = defaultInternalControlSettings();
    const contribution = createOfficeContribution({ sourceTransactionNo: "ISK-2026-001", consultantCode: "C-01", consultantName: "Danışman A", occurredOn: "2026-01-15", netServiceFee: 10_000, vatAmount: 2_000, collectionChannel: "externalCash", collectionReference: "NAKIT-15", declaredBy: "consultant-a" }, settings);
    const withCashTransfer = addOfficeShareTransfer(contribution, { amount: 4_000, transferredOn: "2026-01-16", treasuryAccountCode: "KASA-OFIS-01", receivedBy: "broker-manager", reference: "KASA-15", treasuryEntryRecordId: "ledger-office-share-1" });
    const verified = verifyOfficeContribution(withCashTransfer, "broker-manager", "Makbuz ve kasa teslimi kontrol edildi.");
    const duplicate = createOfficeContribution({ sourceTransactionNo: "ISK-2026-001", consultantCode: "C-01", consultantName: "Danışman A", occurredOn: "2026-01-16", netServiceFee: 10_000, vatAmount: 2_000, collectionChannel: "systemBank", collectionReference: "EFT-15", declaredBy: "consultant-a" }, settings);
    const rows = buildConsultantContributionRows([record(verified), record(duplicate, "2026-01-16T09:00:00.000Z")], "2026", 1);

    expect(contribution).toMatchObject({ consultantShare: 6_000, officeShare: 4_000, vatAmount: 2_000, collectionStatus: "declared" });
    expect(withCashTransfer.officeShareTransfers[0]).toMatchObject({ treasuryAccountCode: "KASA-OFIS-01", treasuryEntryRecordId: "ledger-office-share-1" });
    expect(verified.collectionStatus).toBe("officeShareSettled");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ netServiceFee: 20_000, externalCashDeclared: 10_000, systemCollected: 10_000, verifiedTotal: 10_000, consultantShare: 12_000, officeShareExpected: 8_000, officeShareReceived: 4_000, openOfficeShare: 4_000, duplicateRisk: true });
  });

  it("requires broker-manager evidence for a non-default contribution split", () => {
    expect(() => createOfficeContribution({ sourceTransactionNo: "ISK-2026-002", consultantCode: "C-02", consultantName: "Danışman B", occurredOn: "2026-01-18", netServiceFee: 10_000, vatAmount: 2_000, consultantRate: 50, officeRate: 50, collectionChannel: "systemBank", collectionReference: "EFT-18", declaredBy: "consultant-b" }, defaultInternalControlSettings())).toThrow("broker manager ve gerekçe zorunludur");
  });
});


  it("splits buyer and seller consultants plus an external office from the KDV-excluded fee", () => {
    const entry = createMultiPartyOfficeContribution({
      sourceTransactionNo: "SAT-2026-001",
      occurredOn: "2026-02-10",
      netServiceFee: 100_000,
      vatAmount: 20_000,
      collectionChannel: "systemBank",
      collectionReference: "EFT-SAT-1",
      declaredBy: "broker-manager",
      managerActor: "broker-manager",
      overrideReason: "Dış ofis işbirliği ve iki taraflı temsil paylaşımı",
      participants: [
        { type: "consultant", side: "buyer", code: "KT1", name: "Alıcı Danışmanı", rate: 30 },
        { type: "consultant", side: "seller", code: "IP1", name: "Satıcı Danışmanı", rate: 30 },
        { type: "externalOffice", side: "shared", code: "DIS-01", name: "Dış Ofis", rate: 40 },
      ],
    }, defaultInternalControlSettings());

    expect(entry.participants.map((item) => item.share)).toEqual([30_000, 30_000, 40_000]);
    expect(entry.consultantShare).toBe(60_000);
    expect(entry.global1881Share).toBe(60_000);
    expect(entry.externalOfficeShare).toBe(40_000);
    expect(entry.vatAmount).toBe(20_000);
  });

  it("requires manager evidence when a multi-party split differs from the 60/40 office rule", () => {
    expect(() => createMultiPartyOfficeContribution({
      sourceTransactionNo: "SAT-2026-002",
      occurredOn: "2026-02-11",
      netServiceFee: 100_000,
      vatAmount: 20_000,
      collectionChannel: "systemBank",
      collectionReference: "EFT-SAT-2",
      declaredBy: "broker-manager",
      participants: [
        { type: "consultant", side: "buyer", code: "KT1", name: "Alıcı Danışmanı", rate: 60 },
        { type: "consultant", side: "seller", code: "IP1", name: "Satıcı Danışmanı", rate: 40 },
      ],
    }, defaultInternalControlSettings())).toThrow("broker manager ve gerekçe zorunludur");
  });
