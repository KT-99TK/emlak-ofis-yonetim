import { emptyAuthorityDetails, normalizeAuthorityDetails, type AuthorityContractDetails } from "./authorityContract";
import type { OfflineRecord } from "./offlineStore";

type RawAuthoritySnapshot = Partial<AuthorityContractDetails> & {
  schema?: string;
  contractNo?: string;
  sourceClientRecordId?: string;
  sourcePropertyRecordId?: string;
};

export type OfflineAuthorityDraft = {
  recordId: string;
  contractNo: string;
  ownerName: string;
  propertyAddress: string;
  consultantName: string;
  sourceClientRecordId?: string;
  sourcePropertyRecordId?: string;
  updatedAt: string;
  details: AuthorityContractDetails;
};

function isAuthoritySchema(schema?: string) {
  return schema === "global1881-offline-authority-v1" || schema === "global1881-offline-authority-v2";
}

function readDetails(snapshot: RawAuthoritySnapshot): AuthorityContractDetails {
  return normalizeAuthorityDetails({
    ...emptyAuthorityDetails(),
    ...snapshot,
    mode: snapshot.mode === "sale" ? "sale" : "rent",
    currency: snapshot.currency === "USD" || snapshot.currency === "EUR" ? snapshot.currency : "TRY",
  });
}

/** Yerel sözleşme kayıtlarından hem v1 hem v2 yetki taslaklarını güvenle ayıklar. */
export function listOfflineAuthorityDrafts(records: OfflineRecord[]): OfflineAuthorityDraft[] {
  const drafts: OfflineAuthorityDraft[] = [];
  for (const record of records) {
    if (record.entity !== "contract") continue;
    try {
      const snapshot = JSON.parse(record.details) as RawAuthoritySnapshot;
      if (!isAuthoritySchema(snapshot.schema)) continue;
      const details = readDetails(snapshot);
      drafts.push({
        recordId: record.id,
        contractNo: snapshot.contractNo?.trim() || "Numarasız eski taslak",
        ownerName: details.ownerName || "Malik adı belirtilmemiş",
        propertyAddress: details.propertyAddress || "Taşınmaz belirtilmemiş",
        consultantName: details.consultantName || "Danışman belirtilmemiş",
        sourceClientRecordId: snapshot.sourceClientRecordId,
        sourcePropertyRecordId: snapshot.sourcePropertyRecordId,
        updatedAt: record.updatedAt,
        details,
      });
    } catch {
      // Bozuk bir yerel kayıt diğer taslakların listelenmesini engellemez.
    }
  }
  return drafts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function filterOfflineAuthorityDrafts(drafts: OfflineAuthorityDraft[], search: string) {
  const needle = search.trim().toLocaleLowerCase("tr-TR");
  if (!needle) return drafts;
  return drafts.filter((draft) => `${draft.contractNo} ${draft.ownerName} ${draft.propertyAddress} ${draft.consultantName}`.toLocaleLowerCase("tr-TR").includes(needle));
}
