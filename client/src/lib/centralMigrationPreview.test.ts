import { describe, expect, it } from "vitest";
import { buildCentralMigrationPreview } from "./centralMigrationPreview";
import type { OfflineRecord } from "./offlineStore";

const record = (partial: Partial<OfflineRecord>): OfflineRecord => ({
  id: crypto.randomUUID(),
  entity: "contract",
  title: "Örnek kayıt",
  details: JSON.stringify({ schema: "sample" }),
  status: "active",
  deviceId: "manager-device",
  userId: "i_parin",
  recordVersion: 2,
  updatedAt: "2026-08-24T12:00:00.000Z",
  ...partial,
});

describe("controlled offline to central migration preview", () => {
  it("only previews mapped records and keeps PDF transfer behind a separate manager approval", () => {
    const preview = buildCentralMigrationPreview(
      [
        record({ id: "contract-1", entity: "contract", title: "Aktif kira" }),
        record({ id: "archive-1", entity: "contractArchive", title: "Geçmiş PDF", details: JSON.stringify({ storageKey: "local-only.pdf", sha256: "a".repeat(64) }) }),
        record({ id: "request-1", entity: "request", title: "Müşteri talebi" }),
      ],
      { i_parin: 17 },
    );

    expect(preview.isPreviewOnly).toBe(true);
    expect(preview.managerApplyRequired).toBe(true);
    expect(preview.counts.contract).toBe(1);
    expect(preview.counts.documentMetadata).toBe(1);
    expect(preview.candidates.find((item) => item.sourceRecordId === "contract-1")).toMatchObject({ centralUserId: 17, applyState: "readyForManagerApply" });
    expect(preview.candidates.find((item) => item.sourceRecordId === "archive-1")).toMatchObject({ requiresPdfApproval: true, applyState: "pdfApprovalRequired" });
    expect(preview.candidates.find((item) => item.sourceRecordId === "request-1")).toMatchObject({ applyState: "needsManualReview" });
    expect(preview.warnings.join(" ")).toContain("PDF baytları");
  });

  it("does not mark records with an unmapped offline advisor as ready", () => {
    const preview = buildCentralMigrationPreview([record({ userId: "bilinmeyen" })], {});
    expect(preview.candidates[0]).toMatchObject({ applyState: "needsUserMapping" });
    expect(preview.warnings.join(" ")).toContain("kullanıcı eşlemesi");
  });
});
