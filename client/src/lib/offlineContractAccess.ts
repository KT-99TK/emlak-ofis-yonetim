import type { OfflineRecord } from "@/lib/offlineStore";

export type OfflineAccessRole = "consultant" | "officeAssistant";

const ACCESS_ROLE_KEY = "global1881.offline.access-role.v1";

export function getOfflineAccessRole(): OfflineAccessRole {
  return window.localStorage.getItem(ACCESS_ROLE_KEY) === "officeAssistant" ? "officeAssistant" : "consultant";
}

export function setOfflineAccessRole(role: OfflineAccessRole) {
  window.localStorage.setItem(ACCESS_ROLE_KEY, role);
}

export type OfflineContractAccessContext = {
  userId: string;
  role: OfflineAccessRole;
  managerSessionActive: boolean;
};

export function canViewFullOfflineContract(record: Pick<OfflineRecord, "userId">, context: OfflineContractAccessContext) {
  if (context.managerSessionActive || context.role === "officeAssistant") return true;
  return Boolean(context.userId) && record.userId === context.userId;
}

export function isOfficeRecordAccessAllowed(record: Pick<OfflineRecord, "userId">, context: OfflineContractAccessContext) {
  return canViewFullOfflineContract(record, context);
}

export function maskedOwnerSummary(ownerName: string) {
  const trimmed = ownerName.trim();
  if (!trimmed) return "Malik bilgisi gizli";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return parts.map((part) => `${part.slice(0, 1)}${"•".repeat(Math.max(part.length - 1, 2))}`).join(" ");
}
