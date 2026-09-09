import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createHash } from "node:crypto";
import {
  InsertUser,
  auditLogs,
  brokerGuidanceNotes,
  clients,
  contractDocumentParticipants,
  contractDocuments,
  contracts,
  ledgerEntries,
  officeAssistantAssignments,
  onlineStartSettings,
  properties,
  rentalObligations,
  reminderPreferences,
  teams,
  treasuryCashDailyCounts,
  treasuryCashMovements,
  userProfiles,
  users,
  activeRentalSummaries,
  rentalIncomeTaxProfiles,
  rentalServiceTasks,
  sensitiveFieldVault,
  commissionTransactions,
  commissionParticipants,
  consultantAgreementProfiles,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import {
  assertCentralRecordDateIsAllowed,
  assertFreshStartConfirmation,
  startOfTurkeyBusinessDay,
  turkeyBusinessDateKey,
  type OnlineStartPolicy,
} from "./onlineStartPolicy";
import {
  nextContractNumber,
  normalizeContractNumber,
  isConsultantCode,
  isContractNumberForCode,
  normalizeConsultantCode,
} from "../shared/consultantCode";
import {
  assertSafeRevealReason,
  decryptSensitiveValue,
  encryptSensitiveValue,
  maskIdentityOrTaxNo,
  maskPhone,
  protectContractDetails,
  type SensitiveField,
} from "./privacy";

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (!Object.keys(updateSet).length) updateSet.lastSignedIn = new Date();
  await db
    .insert(users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result[0];
}

export type CentralAccessScope = {
  isManager: boolean;
  permittedUserIds: number[];
  officeRole: "broker_manager" | "consultant" | "office_assistant";
};

export function resolveCentralAccessScope(input: {
  userId: number;
  isSystemManager: boolean;
  officeRole?: CentralAccessScope["officeRole"];
  assignedConsultantUserIds?: number[];
}): CentralAccessScope {
  if (input.isSystemManager)
    return {
      isManager: true,
      permittedUserIds: [],
      officeRole: "broker_manager",
    };
  if (input.officeRole === "office_assistant")
    return {
      isManager: false,
      permittedUserIds: Array.from(
        new Set(input.assignedConsultantUserIds ?? [])
      ),
      officeRole: "office_assistant",
    };
  return {
    isManager: false,
    permittedUserIds: [input.userId],
    officeRole: input.officeRole ?? "consultant",
  };
}

/**
 * Merkezi kayıtlarda kullanıcı arayüzünün rol etiketine güvenilmez. Danışman
 * yalnız kendi kaydını; ofis asistanı yalnız managerın aktif atadığı danışmanları
 * görür. Broker manager kapsamı ise ofis geneline açılır.
 */
export async function getCentralAccessScope(
  userId: number,
  isSystemManager: boolean
): Promise<CentralAccessScope> {
  const db = await getDb();
  if (isSystemManager) return resolveCentralAccessScope({ userId, isSystemManager });
  if (!db) return resolveCentralAccessScope({ userId, isSystemManager });
  const profile = await db
    .select({ officeRole: userProfiles.officeRole })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  const officeRole = profile[0]?.officeRole ?? "consultant";
  if (officeRole !== "office_assistant")
    return resolveCentralAccessScope({ userId, isSystemManager, officeRole });
  const assignments = await db
    .select({ consultantUserId: officeAssistantAssignments.consultantUserId })
    .from(officeAssistantAssignments)
    .where(
      and(
        eq(officeAssistantAssignments.assistantUserId, userId),
        eq(officeAssistantAssignments.active, 1)
      )
    );
  return resolveCentralAccessScope({
    userId,
    isSystemManager,
    officeRole,
    assignedConsultantUserIds: assignments.map(
      assignment => assignment.consultantUserId
    ),
  });
}

export type OnlineStartSetting = {
  effectiveAt: Date;
  noBalanceCarry: boolean;
  noOfflineImport: boolean;
  configuredByUserId: number;
  configuredAt: Date;
  note: string | null;
};

function toOnlineStartSetting(
  row: typeof onlineStartSettings.$inferSelect
): OnlineStartSetting {
  return {
    effectiveAt: row.effectiveAt,
    noBalanceCarry: Boolean(row.noBalanceCarry),
    noOfflineImport: Boolean(row.noOfflineImport),
    configuredByUserId: row.configuredByUserId,
    configuredAt: row.configuredAt,
    note: row.note,
  };
}

export async function getOnlineStartSetting(): Promise<
  OnlineStartSetting | null
> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(onlineStartSettings)
    .orderBy(desc(onlineStartSettings.configuredAt))
    .limit(1);
  return rows[0] ? toOnlineStartSetting(rows[0]) : null;
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
  if (!db)
    throw new Error(
      "Merkezi veri tabanına erişilemiyor; temiz başlangıç ayarlanamadı."
    );
  const existing = await getOnlineStartSetting();
  if (existing && new Date().getTime() >= existing.effectiveAt.getTime()) {
    throw new Error(
      "Aktif merkezi başlangıç tarihi değiştirilemez; yeni başlangıç yerine manager denetim kaydı oluşturulmalıdır."
    );
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
    const row = await db
      .select({ id: onlineStartSettings.id })
      .from(onlineStartSettings)
      .orderBy(desc(onlineStartSettings.configuredAt))
      .limit(1);
    await db
      .update(onlineStartSettings)
      .set(values)
      .where(eq(onlineStartSettings.id, row[0]!.id));
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

export async function assertCentralOnlineStartAllowsRecord(
  recordDate = new Date()
) {
  const setting = await getOnlineStartSetting();
  const policy: OnlineStartPolicy | undefined = setting
    ? {
        effectiveAt: setting.effectiveAt,
        noBalanceCarry: setting.noBalanceCarry,
        noOfflineImport: setting.noOfflineImport,
      }
    : undefined;
  assertCentralRecordDateIsAllowed(policy, recordDate);
  return setting!;
}

export async function getDashboardSummary(
  userId: number,
  isManager: boolean,
  permittedUserIds?: number[]
) {
  const db = await getDb();
  if (!db)
    return {
      contracts: 0,
      portfolio: 0,
      outstanding: "0",
      activeTeam: 0,
      recentContracts: [],
      recentLedger: [],
    };
  const scopedIds = permittedUserIds ?? [userId];
  const scope = isManager
    ? undefined
    : scopedIds.length
      ? inArray(contracts.assignedUserId, scopedIds)
      : sql`1 = 0`;
  const profileRows = isManager
    ? await db
        .select({
          userId: userProfiles.userId,
          teamId: userProfiles.teamId,
          teamName: teams.name,
          officeRole: userProfiles.officeRole,
        })
        .from(userProfiles)
        .leftJoin(teams, eq(userProfiles.teamId, teams.id))
        .where(eq(userProfiles.status, "active"))
    : [];
  const teamBreakdown = await Promise.all(
    profileRows.map(async profile => {
      const [contractsForUser, cashForUser] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)` })
          .from(contracts)
          .where(eq(contracts.assignedUserId, profile.userId)),
        db
          .select({
            income: sql<string>`coalesce(sum(case when ${ledgerEntries.entryType} in ('income','receivable') then ${ledgerEntries.amount} else 0 end), 0)`,
            expense: sql<string>`coalesce(sum(case when ${ledgerEntries.entryType} in ('expense','payable') then ${ledgerEntries.amount} else 0 end), 0)`,
          })
          .from(ledgerEntries)
          .where(eq(ledgerEntries.assignedUserId, profile.userId)),
      ]);
      const income = Number(cashForUser[0]?.income ?? 0);
      const expense = Number(cashForUser[0]?.expense ?? 0);
      return {
        userId: profile.userId,
        teamId: profile.teamId,
        teamName: profile.teamName ?? "Atanmamış ekip",
        role: profile.officeRole,
        contracts: Number(contractsForUser[0]?.count ?? 0),
        collections: income,
        payments: expense,
        netCashFlow: income - expense,
      };
    })
  );
  const [
    contractCount,
    portfolioCount,
    outstanding,
    teamCount,
    recentContracts,
    recentLedger,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(contracts)
      .where(scope),
    db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(
        isManager
          ? undefined
          : scopedIds.length
            ? inArray(properties.assignedUserId, scopedIds)
            : sql`1 = 0`
      ),
    db
      .select({
        total: sql<string>`coalesce(sum(${ledgerEntries.amount} - ${ledgerEntries.paidAmount}), 0)`,
      })
      .from(ledgerEntries)
      .where(
        and(
          eq(ledgerEntries.status, "pending"),
          isManager
            ? undefined
            : scopedIds.length
              ? inArray(ledgerEntries.assignedUserId, scopedIds)
              : sql`1 = 0`
        )
      ),
    isManager
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(userProfiles)
          .where(eq(userProfiles.status, "active"))
      : Promise.resolve([{ count: 1 }]),
    db
      .select()
      .from(contracts)
      .where(scope)
      .orderBy(desc(contracts.updatedAt))
      .limit(5),
    db
      .select()
      .from(ledgerEntries)
      .where(
        isManager
          ? undefined
          : scopedIds.length
            ? inArray(ledgerEntries.assignedUserId, scopedIds)
            : sql`1 = 0`
      )
      .orderBy(desc(ledgerEntries.createdAt))
      .limit(5),
  ]);
  return {
    contracts: Number(contractCount[0]?.count ?? 0),
    portfolio: Number(portfolioCount[0]?.count ?? 0),
    outstanding: String(outstanding[0]?.total ?? "0"),
    activeTeam: Number(teamCount[0]?.count ?? 0),
    recentContracts,
    recentLedger,
    teamBreakdown,
  };
}

export async function createContract(input: {
  contractNo: string;
  type: "rental" | "sale" | "authority";
  subtype?: string;
  title: string;
  amount?: string;
  clientId?: number;
  propertyId?: number;
  evictionNoticeDays?: number;
  evictionNoticeDate?: Date;
  ownerApprovalStatus?: "notRequired" | "pending" | "approved" | "rejected";
  ownerApprovalDate?: Date;
  ownerApprovalNote?: string;
  details?: string;
  assignedUserId: number;
  actorUserId: number;
}) {
  const db = await getDb();
  if (!db) return null;
  await assertCentralOnlineStartAllowsRecord();
  const profile = await db
    .select({ consultantCode: userProfiles.consultantCode })
    .from(userProfiles)
    .where(eq(userProfiles.userId, input.assignedUserId))
    .limit(1);
  const consultantCode = normalizeConsultantCode(profile[0]?.consultantCode);
  const contractNo = normalizeContractNumber(input.contractNo);
  if (!isContractNumberForCode(contractNo, consultantCode))
    throw new Error(
      `Sözleşme numarası ${consultantCode || "danışman kodu"}-001 biçiminde ve bu kullanıcı koduyla başlamalıdır.`
    );
  const duplicate = await db
    .select({ id: contracts.id })
    .from(contracts)
    .where(eq(contracts.contractNo, contractNo))
    .limit(1);
  if (duplicate.length)
    throw new Error("Bu sözleşme numarası daha önce kullanılmış.");
  const protectedDetails = protectContractDetails(input.details);
  const result = await db
    .insert(contracts)
    .values({
      contractNo,
      type: input.type,
      subtype: input.subtype,
      title: input.title,
      amount: input.amount,
      clientId: input.clientId,
      propertyId: input.propertyId,
      evictionNoticeDays: input.evictionNoticeDays,
      evictionNoticeDate: input.evictionNoticeDate,
      ownerApprovalStatus:
        input.ownerApprovalStatus ??
        (input.type === "rental" ? "pending" : "notRequired"),
      ownerApprovalDate: input.ownerApprovalDate,
      ownerApprovalNote: input.ownerApprovalNote,
      details: protectedDetails.maskedDetails,
      assignedUserId: input.assignedUserId,
      status: "draft",
    });
  const id = Number(result[0].insertId);
  await saveSensitiveFields(db, "contract", id, protectedDetails.sensitiveFields);
  await db
    .insert(auditLogs)
    .values({
      actorUserId: input.actorUserId,
      action: "create",
      entityType: "contract",
      entityId: id,
      summary: `${contractNo} · danışman=${consultantCode} · atananKullanici=${input.assignedUserId} taslak olarak oluşturuldu`,
    });
  return id;
}
export async function requestOwnerApproval(
  contractId: number,
  actorUserId: number
) {
  const db = await getDb();
  if (!db) return false;
  await db
    .update(contracts)
    .set({
      ownerApprovalStatus: "pending",
      ownerApprovalDate: null,
      ownerApprovalNote: null,
      version: sql`${contracts.version} + 1`,
    })
    .where(eq(contracts.id, contractId));
  await db
    .insert(auditLogs)
    .values({
      actorUserId,
      action: "owner_approval_requested",
      entityType: "contract",
      entityId: contractId,
      summary: "Mülk sahibi yeniden kiralama onayı bekliyor",
    });
  return true;
}
export async function decideOwnerApproval(
  contractId: number,
  decision: "approved" | "rejected",
  note: string | undefined,
  actorUserId: number
) {
  const db = await getDb();
  if (!db) return false;
  await db
    .update(contracts)
    .set({
      ownerApprovalStatus: decision,
      ownerApprovalDate: new Date(),
      ownerApprovalNote: note,
      version: sql`${contracts.version} + 1`,
    })
    .where(eq(contracts.id, contractId));
  await db
    .insert(auditLogs)
    .values({
      actorUserId,
      action: `owner_approval_${decision}`,
      entityType: "contract",
      entityId: contractId,
      summary: `Mülk sahibi onayı ${decision === "approved" ? "verildi" : "reddedildi"}${note ? `: ${note}` : ""}`,
    });
  return true;
}
export async function transitionContract(
  id: number,
  status:
    | "draft"
    | "review"
    | "approved"
    | "signed"
    | "active"
    | "completed"
    | "cancelled",
  actorUserId: number
) {
  const db = await getDb();
  if (!db) return false;
  const current = await db
    .select({
      type: contracts.type,
      ownerApprovalStatus: contracts.ownerApprovalStatus,
    })
    .from(contracts)
    .where(eq(contracts.id, id))
    .limit(1);
  if (
    status === "active" &&
    current[0]?.type === "rental" &&
    current[0]?.ownerApprovalStatus !== "approved"
  )
    throw new Error(
      "Kira sözleşmesi mülk sahibi onayı olmadan aktifleştirilemez."
    );
  await db
    .update(contracts)
    .set({ status, version: sql`${contracts.version} + 1` })
    .where(eq(contracts.id, id));
  await db
    .insert(auditLogs)
    .values({
      actorUserId,
      action: "status_change",
      entityType: "contract",
      entityId: id,
      summary: `Sözleşme durumu ${status} olarak güncellendi`,
    });
  return true;
}
export async function listContracts(
  userId: number,
  isManager: boolean,
  permittedUserIds?: number[],
  officeRole?: CentralAccessScope["officeRole"]
) {
  const db = await getDb();
  if (!db) return [];
  const scopedIds = permittedUserIds ?? [userId];
  const rows = await db
    .select()
    .from(contracts)
    .where(
      isManager
        ? undefined
        : scopedIds.length
          ? inArray(contracts.assignedUserId, scopedIds)
          : sql`1 = 0`
    )
    .orderBy(desc(contracts.updatedAt));
  return rows.map(row => ({
    ...row,
    details: protectContractDetails(row.details ?? undefined).maskedDetails ?? null,
    canRevealSensitive:
      isManager ||
      (officeRole === "consultant" && row.assignedUserId === userId),
  }));
}
export async function getNextContractNumber(userId: number) {
  const db = await getDb();
  if (!db) return { consultantCode: null, nextContractNo: "" };
  const profile = await db
    .select({ consultantCode: userProfiles.consultantCode })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  const consultantCode = normalizeConsultantCode(profile[0]?.consultantCode);
  const existing = await db
    .select({ contractNo: contracts.contractNo })
    .from(contracts)
    .where(eq(contracts.assignedUserId, userId));
  return {
    consultantCode: consultantCode || null,
    nextContractNo: nextContractNumber(
      consultantCode,
      existing.map(item => item.contractNo)
    ),
  };
}
export async function getContractForAssignedUser(
  contractId: number,
  userId: number
) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(contracts)
    .where(
      and(eq(contracts.id, contractId), eq(contracts.assignedUserId, userId))
    )
    .limit(1);
  return rows[0];
}
export async function listContractDocuments(
  userId: number,
  isManager: boolean,
  permittedUserIds?: number[]
) {
  const db = await getDb();
  if (!db) return [];
  const scopedIds = permittedUserIds ?? [userId];
  return db
    .select()
    .from(contractDocuments)
    .where(
      isManager
        ? undefined
        : scopedIds.length
          ? inArray(contractDocuments.assignedUserId, scopedIds)
          : sql`1 = 0`
    )
    .orderBy(desc(contractDocuments.createdAt));
}
export async function getContractDocumentForUser(
  documentId: number,
  userId: number,
  isManager: boolean,
  permittedUserIds?: number[]
) {
  const db = await getDb();
  if (!db) return undefined;
  const scopedIds = permittedUserIds ?? [userId];
  const rows = await db
    .select()
    .from(contractDocuments)
    .where(
      and(
        eq(contractDocuments.id, documentId),
        isManager
          ? undefined
          : scopedIds.length
            ? inArray(contractDocuments.assignedUserId, scopedIds)
            : sql`1 = 0`
      )
    )
    .limit(1);
  return rows[0];
}
export async function createContractDocument(input: {
  contractId: number;
  clientId?: number | null;
  assignedUserId: number;
  category: "activeSigned" | "archive";
  originalFileName: string;
  storageKey: string;
  sha256: string;
  byteSize: number;
  createdByUserId: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .insert(contractDocuments)
    .values({ ...input, immutable: 1 });
  const id = Number(result[0].insertId);
  await db
    .insert(auditLogs)
    .values({
      actorUserId: input.createdByUserId,
      action: "document_attached",
      entityType: "contractDocument",
      entityId: id,
      summary: `${input.originalFileName} silinemez belge olarak eklendi`,
    });
  return id;
}
export async function listCentralArchiveDocuments(
  userId: number,
  isManager: boolean,
  permittedUserIds?: number[]
) {
  const db = await getDb();
  if (!db) return [];
  const scopedIds = permittedUserIds ?? [userId];
  const documents = await db
    .select()
    .from(contractDocuments)
    .where(
      and(
        eq(contractDocuments.category, "archive"),
        isManager
          ? undefined
          : scopedIds.length
            ? inArray(contractDocuments.assignedUserId, scopedIds)
            : sql`1 = 0`
      )
    );
  const archives = await Promise.all(
    documents.map(async document => {
      const parties = await db
        .select({
          clientId: contractDocumentParticipants.clientId,
          partyRole: contractDocumentParticipants.partyRole,
          name: clients.name,
        })
        .from(contractDocumentParticipants)
        .leftJoin(
          clients,
          eq(contractDocumentParticipants.clientId, clients.id)
        )
        .where(eq(contractDocumentParticipants.documentId, document.id));
      return { ...document, parties };
    })
  );
  return archives.sort((left, right) => {
    const leftDate =
      left.documentDate?.toISOString().slice(0, 10) ?? "9999-12-31";
    const rightDate =
      right.documentDate?.toISOString().slice(0, 10) ?? "9999-12-31";
    return (
      leftDate.localeCompare(rightDate) ||
      left.createdAt.getTime() - right.createdAt.getTime()
    );
  });
}
export async function createCentralArchiveDocument(input: {
  assignedUserId: number;
  primaryClientId: number;
  relatedClients: Array<{
    clientId: number;
    partyRole: "propertyOwner" | "tenant" | "other";
  }>;
  documentType: string;
  documentDate?: Date;
  historicalActivity: string;
  archiveNote?: string;
  originalFileName: string;
  storageKey: string;
  sha256: string;
  byteSize: number;
  createdByUserId: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const related = input.relatedClients.filter(
    party => party.clientId !== input.primaryClientId
  );
  const clientIds = Array.from(
    new Set([input.primaryClientId, ...related.map(party => party.clientId)])
  );
  for (const clientId of clientIds) {
    const client = await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);
    if (!client[0])
      throw new Error("Arşiv için seçilen müşteri kaydı bulunamadı.");
  }
  const result = await db
    .insert(contractDocuments)
    .values({
      contractId: null,
      clientId: input.primaryClientId,
      assignedUserId: input.assignedUserId,
      category: "archive",
      documentType: input.documentType,
      documentDate: input.documentDate,
      historicalActivity: input.historicalActivity,
      archiveNote: input.archiveNote,
      originalFileName: input.originalFileName,
      storageKey: input.storageKey,
      sha256: input.sha256,
      byteSize: input.byteSize,
      immutable: 1,
      createdByUserId: input.createdByUserId,
    });
  const documentId = Number(result[0].insertId);
  await db
    .insert(contractDocumentParticipants)
    .values([
      { documentId, clientId: input.primaryClientId, partyRole: "primary" },
      ...related.map(party => ({
        documentId,
        clientId: party.clientId,
        partyRole: party.partyRole,
      })),
    ]);
  await db
    .insert(auditLogs)
    .values({
      actorUserId: input.createdByUserId,
      action: "archive_document_attached",
      entityType: "contractDocument",
      entityId: documentId,
      summary: `${input.originalFileName} geçmiş müşteri arşivine silinemez belge olarak eklendi`,
    });
  return documentId;
}
export async function invalidateContractDocument(
  documentId: number,
  managerUserId: number,
  reason: string
) {
  const db = await getDb();
  if (!db) return false;
  const current = await db
    .select()
    .from(contractDocuments)
    .where(eq(contractDocuments.id, documentId))
    .limit(1);
  const document = current[0];
  if (!document) throw new Error("Belge bulunamadı.");
  if (document.invalidatedAt)
    throw new Error("Bu belge daha önce geçersiz kılınmış.");
  await db
    .update(contractDocuments)
    .set({ invalidatedAt: new Date(), invalidationReason: reason })
    .where(eq(contractDocuments.id, documentId));
  await db
    .insert(auditLogs)
    .values({
      actorUserId: managerUserId,
      action: "document_invalidated",
      entityType: "contractDocument",
      entityId: documentId,
      summary: `${document.originalFileName} silinmeden geçersiz kılındı: ${reason}`,
    });
  return true;
}
export async function recordContractDocumentShareIntent(input: {
  documentId: number;
  actorUserId: number;
  isManager: boolean;
  permittedUserIds?: number[];
}) {
  const document = await getContractDocumentForUser(
    input.documentId,
    input.actorUserId,
    input.isManager,
    input.permittedUserIds
  );
  if (!document) throw new Error("Bu belge için paylaşım yetkiniz bulunmuyor.");
  if (document.invalidatedAt && !input.isManager)
    throw new Error("Geçersiz kılınmış belge paylaşılamaz.");
  const db = await getDb();
  if (!db) return false;
  await db
    .insert(auditLogs)
    .values({
      actorUserId: input.actorUserId,
      action: "document_share_intent",
      entityType: "contractDocument",
      entityId: document.id,
      summary: `${document.originalFileName} için cihaz paylaşım menüsü açma isteği kaydedildi; alıcı bilgisi saklanmadı`,
    });
  return true;
}
export async function listClients(
  userId: number,
  isManager: boolean,
  permittedUserIds?: number[],
  officeRole?: CentralAccessScope["officeRole"]
) {
  const db = await getDb();
  if (!db) return [];
  const scopedIds = permittedUserIds ?? [userId];
  const rows = await db
    .select()
    .from(clients)
    .where(
      isManager
        ? undefined
        : scopedIds.length
          ? inArray(clients.assignedUserId, scopedIds)
          : sql`1 = 0`
    )
    .orderBy(desc(clients.updatedAt));
  return rows.map(row => ({
    ...row,
    identityOrTaxNo: maskIdentityOrTaxNo(row.identityOrTaxNo),
    phone: maskPhone(row.phone),
    canRevealSensitive:
      isManager ||
      (officeRole === "consultant" && row.assignedUserId === userId),
  }));
}

async function saveSensitiveFields(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  entityType: string,
  entityId: number,
  fields: SensitiveField[]
) {
  for (const field of fields) {
    const encrypted = encryptSensitiveValue(field.value);
    await db
      .insert(sensitiveFieldVault)
      .values({
        entityType,
        entityId,
        fieldPath: field.fieldPath,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        authTag: encrypted.authTag,
        keyVersion: encrypted.keyVersion,
      })
      .onDuplicateKeyUpdate({
        set: {
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          keyVersion: encrypted.keyVersion,
        },
      });
  }
}

async function getSensitiveField(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  entityType: string,
  entityId: number,
  fieldPath: string
) {
  const rows = await db
    .select()
    .from(sensitiveFieldVault)
    .where(
      and(
        eq(sensitiveFieldVault.entityType, entityType),
        eq(sensitiveFieldVault.entityId, entityId),
        eq(sensitiveFieldVault.fieldPath, fieldPath)
      )
    )
    .limit(1);
  const row = rows[0];
  return row
    ? decryptSensitiveValue({
        ciphertext: row.ciphertext,
        iv: row.iv,
        authTag: row.authTag,
        keyVersion: row.keyVersion as "jwt-derived-v1",
      })
    : null;
}

export function canRevealSensitiveForScope(input: {
  actorUserId: number;
  isManager: boolean;
  officeRole: CentralAccessScope["officeRole"];
  assignedUserId: number | null;
}) {
  return (
    input.isManager ||
    (input.officeRole === "consultant" &&
      input.assignedUserId === input.actorUserId)
  );
}

function assertSensitiveRevealAccess(input: {
  actorUserId: number;
  isManager: boolean;
  officeRole: CentralAccessScope["officeRole"];
  assignedUserId: number | null;
}) {
  if (canRevealSensitiveForScope(input)) return;
  throw new Error("Bu hassas veriyi görüntüleme yetkiniz yok.");
}

export async function revealClientSensitive(
  clientId: number,
  reason: string,
  actorUserId: number,
  isManager: boolean,
  officeRole: CentralAccessScope["officeRole"]
) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const safeReason = assertSafeRevealReason(reason);
  const client = (
    await db.select().from(clients).where(eq(clients.id, clientId)).limit(1)
  )[0];
  if (!client) throw new Error("Müşteri kaydı bulunamadı.");
  assertSensitiveRevealAccess({
    actorUserId,
    isManager,
    officeRole,
    assignedUserId: client.assignedUserId,
  });
  const [vaultIdentity, vaultPhone] = await Promise.all([
    getSensitiveField(db, "client", clientId, "identityOrTaxNo"),
    getSensitiveField(db, "client", clientId, "phone"),
  ]);
  await db.insert(auditLogs).values({
    actorUserId,
    action: "sensitive_data_revealed",
    entityType: "client",
    entityId: clientId,
    summary: `Gerekçeli hassas veri görünümü: ${safeReason}`,
  });
  return {
    identityOrTaxNo: vaultIdentity ?? client.identityOrTaxNo ?? null,
    phone: vaultPhone ?? client.phone ?? null,
    expiresAt: new Date(Date.now() + 30_000),
  };
}

export async function revealContractSensitive(
  contractId: number,
  reason: string,
  actorUserId: number,
  isManager: boolean,
  officeRole: CentralAccessScope["officeRole"]
) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const safeReason = assertSafeRevealReason(reason);
  const contract = (
    await db
      .select({ id: contracts.id, assignedUserId: contracts.assignedUserId })
      .from(contracts)
      .where(eq(contracts.id, contractId))
      .limit(1)
  )[0];
  if (!contract) throw new Error("Sözleşme kaydı bulunamadı.");
  assertSensitiveRevealAccess({
    actorUserId,
    isManager,
    officeRole,
    assignedUserId: contract.assignedUserId,
  });
  const vaultRows = await db
    .select()
    .from(sensitiveFieldVault)
    .where(
      and(
        eq(sensitiveFieldVault.entityType, "contract"),
        eq(sensitiveFieldVault.entityId, contractId)
      )
    );
  const fields = Object.fromEntries(
    vaultRows.map(row => [
      row.fieldPath,
      decryptSensitiveValue({
        ciphertext: row.ciphertext,
        iv: row.iv,
        authTag: row.authTag,
        keyVersion: row.keyVersion as "jwt-derived-v1",
      }),
    ])
  );
  await db.insert(auditLogs).values({
    actorUserId,
    action: "sensitive_data_revealed",
    entityType: "contract",
    entityId: contractId,
    summary: `Gerekçeli hassas veri görünümü: ${safeReason}`,
  });
  return { fields, expiresAt: new Date(Date.now() + 30_000) };
}

async function assertAnonymousBrokerGuidanceSummary(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  summary: string
) {
  const normalized = summary.trim();
  if (/\b\d[\d\s-]{8,}\d\b/.test(normalized) || /\S+@\S+\.\S+/.test(normalized))
    throw new Error(
      "Broker yönlendirme notuna telefon, kimlik veya e-posta bilgisi yazılamaz."
    );
  const [knownClients, knownRentals] = await Promise.all([
    db.select({ name: clients.name }).from(clients),
    db
      .select({
        tenantName: activeRentalSummaries.tenantName,
        propertyLocation: activeRentalSummaries.propertyLocation,
        unitInfo: activeRentalSummaries.unitInfo,
      })
      .from(activeRentalSummaries),
  ]);
  const privateTerms = [
    ...knownClients.map(item => item.name),
    ...knownRentals.flatMap(item => [
      item.tenantName,
      item.propertyLocation,
      item.unitInfo,
    ]),
  ]
    .map(value => value.trim().toLocaleLowerCase("tr-TR"))
    .filter(value => value.length >= 4);
  if (
    privateTerms.some(term =>
      normalized.toLocaleLowerCase("tr-TR").includes(term)
    )
  )
    throw new Error(
      "Broker yönlendirme notuna merkezi müşteri, kiracı veya taşınmaz adı yazılamaz."
    );
  return normalized;
}

export async function listBrokerGuidanceNotes() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(brokerGuidanceNotes)
    .orderBy(desc(brokerGuidanceNotes.createdAt));
}

export async function createBrokerGuidanceNote(input: {
  subject: "rental_service" | "contract_review" | "collection" | "general";
  summary: string;
  actorUserId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const summary = await assertAnonymousBrokerGuidanceSummary(db, input.summary);
  await assertCentralOnlineStartAllowsRecord();
  const result = await db.insert(brokerGuidanceNotes).values({
    subject: input.subject,
    summary,
    createdByUserId: input.actorUserId,
  });
  const id = Number(result[0].insertId);
  await db.insert(auditLogs).values({
    actorUserId: input.actorUserId,
    action: "broker_guidance_note_created",
    entityType: "brokerGuidanceNote",
    entityId: id,
    summary: `Anonim broker yönlendirme notu oluşturuldu: ${input.subject}`,
  });
  return id;
}

export async function resolveBrokerGuidanceNote(
  noteId: number,
  managerUserId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const current = await db
    .select()
    .from(brokerGuidanceNotes)
    .where(eq(brokerGuidanceNotes.id, noteId))
    .limit(1);
  if (!current[0]) throw new Error("Broker yönlendirme notu bulunamadı.");
  if (current[0].status === "resolved") return false;
  await db
    .update(brokerGuidanceNotes)
    .set({
      status: "resolved",
      resolvedAt: new Date(),
      resolvedByUserId: managerUserId,
    })
    .where(eq(brokerGuidanceNotes.id, noteId));
  await db.insert(auditLogs).values({
    actorUserId: managerUserId,
    action: "broker_guidance_note_resolved",
    entityType: "brokerGuidanceNote",
    entityId: noteId,
    summary: "Anonim broker yönlendirme notu çözüldü.",
  });
  return true;
}
export async function listProperties(
  userId: number,
  isManager: boolean,
  permittedUserIds?: number[]
) {
  const db = await getDb();
  if (!db) return [];
  const scopedIds = permittedUserIds ?? [userId];
  return db
    .select()
    .from(properties)
    .where(
      isManager
        ? undefined
        : scopedIds.length
          ? inArray(properties.assignedUserId, scopedIds)
          : sql`1 = 0`
    )
    .orderBy(desc(properties.createdAt));
}
export async function listLedger(
  userId: number,
  isManager: boolean,
  permittedUserIds?: number[]
) {
  const db = await getDb();
  if (!db) return [];
  const scopedIds = permittedUserIds ?? [userId];
  return db
    .select()
    .from(ledgerEntries)
    .where(
      isManager
        ? undefined
        : scopedIds.length
          ? inArray(ledgerEntries.assignedUserId, scopedIds)
          : sql`1 = 0`
    )
    .orderBy(desc(ledgerEntries.createdAt));
}
export async function listAudit(isManager: boolean) {
  const db = await getDb();
  if (!db || !isManager) return [];
  return db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);
}
export async function listObligations(
  userId: number,
  isManager: boolean,
  permittedUserIds?: number[]
) {
  const db = await getDb();
  if (!db) return [];
  const scopedIds = permittedUserIds ?? [userId];
  return db
    .select()
    .from(rentalObligations)
    .where(
      isManager
        ? undefined
        : scopedIds.length
          ? inArray(rentalObligations.assignedUserId, scopedIds)
          : sql`1 = 0`
    )
    .orderBy(rentalObligations.dueDate);
}
export async function createObligation(input: {
  title: string;
  obligationType: "rent" | "tax" | "insurance" | "other";
  dueDate: Date;
  periodStart: Date;
  periodEnd: Date;
  amount: string;
  assignedUserId: number;
}) {
  const db = await getDb();
  if (!db) return null;
  await assertCentralOnlineStartAllowsRecord();
  const result = await db.insert(rentalObligations).values(input);
  return Number(result[0].insertId);
}
export async function getReminderPreferenceByTaskUid(taskUid: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(reminderPreferences)
    .where(eq(reminderPreferences.scheduleCronTaskUid, taskUid))
    .limit(1);
  return rows[0];
}
export async function getReminderPreferenceByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(reminderPreferences)
    .where(eq(reminderPreferences.userId, userId))
    .limit(1);
  return rows[0];
}
export async function saveReminderSchedule(userId: number, taskUid: string) {
  const db = await getDb();
  if (!db) return false;
  await db
    .insert(reminderPreferences)
    .values({ userId, scheduleCronTaskUid: taskUid })
    .onDuplicateKeyUpdate({ set: { scheduleCronTaskUid: taskUid } });
  return true;
}
export async function listDueObligationsForReminder(
  userId: number,
  now = new Date()
) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(rentalObligations)
    .where(
      and(
        eq(rentalObligations.assignedUserId, userId),
        sql`${rentalObligations.status} in ('planned', 'due', 'overdue')`
      )
    );
  return rows.filter(row => {
    const days = Math.ceil(
      (new Date(row.dueDate).getTime() - now.getTime()) / 86_400_000
    );
    return days <= 30 && days >= -1;
  });
}
export async function markReminderRun(userId: number, runKey: string) {
  const db = await getDb();
  if (!db) return false;
  const current = await db
    .select({ lastReminderRunKey: reminderPreferences.lastReminderRunKey })
    .from(reminderPreferences)
    .where(eq(reminderPreferences.userId, userId))
    .limit(1);
  if (!current[0] || current[0].lastReminderRunKey === runKey) return false;
  await db
    .update(reminderPreferences)
    .set({ lastReminderRunKey: runKey })
    .where(eq(reminderPreferences.userId, userId));
  return true;
}
export async function createClient(input: {
  name: string;
  assignedUserId: number;
}) {
  const db = await getDb();
  if (!db) return null;
  await assertCentralOnlineStartAllowsRecord();
  const result = await db
    .insert(clients)
    .values({ name: input.name, assignedUserId: input.assignedUserId });
  return Number(result[0].insertId);
}
export async function createProperty(input: {
  referenceNo: string;
  title: string;
  address: string;
  listingType?: "sale" | "rent";
  ownerApprovalStatus?: "notRequired" | "pending" | "approved" | "rejected";
  assignedUserId: number;
}) {
  const db = await getDb();
  if (!db) return null;
  await assertCentralOnlineStartAllowsRecord();
  if (input.listingType === "rent" && input.ownerApprovalStatus !== "approved")
    throw new Error("Kiralık ilan owner approval olmadan oluşturulamaz.");
  const result = await db
    .insert(properties)
    .values({
      referenceNo: input.referenceNo,
      title: input.title,
      address: input.address,
      listingType: input.listingType ?? "sale",
      ownerApprovalStatus: input.ownerApprovalStatus ?? "notRequired",
      assignedUserId: input.assignedUserId,
    });
  return Number(result[0].insertId);
}
export async function createLedger(input: {
  description: string;
  amount: string;
  entryType: "income" | "expense" | "receivable" | "payable";
  assignedUserId: number;
}) {
  const db = await getDb();
  if (!db) return null;
  await assertCentralOnlineStartAllowsRecord();
  const result = await db
    .insert(ledgerEntries)
    .values({
      description: input.description,
      amount: input.amount,
      entryType: input.entryType,
      assignedUserId: input.assignedUserId,
    });
  return Number(result[0].insertId);
}
export async function listTeamMembers() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      teamId: userProfiles.teamId,
      teamName: teams.name,
      officeRole: userProfiles.officeRole,
      consultantCode: userProfiles.consultantCode,
      status: userProfiles.status,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .leftJoin(teams, eq(userProfiles.teamId, teams.id))
    .orderBy(desc(userProfiles.status), users.id);
}

export async function setConsultantCode(
  userId: number,
  consultantCode: string,
  managerUserId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const normalized = normalizeConsultantCode(consultantCode);
  if (!isConsultantCode(normalized))
    throw new Error(
      "Danışman kodu IP1, KT1, CT1 veya CT2 biçiminde olmalıdır."
    );
  const existing = await db
    .select({ id: userProfiles.id })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  if (existing[0])
    await db
      .update(userProfiles)
      .set({ consultantCode: normalized, status: "active" })
      .where(eq(userProfiles.userId, userId));
  else
    await db
      .insert(userProfiles)
      .values({
        userId,
        consultantCode: normalized,
        officeRole: "consultant",
        status: "active",
      });
  await db
    .insert(auditLogs)
    .values({
      actorUserId: managerUserId,
      action: "consultant_code_updated",
      entityType: "userProfile",
      entityId: userId,
      summary: `${normalized} danışman kodu güncellendi`,
    });
  return { userId, consultantCode: normalized };
}

export async function setOfficeAssistantAssignments(input: {
  assistantUserId: number;
  consultantUserIds: number[];
  managerUserId: number;
}) {
  const db = await getDb();
  if (!db) return false;
  const assistant = await db
    .select({ userId: userProfiles.userId })
    .from(userProfiles)
    .where(eq(userProfiles.userId, input.assistantUserId))
    .limit(1);
  if (!assistant[0])
    throw new Error("Ofis asistanı için kullanıcı profili bulunamadı.");
  const consultantIds = Array.from(
    new Set(input.consultantUserIds.filter(id => id !== input.assistantUserId))
  );
  await db
    .update(userProfiles)
    .set({ officeRole: "office_assistant", managerId: input.managerUserId })
    .where(eq(userProfiles.userId, input.assistantUserId));
  await db
    .update(officeAssistantAssignments)
    .set({ active: 0 })
    .where(
      eq(officeAssistantAssignments.assistantUserId, input.assistantUserId)
    );
  if (consultantIds.length)
    await db
      .insert(officeAssistantAssignments)
      .values(
        consultantIds.map(consultantUserId => ({
          assistantUserId: input.assistantUserId,
          consultantUserId,
          assignedByUserId: input.managerUserId,
          active: 1,
        }))
      );
  await db
    .insert(auditLogs)
    .values({
      actorUserId: input.managerUserId,
      action: "office_assistant_scope_updated",
      entityType: "userProfile",
      entityId: input.assistantUserId,
      summary: `Ofis asistanı kapsamı ${consultantIds.length} danışman kaydı için güncellendi`,
    });
  return true;
}

export async function listTreasuryCashMovements(date: Date) {
  const db = await getDb();
  if (!db) return [];
  const day = date.toISOString().slice(0, 10);
  return db
    .select()
    .from(treasuryCashMovements)
    .where(sql`date(${treasuryCashMovements.occurredOn}) = ${day}`)
    .orderBy(desc(treasuryCashMovements.createdAt));
}

export async function getTreasuryCashBalance(date: Date) {
  const db = await getDb();
  if (!db)
    return {
      date,
      openingCash: 0,
      bankToCash: 0,
      cashReceipts: 0,
      cashExpenses: 0,
      cashDeposits: 0,
      expectedCash: 0,
      countedCash: null as number | null,
      difference: null as number | null,
      unverifiedCount: 0,
      evidenceMissingCount: 0,
      movements: [] as Awaited<ReturnType<typeof listTreasuryCashMovements>>,
    };
  const day = date.toISOString().slice(0, 10);
  const movements = await listTreasuryCashMovements(date);
  const previousCounts = await db
    .select()
    .from(treasuryCashDailyCounts)
    .where(sql`date(${treasuryCashDailyCounts.controlDate}) < ${day}`)
    .orderBy(desc(treasuryCashDailyCounts.controlDate))
    .limit(1);
  const todayCount = await db
    .select()
    .from(treasuryCashDailyCounts)
    .where(sql`date(${treasuryCashDailyCounts.controlDate}) = ${day}`)
    .orderBy(desc(treasuryCashDailyCounts.managerVerifiedAt))
    .limit(1);
  const openingCash = Number(
    previousCounts[0]?.countedCash ?? previousCounts[0]?.openingCash ?? 0
  );
  const settled = movements.filter(movement =>
    ["managerVerified", "reconciled"].includes(movement.status)
  );
  const total = (
    type: "bankToCash" | "cashReceipt" | "cashExpense" | "cashDeposit"
  ) =>
    settled
      .filter(movement => movement.movementType === type)
      .reduce((sum, movement) => sum + Number(movement.amount), 0);
  const bankToCash = total("bankToCash");
  const cashReceipts = total("cashReceipt");
  const cashExpenses = total("cashExpense");
  const cashDeposits = total("cashDeposit");
  const expectedCash =
    openingCash + bankToCash + cashReceipts - cashExpenses - cashDeposits;
  const countedCash =
    todayCount[0]?.countedCash === null ||
    todayCount[0]?.countedCash === undefined
      ? null
      : Number(todayCount[0].countedCash);
  return {
    date,
    openingCash,
    bankToCash,
    cashReceipts,
    cashExpenses,
    cashDeposits,
    expectedCash,
    countedCash,
    difference: countedCash === null ? null : countedCash - expectedCash,
    unverifiedCount: movements.filter(
      movement => movement.status === "declared"
    ).length,
    evidenceMissingCount: movements.filter(
      movement => !movement.evidenceReference.trim()
    ).length,
    movements,
  };
}

export async function createTreasuryCashMovement(input: {
  movementType:
    | "bankToCash"
    | "cashExpense"
    | "cashReceipt"
    | "cashDeposit"
    | "other";
  direction: "in" | "out";
  amount: string;
  occurredOn: Date;
  counterparty: string;
  evidenceReference: string;
  note?: string;
  enteredByUserId: number;
}) {
  const db = await getDb();
  if (!db) return null;
  await assertCentralOnlineStartAllowsRecord(input.occurredOn);
  const result = await db
    .insert(treasuryCashMovements)
    .values({ ...input, status: "declared" });
  const id = Number(result[0].insertId);
  await db
    .insert(auditLogs)
    .values({
      actorUserId: input.enteredByUserId,
      action: "treasury_cash_declared",
      entityType: "treasuryCashMovement",
      entityId: id,
      summary: `${input.movementType} kasa hareketi belge referansıyla beyan edildi`,
    });
  return id;
}

export async function verifyTreasuryCashMovement(
  id: number,
  managerUserId: number
) {
  const db = await getDb();
  if (!db) return false;
  const current = await db
    .select()
    .from(treasuryCashMovements)
    .where(eq(treasuryCashMovements.id, id))
    .limit(1);
  if (!current[0]) throw new Error("Kasa hareketi bulunamadı.");
  if (current[0].status === "voided")
    throw new Error("İptal edilmiş kasa hareketi doğrulanamaz.");
  await db
    .update(treasuryCashMovements)
    .set({
      status: "managerVerified",
      verifiedByUserId: managerUserId,
      verifiedAt: new Date(),
    })
    .where(eq(treasuryCashMovements.id, id));
  await db
    .insert(auditLogs)
    .values({
      actorUserId: managerUserId,
      action: "treasury_cash_verified",
      entityType: "treasuryCashMovement",
      entityId: id,
      summary: `${current[0].movementType} kasa hareketi broker manager tarafından doğrulandı`,
    });
  return true;
}

export async function closeTreasuryCashDay(input: {
  date: Date;
  openingCash: string;
  countedCash: string;
  note?: string;
  managerUserId: number;
}) {
  const db = await getDb();
  if (!db) return null;
  await assertCentralOnlineStartAllowsRecord(input.date);
  const result = await db
    .insert(treasuryCashDailyCounts)
    .values({
      controlDate: input.date,
      openingCash: input.openingCash,
      countedCash: input.countedCash,
      note: input.note,
      closedByUserId: input.managerUserId,
      managerVerifiedAt: new Date(),
    });
  const id = Number(result[0].insertId);
  await db
    .insert(auditLogs)
    .values({
      actorUserId: input.managerUserId,
      action: "treasury_cash_day_closed",
      entityType: "treasuryCashDailyCount",
      entityId: id,
      summary: "Gün sonu kasa sayımı broker manager tarafından kaydedildi",
    });
  return id;
}

export type ActiveRentalSummaryWithScope = {
  id: number;
  clientId: number;
  clientName: string;
  clientPhone: string | null;
  tenantName: string;
  tenantPhone: string;
  contractDate: Date;
  rentIncreaseDate: Date | null;
  evictionDate: Date | null;
  monthlyRent: string;
  neighborhood: string;
  propertyLocation: string;
  unitInfo: string;
  assignedUserId: number;
  consultantCode: string | null;
  increaseRate: string | null;
  increaseRateSource: string | null;
  increaseRatePeriod: string | null;
  increaseRateEntryMethod: "official_reference" | "manual";
  noticeStatus: "notPrepared" | "prepared" | "reviewed" | "shared";
  noticePreparedAt: Date | null;
  noticeReviewedByUserId: number | null;
  noticeReviewedAt: Date | null;
  noticeSharedByUserId: number | null;
  noticeSharedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function activeRentalScope(
  userId: number,
  isManager: boolean,
  permittedUserIds: number[]
) {
  if (isManager) return undefined;
  return permittedUserIds.length
    ? inArray(activeRentalSummaries.assignedUserId, permittedUserIds)
    : sql`1 = 0`;
}

export async function getActiveRentalAccess(
  userId: number,
  isManager: boolean,
  permittedUserIds: number[]
) {
  return {
    isManager,
    permittedUserIds,
    canImport: isManager,
    canManageNotices: isManager || permittedUserIds.includes(userId),
  };
}

export async function listActiveRentalSummaries(
  userId: number,
  isManager: boolean,
  permittedUserIds: number[],
  officeRole?: CentralAccessScope["officeRole"]
) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      summary: activeRentalSummaries,
      clientName: clients.name,
      clientPhone: clients.phone,
      consultantCode: userProfiles.consultantCode,
    })
    .from(activeRentalSummaries)
    .innerJoin(clients, eq(activeRentalSummaries.clientId, clients.id))
    .leftJoin(
      userProfiles,
      eq(activeRentalSummaries.assignedUserId, userProfiles.userId)
    )
    .where(activeRentalScope(userId, isManager, permittedUserIds))
    .orderBy(
      activeRentalSummaries.clientId,
      activeRentalSummaries.propertyLocation,
      activeRentalSummaries.unitInfo
    );
  return rows.map(row => ({
    ...row.summary,
    clientName: row.clientName,
    clientPhone: maskPhone(row.clientPhone),
    tenantPhone: maskPhone(row.summary.tenantPhone) ?? "",
    consultantCode: row.consultantCode,
    canRevealSensitive:
      isManager ||
      (officeRole === "consultant" && row.summary.assignedUserId === userId),
  }));
}

export async function revealActiveRentalSensitive(
  summaryId: number,
  reason: string,
  actorUserId: number,
  isManager: boolean,
  officeRole: CentralAccessScope["officeRole"]
) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const safeReason = assertSafeRevealReason(reason);
  const result = await db
    .select({ summary: activeRentalSummaries, clientPhone: clients.phone })
    .from(activeRentalSummaries)
    .innerJoin(clients, eq(activeRentalSummaries.clientId, clients.id))
    .where(eq(activeRentalSummaries.id, summaryId))
    .limit(1);
  const row = result[0];
  if (!row) throw new Error("Aktif kira kaydı bulunamadı.");
  assertSensitiveRevealAccess({
    actorUserId,
    isManager,
    officeRole,
    assignedUserId: row.summary.assignedUserId,
  });
  const [tenantPhone, clientPhone] = await Promise.all([
    getSensitiveField(db, "activeRentalSummary", summaryId, "tenantPhone"),
    getSensitiveField(db, "client", row.summary.clientId, "phone"),
  ]);
  await db.insert(auditLogs).values({
    actorUserId,
    action: "sensitive_data_revealed",
    entityType: "activeRentalSummary",
    entityId: summaryId,
    summary: `Gerekçeli hassas veri görünümü: ${safeReason}`,
  });
  return {
    tenantPhone: tenantPhone ?? row.summary.tenantPhone,
    clientPhone: clientPhone ?? row.clientPhone,
    expiresAt: new Date(Date.now() + 30_000),
  };
}

export type RentalIncomeTaxProfileInput = {
  clientId: number;
  taxYear: number;
  ownershipSharePercent: string;
  residentialExemptionEligible: boolean;
  expenseMethod: "lump_sum" | "actual";
  actualExpenseTotal: string;
  actorUserId: number;
  isManager: boolean;
  permittedUserIds: number[];
};

export async function listRentalIncomeTaxProfiles(
  userId: number,
  isManager: boolean,
  permittedUserIds: number[],
  taxYear: number
) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ profile: rentalIncomeTaxProfiles })
    .from(rentalIncomeTaxProfiles)
    .innerJoin(
      activeRentalSummaries,
      eq(rentalIncomeTaxProfiles.clientId, activeRentalSummaries.clientId)
    )
    .where(
      and(
        eq(rentalIncomeTaxProfiles.taxYear, taxYear),
        activeRentalScope(userId, isManager, permittedUserIds)
      )
    )
    .groupBy(rentalIncomeTaxProfiles.id)
    .orderBy(rentalIncomeTaxProfiles.clientId);
  return rows.map(row => row.profile);
}

export async function saveRentalIncomeTaxProfile(
  input: RentalIncomeTaxProfileInput
) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const accessibleRental = await db
    .select({ id: activeRentalSummaries.id })
    .from(activeRentalSummaries)
    .where(
      and(
        eq(activeRentalSummaries.clientId, input.clientId),
        activeRentalScope(
          input.actorUserId,
          input.isManager,
          input.permittedUserIds
        )
      )
    )
    .limit(1);
  if (!accessibleRental[0])
    throw new Error("Bu malik için vergi ön bilgisi güncelleme yetkiniz bulunmuyor.");
  await assertCentralOnlineStartAllowsRecord();
  await db
    .insert(rentalIncomeTaxProfiles)
    .values({
      clientId: input.clientId,
      taxYear: input.taxYear,
      ownershipSharePercent: input.ownershipSharePercent,
      residentialExemptionEligible: input.residentialExemptionEligible ? 1 : 0,
      expenseMethod: input.expenseMethod,
      actualExpenseTotal: input.actualExpenseTotal,
      updatedByUserId: input.actorUserId,
    })
    .onDuplicateKeyUpdate({
      set: {
        ownershipSharePercent: input.ownershipSharePercent,
        residentialExemptionEligible: input.residentialExemptionEligible ? 1 : 0,
        expenseMethod: input.expenseMethod,
        actualExpenseTotal: input.actualExpenseTotal,
        updatedByUserId: input.actorUserId,
      },
    });
  await db.insert(auditLogs).values({
    actorUserId: input.actorUserId,
    action: "rental_income_tax_profile_saved",
    entityType: "client",
    entityId: input.clientId,
    summary: `${input.taxYear} kira geliri vergisi ön bilgi parametreleri güncellendi; resmî beyan veya tahakkuk değildir.`,
  });
  const rows = await db
    .select()
    .from(rentalIncomeTaxProfiles)
    .where(
      and(
        eq(rentalIncomeTaxProfiles.clientId, input.clientId),
        eq(rentalIncomeTaxProfiles.taxYear, input.taxYear)
      )
    )
    .limit(1);
  return rows[0];
}

export type ActiveRentalImportRow = {
  clientName: string;
  clientPhone: string;
  tenantName: string;
  tenantPhone: string;
  contractDate: Date;
  rentIncreaseDate?: Date;
  evictionDate?: Date;
  monthlyRent: string;
  neighborhood: string;
  propertyLocation: string;
  unitInfo: string;
  authorityCode?: string;
  assignedUserId: number;
  consultantCode: string;
};

function normalizeImportValue(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
}

function importFingerprint(row: ActiveRentalImportRow) {
  return createHash("sha256")
    .update(
      [
        normalizeImportValue(row.clientName),
        normalizeImportValue(row.clientPhone),
        normalizeImportValue(row.tenantName),
        normalizeImportValue(row.tenantPhone),
        row.contractDate.toISOString().slice(0, 10),
        normalizeImportValue(row.neighborhood),
        normalizeImportValue(row.propertyLocation),
        normalizeImportValue(row.unitInfo),
        normalizeImportValue(row.authorityCode ?? ""),
        row.assignedUserId,
      ].join("|")
    )
    .digest("hex");
}

export async function importActiveRentalSummaries(
  rows: ActiveRentalImportRow[],
  importedByUserId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  if (!rows.length)
    throw new Error("Aktarılacak geçerli aktif kira satırı bulunamadı.");
  await assertCentralOnlineStartAllowsRecord();
  const fingerprints = new Set<string>();
  for (const row of rows) {
    const fingerprint = importFingerprint(row);
    if (fingerprints.has(fingerprint))
      throw new Error(
        `${row.clientName} için aynı taşınmaz satırı dosya içinde mükerrer.`
      );
    fingerprints.add(fingerprint);
    const existingFingerprint = await db
      .select({ id: activeRentalSummaries.id })
      .from(activeRentalSummaries)
      .where(eq(activeRentalSummaries.importFingerprint, fingerprint))
      .limit(1);
    if (existingFingerprint.length)
      throw new Error(
        `${row.clientName} için aynı aktif kira özeti daha önce aktarılmış.`
      );
    const existingClient = await db
      .select({
        id: clients.id,
        phone: clients.phone,
        assignedUserId: clients.assignedUserId,
      })
      .from(clients)
      .where(
        and(
          eq(clients.name, row.clientName),
          eq(clients.assignedUserId, row.assignedUserId)
        )
      )
      .limit(1);
    if (
      existingClient[0]?.phone &&
      !existingClient[0].phone.includes("•") &&
      normalizeImportValue(existingClient[0].phone) !==
        normalizeImportValue(row.clientPhone)
    )
      throw new Error(
        `${row.clientName} müşteri telefonu mevcut kayıtla uyuşmuyor; aktarım durduruldu.`
      );
  }
  let createdClients = 0;
  let imported = 0;
  for (const row of rows) {
    let client = (
      await db
        .select({ id: clients.id, phone: clients.phone })
        .from(clients)
        .where(
          and(
            eq(clients.name, row.clientName),
            eq(clients.assignedUserId, row.assignedUserId)
          )
        )
        .limit(1)
    )[0];
    if (!client) {
      const result = await db
        .insert(clients)
        .values({
          name: row.clientName,
          phone: maskPhone(row.clientPhone),
          assignedUserId: row.assignedUserId,
        });
      client = { id: Number(result[0].insertId), phone: maskPhone(row.clientPhone) };
      await saveSensitiveFields(db, "client", client.id, [
        { fieldPath: "phone", value: row.clientPhone },
      ]);
      createdClients += 1;
    } else if (!client.phone) {
      await db
        .update(clients)
        .set({ phone: maskPhone(row.clientPhone) })
        .where(eq(clients.id, client.id));
      await saveSensitiveFields(db, "client", client.id, [
        { fieldPath: "phone", value: row.clientPhone },
      ]);
    }
    const activeRentalInsert = await db.insert(activeRentalSummaries).values({
      clientId: client.id,
      tenantName: row.tenantName,
      tenantPhone: maskPhone(row.tenantPhone) ?? "",
      contractDate: row.contractDate,
      rentIncreaseDate: row.rentIncreaseDate,
      evictionDate: row.evictionDate,
      monthlyRent: row.monthlyRent,
      neighborhood: row.neighborhood,
      propertyLocation: row.propertyLocation,
      unitInfo: row.unitInfo,
      authorityCode: row.authorityCode?.trim() || null,
      assignedUserId: row.assignedUserId,
      importFingerprint: importFingerprint(row),
      importedByUserId,
    });
    await saveSensitiveFields(
      db,
      "activeRentalSummary",
      Number(activeRentalInsert[0].insertId),
      [{ fieldPath: "tenantPhone", value: row.tenantPhone }]
    );
    imported += 1;
  }
  await db
    .insert(auditLogs)
    .values({
      actorUserId: importedByUserId,
      action: "active_rental_summaries_imported",
      entityType: "activeRentalSummaries",
      summary: `${imported} aktif kira özeti ve ${createdClients} müşteri kartı broker manager onayıyla aktarıldı.`,
    });
  return { imported, createdClients };
}

export async function saveActiveRentalIncreaseReference(input: {
  summaryId: number;
  increaseRate: string;
  source: string;
  period: string;
  entryMethod: "official_reference" | "manual";
  actorUserId: number;
  isManager: boolean;
  permittedUserIds: number[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const row = await db
    .select({ assignedUserId: activeRentalSummaries.assignedUserId })
    .from(activeRentalSummaries)
    .where(
      and(
        eq(activeRentalSummaries.id, input.summaryId),
        activeRentalScope(
          input.actorUserId,
          input.isManager,
          input.permittedUserIds
        )
      )
    )
    .limit(1);
  if (!row[0]) throw new Error("Bu aktif kira özeti için yetkiniz bulunmuyor.");
  await db
    .update(activeRentalSummaries)
    .set({
      increaseRate: input.increaseRate,
      increaseRateSource: input.source.trim(),
      increaseRatePeriod: input.period.trim(),
      increaseRateEntryMethod: input.entryMethod,
      increaseRateEnteredByUserId: input.actorUserId,
      increaseRateEnteredAt: new Date(),
      noticeStatus: "prepared",
      noticePreparedAt: new Date(),
    })
    .where(eq(activeRentalSummaries.id, input.summaryId));
  return true;
}

export async function reviewActiveRentalNotice(
  summaryId: number,
  managerUserId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  await db
    .update(activeRentalSummaries)
    .set({
      noticeStatus: "reviewed",
      noticeReviewedByUserId: managerUserId,
      noticeReviewedAt: new Date(),
    })
    .where(eq(activeRentalSummaries.id, summaryId));
  return true;
}

export async function markActiveRentalNoticeShared(input: {
  summaryId: number;
  actorUserId: number;
  isManager: boolean;
  permittedUserIds: number[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const row = await db
    .select({ noticeStatus: activeRentalSummaries.noticeStatus })
    .from(activeRentalSummaries)
    .where(
      and(
        eq(activeRentalSummaries.id, input.summaryId),
        activeRentalScope(
          input.actorUserId,
          input.isManager,
          input.permittedUserIds
        )
      )
    )
    .limit(1);
  if (!row[0]) throw new Error("Bu aktif kira özeti için yetkiniz bulunmuyor.");
  if (row[0].noticeStatus !== "reviewed")
    throw new Error(
      "Paylaşım kaydı için önce broker manager gözden geçirmesi gerekir."
    );
  await db
    .update(activeRentalSummaries)
    .set({
      noticeStatus: "shared",
      noticeSharedByUserId: input.actorUserId,
      noticeSharedAt: new Date(),
    })
    .where(eq(activeRentalSummaries.id, input.summaryId));
  return true;
}

function serviceKeyFor(
  kind: string,
  clientId: number,
  summaryId: number | null,
  year: number
) {
  return `${kind}-${clientId}-${summaryId ?? "owner"}-${year}`;
}

function nextContractPeriodEnd(contractDate: Date | string, now: Date) {
  const contract = new Date(contractDate);
  const candidate = new Date(
    now.getFullYear(),
    contract.getMonth(),
    contract.getDate()
  );
  if (
    candidate.getTime() <
    new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  )
    candidate.setFullYear(candidate.getFullYear() + 1);
  return candidate;
}

function daysBefore(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export async function refreshRentalServiceTasks(managerUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const summaries = await listActiveRentalSummaries(managerUserId, true, []);
  const now = new Date();
  let created = 0;
  for (const summary of summaries) {
    const events: Array<{
      serviceType: "rentIncrease" | "ownerLeaseReview";
      dueDate: Date;
    }> = [];
    const increaseDate = summary.rentIncreaseDate
      ? new Date(summary.rentIncreaseDate)
      : new Date(
          now.getFullYear(),
          new Date(summary.contractDate).getMonth(),
          new Date(summary.contractDate).getDate()
        );
    if (increaseDate.getTime() < now.getTime())
      increaseDate.setFullYear(increaseDate.getFullYear() + 1);
    if (Math.ceil((increaseDate.getTime() - now.getTime()) / 86_400_000) <= 45)
      events.push({ serviceType: "rentIncrease", dueDate: increaseDate });
    const periodEnd = nextContractPeriodEnd(summary.contractDate, now);
    events.push({
      serviceType: "ownerLeaseReview",
      dueDate: daysBefore(periodEnd, 60),
    });
    for (const event of events) {
      const key = serviceKeyFor(
        event.serviceType,
        summary.clientId,
        summary.id,
        event.dueDate.getFullYear()
      );
      const exists = await db
        .select({ id: rentalServiceTasks.id })
        .from(rentalServiceTasks)
        .where(eq(rentalServiceTasks.serviceKey, key))
        .limit(1);
      if (!exists.length) {
        await db
          .insert(rentalServiceTasks)
          .values({
            serviceKey: key,
            activeRentalSummaryId: summary.id,
            clientId: summary.clientId,
            assignedUserId: summary.assignedUserId,
            serviceType: event.serviceType,
            dueDate: event.dueDate,
            status: "planned",
          });
        created += 1;
      }
    }
  }
  const ownerIds = Array.from(
    new Set(summaries.map(summary => summary.clientId))
  );
  for (const clientId of ownerIds) {
    const summary = summaries.find(
      candidate => candidate.clientId === clientId
    )!;
    for (const [serviceType, month, day, leadDays] of [
      ["propertyTaxFirstInstallment", 4, 31, 15],
      ["propertyTaxSecondInstallment", 10, 30, 15],
      ["rentalIncomeTaxDeclaration", 2, 31, 0],
    ] as const) {
      const date = new Date(now.getFullYear(), month, day);
      if (date.getTime() < now.getTime())
        date.setFullYear(date.getFullYear() + 1);
      const dueDate = daysBefore(date, leadDays);
      const key = serviceKeyFor(
        serviceType,
        clientId,
        null,
        date.getFullYear()
      );
      const exists = await db
        .select({ id: rentalServiceTasks.id })
        .from(rentalServiceTasks)
        .where(eq(rentalServiceTasks.serviceKey, key))
        .limit(1);
      if (!exists.length) {
        await db
          .insert(rentalServiceTasks)
          .values({
            serviceKey: key,
            clientId,
            assignedUserId: summary.assignedUserId,
            serviceType,
            dueDate,
            status: "planned",
          });
        created += 1;
      } else
        await db
          .update(rentalServiceTasks)
          .set({ dueDate })
          .where(
            and(
              eq(rentalServiceTasks.id, exists[0].id),
              eq(rentalServiceTasks.status, "planned")
            )
          );
    }
  }
  return { created };
}

async function rentalServiceTaskInScope(
  taskId: number,
  userId: number,
  isManager: boolean,
  permittedUserIds: number[]
) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(rentalServiceTasks)
    .where(
      and(
        eq(rentalServiceTasks.id, taskId),
        isManager
          ? undefined
          : permittedUserIds.length
            ? inArray(rentalServiceTasks.assignedUserId, permittedUserIds)
            : sql`1 = 0`
      )
    )
    .limit(1);
  return rows[0];
}

export async function listRentalServiceTasks(
  userId: number,
  isManager: boolean,
  permittedUserIds: number[]
) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      task: rentalServiceTasks,
      clientName: clients.name,
      tenantName: activeRentalSummaries.tenantName,
      propertyLocation: activeRentalSummaries.propertyLocation,
      unitInfo: activeRentalSummaries.unitInfo,
      consultantCode: userProfiles.consultantCode,
    })
    .from(rentalServiceTasks)
    .innerJoin(clients, eq(rentalServiceTasks.clientId, clients.id))
    .leftJoin(
      activeRentalSummaries,
      eq(rentalServiceTasks.activeRentalSummaryId, activeRentalSummaries.id)
    )
    .leftJoin(
      userProfiles,
      eq(rentalServiceTasks.assignedUserId, userProfiles.userId)
    )
    .where(
      isManager
        ? undefined
        : permittedUserIds.length
          ? inArray(rentalServiceTasks.assignedUserId, permittedUserIds)
          : sql`1 = 0`
    )
    .orderBy(rentalServiceTasks.dueDate);
}

export async function prepareRentalServiceTask(
  taskId: number,
  actorUserId: number,
  isManager: boolean,
  permittedUserIds: number[]
) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const task = await rentalServiceTaskInScope(
    taskId,
    actorUserId,
    isManager,
    permittedUserIds
  );
  if (!task)
    throw new Error("Bu müşteri hizmet görevi için yetkiniz bulunmuyor.");
  await db
    .update(rentalServiceTasks)
    .set({
      status: "prepared",
      preparedByUserId: actorUserId,
      preparedAt: new Date(),
    })
    .where(eq(rentalServiceTasks.id, taskId));
  return true;
}

export async function reviewRentalServiceTask(
  taskId: number,
  managerUserId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const task = await rentalServiceTaskInScope(taskId, managerUserId, true, []);
  if (!task) throw new Error("Müşteri hizmet görevi bulunamadı.");
  if (task.status !== "prepared")
    throw new Error(
      "Önce danışman veya yetkili kullanıcı taslağı hazırlamalıdır."
    );
  await db
    .update(rentalServiceTasks)
    .set({
      status: "reviewed",
      reviewedByUserId: managerUserId,
      reviewedAt: new Date(),
    })
    .where(eq(rentalServiceTasks.id, taskId));
  return true;
}

export async function markRentalServiceTaskShared(input: {
  taskId: number;
  actorUserId: number;
  isManager: boolean;
  permittedUserIds: number[];
  responseNote?: string;
  ownerConfirmedTenantExit?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const task = await rentalServiceTaskInScope(
    input.taskId,
    input.actorUserId,
    input.isManager,
    input.permittedUserIds
  );
  if (!task)
    throw new Error("Bu müşteri hizmet görevi için yetkiniz bulunmuyor.");
  if (task.status !== "reviewed")
    throw new Error(
      "Paylaşım kaydı için önce manager gözden geçirmesi gerekir."
    );
  const responseNote = input.responseNote?.trim().slice(0, 1000) || null;
  const ownerConfirmedTenantExit =
    task.serviceType === "ownerLeaseReview" &&
    input.ownerConfirmedTenantExit === true
      ? 1
      : 0;
  if (ownerConfirmedTenantExit && !responseNote)
    throw new Error(
      "Olumlu ayrılma teyidi için malik görüşme notu girilmelidir."
    );
  await db
    .update(rentalServiceTasks)
    .set({
      status: "shared",
      sharedByUserId: input.actorUserId,
      sharedAt: new Date(),
      customerResponseNote: responseNote,
      ownerConfirmedTenantExit,
    })
    .where(eq(rentalServiceTasks.id, input.taskId));
  return true;
}

export async function startRelettingPreparation(input: {
  sourceTaskId: number;
  actorUserId: number;
  isManager: boolean;
  permittedUserIds: number[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const source = await rentalServiceTaskInScope(
    input.sourceTaskId,
    input.actorUserId,
    input.isManager,
    input.permittedUserIds
  );
  if (!source)
    throw new Error("Bu malik kontrolü görevi için yetkiniz bulunmuyor.");
  if (source.serviceType !== "ownerLeaseReview" || source.status !== "shared")
    throw new Error(
      "Yeniden kiralama hazırlığı yalnız malik kontrolü paylaşım kaydından sonra başlatılabilir."
    );
  if (source.ownerConfirmedTenantExit !== 1)
    throw new Error(
      "Yeniden kiralama hazırlığı için malikin kiracıdan açık ayrılma isteği aldığını teyit etmesi gerekir."
    );
  if (!source.activeRentalSummaryId)
    throw new Error("Bu görevde taşınmaz özeti bulunamadı.");
  const serviceKey = `reletting-preparation-${source.id}`;
  const exists = await db
    .select({ id: rentalServiceTasks.id })
    .from(rentalServiceTasks)
    .where(eq(rentalServiceTasks.serviceKey, serviceKey))
    .limit(1);
  if (exists.length) return { created: false, taskId: exists[0].id };
  const result = await db
    .insert(rentalServiceTasks)
    .values({
      serviceKey,
      activeRentalSummaryId: source.activeRentalSummaryId,
      clientId: source.clientId,
      assignedUserId: source.assignedUserId,
      serviceType: "relettingPreparation",
      dueDate: new Date(),
      status: "planned",
    });
  const taskId = Number(result[0].insertId);
  await db
    .insert(auditLogs)
    .values({
      actorUserId: input.actorUserId,
      action: "reletting_preparation_started",
      entityType: "rentalServiceTasks",
      entityId: taskId,
      summary:
        "Malik kontrolü sonrasında yeniden kiralama hazırlığı başlatıldı; otomatik ilan veya dış iletişim yapılmadı.",
    });
  return { created: true, taskId };
}


export type CentralCommissionParticipantInput = {
  participantType: "consultant" | "externalOffice";
  side: "buyer" | "seller" | "shared";
  consultantUserId?: number;
  participantCode: string;
  participantName: string;
  externalOfficeName?: string;
  rate: number;
};

export async function createCentralCommissionTransaction(input: {
  transactionNo: string;
  contractId?: number;
  buyerClientId?: number;
  sellerClientId?: number;
  collectionNote?: string;
  netServiceFee: string;
  discountAmount?: string;
  vatAmount?: string;
  portfolioOwnerType?: "consultant" | "office";
  portfolioRightsPolicy?: "individualConsultant" | "corporateOffice";
  originatingConsultantUserId?: number;
  fulfillingConsultantUserId?: number;
  consultantRightsSplitPercent?: number;
  corporateOfficePaysConsultant?: boolean;
  externalOfficeRole?: "none" | "counterpartyPortfolio" | "global1881External";
  agreementProfileId?: number;
  collectionReference: string;
  overrideReason?: string;
  participants: CentralCommissionParticipantInput[];
}, actorUserId: number, isManager: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veritabanı bağlantısı kullanılamıyor.");
  const explicitProfile = input.agreementProfileId ? (await db.select().from(consultantAgreementProfiles).where(eq(consultantAgreementProfiles.id, input.agreementProfileId)).limit(1))[0] ?? null : null;
  if (input.agreementProfileId && !isManager) throw new Error("Anlaşma profilini yalnız broker manager seçebilir.");
  if (input.agreementProfileId && (!explicitProfile || explicitProfile.status !== "active")) throw new Error("Seçilen danışman anlaşma profili aktif değil.");
  const actorProfile = !isManager ? await getActiveConsultantAgreementProfile(actorUserId) : null;
  const consultantProfiles = new Map<number, typeof explicitProfile>();
  for (const participant of input.participants) {
    if (participant.participantType === "consultant" && participant.consultantUserId) consultantProfiles.set(participant.consultantUserId, explicitProfile ?? await getActiveConsultantAgreementProfile(participant.consultantUserId));
  }
  const snapshotProfile = explicitProfile ?? actorProfile ?? Array.from(consultantProfiles.values()).find(Boolean) ?? null;
  const snapshotConsultantRate = Number(snapshotProfile?.consultantSharePercent ?? "60");
  const snapshotOfficeRate = Number(snapshotProfile?.officeSharePercent ?? "40");
  const grossNetServiceFee = Number(input.netServiceFee);
  const discountAmount = Number(input.discountAmount ?? "0");
  const netServiceFee = grossNetServiceFee - discountAmount;
  const vatAmount = Number(input.vatAmount ?? "0");
  if (!Number.isFinite(grossNetServiceFee) || grossNetServiceFee <= 0 || !Number.isFinite(discountAmount) || discountAmount < 0 || discountAmount >= grossNetServiceFee || !input.transactionNo.trim() || !input.collectionReference.trim() || !input.participants.length) throw new Error("İşlem no, KDV hariç hizmet bedeli, geçerli indirim, tahsilat referansı ve en az bir paydaş zorunludur.");
  const rateTotal = input.participants.reduce((sum, participant) => sum + Number(participant.rate), 0);
  const consultantRate = input.participants.filter((participant) => participant.participantType === "consultant").reduce((sum, participant) => sum + Number(participant.rate), 0);
  const externalOfficeRate = input.participants.filter((participant) => participant.participantType === "externalOffice").reduce((sum, participant) => sum + Number(participant.rate), 0);
  if (!Number.isFinite(rateTotal) || Math.round(rateTotal * 100) !== 10000) throw new Error("Komisyon havuzu pay oranları toplamı %100 olmalıdır.");
  if (externalOfficeRate > 0 && (!isManager || !input.overrideReason?.trim())) throw new Error("Dış ofis paylaşımı için broker manager ve gerekçe zorunludur.");
  if (externalOfficeRate === 0 && consultantRate !== 100 && (!isManager || !input.overrideReason?.trim())) throw new Error("Global havuz dağılımı %100 değilse broker manager ve gerekçe zorunludur.");
  const rightsSplit = Number(input.consultantRightsSplitPercent ?? 50);
  if (!Number.isFinite(rightsSplit) || rightsSplit < 0 || rightsSplit > 100) throw new Error("Eski danışman hak paylaşım oranı 0 ile 100 arasında olmalıdır.");
  if (rightsSplit !== 50 && (!isManager || !input.overrideReason?.trim())) throw new Error("Standart dışı eski danışman hak paylaşımı için broker manager ve gerekçe zorunludur.");
  if (input.portfolioRightsPolicy === "corporateOffice" && input.originatingConsultantUserId && !isManager) throw new Error("Kurumsal ofis portföy haklarını yalnız broker manager tanımlayabilir.");
  if (input.participants.some((participant) => !participant.participantCode.trim() || !participant.participantName.trim() || Number(participant.rate) < 0)) throw new Error("Her paydaşın kodu, adı ve geçerli oranı zorunludur.");
  const corporateOfficeNoPayout = input.portfolioRightsPolicy === "corporateOffice" && input.corporateOfficePaysConsultant === false;
  const participantRows = input.participants.map((participant) => {
    const share = Math.round(netServiceFee * Number(participant.rate) / 100 * 100) / 100;
    const profile = participant.participantType === "consultant" && participant.consultantUserId ? consultantProfiles.get(participant.consultantUserId) : snapshotProfile;
    const consultantRate = Number(profile?.consultantSharePercent ?? snapshotConsultantRate);
    const officeRate = Number(profile?.officeSharePercent ?? snapshotOfficeRate);
    const consultantPayout = participant.participantType === "consultant" && !corporateOfficeNoPayout ? Math.round(share * consultantRate / 100 * 100) / 100 : 0;
    const globalOfficeShare = participant.participantType === "consultant" && corporateOfficeNoPayout ? share : participant.participantType === "consultant" ? Math.round(share * officeRate / 100 * 100) / 100 : 0;
    return { ...participant, rate: Number(participant.rate), share, consultantPayout, globalOfficeShare };
  });
  const consultantShare = participantRows.filter((participant) => participant.participantType === "consultant").reduce((sum, participant) => sum + participant.consultantPayout, 0);
  const consultantGlobalOfficeShare = participantRows.reduce((sum, participant) => sum + participant.globalOfficeShare, 0);
  const externalOfficeShare = participantRows.filter((participant) => participant.participantType === "externalOffice").reduce((sum, participant) => sum + participant.share, 0);
  const globalPortfolioOfficeShare = input.portfolioOwnerType === "office" && input.externalOfficeRole !== "counterpartyPortfolio" ? externalOfficeShare : 0;
  const global1881Share = Math.round((consultantGlobalOfficeShare + globalPortfolioOfficeShare) * 100) / 100;
  const rightsOfficePayout = corporateOfficeNoPayout ? global1881Share : 0;
  const rightsPool = input.portfolioRightsPolicy === "individualConsultant" && input.originatingConsultantUserId && input.fulfillingConsultantUserId ? consultantShare : 0;
  const originatingConsultantPayout = rightsPool > 0 ? Math.round(rightsPool * rightsSplit / 100 * 100) / 100 : 0;
  const fulfillingConsultantPayout = rightsPool > 0 ? Math.round((rightsPool - originatingConsultantPayout) * 100) / 100 : 0;
  const transactionResult = await db.insert(commissionTransactions).values({ transactionNo: input.transactionNo.trim(), contractId: input.contractId, buyerClientId: input.buyerClientId, sellerClientId: input.sellerClientId, collectionNote: input.collectionNote?.trim() || null, netServiceFee: netServiceFee.toFixed(2), discountAmount: discountAmount.toFixed(2), vatAmount: vatAmount.toFixed(2), collectedAmount: "0.00", consultantShare: consultantShare.toFixed(2), global1881Share: global1881Share.toFixed(2), externalOfficeShare: externalOfficeShare.toFixed(2), externalOfficeRole: input.externalOfficeRole ?? "none", portfolioOwnerType: input.portfolioOwnerType ?? "consultant", portfolioRightsPolicy: input.portfolioRightsPolicy ?? "individualConsultant", originatingConsultantUserId: input.originatingConsultantUserId ?? null, fulfillingConsultantUserId: input.fulfillingConsultantUserId ?? null, consultantRightsSplitPercent: rightsSplit.toFixed(2), originatingConsultantPayout: originatingConsultantPayout.toFixed(2), fulfillingConsultantPayout: fulfillingConsultantPayout.toFixed(2), rightsOfficePayout: rightsOfficePayout.toFixed(2), corporateOfficePaysConsultant: input.corporateOfficePaysConsultant === false ? 0 : 1, agreementProfileId: snapshotProfile?.id ?? null, snapshotConsultantSharePercent: snapshotConsultantRate.toFixed(2), snapshotOfficeSharePercent: snapshotOfficeRate.toFixed(2), snapshotMonthlyDeskFee: Number(snapshotProfile?.monthlyDeskFee ?? "0").toFixed(2), status: "declared", collectionReference: input.collectionReference.trim(), declaredByUserId: actorUserId, overrideReason: input.overrideReason?.trim() || null });
  const transactionId = Number(transactionResult[0].insertId);
  await db.insert(commissionParticipants).values(participantRows.map((participant) => ({ commissionTransactionId: transactionId, participantType: participant.participantType, side: participant.side, consultantUserId: participant.consultantUserId, participantCode: participant.participantCode.trim(), participantName: participant.participantName.trim(), externalOfficeName: participant.externalOfficeName?.trim() || null, rate: participant.rate.toFixed(4), share: participant.share.toFixed(2), consultantPayout: participant.consultantPayout.toFixed(2), globalOfficeShare: participant.globalOfficeShare.toFixed(2) })));
  await db.insert(auditLogs).values({ actorUserId, action: "commission-declared", entityType: "commissionTransaction", entityId: transactionId, summary: `Komisyon kaydı oluşturuldu: ${input.transactionNo.trim()} · ${participantRows.length} paydaş · danışman net ${consultantShare.toFixed(2)} · Global ofis ${global1881Share.toFixed(2)} · dış ofis ${externalOfficeShare.toFixed(2)}` });
  return { id: transactionId, transactionNo: input.transactionNo.trim(), buyerClientId: input.buyerClientId ?? null, sellerClientId: input.sellerClientId ?? null, collectionNote: input.collectionNote?.trim() || null, netServiceFee: netServiceFee.toFixed(2), discountAmount: discountAmount.toFixed(2), vatAmount: vatAmount.toFixed(2), collectedAmount: "0.00", consultantShare: consultantShare.toFixed(2), global1881Share: global1881Share.toFixed(2), externalOfficeShare: externalOfficeShare.toFixed(2), externalOfficeRole: input.externalOfficeRole ?? "none", portfolioOwnerType: input.portfolioOwnerType ?? "consultant", originatingConsultantPayout: originatingConsultantPayout.toFixed(2), fulfillingConsultantPayout: fulfillingConsultantPayout.toFixed(2), rightsOfficePayout: rightsOfficePayout.toFixed(2), corporateOfficePaysConsultant: input.corporateOfficePaysConsultant !== false, status: "declared" as const, participants: participantRows };
}

export async function listCentralCommissionTransactions(actorUserId: number, isManager: boolean, permittedUserIds: number[]) {
  const db = await getDb();
  if (!db) return [];
  const transactions = await db.select().from(commissionTransactions).orderBy(desc(commissionTransactions.createdAt));
  const allParticipants = await db.select().from(commissionParticipants);
  const visible = isManager ? transactions : transactions.filter((transaction) => allParticipants.some((participant) => participant.commissionTransactionId === transaction.id && participant.participantType === "consultant" && participant.consultantUserId !== null && (participant.consultantUserId === actorUserId || permittedUserIds.includes(participant.consultantUserId))));
  return visible.map((transaction) => ({ ...transaction, participants: allParticipants.filter((participant) => participant.commissionTransactionId === transaction.id) }));
}

export async function verifyCentralCommissionTransaction(transactionId: number, actorUserId: number, note: string) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veritabanı bağlantısı kullanılamıyor.");
  const transaction = await db.select().from(commissionTransactions).where(eq(commissionTransactions.id, transactionId)).limit(1);
  if (!transaction[0]) throw new Error("Komisyon işlemi bulunamadı.");
  await db.update(commissionTransactions).set({ status: "managerVerified", verifiedByUserId: actorUserId, verifiedAt: new Date(), verificationNote: note.trim() || null }).where(eq(commissionTransactions.id, transactionId));
  await db.insert(auditLogs).values({ actorUserId, action: "commission-verified", entityType: "commissionTransaction", entityId: transactionId, summary: `Komisyon kaydı manager tarafından doğrulandı${note.trim() ? `: ${note.trim()}` : ""}` });
  return { ...transaction[0], status: "managerVerified" as const, verifiedByUserId: actorUserId, verificationNote: note.trim() || null };
}


export async function recordCentralCommissionCollection(transactionId: number, amount: string, reference: string, actorUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veritabanı bağlantısı kullanılamıyor.");
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0 || !reference.trim()) throw new Error("Geçerli tahsilat tutarı ve referans zorunludur.");
  const rows = await db.select().from(commissionTransactions).where(eq(commissionTransactions.id, transactionId)).limit(1);
  const transaction = rows[0];
  if (!transaction) throw new Error("Komisyon işlemi bulunamadı.");
  if (["cancelled", "settled"].includes(transaction.status)) throw new Error("İptal edilmiş veya kapanmış komisyona yeni tahsilat eklenemez.");
  const collected = Number(transaction.collectedAmount) + value;
  if (collected > Number(transaction.netServiceFee) + 0.005) throw new Error("Tahsilat toplamı net hizmet bedelini aşamaz.");
  const nextStatus = collected + 0.005 >= Number(transaction.netServiceFee) ? "settled" : "partiallySettled";
  await db.update(commissionTransactions).set({ collectedAmount: collected.toFixed(2), status: nextStatus, collectionReference: `${transaction.collectionReference}; ${reference.trim()}`, settledAt: nextStatus === "settled" ? new Date() : null }).where(eq(commissionTransactions.id, transactionId));
  await db.insert(auditLogs).values({ actorUserId, action: "commission-collected", entityType: "commissionTransaction", entityId: transactionId, summary: `Komisyon tahsilatı kaydedildi: ${value.toFixed(2)} · ${reference.trim()}` });
  return { transactionId, collectedAmount: collected.toFixed(2), remainingAmount: Math.max(0, Number(transaction.netServiceFee) - collected).toFixed(2), status: nextStatus };
}

export async function cancelCentralCommissionTransaction(transactionId: number, reason: string, actorUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veritabanı bağlantısı kullanılamıyor.");
  if (!reason.trim()) throw new Error("İptal nedeni zorunludur.");
  const rows = await db.select().from(commissionTransactions).where(eq(commissionTransactions.id, transactionId)).limit(1);
  if (!rows[0]) throw new Error("Komisyon işlemi bulunamadı.");
  if (Number(rows[0].collectedAmount) > 0) throw new Error("Tahsilat alınmış komisyon işleminde iptal için ayrıca iade/mahsup süreci gerekir.");
  await db.update(commissionTransactions).set({ status: "cancelled", cancelReason: reason.trim() }).where(eq(commissionTransactions.id, transactionId));
  await db.insert(auditLogs).values({ actorUserId, action: "commission-cancelled", entityType: "commissionTransaction", entityId: transactionId, summary: `Komisyon işlemi iptal edildi: ${reason.trim()}` });
  return { transactionId, status: "cancelled" as const, cancelReason: reason.trim() };
}


export type ConsultantAgreementProfileInput = {
  userId: number;
  consultantSharePercent: number;
  officeSharePercent: number;
  monthlyDeskFee: string;
  validFrom: Date;
  validTo?: Date;
  note?: string;
};

export async function listConsultantAgreementProfiles(userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const rows = await db.select().from(consultantAgreementProfiles);
  return userId ? rows.filter((row) => row.userId === userId) : rows;
}

export async function createConsultantAgreementProfile(input: ConsultantAgreementProfileInput, managerUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const consultantRate = Number(input.consultantSharePercent);
  const officeRate = Number(input.officeSharePercent);
  const deskFee = Number(input.monthlyDeskFee);
  if (!Number.isFinite(consultantRate) || !Number.isFinite(officeRate) || consultantRate < 0 || officeRate < 0 || Math.round((consultantRate + officeRate) * 100) !== 10000) throw new Error("Danışman ve ofis oranları toplamı %100 olmalıdır.");
  if (!Number.isFinite(deskFee) || deskFee < 0) throw new Error("Masa/ofis bedeli sıfır veya daha büyük olmalıdır.");
  if (!(input.validFrom instanceof Date) || Number.isNaN(input.validFrom.getTime())) throw new Error("Geçerli başlangıç tarihi zorunludur.");
  if (input.validTo && input.validTo < input.validFrom) throw new Error("Bitiş tarihi başlangıç tarihinden önce olamaz.");
  const result = await db.insert(consultantAgreementProfiles).values({ userId: input.userId, consultantSharePercent: consultantRate.toFixed(2), officeSharePercent: officeRate.toFixed(2), monthlyDeskFee: deskFee.toFixed(2), validFrom: input.validFrom, validTo: input.validTo ?? null, status: "active", approvedByUserId: managerUserId, approvedAt: new Date(), note: input.note?.trim() || null });
  const id = Number(result[0].insertId);
  await db.insert(auditLogs).values({ actorUserId: managerUserId, action: "consultant-agreement-created", entityType: "consultantAgreementProfile", entityId: id, summary: `Danışman anlaşma profili oluşturuldu: kullanıcı ${input.userId} · danışman %${consultantRate.toFixed(2)} · ofis %${officeRate.toFixed(2)} · masa/ofis bedeli ${deskFee.toFixed(2)}` });
  return { id, userId: input.userId, consultantSharePercent: consultantRate.toFixed(2), officeSharePercent: officeRate.toFixed(2), monthlyDeskFee: deskFee.toFixed(2), status: "active" as const };
}

export async function getActiveConsultantAgreementProfile(userId: number, at = new Date()) {
  const profiles = await listConsultantAgreementProfiles(userId);
  return profiles.filter((profile) => profile.status === "active" && profile.validFrom <= at && (!profile.validTo || profile.validTo >= at)).sort((a, b) => b.validFrom.getTime() - a.validFrom.getTime())[0] ?? null;
}
