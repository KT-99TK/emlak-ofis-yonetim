import { describe, expect, it } from "vitest";
import { DASHBOARD_GREETING, formatDashboardDate } from "./dashboardGreeting";

describe("dashboard greeting", () => {
  it("formats the local Turkish daily heading and keeps the approved greeting", () => {
    expect(formatDashboardDate(new Date(2026, 7, 23, 12))).toBe("23 Ağustos Pazar");
    expect(DASHBOARD_GREETING).toBe("İyi çalışmalar, gününüz bereketli geçsin.");
  });
});
