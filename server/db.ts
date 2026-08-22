import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, auditLogs, clients, contracts, ledgerEntries, properties, teams, userProfiles, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

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

export async function getDashboardSummary(userId: number, isManager: boolean) {
  const db = await getDb(); if (!db) return { contracts: 0, portfolio: 0, outstanding: "0", activeTeam: 0, recentContracts: [], recentLedger: [] };
  const scope = isManager ? undefined : eq(contracts.assignedUserId, userId);
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
    db.select({ count: sql<number>`count(*)` }).from(properties).where(isManager ? undefined : eq(properties.assignedUserId, userId)),
    db.select({ total: sql<string>`coalesce(sum(${ledgerEntries.amount} - ${ledgerEntries.paidAmount}), 0)` }).from(ledgerEntries).where(and(eq(ledgerEntries.status, "pending"), isManager ? undefined : eq(ledgerEntries.assignedUserId, userId))),
    isManager ? db.select({ count: sql<number>`count(*)` }).from(userProfiles).where(eq(userProfiles.status, "active")) : Promise.resolve([{ count: 1 }]),
    db.select().from(contracts).where(scope).orderBy(desc(contracts.updatedAt)).limit(5),
    db.select().from(ledgerEntries).where(isManager ? undefined : eq(ledgerEntries.assignedUserId, userId)).orderBy(desc(ledgerEntries.createdAt)).limit(5),
  ]);
  return { contracts: Number(contractCount[0]?.count ?? 0), portfolio: Number(portfolioCount[0]?.count ?? 0), outstanding: String(outstanding[0]?.total ?? "0"), activeTeam: Number(teamCount[0]?.count ?? 0), recentContracts, recentLedger, teamBreakdown };
}

export async function createContract(input: { contractNo: string; type: "rental" | "sale" | "authority"; subtype?: string; title: string; amount?: string; clientId?: number; propertyId?: number; assignedUserId: number; actorUserId: number }) { const db = await getDb(); if (!db) return null; const result = await db.insert(contracts).values({ contractNo: input.contractNo, type: input.type, subtype: input.subtype, title: input.title, amount: input.amount, clientId: input.clientId, propertyId: input.propertyId, assignedUserId: input.assignedUserId, status: "draft" }); const id = Number(result[0].insertId); await db.insert(auditLogs).values({ actorUserId: input.actorUserId, action: "create", entityType: "contract", entityId: id, summary: `${input.contractNo} taslak olarak oluşturuldu` }); return id; }
export async function transitionContract(id: number, status: "draft" | "review" | "approved" | "signed" | "active" | "completed" | "cancelled", actorUserId: number) { const db = await getDb(); if (!db) return false; await db.update(contracts).set({ status, version: sql`${contracts.version} + 1` }).where(eq(contracts.id, id)); await db.insert(auditLogs).values({ actorUserId, action: "status_change", entityType: "contract", entityId: id, summary: `Sözleşme durumu ${status} olarak güncellendi` }); return true; }
export async function listContracts(userId: number, isManager: boolean) { const db = await getDb(); if (!db) return []; return db.select().from(contracts).where(isManager ? undefined : eq(contracts.assignedUserId, userId)).orderBy(desc(contracts.updatedAt)); }
export async function listClients(userId: number, isManager: boolean) { const db = await getDb(); if (!db) return []; return db.select().from(clients).where(isManager ? undefined : eq(clients.assignedUserId, userId)).orderBy(desc(clients.updatedAt)); }
export async function listProperties(userId: number, isManager: boolean) { const db = await getDb(); if (!db) return []; return db.select().from(properties).where(isManager ? undefined : eq(properties.assignedUserId, userId)).orderBy(desc(properties.createdAt)); }
export async function listLedger(userId: number, isManager: boolean) { const db = await getDb(); if (!db) return []; return db.select().from(ledgerEntries).where(isManager ? undefined : eq(ledgerEntries.assignedUserId, userId)).orderBy(desc(ledgerEntries.createdAt)); }
export async function listAudit(isManager: boolean) { const db = await getDb(); if (!db || !isManager) return []; return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100); }
export async function createClient(input: { name: string; assignedUserId: number }) { const db = await getDb(); if (!db) return null; const result = await db.insert(clients).values({ name: input.name, assignedUserId: input.assignedUserId }); return Number(result[0].insertId); }
export async function createProperty(input: { referenceNo: string; title: string; address: string; assignedUserId: number }) { const db = await getDb(); if (!db) return null; const result = await db.insert(properties).values({ referenceNo: input.referenceNo, title: input.title, address: input.address, assignedUserId: input.assignedUserId }); return Number(result[0].insertId); }
export async function createLedger(input: { description: string; amount: string; entryType: "income" | "expense" | "receivable" | "payable"; assignedUserId: number }) { const db = await getDb(); if (!db) return null; const result = await db.insert(ledgerEntries).values({ description: input.description, amount: input.amount, entryType: input.entryType, assignedUserId: input.assignedUserId }); return Number(result[0].insertId); }
export async function listTeamMembers() { const db = await getDb(); if (!db) return []; return db.select({ userId: userProfiles.userId, name: users.name, email: users.email, teamId: userProfiles.teamId, teamName: teams.name, officeRole: userProfiles.officeRole, consultantCode: userProfiles.consultantCode, status: userProfiles.status }).from(userProfiles).leftJoin(users, eq(userProfiles.userId, users.id)).leftJoin(teams, eq(userProfiles.teamId, teams.id)).orderBy(desc(userProfiles.status)); }
