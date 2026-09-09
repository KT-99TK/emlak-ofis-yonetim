import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("consultant agreement profiles", () => {
  it("keeps the dated profile schema and manager-controlled rate validation", () => {
    const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
    const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    expect(schema).toContain("consultantAgreementProfiles");
    expect(schema).toContain("monthlyDeskFee");
    expect(db).toContain("consultantRate + officeRate");
    expect(db).toContain("approvedByUserId");
    expect(router).toContain("createAgreementProfile");
  });

  it("documents supported examples without hardcoding one agreement for everyone", () => {
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/Team.tsx"), "utf8");
    expect(page).toContain("%70/%30");
    expect(page).toContain("%80/%20");
    expect(page).toContain("Aylık masa/ofis bedeli TL");
  });
});
