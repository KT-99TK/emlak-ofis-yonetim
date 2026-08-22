export type OfflineRecord = {
  id: string;
  entity: "client" | "property" | "contract" | "obligation" | "evacuation" | "ownerApproval" | "ledger";
  title: string;
  details: string;
  amount?: string;
  dueDate?: string;
  noticeDate?: string;
  noticeDays?: number;
  approvalDecision?: "pending" | "approved" | "rejected";
  approvalNote?: string;
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

export function getUserId() { return window.localStorage.getItem(USER_KEY) ?? ""; }
export function setUserId(userId: string) { window.localStorage.setItem(USER_KEY, userId.trim()); }
export function requireUserId() { const userId = getUserId(); if (!userId) throw new Error("Önce manager offline kullanıcı kimliğini ayarlayın"); return userId; }

function toBase64(bytes: ArrayBuffer) { return btoa(Array.from(new Uint8Array(bytes)).map((byte) => String.fromCharCode(byte)).join("")); }
function fromBase64(value: string) { return Uint8Array.from(atob(value), (char) => char.charCodeAt(0)); }

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

async function checksum(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function exportOfflineBackup() {
  const userId = getUserId();
  if (!userId) throw new Error("Önce offline kullanıcı kimliğini ayarlayın");
  const records = await listOfflineRecords();
  const data = { format: "global1881-offline-v1", appVersion: APP_VERSION, deviceId: getDeviceId(), userId: getUserId(), exportedAt: new Date().toISOString(), recordCount: records.length, records };
  const canonical = JSON.stringify(data);
  const integrityChecksum = await checksum(canonical);
  const signed = await sign(canonical);
  const payload = { ...data, checksum: integrityChecksum, signature: signed.signature, publicKey: signed.publicKey };
  return new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
}

export type BackupMergeResult = { imported: number; conflicts: Array<{ id: string; local: OfflineRecord; incoming: OfflineRecord }>; invalid: string[]; manifests: Array<{ file: string; deviceId?: string; userId?: string; recordCount?: number; exportedAt?: string; maxRecordVersion?: number; latestSyncAt?: string; checksumVerified?: boolean; signatureVerified?: boolean; verified: boolean }>; pendingRecords: OfflineRecord[] };

export async function mergeOfflineBackups(files: File[]): Promise<BackupMergeResult> {
  const localRecords = new Map((await listOfflineRecords()).map((record) => [record.id, record]));
  const conflicts: BackupMergeResult["conflicts"] = [];
  const invalid: string[] = [];
  const manifests: BackupMergeResult["manifests"] = [];
  let imported = 0;
  const pendingRecords: OfflineRecord[] = [];
  for (const file of files) {
    try {
      const payload = JSON.parse(await file.text()) as { format: string; records: OfflineRecord[]; checksum?: string; signature?: string; publicKey?: JsonWebKey; deviceId?: string; userId?: string; recordCount?: number; exportedAt?: string };
      if (payload.format !== "global1881-offline-v1" || !Array.isArray(payload.records) || !payload.checksum || !payload.signature || !payload.publicKey) throw new Error("manifest");
      const { checksum: receivedChecksum, signature: receivedSignature, publicKey, ...data } = payload;
      const canonical = JSON.stringify(data);
      const checksumVerified = await checksum(canonical) === receivedChecksum; const signatureVerified = await verify(canonical, receivedSignature, publicKey); if (!checksumVerified || !signatureVerified) throw new Error("signature");
      manifests.push({ file: file.name, deviceId: payload.deviceId, userId: payload.userId, recordCount: payload.recordCount, exportedAt: payload.exportedAt, maxRecordVersion: Math.max(0, ...payload.records.map((record) => record.recordVersion ?? 0)), latestSyncAt: payload.records.map((record) => record.lastSyncAt).filter(Boolean).sort().at(-1), checksumVerified, signatureVerified, verified: true });
      for (const incoming of payload.records) {
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
}

export async function downloadCurrentBackup(filename: string) {
  const blob = await exportOfflineBackup();
  const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click(); URL.revokeObjectURL(url);
}

export async function importOfflineBackup(file: File) {
  const payload = JSON.parse(await file.text()) as { format: string; deviceId?: string; exportedAt?: string; records: OfflineRecord[]; checksum?: string; signature?: string; publicKey?: JsonWebKey; appVersion?: string; userId?: string; recordCount?: number };
  if (payload.format !== "global1881-offline-v1" || !Array.isArray(payload.records) || !payload.checksum || !payload.signature || !payload.publicKey) throw new Error("Geçersiz Global 1881 yedek manifesti");
  const { checksum: receivedChecksum, signature: receivedSignature, publicKey, ...data } = payload;
  const canonical = JSON.stringify(data);
  if (await checksum(canonical) !== receivedChecksum || !(await verify(canonical, receivedSignature, publicKey))) throw new Error("Yedek checksum/imza doğrulaması başarısız");
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const syncedAt = new Date().toISOString();
  for (const record of payload.records) tx.objectStore(STORE_NAME).put({ ...record, lastSyncAt: syncedAt });
  return new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); });
}
