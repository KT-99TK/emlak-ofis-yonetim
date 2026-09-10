import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  decimal,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const localLoginCredentials = mysqlTable("localLoginCredentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  loginName: varchar("loginName", { length: 120 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  temporaryPasswordExpiresAt: timestamp("temporaryPasswordExpiresAt"),
  temporaryPasswordUsedAt: timestamp("temporaryPasswordUsedAt"),
  mustChangePassword: int("mustChangePassword").default(1).notNull(),
  failedAttempts: int("failedAttempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil"),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const localLoginSessions = mysqlTable("localLoginSessions", {
  id: int("id").autoincrement().primaryKey(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  userId: int("userId").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  revokedAt: timestamp("revokedAt"),
});

export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  managerId: int("managerId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  teamId: int("teamId"),
  managerId: int("managerId"),
  officeRole: mysqlEnum("officeRole", [
    "broker_manager",
    "consultant",
    "office_assistant",
  ])
    .default("consultant")
    .notNull(),
  consultantCode: varchar("consultantCode", { length: 40 }).unique(),
  phone: varchar("phone", { length: 40 }),
  title: varchar("title", { length: 120 }),
  companyName: varchar("companyName", { length: 180 }),
  status: mysqlEnum("status", ["active", "inactive"])
    .default("active")
    .notNull(),
});

export const consultantAgreementProfiles = mysqlTable("consultantAgreementProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  consultantSharePercent: decimal("consultantSharePercent", { precision: 5, scale: 2 }).default("60").notNull(),
  officeSharePercent: decimal("officeSharePercent", { precision: 5, scale: 2 }).default("40").notNull(),
  monthlyDeskFee: decimal("monthlyDeskFee", { precision: 14, scale: 2 }).default("0").notNull(),
  validFrom: timestamp("validFrom").notNull(),
  validTo: timestamp("validTo"),
  status: mysqlEnum("status", ["draft", "active", "expired", "cancelled"]).default("draft").notNull(),
  approvedByUserId: int("approvedByUserId"),
  approvedAt: timestamp("approvedAt"),
  note: varchar("note", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["individual", "company"])
    .default("individual")
    .notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  identityOrTaxNo: varchar("identityOrTaxNo", { length: 40 }),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  assignedUserId: int("assignedUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Yeni kayıtlardaki ham telefon ve kimlik değerleri uygulama
 * tablolarından ayrı, AES-GCM ile şifreli kasada tutulur. */
export const sensitiveFieldVault = mysqlTable(
  "sensitiveFieldVault",
  {
    id: int("id").autoincrement().primaryKey(),
    entityType: varchar("entityType", { length: 60 }).notNull(),
    entityId: int("entityId").notNull(),
    fieldPath: varchar("fieldPath", { length: 180 }).notNull(),
    ciphertext: text("ciphertext").notNull(),
    iv: varchar("iv", { length: 32 }).notNull(),
    authTag: varchar("authTag", { length: 32 }).notNull(),
    keyVersion: varchar("keyVersion", { length: 32 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    entityFieldUnique: uniqueIndex("sensitive_vault_entity_field_unique").on(
      table.entityType,
      table.entityId,
      table.fieldPath
    ),
  })
);

export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  referenceNo: varchar("referenceNo", { length: 40 }).notNull().unique(),
  type: mysqlEnum("type", ["residential", "commercial", "land", "office"])
    .default("residential")
    .notNull(),
  listingType: mysqlEnum("listingType", ["sale", "rent"])
    .default("sale")
    .notNull(),
  ownerApprovalStatus: mysqlEnum("ownerApprovalStatus", [
    "notRequired",
    "pending",
    "approved",
    "rejected",
  ])
    .default("notRequired")
    .notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  address: text("address").notNull(),
  district: varchar("district", { length: 100 }),
  grossM2: decimal("grossM2", { precision: 10, scale: 2 }),
  roomCount: varchar("roomCount", { length: 30 }),
  price: decimal("price", { precision: 14, scale: 2 }),
  ownerClientId: int("ownerClientId"),
  assignedUserId: int("assignedUserId"),
  status: mysqlEnum("status", ["active", "reserved", "closed"])
    .default("active")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  contractNo: varchar("contractNo", { length: 60 }).notNull().unique(),
  type: mysqlEnum("type", ["rental", "sale", "authority"]).notNull(),
  subtype: varchar("subtype", { length: 80 }),
  status: mysqlEnum("status", [
    "draft",
    "review",
    "approved",
    "signed",
    "active",
    "completed",
    "cancelled",
  ])
    .default("draft")
    .notNull(),
  version: int("version").default(1).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  clientId: int("clientId"),
  propertyId: int("propertyId"),
  assignedUserId: int("assignedUserId"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  evictionNoticeDays: int("evictionNoticeDays"),
  evictionNoticeDate: timestamp("evictionNoticeDate"),
  ownerApprovalStatus: mysqlEnum("ownerApprovalStatus", [
    "notRequired",
    "pending",
    "approved",
    "rejected",
  ])
    .default("notRequired")
    .notNull(),
  ownerApprovalDate: timestamp("ownerApprovalDate"),
  ownerApprovalNote: text("ownerApprovalNote"),
  amount: decimal("amount", { precision: 14, scale: 2 }),
  currency: varchar("currency", { length: 8 }).default("TRY").notNull(),
  notes: text("notes"),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Dosya baytları güvenli obje depolamada kalır; merkezi veri tabanı yalnız erişim, bütünlük ve audit metadata’sını taşır. */
/** Standart metinlerden bağımsız form şablonları; gerçek hukuki maddeler kullanıcı metni geldikten sonra eklenir. */
export const contractFormTemplates = mysqlTable("contractFormTemplates", {
  id: int("id").autoincrement().primaryKey(),
  formType: mysqlEnum("formType", ["sale_closing", "land_share"]).notNull(),
  version: int("version").default(1).notNull(),
  status: mysqlEnum("status", ["draft", "review", "published", "archived"])
    .default("draft")
    .notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  legalReviewNote: text("legalReviewNote"),
  createdByUserId: int("createdByUserId").notNull(),
  approvedByUserId: int("approvedByUserId"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  formVersionUnique: uniqueIndex("contract_form_templates_type_version_unique").on(
    table.formType,
    table.version,
  ),
}));

export const contractFormSections = mysqlTable("contractFormSections", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull(),
  sectionKey: varchar("sectionKey", { length: 80 }).notNull(),
  sectionType: mysqlEnum("sectionType", ["general", "technical", "optional_clauses"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  contentTemplate: text("contentTemplate"),
  sortOrder: int("sortOrder").default(0).notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  templateSectionKeyUnique: uniqueIndex("contract_form_sections_template_key_unique").on(
    table.templateId,
    table.sectionKey,
  ),
}));

export const contractFormFields = mysqlTable("contractFormFields", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull(),
  sectionId: int("sectionId"),
  fieldKey: varchar("fieldKey", { length: 100 }).notNull(),
  label: varchar("label", { length: 200 }).notNull(),
  fieldType: mysqlEnum("fieldType", ["text", "multiline", "date", "currency", "number", "checkbox", "select"]).notNull(),
  partyScope: mysqlEnum("partyScope", ["shared", "seller", "buyer", "landowner", "contractor"])
    .default("shared")
    .notNull(),
  optionsJson: text("optionsJson"),
  required: int("required").default(0).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  templateFieldKeyUnique: uniqueIndex("contract_form_fields_template_key_unique").on(
    table.templateId,
    table.fieldKey,
  ),
}));

export const contractFormClauses = mysqlTable("contractFormClauses", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull(),
  partyScope: mysqlEnum("partyScope", ["shared", "seller", "buyer", "landowner", "contractor"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  bodyTemplate: text("bodyTemplate").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
  sourceNote: varchar("sourceNote", { length: 500 }),
  createdByUserId: int("createdByUserId").notNull(),
  approvedByUserId: int("approvedByUserId"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contractFormInstances = mysqlTable("contractFormInstances", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId").notNull(),
  templateId: int("templateId").notNull(),
  revision: int("revision").default(1).notNull(),
  fieldValuesJson: text("fieldValuesJson").notNull(),
  selectedClauseIdsJson: text("selectedClauseIdsJson").notNull(),
  status: mysqlEnum("status", ["draft", "review", "approved", "signed", "archived"])
    .default("draft")
    .notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  approvedByUserId: int("approvedByUserId"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  contractRevisionUnique: uniqueIndex("contract_form_instances_contract_revision_unique").on(
    table.contractId,
    table.revision,
  ),
}));

export const contractPreparationChecks = mysqlTable("contractPreparationChecks", {
  id: int("id").autoincrement().primaryKey(),
  draftKey: varchar("draftKey", { length: 120 }).notNull().unique(),
  formType: mysqlEnum("formType", ["sale_closing", "land_share"]).notNull(),
  checklistJson: text("checklistJson").notNull(),
  completed: int("completed").default(0).notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  updatedByUserId: int("updatedByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contractDocuments = mysqlTable("contractDocuments", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId"),
  clientId: int("clientId"),
  assignedUserId: int("assignedUserId").notNull(),
  category: mysqlEnum("category", ["activeSigned", "archive"]).notNull(),
  documentType: varchar("documentType", { length: 40 }),
  documentDate: timestamp("documentDate"),
  historicalActivity: text("historicalActivity"),
  archiveNote: text("archiveNote"),
  originalFileName: varchar("originalFileName", { length: 255 }).notNull(),
  storageKey: varchar("storageKey", { length: 255 }).notNull().unique(),
  sha256: varchar("sha256", { length: 64 }).notNull(),
  byteSize: int("byteSize").notNull(),
  immutable: int("immutable").default(1).notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  invalidatedAt: timestamp("invalidatedAt"),
  invalidationReason: text("invalidationReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Arşiv PDF’si; ana müşteri yanında malik, kiracı veya diğer ilgili müşteri kartlarında da tek belge olarak bulunabilir. */
export const contractDocumentParticipants = mysqlTable(
  "contractDocumentParticipants",
  {
    id: int("id").autoincrement().primaryKey(),
    documentId: int("documentId").notNull(),
    clientId: int("clientId").notNull(),
    partyRole: mysqlEnum("partyRole", [
      "primary",
      "propertyOwner",
      "tenant",
      "other",
    ]).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

/** Ofis asistanı yalnız broker manager tarafından açıkça atandığı danışman kayıtlarına erişebilir. */
export const officeAssistantAssignments = mysqlTable(
  "officeAssistantAssignments",
  {
    id: int("id").autoincrement().primaryKey(),
    assistantUserId: int("assistantUserId").notNull(),
    consultantUserId: int("consultantUserId").notNull(),
    assignedByUserId: int("assignedByUserId").notNull(),
    active: int("active").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  }
);

/** Bankadan çekilip kasaya alınan tutar ile kasadan yapılan ödemelerin dar kapsamlı günlük kontrol kaydı. */
export const treasuryCashMovements = mysqlTable("treasuryCashMovements", {
  id: int("id").autoincrement().primaryKey(),
  movementType: mysqlEnum("movementType", [
    "bankToCash",
    "cashExpense",
    "cashReceipt",
    "cashDeposit",
    "other",
  ]).notNull(),
  direction: mysqlEnum("direction", ["in", "out"]).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  occurredOn: timestamp("occurredOn").notNull(),
  counterparty: varchar("counterparty", { length: 180 }).notNull(),
  evidenceReference: varchar("evidenceReference", { length: 180 }).notNull(),
  note: text("note"),
  status: mysqlEnum("status", [
    "declared",
    "managerVerified",
    "reconciled",
    "voided",
  ])
    .default("declared")
    .notNull(),
  enteredByUserId: int("enteredByUserId").notNull(),
  verifiedByUserId: int("verifiedByUserId"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Fizikî sayım ve managerın gün sonu kasa mutabakatı. */
export const treasuryCashDailyCounts = mysqlTable("treasuryCashDailyCounts", {
  id: int("id").autoincrement().primaryKey(),
  controlDate: timestamp("controlDate").notNull(),
  openingCash: decimal("openingCash", { precision: 14, scale: 2 })
    .default("0")
    .notNull(),
  countedCash: decimal("countedCash", { precision: 14, scale: 2 }),
  closedByUserId: int("closedByUserId").notNull(),
  managerVerifiedAt: timestamp("managerVerifiedAt").defaultNow().notNull(),
  note: text("note"),
});

export const ledgerEntries = mysqlTable("ledgerEntries", {
  id: int("id").autoincrement().primaryKey(),
  entryType: mysqlEnum("entryType", [
    "income",
    "expense",
    "receivable",
    "payable",
  ]).notNull(),
  status: mysqlEnum("status", ["pending", "partial", "paid", "cancelled"])
    .default("pending")
    .notNull(),
  description: varchar("description", { length: 240 }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 14, scale: 2 })
    .default("0")
    .notNull(),
  dueDate: timestamp("dueDate"),
  contractId: int("contractId"),
  clientId: int("clientId"),
  assignedUserId: int("assignedUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const portfolioRightsTransfers = mysqlTable("portfolioRightsTransfers", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId"),
  propertyId: int("propertyId"),
  originatingConsultantUserId: int("originatingConsultantUserId").notNull(),
  fulfillingConsultantUserId: int("fulfillingConsultantUserId"),
  rightsOwnerType: mysqlEnum("rightsOwnerType", ["consultant", "office"]).default("consultant").notNull(),
  effectiveFrom: timestamp("effectiveFrom").notNull(),
  effectiveTo: timestamp("effectiveTo"),
  reason: varchar("reason", { length: 1000 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "cancelled"]).default("pending").notNull(),
  approvedByUserId: int("approvedByUserId"),
  approvedAt: timestamp("approvedAt"),
  createdByUserId: int("createdByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const commissionTransactions = mysqlTable("commissionTransactions", {
  id: int("id").autoincrement().primaryKey(),
  transactionNo: varchar("transactionNo", { length: 80 }).notNull().unique(),
  contractId: int("contractId"),
  buyerClientId: int("buyerClientId"),
  sellerClientId: int("sellerClientId"),
  netServiceFee: decimal("netServiceFee", { precision: 14, scale: 2 }).notNull(),
  discountAmount: decimal("discountAmount", { precision: 14, scale: 2 }).default("0").notNull(),
  vatAmount: decimal("vatAmount", { precision: 14, scale: 2 }).default("0").notNull(),
  collectedAmount: decimal("collectedAmount", { precision: 14, scale: 2 }).default("0").notNull(),
  consultantShare: decimal("consultantShare", { precision: 14, scale: 2 }).notNull(),
  global1881Share: decimal("global1881Share", { precision: 14, scale: 2 }).notNull(),
  externalOfficeShare: decimal("externalOfficeShare", { precision: 14, scale: 2 }).default("0").notNull(),
  externalOfficeRole: mysqlEnum("externalOfficeRole", ["none", "counterpartyPortfolio", "global1881External"]).default("none").notNull(),
  portfolioOwnerType: mysqlEnum("portfolioOwnerType", ["consultant", "office"]).default("consultant").notNull(),
  portfolioRightsPolicy: mysqlEnum("portfolioRightsPolicy", ["individualConsultant", "corporateOffice"]).default("individualConsultant").notNull(),
  originatingConsultantUserId: int("originatingConsultantUserId"),
  fulfillingConsultantUserId: int("fulfillingConsultantUserId"),
  consultantRightsSplitPercent: decimal("consultantRightsSplitPercent", { precision: 5, scale: 2 }).default("50").notNull(),
  originatingConsultantPayout: decimal("originatingConsultantPayout", { precision: 14, scale: 2 }).default("0").notNull(),
  fulfillingConsultantPayout: decimal("fulfillingConsultantPayout", { precision: 14, scale: 2 }).default("0").notNull(),
  rightsOfficePayout: decimal("rightsOfficePayout", { precision: 14, scale: 2 }).default("0").notNull(),
  corporateOfficePaysConsultant: int("corporateOfficePaysConsultant").default(1).notNull(),
  agreementProfileId: int("agreementProfileId"),
  snapshotConsultantSharePercent: decimal("snapshotConsultantSharePercent", { precision: 5, scale: 2 }).default("60").notNull(),
  snapshotOfficeSharePercent: decimal("snapshotOfficeSharePercent", { precision: 5, scale: 2 }).default("40").notNull(),
  snapshotMonthlyDeskFee: decimal("snapshotMonthlyDeskFee", { precision: 14, scale: 2 }).default("0").notNull(),
  status: mysqlEnum("status", ["declared", "managerVerified", "partiallySettled", "settled", "cancelled"]).default("declared").notNull(),
  collectionReference: varchar("collectionReference", { length: 180 }).notNull(),
  collectionNote: text("collectionNote"),
  declaredByUserId: int("declaredByUserId").notNull(),
  verifiedByUserId: int("verifiedByUserId"),
  verifiedAt: timestamp("verifiedAt"),
  verificationNote: text("verificationNote"),
  overrideReason: text("overrideReason"),
  externalOfficeAgreementReference: varchar("externalOfficeAgreementReference", { length: 180 }),
  externalOfficeAgreementPartyName: varchar("externalOfficeAgreementPartyName", { length: 180 }),
  externalOfficeAgreementScopeNote: text("externalOfficeAgreementScopeNote"),
  externalOfficeAgreementMinFee: decimal("externalOfficeAgreementMinFee", { precision: 14, scale: 2 }),
  externalOfficeAgreementMaxFee: decimal("externalOfficeAgreementMaxFee", { precision: 14, scale: 2 }),
  externalOfficeAgreementSignedAt: timestamp("externalOfficeAgreementSignedAt"),
  externalOfficeAgreementValidFrom: timestamp("externalOfficeAgreementValidFrom"),
  externalOfficeAgreementValidTo: timestamp("externalOfficeAgreementValidTo"),
  cancelReason: text("cancelReason"),
  settledAt: timestamp("settledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const commissionParticipants = mysqlTable("commissionParticipants", {
  id: int("id").autoincrement().primaryKey(),
  commissionTransactionId: int("commissionTransactionId").notNull(),
  participantType: mysqlEnum("participantType", ["consultant", "externalOffice"]).notNull(),
  side: mysqlEnum("side", ["buyer", "seller", "shared"]).notNull(),
  consultantUserId: int("consultantUserId"),
  participantCode: varchar("participantCode", { length: 60 }).notNull(),
  participantName: varchar("participantName", { length: 180 }).notNull(),
  externalOfficeName: varchar("externalOfficeName", { length: 180 }),
  rate: decimal("rate", { precision: 7, scale: 4 }).notNull(),
  share: decimal("share", { precision: 14, scale: 2 }).notNull(),
  consultantPayout: decimal("consultantPayout", { precision: 14, scale: 2 }).default("0").notNull(),
  globalOfficeShare: decimal("globalOfficeShare", { precision: 14, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const rentalObligations = mysqlTable("rentalObligations", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId"),
  propertyId: int("propertyId"),
  clientId: int("clientId"),
  assignedUserId: int("assignedUserId"),
  obligationType: mysqlEnum("obligationType", [
    "rent",
    "tax",
    "insurance",
    "other",
  ]).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 14, scale: 2 })
    .default("0")
    .notNull(),
  status: mysqlEnum("status", [
    "planned",
    "due",
    "paid",
    "overdue",
    "cancelled",
  ])
    .default("planned")
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Geçmiş sözleşme/PDF veya finans verisini taşımadan, halen devam eden kira
 * ilişkilerinin operasyonel takibi için broker manager onaylı kısa özet.
 */
export const activeRentalSummaries = mysqlTable("activeRentalSummaries", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  tenantName: varchar("tenantName", { length: 180 }).notNull(),
  tenantPhone: varchar("tenantPhone", { length: 40 }).notNull(),
  contractDate: timestamp("contractDate").notNull(),
  rentIncreaseDate: timestamp("rentIncreaseDate"),
  evictionDate: timestamp("evictionDate"),
  monthlyRent: decimal("monthlyRent", { precision: 14, scale: 2 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 120 }).notNull(),
  propertyLocation: varchar("propertyLocation", { length: 180 })
    .notNull()
    .default(""),
  unitInfo: varchar("unitInfo", { length: 100 }).notNull().default(""),
  authorityCode: varchar("authorityCode", { length: 60 }),
  assignedUserId: int("assignedUserId").notNull(),
  importFingerprint: varchar("importFingerprint", { length: 64 })
    .notNull()
    .unique(),
  importedByUserId: int("importedByUserId").notNull(),
  increaseRate: decimal("increaseRate", { precision: 7, scale: 4 }),
  increaseRateSource: varchar("increaseRateSource", { length: 180 }),
  increaseRatePeriod: varchar("increaseRatePeriod", { length: 20 }),
  increaseRateEntryMethod: mysqlEnum("increaseRateEntryMethod", [
    "official_reference",
    "manual",
  ])
    .default("manual")
    .notNull(),
  increaseRateEnteredByUserId: int("increaseRateEnteredByUserId"),
  increaseRateEnteredAt: timestamp("increaseRateEnteredAt"),
  noticeStatus: mysqlEnum("noticeStatus", [
    "notPrepared",
    "prepared",
    "reviewed",
    "shared",
  ])
    .default("notPrepared")
    .notNull(),
  noticePreparedAt: timestamp("noticePreparedAt"),
  noticeReviewedByUserId: int("noticeReviewedByUserId"),
  noticeReviewedAt: timestamp("noticeReviewedAt"),
  noticeSharedByUserId: int("noticeSharedByUserId"),
  noticeSharedAt: timestamp("noticeSharedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Müşteriye dış mesaj göndermeden önce danışman/broker tarafından izlenen hizmet görevi. */
export const rentalServiceTasks = mysqlTable("rentalServiceTasks", {
  id: int("id").autoincrement().primaryKey(),
  serviceKey: varchar("serviceKey", { length: 160 }).notNull().unique(),
  activeRentalSummaryId: int("activeRentalSummaryId"),
  clientId: int("clientId").notNull(),
  assignedUserId: int("assignedUserId").notNull(),
  serviceType: mysqlEnum("serviceType", [
    "rentIncrease",
    "eviction",
    "propertyTaxFirstInstallment",
    "propertyTaxSecondInstallment",
    "rentalIncomeTaxDeclaration",
    "ownerLeaseReview",
    "relettingPreparation",
  ]).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  status: mysqlEnum("status", [
    "planned",
    "prepared",
    "reviewed",
    "shared",
    "completed",
  ])
    .default("planned")
    .notNull(),
  preparedByUserId: int("preparedByUserId"),
  preparedAt: timestamp("preparedAt"),
  reviewedByUserId: int("reviewedByUserId"),
  reviewedAt: timestamp("reviewedAt"),
  sharedByUserId: int("sharedByUserId"),
  sharedAt: timestamp("sharedAt"),
  customerResponseNote: text("customerResponseNote"),
  ownerConfirmedTenantExit: int("ownerConfirmedTenantExit")
    .default(0)
    .notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Malik tarafından teyit edilmesi gereken, yalnız yaklaşık kira geliri vergisi ön bilgi parametreleri. */
export const rentalIncomeTaxProfiles = mysqlTable(
  "rentalIncomeTaxProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    clientId: int("clientId").notNull(),
    taxYear: int("taxYear").notNull(),
    ownershipSharePercent: decimal("ownershipSharePercent", {
      precision: 5,
      scale: 2,
    })
      .default("100")
      .notNull(),
    residentialExemptionEligible: int("residentialExemptionEligible")
      .default(0)
      .notNull(),
    expenseMethod: mysqlEnum("expenseMethod", ["lump_sum", "actual"])
      .default("lump_sum")
      .notNull(),
    actualExpenseTotal: decimal("actualExpenseTotal", {
      precision: 14,
      scale: 2,
    })
      .default("0")
      .notNull(),
    updatedByUserId: int("updatedByUserId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("rentalIncomeTaxProfiles_client_year_unique").on(
      table.clientId,
      table.taxYear
    ),
  ]
);

/** Broker managerın yalnız ofis operasyonuna ilişkin, müşteri detayı içermeyen yönlendirme notu. */
export const brokerGuidanceNotes = mysqlTable("brokerGuidanceNotes", {
  id: int("id").autoincrement().primaryKey(),
  subject: mysqlEnum("subject", [
    "rental_service",
    "contract_review",
    "collection",
    "general",
  ]).notNull(),
  summary: varchar("summary", { length: 280 }).notNull(),
  status: mysqlEnum("status", ["open", "resolved"])
    .default("open")
    .notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  resolvedByUserId: int("resolvedByUserId"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reminderPreferences = mysqlTable("reminderPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  enabled: int("enabled").default(1).notNull(),
  leadDays: varchar("leadDays", { length: 80 })
    .default("30,14,7,3,1")
    .notNull(),
  inAppEnabled: int("inAppEnabled").default(1).notNull(),
  emailEnabled: int("emailEnabled").default(0).notNull(),
  scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }).unique(),
  lastReminderRunKey: varchar("lastReminderRunKey", { length: 80 }),
});

export const backupManifests = mysqlTable("backupManifests", {
  id: int("id").autoincrement().primaryKey(),
  createdByUserId: int("createdByUserId").notNull(),
  storageKey: varchar("storageKey", { length: 255 }).notNull(),
  checksum: varchar("checksum", { length: 128 }).notNull(),
  schemaVersion: varchar("schemaVersion", { length: 30 }).notNull(),
  recordCount: int("recordCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Merkezi çalışma alanının eski offline veriyi taşımadan başlayacağı sınırı
 * broker manager tarafından bir kez tanımlanır. Açılış bakiyesi veya devir
 * tutarı tutulmaz; bu ayardan önce tarihli yeni merkezi kayıt oluşturulamaz.
 */
export const onlineStartSettings = mysqlTable("onlineStartSettings", {
  id: int("id").autoincrement().primaryKey(),
  effectiveAt: timestamp("effectiveAt").notNull(),
  mode: mysqlEnum("mode", ["freshStart"]).default("freshStart").notNull(),
  noBalanceCarry: int("noBalanceCarry").default(1).notNull(),
  noOfflineImport: int("noOfflineImport").default(1).notNull(),
  configuredByUserId: int("configuredByUserId").notNull(),
  configuredAt: timestamp("configuredAt").defaultNow().notNull(),
  note: text("note"),
});

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  actorUserId: int("actorUserId").notNull(),
  action: varchar("action", { length: 80 }).notNull(),
  entityType: varchar("entityType", { length: 60 }).notNull(),
  entityId: int("entityId"),
  summary: text("summary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type CommissionTransaction = typeof commissionTransactions.$inferSelect;
export type CommissionParticipant = typeof commissionParticipants.$inferSelect;
export type RentalObligation = typeof rentalObligations.$inferSelect;
