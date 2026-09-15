import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/MultiPropertyIntakeForm.tsx"), "utf8");

describe("MultiPropertyIntakeForm", () => {
  it("portföy tanımını zorunlu alan ve kaydedilen mülk başlığının parçası yapar", () => {
    expect(source).toContain("portfolioDescription: string");
    expect(source).toContain("Portföy tanımı *");
    expect(source).toContain("!clean(row.portfolioDescription)");
    expect(source).toContain("normalize(row.portfolioDescription)");
  });

  it("çoklu satır, sıra numarası ve mükerrer atlama davranışını korur", () => {
    expect(source).toContain("Müşteri portföy grup no");
    expect(source).toContain("padStart(2, \"0\")");
    expect(source).toContain("mevcut kayıt mükerrerlik nedeniyle atlandı");
    expect(source).toContain("Mülk satırı ekle");
  });

  it("mülk listesini gerçek XLSX ve A4 yatay PDF yazdırma akışına bağlar", () => {
    expect(source).toContain("write-excel-file/browser");
    expect(source).toContain("Excel’e aktar");
    expect(source).toContain("PDF liste");
    expect(source).toContain("@page{size:A4 landscape");
    expect(source).toContain("downloadBlob(blob");
    expect(source).toContain("Mülk Portföy Listesi");
  });
});
