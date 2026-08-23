import type { OfflineRecord } from "./offlineStore";
import { buildAuthorityPerformance, sumAuthorityPerformance } from "./authorityPerformance";

export const ANNUAL_TARGET_SCHEMA = "global1881-offline-annual-target-v1";

export type AnnualTargetDetails = { schema: typeof ANNUAL_TARGET_SCHEMA; year: string; targetAmount: number; currency: "TRY"; previousTargetRecordId?: string };
export type AnnualTargetProgress = { userId: string; year: string; targetAmount: number; actualAmount: number; remainingAmount: number; progressPercent: number; latestUpdatedAt: string; revisionCount: number };

function isTarget(record: OfflineRecord): record is OfflineRecord & { entity: "target" } { return record.entity === "target"; }
export function parseAnnualTarget(record: OfflineRecord): AnnualTargetDetails | null {
  if (!isTarget(record)) return null;
  try { const parsed = JSON.parse(record.details) as Partial<AnnualTargetDetails>; return parsed.schema === ANNUAL_TARGET_SCHEMA && typeof parsed.year === "string" && typeof parsed.targetAmount === "number" && parsed.targetAmount > 0 ? { schema: ANNUAL_TARGET_SCHEMA, year: parsed.year, targetAmount: Math.round(parsed.targetAmount), currency: "TRY", previousTargetRecordId: parsed.previousTargetRecordId } : null; } catch { return null; }
}
function contractYear(record: OfflineRecord) { try { const snapshot = JSON.parse(record.details) as { contractDate?: string; startDate?: string }; return (snapshot.contractDate || snapshot.startDate || record.updatedAt).slice(0, 4); } catch { return record.updatedAt.slice(0, 4); } }
export function calculateAnnualTargetProgress(records: OfflineRecord[], userId: string, year: string): AnnualTargetProgress | null {
  const targets = records.flatMap((record) => { const target = parseAnnualTarget(record); return target && record.userId === userId && target.year === year ? [{ record, target }] : []; }).sort((a, b) => b.record.updatedAt.localeCompare(a.record.updatedAt));
  const latest = targets[0];
  if (!latest) return null;
  const ownYearContracts = records.filter((record) => record.userId === userId && record.entity === "contract" && contractYear(record) === year);
  const actualAmount = Math.round(sumAuthorityPerformance(buildAuthorityPerformance(ownYearContracts)).serviceFeeByCurrency.TRY ?? 0);
  return { userId, year, targetAmount: latest.target.targetAmount, actualAmount, remainingAmount: latest.target.targetAmount - actualAmount, progressPercent: latest.target.targetAmount ? Math.round((actualAmount / latest.target.targetAmount) * 1000) / 10 : 0, latestUpdatedAt: latest.record.updatedAt, revisionCount: targets.length };
}
export function buildBrokerAnnualTargetProgress(records: OfflineRecord[], year: string) {
  const users = Array.from(new Set(records.flatMap((record) => { const target = parseAnnualTarget(record); return target?.year === year ? [record.userId] : []; })));
  return users.map((userId) => calculateAnnualTargetProgress(records, userId, year)).filter((value): value is AnnualTargetProgress => Boolean(value)).sort((a, b) => b.progressPercent - a.progressPercent);
}
