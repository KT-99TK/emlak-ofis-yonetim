import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("multi-property PDF export", () => {
  it("routes the property portfolio list through the shared in-app print preview", () => {
    const form = source("client/src/components/MultiPropertyIntakeForm.tsx");

    expect(form).toContain('import DocumentPrintPreview from "@/components/DocumentPrintPreview"');
    expect(form).toContain("setPrintPreviewOpen(true)");
    expect(form).toContain("<DocumentPrintPreview");
    expect(form).toContain('title="Mülk portföy listesi"');
    expect(form).toContain("property-portfolio-print-document");
    expect(form).not.toContain("window.open(\"\", \"_blank\"");
  });

  it("keeps Excel export and automatic file naming available", () => {
    const form = source("client/src/components/MultiPropertyIntakeForm.tsx");

    expect(form).toContain("writeXlsxFile");
    expect(form).toContain("Global1881-Mulk-Portfoy-Listesi-");
    expect(form).toContain("Excel’e aktar");
    expect(form).toContain("PDF liste");
  });
});
