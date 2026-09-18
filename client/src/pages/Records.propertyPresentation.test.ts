import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("property presentation", () => {
  it("renders listing status badges and bolds the neighborhood portion of titles", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Records.tsx"), "utf8");
    expect(source).toContain("propertyTitleParts");
    expect(source).toContain("KİRALIK");
    expect(source).toContain("SATILIK");
    expect(source).toContain("propertyParts.neighborhood");
    expect(source).toContain("font-bold text-[#173e39]");
  });
});
