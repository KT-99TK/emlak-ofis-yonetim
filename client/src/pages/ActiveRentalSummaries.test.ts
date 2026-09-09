import writeXlsxFile from "write-excel-file/browser";
import { describe, expect, it } from "vitest";
import { getActiveRentalAdvisorDistribution, parseActiveRentalWorkbook } from "./ActiveRentalSummaries";

async function workbookFile(rows: unknown[][]) {
  const blob = await writeXlsxFile(rows.map(row => row.map(value => ({ value }))), { sheet: "Aktif Kiralamalar" }).toBlob();
  return new File([blob], "aktif-kiralamalar.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

describe("ActiveRentalSummaries Excel ayrıştırıcısı", () => {
  it("broker manager grafiği için danışman kodlarını büyük harfle sayar ve çoktan aza sıralar", () => {
    expect(getActiveRentalAdvisorDistribution([{ consultantCode: "ip1" }, { consultantCode: "KT1" }, { consultantCode: "KT1" }, { consultantCode: null }])).toEqual([
      { consultantCode: "KT1", count: 2 },
      { consultantCode: "IP1", count: 1 },
      { consultantCode: "KOD BEKLİYOR", count: 1 },
    ]);
  });

  it("aynı malikin farklı konumlarını eski 11 sütunlu dosyada ayrı taşınmaz olarak korur", async () => {
    const file = await workbookFile([
      ["Müşteri / malik adı", "", "Malik telefonu", "Kiracı adı", "Kiracı telefonu", "Sözleşme tarihi", "Kira artış tarihi", "Güncel aylık kira (TL)", "Mahalle", "Danışman kodu", ""],
      ["Mustafa Ekin-emlak ofisi", "İskele işyeri 1", "5326420557", "Hasan Öncü", "05010324435", "10.05.2025", "10.05.2026", 50000, "İskele", "KT1", ""],
      ["Mustafa Ekin-kuaför", "İskele işyeri 2", "5326420557", "Bedriye", "5071262786", "01.08.2023", "01.08.2026", 69500, "İskele", "KT1", ""],
    ]);
    const result = await parseActiveRentalWorkbook(file, [{ userId: 21, consultantCode: "KT1" }]);
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows.map((row) => row.clientName)).toEqual(["Mustafa Ekin", "Mustafa Ekin"]);
    expect(result.rows.map((row) => row.propertyLocation)).toEqual(["İskele işyeri 1", "İskele işyeri 2"]);
    expect(result.rows.every((row) => row.assignedUserId === 21)).toBe(true);
  });

  it("aynı malik, danışman ve taşınmaz kimliğinin tekrarını aktarım öncesinde durdurur", async () => {
    const file = await workbookFile([
      ["Müşteri / malik adı", "Taşınmaz konumu", "Malik telefonu", "Kiracı adı", "Kiracı telefonu", "Sözleşme tarihi", "Kira artış tarihi", "Güncel aylık kira (TL)", "Mahalle", "Daire bilgisi", "Danışman kodu"],
      ["Mustafa Ekin", "İskele", "5326420557", "Hasan", "05010324435", "10.05.2025", "10.05.2026", 50000, "İskele", "Daire 1", "KT1"],
      ["Mustafa Ekin", "İskele", "5326420557", "Bedriye", "5071262786", "01.08.2023", "01.08.2026", 69500, "İskele", "Daire 1", "KT1"],
    ]);
    const result = await parseActiveRentalWorkbook(file, [{ userId: 21, consultantCode: "KT1" }]);
    expect(result.rows).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain("mükerrer");
  });

  it("tanımsız danışman kodunu kayıt öncesi hataya dönüştürür", async () => {
    const file = await workbookFile([
      ["Müşteri / malik adı", "Taşınmaz konumu", "Malik telefonu", "Kiracı adı", "Kiracı telefonu", "Sözleşme tarihi", "Kira artış tarihi", "Güncel aylık kira (TL)", "Mahalle", "Daire bilgisi", "Danışman kodu"],
      ["Mustafa Ekin", "İskele", "5326420557", "Hasan", "05010324435", "10.05.2025", "10.05.2026", 50000, "İskele", "Daire 1", "CT9"],
    ]);
    const result = await parseActiveRentalWorkbook(file, [{ userId: 21, consultantCode: "KT1" }]);
    expect(result.rows).toEqual([]);
    expect(result.errors[0]).toContain("tanımsız danışman kodu");
  });

  it("broker managerın onayladığı KT0 düzeltmesini yalnız verilen alias ile KT1’e yönlendirir", async () => {
    const file = await workbookFile([
      ["Müşteri / malik adı", "Taşınmaz konumu", "Malik telefonu", "Kiracı adı", "Kiracı telefonu", "Sözleşme tarihi", "Kira artış tarihi", "Güncel aylık kira (TL)", "Mahalle", "Daire bilgisi", "Danışman kodu"],
      ["Mustafa Ekin", "İskele", "5326420557", "Hasan", "05010324435", "10.05.2025", "10.05.2026", 50000, "İskele", "Daire 1", "KT0"],
    ]);
    const result = await parseActiveRentalWorkbook(file, [{ userId: 21, consultantCode: "KT1" }], { kt0: "KT1" });
    expect(result.errors).toEqual([]);
    expect(result.rows[0]?.consultantCode).toBe("KT1");
    expect(result.rows[0]?.assignedUserId).toBe(21);
  });
});
