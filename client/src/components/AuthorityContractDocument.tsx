import { authorityContractConditions, authorityContractTitle, calculateAuthoritySummary, formatAuthorityCurrency, normalizeAuthorityDetails, type AuthorityContractDetails } from "@/lib/authorityContract";
import React from "react";
import { formatTurkishDate } from "@/lib/turkishDate";

type AuthorityContractDocumentProps = {
  details: AuthorityContractDetails;
  contractNo: string;
  fontSize: string;
};

const value = (text: string) => text.trim() || "................................";
const WEB_AUTHORITY_SEAL_SRC = "/manus-storage/global1881-muhur-seffaf_4acda0e7.png";

export function resolveAuthoritySealSrc(desktopSealSrc?: string) {
  return desktopSealSrc?.startsWith("file:") ? desktopSealSrc : WEB_AUTHORITY_SEAL_SRC;
}

function Row({ firstLabel, firstValue, secondLabel, secondValue }: { firstLabel: string; firstValue: string; secondLabel?: string; secondValue?: string }) {
  return <tr><th scope="row">{firstLabel}</th><td>{value(firstValue)}</td>{secondLabel && <><th scope="row">{secondLabel}</th><td>{value(secondValue ?? "")}</td></>}</tr>;
}

export default function AuthorityContractDocument({ details, contractNo, fontSize }: AuthorityContractDocumentProps) {
  const normalized = normalizeAuthorityDetails(details);
  const summary = calculateAuthoritySummary(normalized);
  const conditions = authorityContractConditions(normalized);
  const isSale = normalized.mode === "sale";
  const [sealFailed, setSealFailed] = React.useState(false);
  const priceLabel = normalized.mode === "sale" ? "Satış Bedeli (Sözleşmeye Esas)" : "Aylık Kira Bedeli (Sözleşmeye Esas)";
  const fullTax = [normalized.officeTaxOffice, normalized.officeTaxNo].filter(Boolean).join(" / ");
  const desktopSealSrc = typeof window === "undefined" ? undefined : (window as Window & { global1881Desktop?: { authoritySealSrc?: string } }).global1881Desktop?.authoritySealSrc;
  const authoritySealSrc = resolveAuthoritySealSrc(desktopSealSrc);

  return (
    <article className="authority-print-document authority-contract-document bg-[#fff] text-[#1c2524]" style={{ "--authority-print-font-size": `${fontSize}pt` } as React.CSSProperties}>
      <header className="authority-document-brand">
        {sealFailed ? <div className="authority-document-seal-fallback" aria-label="Global 1881 mühür"><span>GLOBAL</span><strong>1881</strong><small>MÜHÜR</small></div> : <img className="authority-document-seal-image" src={authoritySealSrc} alt="Global 1881 şeffaf mühür" onError={() => setSealFailed(true)} />}
        <div className="authority-document-office-details"><p className="authority-document-office-name">{value(normalized.officeName)}</p><p>{value(normalized.officeAddress)}</p><p>Tel: {value(normalized.officePhone)} · Yetki Belgesi No: {value(normalized.officeAuthorizationNo)}</p></div>
      </header>
      <div className="authority-document-rule" />
      <h2 className="authority-document-title">{authorityContractTitle(normalized.mode)}</h2>
      <p className="authority-document-meta">Kayıt No: <strong>{contractNo}</strong> · Düzenleme Tarihi: <strong>{formatTurkishDate(normalized.contractDate)}</strong></p>

      <section className="authority-document-section">
        <h3>EMLAK DANIŞMANI BİLGİLERİ</h3>
        <table><tbody>
          <Row firstLabel="Unvanı" firstValue={normalized.officeName} secondLabel="Yetki Belgesi No" secondValue={normalized.officeAuthorizationNo} />
          <Row firstLabel="Vergi Dairesi / VKN" firstValue={fullTax} secondLabel="Ofis" secondValue={normalized.officeName} />
          <Row firstLabel="Adresi" firstValue={normalized.officeAddress} secondLabel="İletişim" secondValue={normalized.officePhone} />
          <Row firstLabel="Portföyü Alan Sorumlu Emlak Danışmanı" firstValue={normalized.consultantName} secondLabel="Danışman İletişim" secondValue={normalized.consultantPhone} />
          <Row firstLabel="Danışman Kodu / Sıfatı" firstValue={[normalized.consultantCode, normalized.consultantTitle].filter(Boolean).join(" / ")} secondLabel="Kayıt No" secondValue={contractNo} />
        </tbody></table>
      </section>

      <section className="authority-document-section">
        <h3>TAŞINMAZ MALİKİ (MÜŞTERİ) BİLGİLERİ</h3>
        <table><tbody>
          <Row firstLabel="Adı Soyadı / Unvanı" firstValue={normalized.ownerName} secondLabel="T.C. Kimlik No / VKN" secondValue={normalized.ownerIdentity} />
          <Row firstLabel="Adresi" firstValue={normalized.ownerAddress} secondLabel="Telefon" secondValue={normalized.ownerPhone} />
        </tbody></table>
      </section>

      <section className="authority-document-section">
        <h3>TAŞINMAZ VE YETKİ BİLGİLERİ</h3>
        <table><tbody>
          <Row firstLabel="Mahalle / Yerleşim" firstValue={normalized.propertyNeighborhood} secondLabel="Taşınmazın Açık Adresi" secondValue={normalized.propertyAddress} />
          <Row firstLabel="Ada / Parsel / Bağımsız Bölüm" firstValue={normalized.parcelInfo} secondLabel="Niteliği / Cinsi" secondValue={normalized.propertyType} />
          <Row firstLabel="Brüt / Net m²" firstValue={normalized.grossM2} secondLabel="Oda Sayısı" secondValue={normalized.roomCount} />
          <Row firstLabel="Kat / Cephe / Manzara" firstValue={normalized.floorAndView} secondLabel="Kullanım Durumu" secondValue={normalized.condition} />
          <Row firstLabel="Yetki Süresi" firstValue={`${normalized.authorityDurationMonths} ay`} />
          {isSale ? <Row firstLabel={priceLabel} firstValue={summary.contractAmount ? formatAuthorityCurrency(summary.contractAmount, normalized.currency) : normalized.price} secondLabel="Hizmet Bedeli" secondValue={summary.serviceFeeAmount ? formatAuthorityCurrency(summary.serviceFeeAmount, normalized.currency) : ""} /> : <Row firstLabel={priceLabel} firstValue={summary.contractAmount ? formatAuthorityCurrency(summary.contractAmount, normalized.currency) : normalized.price} />}
        </tbody></table>
      </section>

      <section className="authority-document-conditions">
        <h3>SÖZLEŞME KOŞULLARI</h3>
        <ol>{conditions.map((condition, index) => <li key={index}>{condition}</li>)}</ol>
      </section>

      <section className="authority-document-signatures authority-party-signature-boxes">
        <div className="authority-party-signature-box"><p>TAŞINMAZ MALİKİ</p><strong>{value(normalized.ownerName)}</strong><span>İmza</span></div>
        <div className="authority-party-signature-box"><p>YETKİ ALAN EMLAK OFİSİ / DANIŞMAN</p><strong>{value(normalized.officeName)}</strong><small>Yetkili danışman: {value(normalized.consultantName)}</small><span>Kaşe / İmza</span></div>
      </section>
    </article>
  );
}
