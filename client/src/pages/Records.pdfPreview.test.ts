import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("records PDF preview", () => {
  it("renders an in-page preview instead of depending on a popup", () => {
    const source = readFileSync(new URL("./Records.tsx", import.meta.url), "utf8");
    expect(source).toContain("setPrintPreviewHtml(");
    expect(source).toContain("DocumentPrintPreview");
    expect(source).toContain('aria-label="Liste önizleme"');
    expect(source).toContain("Filtrelenmiş listeyi indirmeden");
    expect(source).toContain("window.print()");
  });

  it("keeps empty filtered results printable", () => {
    const source = readFileSync(new URL("./Records.tsx", import.meta.url), "utf8");
    expect(source).toContain("Filtreye uyan kayıt bulunamadı.");
    expect(source).toContain("Filtreler:");
    expect(source).toContain("Kayıt sayısı:");
  });
});
