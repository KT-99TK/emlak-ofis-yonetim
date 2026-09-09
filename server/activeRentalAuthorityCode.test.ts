import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("active rental authority code import contract", () => {
  it("stores authorityCode in the schema and server import", () => {
    const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
    const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/ActiveRentalSummaries.tsx"), "utf8");
    expect(schema).toContain('authorityCode: varchar("authorityCode", { length: 60 })');
    expect(db).toContain("authorityCode: row.authorityCode?.trim() || null");
    expect(db).toContain("normalizeImportValue(row.authorityCode ?? \"\")");
    expect(page).toContain('at("yetki kodu", "yetki sözleşmesi kodu")');
    expect(page).toContain("authorityCode: value(\"authorityCode\") || undefined");
  });
});
