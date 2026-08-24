import { addMonths } from "./rentalContract";
import type { OfflineRecord } from "./offlineStore";
import { formatTurkishDate, parseTurkishDateInput } from "./turkishDate";

export const ACTIVE_CONTRACT_DOCUMENT_SCHEMA = "global1881-offline-active-contract-document-v1";

type RentalSnapshot = { schema?: string; contractNo?: string; ownerName?: string; tenantName?: string; signedByParties?: boolean; signedAt?: string; startDate?: string; durationMonths?: string; summary?: { endDate?: string } };

export type ActiveContractDocumentMetadata = {
  schema: typeof ACTIVE_CONTRACT_DOCUMENT_SCHEMA;
  readonly: true;
  immutable: true;
  contractRecordId: string;
  contractNo: string;
  customerNames: string[];
  signatureDate: string;
  signatureDateDisplay: string;
  originalFileName: string;
  sha256: string;
  byteSize: number;
  storageKey: string;
  uploadedAt: string;
  uploadedByUserId: string;
};

export type ActiveContractDocumentInput = Omit<ActiveContractDocumentMetadata, "schema" | "readonly" | "immutable" | "signatureDateDisplay" | "uploadedAt"> & { signatureDate: string };

const keyPattern = /^[a-zA-Z0-9-]+$/;
const checksumPattern = /^[a-f0-9]{64}$/i;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function customerNames(snapshot: RentalSnapshot) {
  return Array.from(new Set([snapshot.ownerName, snapshot.tenantName].map((value) => String(value ?? "").trim()).filter(Boolean)));
}

function asActiveRentalSnapshot(record: Pick<OfflineRecord, "entity" | "details">) {
  if (record.entity !== "contract") return null;
  try {
    const snapshot = JSON.parse(record.details) as RentalSnapshot;
    return String(snapshot.schema ?? "").startsWith("global1881-offline-rental") ? snapshot : null;
  } catch { return null; }
}

/** İmzalanmış ve süresi bitmemiş kira sözleşmesi, danışmanın güncel müşteri dosyasına PDF eklemesine uygundur. */
export function getActiveSignedRentalEligibility(record: Pick<OfflineRecord, "entity" | "details" | "userId">, currentDate = new Date().toISOString().slice(0, 10)) {
  const snapshot = asActiveRentalSnapshot(record);
  if (!snapshot) return { eligible: false as const, reason: "Yalnız kira sözleşmelerine imzalı belge eklenebilir." };
  if (snapshot.signedByParties !== true) return { eligible: false as const, reason: "PDF yüklemek için taraf imza teyidi gerekir." };
  const startDate = String(snapshot.startDate ?? "");
  const endDate = String(snapshot.summary?.endDate ?? (isoDatePattern.test(startDate) ? addMonths(startDate, Number.parseInt(String(snapshot.durationMonths ?? "12"), 10) || 12) : ""));
  if (!isoDatePattern.test(endDate) || endDate < currentDate) return { eligible: false as const, reason: "Bu sözleşme aktif dönemde değildir; geçmiş arşiv için değerlendirin." };
  const names = customerNames(snapshot);
  if (!names.length) return { eligible: false as const, reason: "Müşteri tarafları bulunamadı." };
  return { eligible: true as const, snapshot, endDate, customerNames: names };
}

export function canUploadOwnActiveContractDocument(record: Pick<OfflineRecord, "entity" | "details" | "userId">, userId: string, currentDate?: string) {
  if (!userId.trim() || record.userId !== userId.trim()) return false;
  return getActiveSignedRentalEligibility(record, currentDate).eligible;
}

export function createActiveContractDocumentMetadata(input: ActiveContractDocumentInput): ActiveContractDocumentMetadata {
  const signatureDate = parseTurkishDateInput(input.signatureDate);
  if (signatureDate === null) throw new Error("İmza tarihi GG.AA.YYYY biçiminde geçerli bir tarih olmalıdır.");
  if (!keyPattern.test(input.contractRecordId) || !keyPattern.test(input.storageKey)) throw new Error("Geçersiz aktif sözleşme belge anahtarı.");
  if (!input.contractNo.trim() || !input.uploadedByUserId.trim() || !input.customerNames.some((name) => name.trim())) throw new Error("Sözleşme, müşteri ve danışman bilgisi gereklidir.");
  if (!input.originalFileName.trim().toLowerCase().endsWith(".pdf") || !checksumPattern.test(input.sha256) || !Number.isFinite(input.byteSize) || input.byteSize <= 0) throw new Error("İmzalı PDF bütünlük bilgisi geçersiz.");
  return { ...input, schema: ACTIVE_CONTRACT_DOCUMENT_SCHEMA, readonly: true, immutable: true, signatureDate: signatureDate ?? "", signatureDateDisplay: formatTurkishDate(signatureDate ?? "", "Tarih belirtilmemiş"), customerNames: Array.from(new Set(input.customerNames.map((name) => name.trim()).filter(Boolean))), originalFileName: input.originalFileName.trim(), contractNo: input.contractNo.trim(), uploadedByUserId: input.uploadedByUserId.trim(), uploadedAt: new Date().toISOString() };
}

export function parseActiveContractDocumentMetadata(record: Pick<OfflineRecord, "entity" | "details">): ActiveContractDocumentMetadata | null {
  if (record.entity !== "activeContractDocument") return null;
  try {
    const value = JSON.parse(record.details) as Partial<ActiveContractDocumentMetadata>;
    if (value.schema !== ACTIVE_CONTRACT_DOCUMENT_SCHEMA || value.readonly !== true || value.immutable !== true || typeof value.contractRecordId !== "string" || !keyPattern.test(value.contractRecordId) || typeof value.storageKey !== "string" || !keyPattern.test(value.storageKey) || typeof value.sha256 !== "string" || !checksumPattern.test(value.sha256) || typeof value.originalFileName !== "string" || !value.originalFileName.toLowerCase().endsWith(".pdf") || !Array.isArray(value.customerNames) || !value.customerNames.some((name) => typeof name === "string" && name.trim()) || typeof value.uploadedByUserId !== "string" || !value.uploadedByUserId.trim() || !Number.isFinite(value.byteSize) || Number(value.byteSize) <= 0) return null;
    return value as ActiveContractDocumentMetadata;
  } catch { return null; }
}
