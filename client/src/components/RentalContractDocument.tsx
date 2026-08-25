import { calculateRentalSummary, rentalFixtureSummary, type OfflineRentalDetails } from "@/lib/rentalContract";
import { RENTAL_CONDITIONS_TEMPLATE_VERSION, rentalContractConditions } from "@/lib/rentalConditions";
import { formatTurkishDate } from "@/lib/turkishDate";
import React from "react";

type RentalContractDocumentProps = { details: OfflineRentalDetails; contractNo: string; fontSize: string };
const value = (text: string) => text.trim() || "................................";
const money = (amount: number) => amount ? `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(amount)} ₺` : "................................";
const consultantInitials = (name: string) => name.trim().split(/\s+/).filter(Boolean).map((part) => part.slice(0, 1).toLocaleUpperCase("tr-TR")).join("") || "—";
const appendixLabel = { evacuation: "Tahliye Taahhütnamesi", handover: "Teslim Etme Formu", return: "Teslim Alma Formu", fixtures: "Demirbaş Listesi" } as const;

function Row({ firstLabel, firstValue, secondLabel, secondValue }: { firstLabel: string; firstValue: string; secondLabel?: string; secondValue?: string }) {
  return <tr><th scope="row">{firstLabel}</th><td>{value(firstValue)}</td>{secondLabel && <><th scope="row">{secondLabel}</th><td>{value(secondValue ?? "")}</td></>}</tr>;
}

function FullWidthRow({ label, text }: { label: string; text: string }) {
  return <tr><th scope="row">{label}</th><td colSpan={3}>{value(text)}</td></tr>;
}

export default function RentalContractDocument({ details, contractNo, fontSize }: RentalContractDocumentProps) {
  const summary = calculateRentalSummary(details);
  const kind = details.useType === "commercial" ? "İŞYERİ KİRA SÖZLEŞMESİ" : "KONUT KİRA SÖZLEŞMESİ";
  const conditions = rentalContractConditions(details, summary.endDate);
  const selectedAppendices = Object.entries(details.appendixSelection).filter(([, included]) => included).map(([kind]) => appendixLabel[kind as keyof typeof appendixLabel]).join(" · ");

  return <article className="authority-print-document authority-contract-document rental-contract-document bg-[#fff] text-[#1c2524]" style={{ "--authority-print-font-size": `${fontSize}pt` } as React.CSSProperties}>
    <header className="rental-document-header"><p className="rental-document-record">Kira sözleşmesi kaydı: {value(contractNo)}</p></header>
    <div className="authority-document-rule" />
    <h2 className="authority-document-title">{kind}</h2>
    <p className="authority-document-meta">Düzenleme Tarihi: <strong>{formatTurkishDate(details.startDate)}</strong> · Belge yeri: <strong>{value(details.documentPlace)}</strong></p>

    <section className="authority-document-section"><h3>KİRAYA VEREN VE KİRACI BİLGİLERİ</h3><table><tbody>
      <Row firstLabel="Kiraya Veren" firstValue={details.ownerName} secondLabel="T.C. Kimlik No / VKN" secondValue={details.ownerIdentity} />
      <Row firstLabel="Kiraya Veren Adresi" firstValue={details.ownerAddress} secondLabel="Telefon" secondValue={details.ownerPhone} />
      <Row firstLabel="Kiracı" firstValue={details.tenantName} secondLabel="T.C. Kimlik No / VKN" secondValue={details.tenantIdentity} />
      <Row firstLabel="Kiracı Adresi" firstValue={details.tenantAddress} secondLabel="Telefon" secondValue={details.tenantPhone} />
    </tbody></table></section>

    <section className="authority-document-section"><h3>TAŞINMAZ, BEDEL VE SÜRE BİLGİLERİ</h3><table><tbody>
      <Row firstLabel="Mahalle / Yerleşim" firstValue={details.propertyNeighborhood} secondLabel="Niteliği / Cinsi" secondValue={details.propertyType} />
      <Row firstLabel="Taşınmaz Açık Adresi" firstValue={details.propertyAddress} secondLabel="DASK Poliçe No" secondValue={details.daskPolicyNo} />
      <Row firstLabel="Ada / Parsel / B.B." firstValue={details.parcelInfo} secondLabel="Kullanım Amacı" secondValue={details.usagePurpose} />
      <Row firstLabel={details.useType === "commercial" ? "KDV Durumu" : "İkamet Edecek Kişi"} firstValue={details.useType === "commercial" ? (details.kdvIncluded ? "KDV dâhil" : "KDV hariç") : details.residentsCount} secondLabel="Aylık Kira Bedeli" secondValue={money(summary.monthlyRent)} />
      <Row firstLabel="Depozito" firstValue={money(Number(details.deposit.replace(/\./g, "").replace(",", ".")))} secondLabel="İlk Kira Son Ödeme Tarihi" secondValue={`${formatTurkishDate(summary.firstDueDate)} (en geç 5 gün)`} />
      <Row firstLabel="Sözleşme Süresi" firstValue={`${summary.durationMonths} ay`} secondLabel="Sonraki Ödeme Günü / IBAN" secondValue={`Her ayın ${summary.paymentDay}. günü · ${value(details.iban)}`} />
      <Row firstLabel="Başlangıç Tarihi" firstValue={formatTurkishDate(details.startDate)} secondLabel="Bitiş / Tahliye Uyarısı" secondValue={`${formatTurkishDate(summary.endDate)} / ${formatTurkishDate(summary.noticeDate)}`} />
    </tbody></table></section>

    <section className="authority-document-section"><h3>KİRA SÖZLEŞMESİ TESLİM / DEMİRBAŞ EKİ</h3><table><tbody>
      <Row firstLabel="Elektrik Sayaç No" firstValue={details.electricityMeterNo} secondLabel="Su Sayaç No" secondValue={details.waterMeterNo} />
      <FullWidthRow label="Doğalgaz Sayaç No" text={details.naturalGasMeterNo} />
      <FullWidthRow label="Demirbaşlar ve Teslim Durumu" text={rentalFixtureSummary(details)} />
      <FullWidthRow label="Diğer Sayaç / Abonelik Notları" text={details.meterNotes} />
      <FullWidthRow label="Sözleşme Paketine Dahil Edilen Ekler" text={selectedAppendices} />
      {details.hasGuarantor && <Row firstLabel="Kefil" firstValue={details.guarantorName} secondLabel="Kefil TCKN / Azami Tutar" secondValue={[details.guarantorIdentity, details.guarantorLimit].filter(Boolean).join(" / ")} />}
    </tbody></table></section>

    <section className="authority-document-conditions"><h3>SÖZLEŞME KOŞULLARI</h3><ol>{conditions.map((condition, index) => <li key={index}>{condition}</li>)}</ol></section>
    <section className={`authority-document-signatures rental-document-signatures rental-party-signature-boxes ${details.hasGuarantor ? "rental-with-guarantor" : ""}`}><div className="rental-party-signature-box"><p>KİRAYA VEREN</p><strong>{value(details.ownerName)}</strong><span>İmza</span></div><div className="rental-party-signature-box"><p>KİRACI</p><strong>{value(details.tenantName)}</strong><span>İmza</span></div>{details.hasGuarantor && <div className="rental-party-signature-box"><p>KEFİL</p><strong>{value(details.guarantorName)}</strong><span>İmza</span></div>}</section>
    <footer className="rental-advisor-trace">Düzenleme izi · {consultantInitials(details.consultantName)} · {formatTurkishDate(details.startDate)} · Form: {value(contractNo)}</footer>
  </article>;
}
