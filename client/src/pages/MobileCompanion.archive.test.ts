import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("MobileCompanion customer digital archive", () => {
  it("keeps historical archive handling separate from active signed documents", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "client", "src", "pages", "MobileCompanion.tsx"), "utf8");
    expect(source).toContain("documents.archiveList.useQuery");
    expect(source).toContain("documents.attachArchive.useMutation");
    expect(source).toContain("Müşteri Dijital Arşivi");
    expect(source).toContain("Geçmiş PDF arşive ekle");
    expect(source).toContain('document.category === "activeSigned"');
    expect(source).toContain("Yalnız bitmiş/geçmiş işlemler eklenir");
    expect(source).toContain("Silinemez arşiv");
  });
});
