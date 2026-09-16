import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("records PDF preview", () => {
  it("renders an in-page preview instead of depending on a popup", () => {
    const source = readFileSync(new URL("./Records.tsx", import.meta.url), "utf8");
    expect(source).toContain("setPrintPreviewHtml(");
    expect(source).toContain('className="records-print-preview"');
    expect(source).toContain('role="dialog" aria-label="PDF yazdırma önizlemesi"');
    expect(source).toContain("Yazdır / PDF olarak kaydet");
    expect(source).toContain("window.print()");
  });

  it("keeps empty filtered results printable", () => {
    const source = readFileSync(new URL("./Records.tsx", import.meta.url), "utf8");
    expect(source).toContain("Filtreye uyan kayıt bulunamadı.");
    expect(source).toContain("Filtreler:");
    expect(source).toContain("Kayıt sayısı:");
  });
});

