export const CONTRACT_FORM_TYPES = ["sale_closing", "land_share"] as const;
export type ContractFormType = (typeof CONTRACT_FORM_TYPES)[number];

export const CONTRACT_FORM_PARTIES = [
  "shared",
  "seller",
  "buyer",
  "landowner",
  "contractor",
] as const;
export type ContractFormParty = (typeof CONTRACT_FORM_PARTIES)[number];

export const CONTRACT_FORM_SECTION_TYPES = [
  "general",
  "technical",
  "optional_clauses",
] as const;
export type ContractFormSectionType = (typeof CONTRACT_FORM_SECTION_TYPES)[number];

export const CONTRACT_FORM_FIELD_TYPES = [
  "text",
  "multiline",
  "date",
  "currency",
  "number",
  "checkbox",
  "select",
] as const;
export type ContractFormFieldType = (typeof CONTRACT_FORM_FIELD_TYPES)[number];

export type ContractFormClauseDraft = {
  partyScope: ContractFormParty;
  title: string;
  bodyTemplate: string;
  sortOrder?: number;
  status?: "draft" | "active" | "archived";
  sourceNote?: string;
};

export function normalizeClauseDraft(input: ContractFormClauseDraft) {
  const title = input.title.trim();
  const bodyTemplate = input.bodyTemplate.trim();
  if (!title) throw new Error("Ek madde başlığı boş bırakılamaz.");
  if (!bodyTemplate) throw new Error("Ek madde metni boş bırakılamaz.");
  if (title.length > 200) throw new Error("Ek madde başlığı 200 karakteri aşamaz.");
  if (bodyTemplate.length > 20_000) throw new Error("Ek madde metni 20.000 karakteri aşamaz.");
  return {
    ...input,
    title,
    bodyTemplate,
    sortOrder: Math.max(0, Math.trunc(input.sortOrder ?? 0)),
    status: input.status ?? "draft",
    sourceNote: input.sourceNote?.trim() || undefined,
  };
}

export function activeClausesForOutput<T extends { status: string; bodyTemplate: string; sortOrder: number }>(clauses: T[]) {
  return clauses
    .filter(clause => clause.status === "active" && clause.bodyTemplate.trim().length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

const COMMON_FORM_FIELDS = [
  { fieldKey: "contractDate", label: "Sözleşme tarihi", fieldType: "date" as const, partyScope: "shared" as const, required: true, sortOrder: 10 },
  { fieldKey: "contractPlace", label: "Sözleşme yeri", fieldType: "text" as const, partyScope: "shared" as const, required: false, sortOrder: 20 },
  { fieldKey: "propertyAddress", label: "Taşınmaz adresi", fieldType: "multiline" as const, partyScope: "shared" as const, required: true, sortOrder: 50 },
  { fieldKey: "titleDeedInfo", label: "Tapu ve bağımsız bölüm bilgileri", fieldType: "multiline" as const, partyScope: "shared" as const, required: false, sortOrder: 60 },
  { fieldKey: "paymentPlan", label: "Ödeme planı", fieldType: "multiline" as const, partyScope: "shared" as const, required: false, sortOrder: 80 },
  { fieldKey: "deliveryDate", label: "Teslim / devir tarihi", fieldType: "date" as const, partyScope: "shared" as const, required: false, sortOrder: 90 },
  { fieldKey: "technicalSpecificationNotes", label: "Teknik şartname notları", fieldType: "multiline" as const, partyScope: "shared" as const, required: false, sortOrder: 100 },
  { fieldKey: "legalBasisReferences", label: "İlgili kanun ve yönetmelik atıfları", fieldType: "multiline" as const, partyScope: "shared" as const, required: false, sortOrder: 110 },
] as const;

const SALE_CLOSING_FIELDS = [
  { fieldKey: "sellerName", label: "Satıcı adı veya unvanı", fieldType: "text" as const, partyScope: "seller" as const, required: true, sortOrder: 30 },
  { fieldKey: "buyerName", label: "Alıcı adı veya unvanı", fieldType: "text" as const, partyScope: "buyer" as const, required: true, sortOrder: 40 },
  { fieldKey: "salePrice", label: "Satış bedeli", fieldType: "currency" as const, partyScope: "shared" as const, required: true, sortOrder: 70 },
  { fieldKey: "finalDeedTransferDate", label: "Son tapu devir tarihi", fieldType: "date" as const, partyScope: "shared" as const, required: true, sortOrder: 92 },
  { fieldKey: "agreedWithdrawalFee", label: "Cayma bedeli", fieldType: "currency" as const, partyScope: "shared" as const, required: false, sortOrder: 94 },
] as const;

const LAND_SHARE_FIELDS = [
  { fieldKey: "landownerName", label: "Arsa sahibi adı veya unvanı", fieldType: "text" as const, partyScope: "landowner" as const, required: true, sortOrder: 30 },
  { fieldKey: "contractorName", label: "Yüklenici adı veya unvanı", fieldType: "text" as const, partyScope: "contractor" as const, required: true, sortOrder: 40 },
  { fieldKey: "landShareRatio", label: "Arsa payı / bağımsız bölüm paylaşım özeti", fieldType: "multiline" as const, partyScope: "shared" as const, required: true, sortOrder: 70 },
  { fieldKey: "projectDescription", label: "Proje ve yapı tanımı", fieldType: "multiline" as const, partyScope: "shared" as const, required: false, sortOrder: 75 },
] as const;

export function getDefaultFormFields(formType: ContractFormType) {
  return formType === "sale_closing"
    ? [...COMMON_FORM_FIELDS, ...SALE_CLOSING_FIELDS].sort((a, b) => a.sortOrder - b.sortOrder)
    : [...COMMON_FORM_FIELDS, ...LAND_SHARE_FIELDS].sort((a, b) => a.sortOrder - b.sortOrder);
}

export const EMPTY_FORM_BLUEPRINT = {
  sections: [
    { sectionKey: "general", sectionType: "general" as const, title: "Genel Sözleşme Bilgileri", sortOrder: 10 },
    { sectionKey: "technical", sectionType: "technical" as const, title: "Teknik Şartname", sortOrder: 20 },
    { sectionKey: "optional_clauses", sectionType: "optional_clauses" as const, title: "Tarafların İsteğe Bağlı Ek Maddeleri", sortOrder: 30 },
  ],
} as const;

export function renderContractFormOutput(input: {
  fields: Array<{ fieldKey: string; label: string; sortOrder: number }>;
  fieldValues: Record<string, unknown>;
  clauses: Array<{ id: number; title: string; bodyTemplate: string; sortOrder: number; status: string }>;
}) {
  return {
    fields: [...input.fields]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(field => ({
        fieldKey: field.fieldKey,
        label: field.label,
        value: input.fieldValues[field.fieldKey] == null ? "" : String(input.fieldValues[field.fieldKey]),
      })),
    clauses: activeClausesForOutput(input.clauses),
  };
}
