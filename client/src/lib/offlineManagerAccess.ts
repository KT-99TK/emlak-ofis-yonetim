import { recordOfflineAudit } from "./offlineStore";

const ACCESS_KEY = "global1881.offline.manager-access.v1";
const SESSION_KEY = "global1881.offline.manager-session.v1";
const PBKDF2_ITERATIONS = 210_000;
const SESSION_MINUTES = 20;

type StoredManagerAccess = { version: 1; salt: string; verifier: string; createdAt: string; createdBy: string };
type ManagerSession = { expiresAt: number };

const toBase64 = (value: Uint8Array) => btoa(Array.from(value).map((byte) => String.fromCharCode(byte)).join(""));
const fromBase64 = (value: string) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
const storage = () => window.localStorage;

function validatePasscode(passcode: string) {
  if (passcode.trim().length < 10) throw new Error("Yerel yönetici parolası en az 10 karakter olmalıdır.");
}

async function deriveVerifier(passcode: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passcode), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" }, material, 256);
  return toBase64(new Uint8Array(bits));
}

function equalConstantTime(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

export function hasLocalManagerPasscode() { return Boolean(storage().getItem(ACCESS_KEY)); }

export async function configureLocalManagerPasscode(passcode: string, configuredBy: string) {
  validatePasscode(passcode);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const value: StoredManagerAccess = { version: 1, salt: toBase64(salt), verifier: await deriveVerifier(passcode, salt), createdAt: new Date().toISOString(), createdBy: configuredBy.trim() || "broker-manager" };
  storage().setItem(ACCESS_KEY, JSON.stringify(value));
  recordOfflineAudit("manager-access-configured", { iterations: PBKDF2_ITERATIONS, localOnly: true });
  startLocalManagerSession();
}

export async function unlockLocalManagerAccess(passcode: string) {
  const raw = storage().getItem(ACCESS_KEY);
  if (!raw) throw new Error("Bu cihazda yerel broker manager parolası henüz kurulmadı.");
  const stored = JSON.parse(raw) as StoredManagerAccess;
  if (stored.version !== 1 || !stored.salt || !stored.verifier) throw new Error("Yerel yönetici doğrulama kaydı geçersiz.");
  const verified = equalConstantTime(await deriveVerifier(passcode, fromBase64(stored.salt)), stored.verifier);
  if (!verified) throw new Error("Yerel yönetici parolası doğrulanamadı.");
  startLocalManagerSession();
  recordOfflineAudit("manager-access-unlocked", { localOnly: true, durationMinutes: SESSION_MINUTES });
  return true;
}

export function startLocalManagerSession() { storage().setItem(SESSION_KEY, JSON.stringify({ expiresAt: Date.now() + SESSION_MINUTES * 60_000 } satisfies ManagerSession)); }

export function isLocalManagerSessionActive() {
  try { const session = JSON.parse(storage().getItem(SESSION_KEY) ?? "null") as ManagerSession | null; return Boolean(session && Number.isFinite(session.expiresAt) && session.expiresAt > Date.now()); }
  catch { return false; }
}

export function lockLocalManagerAccess() {
  storage().removeItem(SESSION_KEY);
  recordOfflineAudit("manager-access-locked", { localOnly: true });
}

export const LOCAL_MANAGER_SESSION_MINUTES = SESSION_MINUTES;
