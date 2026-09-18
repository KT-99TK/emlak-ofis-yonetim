import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("active rental table filters", () => {
  it("filters by end date and rental status and exports the filtered rows", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/ActiveRentalSummaries.tsx"), "utf8");

    expect(source).toContain("rentalStatusFilter");
    expect(source).toContain("rentalEndDateFilter");
    expect(source).toContain('value="endingSoon"');
    expect(source).toContain('value="ended"');
    expect(source).toContain('type="date"');
    expect(source).toContain("filteredSummaries");
    expect(source).toContain("Kira bitiş tarihi");
    expect(source).toContain("Kira durumu");
    expect(source).toContain("row.rentalStatus");
    expect(source).toContain("w-full min-w-max table-auto");
    expect(source).toContain("whitespace-nowrap font-medium text-[#173e39]");
  });
});
