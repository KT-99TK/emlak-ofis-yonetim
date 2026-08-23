import { describe, expect, it } from "vitest";
import { selectCriticalDashboardFlowObligations, shouldShowDashboardFlowPopup } from "./dashboardFlowAlerts";

describe("dashboard flow alerts", () => {
  const now = new Date("2026-08-23T09:00:00");
  const items = [
    { id: "late", title: "Gecikmiş kira", dueDate: "2026-08-20T12:00:00", status: "open" },
    { id: "today", title: "Bugün vergi", dueDate: "2026-08-23T12:00:00", status: "open" },
    { id: "soon", title: "Üç gün sonra", dueDate: "2026-08-26T12:00:00", status: "open" },
    { id: "later", title: "Dört gün sonra", dueDate: "2026-08-27T12:00:00", status: "open" },
    { id: "paid", title: "Ödenen", dueDate: "2026-08-21T12:00:00", status: "paid" },
  ];

  it("selects only overdue, today, and up-to-three-day consultant actions for a login popup", () => {
    expect(selectCriticalDashboardFlowObligations(items, now).map((item) => item.id)).toEqual(["late", "today", "soon"]);
  });

  it("does not open a popup for managers, disabled preferences, or no critical work", () => {
    expect(shouldShowDashboardFlowPopup({ isConsultant: false, popupEnabled: true, criticalCount: 2 })).toBe(false);
    expect(shouldShowDashboardFlowPopup({ isConsultant: true, popupEnabled: false, criticalCount: 2 })).toBe(false);
    expect(shouldShowDashboardFlowPopup({ isConsultant: true, popupEnabled: true, criticalCount: 0 })).toBe(false);
    expect(shouldShowDashboardFlowPopup({ isConsultant: true, popupEnabled: true, criticalCount: 1 })).toBe(true);
  });
});
