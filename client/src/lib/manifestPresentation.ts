export type ManifestPreviewInput = {
  file: string;
  userId?: string;
  deviceId?: string;
  recordCount?: number;
  exportedAt?: string;
  maxRecordVersion?: number;
  checksumVerified?: boolean;
  signatureVerified?: boolean;
};

export function buildManifestPreview(manifest: ManifestPreviewInput) {
  return {
    file: manifest.file,
    userId: manifest.userId ?? "bilinmiyor",
    deviceId: manifest.deviceId ?? "cihaz bilinmiyor",
    recordCount: manifest.recordCount ?? 0,
    exportedAt: manifest.exportedAt ?? "tarih yok",
    maxRecordVersion: manifest.maxRecordVersion ?? 0,
    checksumLabel: manifest.checksumVerified ? "doğrulandı" : "başarısız",
    signatureLabel: manifest.signatureVerified ? "doğrulandı" : "başarısız",
    verified: manifest.checksumVerified === true && manifest.signatureVerified === true,
  };
}
