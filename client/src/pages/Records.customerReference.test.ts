import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("customer reference numbers and search", () => {
  it("shows a customer reference number and searches by number or name", () => {
    const source = readFileSync(new URL("./Records.tsx", import.meta.url), "utf8");
    expect(source).toContain("Müşteri no ara (örn. 0001)");
    expect(source).toContain("Merkezi müşteri numarası veya ad ara");
    expect(source).toContain("item.referenceNo");
    expect(source).toContain("Müşteri No:");
    expect(source).toContain("Sorumlu danışman:");
    expect(source).toContain("consultantCode");
    expect(source).toContain("toLocaleLowerCase(\"tr-TR\")");
    expect(source).toContain("includes(normalizedSearch)");
    expect(source).toContain("Merkezi müşteri araması");
    expect(source).toContain("Merkezi müşteri no");
    expect(source).toContain("Sorumlu danışman");
    expect(source).toContain("search.trim() || \"yok\"");
  });

  it("generates office-wide references with a four-digit sequence", () => {
    const source = readFileSync(new URL("../../../server/db.ts", import.meta.url), "utf8");
    expect(source).toContain("nextClientReferenceNo");
    expect(source).toContain("/^\\d{4,}$/");
    expect(source).toContain("padStart(4, \"0\")");
    expect(source).toContain("referenceNo");
  });
});
