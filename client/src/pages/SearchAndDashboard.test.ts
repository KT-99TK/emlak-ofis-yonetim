import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("search filters and dashboard totals", () => {
  it("keeps customer search and property type filtering in the records screen", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Records.tsx"), "utf8");
    expect(source).toContain("normalizedSearch");
    expect(source).toContain("listingTypeFilter");
    expect(source).toContain("Portföy işlem türü filtresi");
    expect(source).toContain("item.listingType !== listingTypeFilter");
  });

  it("shows active rentals and current portfolio totals on the dashboard", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    expect(home).toContain('label: "Aktif kiralamalar"');
    expect(home).toContain("dashboardSummary.activeRentals");
    expect(home).toContain('label: "Mevcut portföyler"');
    expect(db).toContain("activeRentalCount");
    expect(db).toContain('eq(properties.status, "active")');
  });
});
