import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

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
  officeRole: mysqlEnum("officeRole", ["broker_manager", "consultant"]).default("consultant").notNull(),
  consultantCode: varchar("consultantCode", { length: 40 }),
  phone: varchar("phone", { length: 40 }),
  title: varchar("title", { length: 120 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
});

export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["individual", "company"]).default("individual").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  identityOrTaxNo: varchar("identityOrTaxNo", { length: 40 }),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  assignedUserId: int("assignedUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  referenceNo: varchar("referenceNo", { length: 40 }).notNull().unique(),
  type: mysqlEnum("type", ["residential", "commercial", "land", "office"]).default("residential").notNull(),
  listingType: mysqlEnum("listingType", ["sale", "rent"]).default("sale").notNull(),
  ownerApprovalStatus: mysqlEnum("ownerApprovalStatus", ["notRequired", "pending", "approved", "rejected"]).default("notRequired").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  address: text("address").notNull(),
  district: varchar("district", { length: 100 }),
  grossM2: decimal("grossM2", { precision: 10, scale: 2 }),
  roomCount: varchar("roomCount", { length: 30 }),
  price: decimal("price", { precision: 14, scale: 2 }),
  ownerClientId: int("ownerClientId"),
  assignedUserId: int("assignedUserId"),
  status: mysqlEnum("status", ["active", "reserved", "closed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const contracts = mysqlTable("contracts", {
  id: int("id").autoincrement().primaryKey(),
  contractNo: varchar("contractNo", { length: 60 }).notNull().unique(),
  type: mysqlEnum("type", ["rental", "sale", "authority"]).notNull(),
  subtype: varchar("subtype", { length: 80 }),
  status: mysqlEnum("status", ["draft", "review", "approved", "signed", "active", "completed", "cancelled"]).default("draft").notNull(),
  version: int("version").default(1).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  clientId: int("clientId"),
  propertyId: int("propertyId"),
  assignedUserId: int("assignedUserId"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  evictionNoticeDays: int("evictionNoticeDays"),
  evictionNoticeDate: timestamp("evictionNoticeDate"),
  ownerApprovalStatus: mysqlEnum("ownerApprovalStatus", ["notRequired", "pending", "approved", "rejected"]).default("notRequired").notNull(),
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
export const contractDocuments = mysqlTable("contractDocuments", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId"),
  clientId: int("clientId"),
  assignedUserId: int("assignedUserId").notNull(),
  category: mysqlEnum("category", ["activeSigned", "archive"]).notNull(),
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

export const ledgerEntries = mysqlTable("ledgerEntries", {
  id: int("id").autoincrement().primaryKey(),
  entryType: mysqlEnum("entryType", ["income", "expense", "receivable", "payable"]).notNull(),
  status: mysqlEnum("status", ["pending", "partial", "paid", "cancelled"]).default("pending").notNull(),
  description: varchar("description", { length: 240 }).notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 14, scale: 2 }).default("0").notNull(),
  dueDate: timestamp("dueDate"),
  contractId: int("contractId"),
  clientId: int("clientId"),
  assignedUserId: int("assignedUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const rentalObligations = mysqlTable("rentalObligations", {
  id: int("id").autoincrement().primaryKey(),
  contractId: int("contractId"),
  propertyId: int("propertyId"),
  clientId: int("clientId"),
  assignedUserId: int("assignedUserId"),
  obligationType: mysqlEnum("obligationType", ["rent", "tax", "insurance", "other"]).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  paidAmount: decimal("paidAmount", { precision: 14, scale: 2 }).default("0").notNull(),
  status: mysqlEnum("status", ["planned", "due", "paid", "overdue", "cancelled"]).default("planned").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reminderPreferences = mysqlTable("reminderPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  enabled: int("enabled").default(1).notNull(),
  leadDays: varchar("leadDays", { length: 80 }).default("30,14,7,3,1").notNull(),
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
export type RentalObligation = typeof rentalObligations.$inferSelect;
