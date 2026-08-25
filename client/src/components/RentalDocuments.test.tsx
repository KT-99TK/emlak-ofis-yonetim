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

  it("hides the consultant/form trace until a real rental contract number has been assigned", () => {
    const draftHtml = renderToStaticMarkup(<RentalAppendixDocument kind="fixtures" details={details} contractNo="Kayıtta atanacak" fontSize="10" />);

    expect(draftHtml).not.toContain("rental-advisor-trace");
    expect(draftHtml).not.toContain("Kayıtta atanacak");
    expect(draftHtml).not.toContain("Kira sözleşmesi kaydı");
  });

  it("keeps common rental appendices free of internal record and fixture workflow notes", () => {
    for (const kind of ["evacuation", "handover", "return", "fixtures"] as const) {
      const html = renderToStaticMarkup(<RentalAppendixDocument kind={kind} details={details} contractNo="Kayıtta atanacak" fontSize="10" />);
      expect(html).not.toContain("Kira sözleşmesi kaydı");
      expect(html).not.toContain("formundaki demirbaş");
      expect(html).not.toContain("otomatik eşleşir");
      expect(html).not.toContain("teslim alma kontrolündeki");
      expect(html).not.toContain("satır ekleme/silme tablosuyla");
    }
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
    expect(html).toContain('style="width:7%"');
    expect(html).toContain('style="width:31%"');
    expect(html).toContain('style="width:8%"');
    expect(html).toContain('style="width:54%"');
    expect(html).toContain("Vestel klima");
    expect(html).toContain("Daire anahtarı");
    expect(html).toContain("Teslim edildi");
  });

  it("attaches the same detailed fixture grid to both handover and return forms", () => {
    const fixtureDetails = { ...details, fixtureItems: [{ id: "f-1", item: "Vestel klima", quantity: "2", condition: "Çalışır, temiz" }, { id: "f-2", item: "Daire anahtarı", quantity: "3", condition: "Teslim edildi" }] };
    const handover = renderToStaticMarkup(<RentalAppendixDocument kind="handover" details={fixtureDetails} contractNo="KIR-2026-001" fontSize="10" />);
    const returning = renderToStaticMarkup(<RentalAppendixDocument kind="return" details={fixtureDetails} contractNo="KIR-2026-001" fontSize="10" />);

    for (const html of [handover, returning]) {
      expect(html).toContain("rental-fixture-attachment");
      expect(html).toContain("Sıra No");
      expect(html).toContain("Demirbaş / Marka-Cins");
      expect(html).toContain("Vestel klima");
      expect(html).toContain("Daire anahtarı");
      expect(html).toContain("Teslim edildi");
    }
    expect(handover).toContain("TESLİM EDİLEN DEMİRBAŞLAR");
    expect(returning).toContain("TESLİM ALMA KONTROLÜ DEMİRBAŞLARI");
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

  it("uses the supplied evacuation commitment format and keeps its date blank until manually chosen", () => {
    const blank = renderToStaticMarkup(<RentalAppendixDocument kind="evacuation" details={{ ...details, ownerIdentity: "32431945506", tenantIdentity: "36907881664", propertyAddress: "Güvendik Mahallesi 223. Sokak Urla/İZMİR", durationMonths: "12", evacuationCommitmentDate: "" }} contractNo="KIR-2026-001" fontSize="10" />);
    const selected = renderToStaticMarkup(<RentalAppendixDocument kind="evacuation" details={{ ...details, ownerIdentity: "32431945506", tenantIdentity: "36907881664", propertyAddress: "Güvendik Mahallesi 223. Sokak Urla/İZMİR", durationMonths: "12", evacuationCommitmentDate: "2027-11-15" }} contractNo="KIR-2026-001" fontSize="10" />);

    expect(blank).toContain("Taahhüt Eden Kiracı");
    expect(blank).toContain("Tahliye Edilecek Mecurun Adresi");
    expect(blank).toContain("Türk Borçlar Kanunu’nun 352. Maddesi");
    expect(blank).toContain("……/………/………. tarihinde");
    expect(blank).not.toContain("23.08.2027 tarihinde");
    expect(selected).toContain("15.11.2027 tarihinde");
    expect(selected).toContain("Mehmet Kiracı");
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

  it("uses full-width value cells for unpaired rental delivery and fixture rows", () => {
    const html = renderToStaticMarkup(<RentalContractDocument details={{ ...details, electricityMeterNo: "ELEK-34017", waterMeterNo: "SU-9821", naturalGasMeterNo: "DOG-4410", meterNotes: "Sayaçlar teslimde kontrol edilecek", appendixSelection: { evacuation: true, handover: true, return: false, fixtures: true } }} contractNo="KIR-2026-001" fontSize="10" />);

    expect(html).toContain("Doğalgaz Sayaç No</th><td colSpan=\"3\">DOG-4410</td>");
    expect(html).toContain("Demirbaşlar ve Teslim Durumu</th><td colSpan=\"3\">");
    expect(html).toContain("Diğer Sayaç / Abonelik Notları</th><td colSpan=\"3\">Sayaçlar teslimde kontrol edilecek</td>");
    expect(html).toContain("Sözleşme Paketine Dahil Edilen Ekler</th><td colSpan=\"3\">Tahliye Taahhütnamesi · Teslim Etme Formu · Demirbaş Listesi</td>");
  });
});
