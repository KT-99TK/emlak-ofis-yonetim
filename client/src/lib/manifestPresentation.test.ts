import { describe, expect, it } from "vitest";
import { buildManifestPreview } from "./manifestPresentation";

describe("buildManifestPreview", () => {
  it("keeps identity, version, date, and separate verification labels", () => {
    const preview = buildManifestPreview({
      file: "manager-yedek.json",
      userId: "manager-mehmet",
      deviceId: "device-manager",
      recordCount: 12,
      exportedAt: "2026-08-22T12:00:00.000Z",
      maxRecordVersion: 4,
      checksumVerified: true,
      signatureVerified: true,
    });

    expect(preview).toMatchObject({
      file: "manager-yedek.json",
      userId: "manager-mehmet",
      deviceId: "device-manager",
      recordCount: 12,
      maxRecordVersion: 4,
      checksumLabel: "doğrulandı",
      signatureLabel: "doğrulandı",
      verified: true,
    });
    expect(preview.exportedAt).toBe("2026-08-22T12:00:00.000Z");
  });

  it("makes missing identity and failed verification visible", () => {
    const preview = buildManifestPreview({ file: "invalid.json", checksumVerified: false, signatureVerified: true });
    expect(preview.userId).toBe("bilinmiyor");
    expect(preview.deviceId).toBe("cihaz bilinmiyor");
    expect(preview.checksumLabel).toBe("başarısız");
    expect(preview.signatureLabel).toBe("doğrulandı");
    expect(preview.verified).toBe(false);
  });
});
