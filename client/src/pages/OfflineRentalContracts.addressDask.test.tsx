import React from "react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PropertyAddressDaskFields, rentalMonthlyRentLabel } from "./OfflineRentalContracts";

const rentalSource = readFileSync(resolve(process.cwd(), "client/src/pages/OfflineRentalContracts.tsx"), "utf8");

describe("taşınmaz adresi ve DASK alan grubu", () => {
  it("adresi ve DASK poliçesini aynı kompakt taşınmaz bilgi kartında yan yana render eder", () => {
    const html = renderToStaticMarkup(
      <PropertyAddressDaskFields
        propertyAddress="Rüstem Mahallesi, Urla"
        daskPolicyNo="DASK-2026-1881"
        onChange={() => undefined}
      />
    );

    expect(html).toContain("grid gap-3 rounded-xl border border-[#dbe5dd]");
    expect(html).toContain("Taşınmaz açık adresi");
    expect(html).toContain("Rüstem Mahallesi, Urla");
    expect(html).toContain("DASK poliçe numarası");
    expect(html).toContain("DASK-2026-1881");
    expect(html).toContain("sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.62fr)]");
    expect(html).not.toContain("border-[#b8d0c6]");
  });

  it("işyeri formunda yalnız net kira etiketini kullanır ve konut etiketini korur", () => {
    expect(rentalMonthlyRentLabel("commercial")).toBe("Aylık net kira bedeli (₺)");
    expect(rentalMonthlyRentLabel("residential")).toBe("Aylık kira (₺)");
  });

  it("kayıt sonucunu açıkça bildirir ve kayıt sırasında düğmeyi meşgul gösterir", () => {
    expect(rentalSource).toContain('setMessage("Kayıt edilmiştir.")');
    expect(rentalSource).toContain("Kayıt yapılamadı:");
    expect(rentalSource).toContain("disabled={isSaving}");
    expect(rentalSource).toContain("Kayıt yapılıyor...");
  });
});
