import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("MyOfficeContributionSummary privacy", () => {
  it("filters contribution rows to the current offline user and excludes office budget inputs", () => {
    const page = source("client/src/pages/MyOfficeContributionSummary.tsx");

    expect(page).toContain("detail.consultantUserId === userId");
    expect(page).toContain("parseOfficeContribution(record)");
    expect(page).not.toContain("internalBudgetCategories");
    expect(page).not.toContain("buildBudgetSummary");
  });
});
