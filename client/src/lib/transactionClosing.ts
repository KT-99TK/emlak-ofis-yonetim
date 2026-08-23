import { calculateAuthoritySummary, type AuthorityContractDetails } from "./authorityContract";
import { calculateRentalSummary, type OfflineRentalDetails } from "./rentalContract";
import type { OfflineRecord } from "./offlineStore";

export const TRANSACTION_CLOSING_SCHEMA = "global1881-offline-transaction-v1";
export type TransactionKind = "sale" | "rental";
export type CollectionCategory = "reservation" | "deposit" | "rentalFirstMonth" | "serviceFee" | "vat" | "other";
export type CollectionState = "planned" | "declared" | "verified" | "partial" | "waived";
export type PaymentMethod = "cash" | "bankTransfer";
export type TransactionStatus = "prepared" | "collectionPending" | "managerReview" | "riskHold" | "closed" | "cancelled";

export type CollectionPayer = "owner" | "tenant" | "other";
export type TransactionCollection = { id: string; category: CollectionCategory; label: string; payer: CollectionPayer; expectedAmount: number; collectedAmount: number; currency: "TRY" | "USD" | "EUR"; dueDate?: string; collectedAt?: string; method?: PaymentMethod; reference?: string; state: CollectionState; note?: string };
export type TransactionEvent = { at: string; actor: string; action: "created" | "collectionDeclared" | "collectionVerified" | "collectionAdded" | "closeRequested" | "closed" | "exceptionClosed"; note?: string };
export type OfflineTransactionDetails = {
  schema: typeof TRANSACTION_CLOSING_SCHEMA;
  transactionNo: string;
  kind: TransactionKind;
  sourceContractRecordId: string;
  sourceContractNo: string;
  propertyLabel: string;
  consultantName: string;
  consultantCode: string;
  ownerApproval?: "pending" | "approved";
  vatCollection: "separate" | "included";
  status: TransactionStatus;
  collections: TransactionCollection[];
  managerApproval?: { decision: "approved" | "exception" | "rejected"; by: string; at: string; note: string };
  events: TransactionEvent[];
};

export type TransactionRisk = { severity: "critical" | "warning" | "info"; message: string; collectionId?: string };
export const collectionCategoryLabels: Record<CollectionCategory, string> = { reservation: "Kapora", deposit: "Depozito", rentalFirstMonth: "İlk kira", serviceFee: "Hizmet bedeli", vat: "KDV", other: "Diğer tahsilat" };
export const collectionStateLabels: Record<CollectionState, string> = { planned: "Planlandı", declared: "Beyan edildi", verified: "Doğrulandı", partial: "Kısmi tahsilat", waived: "İstisna / vazgeçildi" };

const toAmount = (raw: unknown) => {
  const text = String(raw ?? "").trim().replace(/\s/g, "");
  if (!text) return 0;
  const normalized = text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text.replace(/\.(?=\d{3}(?:\D|$))/g, "");
  return Math.max(0, Math.round(Number(normalized) || 0));
};
const asDate = (value?: string) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
const today = () => new Date().toISOString().slice(0, 10);

type AuthoritySnapshot = Partial<AuthorityContractDetails> & { schema?: string; contractNo?: string; summary?: { serviceFeeAmount?: number } };
type RentalSnapshot = Partial<OfflineRentalDetails> & { schema?: string; contractNo?: string; summary?: { monthlyRent?: number; firstDueDate?: string } };

function nextTransactionNo(records: OfflineRecord[], referenceDate: string) {
  const year = Number(referenceDate.slice(0, 4)) || new Date().getFullYear();
  const prefix = `ISK-${year}-`;
  const highest = records.flatMap((record) => {
    const parsed = parseOfflineTransaction(record);
    return parsed?.transactionNo.startsWith(prefix) ? [Number(parsed.transactionNo.slice(prefix.length))] : [];
  }).filter(Number.isFinite).reduce((current, value) => Math.max(current, value), 0);
  return `${prefix}${String(highest + 1).padStart(3, "0")}`;
}

function collection(category: CollectionCategory, expectedAmount: number, currency: "TRY" | "USD" | "EUR", dueDate?: string, payer: CollectionPayer = "other"): TransactionCollection {
  return { id: `${category}-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`, category, label: collectionCategoryLabels[category], payer, expectedAmount: Math.max(0, Math.round(expectedAmount)), collectedAmount: 0, currency, dueDate: asDate(dueDate), state: "planned" };
}

/** Sadece satış yetki sözleşmesi ile imzalı kira sözleşmesi, kapanış işlem dosyası için kaynak olabilir. */
export function createTransactionFromContract(record: OfflineRecord, allRecords: OfflineRecord[], actor: string): OfflineTransactionDetails | null {
  if (record.entity !== "contract") return null;
  let snapshot: AuthoritySnapshot | RentalSnapshot;
  try { snapshot = JSON.parse(record.details) as AuthoritySnapshot | RentalSnapshot; } catch { return null; }
  const timestamp = new Date().toISOString();
  if (snapshot.schema?.startsWith("global1881-offline-authority") && (snapshot as AuthoritySnapshot).mode === "sale") {
    const authority = snapshot as AuthoritySnapshot;
    const details: AuthorityContractDetails = {
      mode: "sale", ownerName: authority.ownerName ?? "", ownerIdentity: authority.ownerIdentity ?? "", ownerPhone: authority.ownerPhone ?? "", ownerAddress: authority.ownerAddress ?? "", propertyNeighborhood: authority.propertyNeighborhood ?? "", propertyAddress: authority.propertyAddress ?? "", parcelInfo: authority.parcelInfo ?? "", propertyType: authority.propertyType ?? "", grossM2: authority.grossM2 ?? "", roomCount: authority.roomCount ?? "", floorAndView: authority.floorAndView ?? "", condition: authority.condition ?? "", price: authority.price ?? "", currency: authority.currency === "USD" || authority.currency === "EUR" ? authority.currency : "TRY", serviceFeeRate: authority.serviceFeeRate ?? "", serviceFeeAmount: authority.serviceFeeAmount ?? "", vatCollection: authority.vatCollection === "included" ? "included" : "separate", contractDate: authority.contractDate ?? today(), consultantName: authority.consultantName ?? "", consultantPhone: authority.consultantPhone ?? "", consultantCode: authority.consultantCode ?? "", consultantTitle: authority.consultantTitle ?? "", officeName: authority.officeName ?? "", officeAuthorizationNo: authority.officeAuthorizationNo ?? "", officeTaxOffice: authority.officeTaxOffice ?? "", officeTaxNo: authority.officeTaxNo ?? "", officePhone: authority.officePhone ?? "", officeAddress: authority.officeAddress ?? "",
    };
    const fee = authority.summary?.serviceFeeAmount || calculateAuthoritySummary(details).serviceFeeAmount;
    const collections = [collection("serviceFee", fee, details.currency, details.contractDate, "owner"), ...(details.vatCollection === "separate" ? [collection("vat", Math.round(fee * 0.2), details.currency, details.contractDate, "owner")] : [])].filter((item) => item.expectedAmount > 0);
    return { schema: TRANSACTION_CLOSING_SCHEMA, transactionNo: nextTransactionNo(allRecords, details.contractDate), kind: "sale", sourceContractRecordId: record.id, sourceContractNo: authority.contractNo ?? record.title, propertyLabel: [details.propertyNeighborhood, details.propertyAddress].filter(Boolean).join(" · ") || record.title, consultantName: details.consultantName, consultantCode: details.consultantCode, vatCollection: details.vatCollection, status: "prepared", collections, events: [{ at: timestamp, actor, action: "created", note: "Satış yetki sözleşmesinden işlem dosyası oluşturuldu." }] };
  }
  if (snapshot.schema?.startsWith("global1881-offline-rental")) {
    const rental = snapshot as RentalSnapshot;
    const details: OfflineRentalDetails = { useType: rental.useType === "commercial" ? "commercial" : "residential", ownerName: rental.ownerName ?? "", ownerIdentity: rental.ownerIdentity ?? "", ownerPhone: rental.ownerPhone ?? "", ownerAddress: rental.ownerAddress ?? "", tenantName: rental.tenantName ?? "", tenantIdentity: rental.tenantIdentity ?? "", tenantPhone: rental.tenantPhone ?? "", tenantAddress: rental.tenantAddress ?? "", guarantorName: rental.guarantorName ?? "", guarantorIdentity: rental.guarantorIdentity ?? "", guarantorLimit: rental.guarantorLimit ?? "", hasGuarantor: Boolean(rental.hasGuarantor), signedByParties: Boolean(rental.signedByParties), signedAt: rental.signedAt ?? "", propertyNeighborhood: rental.propertyNeighborhood ?? "", propertyAddress: rental.propertyAddress ?? "", propertyType: rental.propertyType ?? "", parcelInfo: rental.parcelInfo ?? "", fixtures: rental.fixtures ?? "", meterNotes: rental.meterNotes ?? "", monthlyRent: rental.monthlyRent ?? "", deposit: rental.deposit ?? "", currency: "TRY", vatCollection: "separate", paymentDay: rental.paymentDay ?? "1", iban: rental.iban ?? "", startDate: rental.startDate ?? today(), durationMonths: rental.durationMonths ?? "12", noticeDays: rental.noticeDays ?? "60", kdvIncluded: Boolean(rental.kdvIncluded), usagePurpose: rental.usagePurpose ?? "", residentsCount: rental.residentsCount ?? "", courtCity: rental.courtCity ?? "", documentPlace: rental.documentPlace ?? "", ownerApproval: rental.ownerApproval === "approved" ? "approved" : "pending", consultantName: rental.consultantName ?? "", consultantCode: rental.consultantCode ?? "", officeName: rental.officeName ?? "", officeAuthorizationNo: rental.officeAuthorizationNo ?? "" };
    if (!details.signedByParties) return null;
    const summary = calculateRentalSummary(details);
    const deposit = toAmount(details.deposit);
    const collections = [collection("deposit", deposit, "TRY", details.startDate, "tenant"), collection("rentalFirstMonth", summary.monthlyRent, "TRY", summary.firstDueDate, "tenant"), collection("serviceFee", summary.monthlyRent, "TRY", details.startDate, "tenant"), collection("vat", Math.round(summary.monthlyRent * 0.2), "TRY", details.startDate, "tenant")].filter((item) => item.expectedAmount > 0);
    const serviceFeeItem = collections.find((item) => item.category === "serviceFee");
    const vatItem = collections.find((item) => item.category === "vat");
    if (serviceFeeItem) serviceFeeItem.label = "Kiracı hizmet bedeli (1 aylık kira)";
    if (vatItem) vatItem.label = "Kiracı hizmet bedeli KDV (%20)";
    return { schema: TRANSACTION_CLOSING_SCHEMA, transactionNo: nextTransactionNo(allRecords, details.startDate), kind: "rental", sourceContractRecordId: record.id, sourceContractNo: rental.contractNo ?? record.title, propertyLabel: [details.propertyNeighborhood, details.propertyAddress].filter(Boolean).join(" · ") || record.title, consultantName: details.consultantName, consultantCode: details.consultantCode, ownerApproval: details.ownerApproval, vatCollection: details.vatCollection, status: "prepared", collections, events: [{ at: timestamp, actor, action: "created", note: "Kira sözleşmesinden işlem dosyası oluşturuldu." }] };
  }
  return null;
}

export function parseOfflineTransaction(record: OfflineRecord): OfflineTransactionDetails | null {
  if (record.entity !== "transaction") return null;
  try {
    const raw = JSON.parse(record.details) as Partial<OfflineTransactionDetails>;
    if (raw.schema !== TRANSACTION_CLOSING_SCHEMA || !raw.transactionNo || !raw.sourceContractRecordId) return null;
    const kind = raw.kind === "rental" ? "rental" : "sale";
    return { schema: TRANSACTION_CLOSING_SCHEMA, transactionNo: raw.transactionNo, kind, sourceContractRecordId: raw.sourceContractRecordId, sourceContractNo: raw.sourceContractNo ?? "—", propertyLabel: raw.propertyLabel ?? "—", consultantName: raw.consultantName ?? "", consultantCode: raw.consultantCode ?? "", ownerApproval: raw.ownerApproval === "approved" ? "approved" : raw.ownerApproval === "pending" ? "pending" : undefined, vatCollection: kind === "rental" ? "separate" : raw.vatCollection === "included" ? "included" : "separate", status: ["prepared", "collectionPending", "managerReview", "riskHold", "closed", "cancelled"].includes(raw.status ?? "") ? raw.status as TransactionStatus : "prepared", collections: Array.isArray(raw.collections) ? raw.collections.map((item) => ({ ...item, expectedAmount: toAmount(item.expectedAmount), collectedAmount: toAmount(item.collectedAmount), currency: item.currency === "USD" || item.currency === "EUR" ? item.currency : "TRY", category: collectionCategoryLabels[item.category as CollectionCategory] ? item.category as CollectionCategory : "other", label: item.label || collectionCategoryLabels[item.category as CollectionCategory] || "Diğer tahsilat", payer: item.payer === "owner" || item.payer === "tenant" ? item.payer : kind === "rental" && ["serviceFee", "vat", "deposit", "rentalFirstMonth"].includes(item.category as CollectionCategory) ? "tenant" : "other", state: ["planned", "declared", "verified", "partial", "waived"].includes(item.state) ? item.state : "planned" })) : [], managerApproval: raw.managerApproval, events: Array.isArray(raw.events) ? raw.events : [] };
  } catch { return null; }
}

export function transactionRisks(details: OfflineTransactionDetails, referenceDate = today()): TransactionRisk[] {
  const risks: TransactionRisk[] = [];
  if (details.kind === "rental" && details.ownerApproval !== "approved") risks.push({ severity: "critical", message: "Mülk sahibi onayı olmadan kira işlemi kapanamaz." });
  details.collections.forEach((item) => {
    if (item.expectedAmount <= 0) return;
    if (item.collectedAmount < item.expectedAmount && item.state !== "waived") risks.push({ severity: "critical", collectionId: item.id, message: `${item.label}: ${new Intl.NumberFormat("tr-TR").format(item.expectedAmount - item.collectedAmount)} ${item.currency} eksik tahsilat var.` });
    if (item.dueDate && item.dueDate < referenceDate && item.state !== "verified" && item.state !== "waived") risks.push({ severity: "critical", collectionId: item.id, message: `${item.label}: vadesi geçmiş ve doğrulanmamış.` });
    if (item.collectedAmount > 0 && (!item.method || !item.reference?.trim())) risks.push({ severity: "critical", collectionId: item.id, message: `${item.label}: tahsilat yöntemi veya referans/makbuz numarası eksik.` });
    if (item.state === "declared" || item.state === "partial") risks.push({ severity: "warning", collectionId: item.id, message: `${item.label}: broker manager doğrulaması bekliyor.` });
  });
  if (details.vatCollection === "included") risks.push({ severity: "info", message: "KDV hizmet bedeli tahsilatına dâhil seçildi; net gelir ve KDV kaybı finansal istatistiklerde ayrıca izlenir." });
  return risks;
}

export function declareCollection(details: OfflineTransactionDetails, collectionId: string, input: { collectedAmount: number; method: PaymentMethod; reference: string; collectedAt: string; note?: string }, actor: string) {
  const collections = details.collections.map((item) => item.id !== collectionId ? item : { ...item, collectedAmount: Math.max(0, Math.round(input.collectedAmount)), method: input.method, reference: input.reference.trim(), collectedAt: asDate(input.collectedAt) ?? today(), note: input.note?.trim(), state: input.collectedAmount < item.expectedAmount ? "partial" as const : "declared" as const });
  return { ...details, status: "managerReview" as const, collections, events: [...details.events, { at: new Date().toISOString(), actor, action: "collectionDeclared" as const, note: "Tahsilat beyanı güncellendi." }] };
}

export function addOptionalCollection(details: OfflineTransactionDetails, input: { category: "reservation" | "other"; expectedAmount: number; dueDate?: string; label?: string }, actor: string) {
  const entry = collection(input.category, input.expectedAmount, "TRY", input.dueDate);
  entry.label = input.label?.trim() || collectionCategoryLabels[input.category];
  return { ...details, status: "collectionPending" as const, collections: [...details.collections, entry], events: [...details.events, { at: new Date().toISOString(), actor, action: "collectionAdded" as const, note: `${entry.label} kalemi eklendi.` }] };
}

export function verifyCollection(details: OfflineTransactionDetails, collectionId: string, actor: string) {
  const item = details.collections.find((entry) => entry.id === collectionId);
  if (!item) throw new Error("Tahsilat kalemi bulunamadı.");
  if (!item.method || !item.reference?.trim()) throw new Error("Nakit makbuz veya banka transfer referansı zorunludur.");
  if (item.collectedAmount < item.expectedAmount) throw new Error("Eksik tahsilat broker manager tarafından doğrulanamaz; istisna notu kullanın.");
  return { ...details, collections: details.collections.map((entry) => entry.id === collectionId ? { ...entry, state: "verified" as const } : entry), events: [...details.events, { at: new Date().toISOString(), actor, action: "collectionVerified" as const, note: `${item.label} doğrulandı.` }] };
}

export function closeTransaction(details: OfflineTransactionDetails, actor: string, exceptionNote = "") {
  const risks = transactionRisks(details);
  const critical = risks.filter((item) => item.severity === "critical");
  if (critical.length && !exceptionNote.trim()) throw new Error("Eksik veya doğrulanmamış tahsilat varken kapanış için gerekçeli broker manager istisna notu zorunludur.");
  const exception = Boolean(critical.length);
  return { ...details, status: "closed" as const, managerApproval: { decision: exception ? "exception" as const : "approved" as const, by: actor, at: new Date().toISOString(), note: exception ? exceptionNote.trim() : "Tahsilat ve risk kontrolleri doğrulandı." }, events: [...details.events, { at: new Date().toISOString(), actor, action: exception ? "exceptionClosed" as const : "closed" as const, note: exception ? exceptionNote.trim() : "İşlem kapatıldı." }] };
}

export function transactionExpectedTotal(details: OfflineTransactionDetails) { return details.collections.reduce((total, item) => total + item.expectedAmount, 0); }
export function transactionVerifiedTotal(details: OfflineTransactionDetails) { return details.collections.filter((item) => item.state === "verified").reduce((total, item) => total + item.collectedAmount, 0); }
