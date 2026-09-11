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
  requesterDisplayName?: string;
  includeRequesterFootnote?: boolean;
};

const REQUESTER_PARTY_LABELS: Record<ContractFormParty, string> = {
  shared: "Tarafların",
  seller: "Satıcı",
  buyer: "Alıcı",
  landowner: "Arsa sahibi",
  contractor: "Yüklenici",
};

export function requesterFootnote(input: {
  partyScope?: ContractFormParty;
  requesterDisplayName?: string | null;
  includeRequesterFootnote?: number | boolean | null;
}) {
  if (input.includeRequesterFootnote === false || input.includeRequesterFootnote === 0) return undefined;
  const displayName = input.requesterDisplayName?.trim();
  if (!displayName) return undefined;
  const partyLabel = REQUESTER_PARTY_LABELS[input.partyScope ?? "shared"];
  return `(Bu madde, ${partyLabel} ${displayName} talebi üzerine protokole eklenmiştir.)`;
}

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
    requesterDisplayName: input.requesterDisplayName?.trim() || undefined,
    includeRequesterFootnote: input.includeRequesterFootnote ?? true,
  };
}

export const SALE_CLOSING_APPROVED_ARTICLE_COUNT = 16;

export function activeClausesForOutput<T extends { status: string; bodyTemplate: string; sortOrder: number }>(clauses: T[]) {
  return clauses
    .filter(clause => clause.status === "active" && clause.bodyTemplate.trim().length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getSaleClosingArticleNumbering(activeOptionalClauseCount: number) {
  const safeCount = Math.max(0, Math.trunc(activeOptionalClauseCount));
  const firstOptionalArticleNumber = SALE_CLOSING_APPROVED_ARTICLE_COUNT + 1;
  const jurisdictionArticleNumber = firstOptionalArticleNumber + safeCount;
  const finalArticleNumber = jurisdictionArticleNumber + 1;
  return {
    firstOptionalArticleNumber,
    jurisdictionArticleNumber,
    finalArticleNumber,
    jurisdictionArticleTitle: "İzmir/Urla mahkemeleri",
  };
}

export function numberSaleClosingOptionalClauses<T>(clauses: T[]) {
  const { firstOptionalArticleNumber } = getSaleClosingArticleNumbering(clauses.length);
  return clauses.map((clause, index) => ({ ...clause, articleNumber: firstOptionalArticleNumber + index }));
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

export const TECHNICAL_FORM_FIELD_KEYS = [
  "technicalSpecificationNotes",
  "projectStandards",
  "soilStudyAndGroundImprovement",
  "approvedProjectReferences",
  "constructionMilestones",
  "temporaryAcceptanceCriteria",
  "warrantyAndInsuranceTerms",
  "technicalControlNotes",
] as const;

const TECHNICAL_MATERIAL_FIELDS = [
  { fieldKey: "technical_foundationAndGroundwork", label: "Temel ve zemin uygulamaları — silüet: B420C/S420 nervürlü demir, C30 grobeton, membran ve pas payı", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 200 },
  { fieldKey: "technical_waterproofingAndDrainage", label: "Perde beton, bohçalama ve su yalıtımı — silüet: membran, XPS, koruma duvarı ve drenaj", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 201 },
  { fieldKey: "technical_concreteAndMasonry", label: "Beton, duvar ve dolgu — silüet: C30/C35 beton, dikey-yatay delikli tuğla ve mıcır", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 202 },
  { fieldKey: "technical_exteriorFacade", label: "Dış cephe, taş/granit ve kaplama — silüet: mekanik kaplama, taş yünü ve buhar kesici", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 203 },
  { fieldKey: "technical_insulation", label: "Isı ve su yalıtımı — silüet: taş yünü, XPS ve marka/ürün standardı", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 204 },
  { fieldKey: "technical_plasterAndPaint", label: "Sıva ve boya — silüet: alçı sıva, köşe profili, sıva filesi ve iç cephe boya", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 205 },
  { fieldKey: "technical_windowsAndGlazing", label: "Doğrama ve cam — silüet: ısı yalıtımlı alüminyum, sineklik, ısıcam ve kaplama", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 206 },
  { fieldKey: "technical_shutters", label: "Panjurlar — silüet: otomasyon, manuel anahtar, alüminyum panel ve motor", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 207 },
  { fieldKey: "technical_doorsAndHardware", label: "Kapı, kasa, pervaz ve donanım — silüet: iç kapı, çelik kapı ve kilit sistemi", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 208 },
  { fieldKey: "technical_cabinetsAndJoinery", label: "Mutfak, banyo, gömme dolap ve vestiyer — silüet: MDF lam/lake, kuvars ve donanım", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 209 },
  { fieldKey: "technical_floorAndWallFinishes", label: "Taban, duvar ve merdiven kaplamaları — silüet: seramik, mermer ve kaydırmaz yüzey", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 210 },
  { fieldKey: "technical_kitchenEquipment", label: "Mutfak eviyesi, batarya ve ankastre set — silüet: marka/model veya muadili", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 211 },
  { fieldKey: "technical_bathroomEquipment", label: "Banyo armatürleri, klozet, duş ve havalandırma — silüet: marka/model veya muadili", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 212 },
  { fieldKey: "technical_plumbingAndHeating", label: "Sıhhi tesisat, kombi ve yerden ısıtma — silüet: kapasite, boru tipi ve sistem markası", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 213 },
  { fieldKey: "technical_electricalInstallation", label: "Elektrik tesisatı ve priz planı — silüet: kablo, priz, sigorta, kaçak akım ve topraklama", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 214 },
  { fieldKey: "technical_communicationInfrastructure", label: "Uydu, internet, telefon ve TV altyapısı — silüet: merkezi sistem, fiber ve Cat6", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 215 },
  { fieldKey: "technical_automationAndIntercom", label: "Bina otomasyonu, diafon ve güvenlik — silüet: interkom, dedektör, sulama ve panjur kontrolü", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 216 },
  { fieldKey: "technical_hvacAndCooling", label: "Isıtma, soğutma ve klima — silüet: kapasite, dış ünite konumu ve yerden ısıtma", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 217 },
  { fieldKey: "technical_waterSupply", label: "Su temini, artezyen, depo ve hidrofor — silüet: şehir suyu, bahçe/havuz suyu ve kullanım sınırı", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 218 },
  { fieldKey: "technical_landscapeAndGarden", label: "Peyzaj, bahçe ve dış aydınlatma — silüet: toprak, çim, çit, sulama ve LED", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 219 },
  { fieldKey: "technical_pool", label: "Havuz ve makine dairesi — silüet: beton, yalıtım, seramik, filtrasyon ve klorlama", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 220 },
  { fieldKey: "technical_roofAndTerrace", label: "Çatı, çatı terası ve kışlık bahçe — silüet: çatı sistemi, yalıtım ve kullanım tahsisi", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 221 },
  { fieldKey: "technical_officeAppendix", label: "Ofis eklentisi — silüet: A Blok 1 ve 5 için ofis planı, iklimlendirme ve cephe", fieldType: "multiline" as const, partyScope: "shared" as const, required: true, sortOrder: 222 },
  { fieldKey: "technical_facadeApproval", label: "Dış cephe tasarım ve onay süreci — silüet: render, kesit, numune ve yazılı onay", fieldType: "multiline" as const, partyScope: "shared" as const, required: true, sortOrder: 223 },
  { fieldKey: "technical_warrantyDetails", label: "Ürün ve imalat garanti detayları — silüet: ürün garantisi ve yüklenici giderim süresi", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 224 },
] as const;

const LAND_SHARE_FIELDS = [
  { fieldKey: "landownerName", label: "Arsa sahibi adı veya unvanı", fieldType: "text" as const, partyScope: "landowner" as const, required: true, sortOrder: 30 },
  { fieldKey: "landownerRepresentativeName", label: "Arsa sahibi vekili adı veya unvanı", fieldType: "text" as const, partyScope: "landowner" as const, required: false, sortOrder: 31 },
  { fieldKey: "powerOfAttorneyReference", label: "Vekâletname tarih ve yevmiye bilgisi", fieldType: "text" as const, partyScope: "landowner" as const, required: false, sortOrder: 32 },
  { fieldKey: "contractorName", label: "Yüklenici adı veya unvanı", fieldType: "text" as const, partyScope: "contractor" as const, required: true, sortOrder: 40 },
  { fieldKey: "contractorRepresentativeName", label: "Yüklenici temsilcisi", fieldType: "text" as const, partyScope: "contractor" as const, required: false, sortOrder: 41 },
  { fieldKey: "propertyProvince", label: "Taşınmaz ili", fieldType: "text" as const, partyScope: "shared" as const, required: true, sortOrder: 50 },
  { fieldKey: "propertyDistrict", label: "Taşınmaz ilçesi", fieldType: "text" as const, partyScope: "shared" as const, required: true, sortOrder: 51 },
  { fieldKey: "propertyNeighborhood", label: "Taşınmaz mahallesi", fieldType: "text" as const, partyScope: "shared" as const, required: true, sortOrder: 52 },
  { fieldKey: "titleDeedParcelDetails", label: "Pafta, ada ve parsel bilgileri", fieldType: "multiline" as const, partyScope: "shared" as const, required: true, sortOrder: 53 },
  { fieldKey: "projectNameAndLogo", label: "Proje adı ve logo kararı", fieldType: "text" as const, partyScope: "shared" as const, required: false, sortOrder: 54 },
  { fieldKey: "landShareRatio", label: "Arsa sahibi / yüklenici paylaşım oranı", fieldType: "text" as const, partyScope: "shared" as const, required: true, sortOrder: 70 },
  { fieldKey: "independentSectionDistribution", label: "Bağımsız bölüm paylaşım tablosu", fieldType: "multiline" as const, partyScope: "shared" as const, required: true, sortOrder: 71 },
  { fieldKey: "totalIndependentSections", label: "Toplam bağımsız bölüm sayısı", fieldType: "number" as const, partyScope: "shared" as const, required: true, sortOrder: 72 },
  { fieldKey: "apartmentAndVillaCounts", label: "Daire ve villa adetleri", fieldType: "text" as const, partyScope: "shared" as const, required: false, sortOrder: 73 },
  { fieldKey: "officeSections", label: "Ofis/büro olarak belirlenecek bağımsız bölümler", fieldType: "text" as const, partyScope: "shared" as const, required: false, sortOrder: 74 },
  { fieldKey: "projectDescription", label: "Proje ve yapı tanımı", fieldType: "multiline" as const, partyScope: "shared" as const, required: true, sortOrder: 75 },
  { fieldKey: "landDeliveryDeadlineDays", label: "Yer teslimi süresi (gün)", fieldType: "number" as const, partyScope: "landowner" as const, required: false, sortOrder: 80 },
  { fieldKey: "projectPreparationDeadlineDays", label: "Proje hazırlama süresi (gün)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 81 },
  { fieldKey: "permitApplicationDeadlineDays", label: "Ruhsat başvuru süresi (iş günü)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 82 },
  { fieldKey: "buildingPermitDeadlineMonths", label: "Yapı ruhsatı alma süresi (ay)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 83 },
  { fieldKey: "constructionStartDeadlineDays", label: "Ruhsat sonrası işe başlama süresi (gün)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 84 },
  { fieldKey: "completionDeadlineMonths", label: "İşi tamamlama süresi (ay)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 85 },
  { fieldKey: "constructionMilestones", label: "İnşaat ara takvimi", fieldType: "multiline" as const, partyScope: "contractor" as const, required: false, sortOrder: 86 },
  { fieldKey: "contractorTransferStages", label: "Yükleniciye kademeli devir etapları", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 90 },
  { fieldKey: "specialTransferCondition", label: "Özel bağımsız bölüm devir koşulu", fieldType: "multiline" as const, partyScope: "contractor" as const, required: false, sortOrder: 91 },
  { fieldKey: "delayPenaltyAmount", label: "Geç teslim bedeli", fieldType: "currency" as const, partyScope: "shared" as const, required: false, sortOrder: 100 },
  { fieldKey: "delayPenaltyCurrency", label: "Geç teslim bedeli para birimi", fieldType: "select" as const, partyScope: "shared" as const, optionsJson: JSON.stringify(["TL", "USD", "EUR", "Diğer"]), required: false, sortOrder: 101 },
  { fieldKey: "generalPenaltyAmount", label: "Genel cezai şart", fieldType: "currency" as const, partyScope: "shared" as const, required: false, sortOrder: 102 },
  { fieldKey: "forceMajeureMaximumDays", label: "Mücbir sebep azami ek süre (gün)", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 103 },
  { fieldKey: "warrantyPeriodYears", label: "Garanti süresi (yıl)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 104 },
  { fieldKey: "noticePeriodDays", label: "Genel fesih ihtar süresi (gün)", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 105 },
  { fieldKey: "technicalSpecificationNotes", label: "Teknik Şartname bağlantı notları", fieldType: "multiline" as const, partyScope: "shared" as const, required: true, sortOrder: 110 },
  { fieldKey: "projectStandards", label: "Proje ve imalat standartları", fieldType: "multiline" as const, partyScope: "contractor" as const, required: false, sortOrder: 111 },
  { fieldKey: "soilStudyAndGroundImprovement", label: "Zemin etüdü ve zemin iyileştirme koşulları", fieldType: "multiline" as const, partyScope: "contractor" as const, required: false, sortOrder: 112 },
  { fieldKey: "approvedProjectReferences", label: "Onaylı mimari ve mühendislik proje referansları", fieldType: "multiline" as const, partyScope: "shared" as const, required: false, sortOrder: 113 },
  { fieldKey: "temporaryAcceptanceCriteria", label: "Geçici kabul ve eksik/kusurlu işler kriterleri", fieldType: "multiline" as const, partyScope: "shared" as const, required: false, sortOrder: 114 },
  { fieldKey: "warrantyAndInsuranceTerms", label: "Garanti ve sigorta bilgileri", fieldType: "multiline" as const, partyScope: "contractor" as const, required: false, sortOrder: 115 },
  { fieldKey: "technicalControlNotes", label: "Teknik kontrol ve raporlama notları", fieldType: "multiline" as const, partyScope: "shared" as const, required: false, sortOrder: 116 },
  { fieldKey: "taxAndInvoiceProcedure", label: "Faturalaşma ve vergisel belgeleşme usulü", fieldType: "multiline" as const, partyScope: "shared" as const, required: false, sortOrder: 120 },
  { fieldKey: "officialApplicationsAndAnnotation", label: "Resmî başvurular ve tapu şerhi bilgileri", fieldType: "multiline" as const, partyScope: "shared" as const, required: false, sortOrder: 121 },
  { fieldKey: "noticeAddresses", label: "Yasal tebligat adresleri", fieldType: "multiline" as const, partyScope: "shared" as const, required: true, sortOrder: 130 },
  { fieldKey: "noticeEmails", label: "Yazılı bildirim e-posta adresleri", fieldType: "multiline" as const, partyScope: "shared" as const, required: false, sortOrder: 131 },
  { fieldKey: "notaryFeeBaseAmount", label: "Noter harç matrahı", fieldType: "currency" as const, partyScope: "shared" as const, required: false, sortOrder: 140 },
  { fieldKey: "competentCourtAndEnforcementOffice", label: "Yetkili mahkeme ve icra daireleri", fieldType: "text" as const, partyScope: "shared" as const, required: true, sortOrder: 141 },
  { fieldKey: "copyCount", label: "Sözleşme nüsha sayısı", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 142 },
  { fieldKey: "annexRegister", label: "Sözleşme ekleri kayıt listesi", fieldType: "multiline" as const, partyScope: "shared" as const, required: true, sortOrder: 143 },
] as const;

const LAND_SHARE_FORM_FIELDS = [...LAND_SHARE_FIELDS, ...TECHNICAL_MATERIAL_FIELDS] as const;

export function getDefaultFormFields(formType: ContractFormType) {
  return formType === "sale_closing"
    ? [...COMMON_FORM_FIELDS, ...SALE_CLOSING_FIELDS].sort((a, b) => a.sortOrder - b.sortOrder)
    : [...COMMON_FORM_FIELDS, ...LAND_SHARE_FORM_FIELDS].sort((a, b) => a.sortOrder - b.sortOrder);
}

export type RequiredContractFormField = { fieldKey: string; label: string; required?: boolean | number };

export function getMissingRequiredContractFormFields(
  fields: RequiredContractFormField[],
  fieldValues: Record<string, unknown>,
) {
  return fields
    .filter(field => field.required === true || field.required === 1)
    .filter(field => {
      const value = fieldValues[field.fieldKey];
      return value == null || (typeof value === "string" && value.trim().length === 0);
    })
    .map(field => ({ fieldKey: field.fieldKey, label: field.label }));
}

export function contractFormFieldsComplete(
  fields: RequiredContractFormField[],
  fieldValues: Record<string, unknown>,
) {
  return getMissingRequiredContractFormFields(fields, fieldValues).length === 0;
}

export function isTechnicalContractFormField(fieldKey: string) {
  return TECHNICAL_FORM_FIELD_KEYS.includes(fieldKey as (typeof TECHNICAL_FORM_FIELD_KEYS)[number]) || fieldKey.startsWith("technical_");
}

export type ContractFormAttachmentStatus = "missing" | "draft" | "ready" | "archived";

export function getMissingRequiredContractFormAttachments(
  attachments: Array<{ title: string; required: boolean | number; status: ContractFormAttachmentStatus }>,
) {
  return attachments
    .filter(attachment => (attachment.required === true || attachment.required === 1) && attachment.status !== "ready")
    .map(attachment => attachment.title);
}

export const LAND_SHARE_ATTACHMENT_DEFINITIONS = [
  { attachmentType: "technical_specification" as const, title: "EK-1 Teknik Şartname", required: true },
  { attachmentType: "numbering_sketch" as const, title: "EK-2 Numarataj Krokisi", required: false },
  { attachmentType: "management_plan" as const, title: "EK-3 Yönetim Planına Dercedilecek Hükümler", required: false },
  { attachmentType: "power_of_attorney" as const, title: "EK-4 Arsa Sahibi Vekâletnamesi", required: false },
  { attachmentType: "signature_circular" as const, title: "EK-5 Yüklenici İmza Sirküleri", required: false },
] as const;

export const EMPTY_FORM_BLUEPRINT = {
  sections: [
    { sectionKey: "general", sectionType: "general" as const, title: "Genel Sözleşme Bilgileri", sortOrder: 10 },
    { sectionKey: "technical", sectionType: "technical" as const, title: "Teknik Şartname", sortOrder: 20 },
    { sectionKey: "optional_clauses", sectionType: "optional_clauses" as const, title: "Tarafların İsteğe Bağlı Ek Maddeleri", sortOrder: 30 },
  ],
} as const;

export function renderContractFormOutput(input: {
  formType?: ContractFormType;
  fields: Array<{ fieldKey: string; label: string; sortOrder: number; required?: boolean | number }>;
  fieldValues: Record<string, unknown>;
  clauses: Array<{ id: number; title: string; bodyTemplate: string; sortOrder: number; status: string; partyScope?: ContractFormParty; requesterDisplayName?: string | null; includeRequesterFootnote?: number | boolean | null }>;
}) {
  const missingRequiredFields = getMissingRequiredContractFormFields(input.fields, input.fieldValues);
  return {
    missingRequiredFields,
    fields: [...input.fields]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(field => ({
        fieldKey: field.fieldKey,
        label: field.label,
        value: input.fieldValues[field.fieldKey] == null ? "" : String(input.fieldValues[field.fieldKey]),
      })),
    clauses: (() => {
      const activeClauses = activeClausesForOutput(input.clauses);
      const numberedClauses = input.formType === "sale_closing" ? numberSaleClosingOptionalClauses(activeClauses) : activeClauses;
      return numberedClauses.map((clause, index) => ({
        ...clause,
        clauseNumber: index + 1,
        requesterFootnote: requesterFootnote(clause),
      }));
    })(),
  };
}


export const SALE_CLOSING_PREPARATION_CHECKS = [
  { key: "parties_verified", label: "Alıcı ve Satıcı bilgileri görüşme ve kimlik belgeleriyle doğrulandı.", required: true },
  { key: "property_verified", label: "Taşınmazın adresi, tapu ve bağımsız bölüm bilgileri doğrulandı.", required: true },
  { key: "title_deed_debt_checked", label: "Takyidat ve borç ön kontrolü tamamlandı; satışa engel bir durum bulunmadığı teyit edildi.", required: true },
  { key: "sale_price_payment_checked", label: "Toplam satış bedeli, tapu işlem tutarı, kapora ve bakiye birbiriyle kontrol edildi.", required: true },
  { key: "withdrawal_fee_confirmed", label: "Sabit cayma bedeli görüşmede belirlendi ve protokole yazılacak tutar kontrol edildi.", required: true },
  { key: "commission_terms_checked", label: "Komisyon oranı, taraf payları ve tapu devri sonrası ödeme zamanı kontrol edildi.", required: true },
  { key: "power_of_attorney_checked", label: "Vekâletle işlem varsa vekâletname ve temsil yetkisi kontrol edildi; yoksa bu durum teyit edildi.", required: true },
  { key: "payment_evidence_planned", label: "Havale dekontları ile nakit teslim belgesinin alınması ve saklanması planlandı.", required: true },
] as const;

export type PreparationCheckKey = (typeof SALE_CLOSING_PREPARATION_CHECKS)[number]["key"];

export function preparationChecksComplete(checks: Record<string, boolean>) {
  return SALE_CLOSING_PREPARATION_CHECKS.every(check => checks[check.key] === true);
}

export function normalizePreparationChecks(checks: Record<string, unknown>) {
  return Object.fromEntries(
    SALE_CLOSING_PREPARATION_CHECKS.map(check => [check.key, checks[check.key] === true])
  ) as Record<PreparationCheckKey, boolean>;
}
