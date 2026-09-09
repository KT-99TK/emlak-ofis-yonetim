import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("portfolio rights transfer policy", () => {
  const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
  const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
  const team = readFileSync(resolve(process.cwd(), "client/src/pages/Team.tsx"), "utf8");

  it("stores historical owner, new responsible consultant, office ownership and approval metadata", () => {
    expect(schema).toContain("portfolioRightsTransfers");
    expect(schema).toContain("originatingConsultantUserId");
    expect(schema).toContain("fulfillingConsultantUserId");
    expect(schema).toContain('rightsOwnerType: mysqlEnum("rightsOwnerType", ["consultant", "office"])');
    expect(schema).toContain("effectiveFrom");
    expect(schema).toContain("approvedByUserId");
    expect(db).toContain("portfolio-rights-transfer-declared");
    expect(db).toContain("portfolio-rights-transfer-approved");
    expect(db).toContain("transfer.rightsOwnerType === \"consultant\"");
  });

  it("exposes manager-only create/list/approve procedures and UI controls", () => {
    expect(router).toContain("createPortfolioRightsTransfer: adminProcedure");
    expect(router).toContain("portfolioRightsTransfers: adminProcedure");
    expect(router).toContain("approvePortfolioRightsTransfer: adminProcedure");
    expect(team).toContain("Ayrılış ve portföy hak transferi");
    expect(team).toContain("Transferi manager onayına gönder");
    expect(team).toContain("Hak sahibi Global 1881");
  });
});

