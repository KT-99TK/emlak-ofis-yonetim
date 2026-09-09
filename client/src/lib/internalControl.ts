import type { OfflineRecord } from "./offlineStore";

export const INTERNAL_CONTROL_ENTITY = "internalControl" as const;
export const INTERNAL_CONTROL_SETTINGS_SCHEMA = "global1881-internal-control-settings-v1" as const;
export const INTERNAL_BUDGET_PLAN_SCHEMA = "global1881-internal-budget-plan-v1" as const;
export const INTERNAL_BUDGET_EXPENSE_SCHEMA = "global1881-internal-budget-expense-v1" as const;
export const INTERNAL_BUDGET_TRANSFER_SCHEMA = "global1881-internal-budget-transfer-v1" as const;
export const OFFICE_CONTRIBUTION_SCHEMA = "global1881-office-contribution-v1" as const;
export const INTERNAL_VAT_REFERENCE_SCHEMA = "global1881-internal-vat-reference-v1" as const;

export type InternalControlScope = "contributions" | "officeIncome" | "personnelExpenses" | "officeExpenses" | "all";
export type BudgetGroup = "officeExpense" | "personnelExpense" | "financeExpense";
export type PaymentSource = "cash" | "bank" | "card" | "external";
export type InternalExpenseKind = "actual" | "commitment";
export type InternalExpenseStatus = "declared" | "pendingApproval" | "approved" | "rejected";
export type ContributionChannel = "systemCash" | "systemBank" | "systemCard" | "externalCash";
export type ContributionStatus = "declared" | "verified" | "officeShareSettled" | "rejected";

export type InternalBudgetCategory = {
  code: string;
  accountGroup: string;
  label: string;
  group: BudgetGroup;
  representation?: boolean;
};

export const internalBudgetCategories: InternalBudgetCategory[] = [
  { code: "760.01", accountGroup: "760 · Pazarlama", label: "İlan portalları ve abonelikleri", group: "officeExpense" },
  { code: "760.02", accountGroup: "760 · Pazarlama", label: "Sosyal medya reklamları", group: "officeExpense" },
  { code: "760.03", accountGroup: "760 · Pazarlama", label: "Branda, tabela, baskı ve görsel üretim", group: "officeExpense" },
  { code: "760.04", accountGroup: "760 · Pazarlama", label: "Dijital lead, CRM ve tanıtım servisleri", group: "officeExpense" },
  { code: "760.05", accountGroup: "760 · Pazarlama", label: "Etkinlik, sponsorluk ve portföy tanıtımı", group: "officeExpense" },
  { code: "770.01", accountGroup: "770 · Genel Yönetim", label: "Ofis kira ve aidatı", group: "officeExpense" },
  { code: "770.02", accountGroup: "770 · Genel Yönetim", label: "Elektrik, su, doğalgaz, internet ve telefon", group: "officeExpense" },
  { code: "770.03", accountGroup: "770 · Genel Yönetim", label: "Kırtasiye, temizlik ve ofis sarfı", group: "officeExpense" },
  { code: "770.04", accountGroup: "770 · Genel Yönetim", label: "Yazılım, lisans ve kurumsal abonelikler", group: "officeExpense" },
  { code: "770.05", accountGroup: "770 · Genel Yönetim", label: "Mali müşavir, hukuk ve dış hizmetler", group: "officeExpense" },
  { code: "770.06", accountGroup: "770 · Genel Yönetim", label: "Temsil, ağırlama ve ikram", group: "officeExpense", representation: true },
  { code: "770.07", accountGroup: "770 · Genel Yönetim", label: "Bakım, onarım, güvenlik ve ofis hizmetleri", group: "officeExpense" },
  { code: "PERS.01", accountGroup: "Personel bütçesi", label: "Maaş, prim, yemek, ulaşım ve yan haklar", group: "personnelExpense" },
  { code: "780.01", accountGroup: "780 · Finansman", label: "Kredi, faiz ve finansman maliyetleri", group: "financeExpense" },
];

export const internalScopeLabels: Record<InternalControlScope, string> = {
  contributions: "Danışman ↔ Ofis Pay Hareketleri",
  officeIncome: "Ofis Gelirleri",
  personnelExpenses: "Personel Giderleri",
  officeExpenses: "Ofis Giderleri",
  all: "Tümü",
};

export type InternalControlSettings = {
  schema: typeof INTERNAL_CONTROL_SETTINGS_SCHEMA;
  representationThreshold: number;
  defaultConsultantRate: number;
  defaultOfficeRate: number;
};

export const defaultInternalControlSettings = (): InternalControlSettings => ({
  schema: INTERNAL_CONTROL_SETTINGS_SCHEMA,
  representationThreshold: 3_000,
  defaultConsultantRate: 60,
  defaultOfficeRate: 40,
});

export type InternalBudgetPlan = {
  schema: typeof INTERNAL_BUDGET_PLAN_SCHEMA;
  year: string;
  month: number;
  categoryCode: string;
  originalBudget: number;
  note?: string;
};

export type InternalBudgetExpense = {
  schema: typeof INTERNAL_BUDGET_EXPENSE_SCHEMA;
  id: string;
  year: string;
  month: number;
  occurredOn: string;
  categoryCode: string;
  amount: number;
  expenseKind: InternalExpenseKind;
  paymentSource: PaymentSource;
  supplier: string;
  reference: string;
  dueDate?: string;
  status: InternalExpenseStatus;
  declaredBy: string;
  note?: string;
  managerApproval?: { by: string; at: string; note: string };
};

export type InternalBudgetTransfer = {
  schema: typeof INTERNAL_BUDGET_TRANSFER_SCHEMA;
  id: string;
  year: string;
  month: number;
  sourceCategoryCode: string;
  targetCategoryCode: string;
  amount: number;
  reason: string;
  transferredBy: string;
  transferredAt: string;
};

export type OfficeShareTransfer = {
  id: string;
  amount: number;
  transferredOn: string;
  treasuryAccountCode: string;
  receivedBy: string;
  reference?: string;
  treasuryEntryRecordId?: string;
};

export type OfficeContribution = {
  schema: typeof OFFICE_CONTRIBUTION_SCHEMA;
  id: string;
  sourceTransactionNo: string;
  sourceContractNo?: string;
  consultantUserId?: string;
  consultantCode: string;
  consultantName: string;
  occurredOn: string;
  netServiceFee: number;
  vatAmount: number;
  consultantRate: number;
  officeRate: number;
  consultantShare: number;
  officeShare: number;
  collectionChannel: ContributionChannel;
  collectionStatus: ContributionStatus;
  collectionReference: string;
  declaredBy: string;
  note?: string;
  rateOverride?: { by: string; at: string; reason: string };
  managerVerification?: { by: string; at: string; note: string };
  officeShareTransfers: OfficeShareTransfer[];
};

export type InternalVatReference = {
  schema: typeof INTERNAL_VAT_REFERENCE_SCHEMA;
  year: string;
  month: number;
  collectedVat: number;
  accountantConfirmedPaidOrOffset: number;
  accountantReference: string;
  note?: string;
};

export type InternalControlRecord = InternalControlSettings | InternalBudgetPlan | InternalBudgetExpense | InternalBudgetTransfer | OfficeContribution | InternalVatReference;

const rounded = (value: unknown) => Math.max(0, Math.round(Number(value) || 0));
const isMonth = (value: unknown): value is number => Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 12;
const isDate = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
const knownCategory = (code: unknown): code is string => typeof code === "string" && internalBudgetCategories.some((category) => category.code === code);
const isInternalControlRecord = (record: OfflineRecord) => record.entity === INTERNAL_CONTROL_ENTITY;
const nextId = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function parseJson(record: OfflineRecord): Record<string, unknown> | null {
  if (!isInternalControlRecord(record)) return null;
  try {
    const parsed = JSON.parse(record.details) as unknown;
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function parseInternalControlSettings(record: OfflineRecord): InternalControlSettings | null {
  const raw = parseJson(record);
  if (!raw || raw.schema !== INTERNAL_CONTROL_SETTINGS_SCHEMA) return null;
  const consultantRate = rounded(raw.defaultConsultantRate);
  const officeRate = rounded(raw.defaultOfficeRate);
  if (!consultantRate || !officeRate || consultantRate + officeRate !== 100) return null;
  return { schema: INTERNAL_CONTROL_SETTINGS_SCHEMA, representationThreshold: rounded(raw.representationThreshold) || 3_000, defaultConsultantRate: consultantRate, defaultOfficeRate: officeRate };
}

export function parseInternalBudgetPlan(record: OfflineRecord): InternalBudgetPlan | null {
  const raw = parseJson(record);
  if (!raw || raw.schema !== INTERNAL_BUDGET_PLAN_SCHEMA || typeof raw.year !== "string" || !isMonth(raw.month) || !knownCategory(raw.categoryCode)) return null;
  return { schema: INTERNAL_BUDGET_PLAN_SCHEMA, year: raw.year, month: raw.month, categoryCode: raw.categoryCode, originalBudget: rounded(raw.originalBudget), note: typeof raw.note === "string" ? raw.note : undefined };
}

export function parseInternalBudgetExpense(record: OfflineRecord): InternalBudgetExpense | null {
  const raw = parseJson(record);
  if (!raw || raw.schema !== INTERNAL_BUDGET_EXPENSE_SCHEMA || typeof raw.id !== "string" || typeof raw.year !== "string" || !isMonth(raw.month) || !isDate(raw.occurredOn) || !knownCategory(raw.categoryCode) || typeof raw.supplier !== "string" || typeof raw.reference !== "string" || typeof raw.declaredBy !== "string") return null;
  if (raw.expenseKind !== "actual" && raw.expenseKind !== "commitment") return null;
  if (raw.paymentSource !== "cash" && raw.paymentSource !== "bank" && raw.paymentSource !== "card" && raw.paymentSource !== "external") return null;
  if (raw.status !== "declared" && raw.status !== "pendingApproval" && raw.status !== "approved" && raw.status !== "rejected") return null;
  return { schema: INTERNAL_BUDGET_EXPENSE_SCHEMA, id: raw.id, year: raw.year, month: raw.month, occurredOn: raw.occurredOn, categoryCode: raw.categoryCode, amount: rounded(raw.amount), expenseKind: raw.expenseKind, paymentSource: raw.paymentSource, supplier: raw.supplier, reference: raw.reference, dueDate: isDate(raw.dueDate) ? raw.dueDate : undefined, status: raw.status, declaredBy: raw.declaredBy, note: typeof raw.note === "string" ? raw.note : undefined, managerApproval: raw.managerApproval && typeof raw.managerApproval === "object" ? raw.managerApproval as InternalBudgetExpense["managerApproval"] : undefined };
}

export function parseInternalBudgetTransfer(record: OfflineRecord): InternalBudgetTransfer | null {
  const raw = parseJson(record);
  if (!raw || raw.schema !== INTERNAL_BUDGET_TRANSFER_SCHEMA || typeof raw.id !== "string" || typeof raw.year !== "string" || !isMonth(raw.month) || !knownCategory(raw.sourceCategoryCode) || !knownCategory(raw.targetCategoryCode) || raw.sourceCategoryCode === raw.targetCategoryCode || typeof raw.reason !== "string" || !raw.reason.trim() || typeof raw.transferredBy !== "string" || !isDate(raw.transferredAt)) return null;
  return { schema: INTERNAL_BUDGET_TRANSFER_SCHEMA, id: raw.id, year: raw.year, month: raw.month, sourceCategoryCode: raw.sourceCategoryCode, targetCategoryCode: raw.targetCategoryCode, amount: rounded(raw.amount), reason: raw.reason.trim(), transferredBy: raw.transferredBy, transferredAt: raw.transferredAt };
}

export function parseOfficeContribution(record: OfflineRecord): OfficeContribution | null {
  const raw = parseJson(record);
  if (!raw || raw.schema !== OFFICE_CONTRIBUTION_SCHEMA || typeof raw.id !== "string" || typeof raw.sourceTransactionNo !== "string" || !raw.sourceTransactionNo.trim() || typeof raw.consultantCode !== "string" || typeof raw.consultantName !== "string" || !isDate(raw.occurredOn) || typeof raw.collectionReference !== "string" || typeof raw.declaredBy !== "string") return null;
  if (raw.collectionChannel !== "systemCash" && raw.collectionChannel !== "systemBank" && raw.collectionChannel !== "systemCard" && raw.collectionChannel !== "externalCash") return null;
  if (raw.collectionStatus !== "declared" && raw.collectionStatus !== "verified" && raw.collectionStatus !== "officeShareSettled" && raw.collectionStatus !== "rejected") return null;
  const consultantRate = rounded(raw.consultantRate);
  const officeRate = rounded(raw.officeRate);
  if (consultantRate + officeRate !== 100) return null;
  const netServiceFee = rounded(raw.netServiceFee);
  const consultantShare = rounded(raw.consultantShare);
  const officeShare = rounded(raw.officeShare);
  if (!netServiceFee || consultantShare + officeShare !== netServiceFee) return null;
  const officeShareTransfers = Array.isArray(raw.officeShareTransfers) ? raw.officeShareTransfers.flatMap((transfer) => {
    const item = transfer as Partial<OfficeShareTransfer>;
    return typeof item.id === "string" && rounded(item.amount) > 0 && isDate(item.transferredOn) && typeof item.treasuryAccountCode === "string" && typeof item.receivedBy === "string" ? [{ id: item.id, amount: rounded(item.amount), transferredOn: item.transferredOn, treasuryAccountCode: item.treasuryAccountCode, receivedBy: item.receivedBy, reference: typeof item.reference === "string" ? item.reference : undefined, treasuryEntryRecordId: typeof item.treasuryEntryRecordId === "string" ? item.treasuryEntryRecordId : undefined }] : [];
  }) : [];
  return { schema: OFFICE_CONTRIBUTION_SCHEMA, id: raw.id, sourceTransactionNo: raw.sourceTransactionNo.trim(), sourceContractNo: typeof raw.sourceContractNo === "string" ? raw.sourceContractNo : undefined, consultantUserId: typeof raw.consultantUserId === "string" ? raw.consultantUserId : undefined, consultantCode: raw.consultantCode, consultantName: raw.consultantName, occurredOn: raw.occurredOn, netServiceFee, vatAmount: rounded(raw.vatAmount), consultantRate, officeRate, consultantShare, officeShare, collectionChannel: raw.collectionChannel, collectionStatus: raw.collectionStatus, collectionReference: raw.collectionReference, declaredBy: raw.declaredBy, note: typeof raw.note === "string" ? raw.note : undefined, rateOverride: raw.rateOverride && typeof raw.rateOverride === "object" ? raw.rateOverride as OfficeContribution["rateOverride"] : undefined, managerVerification: raw.managerVerification && typeof raw.managerVerification === "object" ? raw.managerVerification as OfficeContribution["managerVerification"] : undefined, officeShareTransfers };
}

export function parseInternalVatReference(record: OfflineRecord): InternalVatReference | null {
  const raw = parseJson(record);
  if (!raw || raw.schema !== INTERNAL_VAT_REFERENCE_SCHEMA || typeof raw.year !== "string" || !isMonth(raw.month) || typeof raw.accountantReference !== "string") return null;
  return { schema: INTERNAL_VAT_REFERENCE_SCHEMA, year: raw.year, month: raw.month, collectedVat: rounded(raw.collectedVat), accountantConfirmedPaidOrOffset: rounded(raw.accountantConfirmedPaidOrOffset), accountantReference: raw.accountantReference, note: typeof raw.note === "string" ? raw.note : undefined };
}

export function currentInternalControlSettings(records: OfflineRecord[]) {
  const latest = records.flatMap((record) => {
    const settings = parseInternalControlSettings(record);
    return settings ? [{ record, settings }] : [];
  }).sort((left, right) => right.record.updatedAt.localeCompare(left.record.updatedAt))[0];
  return latest?.settings ?? defaultInternalControlSettings();
}

export function createBudgetExpense(input: Omit<InternalBudgetExpense, "schema" | "id" | "status" | "expenseKind"> & { expenseKind?: InternalExpenseKind }, settings: InternalControlSettings): InternalBudgetExpense {
  const category = internalBudgetCategories.find((item) => item.code === input.categoryCode);
  if (!category) throw new Error("Geçerli bir iç denetim bütçe kodu seçin.");
  const amount = rounded(input.amount);
  if (!amount || !input.supplier.trim() || !input.reference.trim() || !input.declaredBy.trim()) throw new Error("Tutar, tedarikçi/kişi, belge referansı ve kaydı giren kullanıcı zorunludur.");
  const requiresApproval = Boolean(category.representation && amount >= settings.representationThreshold);
  return { ...input, schema: INTERNAL_BUDGET_EXPENSE_SCHEMA, id: nextId(), amount, supplier: input.supplier.trim(), reference: input.reference.trim(), declaredBy: input.declaredBy.trim(), expenseKind: requiresApproval ? "commitment" : input.expenseKind ?? "actual", status: requiresApproval ? "pendingApproval" : "declared", note: input.note?.trim() || undefined };
}

export function approveBudgetExpense(expense: InternalBudgetExpense, actor: string, approved: boolean, note: string) {
  if (!actor.trim() || !note.trim()) throw new Error("Broker manager kullanıcı bilgisi ve onay/ret notu zorunludur.");
  return { ...expense, status: approved ? "approved" as const : "rejected" as const, expenseKind: approved && expense.status === "pendingApproval" ? "actual" as const : expense.expenseKind, managerApproval: { by: actor.trim(), at: new Date().toISOString(), note: note.trim() } };
}

export type BudgetSummaryRow = {
  category: InternalBudgetCategory;
  originalBudget: number;
  transfersIn: number;
  transfersOut: number;
  revisedBudget: number;
  actual: number;
  commitment: number;
  pendingApproval: number;
  remaining: number;
};

export function buildBudgetSummary(records: OfflineRecord[], year: string, month: number): BudgetSummaryRow[] {
  const latestPlans = new Map<string, { plan: InternalBudgetPlan; updatedAt: string }>();
  records.forEach((record) => {
    const plan = parseInternalBudgetPlan(record);
    if (!plan || plan.year !== year || plan.month !== month) return;
    const current = latestPlans.get(plan.categoryCode);
    if (!current || record.updatedAt > current.updatedAt) latestPlans.set(plan.categoryCode, { plan, updatedAt: record.updatedAt });
  });
  const expenses = records.flatMap((record) => {
    const expense = parseInternalBudgetExpense(record);
    return expense && expense.year === year && expense.month === month ? [expense] : [];
  });
  const transfers = records.flatMap((record) => {
    const transfer = parseInternalBudgetTransfer(record);
    return transfer && transfer.year === year && transfer.month === month ? [transfer] : [];
  });
  return internalBudgetCategories.map((category) => {
    const originalBudget = latestPlans.get(category.code)?.plan.originalBudget ?? 0;
    const transfersIn = transfers.filter((transfer) => transfer.targetCategoryCode === category.code).reduce((sum, transfer) => sum + transfer.amount, 0);
    const transfersOut = transfers.filter((transfer) => transfer.sourceCategoryCode === category.code).reduce((sum, transfer) => sum + transfer.amount, 0);
    const categoryExpenses = expenses.filter((expense) => expense.categoryCode === category.code && expense.status !== "rejected");
    const actual = categoryExpenses.filter((expense) => expense.expenseKind === "actual" && expense.status !== "pendingApproval").reduce((sum, expense) => sum + expense.amount, 0);
    const commitment = categoryExpenses.filter((expense) => expense.expenseKind === "commitment" || expense.status === "pendingApproval").reduce((sum, expense) => sum + expense.amount, 0);
    const pendingApproval = categoryExpenses.filter((expense) => expense.status === "pendingApproval").reduce((sum, expense) => sum + expense.amount, 0);
    const revisedBudget = originalBudget + transfersIn - transfersOut;
    return { category, originalBudget, transfersIn, transfersOut, revisedBudget, actual, commitment, pendingApproval, remaining: revisedBudget - actual - commitment };
  });
}

/** Yıl görünümü, her ayın ilk planını ve o aya bağlı aktarım/gider kayıtlarını toplar; resmî muhasebe fişi üretmez. */
export function buildYearlyBudgetSummary(records: OfflineRecord[], year: string): BudgetSummaryRow[] {
  const monthly = Array.from({ length: 12 }, (_, index) => buildBudgetSummary(records, year, index + 1));
  return internalBudgetCategories.map((category) => monthly.reduce((total, rows) => {
    const row = rows.find((item) => item.category.code === category.code)!;
    return { category, originalBudget: total.originalBudget + row.originalBudget, transfersIn: total.transfersIn + row.transfersIn, transfersOut: total.transfersOut + row.transfersOut, revisedBudget: total.revisedBudget + row.revisedBudget, actual: total.actual + row.actual, commitment: total.commitment + row.commitment, pendingApproval: total.pendingApproval + row.pendingApproval, remaining: total.remaining + row.remaining };
  }, { category, originalBudget: 0, transfersIn: 0, transfersOut: 0, revisedBudget: 0, actual: 0, commitment: 0, pendingApproval: 0, remaining: 0 } satisfies BudgetSummaryRow));
}

export function createBudgetTransfer(input: Omit<InternalBudgetTransfer, "schema" | "id">, summary: BudgetSummaryRow[]): InternalBudgetTransfer {
  if (input.sourceCategoryCode === input.targetCategoryCode) throw new Error("Kaynak ve hedef bütçe faslı aynı olamaz.");
  if (!knownCategory(input.sourceCategoryCode) || !knownCategory(input.targetCategoryCode)) throw new Error("Geçerli kaynak ve hedef bütçe faslı seçin.");
  const amount = rounded(input.amount);
  if (!amount || !input.reason.trim() || !input.transferredBy.trim()) throw new Error("Aktarım tutarı, gerekçesi ve broker manager kullanıcı bilgisi zorunludur.");
  const source = summary.find((row) => row.category.code === input.sourceCategoryCode);
  if (!source || amount > source.remaining) throw new Error("Aktarım tutarı kaynak faslın kullanılabilir kalan bütçesini aşamaz.");
  return { ...input, schema: INTERNAL_BUDGET_TRANSFER_SCHEMA, id: nextId(), amount, reason: input.reason.trim(), transferredBy: input.transferredBy.trim() };
}

export function createOfficeContribution(input: Omit<OfficeContribution, "schema" | "id" | "consultantShare" | "officeShare" | "collectionStatus" | "officeShareTransfers" | "rateOverride" | "consultantRate" | "officeRate"> & { consultantRate?: number; officeRate?: number; overrideReason?: string }, settings: InternalControlSettings, managerActor?: string): OfficeContribution {
  const netServiceFee = rounded(input.netServiceFee);
  if (!netServiceFee || !input.sourceTransactionNo.trim() || !input.consultantCode.trim() || !input.consultantName.trim() || !input.collectionReference.trim() || !input.declaredBy.trim()) throw new Error("Kaynak işlem, danışman, KDV hariç hizmet bedeli, tahsilat referansı ve kaydı giren kullanıcı zorunludur.");
  const consultantRate = input.consultantRate ?? settings.defaultConsultantRate;
  const officeRate = input.officeRate ?? settings.defaultOfficeRate;
  if (consultantRate + officeRate !== 100) throw new Error("Danışman ve ofis paylaşım oranları toplamı %100 olmalıdır.");
  const changedRate = consultantRate !== settings.defaultConsultantRate || officeRate !== settings.defaultOfficeRate;
  if (changedRate && (!managerActor?.trim() || !input.overrideReason?.trim())) throw new Error("Varsayılan paylaşım oranı dışındaki işlem için broker manager ve gerekçe zorunludur.");
  const consultantShare = Math.round(netServiceFee * consultantRate / 100);
  return { ...input, schema: OFFICE_CONTRIBUTION_SCHEMA, id: nextId(), sourceTransactionNo: input.sourceTransactionNo.trim(), sourceContractNo: input.sourceContractNo?.trim() || undefined, consultantCode: input.consultantCode.trim(), consultantName: input.consultantName.trim(), netServiceFee, vatAmount: rounded(input.vatAmount), consultantRate, officeRate, consultantShare, officeShare: netServiceFee - consultantShare, collectionReference: input.collectionReference.trim(), declaredBy: input.declaredBy.trim(), note: input.note?.trim() || undefined, collectionStatus: "declared", officeShareTransfers: [], rateOverride: changedRate ? { by: managerActor!.trim(), at: new Date().toISOString(), reason: input.overrideReason!.trim() } : undefined };
}

export function verifyOfficeContribution(contribution: OfficeContribution, actor: string, note: string) {
  if (!actor.trim()) throw new Error("Broker manager kullanıcı bilgisi zorunludur.");
  return { ...contribution, collectionStatus: contribution.officeShareTransfers.reduce((sum, transfer) => sum + transfer.amount, 0) >= contribution.officeShare ? "officeShareSettled" as const : "verified" as const, managerVerification: { by: actor.trim(), at: new Date().toISOString(), note: note.trim() } };
}

export function addOfficeShareTransfer(contribution: OfficeContribution, input: Omit<OfficeShareTransfer, "id">) {
  const amount = rounded(input.amount);
  const received = contribution.officeShareTransfers.reduce((sum, transfer) => sum + transfer.amount, 0);
  if (!amount || !input.treasuryAccountCode.trim() || !input.receivedBy.trim() || !isDate(input.transferredOn)) throw new Error("Kasa hesabı, tutar, tarih ve teslim alan kişi zorunludur.");
  if (amount > contribution.officeShare - received) throw new Error("Ofis kasasına aktarılan tutar açık ofis payını aşamaz.");
  const officeShareTransfers = [...contribution.officeShareTransfers, { ...input, id: nextId(), amount, treasuryAccountCode: input.treasuryAccountCode.trim(), receivedBy: input.receivedBy.trim(), reference: input.reference?.trim() || undefined }];
  return { ...contribution, officeShareTransfers, collectionStatus: contribution.collectionStatus === "verified" && officeShareTransfers.reduce((sum, transfer) => sum + transfer.amount, 0) >= contribution.officeShare ? "officeShareSettled" as const : contribution.collectionStatus };
}

export type ConsultantContributionRow = {
  consultantCode: string;
  consultantName: string;
  netServiceFee: number;
  systemCollected: number;
  externalCashDeclared: number;
  verifiedTotal: number;
  consultantShare: number;
  officeShareExpected: number;
  officeShareReceived: number;
  openOfficeShare: number;
  duplicateRisk: boolean;
};

export function buildConsultantContributionRows(records: OfflineRecord[], year: string, month?: number) {
  const contributions = records.flatMap((record) => {
    const contribution = parseOfficeContribution(record);
    return contribution && contribution.occurredOn.startsWith(year) && (month === undefined || contribution.occurredOn.slice(5, 7) === String(month).padStart(2, "0")) ? [contribution] : [];
  });
  const duplicateSources = new Set(contributions.filter((item, index) => contributions.some((other, otherIndex) => otherIndex !== index && other.sourceTransactionNo === item.sourceTransactionNo && other.netServiceFee === item.netServiceFee)).map((item) => item.sourceTransactionNo));
  const grouped = new Map<string, OfficeContribution[]>();
  contributions.filter((item) => item.collectionStatus !== "rejected").forEach((item) => grouped.set(item.consultantCode, [...(grouped.get(item.consultantCode) ?? []), item]));
  return Array.from(grouped.entries()).map(([consultantCode, items]) => {
    const total = (pick: (item: OfficeContribution) => number) => items.reduce((sum, item) => sum + pick(item), 0);
    const verified = items.filter((item) => item.collectionStatus === "verified" || item.collectionStatus === "officeShareSettled");
    const officeShareReceived = total((item) => item.officeShareTransfers.reduce((sum, transfer) => sum + transfer.amount, 0));
    const officeShareExpected = total((item) => item.officeShare);
    return { consultantCode, consultantName: items[0]?.consultantName ?? "—", netServiceFee: total((item) => item.netServiceFee), systemCollected: total((item) => item.collectionChannel === "externalCash" ? 0 : item.netServiceFee), externalCashDeclared: total((item) => item.collectionChannel === "externalCash" ? item.netServiceFee : 0), verifiedTotal: verified.reduce((sum, item) => sum + item.netServiceFee, 0), consultantShare: total((item) => item.consultantShare), officeShareExpected, officeShareReceived, openOfficeShare: Math.max(0, officeShareExpected - officeShareReceived), duplicateRisk: items.some((item) => duplicateSources.has(item.sourceTransactionNo)) } satisfies ConsultantContributionRow;
  }).sort((left, right) => right.officeShareExpected - left.officeShareExpected);
}

export function latestVatReference(records: OfflineRecord[], year: string, month: number) {
  return records.flatMap((record) => {
    const reference = parseInternalVatReference(record);
    return reference && reference.year === year && reference.month === month ? [{ reference, updatedAt: record.updatedAt }] : [];
  }).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0]?.reference ?? null;
}


export const MULTI_PARTY_OFFICE_CONTRIBUTION_SCHEMA = "global1881-office-contribution-multi-party-v1" as const;
export type CommissionSide = "buyer" | "seller" | "shared";
export type MultiPartyParticipantType = "consultant" | "externalOffice";

export type MultiPartyCommissionParticipant = {
  id: string;
  type: MultiPartyParticipantType;
  side: CommissionSide;
  code: string;
  name: string;
  rate: number;
  share: number;
};

export type MultiPartyOfficeContribution = {
  schema: typeof MULTI_PARTY_OFFICE_CONTRIBUTION_SCHEMA;
  id: string;
  sourceTransactionNo: string;
  sourceContractNo?: string;
  occurredOn: string;
  netServiceFee: number;
  vatAmount: number;
  collectionChannel: ContributionChannel;
  collectionReference: string;
  declaredBy: string;
  collectionStatus: ContributionStatus;
  participants: MultiPartyCommissionParticipant[];
  global1881Share: number;
  externalOfficeShare: number;
  consultantShare: number;
  rateOverride?: { by: string; at: string; reason: string };
  managerVerification?: { by: string; at: string; note: string };
  officeShareTransfers: OfficeShareTransfer[];
};

export type MultiPartyParticipantInput = Omit<MultiPartyCommissionParticipant, "id" | "share"> & { rate: number };

export function createMultiPartyOfficeContribution(input: {
  sourceTransactionNo: string;
  sourceContractNo?: string;
  occurredOn: string;
  netServiceFee: number;
  vatAmount: number;
  collectionChannel: ContributionChannel;
  collectionReference: string;
  declaredBy: string;
  participants: MultiPartyParticipantInput[];
  externalOfficeRate?: number;
  managerActor?: string;
  overrideReason?: string;
}, settings: InternalControlSettings): MultiPartyOfficeContribution {
  const netServiceFee = rounded(input.netServiceFee);
  if (!netServiceFee || !input.sourceTransactionNo.trim() || !input.collectionReference.trim() || !input.declaredBy.trim() || !isDate(input.occurredOn)) throw new Error("Kaynak işlem, tarih, KDV hariç hizmet bedeli, tahsilat referansı ve kaydı giren kullanıcı zorunludur.");
  if (!input.participants.length) throw new Error("En az bir danışman veya işbirliği ofisi paydaşı gerekir.");
  const participantExternalOfficeRate = input.participants.filter((item) => item.type === "externalOffice").reduce((sum, item) => sum + rounded(item.rate), 0);
  const externalOfficeRate = input.externalOfficeRate === undefined ? participantExternalOfficeRate : rounded(input.externalOfficeRate);
  const consultantRateTotal = input.participants.filter((item) => item.type === "consultant").reduce((sum, item) => sum + rounded(item.rate), 0);
  const participantRateTotal = consultantRateTotal + externalOfficeRate;
  if (participantRateTotal !== 100) throw new Error("Danışman ve dış ofis pay oranları toplamı %100 olmalıdır.");
  const changedRate = consultantRateTotal !== settings.defaultConsultantRate || externalOfficeRate !== 0;
  if (changedRate && (!input.managerActor?.trim() || !input.overrideReason?.trim())) throw new Error("Varsayılan paylaşım dışındaki çok paydaşlı işlem için broker manager ve gerekçe zorunludur.");
  const consultantParticipants = input.participants.filter((item) => item.type === "consultant");
  if (!consultantParticipants.length) throw new Error("İşlemde en az bir danışman bulunmalıdır.");
  const participants = input.participants.map((item) => ({ ...item, id: nextId(), code: item.code.trim(), name: item.name.trim(), rate: rounded(item.rate), share: Math.round(netServiceFee * rounded(item.rate) / 100) }));
  if (participants.filter((item) => item.type === "externalOffice").reduce((sum, item) => sum + item.rate, 0) !== externalOfficeRate) throw new Error("Dış ofis oranı katılımcı kayıtlarıyla eşleşmelidir.");
  const consultantShare = participants.filter((item) => item.type === "consultant").reduce((sum, item) => sum + item.share, 0);
  const externalOfficeShare = participants.filter((item) => item.type === "externalOffice").reduce((sum, item) => sum + item.share, 0);
  return {
    schema: MULTI_PARTY_OFFICE_CONTRIBUTION_SCHEMA,
    id: nextId(),
    sourceTransactionNo: input.sourceTransactionNo.trim(),
    sourceContractNo: input.sourceContractNo?.trim() || undefined,
    occurredOn: input.occurredOn,
    netServiceFee,
    vatAmount: rounded(input.vatAmount),
    collectionChannel: input.collectionChannel,
    collectionReference: input.collectionReference.trim(),
    declaredBy: input.declaredBy.trim(),
    collectionStatus: "declared",
    participants,
    global1881Share: netServiceFee - externalOfficeShare,
    externalOfficeShare,
    consultantShare,
    officeShareTransfers: [],
    rateOverride: changedRate ? { by: input.managerActor!.trim(), at: new Date().toISOString(), reason: input.overrideReason!.trim() } : undefined,
  };
}

export function parseMultiPartyOfficeContribution(record: OfflineRecord): MultiPartyOfficeContribution | null {
  const raw = parseJson(record);
  if (!raw || raw.schema !== MULTI_PARTY_OFFICE_CONTRIBUTION_SCHEMA || typeof raw.id !== "string" || typeof raw.sourceTransactionNo !== "string" || !isDate(raw.occurredOn) || typeof raw.collectionReference !== "string" || typeof raw.declaredBy !== "string" || !Array.isArray(raw.participants)) return null;
  const participants = raw.participants.flatMap((item) => {
    const value = item as Partial<MultiPartyCommissionParticipant>;
    return (value.type === "consultant" || value.type === "externalOffice") && (value.side === "buyer" || value.side === "seller" || value.side === "shared") && typeof value.id === "string" && typeof value.code === "string" && typeof value.name === "string" && Number.isFinite(Number(value.rate)) && Number.isFinite(Number(value.share)) ? [{ id: value.id, type: value.type, side: value.side, code: value.code, name: value.name, rate: rounded(value.rate), share: rounded(value.share) }] : [];
  });
  if (!participants.length || participants.reduce((sum, item) => sum + item.share, 0) !== rounded(raw.netServiceFee)) return null;
  if (raw.collectionChannel !== "systemCash" && raw.collectionChannel !== "systemBank" && raw.collectionChannel !== "systemCard" && raw.collectionChannel !== "externalCash") return null;
  if (raw.collectionStatus !== "declared" && raw.collectionStatus !== "verified" && raw.collectionStatus !== "officeShareSettled" && raw.collectionStatus !== "rejected") return null;
  const externalOfficeShare = participants.filter((item) => item.type === "externalOffice").reduce((sum, item) => sum + item.share, 0);
  return { schema: MULTI_PARTY_OFFICE_CONTRIBUTION_SCHEMA, id: raw.id, sourceTransactionNo: raw.sourceTransactionNo, sourceContractNo: typeof raw.sourceContractNo === "string" ? raw.sourceContractNo : undefined, occurredOn: raw.occurredOn, netServiceFee: rounded(raw.netServiceFee), vatAmount: rounded(raw.vatAmount), collectionChannel: raw.collectionChannel, collectionReference: raw.collectionReference, declaredBy: raw.declaredBy, collectionStatus: raw.collectionStatus, participants, global1881Share: rounded(raw.global1881Share) || rounded(raw.netServiceFee) - externalOfficeShare, externalOfficeShare, consultantShare: participants.filter((item) => item.type === "consultant").reduce((sum, item) => sum + item.share, 0), rateOverride: raw.rateOverride && typeof raw.rateOverride === "object" ? raw.rateOverride as MultiPartyOfficeContribution["rateOverride"] : undefined, managerVerification: raw.managerVerification && typeof raw.managerVerification === "object" ? raw.managerVerification as MultiPartyOfficeContribution["managerVerification"] : undefined, officeShareTransfers: [] };
}
