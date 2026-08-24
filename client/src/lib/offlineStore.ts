export type OfflineRecord = {
  id: string;
  entity: "client" | "property" | "contract" | "obligation" | "evacuation" | "ownerApproval" | "ledger" | "target" | "request" | "transaction";
  title: string;
  details: string;
  amount?: string;
  dueDate?: string;
  noticeDate?: string;
  noticeDays?: number;
  approvalDecision?: "pending" | "approved" | "rejected";
  approvalNote?: string;
  obligationType?: "rent" | "tax" | "insurance" | "other";
  ledgerType?: "income" | "expense" | "receivable" | "payable" | "collection" | "payment";
  status: string;
  deviceId: string;
  updatedAt: string;
  userId: string;
  recordVersion: number;
  lastSyncAt?: string;
};

const DB_NAME = "global1881-offline";
const STORE_NAME = "records";
const DEVICE_KEY = "global1881-device-id";
const USER_KEY = "global1881-user-id";
const KEYPAIR_KEY = "global1881-signing-keypair";
const APP_VERSION = "offline-transition-v1";
const ENCRYPTED_BACKUP_FORMAT = "global1881-offline-encrypted-v1";
const ENCRYPTION_ITERATIONS = 210_000;
const MIN_BACKUP_PASSWORD_LENGTH = 8;
const AUDIT_KEY = "global1881-offline-audit";

export type OfflineAuditEvent = { id: string; action: "backup-exported" | "backup-verified" | "records-applied" | "manager-access-configured" | "manager-access-unlocked" | "manager-access-locked" | "contract-access-role-assigned"; userId: string; deviceId: string; at: string; metadata?: Record<string, string | number | boolean> };

export function validateBackupPassword(password: string) {
  if (password.trim().length < MIN_BACKUP_PASSWORD_LENGTH) {
    throw new Error(`Yedek parolası en az ${MIN_BACKUP_PASSWORD_LENGTH} karakter olmalıdır.`);
  }
  return password;
}

export function getUserId() { return window.localStorage.getItem(USER_KEY) ?? ""; }
export function setUserId(userId: string) { window.localStorage.setItem(USER_KEY, userId.trim()); }
export function requireUserId() { const userId = getUserId(); if (!userId) throw new Error("Önce manager offline kullanıcı kimliğini ayarlayın"); return userId; }

export function recordOfflineAudit(action: OfflineAuditEvent["action"], metadata?: OfflineAuditEvent["metadata"]) {
  const event: OfflineAuditEvent = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, action, userId: getUserId(), deviceId: getDeviceId(), at: new Date().toISOString(), metadata };
  const existing = JSON.parse(window.localStorage.getItem(AUDIT_KEY) ?? "[]") as OfflineAuditEvent[];
  window.localStorage.setItem(AUDIT_KEY, JSON.stringify([...existing.slice(-99), event]));
  return event;
}

export function listOfflineAuditEvents(): OfflineAuditEvent[] {
  return JSON.parse(window.localStorage.getItem(AUDIT_KEY) ?? "[]") as OfflineAuditEvent[];
}

function toBase64(bytes: ArrayBuffer | Uint8Array) { const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes); return btoa(Array.from(view).map((byte) => String.fromCharCode(byte)).join("")); }
function fromBase64(value: string) { return Uint8Array.from(atob(value), (char) => char.charCodeAt(0)); }

async function deriveEncryptionKey(password: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(validateBackupPassword(password)), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt.buffer as ArrayBuffer, iterations: ENCRYPTION_ITERATIONS, hash: "SHA-256" }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export async function encryptBackupPayload(value: string, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveEncryptionKey(password, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(value));
  return { salt: toBase64(salt), iv: toBase64(iv), ciphertext: toBase64(ciphertext) };
}

export async function decryptBackupPayload(payload: { salt: string; iv: string; ciphertext: string }, password: string) {
  const key = await deriveEncryptionKey(password, fromBase64(payload.salt));
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(payload.iv) }, key, fromBase64(payload.ciphertext));
  return new TextDecoder().decode(plaintext);
}

async function getSigningKeys() {
  const saved = window.localStorage.getItem(KEYPAIR_KEY);
  if (saved) return JSON.parse(saved) as { privateKey: JsonWebKey; publicKey: JsonWebKey };
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const keys = { privateKey: await crypto.subtle.exportKey("jwk", pair.privateKey), publicKey: await crypto.subtle.exportKey("jwk", pair.publicKey) };
  window.localStorage.setItem(KEYPAIR_KEY, JSON.stringify(keys));
  return keys;
}

async function sign(value: string) {
  const keys = await getSigningKeys();
  const privateKey = await crypto.subtle.importKey("jwk", keys.privateKey, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, new TextEncoder().encode(value));
  return { signature: toBase64(signature), publicKey: keys.publicKey };
}

async function verify(value: string, signature: string, publicKey: JsonWebKey) {
  const key = await crypto.subtle.importKey("jwk", publicKey, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  return crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, fromBase64(signature), new TextEncoder().encode(value));
}

export function getDeviceId() {
  const existing = window.localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const randomId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const created = `device-${randomId}`;
  window.localStorage.setItem(DEVICE_KEY, created);
  return created;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function listOfflineRecords(): Promise<OfflineRecord[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve((request.result as OfflineRecord[]).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineRecord(input: Omit<OfflineRecord, "id" | "deviceId" | "updatedAt" | "userId" | "recordVersion">) {
  const db = await openDb();
  const randomId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const record: OfflineRecord = { ...input, id: `${getDeviceId()}-${randomId}`, deviceId: getDeviceId(), userId: getUserId(), recordVersion: 1, lastSyncAt: undefined, updatedAt: new Date().toISOString() };
  return new Promise<OfflineRecord>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(record);
    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error);
  });
}

/** Aynı offline kaydı sürüm numarasını artırarak günceller; kaynak kullanıcı kimliği korunur. */
export async function updateOfflineRecord(record: OfflineRecord, patch: Partial<Omit<OfflineRecord, "id" | "deviceId" | "userId" | "recordVersion" | "updatedAt">>) {
  const db = await openDb();
  const next: OfflineRecord = { ...record, ...patch, id: record.id, deviceId: record.deviceId, userId: record.userId, recordVersion: (record.recordVersion ?? 0) + 1, updatedAt: new Date().toISOString() };
  return new Promise<OfflineRecord>((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(next);
    request.onsuccess = () => resolve(next);
    request.onerror = () => reject(request.error);
  });
}

async function checksum(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function exportOfflineBackup(password: string) {
  const userId = getUserId();
  if (!userId) throw new Error("Önce offline kullanıcı kimliğini ayarlayın");
  validateBackupPassword(password);
  const records = await listOfflineRecords();
  const data = { format: ENCRYPTED_BACKUP_FORMAT, appVersion: APP_VERSION, deviceId: getDeviceId(), userId: getUserId(), exportedAt: new Date().toISOString(), recordCount: records.length, records };
  const canonical = JSON.stringify(data);
  const integrityChecksum = await checksum(canonical);
  const signed = await sign(canonical);
  const encrypted = await encryptBackupPayload(canonical, password);
  const payload = { format: ENCRYPTED_BACKUP_FORMAT, appVersion: APP_VERSION, encryption: { algorithm: "AES-GCM", kdf: "PBKDF2-SHA-256", iterations: ENCRYPTION_ITERATIONS, salt: encrypted.salt, iv: encrypted.iv, ciphertext: encrypted.ciphertext }, checksum: integrityChecksum, signature: signed.signature, publicKey: signed.publicKey };
  recordOfflineAudit("backup-exported", { recordCount: records.length, encrypted: true });
  return new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
}

export type BackupMergeResult = { imported: number; conflicts: Array<{ id: string; local: OfflineRecord; incoming: OfflineRecord }>; invalid: string[]; manifests: Array<{ file: string; deviceId?: string; userId?: string; recordCount?: number; exportedAt?: string; maxRecordVersion?: number; latestSyncAt?: string; checksumVerified?: boolean; signatureVerified?: boolean; verified: boolean }>; pendingRecords: OfflineRecord[] };

type EncryptedBackupEnvelope = { format: string; appVersion?: string; encryption?: { algorithm: string; kdf: string; iterations: number; salt: string; iv: string; ciphertext: string }; checksum?: string; signature?: string; publicKey?: JsonWebKey };
type BackupData = { format: string; appVersion?: string; deviceId?: string; userId?: string; exportedAt?: string; recordCount?: number; records: OfflineRecord[] };

async function readVerifiedBackup(file: File, password: string) {
  validateBackupPassword(password);
  const envelope = JSON.parse(await file.text()) as EncryptedBackupEnvelope;
  if (envelope.format !== ENCRYPTED_BACKUP_FORMAT || !envelope.encryption || !envelope.checksum || !envelope.signature || !envelope.publicKey) throw new Error("Bu dosya şifreli Global 1881 yedeği değil veya manifesti eksik");
  if (envelope.encryption.algorithm !== "AES-GCM" || envelope.encryption.kdf !== "PBKDF2-SHA-256" || envelope.encryption.iterations !== ENCRYPTION_ITERATIONS) throw new Error("Desteklenmeyen yedek şifreleme parametresi");
  const canonical = await decryptBackupPayload(envelope.encryption, password);
  const data = JSON.parse(canonical) as BackupData;
  if (data.format !== ENCRYPTED_BACKUP_FORMAT || !Array.isArray(data.records)) throw new Error("Şifreli yedek içeriği geçersiz");
  const checksumVerified = await checksum(canonical) === envelope.checksum;
  const signatureVerified = await verify(canonical, envelope.signature, envelope.publicKey);
  if (!checksumVerified || !signatureVerified) throw new Error("Yedek checksum/imza doğrulaması başarısız");
  recordOfflineAudit("backup-verified", { recordCount: data.records.length, checksumVerified, signatureVerified });
  return { envelope, data, checksumVerified, signatureVerified };
}

export async function mergeOfflineBackups(files: File[], password: string): Promise<BackupMergeResult> {
  const localRecords = new Map((await listOfflineRecords()).map((record) => [record.id, record]));
  const conflicts: BackupMergeResult["conflicts"] = [];
  const invalid: string[] = [];
  const manifests: BackupMergeResult["manifests"] = [];
  let imported = 0;
  const pendingRecords: OfflineRecord[] = [];
  for (const file of files) {
    try {
      const { data, checksumVerified, signatureVerified } = await readVerifiedBackup(file, password);
      manifests.push({ file: file.name, deviceId: data.deviceId, userId: data.userId, recordCount: data.recordCount, exportedAt: data.exportedAt, maxRecordVersion: Math.max(0, ...data.records.map((record) => record.recordVersion ?? 0)), latestSyncAt: data.records.map((record) => record.lastSyncAt).filter(Boolean).sort().at(-1), checksumVerified, signatureVerified, verified: true });
      for (const incoming of data.records) {
        const local = localRecords.get(incoming.id);
        if (local && JSON.stringify(local) !== JSON.stringify(incoming)) conflicts.push({ id: incoming.id, local, incoming });
        else if (!local) { localRecords.set(incoming.id, incoming); pendingRecords.push(incoming); imported += 1; }
      }
    } catch { invalid.push(file.name); }
  }
  return { imported, conflicts, invalid, manifests, pendingRecords };
}

const ROLLBACK_KEY = "global1881-last-merge-rollback";

export async function createRollbackSnapshot() {
  const records = await listOfflineRecords();
  window.localStorage.setItem(ROLLBACK_KEY, JSON.stringify({ createdAt: new Date().toISOString(), records }));
}

export async function restoreRollbackSnapshot() {
  const raw = window.localStorage.getItem(ROLLBACK_KEY);
  if (!raw) throw new Error("Geri alma noktası bulunamadı");
  const snapshot = JSON.parse(raw) as { records: OfflineRecord[] };
  const db = await openDb(); const tx = db.transaction(STORE_NAME, "readwrite"); const store = tx.objectStore(STORE_NAME); store.clear(); snapshot.records.forEach((record) => store.put(record));
  await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
}

export async function applyOfflineRecords(records: OfflineRecord[]) {
  if (!records.length) return;
  const existing = new Map((await listOfflineRecords()).map((record) => [record.id, record]));
  const db = await openDb(); const tx = db.transaction(STORE_NAME, "readwrite"); const syncedAt = new Date().toISOString();
  records.forEach((record) => { const current = existing.get(record.id); tx.objectStore(STORE_NAME).put({ ...record, recordVersion: current ? current.recordVersion + 1 : record.recordVersion, lastSyncAt: syncedAt }); });
  await new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
  recordOfflineAudit("records-applied", { recordCount: records.length });
}

export async function downloadCurrentBackup(filename: string, password: string) {
  const blob = await exportOfflineBackup(password);
  const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}

export async function importOfflineBackup(file: File, password: string) {
  const { data } = await readVerifiedBackup(file, password);
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const syncedAt = new Date().toISOString();
  for (const record of data.records) tx.objectStore(STORE_NAME).put({ ...record, lastSyncAt: syncedAt });
  return new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
}
