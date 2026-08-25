import { calculateRentalSummary, rentalFixtureItems, rentalFixtureSummary, type OfflineRentalDetails } from "@/lib/rentalContract";
import React from "react";
import { formatTurkishDate } from "@/lib/turkishDate";

export type RentalAppendixKind = "evacuation" | "handover" | "return" | "fixtures";
type Props = { kind: RentalAppendixKind; details: OfflineRentalDetails; contractNo: string; fontSize: string; screenVisible?: boolean };
const value = (text: string) => text.trim() || "................................";
const titles: Record<RentalAppendixKind, string> = { evacuation: "TAHLİYE TAAHHÜTNAMESİ", handover: "KİRALANAN TESLİM ETME FORMU", return: "KİRALANAN TESLİM ALMA FORMU", fixtures: "DEMİRBAŞ VE TESLİM LİSTESİ" };
const consultantInitials = (name: string) => name.trim().split(/\s+/).filter(Boolean).map((part) => part.slice(0, 1).toLocaleUpperCase("tr-TR")).join("") || "—";
function Row({ label, children }: { label: string; children: React.ReactNode }) { return <tr><th scope="row">{label}</th><td>{children}</td></tr>; }
function FixtureTable({ details }: { details: OfflineRentalDetails }) {
  const items = rentalFixtureItems(details);
  const rows = items.length ? items : Array.from({ length: 6 }, (_, index) => ({ id: `empty-fixture-row-${index + 1}`, item: "", quantity: "", condition: "" }));

  return <div className="mt-3 overflow-hidden border border-[#aeb8b5]">
    <table className="rental-fixture-table w-full table-fixed border-collapse text-left">
      <colgroup><col style={{ width: "7%" }} /><col style={{ width: "31%" }} /><col style={{ width: "8%" }} /><col style={{ width: "54%" }} /></colgroup>
      <thead><tr><th className="text-center whitespace-nowrap">Sıra No</th><th className="whitespace-nowrap">Demirbaş / Marka-Cins</th><th className="text-center whitespace-nowrap">Adet</th><th className="whitespace-nowrap">Teslim Durumu / Açıklama</th></tr></thead>
      <tbody>{rows.map((item, index) => <tr key={item.id}><td className="text-center">{index + 1}</td><td>{value(item.item)}</td><td className="text-center">{value(item.quantity)}</td><td>{value(item.condition)}</td></tr>)}</tbody>
    </table>
  </div>;
}
function personWithIdentity(name: string, identity: string) {
  return identity.trim() ? `${value(name)} (TCKN: ${identity.trim()})` : value(name);
}
function EvacuationCommitmentDocument({ details }: { details: OfflineRentalDetails }) {
  const commitmentDate = formatTurkishDate(details.evacuationCommitmentDate ?? "", "……/………/……….");
  const startDate = formatTurkishDate(details.startDate);
  const propertyAddress = value(details.propertyAddress);

  return <section className="authority-document-section evacuation-commitment-document"><h3>TAHLİYE TAAHHÜTNAMESİ</h3><dl className="evacuation-commitment-parties"><div><dt>Taahhüt Eden Kiracı</dt><dd>{personWithIdentity(details.tenantName, details.tenantIdentity)}</dd></div><div><dt>Kiralayan</dt><dd>{personWithIdentity(details.ownerName, details.ownerIdentity)}</dd></div><div><dt>Tahliye Edilecek Mecurun Adresi</dt><dd>{propertyAddress}</dd></div></dl><p className="mt-5 text-justify">Kiralayandan kiralamış olduğum ve halen kiracı olarak kullanmakta bulunduğum {propertyAddress} adresindeki taşınmazı hiçbir ihtar ve ihbara gerek kalmadan kayıtsız ve şartsız olarak Türk Borçlar Kanunu’nun 352. Maddesi gereğince {commitmentDate} tarihinde, Kiralayan ile aramızda akdedilen {startDate} tarihli kira sözleşmesinde belirtilen demirbaşlar ile birlikte (ayıptan ari, hasarsız, tam ve eksiksiz bir şekilde) ve sağlam olarak tahliye edeceğimi; adı geçen kiralayanın icrai takibata geçerek yapacağı bilumum masrafları ve tahliyeyi geciktirmemden dolayı uğrayacağı zarar ve ziyanları hiçbir ihtar, ihbar ve hükme gerek kalmaksızın derhal, nakden ve peşinen ödeyeceğimi kabul, beyan ve taahhüt ederim.</p><div className="evacuation-commitment-signature"><p><strong>TAAHHÜT TARİHİ</strong><span>:</span><em>………………………………</em></p><p><strong>TAAHHÜT EDEN</strong><span>:</span><em>{personWithIdentity(details.tenantName, details.tenantIdentity)}</em></p><p><strong>İMZASI</strong><span>:</span><em>………………………………</em></p></div></section>;
}
export default function RentalAppendixDocument({ kind, details, contractNo, fontSize, screenVisible = false }: Props) {
  const summary = calculateRentalSummary(details); const date = kind === "return" ? summary.endDate : details.startDate; const hasAssignedContractNo = Boolean(contractNo.trim()) && contractNo !== "Kayıtta atanacak";
  return <article className={`authority-print-document authority-contract-document rental-contract-document rental-appendix-document rental-appendix-${kind} ${screenVisible ? "rental-appendix-preview-visible" : ""} bg-white text-[#1c2524]`} style={{ "--authority-print-font-size": `${fontSize}pt` } as React.CSSProperties}>
    <div className="authority-document-rule" /><h2 className="authority-document-title">{titles[kind]}</h2><p className="authority-document-meta">Düzenleme tarihi: <strong>{formatTurkishDate(date)}</strong> · Taşınmaz: <strong>{value(details.propertyAddress)}</strong></p>
    {kind === "evacuation" && <EvacuationCommitmentDocument details={details} />}
    {kind === "handover" && <><section className="authority-document-section"><h3>TESLİM ETME BİLGİLERİ</h3><table><tbody><Row label="Teslim Eden">{value(details.ownerName)}</Row><Row label="Teslim Alan">{value(details.tenantName)}</Row><Row label="Taşınmaz">{value(details.propertyAddress)}</Row><Row label="Teslim Tarihi">{formatTurkishDate(details.startDate)}</Row><Row label="Elektrik Sayaç No">{value(details.electricityMeterNo)}</Row><Row label="Su Sayaç No">{value(details.waterMeterNo)}</Row><Row label="Doğalgaz Sayaç No">{value(details.naturalGasMeterNo)}</Row><Row label="Demirbaş / Teslim Durumu">{value(rentalFixtureSummary(details))}</Row><Row label="Diğer Sayaç / Abonelik Notları">{value(details.meterNotes)}</Row></tbody></table></section><section className="authority-document-section rental-fixture-attachment"><h3>TESLİM EDİLEN DEMİRBAŞLAR</h3><FixtureTable details={details} /></section></>}
    {kind === "return" && <><section className="authority-document-section"><h3>TESLİM ALMA BİLGİLERİ</h3><table><tbody><Row label="Teslim Eden">{value(details.tenantName)}</Row><Row label="Teslim Alan">{value(details.ownerName)}</Row><Row label="Taşınmaz">{value(details.propertyAddress)}</Row><Row label="Planlanan Teslim Alma Tarihi">{formatTurkishDate(summary.endDate)}</Row><Row label="Elektrik Sayaç No">{value(details.electricityMeterNo)}</Row><Row label="Su Sayaç No">{value(details.waterMeterNo)}</Row><Row label="Doğalgaz Sayaç No">{value(details.naturalGasMeterNo)}</Row><Row label="Kontrol Edilecek Demirbaşlar">{value(rentalFixtureSummary(details))}</Row><Row label="Diğer Sayaç / Abonelik Son Notları">{value(details.meterNotes)}</Row></tbody></table></section><section className="authority-document-section rental-fixture-attachment"><h3>TESLİM ALMA KONTROLÜ DEMİRBAŞLARI</h3><FixtureTable details={details} /></section></>}
    {kind === "fixtures" && <section className="authority-document-section"><h3>DEMİRBAŞ LİSTESİ</h3><table><tbody><Row label="Taşınmaz">{value(details.propertyAddress)}</Row><Row label="Kiraya Veren">{value(details.ownerName)}</Row><Row label="Kiracı">{value(details.tenantName)}</Row><Row label="Elektrik / Su / Doğalgaz Sayaç No">{[value(details.electricityMeterNo), value(details.waterMeterNo), value(details.naturalGasMeterNo)].join(" / ")}</Row><Row label="Diğer Sayaç / Abonelik Notları">{value(details.meterNotes)}</Row></tbody></table><FixtureTable details={details} /></section>}
    <section className="authority-document-signatures rental-document-signatures"><div><p>KİRAYA VEREN</p><strong>{value(details.ownerName)}</strong><span>İmza</span></div><div><p>KİRACI</p><strong>{value(details.tenantName)}</strong><span>İmza</span></div></section>{hasAssignedContractNo && <footer className="rental-advisor-trace">Düzenleme izi · {consultantInitials(details.consultantName)} · {formatTurkishDate(date)} · Form: {value(contractNo)}</footer>}
  </article>;
}
