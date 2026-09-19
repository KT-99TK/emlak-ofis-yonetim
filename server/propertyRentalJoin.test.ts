import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("property list rental summaries", () => {
  it("returns customer reference and rental fields for portfolio search", () => {
    const source = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    expect(source).toContain("clientReferenceNo: clients.referenceNo");
    expect(source).toContain("rentalSummaries");
    expect(source).toContain("monthlyRent: row.rental.monthlyRent");
    expect(source).toContain("referenceNo: `KIRA-${row.rental.id}`");
  });

  it("allows the records search to match the owner customer number", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Records.tsx"), "utf8");
    expect(source).toContain("item.clientReferenceNo");
    expect(source).toContain("item.monthlyRent");
  });

  it("groups portfolio rows by central customer number and shows list date", () => {
    const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    const recordsSource = readFileSync(resolve(process.cwd(), "client/src/pages/Records.tsx"), "utf8");
    expect(dbSource).toContain("combinedResults.sort");
    expect(dbSource).toContain("clientNo(a.clientReferenceNo)");
    expect(recordsSource).toContain("Liste tarihi:");
    expect(recordsSource).toContain('toLocaleDateString("tr-TR")');
    expect(recordsSource).toContain("Yeni malik");
    expect(recordsSource).toContain('role="separator"');
  });
});
