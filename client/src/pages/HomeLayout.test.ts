import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("dashboard office flow placement", () => {
  it("keeps the flow panel in a two-column desktop grid and lets it stack below the hero before the xl breakpoint", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const compact = home.replace(/\s+/g, " ");

    expect(home).toContain("<DashboardFlowGrid");
    expect(home).toContain("<OfficeFlowPanel");
    expect(home).toContain("trpc.onlineStart.status.useQuery");
    expect(compact).toContain("const centralOperationsLocked = !onlineStartQuery.isLoading && onlineStartPending");
    expect(home).toContain("Merkezi online başlangıç bekliyor.");
    expect(home).toContain("disabled={centralOperationsLocked}");
    expect(compact).toContain("const dashboardSummary = centralOperationsLocked ? undefined : summary");
    expect(compact).toContain('value: dashboardSummary ? String(dashboardSummary.contracts) : "—"');
    expect(home).not.toContain('value: "24", note: "Örnek görünüm"');
    expect(home).not.toContain('value: "₺ 184.500", note: "Örnek görünüm"');
    expect(home).toContain("activeRentals.serviceTasks.list.useQuery");
    expect(home).toContain("getRentalServiceTaskSummary");
    expect(compact).toContain('rentalServiceSummary={ user?.role === "admin" ? rentalServiceTaskSummary : undefined }');
  });
});
