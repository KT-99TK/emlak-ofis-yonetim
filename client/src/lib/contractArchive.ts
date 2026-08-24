import type { OfflineRecord } from "./offlineStore";
import { formatTurkishDate, parseTurkishDateInput } from "./turkishDate";

export const CONTRACT_ARCHIVE_SCHEMA = "global1881-offline-contract-archive-v1";

export const contractArchiveDocumentTypes = [
  { value: "authority", label: "Yetki sözleşmesi" },
  { value: "rental", label: "Kira sözleşmesi" },
  { value: "sales", label: "Satış sözleşmesi" },
  { value: "appendix", label: "Sözleşme eki" },
  { value: "other", label: "Diğer eski belge" },
] as const;

export type ContractArchiveDocumentType = (typeof contractArchiveDocumentTypes)[number]["value"];

export type ContractArchiveMetadata = {
  schema: typeof CONTRACT_ARCHIVE_SCHEMA;
  readonly: true;
  documentType: ContractArchiveDocumentType;
  documentTypeLabel: string;
  customerName: string;
  documentDate: string;
  documentDateDisplay: string;
  originalFileName: string;
  sha256: string;
  byteSize: number;
  storageKey: string;
  importedAt: string;
  historicalActivity: string;
  archiveNote: string;
};

export type CreateContractArchiveMetadataInput = Omit<ContractArchiveMetadata, "schema" | "readonly" | "documentTypeLabel" | "documentDateDisplay" | "importedAt"> & { documentDate: string };

const storageKeyPattern = /^[a-zA-Z0-9-]+$/;
const checksumPattern = /^[a-f0-9]{64}$/i;

export function contractArchiveDocumentLabel(value: ContractArchiveDocumentType) {
  return contractArchiveDocumentTypes.find((item) => item.value === value)?.label ?? "Eski belge";
}

export function createContractArchiveMetadata(input: CreateContractArchiveMetadataInput): ContractArchiveMetadata {
  const documentDate = input.documentDate ? parseTurkishDateInput(input.documentDate) : "";
  if (documentDate === null) throw new Error("Belge tarihi GG.AA.YYYY biçiminde geçerli bir tarih olmalıdır.");
  if (!contractArchiveDocumentTypes.some((item) => item.value === input.documentType)) throw new Error("Geçersiz arşiv belge türü.");
  if (!input.customerName.trim()) throw new Error("Arşiv için müşteri adı gereklidir.");
  if (!input.historicalActivity.trim()) throw new Error("Arşiv için müşteriye ait geçmiş işlem özeti gereklidir.");
  if (!input.originalFileName.trim().toLowerCase().endsWith(".pdf")) throw new Error("Yalnız PDF belgeleri arşivlenebilir.");
  if (!storageKeyPattern.test(input.storageKey)) throw new Error("Geçersiz arşiv depolama anahtarı.");
  if (!checksumPattern.test(input.sha256)) throw new Error("PDF bütünlük özeti geçersiz.");
  if (!Number.isFinite(input.byteSize) || input.byteSize <= 0) throw new Error("PDF dosya boyutu geçersiz.");
  return {
    ...input,
    schema: CONTRACT_ARCHIVE_SCHEMA,
    readonly: true,
    documentTypeLabel: contractArchiveDocumentLabel(input.documentType),
    documentDate: documentDate ?? "",
    documentDateDisplay: formatTurkishDate(documentDate ?? "", "Tarih belirtilmemiş"),
    importedAt: new Date().toISOString(),
    customerName: input.customerName.trim(),
    historicalActivity: input.historicalActivity.trim(),
    originalFileName: input.originalFileName.trim(),
    archiveNote: input.archiveNote.trim(),
  };
}

export function parseContractArchiveMetadata(record: Pick<OfflineRecord, "entity" | "details">): ContractArchiveMetadata | null {
  if (record.entity !== "contractArchive") return null;
  try {
    const value = JSON.parse(record.details) as Partial<ContractArchiveMetadata>;
    if (value.schema !== CONTRACT_ARCHIVE_SCHEMA || value.readonly !== true || !contractArchiveDocumentTypes.some((item) => item.value === value.documentType)) return null;
    if (typeof value.storageKey !== "string" || !storageKeyPattern.test(value.storageKey) || typeof value.sha256 !== "string" || !checksumPattern.test(value.sha256)) return null;
    if (typeof value.customerName !== "string" || !value.customerName.trim() || typeof value.historicalActivity !== "string" || !value.historicalActivity.trim() || typeof value.originalFileName !== "string" || !value.originalFileName.toLowerCase().endsWith(".pdf") || !Number.isFinite(value.byteSize) || Number(value.byteSize) <= 0) return null;
    return value as ContractArchiveMetadata;
  } catch {
    return null;
  }
}

/** Arşiv kartında eski belgeleri önce gösterir; tarihi belirtilmeyenler her zaman listenin sonunda kalır. */
export function compareContractArchiveChronologically(left: Pick<ContractArchiveMetadata, "documentDate" | "importedAt">, right: Pick<ContractArchiveMetadata, "documentDate" | "importedAt">) {
  const leftDate = left.documentDate || "9999-12-31";
  const rightDate = right.documentDate || "9999-12-31";
  if (leftDate !== rightDate) return leftDate.localeCompare(rightDate);
  return left.importedAt.localeCompare(right.importedAt);
}

export function formatArchiveByteSize(byteSize: number) {
  if (byteSize < 1024 * 1024) return `${Math.max(1, Math.round(byteSize / 1024))} KB`;
  return `${(byteSize / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}
