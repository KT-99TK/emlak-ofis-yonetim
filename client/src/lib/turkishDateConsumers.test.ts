import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("Turkey date presentation consumers", () => {
  it("keeps visible due, closing, local-backup and broker refresh dates on the shared helpers", () => {
    const expectations = [
      ["client/src/pages/Obligations.tsx", "formatTurkishDate"],
      ["client/src/pages/OfflineTransactionClosings.tsx", "formatTurkishDate"],
      ["client/src/pages/OfflineWorkspace.tsx", "formatTurkishDateTime"],
      ["client/src/pages/BrokerRequestMatches.tsx", "formatTurkishDateTime"],
      ["client/src/pages/OfflineConsultantPerformance.tsx", "formatTurkishDateTime"],
      ["client/src/components/ManifestPreviewRow.tsx", "formatTurkishDateTime"],
    ] as const;

    expectations.forEach(([path, helper]) => {
      expect(source(path)).toContain(helper);
    });
  });

  it("does not reintroduce direct Turkish locale date rendering in the critical offline screens", () => {
    [
      "client/src/pages/Obligations.tsx",
      "client/src/pages/OfflineTransactionClosings.tsx",
      "client/src/pages/OfflineWorkspace.tsx",
    ].forEach((path) => {
      expect(source(path)).not.toContain('toLocaleDateString("tr-TR")');
    });
  });
});
