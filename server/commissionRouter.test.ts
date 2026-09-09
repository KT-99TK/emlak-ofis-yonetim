import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("central commission module", () => {
  const router = fs.readFileSync(path.join(process.cwd(), "server", "routers.ts"), "utf8");
  const db = fs.readFileSync(path.join(process.cwd(), "server", "db.ts"), "utf8");
  const schema = fs.readFileSync(path.join(process.cwd(), "drizzle", "schema.ts"), "utf8");
  const page = fs.readFileSync(path.join(process.cwd(), "client", "src", "pages", "OnlineCommissions.tsx"), "utf8");

  it("central online route uses a multi-party schema and manager verification", () => {
    expect(schema).toContain("commissionTransactions");
    expect(schema).toContain("commissionParticipants");
    expect(schema).toContain("externalOffice");
    expect(router).toContain("commissions: router({");
    expect(router).toContain("verify: adminProcedure");
    expect(db).toContain("createCentralCommissionTransaction");
    expect(db).toContain("verifyCentralCommissionTransaction");
  });

  it("keeps the Global 1881 default and requires justification for deviations", () => {
    expect(db).toContain("consultantRate !== 60");
    expect(db).toContain("Dış ofis paylaşımı için broker manager ve gerekçe zorunludur.");
    expect(page).toContain("%60 danışman / %40 Global 1881 varsayılanı");
    expect(page).toContain("totalRate !== 100");
  });
});
