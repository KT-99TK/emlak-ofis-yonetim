import { describe, expect, it } from "vitest";
import { buildDailyTreasuryControl, isOfficeRevenuePurpose, parseTreasuryEntry, TREASURY_ENTRY_SCHEMA, validateTreasuryEntry, type TreasuryEntry } from "./cashBankControl";

const entry = (partial: Partial<TreasuryEntry>): TreasuryEntry => ({
  schema: TREASURY_ENTRY_SCHEMA,
  id: "entry-1",
  occurredOn: "2026-08-24",
  treasuryAccountCode: "KASA-OFIS-01",
  direction: "in",
  purpose: "serviceFee",
  amount: 10000,
  currency: "TRY",
  payerOrPayee: "Örnek Müşteri",
  sourceTransactionNo: "ISK-2026-001",
  receiptOrBankReference: "NKT-2026-001",
  enteredBy: "i_parin",
  receivedBy: "i_parin",
  status: "managerVerified",
  ...partial,
});

describe("office cash and bank daily control", () => {
  it("keeps customer reservations out of office revenue while still tracking them in treasury", () => {
    const control = buildDailyTreasuryControl({
      date: "2026-08-24",
      openingBalances: { "KASA-OFIS-01": 2000 },
      reportedClosings: { "KASA-OFIS-01": 17000 },
      entries: [
        entry({ id: "fee", purpose: "serviceFee", amount: 10000 }),
        entry({ id: "reservation", purpose: "customerReservation", amount: 5000, receiptOrBankReference: "NKT-2026-002" }),
      ],
    });

    expect(control.officeRevenueCollected).toBe(10000);
    expect(control.customerReservationHeld).toBe(5000);
    expect(control.lines.find((line) => line.accountCode === "KASA-OFIS-01")).toMatchObject({ expectedClosing: 17000, difference: 0 });
    expect(isOfficeRevenuePurpose("customerReservation")).toBe(false);
  });

  it("flags transfer/makbuz and transaction linkage gaps before a cash entry is reconciled", () => {
    const errors = validateTreasuryEntry(entry({ purpose: "customerReservation", sourceTransactionNo: "", receiptOrBankReference: "", receivedBy: "" }));
    expect(errors.map((item) => item.message).join(" ")).toContain("makbuz");
    expect(errors.map((item) => item.message).join(" ")).toContain("işlem dosyasına");
  });

  it("does not include merely declared advisor entries in expected daily closing balance", () => {
    const control = buildDailyTreasuryControl({
      date: "2026-08-24",
      openingBalances: { "KASA-OFIS-01": 1000 },
      entries: [entry({ status: "declared", amount: 9000 })],
    });
    expect(control.lines.find((line) => line.accountCode === "KASA-OFIS-01")?.expectedClosing).toBe(1000);
    expect(control.exceptions.map((item) => item.message).join(" ")).toContain("manager doğrulaması bekliyor");
  });

  it("recognizes only explicit treasury ledger snapshots", () => {
    expect(parseTreasuryEntry({ entity: "ledger", details: JSON.stringify(entry({})) })?.purpose).toBe("serviceFee");
    expect(parseTreasuryEntry({ entity: "ledger", details: JSON.stringify({ schema: "another-ledger-entry" }) })).toBeNull();
  });
});
