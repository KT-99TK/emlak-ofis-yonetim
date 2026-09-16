import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("active rental workbook import safety", () => {
  it("labels existing rows and submits only importable rows", () => {
    const page = source("client/src/pages/ActiveRentalSummaries.tsx");

    expect(page).toContain("Mevcut kayıt — aktarılmayacak");
    expect(page).toContain("Yeni kayıt — aktarılacak");
    expect(page).toContain("const importableRows = parsed?.rows.filter");
    expect(page).toContain("importMutation.mutate({ rows: importableRows })");
    expect(page).toContain("importableRows.length === 0");
  });

  it("keeps the server-side fingerprint guard and reports skipped duplicates", () => {
    const db = source("server/db.ts");

    expect(db).toContain("const rowsToImport: ActiveRentalImportRow[] = []");
    expect(db).toContain("skipped.push(`${row.clientName} · ${row.propertyLocation}: mevcut kayıt`)");
    expect(db).toContain("for (const row of rowsToImport)");
    expect(db).toContain("return { imported, createdClients, skipped }");
  });
});

// This is a source contract test; no customer or rental data is inserted.
