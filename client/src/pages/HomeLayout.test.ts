import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("dashboard office flow placement", () => {
  it("keeps the flow panel in a two-column desktop grid and lets it stack below the hero before the xl breakpoint", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(home).toContain("<DashboardFlowGrid");
    expect(home).toContain("<OfficeFlowPanel");
  });
});
