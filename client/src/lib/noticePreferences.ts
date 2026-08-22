export type NoticeLevel = "urgent" | "early" | "overdue";

export function daysUntil(value: Date, now = new Date()) {
  return Math.ceil((value.getTime() - now.getTime()) / 86400000);
}

export function matchesNoticeLevel(days: number, level: NoticeLevel, threshold: number) {
  if (level === "urgent") return days >= 0 && days <= 7;
  if (level === "early") return days >= 0 && days <= threshold;
  return days < 0 || (days >= 0 && days <= threshold);
}

/** The key is intentionally stable for one user and preference field; changing noticeLevel updates the stored value under the same user-level key. */
export function noticePreferenceKey(userId: string, name: "days" | "level" | "popup") {
  const safeUser = userId.trim() || "anonymous";
  return `global1881-notice-${safeUser}-${name}`;
}
