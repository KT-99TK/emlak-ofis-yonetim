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
  { fieldKey: "localAuthorityName", label: "İlgili belediye/yerel idare adı", fieldType: "text" as const, partyScope: "shared" as const, required: false, sortOrder: 55 },
  { fieldKey: "officialInstitutionsAndApplications", label: "Resmî kurumlar ve başvuru kapsamı", fieldType: "multiline" as const, partyScope: "shared" as const, required: false, sortOrder: 56 },
  { fieldKey: "landShareRatio", label: "Arsa sahibi / yüklenici paylaşım oranı", fieldType: "text" as const, partyScope: "shared" as const, required: true, sortOrder: 70 },
  { fieldKey: "independentSectionDistribution", label: "Bağımsız bölüm paylaşım tablosu", fieldType: "multiline" as const, partyScope: "shared" as const, required: true, sortOrder: 71 },
  { fieldKey: "totalIndependentSections", label: "Toplam bağımsız bölüm sayısı", fieldType: "number" as const, partyScope: "shared" as const, required: true, sortOrder: 72 },
  { fieldKey: "apartmentAndVillaCounts", label: "Daire ve villa adetleri", fieldType: "text" as const, partyScope: "shared" as const, required: false, sortOrder: 73 },
  { fieldKey: "officeSections", label: "Ofis/büro olarak belirlenecek bağımsız bölümler", fieldType: "text" as const, partyScope: "shared" as const, required: false, sortOrder: 74 },
  { fieldKey: "projectDescription", label: "Proje ve yapı tanımı", fieldType: "multiline" as const, partyScope: "shared" as const, required: true, sortOrder: 75 },
  { fieldKey: "landDeliveryDeadlineDays", label: "Yer teslimi süresi (gün)", fieldType: "number" as const, partyScope: "landowner" as const, required: false, sortOrder: 80 },
  { fieldKey: "projectPreparationDeadlineDays", label: "Proje hazırlama süresi (gün)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 81 },
  { fieldKey: "permitApplicationDeadlineDays", label: "Ruhsat başvuru süresi (iş günü)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 82 },
  { fieldKey: "approvedProjectPermitDeadlineMonths", label: "Proje onayından sonra ruhsat süresi (ay)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 82.5 },
  { fieldKey: "buildingPermitDeadlineMonths", label: "Yapı ruhsatı alma süresi (ay)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 83 },
  { fieldKey: "constructionStartDeadlineDays", label: "Ruhsat sonrası işe başlama süresi (gün)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 84 },
  { fieldKey: "completionDeadlineMonths", label: "İşi tamamlama süresi (ay)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 85 },
  { fieldKey: "constructionMilestones", label: "İnşaat ara takvimi", fieldType: "multiline" as const, partyScope: "contractor" as const, required: false, sortOrder: 86 },
  { fieldKey: "contractorTransferStages", label: "Yükleniciye kademeli devir etapları", fieldType: "multiline" as const, partyScope: "contractor" as const, required: true, sortOrder: 90 },
  { fieldKey: "contractorSectionSummary", label: "Yükleniciye ait bağımsız bölüm özeti", fieldType: "multiline" as const, partyScope: "contractor" as const, required: false, sortOrder: 90.5 },
  { fieldKey: "landShareTransferDemandDeadlineDays", label: "Tapu devir talep süresi (gün)", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 90.55 },
  { fieldKey: "transferReviewDeadlineDays", label: "Devir aşaması kontrol süresi (gün)", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 90.6 },
  { fieldKey: "specialTransferCondition", label: "Özel bağımsız bölüm devir koşulu", fieldType: "multiline" as const, partyScope: "contractor" as const, required: false, sortOrder: 91 },
  { fieldKey: "delayPenaltyAmount", label: "Geç teslim bedeli", fieldType: "currency" as const, partyScope: "shared" as const, required: false, sortOrder: 100 },
  { fieldKey: "delayPenaltyDailyAmount", label: "Günlük geç teslim bedeli", fieldType: "currency" as const, partyScope: "shared" as const, required: false, sortOrder: 100.5 },
  { fieldKey: "delayPenaltyTriggerMonths", label: "Cezai şart tetiklenme süresi (ay)", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 100.6 },
  { fieldKey: "delayNotificationDeadlineDays", label: "Gecikme bildirim süresi (gün)", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 100.7 },
  { fieldKey: "contractDate", label: "Sözleşme tarihi", fieldType: "date" as const, partyScope: "shared" as const, required: false, sortOrder: 141.5 },
  { fieldKey: "delayPenaltyCurrency", label: "Geç teslim bedeli para birimi", fieldType: "select" as const, partyScope: "shared" as const, optionsJson: JSON.stringify(["TL", "USD", "EUR", "Diğer"]), required: false, sortOrder: 101 },
  { fieldKey: "generalPenaltyAmount", label: "Genel cezai şart", fieldType: "currency" as const, partyScope: "shared" as const, required: false, sortOrder: 102 },
  { fieldKey: "forceMajeureMaximumDays", label: "Mücbir sebep azami ek süre (gün)", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 103 },
  { fieldKey: "warrantyPeriodYears", label: "Garanti süresi (yıl)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 104 },
  { fieldKey: "noticePeriodDays", label: "Genel fesih ihtar süresi (gün)", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 105 },
  { fieldKey: "receiptDeliveryDeadlineMonths", label: "Ödeme belgesi teslim süresi (ay)", fieldType: "number" as const, partyScope: "contractor" as const, required: false, sortOrder: 105.1 },
  { fieldKey: "supplierComplaintCureDays", label: "Alt yüklenici/tedarikçi şikâyet giderme süresi (gün)", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 105.5 },
  { fieldKey: "temporaryAcceptanceNoticeDays", label: "Geçici kabul bildirim süresi (gün)", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 105.6 },
  { fieldKey: "temporaryAcceptanceThresholdPercent", label: "Geçici kabul imalat tamamlanma yüzdesi", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 105.65 },
  { fieldKey: "temporaryAcceptanceAdditionalPeriodMonths", label: "Geçici kabul eksik işleri ek süresi (ay)", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 105.7 },
  { fieldKey: "officialApplicationResponseDeadlineBusinessDays", label: "Vekil resmî işlem yanıt süresi (iş günü)", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 105.8 },
  { fieldKey: "heirReplacementDeadlineDays", label: "Vefat sonrası yeni vekil süresi (gün)", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 105.9 },
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
  { fieldKey: "technicalSpecificationPageCount", label: "Teknik Şartname sayfa sayısı", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 140.5 },
  { fieldKey: "competentCourtAndEnforcementOffice", label: "Yetkili mahkeme ve icra daireleri", fieldType: "text" as const, partyScope: "shared" as const, required: true, sortOrder: 141 },
  { fieldKey: "executionPlace", label: "Düzenleme/noter yeri", fieldType: "text" as const, partyScope: "shared" as const, required: false, sortOrder: 141.2 },
  { fieldKey: "notaryOfficeName", label: "Noterlik adı", fieldType: "text" as const, partyScope: "shared" as const, required: false, sortOrder: 141.3 },
  { fieldKey: "copyCount", label: "Sözleşme nüsha sayısı", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 142 },
  { fieldKey: "totalContractArticles", label: "Sözleşme madde sayısı", fieldType: "number" as const, partyScope: "shared" as const, required: false, sortOrder: 142.5 },
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

export function parameterizeLandShareClauseBody(bodyTemplate: string) {
  return bodyTemplate
    .replace(/İzmir ili, Urla ilçesi, Güvendik Mahallesi'nde, tapunun L17-A-10-C-3-A ve L17-A-10-C-3-D paftaları, 2331 ada, 27 ve 39 parsel numaralarında kayıtlıdır\./g, "{{propertyProvince}} ili, {{propertyDistrict}} ilçesi, {{propertyNeighborhood}} Mahallesi'nde, tapunun {{titleDeedParcelDetails}} kayıtlıdır.")
    .replace(/24 daire ve 4 ikiz villa olmak üzere toplam 28 bağımsız bölüm/g, "{{apartmentAndVillaCounts}} olmak üzere toplam {{totalIndependentSections}} bağımsız bölüm")
    .replace(/Bu kapsamda;[\s\S]*?(?=d\. Kat mülkiyeti yönetim planına)/g, "Bu kapsamda; {{independentSectionDistribution}}. ")
    .replace(/8-1\.[\s\S]*?(?=8-2\.)/g, "8-1. {{contractorTransferStages}} ")
    .replace(/en geç 15 gün içinde/g, "en geç {{landDeliveryDeadlineDays}} gün içinde")
    .replace(/7 günlük süre içinde/g, "{{landShareTransferDemandDeadlineDays}} günlük süre içinde")
    .replace(/Yüklenici tarafından arsa sahibi adına yapılan ödemelerin makbuz ve belge örnekleri, ödemeyi izleyen 1 ay içinde/g, "Yüklenici tarafından arsa sahibi adına yapılan ödemelerin makbuz ve belge örnekleri, ödemeyi izleyen {{receiptDeliveryDeadlineMonths}} ay içinde")
    .replace(/en geç 90 gün içinde hazırlanarak/g, "en geç {{projectPreparationDeadlineDays}} gün içinde hazırlanarak")
    .replace(/en geç 15 iş günü içinde inşaat ruhsatı/g, "en geç {{permitApplicationDeadlineDays}} iş günü içinde inşaat ruhsatı")
    .replace(/6 ay içinde inşaat ruhsatını/g, "{{approvedProjectPermitDeadlineMonths}} ay içinde inşaat ruhsatını")
    .replace(/12 ay içinde yapı ruhsatı/g, "{{buildingPermitDeadlineMonths}} ay içinde yapı ruhsatı")
    .replace(/en geç 30 gün içinde şantiyeyi/g, "en geç {{constructionStartDeadlineDays}} gün içinde şantiyeyi")
    .replace(/en geç 18 ay içinde işi/g, "en geç {{completionDeadlineMonths}} ay içinde işi")
    .replace(/10 gün içinde arsa sahibine/g, "{{delayNotificationDeadlineDays}} gün içinde arsa sahibine")
    .replace(/kaba inşaat 6\. ay;[\s\S]*?18\. ay sonuna kadar\./g, "{{constructionMilestones}}.")
    .replace(/%90 seviyesine/g, "%{{temporaryAcceptanceThresholdPercent}} seviyesine")
    .replace(/15 gün önceden yazılı bildirimi/g, "{{temporaryAcceptanceNoticeDays}} gün önceden yazılı bildirimi")
    .replace(/1 aylık ek süre/g, "{{temporaryAcceptanceAdditionalPeriodMonths}} aylık ek süre")
    .replace(/5 yıl süreyle/g, "{{warrantyPeriodYears}} yıl süreyle")
    .replace(/1\.500 USD \(bin beş yüz Amerikan Doları\)/g, "{{delayPenaltyAmount}} {{delayPenaltyCurrency}}")
    .replace(/50 USD \(1\.500 USD'nin otuzda biri\)/g, "{{delayPenaltyDailyAmount}} {{delayPenaltyCurrency}}")
    .replace(/kesintisiz 3 ay tahakkuku/g, "kesintisiz {{delayPenaltyTriggerMonths}} ay tahakkuku")
    .replace(/azami 60 gün/g, "azami {{forceMajeureMaximumDays}} gün")
    .replace(/10\.000\.000 TL \(on milyon Türk Lirası\)/g, "{{generalPenaltyAmount}} TL")
    .replace(/15 gün içinde giderilmemesi/g, "{{supplierComplaintCureDays}} gün içinde giderilmemesi")
    .replace(/60 günlük ihtara gerek olmaksızın/g, "{{noticePeriodDays}} günlük ihtara gerek olmaksızın")
    .replace(/en az 60 gün süreli ihtar/g, "en az {{noticePeriodDays}} gün süreli ihtar")
    .replace(/en geç 5 iş günü içinde/g, "en geç {{officialApplicationResponseDeadlineBusinessDays}} iş günü içinde")
    .replace(/60 gün içinde yeni bir vekil/g, "{{heirReplacementDeadlineDays}} gün içinde yeni bir vekil")
    .replace(/60 gün içinde sözleşme hükümlerine/g, "{{heirReplacementDeadlineDays}} gün içinde sözleşme hükümlerine")
    .replace(/Urla Mahkemeleri ve İcra Daireleri/g, "{{competentCourtAndEnforcementOffice}}")
    .replace(/\[\.……...........\] TL \(\[\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\.\] Türk Lirası\)/g, "{{notaryFeeBaseAmount}} TL")
    .replace(/Teknik Şartname \(9 Sayfa\)/g, "Teknik Şartname ({{technicalSpecificationPageCount}} Sayfa)")
    .replace(/İşbu sözleşme …\/.…\/.2026 tarihinde/g, "İşbu sözleşme {{contractDate}} tarihinde")
    .replace(/Urla 1\. Noterliğince/g, "{{notaryOfficeName}} Noterliğince")
    .replace(/2 nüsha olarak/g, "{{copyCount}} nüsha olarak")
    .replace(/Urla Belediyesinin/g, "{{localAuthorityName}}'nin")
    .replace(/Urla Belediyesince/g, "{{localAuthorityName}}'nce")
    .replace(/İşbu sözleşme 21 maddeden/g, "İşbu sözleşme {{totalContractArticles}} maddeden");
}

export function resolveContractFormPlaceholders(bodyTemplate: string, fieldValues: Record<string, unknown>) {
  return bodyTemplate.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_match, fieldKey: string) => {
    const value = fieldValues[fieldKey];
    return value == null ? "" : String(value);
  });
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
        body: resolveContractFormPlaceholders(clause.bodyTemplate, input.fieldValues),
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
