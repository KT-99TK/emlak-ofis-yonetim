import { calculateRentalSummary, type OfflineRentalDetails } from "@/lib/rentalContract";
import { RENTAL_CONDITIONS_TEMPLATE_VERSION, rentalContractConditions } from "@/lib/rentalConditions";
import React from "react";

type RentalContractDocumentProps = { details: OfflineRentalDetails; contractNo: string; fontSize: string };
const value = (text: string) => text.trim() || "................................";
const money = (amount: number) => amount ? `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(amount)} ₺` : "................................";
const consultantInitials = (name: string) => name.trim().split(/\s+/).filter(Boolean).map((part) => part.slice(0, 1).toLocaleUpperCase("tr-TR")).join("") || "—";

function Row({ firstLabel, firstValue, secondLabel, secondValue }: { firstLabel: string; firstValue: string; secondLabel?: string; secondValue?: string }) {
  return <tr><th scope="row">{firstLabel}</th><td>{value(firstValue)}</td>{secondLabel && <><th scope="row">{secondLabel}</th><td>{value(secondValue ?? "")}</td></>}</tr>;
}

export default function RentalContractDocument({ details, contractNo, fontSize }: RentalContractDocumentProps) {
  const summary = calculateRentalSummary(details);
  const kind = details.useType === "commercial" ? "İŞYERİ KİRA SÖZLEŞMESİ" : "KONUT KİRA SÖZLEŞMESİ";
  const conditions = rentalContractConditions(details, summary.endDate);
  return <article className="authority-print-document authority-contract-document rental-contract-document bg-[#fff] text-[#1c2524]" style={{ "--authority-print-font-size": `${fontSize}pt` } as React.CSSProperties}>
    <header className="rental-document-header"><p className="rental-document-record">Kira sözleşmesi kaydı: {value(contractNo)}</p></header>
    <div className="authority-document-rule" /><h2 className="authority-document-title">{kind}</h2><p className="authority-document-meta">Düzenleme Tarihi: <strong>{value(details.startDate)}</strong> · Belge yeri: <strong>{value(details.documentPlace)}</strong></p>
    <section className="authority-document-section"><h3>KİRAYA VEREN VE KİRACI BİLGİLERİ</h3><table><tbody><Row firstLabel="Kiraya Veren" firstValue={details.ownerName} secondLabel="T.C. Kimlik No / VKN" secondValue={details.ownerIdentity} /><Row firstLabel="Kiraya Veren Adresi" firstValue={details.ownerAddress} secondLabel="Telefon" secondValue={details.ownerPhone} /><Row firstLabel="Kiracı" firstValue={details.tenantName} secondLabel="T.C. Kimlik No / VKN" secondValue={details.tenantIdentity} /><Row firstLabel="Kiracı Adresi" firstValue={details.tenantAddress} secondLabel="Telefon" secondValue={details.tenantPhone} /></tbody></table></section>
    <section className="authority-document-section"><h3>TAŞINMAZ, BEDEL VE SÜRE BİLGİLERİ</h3><table><tbody><Row firstLabel="Mahalle / Yerleşim" firstValue={details.propertyNeighborhood} secondLabel="Taşınmaz Açık Adresi" secondValue={details.propertyAddress} /><Row firstLabel="Niteliği / Cinsi" firstValue={details.propertyType} secondLabel="Ada / Parsel / B.B." secondValue={details.parcelInfo} /><Row firstLabel="Kullanım Amacı" firstValue={details.usagePurpose} secondLabel={details.useType === "commercial" ? "KDV Durumu" : "İkamet Edecek Kişi"} secondValue={details.useType === "commercial" ? (details.kdvIncluded ? "KDV dâhil" : "KDV hariç") : details.residentsCount} /><Row firstLabel="Aylık Kira Bedeli" firstValue={money(summary.monthlyRent)} secondLabel="Depozito" secondValue={money(Number(details.deposit.replace(/\./g, "").replace(",", ".")))} /><Row firstLabel="Ödeme Günü / IBAN" firstValue={`Her ayın ${summary.paymentDay}. günü · ${value(details.iban)}`} secondLabel="Sözleşme Süresi" secondValue={`${summary.durationMonths} ay`} /><Row firstLabel="Başlangıç Tarihi" firstValue={details.startDate} secondLabel="Bitiş / Tahliye Uyarısı" secondValue={`${summary.endDate} / ${summary.noticeDate}`} /></tbody></table></section>
    <section className="authority-document-section"><h3>KİRA SÖZLEŞMESİ TESLİM / DEMİRBAŞ EKİ</h3><table><tbody><Row firstLabel="Demirbaşlar ve Teslim Durumu" firstValue={details.fixtures} /><Row firstLabel="Sayaçlar / Abonelikler" firstValue={details.meterNotes} />{details.hasGuarantor && <Row firstLabel="Kefil" firstValue={details.guarantorName} secondLabel="Kefil TCKN / Azami Tutar" secondValue={[details.guarantorIdentity, details.guarantorLimit].filter(Boolean).join(" / ")} />}</tbody></table></section>
    <section className="authority-document-conditions"><h3>SÖZLEŞME KOŞULLARI</h3><ol>{conditions.map((condition, index) => <li key={index}>{condition}</li>)}</ol><p className="authority-document-template-note">Koşul şablon sürümü: {RENTAL_CONDITIONS_TEMPLATE_VERSION}. Bu metin, kullanıcının sağladığı şablonun sözleşme anındaki offline snapshot’ıdır.</p></section>
    <section className={`authority-document-signatures rental-document-signatures ${details.hasGuarantor ? "rental-with-guarantor" : ""}`}><div><p>KİRAYA VEREN</p><strong>{value(details.ownerName)}</strong><span>İmza</span></div><div><p>KİRACI</p><strong>{value(details.tenantName)}</strong><span>İmza</span></div>{details.hasGuarantor && <div><p>KEFİL</p><strong>{value(details.guarantorName)}</strong><span>İmza</span></div>}</section>
    <footer className="rental-advisor-trace">Düzenleme izi · {consultantInitials(details.consultantName)} · {value(details.startDate)} · Form: {value(contractNo)}</footer>
  </article>;
}
