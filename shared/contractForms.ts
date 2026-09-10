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

export const EMPTY_FORM_BLUEPRINT = {
  sections: [
    { sectionKey: "general", sectionType: "general" as const, title: "Genel Sözleşme Bilgileri", sortOrder: 10 },
    { sectionKey: "technical", sectionType: "technical" as const, title: "Teknik Şartname", sortOrder: 20 },
    { sectionKey: "optional_clauses", sectionType: "optional_clauses" as const, title: "Tarafların İsteğe Bağlı Ek Maddeleri", sortOrder: 30 },
  ],
} as const;
