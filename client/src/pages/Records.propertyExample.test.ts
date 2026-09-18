import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("property title example", () => {
  it("uses the office's Urla example in the portfolio form", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Records.tsx"), "utf8");
    expect(source).toContain("3+1 Daire – Urla, İskele Mah.");
    expect(source).not.toContain("Kadıköy, Caferağa Mah.");
  });
});
