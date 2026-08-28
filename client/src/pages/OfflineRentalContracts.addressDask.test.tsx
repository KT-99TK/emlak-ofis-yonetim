import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PropertyAddressDaskFields, rentalMonthlyRentLabel } from "./OfflineRentalContracts";

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
});
