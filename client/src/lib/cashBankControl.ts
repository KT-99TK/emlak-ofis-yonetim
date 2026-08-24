export const CASH_BANK_CONTROL_SCHEMA = "global1881-office-cash-bank-v1";
export const TREASURY_ENTRY_SCHEMA = "global1881-office-treasury-entry-v1";

export type TreasuryAccountKind = "cash" | "bank";
export type TreasuryPurpose =
  | "customerReservation"
  | "serviceFee"
  | "vat"
  | "officeExpense"
  | "consultantAdvance"
  | "consultantSettlement"
  | "customerRefund"
  | "other";
export type TreasuryEntryStatus = "declared" | "managerVerified" | "bankMatched" | "reconciled" | "voided";
export type TreasuryDirection = "in" | "out";

export type TreasuryAccount = {
  code: string;
  label: string;
  kind: TreasuryAccountKind;
  currency: "TRY" | "USD" | "EUR";
  active: boolean;
};

export const officeTreasuryPlan: TreasuryAccount[] = [
  { code: "KASA-OFIS-01", label: "Ofis Nakit Kasası", kind: "cash", currency: "TRY", active: true },
  { code: "BANKA-OFIS-01", label: "Ofis Ana Banka Hesabı", kind: "bank", currency: "TRY", active: true },
];

export const treasuryPurposeLabels: Record<TreasuryPurpose, string> = {
  customerReservation: "Müşteri kaporası / emanet",
  serviceFee: "Hizmet bedeli tahsilatı",
  vat: "KDV tahsilatı",
  officeExpense: "Ofis harcaması",
  consultantAdvance: "Danışman avansı",
  consultantSettlement: "Danışman mahsup / ödemesi",
  customerRefund: "Müşteri iadesi",
  other: "Diğer",
};

export type TreasuryEntry = {
  schema: typeof TREASURY_ENTRY_SCHEMA;
  id: string;
  occurredOn: string;
  treasuryAccountCode: string;
  direction: TreasuryDirection;
  purpose: TreasuryPurpose;
  amount: number;
  currency: "TRY" | "USD" | "EUR";
  payerOrPayee: string;
  sourceTransactionNo?: string;
  collectionReference?: string;
  receiptOrBankReference?: string;
  enteredBy: string;
  receivedBy?: string;
  status: TreasuryEntryStatus;
  note?: string;
};

export function parseTreasuryEntry(record: { entity: string; details: string }): TreasuryEntry | null {
  if (record.entity !== "ledger") return null;
  try {
    const raw = JSON.parse(record.details) as Partial<TreasuryEntry>;
    if (raw.schema !== TREASURY_ENTRY_SCHEMA || typeof raw.id !== "string" || typeof raw.occurredOn !== "string" || typeof raw.treasuryAccountCode !== "string" || (raw.direction !== "in" && raw.direction !== "out") || !raw.purpose || !raw.currency || typeof raw.payerOrPayee !== "string" || typeof raw.enteredBy !== "string" || !raw.status) return null;
    if (!["customerReservation", "serviceFee", "vat", "officeExpense", "consultantAdvance", "consultantSettlement", "customerRefund", "other"].includes(raw.purpose)) return null;
    if (!["declared", "managerVerified", "bankMatched", "reconciled", "voided"].includes(raw.status)) return null;
    return { schema: TREASURY_ENTRY_SCHEMA, id: raw.id, occurredOn: raw.occurredOn, treasuryAccountCode: raw.treasuryAccountCode, direction: raw.direction, purpose: raw.purpose as TreasuryPurpose, amount: roundedAmount(Number(raw.amount)), currency: raw.currency === "USD" || raw.currency === "EUR" ? raw.currency : "TRY", payerOrPayee: raw.payerOrPayee, sourceTransactionNo: raw.sourceTransactionNo, collectionReference: raw.collectionReference, receiptOrBankReference: raw.receiptOrBankReference, enteredBy: raw.enteredBy, receivedBy: raw.receivedBy, status: raw.status as TreasuryEntryStatus, note: raw.note };
  } catch {
    return null;
  }
}

export type TreasuryControlException = {
  severity: "critical" | "warning";
  entryId?: string;
  message: string;
};

export type DailyTreasuryLine = {
  accountCode: string;
  accountLabel: string;
  kind: TreasuryAccountKind;
  currency: TreasuryAccount["currency"];
  openingBalance: number;
  verifiedInflow: number;
  verifiedOutflow: number;
  expectedClosing: number;
  reportedClosing?: number;
  difference?: number;
};

export type DailyTreasuryControl = {
  date: string;
  lines: DailyTreasuryLine[];
  exceptions: TreasuryControlException[];
  officeRevenueCollected: number;
  customerReservationHeld: number;
};

const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const roundedAmount = (value: number) => Math.round(Number(value) || 0);

/** Kapora/emanet ofis geliri değildir; yalnız nakit ve banka kontrolünde ayrı amaçla izlenir. */
export function isOfficeRevenuePurpose(purpose: TreasuryPurpose) {
  return purpose === "serviceFee";
}

export function validateTreasuryEntry(entry: TreasuryEntry, accounts = officeTreasuryPlan): TreasuryControlException[] {
  const errors: TreasuryControlException[] = [];
  const account = accounts.find((item) => item.code === entry.treasuryAccountCode && item.active);
  if (!account) errors.push({ severity: "critical", entryId: entry.id, message: "Aktif kasa/banka hesabı seçilmelidir." });
  if (!isDate(entry.occurredOn)) errors.push({ severity: "critical", entryId: entry.id, message: "İşlem tarihi GG.AA.YYYY ekranda, ISO biçiminde kayıtta zorunludur." });
  if (roundedAmount(entry.amount) <= 0) errors.push({ severity: "critical", entryId: entry.id, message: "Tutar sıfırdan büyük olmalıdır." });
  if (!entry.payerOrPayee.trim()) errors.push({ severity: "critical", entryId: entry.id, message: "Tahsil eden/ödeyen müşteri veya kişi bilgisi zorunludur." });
  if (!entry.enteredBy.trim()) errors.push({ severity: "critical", entryId: entry.id, message: "Kaydı giren kullanıcı zorunludur." });
  if (entry.status !== "voided" && !entry.receiptOrBankReference?.trim()) {
    errors.push({ severity: "critical", entryId: entry.id, message: "Nakit makbuz veya banka transfer referansı zorunludur." });
  }
  if (account && account.kind === "cash" && entry.direction === "in" && !entry.receivedBy?.trim()) {
    errors.push({ severity: "warning", entryId: entry.id, message: "Nakit tahsilatta teslim alan kişi kaydı önerilir." });
  }
  if (entry.purpose === "customerReservation" && !entry.sourceTransactionNo?.trim()) {
    errors.push({ severity: "critical", entryId: entry.id, message: "Kapora/emanet kaydı bir işlem dosyasına bağlanmalıdır." });
  }
  return errors;
}

/**
 * Gün sonu kontrolü yalnız doğrulanmış/banka eşleşmiş/mutabık hareketleri beklenen bakiyeye katar.
 * Beyan edilmiş veya belgesiz kayıtlar istisna olarak kalır; fiziksel sayım ya da banka ekstresi farkı görünürdür.
 */
export function buildDailyTreasuryControl(input: {
  date: string;
  entries: TreasuryEntry[];
  openingBalances: Record<string, number | undefined>;
  reportedClosings?: Record<string, number | undefined>;
  accounts?: TreasuryAccount[];
}): DailyTreasuryControl {
  const accounts = input.accounts ?? officeTreasuryPlan;
  const exceptions: TreasuryControlException[] = [];
  const lines = accounts.filter((account) => account.active).map((account) => {
    const movements = input.entries.filter((entry) => entry.occurredOn === input.date && entry.treasuryAccountCode === account.code && entry.status !== "voided");
    movements.forEach((entry) => exceptions.push(...validateTreasuryEntry(entry, accounts)));
    const settled = movements.filter((entry) => ["managerVerified", "bankMatched", "reconciled"].includes(entry.status));
    movements.filter((entry) => entry.status === "declared").forEach((entry) => {
      exceptions.push({ severity: "warning", entryId: entry.id, message: "Danışman beyanı manager doğrulaması bekliyor." });
    });
    const verifiedInflow = settled.filter((entry) => entry.direction === "in").reduce((sum, entry) => sum + roundedAmount(entry.amount), 0);
    const verifiedOutflow = settled.filter((entry) => entry.direction === "out").reduce((sum, entry) => sum + roundedAmount(entry.amount), 0);
    const openingBalance = roundedAmount(input.openingBalances[account.code] ?? 0);
    const expectedClosing = openingBalance + verifiedInflow - verifiedOutflow;
    const reported = input.reportedClosings?.[account.code];
    const reportedClosing = reported === undefined ? undefined : roundedAmount(reported);
    const difference = reportedClosing === undefined ? undefined : reportedClosing - expectedClosing;
    if (difference && difference !== 0) {
      exceptions.push({ severity: "critical", message: `${account.label} gün sonu farkı: ${new Intl.NumberFormat("tr-TR").format(difference)} ${account.currency}.` });
    }
    return { accountCode: account.code, accountLabel: account.label, kind: account.kind, currency: account.currency, openingBalance, verifiedInflow, verifiedOutflow, expectedClosing, reportedClosing, difference };
  });

  const settledToday = input.entries.filter((entry) => entry.occurredOn === input.date && ["managerVerified", "bankMatched", "reconciled"].includes(entry.status));
  const officeRevenueCollected = settledToday.filter((entry) => entry.direction === "in" && isOfficeRevenuePurpose(entry.purpose)).reduce((sum, entry) => sum + roundedAmount(entry.amount), 0);
  const customerReservationHeld = settledToday.filter((entry) => entry.direction === "in" && entry.purpose === "customerReservation").reduce((sum, entry) => sum + roundedAmount(entry.amount), 0);
  return { date: input.date, lines, exceptions, officeRevenueCollected, customerReservationHeld };
}
