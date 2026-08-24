import { describe, expect, it } from "vitest";
import { canUploadOwnActiveContractDocument, createActiveContractDocumentMetadata, getActiveSignedRentalEligibility, parseActiveContractDocumentMetadata } from "./activeContractDocuments";

const rental = (overrides: Record<string, unknown> = {}) => ({ id: "contract-1", entity: "contract" as const, title: "Kira", details: JSON.stringify({ schema: "global1881-offline-rental-v6", contractNo: "KIR-2026-001", ownerName: "Sevda Taşlıarmut", tenantName: "Ali Kağan Doğdu", signedByParties: true, startDate: "2026-04-03", durationMonths: "12", summary: { endDate: "2027-04-03" }, ...overrides }), status: "signed", deviceId: "device", userId: "i_parin", updatedAt: "2026-04-03T10:00:00.000Z", recordVersion: 1 });

describe("active contract documents", () => {
  it("allows only the owning consultant to attach a PDF to a signed and active rental contract", () => {
    expect(getActiveSignedRentalEligibility(rental(), "2026-08-24").eligible).toBe(true);
    expect(canUploadOwnActiveContractDocument(rental(), "i_parin", "2026-08-24")).toBe(true);
    expect(canUploadOwnActiveContractDocument(rental(), "k_tasliarmut", "2026-08-24")).toBe(false);
    expect(getActiveSignedRentalEligibility(rental({ signedByParties: false }), "2026-08-24").eligible).toBe(false);
    expect(getActiveSignedRentalEligibility(rental({ summary: { endDate: "2026-04-03" } }), "2026-08-24").eligible).toBe(false);
  });

  it("creates immutable metadata with checksum and has no delete/edit state", () => {
    const metadata = createActiveContractDocumentMetadata({ contractRecordId: "contract-1", contractNo: "KIR-2026-001", customerNames: ["Sevda Taşlıarmut", "Ali Kağan Doğdu"], signatureDate: "03.04.2026", originalFileName: "imzali-kira.pdf", sha256: "a".repeat(64), byteSize: 12345, storageKey: "document-1", uploadedByUserId: "i_parin" });
    expect(metadata).toMatchObject({ immutable: true, readonly: true, signatureDate: "2026-04-03", signatureDateDisplay: "03.04.2026" });
    expect(parseActiveContractDocumentMetadata({ entity: "activeContractDocument", details: JSON.stringify(metadata) })).toEqual(metadata);
  });
});
