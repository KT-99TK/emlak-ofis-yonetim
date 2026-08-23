export type DashboardFlowObligation = {
  id: number | string;
  title: string;
  dueDate: Date | string;
  status: string;
};

function calendarDaysUntil(value: Date | string, now: Date) {
  const due = new Date(value);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((dueDay - today) / 86_400_000);
}

/** Popup is reserved for overdue, due-today, or the next three calendar days. Other open items remain in the side panel. */
export function selectCriticalDashboardFlowObligations<T extends DashboardFlowObligation>(items: T[], now = new Date()) {
  return items
    .filter((item) => item.status !== "paid" && item.status !== "cancelled")
    .filter((item) => calendarDaysUntil(item.dueDate, now) <= 3)
    .sort((left, right) => calendarDaysUntil(left.dueDate, now) - calendarDaysUntil(right.dueDate, now));
}

export function shouldShowDashboardFlowPopup({ isConsultant, popupEnabled, criticalCount }: { isConsultant: boolean; popupEnabled: boolean; criticalCount: number }) {
  return isConsultant && popupEnabled && criticalCount > 0;
}
