import type { OfflineRecord } from "./offlineStore";

export function isUpcomingEvacuation(record: OfflineRecord, now = Date.now()): boolean {
  if (record.entity !== "evacuation" || !record.noticeDate) return false;
  const deadline = new Date(record.noticeDate).getTime();
  const leadMs = (record.noticeDays ?? 60) * 86400000;
  return deadline >= now && deadline - now <= leadMs;
}
