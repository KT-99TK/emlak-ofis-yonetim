import { describe, expect, it } from "vitest";
import { filterObligationReportRows } from "./obligationReports";

const rows = [
  { id: 1, dueDate: "2026-01-10", propertyId: 7, assignedUserId: 3, status: "paid" },
  { id: 2, dueDate: "2026-01-15", propertyId: 7, assignedUserId: 4, status: "overdue" },
  { id: 3, dueDate: "2025-12-15", propertyId: 9, assignedUserId: 3, status: "paid" },
];

describe("filterObligationReportRows", () => {
  it("filters period, portfolio, consultant, and payment status together", () => {
    const result = filterObligationReportRows(rows, { period: "month", propertyId: "7", consultantId: "4", status: "overdue" }, new Date("2026-01-20"));
    expect(result.map((row) => row.id)).toEqual([2]);
  });

  it("supports all-period and all-owner filters", () => {
    const result = filterObligationReportRows(rows, { period: "all", propertyId: "all", consultantId: "all" }, new Date("2026-01-20"));
    expect(result).toHaveLength(3);
  });
});
