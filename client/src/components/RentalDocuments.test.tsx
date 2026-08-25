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
    expect(html).toContain("Düzenleme izi · DY · 23.08.2026 · Form: KIR-2026-001");
  });

  it("keeps the same non-signature trace on rental appendices", () => {
    const html = renderToStaticMarkup(<RentalAppendixDocument kind="fixtures" details={details} contractNo="KIR-2026-001" fontSize="10" />);
    expect(html).not.toContain("DÜZENLEYEN DANIŞMAN");
    expect(html).toContain("Düzenleme izi · DY · 23.08.2026 · Form: KIR-2026-001");
  });

  it("adds the on-screen preview class only when an appendix is selected for the package", () => {
    const selected = renderToStaticMarkup(<RentalAppendixDocument kind="handover" details={details} contractNo="KIR-2026-001" fontSize="10" screenVisible />);
    const unselected = renderToStaticMarkup(<RentalAppendixDocument kind="handover" details={details} contractNo="KIR-2026-001" fontSize="10" screenVisible={false} />);
    expect(selected).toContain("rental-appendix-preview-visible");
    expect(unselected).not.toContain("rental-appendix-preview-visible");
  });

  it("renders each structured fixture item as a numbered row in the independent appendix", () => {
    const html = renderToStaticMarkup(<RentalAppendixDocument kind="fixtures" details={{ ...details, fixtureItems: [{ id: "f-1", item: "Vestel klima", quantity: "2", condition: "Çalışır, temiz" }, { id: "f-2", item: "Daire anahtarı", quantity: "3", condition: "Teslim edildi" }] }} contractNo="KIR-2026-001" fontSize="10" />);
    expect(html).toContain("Sıra No");
    expect(html).toContain("Demirbaş / Marka-Cins");
    expect(html).toContain("Teslim Durumu / Açıklama");
    expect(html).toContain("Vestel klima");
    expect(html).toContain("Daire anahtarı");
    expect(html).toContain("Teslim edildi");
  });

  it("keeps six ruled Excel-style fixture rows visible when the form does not yet contain fixture items", () => {
    const html = renderToStaticMarkup(<RentalAppendixDocument kind="fixtures" details={{ ...details, fixtureItems: [] }} contractNo="KIR-2026-001" fontSize="10" />);
    expect(html).toContain("rental-fixture-table");
    expect(html).toContain("Sıra No");
    expect(html).toContain("Demirbaş / Marka-Cins");
    expect(html).toContain("Teslim Durumu / Açıklama");
    expect(html.match(/text-center">[1-6]<\/td>/g)).toHaveLength(6);
    expect(html).not.toContain("Teslim edilen demirbaş bulunmuyor");
  });

  it("includes the guarantor table and signature only when the Kefil var choice is enabled", () => {
    const withoutGuarantor = renderToStaticMarkup(<RentalContractDocument details={details} contractNo="KIR-2026-001" fontSize="10" />);
    const withGuarantor = renderToStaticMarkup(<RentalContractDocument details={{ ...details, hasGuarantor: true, guarantorName: "Selin Kefil", guarantorIdentity: "11111111111" }} contractNo="KIR-2026-001" fontSize="10" />);
    expect(withoutGuarantor).not.toContain("KEFİL");
    expect(withGuarantor).toContain("KEFİL");
    expect(withGuarantor).toContain("Selin Kefil");
    expect(withoutGuarantor.match(/<div class="rental-party-signature-box"/g)).toHaveLength(2);
    expect(withGuarantor.match(/<div class="rental-party-signature-box"/g)).toHaveLength(3);
    expect(withGuarantor).toContain("rental-with-guarantor");
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

  it("keeps tenant service fee and KDV outside the rental document and appendices", () => {
    const contract = renderToStaticMarkup(<RentalContractDocument details={{ ...details, monthlyRent: "12000", vatCollection: "included" }} contractNo="KIR-2026-001" fontSize="10" />);
    const appendix = renderToStaticMarkup(<RentalAppendixDocument kind="fixtures" details={{ ...details, monthlyRent: "12000", vatCollection: "included" }} contractNo="KIR-2026-001" fontSize="10" />);
    expect(contract).not.toContain("Hizmet bedeli");
    expect(contract).not.toContain("KDV tahsil");
    expect(appendix).not.toContain("Hizmet bedeli");
  });

  it("renders DASK policy and separate utility meter numbers on the contract and handover appendix", () => {
    const subscriptionDetails = { ...details, electricityMeterNo: "ELEK-34017", waterMeterNo: "SU-9821", naturalGasMeterNo: "DOG-4410", daskPolicyNo: "DASK-2026-1881" };
    const contract = renderToStaticMarkup(<RentalContractDocument details={subscriptionDetails} contractNo="KIR-2026-001" fontSize="10" />);
    const handover = renderToStaticMarkup(<RentalAppendixDocument kind="handover" details={subscriptionDetails} contractNo="KIR-2026-001" fontSize="10" />);
    expect(contract).toContain("Taşınmaz Açık Adresi");
    expect(contract).toContain("DASK Poliçe No");
    expect(contract).toContain("DASK-2026-1881");
    expect(contract).not.toContain("mt-3 rounded-md border-2");
    expect(contract).toContain("ELEK-34017");
    expect(contract).toContain("SU-9821");
    expect(contract).toContain("DOG-4410");
    expect(handover).toContain("Elektrik Sayaç No");
    expect(handover).toContain("Doğalgaz Sayaç No");
    expect(handover).toContain("DOG-4410");
  });
});
