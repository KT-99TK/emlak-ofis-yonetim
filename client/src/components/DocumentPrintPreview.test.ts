import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("application print preview", () => {
  it("offers an in-app A4 review before the native Electron print dialog", () => {
    const preview = source("client/src/components/DocumentPrintPreview.tsx");

    expect(preview).toContain("Uygulama içi A4 yazdırma önizlemesi");
    expect(preview).toContain("Print / PDF olarak kaydet");
    expect(preview).toContain("window.setTimeout(() =>");
    expect(preview).toContain("fileName?: string");
    expect(preview).toContain("document.title = fileName.trim()");
    expect(preview).toContain("}, 300)");
    expect(preview).toContain("afterprint");
  });

  it("routes both offline contract types through the shared preview before calling window.print", () => {
    const rental = source("client/src/pages/OfflineRentalContracts.tsx");
    const authority = source("client/src/pages/OfflineAuthorityContracts.tsx");
    const styles = source("client/src/index.css");

    expect(rental).toContain("setPrintPreviewOpen(true)");
    expect(rental).toContain("<DocumentPrintPreview");
    expect(authority).toContain("const openPrintPreview = () => setPrintPreviewOpen(true)");
    expect(authority).toContain("<DocumentPrintPreview");
    expect(styles).toContain(".rental-print-contract .rental-appendix-document");
    expect(styles).toContain(".rental-print-package.rental-package-omit-return .rental-appendix-return");
    expect(styles).toContain(".rental-print-return .rental-appendix-document:not(.rental-appendix-return)");
  });

  it("keeps every rental appendix independently printable through the shared A4 preview", () => {
    const rental = source("client/src/pages/OfflineRentalContracts.tsx");

    expect(rental).toContain("const safePdfPart");
    expect(rental).toContain("const printFileName = useMemo");
    expect(rental).toContain("fileName={printFileName}");
    expect(rental).toContain("window.print();");
    expect(rental).toContain('{ kind: "evacuation", label: "Tahliye Taahhütnamesi" }');
    expect(rental).toContain('{ kind: "handover", label: "Teslim Etme Formu" }');
    expect(rental).toContain('{ kind: "return", label: "Teslim Alma Formu" }');
    expect(rental).toContain('{ kind: "fixtures", label: "Demirbaş Listesi" }');
    expect(rental).toContain('onClick={() => printDocument(option.kind)}');
    expect(rental).toContain("Print / PDF: {option.label}");
    expect(rental).toContain("Print / PDF: ana sözleşme");
    expect(rental).toMatch(
      /screenVisible=\{\s*printMode === "package"\s*\? details\.appendixSelection\[option\.kind\]\s*:\s*printMode === option\.kind\s*\}/
    );
  });
});
