import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RentalAppendixDocument from "./RentalAppendixDocument";
import RentalContractDocument from "./RentalContractDocument";
import { emptyRentalDetails } from "@/lib/rentalContract";

describe("rental documents", () => {
  const details = { ...emptyRentalDetails(), ownerName: "Ayşe Malik", tenantName: "Mehmet Kiracı", consultantName: "Deniz Yılmaz", startDate: "2026-08-23", monthlyRent: "18000" };

  it("shows only the legal parties in the rental signature area and preserves a non-signature trace", () => {
    const html = renderToStaticMarkup(<RentalContractDocument details={details} contractNo="KIR-2026-001" fontSize="10" />);
    expect(html).toContain("KİRAYA VEREN");
    expect(html).toContain("KİRACI");
    expect(html).not.toContain("DÜZENLEYEN DANIŞMAN");
    expect(html).not.toContain("Deniz Yılmaz</strong><span>İmza");
    expect(html).toContain("Düzenleme izi · DY · 2026-08-23 · Form: KIR-2026-001");
  });

  it("keeps the same non-signature trace on rental appendices", () => {
    const html = renderToStaticMarkup(<RentalAppendixDocument kind="fixtures" details={details} contractNo="KIR-2026-001" fontSize="10" />);
    expect(html).not.toContain("DÜZENLEYEN DANIŞMAN");
    expect(html).toContain("Düzenleme izi · DY · 2026-08-23 · Form: KIR-2026-001");
  });

  it("renders each structured fixture item as a numbered row in the independent appendix", () => {
    const html = renderToStaticMarkup(<RentalAppendixDocument kind="fixtures" details={{ ...details, fixtureItems: [{ id: "f-1", item: "Vestel klima", quantity: "2", condition: "Çalışır, temiz" }, { id: "f-2", item: "Daire anahtarı", quantity: "3", condition: "Teslim edildi" }] }} contractNo="KIR-2026-001" fontSize="10" />);
    expect(html).toContain("Cinsi / Markası");
    expect(html).toContain("Vestel klima");
    expect(html).toContain("Daire anahtarı");
    expect(html).toContain("Teslim edildi");
  });

  it("includes the guarantor table and signature only when the Kefil var choice is enabled", () => {
    const withoutGuarantor = renderToStaticMarkup(<RentalContractDocument details={details} contractNo="KIR-2026-001" fontSize="10" />);
    const withGuarantor = renderToStaticMarkup(<RentalContractDocument details={{ ...details, hasGuarantor: true, guarantorName: "Selin Kefil", guarantorIdentity: "11111111111" }} contractNo="KIR-2026-001" fontSize="10" />);
    expect(withoutGuarantor).not.toContain("KEFİL");
    expect(withGuarantor).toContain("KEFİL");
    expect(withGuarantor).toContain("Selin Kefil");
  });

  it("creates one independently selectable appendix document at a time", () => {
    const evacuation = renderToStaticMarkup(<RentalAppendixDocument kind="evacuation" details={details} contractNo="KIR-2026-001" fontSize="10" />);
    const handover = renderToStaticMarkup(<RentalAppendixDocument kind="handover" details={details} contractNo="KIR-2026-001" fontSize="10" />);
    const returning = renderToStaticMarkup(<RentalAppendixDocument kind="return" details={details} contractNo="KIR-2026-001" fontSize="10" />);
    const fixtures = renderToStaticMarkup(<RentalAppendixDocument kind="fixtures" details={details} contractNo="KIR-2026-001" fontSize="10" />);
    expect(evacuation).toContain("TAHLİYE TAAHHÜTNAMESİ");
    expect(handover).toContain("KİRALANAN TESLİM ETME FORMU");
    expect(returning).toContain("KİRALANAN TESLİM ALMA FORMU");
    expect(fixtures).toContain("DEMİRBAŞ VE TESLİM LİSTESİ");
  });
});
