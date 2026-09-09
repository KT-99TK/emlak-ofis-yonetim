import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { parse as parseCookieHeader } from "cookie";
import { and, asc, eq, gt, isNull, or } from "drizzle-orm";
import { auditLogs, localLoginCredentials, localLoginSessions, userProfiles, users } from "../drizzle/schema";
import { getDb } from "./db";
import { normalizeConsultantLogin, nextConsultantCode } from "../shared/consultantIdentity";
import type { Request, Response } from "express";

const scrypt = promisify(scryptCallback);
export const LOCAL_SESSION_COOKIE = "global1881_local_session";
const SESSION_DAYS = 7;
const TEMPORARY_PASSWORD_HOURS = 24;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

async function verifyPassword(password: string, encoded: string) {
  const [, saltHex, hashHex] = encoded.split("$");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = (await scrypt(password, Buffer.from(saltHex, "hex"), expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function assertLocalPasswordPolicy(password: string) {
  if (password.length < 12 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    throw new Error("Parola en az 12 karakter, bir büyük harf, bir küçük harf ve bir rakam içermelidir.");
  }
}

export function isTemporaryPasswordReusable(mustChangePassword: number, temporaryPasswordUsedAt: Date | null) {
  return Boolean(mustChangePassword && temporaryPasswordUsedAt);
}

function generateTemporaryPassword() {
  return `G1881-${randomBytes(9).toString("base64url")}`;
}

async function writeLocalAudit(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, actorUserId: number, action: string, entityId: number | null, summary: string) {
  await db.insert(auditLogs).values({ actorUserId, action, entityType: "local_auth", entityId, summary });
}

function setLocalSessionCookie(res: Response, token: string) {
  res.cookie(LOCAL_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
}

export async function getLocalUserFromRequest(req: Request) {
  const token = parseCookieHeader(req.headers.cookie ?? "")[LOCAL_SESSION_COOKIE];
  if (!token) return null;
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({ user: users, session: localLoginSessions })
    .from(localLoginSessions)
    .innerJoin(users, eq(users.id, localLoginSessions.userId))
    .where(and(eq(localLoginSessions.tokenHash, hashToken(token)), isNull(localLoginSessions.revokedAt), gt(localLoginSessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.user ?? null;
}

export async function createLocalConsultantAccount(input: {
  firstName: string;
  lastName: string;
  title?: string;
  companyName?: string;
  managerUserId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const loginName = normalizeConsultantLogin(input.firstName, input.lastName);
  const profiles = await db.select({ consultantCode: userProfiles.consultantCode }).from(userProfiles).orderBy(asc(userProfiles.id));
  const consultantCode = nextConsultantCode(input.firstName, input.lastName, profiles.map(row => row.consultantCode ?? ""));
  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  const temporaryPasswordExpiresAt = new Date(Date.now() + TEMPORARY_PASSWORD_HOURS * 60 * 60 * 1000);
  const openId = `local:${loginName}`;
  const existing = await db.select({ id: users.id }).from(users).where(or(eq(users.openId, openId), eq(users.name, `${input.firstName} ${input.lastName}`))).limit(1);
  if (existing[0]) throw new Error("Bu danışman adına ait kullanıcı zaten bulunuyor.");
  const result = await db.insert(users).values({ openId, name: `${input.firstName.trim()} ${input.lastName.trim()}`, loginMethod: "local", role: "user" });
  const userId = Number(result[0].insertId);
  await db.insert(userProfiles).values({ userId, officeRole: "consultant", consultantCode, title: input.title?.trim() || "Danışman", companyName: input.companyName?.trim() || null, status: "active" });
  await db.insert(localLoginCredentials).values({ userId, loginName, passwordHash, temporaryPasswordExpiresAt, mustChangePassword: 1 });
  await db.insert(auditLogs).values({ actorUserId: input.managerUserId, action: "local_consultant_created", entityType: "user", entityId: userId, summary: `${loginName} / ${consultantCode} yerel danışman hesabı oluşturuldu.` });
  return { userId, loginName, consultantCode, temporaryPassword, temporaryPasswordExpiresAt, companyName: input.companyName?.trim() || null };
}

export async function loginLocalUser(input: { loginName: string; password: string; res: Response }) {
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  const rows = await db.select({ credentials: localLoginCredentials, user: users }).from(localLoginCredentials).innerJoin(users, eq(users.id, localLoginCredentials.userId)).where(eq(localLoginCredentials.loginName, input.loginName.trim().toUpperCase())).limit(1);
  const row = rows[0];
  if (!row) {
    await writeLocalAudit(db, 0, "local_login_failed", null, `Bilinmeyen login adı denendi: ${input.loginName.trim().toUpperCase()}`);
    throw new Error("Login adı veya parola hatalı.");
  }
  if (row.credentials.lockedUntil && row.credentials.lockedUntil > new Date()) {
    await writeLocalAudit(db, row.user.id, "local_login_locked", row.user.id, "Kilitli yerel hesaba giriş denemesi reddedildi.");
    throw new Error("Hesap geçici olarak kilitlendi; daha sonra tekrar deneyin.");
  }
  if (isTemporaryPasswordReusable(row.credentials.mustChangePassword, row.credentials.temporaryPasswordUsedAt)) {
    await writeLocalAudit(db, row.user.id, "local_login_temp_reused", row.user.id, "Tek kullanımlık geçici parola tekrar kullanıldı.");
    throw new Error("Geçici parola daha önce kullanıldı; broker managerdan yeni geçici parola isteyin.");
  }
  if (row.credentials.mustChangePassword && row.credentials.temporaryPasswordExpiresAt && row.credentials.temporaryPasswordExpiresAt <= new Date()) {
    await writeLocalAudit(db, row.user.id, "local_login_temp_expired", row.user.id, "Süresi dolan geçici parola reddedildi.");
    throw new Error("Geçici parolanın süresi doldu; broker managerdan yeni geçici parola isteyin.");
  }
  const valid = await verifyPassword(input.password, row.credentials.passwordHash);
  if (!valid) {
    const attempts = row.credentials.failedAttempts + 1;
    const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000) : null;
    await db.update(localLoginCredentials).set({ failedAttempts: attempts, lockedUntil }).where(eq(localLoginCredentials.userId, row.user.id));
    await writeLocalAudit(db, row.user.id, attempts >= MAX_FAILED_ATTEMPTS ? "local_login_locked" : "local_login_failed", row.user.id, `Yerel parola doğrulaması başarısız; deneme=${attempts}.`);
    throw new Error("Login adı veya parola hatalı.");
  }
  if (row.credentials.mustChangePassword) {
    const consumed = await db.update(localLoginCredentials).set({ temporaryPasswordUsedAt: new Date() }).where(and(eq(localLoginCredentials.userId, row.user.id), isNull(localLoginCredentials.temporaryPasswordUsedAt)));
    if (!(consumed as { affectedRows?: number }).affectedRows) {
      await writeLocalAudit(db, row.user.id, "local_login_temp_reused", row.user.id, "Tek kullanımlık geçici parola eşzamanlı tekrar kullanımda reddedildi.");
      throw new Error("Geçici parola daha önce kullanıldı; broker managerdan yeni geçici parola isteyin.");
    }
  }
  const token = randomBytes(32).toString("base64url");
  await db.insert(localLoginSessions).values({ tokenHash: hashToken(token), userId: row.user.id, expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000) });
  await db.update(localLoginCredentials).set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() }).where(eq(localLoginCredentials.userId, row.user.id));
  await writeLocalAudit(db, row.user.id, "local_login_success", row.user.id, `Yerel login başarılı; ilk_giriş=${Boolean(row.credentials.mustChangePassword)}.`);
  setLocalSessionCookie(input.res, token);
  return { userId: row.user.id, loginName: row.credentials.loginName, mustChangePassword: Boolean(row.credentials.mustChangePassword) };
}

export async function changeLocalPassword(input: { userId: number; newPassword: string; res: Response }) {
  assertLocalPasswordPolicy(input.newPassword);
  const db = await getDb();
  if (!db) throw new Error("Merkezi veri tabanına erişilemiyor.");
  await db.update(localLoginCredentials).set({ passwordHash: await hashPassword(input.newPassword), temporaryPasswordExpiresAt: null, mustChangePassword: 0, failedAttempts: 0, lockedUntil: null }).where(eq(localLoginCredentials.userId, input.userId));
  await writeLocalAudit(db, input.userId, "local_password_changed", input.userId, "Yerel kullanıcı ilk giriş parolasını değiştirdi.");
  const token = randomBytes(32).toString("base64url");
  await db.insert(localLoginSessions).values({ tokenHash: hashToken(token), userId: input.userId, expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000) });
  setLocalSessionCookie(input.res, token);
  return { success: true } as const;
}

export async function logoutLocalUser(req: Request, res: Response) {
  const token = parseCookieHeader(req.headers.cookie ?? "")[LOCAL_SESSION_COOKIE];
  const db = await getDb();
  if (db && token) {
    const session = await db.select({ userId: localLoginSessions.userId }).from(localLoginSessions).where(eq(localLoginSessions.tokenHash, hashToken(token))).limit(1);
    await db.update(localLoginSessions).set({ revokedAt: new Date() }).where(eq(localLoginSessions.tokenHash, hashToken(token)));
    if (session[0]) await writeLocalAudit(db, session[0].userId, "local_logout", session[0].userId, "Yerel oturum kapatıldı.");
  }
  res.clearCookie(LOCAL_SESSION_COOKIE, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: -1 });
  return { success: true } as const;
}
