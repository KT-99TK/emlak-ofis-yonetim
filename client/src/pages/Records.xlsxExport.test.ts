import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./Records.tsx", import.meta.url), "utf8");

describe("Records Excel export", () => {
  it("exports the currently filtered visible rows for all record kinds", () => {
    expect(source).toContain("const exportRecordsXlsx = async () =>");
    expect(source).toContain("visibleItems.map");
    expect(source).toContain("global1881-${kind}-${date}.xlsx");
    expect(source).toContain("Filtreli Excel indir");
  });

  it("keeps TCKN/VKN out of the normal Excel list and includes operational columns", () => {
    expect(source).toContain("Müşteri adı");
    expect(source).toContain("Sorumlu danışman");
    expect(source).toContain("Portföy özeti");
    expect(source).not.toContain("TCKN");
    expect(source).not.toContain("identityOrTaxNo");
  });
});
