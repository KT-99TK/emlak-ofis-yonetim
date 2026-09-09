import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("uuid dependency security policy", () => {
  it("does not directly import uuid and keeps read-excel-file lazy-loaded for import only", () => {
    const sources = ["client", "server", "shared", "drizzle"].flatMap((dir) => {
      const output = readFileSync(resolve(process.cwd(), "client/src/pages/ActiveRentalSummaries.tsx"), "utf8");
      return dir === "client" ? [output] : [];
    });
    expect(sources.join("\n")).not.toMatch(/from ["']uuid["']|require\(["']uuid["']\)/);
    expect(sources.join("\n")).toContain('await import("read-excel-file/browser")');
    expect(sources.join("\n")).not.toMatch(/uuid\.(v3|v5|v6)\s*\(/);
  });

  it("documents the resolved dependency migration without leaving an ineffective override", () => {
    const note = readFileSync(resolve(process.cwd(), "docs/SECURITY-DEPENDENCY-UUID-EXCEPTION.md"), "utf8");
    const workspace = readFileSync(resolve(process.cwd(), "pnpm-workspace.yaml"), "utf8");
    expect(note).toContain("Durum:** Çözüldü");
    expect(note).toContain("read-excel-file@9.3.10");
    expect(note).toContain("ExcelJS üretim bağımlılığı tamamen kaldırıldı");
    expect(workspace).not.toContain("uuid: 11.1.1");
    expect(workspace).not.toContain("uuid@8.3.2");
  });
});

