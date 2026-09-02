import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

export type SensitiveField = {
  fieldPath: string;
  value: string;
};

export type EncryptedSensitiveValue = {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: "jwt-derived-v1";
};

function vaultKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Hassas veri kasası için sunucu anahtarı hazır değil.");
  return createHash("sha256")
    .update(secret)
    .update("|global1881-sensitive-field-vault|v1")
    .digest();
}

export function encryptSensitiveValue(value: string): EncryptedSensitiveValue {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", vaultKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    keyVersion: "jwt-derived-v1",
  };
}

export function decryptSensitiveValue(value: EncryptedSensitiveValue) {
  if (value.keyVersion !== "jwt-derived-v1")
    throw new Error("Hassas veri kasası anahtar sürümü desteklenmiyor.");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    vaultKey(),
    Buffer.from(value.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(value.authTag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(value.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function maskPhone(value: string | null | undefined) {
  if ((value ?? "").includes("•")) return value ?? null;
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length <= 4) return "••••";
  const prefix = digits.length >= 10 ? digits.slice(0, 2) : digits.slice(0, 1);
  return `${prefix}•• ••• •• ${digits.slice(-2)}`;
}

export function maskIdentityOrTaxNo(value: string | null | undefined) {
  if ((value ?? "").includes("•")) return value ?? null;
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  return `••••••••${digits.slice(-Math.min(4, digits.length))}`;
}

export function containsSensitiveValue(value: string) {
  return /\b\d[\d\s().-]{7,}\d\b/.test(value);
}

export function assertSafeRevealReason(reason: string) {
  const normalized = reason.trim().replace(/\s+/g, " ");
  if (normalized.length < 8 || normalized.length > 280)
    throw new Error("Görüntüleme gerekçesi 8–280 karakter olmalıdır.");
  if (containsSensitiveValue(normalized) || /\S+@\S+\.\S+/.test(normalized))
    throw new Error("Gerekçeye telefon, kimlik, vergi no veya e-posta yazılamaz.");
  return normalized;
}

function sensitiveKind(key: string): "phone" | "identity" | null {
  const normalized = key.toLowerCase();
  if (/phone|telefon/.test(normalized)) return "phone";
  if (/identity|kimlik|tckn|vkn|taxno|tax_no|vergino|vergi_no/.test(normalized))
    return "identity";
  return null;
}

export function protectContractDetails(details: string | undefined) {
  if (!details) return { maskedDetails: details, sensitiveFields: [] as SensitiveField[] };
  try {
    const parsed = JSON.parse(details) as unknown;
    const sensitiveFields: SensitiveField[] = [];
    const visit = (value: unknown, path: string): unknown => {
      if (Array.isArray(value)) return value.map((item, index) => visit(item, `${path}[${index}]`));
      if (!value || typeof value !== "object") return value;
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([key, nested]) => {
          const fieldPath = path ? `${path}.${key}` : key;
          const kind = sensitiveKind(key);
          if (kind && typeof nested === "string" && nested.trim()) {
            sensitiveFields.push({ fieldPath, value: nested.trim() });
            return [key, kind === "phone" ? maskPhone(nested) : maskIdentityOrTaxNo(nested)];
          }
          return [key, visit(nested, fieldPath)];
        })
      );
    };
    return { maskedDetails: JSON.stringify(visit(parsed, "")), sensitiveFields };
  } catch {
    // JSON olmayan eski serbest metinler görüntülemeye kapatılır; ham metin geri dönmez.
    return {
      maskedDetails: containsSensitiveValue(details)
        ? "Hassas sözleşme alanları maskelendi."
        : details,
      sensitiveFields: [] as SensitiveField[],
    };
  }
}
