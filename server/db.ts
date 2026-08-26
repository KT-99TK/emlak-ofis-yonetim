import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, auditLogs, clients, contractDocumentParticipants, contractDocuments, contracts, ledgerEntries, officeAssistantAssignments, onlineStartSettings, properties, rentalObligations, reminderPreferences, teams, treasuryCashDailyCounts, treasuryCashMovements, userProfiles, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { assertCentralRecordDateIsAllowed, assertFreshStartConfirmation, startOfTurkeyBusinessDay, turkeyBusinessDateKey, type OnlineStartPolicy } from "./onlineStartPolicy";

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() { if (!_db && process.env.DATABASE_URL) { try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; } } return _db; }

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId }; const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return result[0]; }

export type CentralAccessScope = { isManager: boolean; permittedUserIds: number[]; officeRole: "broker_manager" | "consultant" | "office_assistant" };

/**
 * Merkezi kayıtlarda kullanıcı arayüzünün rol etiketine güvenilmez. Danışman
 * yalnız kendi kaydını; ofis asistanı yalnız managerın aktif atadığı danışmanları
 * görür. Broker manager kapsamı ise ofis geneline açılır.
 */
export async function getCentralAccessScope(userId: number, isSystemManager: boolean): Promise<CentralAccessScope> {
  const db = await getDb();
  if (isSystemManager) return { isManager: true, permittedUserIds: [], officeRole: "broker_manager" };
  if (!db) return { isManager: false, permittedUserIds: [userId], officeRole: "consultant" };
  const profile = await db.select({ officeRole: userProfiles.officeRole }).from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  const officeRole = profile[0]?.officeRole ?? "consultant";
  if (officeRole !== "office_assistant") return { isManager: false, permittedUserIds: [userId], officeRole };
  const assignments = await db.select({ consultantUserId: officeAssistantAssignments.consultantUserId }).from(officeAssistantAssignments).where(and(eq(officeAssistantAssignments.assistantUserId, userId), eq(officeAssistantAssignments.active, 1)));
  return { isManager: false, permittedUserIds: Array.from(new Set(assignments.map((assignment) => assignment.consultantUserId))), officeRole };
}

export type OnlineStartSetting = {
  effectiveAt: Date;
  noBalanceCarry: boolean;
  noOfflineImport: boolean;
  configuredByUserId: number;
  configuredAt: Date;
  note: string | null;
};

function toOnlineStartSetting(row: typeof onlineStartSettings.$inferSelect): OnlineStartSetting {
  return {
    effectiveAt: row.effectiveAt,
    noBalanceCarry: Boolean(row.noBalanceCarry),
    noOfflineImport: Boolean(row.noOfflineImport),
    configuredByUserId: row.configuredByUserId,
    configuredAt: row.configuredAt,
    note: row.note,
  };
}

export async function getOnlineStartSetting(): Promise<OnlineStartSetting | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(onlineStartSettings).orderBy(desc(onlineStartSettings.configuredAt)).limit(1);
  return rows[0] ? toOnlineStartSetting(rows[0]) : undefined;
}

export async function configureFreshOnlineStart(input: {
  effectiveAt: Date;
  note?: string;
  managerUserId: number;
  confirmationText: string;
}) {
  assertFreshStartConfirmation(input.confirmationText);
  const effectiveAt = startOfTurkeyBusinessDay(input.effectiveAt);
  const turkeyToday = startOfTurkeyBusinessDay(new Date());
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor; temiz başlangıç ayarlanamadı.");
  const existing = await getOnlineStartSetting();
  if (existing && new Date().getTime() >= existing.effectiveAt.getTime()) {
    throw new Error("Aktif merkezi başlangıç tarihi değiştirilemez; yeni başlangıç yerine manager denetim kaydı oluşturulmalıdır.");
  }
  if (effectiveAt.getTime() < turkeyToday.getTime()) {
    throw new Error("Geçiş tarihi bugünden önce olamaz.");
  }
  const values = {
    effectiveAt,
    mode: "freshStart" as const,
    noBalanceCarry: 1,
    noOfflineImport: 1,
    configuredByUserId: input.managerUserId,
    note: input.note?.trim() || null,
  };
  if (existing) {
    const row = await db.select({ id: onlineStartSettings.id }).from(onlineStartSettings).orderBy(desc(onlineStartSettings.configuredAt)).limit(1);
    await db.update(onlineStartSettings).set(values).where(eq(onlineStartSettings.id, row[0]!.id));
  } else {
    await db.insert(onlineStartSettings).values(values);
  }
  await db.insert(auditLogs).values({
    actorUserId: input.managerUserId,
    action: "online_fresh_start_configured",
    entityType: "onlineStartSettings",
    summary: `Merkezi online çalışma ${turkeyBusinessDateKey(effectiveAt)} tarihinden itibaren sıfır bakiye ve offline veri aktarımı olmadan başlayacak.`,
  });
  return getOnlineStartSetting();
}

export async function assertCentralOnlineStartAllowsRecord(recordDate = new Date()) {
  const setting = await getOnlineStartSetting();
  const policy: OnlineStartPolicy | undefined = setting
    ? { effectiveAt: setting.effectiveAt, noBalanceCarry: setting.noBalanceCarry, noOfflineImport: setting.noOfflineImport }
    : undefined;
  assertCentralRecordDateIsAllowed(policy, recordDate);
  return setting!;
}

export async function getDashboardSummary(userId: number, isManager: boolean, permittedUserIds?: number[]) {
  const db = await getDb(); if (!db) return { contracts: 0, portfolio: 0, outstanding: "0", activeTeam: 0, recentContracts: [], recentLedger: [] };
  const scopedIds = permittedUserIds ?? [userId];
  const scope = isManager ? undefined : scopedIds.length ? inArray(contracts.assignedUserId, scopedIds) : sql`1 = 0`;
  const profileRows = isManager ? await db.select({ userId: userProfiles.userId, teamId: userProfiles.teamId, teamName: teams.name, officeRole: userProfiles.officeRole }).from(userProfiles).leftJoin(teams, eq(userProfiles.teamId, teams.id)).where(eq(userProfiles.status, "active")) : [];
  const teamBreakdown = await Promise.all(profileRows.map(async (profile) => {
    const [contractsForUser, cashForUser] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(contracts).where(eq(contracts.assignedUserId, profile.userId)),
      db.select({ income: sql<string>`coalesce(sum(case when ${ledgerEntries.entryType} in ('income','receivable') then ${ledgerEntries.amount} else 0 end), 0)`, expense: sql<string>`coalesce(sum(case when ${ledgerEntries.entryType} in ('expense','payable') then ${ledgerEntries.amount} else 0 end), 0)` }).from(ledgerEntries).where(eq(ledgerEntries.assignedUserId, profile.userId)),
    ]);
    const income = Number(cashForUser[0]?.income ?? 0); const expense = Number(cashForUser[0]?.expense ?? 0);
    return { userId: profile.userId, teamId: profile.teamId, teamName: profile.teamName ?? "Atanmamış ekip", role: profile.officeRole, contracts: Number(contractsForUser[0]?.count ?? 0), collections: income, payments: expense, netCashFlow: income - expense };
  }));
  const [contractCount, portfolioCount, outstanding, teamCount, recentContracts, recentLedger] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(contracts).where(scope),
    db.select({ count: sql<number>`count(*)` }).from(properties).where(isManager ? undefined : scopedIds.length ? inArray(properties.assignedUserId, scopedIds) : sql`1 = 0`),
    db.select({ total: sql<string>`coalesce(sum(${ledgerEntries.amount} - ${ledgerEntries.paidAmount}), 0)` }).from(ledgerEntries).where(and(eq(ledgerEntries.status, "pending"), isManager ? undefined : scopedIds.length ? inArray(ledgerEntries.assignedUserId, scopedIds) : sql`1 = 0`)),
    isManager ? db.select({ count: sql<number>`count(*)` }).from(userProfiles).where(eq(userProfiles.status, "active")) : Promise.resolve([{ count: 1 }]),
    db.select().from(contracts).where(scope).orderBy(desc(contracts.updatedAt)).limit(5),
    db.select().from(ledgerEntries).where(isManager ? undefined : scopedIds.length ? inArray(ledgerEntries.assignedUserId, scopedIds) : sql`1 = 0`).orderBy(desc(ledgerEntries.createdAt)).limit(5),
  ]);
  return { contracts: Number(contractCount[0]?.count ?? 0), portfolio: Number(portfolioCount[0]?.count ?? 0), outstanding: String(outstanding[0]?.total ?? "0"), activeTeam: Number(teamCount[0]?.count ?? 0), recentContracts, recentLedger, teamBreakdown };
}

export async function createContract(input: { contractNo: string; type: "rental" | "sale" | "authority"; subtype?: string; title: string; amount?: string; clientId?: number; propertyId?: number; evictionNoticeDays?: number; evictionNoticeDate?: Date; ownerApprovalStatus?: "notRequired" | "pending" | "approved" | "rejected"; ownerApprovalDate?: Date; ownerApprovalNote?: string; details?: string; assignedUserId: number; actorUserId: number }) { const db = await getDb(); if (!db) return null; await assertCentralOnlineStartAllowsRecord(); const result = await db.insert(contracts).values({ contractNo: input.contractNo, type: input.type, subtype: input.subtype, title: input.title, amount: input.amount, clientId: input.clientId, propertyId: input.propertyId, evictionNoticeDays: input.evictionNoticeDays, evictionNoticeDate: input.evictionNoticeDate, ownerApprovalStatus: input.ownerApprovalStatus ?? (input.type === "rental" ? "pending" : "notRequired"), ownerApprovalDate: input.ownerApprovalDate, ownerApprovalNote: input.ownerApprovalNote, details: input.details, assignedUserId: input.assignedUserId, status: "draft" }); const id = Number(result[0].insertId); await db.insert(auditLogs).values({ actorUserId: input.actorUserId, action: "create", entityType: "contract", entityId: id, summary: `${input.contractNo} taslak olarak oluşturuldu` }); return id; }
export async function requestOwnerApproval(contractId: number, actorUserId: number) { const db = await getDb(); if (!db) return false; await db.update(contracts).set({ ownerApprovalStatus: "pending", ownerApprovalDate: null, ownerApprovalNote: null, version: sql`${contracts.version} + 1` }).where(eq(contracts.id, contractId)); await db.insert(auditLogs).values({ actorUserId, action: "owner_approval_requested", entityType: "contract", entityId: contractId, summary: "Mülk sahibi yeniden kiralama onayı bekliyor" }); return true; }
export async function decideOwnerApproval(contractId: number, decision: "approved" | "rejected", note: string | undefined, actorUserId: number) { const db = await getDb(); if (!db) return false; await db.update(contracts).set({ ownerApprovalStatus: decision, ownerApprovalDate: new Date(), ownerApprovalNote: note, version: sql`${contracts.version} + 1` }).where(eq(contracts.id, contractId)); await db.insert(auditLogs).values({ actorUserId, action: `owner_approval_${decision}`, entityType: "contract", entityId: contractId, summary: `Mülk sahibi onayı ${decision === "approved" ? "verildi" : "reddedildi"}${note ? `: ${note}` : ""}` }); return true; }
export async function transitionContract(id: number, status: "draft" | "review" | "approved" | "signed" | "active" | "completed" | "cancelled", actorUserId: number) { const db = await getDb(); if (!db) return false; const current = await db.select({ type: contracts.type, ownerApprovalStatus: contracts.ownerApprovalStatus }).from(contracts).where(eq(contracts.id, id)).limit(1); if (status === "active" && current[0]?.type === "rental" && current[0]?.ownerApprovalStatus !== "approved") throw new Error("Kira sözleşmesi mülk sahibi onayı olmadan aktifleştirilemez."); await db.update(contracts).set({ status, version: sql`${contracts.version} + 1` }).where(eq(contracts.id, id)); await db.insert(auditLogs).values({ actorUserId, action: "status_change", entityType: "contract", entityId: id, summary: `Sözleşme durumu ${status} olarak güncellendi` }); return true; }
export async function listContracts(userId: number, isManager: boolean, permittedUserIds?: number[]) { const db = await getDb(); if (!db) return []; const scopedIds = permittedUserIds ?? [userId]; return db.select().from(contracts).where(isManager ? undefined : scopedIds.length ? inArray(contracts.assignedUserId, scopedIds) : sql`1 = 0`).orderBy(desc(contracts.updatedAt)); }
export async function getContractForAssignedUser(contractId: number, userId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(contracts).where(and(eq(contracts.id, contractId), eq(contracts.assignedUserId, userId))).limit(1); return rows[0]; }
export async function listContractDocuments(userId: number, isManager: boolean, permittedUserIds?: number[]) { const db = await getDb(); if (!db) return []; const scopedIds = permittedUserIds ?? [userId]; return db.select().from(contractDocuments).where(isManager ? undefined : scopedIds.length ? inArray(contractDocuments.assignedUserId, scopedIds) : sql`1 = 0`).orderBy(desc(contractDocuments.createdAt)); }
export async function getContractDocumentForUser(documentId: number, userId: number, isManager: boolean, permittedUserIds?: number[]) { const db = await getDb(); if (!db) return undefined; const scopedIds = permittedUserIds ?? [userId]; const rows = await db.select().from(contractDocuments).where(and(eq(contractDocuments.id, documentId), isManager ? undefined : scopedIds.length ? inArray(contractDocuments.assignedUserId, scopedIds) : sql`1 = 0`)).limit(1); return rows[0]; }
export async function createContractDocument(input: { contractId: number; clientId?: number | null; assignedUserId: number; category: "activeSigned" | "archive"; originalFileName: string; storageKey: string; sha256: string; byteSize: number; createdByUserId: number }) { const db = await getDb(); if (!db) return null; const result = await db.insert(contractDocuments).values({ ...input, immutable: 1 }); const id = Number(result[0].insertId); await db.insert(auditLogs).values({ actorUserId: input.createdByUserId, action: "document_attached", entityType: "contractDocument", entityId: id, summary: `${input.originalFileName} silinemez belge olarak eklendi` }); return id; }
export async function listCentralArchiveDocuments(userId: number, isManager: boolean, permittedUserIds?: number[]) {
  const db = await getDb(); if (!db) return [];
  const scopedIds = permittedUserIds ?? [userId];
  const documents = await db.select().from(contractDocuments).where(and(eq(contractDocuments.category, "archive"), isManager ? undefined : scopedIds.length ? inArray(contractDocuments.assignedUserId, scopedIds) : sql`1 = 0`));
  const archives = await Promise.all(documents.map(async (document) => {
    const parties = await db.select({ clientId: contractDocumentParticipants.clientId, partyRole: contractDocumentParticipants.partyRole, name: clients.name }).from(contractDocumentParticipants).leftJoin(clients, eq(contractDocumentParticipants.clientId, clients.id)).where(eq(contractDocumentParticipants.documentId, document.id));
    return { ...document, parties };
  }));
  return archives.sort((left, right) => {
    const leftDate = left.documentDate?.toISOString().slice(0, 10) ?? "9999-12-31";
    const rightDate = right.documentDate?.toISOString().slice(0, 10) ?? "9999-12-31";
    return leftDate.localeCompare(rightDate) || left.createdAt.getTime() - right.createdAt.getTime();
  });
}
export async function createCentralArchiveDocument(input: { assignedUserId: number; primaryClientId: number; relatedClients: Array<{ clientId: number; partyRole: "propertyOwner" | "tenant" | "other" }>; documentType: string; documentDate?: Date; historicalActivity: string; archiveNote?: string; originalFileName: string; storageKey: string; sha256: string; byteSize: number; createdByUserId: number }) {
  const db = await getDb(); if (!db) return null;
  const related = input.relatedClients.filter((party) => party.clientId !== input.primaryClientId);
  const clientIds = Array.from(new Set([input.primaryClientId, ...related.map((party) => party.clientId)]));
  for (const clientId of clientIds) {
    const client = await db.select({ id: clients.id }).from(clients).where(eq(clients.id, clientId)).limit(1);
    if (!client[0]) throw new Error("Arşiv için seçilen müşteri kaydı bulunamadı.");
  }
  const result = await db.insert(contractDocuments).values({ contractId: null, clientId: input.primaryClientId, assignedUserId: input.assignedUserId, category: "archive", documentType: input.documentType, documentDate: input.documentDate, historicalActivity: input.historicalActivity, archiveNote: input.archiveNote, originalFileName: input.originalFileName, storageKey: input.storageKey, sha256: input.sha256, byteSize: input.byteSize, immutable: 1, createdByUserId: input.createdByUserId });
  const documentId = Number(result[0].insertId);
  await db.insert(contractDocumentParticipants).values([{ documentId, clientId: input.primaryClientId, partyRole: "primary" }, ...related.map((party) => ({ documentId, clientId: party.clientId, partyRole: party.partyRole }))]);
  await db.insert(auditLogs).values({ actorUserId: input.createdByUserId, action: "archive_document_attached", entityType: "contractDocument", entityId: documentId, summary: `${input.originalFileName} geçmiş müşteri arşivine silinemez belge olarak eklendi` });
  return documentId;
}
export async function invalidateContractDocument(documentId: number, managerUserId: number, reason: string) { const db = await getDb(); if (!db) return false; const current = await db.select().from(contractDocuments).where(eq(contractDocuments.id, documentId)).limit(1); const document = current[0]; if (!document) throw new Error("Belge bulunamadı."); if (document.invalidatedAt) throw new Error("Bu belge daha önce geçersiz kılınmış."); await db.update(contractDocuments).set({ invalidatedAt: new Date(), invalidationReason: reason }).where(eq(contractDocuments.id, documentId)); await db.insert(auditLogs).values({ actorUserId: managerUserId, action: "document_invalidated", entityType: "contractDocument", entityId: documentId, summary: `${document.originalFileName} silinmeden geçersiz kılındı: ${reason}` }); return true; }
export async function recordContractDocumentShareIntent(input: { documentId: number; actorUserId: number; isManager: boolean; permittedUserIds?: number[] }) {
  const document = await getContractDocumentForUser(input.documentId, input.actorUserId, input.isManager, input.permittedUserIds);
  if (!document) throw new Error("Bu belge için paylaşım yetkiniz bulunmuyor.");
  if (document.invalidatedAt && !input.isManager) throw new Error("Geçersiz kılınmış belge paylaşılamaz.");
  const db = await getDb(); if (!db) return false;
  await db.insert(auditLogs).values({ actorUserId: input.actorUserId, action: "document_share_intent", entityType: "contractDocument", entityId: document.id, summary: `${document.originalFileName} için cihaz paylaşım menüsü açma isteği kaydedildi; alıcı bilgisi saklanmadı` });
  return true;
}
export async function listClients(userId: number, isManager: boolean, permittedUserIds?: number[]) { const db = await getDb(); if (!db) return []; const scopedIds = permittedUserIds ?? [userId]; return db.select().from(clients).where(isManager ? undefined : scopedIds.length ? inArray(clients.assignedUserId, scopedIds) : sql`1 = 0`).orderBy(desc(clients.updatedAt)); }
export async function listProperties(userId: number, isManager: boolean, permittedUserIds?: number[]) { const db = await getDb(); if (!db) return []; const scopedIds = permittedUserIds ?? [userId]; return db.select().from(properties).where(isManager ? undefined : scopedIds.length ? inArray(properties.assignedUserId, scopedIds) : sql`1 = 0`).orderBy(desc(properties.createdAt)); }
export async function listLedger(userId: number, isManager: boolean, permittedUserIds?: number[]) { const db = await getDb(); if (!db) return []; const scopedIds = permittedUserIds ?? [userId]; return db.select().from(ledgerEntries).where(isManager ? undefined : scopedIds.length ? inArray(ledgerEntries.assignedUserId, scopedIds) : sql`1 = 0`).orderBy(desc(ledgerEntries.createdAt)); }
export async function listAudit(isManager: boolean) { const db = await getDb(); if (!db || !isManager) return []; return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100); }
export async function listObligations(userId: number, isManager: boolean, permittedUserIds?: number[]) { const db = await getDb(); if (!db) return []; const scopedIds = permittedUserIds ?? [userId]; return db.select().from(rentalObligations).where(isManager ? undefined : scopedIds.length ? inArray(rentalObligations.assignedUserId, scopedIds) : sql`1 = 0`).orderBy(rentalObligations.dueDate); }
export async function createObligation(input: { title: string; obligationType: "rent" | "tax" | "insurance" | "other"; dueDate: Date; periodStart: Date; periodEnd: Date; amount: string; assignedUserId: number }) { const db = await getDb(); if (!db) return null; await assertCentralOnlineStartAllowsRecord(); const result = await db.insert(rentalObligations).values(input); return Number(result[0].insertId); }
export async function getReminderPreferenceByTaskUid(taskUid: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(reminderPreferences).where(eq(reminderPreferences.scheduleCronTaskUid, taskUid)).limit(1); return rows[0]; }
export async function getReminderPreferenceByUserId(userId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(reminderPreferences).where(eq(reminderPreferences.userId, userId)).limit(1); return rows[0]; }
export async function saveReminderSchedule(userId: number, taskUid: string) { const db = await getDb(); if (!db) return false; await db.insert(reminderPreferences).values({ userId, scheduleCronTaskUid: taskUid }).onDuplicateKeyUpdate({ set: { scheduleCronTaskUid: taskUid } }); return true; }
export async function listDueObligationsForReminder(userId: number, now = new Date()) { const db = await getDb(); if (!db) return []; const rows = await db.select().from(rentalObligations).where(and(eq(rentalObligations.assignedUserId, userId), sql`${rentalObligations.status} in ('planned', 'due', 'overdue')`)); return rows.filter((row) => { const days = Math.ceil((new Date(row.dueDate).getTime() - now.getTime()) / 86_400_000); return days <= 30 && days >= -1; }); }
export async function markReminderRun(userId: number, runKey: string) { const db = await getDb(); if (!db) return false; const current = await db.select({ lastReminderRunKey: reminderPreferences.lastReminderRunKey }).from(reminderPreferences).where(eq(reminderPreferences.userId, userId)).limit(1); if (!current[0] || current[0].lastReminderRunKey === runKey) return false; await db.update(reminderPreferences).set({ lastReminderRunKey: runKey }).where(eq(reminderPreferences.userId, userId)); return true; }
export async function createClient(input: { name: string; assignedUserId: number }) { const db = await getDb(); if (!db) return null; await assertCentralOnlineStartAllowsRecord(); const result = await db.insert(clients).values({ name: input.name, assignedUserId: input.assignedUserId }); return Number(result[0].insertId); }
export async function createProperty(input: { referenceNo: string; title: string; address: string; listingType?: "sale" | "rent"; ownerApprovalStatus?: "notRequired" | "pending" | "approved" | "rejected"; assignedUserId: number }) { const db = await getDb(); if (!db) return null; await assertCentralOnlineStartAllowsRecord(); if (input.listingType === "rent" && input.ownerApprovalStatus !== "approved") throw new Error("Kiralık ilan owner approval olmadan oluşturulamaz."); const result = await db.insert(properties).values({ referenceNo: input.referenceNo, title: input.title, address: input.address, listingType: input.listingType ?? "sale", ownerApprovalStatus: input.ownerApprovalStatus ?? "notRequired", assignedUserId: input.assignedUserId }); return Number(result[0].insertId); }
export async function createLedger(input: { description: string; amount: string; entryType: "income" | "expense" | "receivable" | "payable"; assignedUserId: number }) { const db = await getDb(); if (!db) return null; await assertCentralOnlineStartAllowsRecord(); const result = await db.insert(ledgerEntries).values({ description: input.description, amount: input.amount, entryType: input.entryType, assignedUserId: input.assignedUserId }); return Number(result[0].insertId); }
export async function listTeamMembers() { const db = await getDb(); if (!db) return []; return db.select({ userId: userProfiles.userId, name: users.name, email: users.email, teamId: userProfiles.teamId, teamName: teams.name, officeRole: userProfiles.officeRole, consultantCode: userProfiles.consultantCode, status: userProfiles.status }).from(userProfiles).leftJoin(users, eq(userProfiles.userId, users.id)).leftJoin(teams, eq(userProfiles.teamId, teams.id)).orderBy(desc(userProfiles.status)); }

export async function setOfficeAssistantAssignments(input: { assistantUserId: number; consultantUserIds: number[]; managerUserId: number }) {
  const db = await getDb(); if (!db) return false;
  const assistant = await db.select({ userId: userProfiles.userId }).from(userProfiles).where(eq(userProfiles.userId, input.assistantUserId)).limit(1);
  if (!assistant[0]) throw new Error("Ofis asistanı için kullanıcı profili bulunamadı.");
  const consultantIds = Array.from(new Set(input.consultantUserIds.filter((id) => id !== input.assistantUserId)));
  await db.update(userProfiles).set({ officeRole: "office_assistant", managerId: input.managerUserId }).where(eq(userProfiles.userId, input.assistantUserId));
  await db.update(officeAssistantAssignments).set({ active: 0 }).where(eq(officeAssistantAssignments.assistantUserId, input.assistantUserId));
  if (consultantIds.length) await db.insert(officeAssistantAssignments).values(consultantIds.map((consultantUserId) => ({ assistantUserId: input.assistantUserId, consultantUserId, assignedByUserId: input.managerUserId, active: 1 })));
  await db.insert(auditLogs).values({ actorUserId: input.managerUserId, action: "office_assistant_scope_updated", entityType: "userProfile", entityId: input.assistantUserId, summary: `Ofis asistanı kapsamı ${consultantIds.length} danışman kaydı için güncellendi` });
  return true;
}

export async function listTreasuryCashMovements(date: Date) {
  const db = await getDb(); if (!db) return [];
  const day = date.toISOString().slice(0, 10);
  return db.select().from(treasuryCashMovements).where(sql`date(${treasuryCashMovements.occurredOn}) = ${day}`).orderBy(desc(treasuryCashMovements.createdAt));
}

export async function getTreasuryCashBalance(date: Date) {
  const db = await getDb();
  if (!db) return { date, openingCash: 0, bankToCash: 0, cashReceipts: 0, cashExpenses: 0, cashDeposits: 0, expectedCash: 0, countedCash: null as number | null, difference: null as number | null, unverifiedCount: 0, evidenceMissingCount: 0, movements: [] as Awaited<ReturnType<typeof listTreasuryCashMovements>> };
  const day = date.toISOString().slice(0, 10);
  const movements = await listTreasuryCashMovements(date);
  const previousCounts = await db.select().from(treasuryCashDailyCounts).where(sql`date(${treasuryCashDailyCounts.controlDate}) < ${day}`).orderBy(desc(treasuryCashDailyCounts.controlDate)).limit(1);
  const todayCount = await db.select().from(treasuryCashDailyCounts).where(sql`date(${treasuryCashDailyCounts.controlDate}) = ${day}`).orderBy(desc(treasuryCashDailyCounts.managerVerifiedAt)).limit(1);
  const openingCash = Number(previousCounts[0]?.countedCash ?? previousCounts[0]?.openingCash ?? 0);
  const settled = movements.filter((movement) => ["managerVerified", "reconciled"].includes(movement.status));
  const total = (type: "bankToCash" | "cashReceipt" | "cashExpense" | "cashDeposit") => settled.filter((movement) => movement.movementType === type).reduce((sum, movement) => sum + Number(movement.amount), 0);
  const bankToCash = total("bankToCash"); const cashReceipts = total("cashReceipt"); const cashExpenses = total("cashExpense"); const cashDeposits = total("cashDeposit");
  const expectedCash = openingCash + bankToCash + cashReceipts - cashExpenses - cashDeposits;
  const countedCash = todayCount[0]?.countedCash === null || todayCount[0]?.countedCash === undefined ? null : Number(todayCount[0].countedCash);
  return { date, openingCash, bankToCash, cashReceipts, cashExpenses, cashDeposits, expectedCash, countedCash, difference: countedCash === null ? null : countedCash - expectedCash, unverifiedCount: movements.filter((movement) => movement.status === "declared").length, evidenceMissingCount: movements.filter((movement) => !movement.evidenceReference.trim()).length, movements };
}

export async function createTreasuryCashMovement(input: { movementType: "bankToCash" | "cashExpense" | "cashReceipt" | "cashDeposit" | "other"; direction: "in" | "out"; amount: string; occurredOn: Date; counterparty: string; evidenceReference: string; note?: string; enteredByUserId: number }) {
  const db = await getDb(); if (!db) return null;
  await assertCentralOnlineStartAllowsRecord(input.occurredOn);
  const result = await db.insert(treasuryCashMovements).values({ ...input, status: "declared" });
  const id = Number(result[0].insertId);
  await db.insert(auditLogs).values({ actorUserId: input.enteredByUserId, action: "treasury_cash_declared", entityType: "treasuryCashMovement", entityId: id, summary: `${input.movementType} kasa hareketi belge referansıyla beyan edildi` });
  return id;
}

export async function verifyTreasuryCashMovement(id: number, managerUserId: number) {
  const db = await getDb(); if (!db) return false;
  const current = await db.select().from(treasuryCashMovements).where(eq(treasuryCashMovements.id, id)).limit(1);
  if (!current[0]) throw new Error("Kasa hareketi bulunamadı.");
  if (current[0].status === "voided") throw new Error("İptal edilmiş kasa hareketi doğrulanamaz.");
  await db.update(treasuryCashMovements).set({ status: "managerVerified", verifiedByUserId: managerUserId, verifiedAt: new Date() }).where(eq(treasuryCashMovements.id, id));
  await db.insert(auditLogs).values({ actorUserId: managerUserId, action: "treasury_cash_verified", entityType: "treasuryCashMovement", entityId: id, summary: `${current[0].movementType} kasa hareketi broker manager tarafından doğrulandı` });
  return true;
}

export async function closeTreasuryCashDay(input: { date: Date; openingCash: string; countedCash: string; note?: string; managerUserId: number }) {
  const db = await getDb(); if (!db) return null;
  await assertCentralOnlineStartAllowsRecord(input.date);
  const result = await db.insert(treasuryCashDailyCounts).values({ controlDate: input.date, openingCash: input.openingCash, countedCash: input.countedCash, note: input.note, closedByUserId: input.managerUserId, managerVerifiedAt: new Date() });
  const id = Number(result[0].insertId);
  await db.insert(auditLogs).values({ actorUserId: input.managerUserId, action: "treasury_cash_day_closed", entityType: "treasuryCashDailyCount", entityId: id, summary: "Gün sonu kasa sayımı broker manager tarafından kaydedildi" });
  return id;
}
