import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("customer reference numbers and search", () => {
  it("shows a customer reference number and searches by number or name", () => {
    const source = readFileSync(new URL("./Records.tsx", import.meta.url), "utf8");
    expect(source).toContain("Müşteri no veya ad ara");
    expect(source).toContain("item.referenceNo");
    expect(source).toContain("Müşteri No:");
    expect(source).toContain("toLocaleLowerCase(\"tr-TR\")");
    expect(source).toContain("includes(normalizedSearch)");
  });

  it("generates consultant-scoped references with a four-digit sequence", () => {
    const source = readFileSync(new URL("../../../server/db.ts", import.meta.url), "utf8");
    expect(source).toContain("customerPrefix");
    expect(source).toContain("padStart(3, \"0\")");
    expect(source).toContain("padStart(4, \"0\")");
    expect(source).toContain("referenceNo");
  });
});
