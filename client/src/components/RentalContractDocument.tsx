import { calculateRentalSummary, normalizeRentalDetails, rentalFixtureSummary, type OfflineRentalDetails } from "@/lib/rentalContract";
import { RENTAL_CONDITIONS_TEMPLATE_VERSION, rentalContractConditions } from "@/lib/rentalConditions";
import { formatIban } from "@/lib/textFormatting";
import { formatTurkishDate } from "@/lib/turkishDate";
import React from "react";

type RentalContractDocumentProps = { details: OfflineRentalDetails; contractNo: string; fontSize: string };
const value = (text: string) => text.trim() || "................................";
const money = (amount: number) => amount ? `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(amount)} ₺` : "................................";
const consultantInitials = (name: string) => name.trim().split(/\s+/).filter(Boolean).map((part) => part.slice(0, 1).toLocaleUpperCase("tr-TR")).join("") || "—";
const appendixLabel = { evacuation: "Tahliye Taahhütnamesi", handover: "Teslim Etme Formu", return: "Teslim Alma Formu", fixtures: "Demirbaş Listesi" } as const;
const statusLabel = (value: boolean | "present" | "absent" | "yes" | "no" | "unknown") => value === true || value === "present" || value === "yes" ? "Evet / Var" : value === false || value === "absent" || value === "no" ? "Hayır / Yok" : "Belirtilmedi";
const joined = (...values: string[]) => values.map(value).filter(Boolean).join(" · ");

function Row({ firstLabel, firstValue, secondLabel, secondValue }: { firstLabel: string; firstValue: string; secondLabel?: string; secondValue?: string }) {
  return <tr><th scope="row">{firstLabel}</th><td>{value(firstValue)}</td>{secondLabel && <><th scope="row">{secondLabel}</th><td>{value(secondValue ?? "")}</td></>}</tr>;
}

function FullWidthRow({ label, text }: { label: string; text: string }) {
  return <tr><th scope="row">{label}</th><td colSpan={3}>{value(text)}</td></tr>;
}

export default function RentalContractDocument({ details, contractNo, fontSize }: RentalContractDocumentProps) {
  const normalized = normalizeRentalDetails(details);
  const summary = calculateRentalSummary(normalized);
  const kind = normalized.useType === "commercial" ? "İŞYERİ KİRA SÖZLEŞMESİ" : "KONUT KİRA SÖZLEŞMESİ";
  const conditions = rentalContractConditions(normalized, summary.endDate);
  const selectedAppendices = Object.entries(normalized.appendixSelection).filter(([, included]) => included).map(([kind]) => appendixLabel[kind as keyof typeof appendixLabel]).join(" · ");

  return <article className="authority-print-document authority-contract-document rental-contract-document bg-[#fff] text-[#1c2524]" style={{ "--authority-print-font-size": `${fontSize}pt` } as React.CSSProperties}>
    <header className="rental-document-header"><p className="rental-document-record">Kira sözleşmesi kaydı: {value(contractNo)}</p></header>
    <div className="authority-document-rule" />
    <h2 className="authority-document-title">{kind}</h2>
    <p className="authority-document-meta">Düzenleme Tarihi: <strong>{formatTurkishDate(normalized.startDate)}</strong> · Belge yeri: <strong>{value(normalized.documentPlace)}</strong></p>

    <section className="authority-document-section"><h3>KİRAYA VEREN VE KİRACI BİLGİLERİ</h3><table><tbody>
      <Row firstLabel="Kiraya Veren" firstValue={normalized.ownerName} secondLabel="T.C. Kimlik No / VKN" secondValue={normalized.ownerIdentity} />
      <Row firstLabel="Kiraya Veren Adresi" firstValue={normalized.ownerAddress} secondLabel="Telefon / E-posta" secondValue={joined(normalized.ownerPhone, normalized.ownerEmail)} />
      <Row firstLabel="Kiracı" firstValue={normalized.tenantName} secondLabel="T.C. Kimlik No / VKN" secondValue={normalized.tenantIdentity} />
      <Row firstLabel="Kiracı Adresi" firstValue={normalized.tenantAddress} secondLabel="Telefon / E-posta" secondValue={joined(normalized.tenantPhone, normalized.tenantEmail)} />
      {normalized.useType === "commercial" && <>
        <Row firstLabel="Kiraya Veren KDV Mükellefi" firstValue={statusLabel(normalized.ownerVatRegistered)} secondLabel="Kiracı Vergi Dairesi" secondValue={normalized.tenantTaxOffice} />
        <Row firstLabel="Kiracı Stopaj Mükellefi" firstValue={statusLabel(normalized.tenantWithholdingRegistered)} secondLabel="KDV Durumu" secondValue={normalized.kdvIncluded ? "KDV dâhil" : "KDV hariç"} />
      </>}
    </tbody></table></section>

    <section className="authority-document-section"><h3>TAŞINMAZ, BEDEL VE SÜRE BİLGİLERİ</h3><table><tbody>
      <Row firstLabel="Mahalle / Yerleşim" firstValue={normalized.propertyNeighborhood} secondLabel="Niteliği / Cinsi" secondValue={normalized.propertyType} />
      <Row firstLabel="Taşınmaz Açık Adresi" firstValue={normalized.propertyAddress} secondLabel="DASK Poliçe No" secondValue={normalized.daskPolicyNo} />
      <Row firstLabel="Ada / Parsel" firstValue={normalized.parcelInfo} secondLabel={normalized.useType === "commercial" ? "Bağımsız Bölüm No" : "Kullanım Amacı"} secondValue={normalized.useType === "commercial" ? normalized.independentSectionNo : normalized.usagePurpose} />
      {normalized.useType === "commercial" && <>
        <Row firstLabel="Tapu Kaydındaki Niteliği" firstValue={normalized.propertyType} secondLabel="Faaliyet Konusu" secondValue={normalized.usagePurpose} />
        <Row firstLabel="Yapı Kullanma İzni (İskân)" firstValue={statusLabel(normalized.occupancyPermit)} secondLabel="Kat Mülkiyetine Tabi mi?" secondValue={statusLabel(normalized.condominiumStatus)} />
      </>}
      <Row firstLabel={normalized.useType === "commercial" ? "KDV Durumu" : "İkamet Edecek Kişi"} firstValue={normalized.useType === "commercial" ? (normalized.kdvIncluded ? "KDV dâhil" : "KDV hariç") : normalized.residentsCount} secondLabel={normalized.useType === "commercial" ? "Aylık Net Kira Bedeli" : "Aylık Kira Bedeli"} secondValue={money(summary.monthlyRent)} />
      <Row firstLabel="Depozito" firstValue={money(Number(normalized.deposit.replace(/\./g, "").replace(",", ".")))} secondLabel="İlk Kira Son Ödeme Tarihi" secondValue={`${formatTurkishDate(summary.firstDueDate)} (en geç 5 gün)`} />
      {normalized.useType === "commercial" && (normalized.proratedStartDate || normalized.proratedEndDate || normalized.proratedDays || normalized.proratedAmount) && <FullWidthRow label="Kıst Dönem" text={joined(normalized.proratedStartDate && formatTurkishDate(normalized.proratedStartDate), normalized.proratedEndDate && formatTurkishDate(normalized.proratedEndDate), normalized.proratedDays && `${normalized.proratedDays} gün`, normalized.proratedAmount && `${normalized.proratedAmount} ₺`)} />}
      <Row firstLabel="Sözleşme Süresi" firstValue={`${summary.durationMonths} ay`} secondLabel="Sonraki Ödeme Günü / IBAN" secondValue={`Her ayın ${summary.paymentDay}. günü · ${value(formatIban(normalized.iban))}`} />
      <Row firstLabel="Başlangıç Tarihi" firstValue={formatTurkishDate(normalized.startDate)} secondLabel="Bitiş / Tahliye Uyarısı" secondValue={`${formatTurkishDate(summary.endDate)} / ${formatTurkishDate(summary.noticeDate)}`} />
    </tbody></table></section>

    <section className="authority-document-section"><h3>KİRA SÖZLEŞMESİ TESLİM / DEMİRBAŞ EKİ</h3><table><tbody>
      <Row firstLabel="Elektrik Sayaç No" firstValue={normalized.electricityMeterNo} secondLabel="Su Sayaç No" secondValue={normalized.waterMeterNo} />
      <FullWidthRow label="Doğalgaz Sayaç No" text={normalized.naturalGasMeterNo} />
      <FullWidthRow label="Demirbaşlar ve Teslim Durumu" text={rentalFixtureSummary(normalized)} />
      <FullWidthRow label="Diğer Sayaç / Abonelik Notları" text={normalized.meterNotes} />
      <FullWidthRow label="Sözleşme Paketine Dahil Edilen Ekler" text={selectedAppendices} />
      {normalized.hasGuarantor && <Row firstLabel="Kefil" firstValue={normalized.guarantorName} secondLabel="Kefil TCKN / Azami Tutar" secondValue={[normalized.guarantorIdentity, normalized.guarantorLimit].filter(Boolean).join(" / ")} />}
    </tbody></table></section>

    <section className="authority-document-conditions"><h3>HUSUSİ ŞARTLAR</h3><p className="authority-document-conditions-note">Hususi şartlar kira sözleşmesinin ayrılmaz bir parçasıdır.</p><ol>{conditions.map((condition, index) => <li key={index}>{condition}</li>)}</ol></section>
    <section className={`authority-document-signatures rental-document-signatures rental-party-signature-boxes ${normalized.hasGuarantor ? "rental-with-guarantor" : ""}`}><div className="rental-party-signature-box"><p>KİRAYA VEREN</p><strong>{value(normalized.ownerName)}</strong><span>İmza</span></div><div className="rental-party-signature-box"><p>KİRACI</p><strong>{value(normalized.tenantName)}</strong><span>İmza</span></div>{normalized.hasGuarantor && <div className="rental-party-signature-box"><p>KEFİL</p><strong>{value(normalized.guarantorName)}</strong><span>İmza</span></div>}</section>
    <footer className="rental-advisor-trace">Düzenleme izi · {consultantInitials(normalized.consultantName)} · {formatTurkishDate(normalized.startDate)} · Form: {value(contractNo)}</footer>
  </article>;
}
