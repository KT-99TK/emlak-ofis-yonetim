import type { OfflineRecord } from "./offlineStore";

export const CENTRAL_MIGRATION_PREVIEW_SCHEMA = "global1881-central-migration-preview-v1";

export type CentralMigrationTarget =
  | "client"
  | "property"
  | "contract"
  | "obligation"
  | "ledger"
  | "documentMetadata"
  | "manualReview";

export type CentralMigrationCandidate = {
  sourceRecordId: string;
  sourceEntity: OfflineRecord["entity"];
  target: CentralMigrationTarget;
  title: string;
  offlineUserId: string;
  centralUserId?: number;
  recordVersion: number;
  updatedAt: string;
  requiresPdfApproval: boolean;
  applyState: "readyForManagerApply" | "needsUserMapping" | "needsManualReview" | "pdfApprovalRequired";
  notes: string[];
};

export type CentralMigrationPreview = {
  schema: typeof CENTRAL_MIGRATION_PREVIEW_SCHEMA;
  sourceRecordCount: number;
  candidates: CentralMigrationCandidate[];
  warnings: string[];
  counts: Record<CentralMigrationTarget, number>;
  isPreviewOnly: true;
  managerApplyRequired: true;
};

export type CentralMigrationAdvisorMap = Record<string, number>;

const manualReviewEntities = new Set<OfflineRecord["entity"]>([
  "evacuation",
  "ownerApproval",
  "target",
  "request",
  "transaction",
]);

function targetFor(record: OfflineRecord): CentralMigrationTarget {
  if (record.entity === "client") return "client";
  if (record.entity === "property") return "property";
  if (record.entity === "contract") return "contract";
  if (record.entity === "obligation") return "obligation";
  if (record.entity === "ledger") return "ledger";
  if (record.entity === "contractArchive" || record.entity === "activeContractDocument") return "documentMetadata";
  return "manualReview";
}

function detailsLooksLikeJson(value: string) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function emptyCounts(): Record<CentralMigrationTarget, number> {
  return {
    client: 0,
    property: 0,
    contract: 0,
    obligation: 0,
    ledger: 0,
    documentMetadata: 0,
    manualReview: 0,
  };
}

/**
 * Bu işlev yalnız manager incelemesi için bir eşleme taslağı üretir.
 * Merkezi API çağrısı, veri yazımı, PDF baytı aktarımı veya laptop kaydı değişikliği yapmaz.
 */
export function buildCentralMigrationPreview(
  verifiedMergedRecords: OfflineRecord[],
  advisorMap: CentralMigrationAdvisorMap,
): CentralMigrationPreview {
  const warnings: string[] = [];
  const counts = emptyCounts();
  const seen = new Set<string>();
  const candidates = verifiedMergedRecords.map((record) => {
    const target = targetFor(record);
    const notes: string[] = [];
    const isDocument = target === "documentMetadata";
    const centralUserId = advisorMap[record.userId.trim()];
    let applyState: CentralMigrationCandidate["applyState"] = "readyForManagerApply";

    if (!record.userId.trim()) {
      notes.push("Offline danışman kullanıcı kodu eksik.");
      applyState = "needsUserMapping";
    } else if (!centralUserId) {
      notes.push(`Merkezi kullanıcı eşlemesi bekleniyor: ${record.userId}.`);
      applyState = "needsUserMapping";
    }
    if (!detailsLooksLikeJson(record.details)) {
      notes.push("Kayıt ayrıntısı geçerli JSON değil; manager manuel incelemesi gerekir.");
      applyState = "needsManualReview";
    }
    if (manualReviewEntities.has(record.entity)) {
      notes.push("Bu offline kayıt türü merkezi ilk aktarım kapsamına otomatik alınmaz.");
      applyState = "needsManualReview";
    }
    if (isDocument) {
      notes.push("Yalnız belge metadata’sı önizlenir; PDF baytı ayrı açık onay olmadan aktarılmaz.");
      applyState = "pdfApprovalRequired";
    }
    if (seen.has(record.id)) {
      notes.push("Birleşik kayıtta yinelenen kaynak kayıt kimliği bulundu.");
      applyState = "needsManualReview";
    }
    seen.add(record.id);
    counts[target] += 1;

    return {
      sourceRecordId: record.id,
      sourceEntity: record.entity,
      target,
      title: record.title.trim() || "Başlıksız offline kayıt",
      offlineUserId: record.userId.trim(),
      centralUserId,
      recordVersion: record.recordVersion,
      updatedAt: record.updatedAt,
      requiresPdfApproval: isDocument,
      applyState,
      notes,
    };
  });

  if (candidates.some((candidate) => candidate.applyState === "needsUserMapping")) {
    warnings.push("Merkezi kullanıcı eşlemesi eksik kayıtlar uygulanamaz.");
  }
  if (candidates.some((candidate) => candidate.applyState === "needsManualReview")) {
    warnings.push("Manuel inceleme gerektiren offline kayıtlar otomatik aktarım dışında tutulmalıdır.");
  }
  if (candidates.some((candidate) => candidate.requiresPdfApproval)) {
    warnings.push("PDF baytları bu önizleme ile merkezi depolamaya yüklenmez; belge başına ayrıca onay gerekir.");
  }

  return {
    schema: CENTRAL_MIGRATION_PREVIEW_SCHEMA,
    sourceRecordCount: verifiedMergedRecords.length,
    candidates,
    warnings,
    counts,
    isPreviewOnly: true,
    managerApplyRequired: true,
  };
}
