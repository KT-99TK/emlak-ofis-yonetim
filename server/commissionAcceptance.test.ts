import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { calculateCommissionScenario } from "../client/src/lib/commissionScenario";

describe("100.000 TL komisyon kabul matrisi", () => {
  it("consultant-owned portfolio splits 50/50 and then 60/40", () => {
    const result = calculateCommissionScenario({ netCommission: 100000, scenario: "consultantPortfolioTwoSided" });
    expect(result.consultantTotal).toBe(60000);
    expect(result.globalOfficeTotal).toBe(40000);
  });

  it("office-owned portfolio keeps 50.000 TL portfolio office share", () => {
    const result = calculateCommissionScenario({ netCommission: 100000, scenario: "officePortfolioTwoSided" });
    expect(result.portfolioOfficeShare).toBe(50000);
    expect(result.consultantTotal).toBe(30000);
    expect(result.globalOfficeTotal).toBe(70000);
  });

  it("counterparty portfolio keeps 50.000 TL external office share", () => {
    const result = calculateCommissionScenario({ netCommission: 100000, scenario: "externalOfficeSingleConsultant" });
    expect(result.externalOfficeShare).toBe(50000);
    expect(result.consultantTotal).toBe(30000);
    expect(result.globalOfficeTotal).toBe(20000);
  });

  it("keeps central audit and direction fields in the online implementation", () => {
    const db = fs.readFileSync(path.join(process.cwd(), "server", "db.ts"), "utf8");
    const page = fs.readFileSync(path.join(process.cwd(), "client", "src", "pages", "OnlineCommissions.tsx"), "utf8");
    expect(db).toContain('action: "commission-declared"');
    expect(db).toContain("globalPortfolioOfficeShare");
    expect(db).toContain("snapshotConsultantSharePercent");
    expect(page).toContain("dış ofis senaryosunda dış ofis %50");
    expect(page).toContain("Global havuzdaki her danışman payı");
  });
});

// This suite intentionally does not insert production/test records into the live database.
// The database migration and router contract are validated separately.
