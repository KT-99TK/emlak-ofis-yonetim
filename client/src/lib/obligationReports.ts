export type ObligationReportRow = { dueDate: Date | string; propertyId?: number | null; assignedUserId?: number | null; status: string };
export type ObligationReportFilters = { period: "all" | "year" | "month"; propertyId: string; consultantId: string; status?: string };

export function filterObligationReportRows<T extends ObligationReportRow>(rows: T[], filters: ObligationReportFilters, now = new Date()): T[] {
  return rows.filter((item) => {
    const date = new Date(item.dueDate);
    const periodMatch = filters.period === "all" || (filters.period === "year" && date.getFullYear() === now.getFullYear()) || (filters.period === "month" && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth());
    return periodMatch && (filters.propertyId === "all" || String(item.propertyId) === filters.propertyId) && (filters.consultantId === "all" || String(item.assignedUserId) === filters.consultantId) && (!filters.status || item.status === filters.status);
  });
}
