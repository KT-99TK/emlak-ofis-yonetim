import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const project = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(project, file), "utf8");

describe("central record filtering policy", () => {
  it("defaults contracts and properties to active records", () => {
    const db = read("server/db.ts");
    expect(db).toContain('filters.includeInactive ? undefined : eq(contracts.status, "active")');
    expect(db).toContain('filters.includeInactive ? undefined : eq(properties.status, "active")');
  });

  it("keeps consultant scoping server-side and exposes manager consultant filters", () => {
    const db = read("server/db.ts");
    const routers = read("server/routers.ts");
    expect(db).toContain("inArray(contracts.assignedUserId, scopedIds)");
    expect(db).toContain("inArray(properties.assignedUserId, scopedIds)");
    expect(db).toContain("inArray(ledgerEntries.assignedUserId, scopedIds)");
    expect(db).toContain("eq(userProfiles.consultantCode, filters.consultantCode)");
    expect(routers).toContain('z.preprocess(value => typeof value === "string" && value.trim() === "" ? undefined : value');
    expect(routers).toContain('consultantCode: z.preprocess');
  });

  it("keeps modal surfaces opaque and readable", () => {
    const dialog = read("client/src/components/ui/dialog.tsx");
    expect(dialog).toContain("isolate bg-white text-[#1d2928] opacity-100");
    expect(dialog).toContain("text-[#5f6d68] text-sm");
  });

  it("shows an explicit active/passive filter in the central records UI", () => {
    const records = read("client/src/pages/Records.tsx");
    const contracts = read("client/src/pages/Contracts.tsx");
    expect(records).toContain("Pasif/arşiv dahil");
    expect(records).toContain("Yalnız aktif");
    expect(records).toContain("printRecordsPdf");
    expect(records).toContain("Filtreler:");
    expect(contracts).toContain("Pasif/arşiv dahil");
    expect(contracts).toContain("includeInactive");
    expect(contracts).toContain("printFilteredContractsPdf");
    expect(contracts).toContain("Filtreler:");
    expect(records).toContain("clientListInput");
    expect(records).toContain("recordFilters.consultantCode ? { consultantCode: recordFilters.consultantCode } : undefined");
    expect(records).toContain("setPrintPreviewHtml");
    expect(records).toContain("records-print-preview");
    expect(records).not.toContain("window.open(\"\", \"_blank\"");
    const css = read("client/src/index.css");
    expect(css).toContain(".records-print-preview");
    expect(css).toContain(".print-preview-controls");
  });
});
