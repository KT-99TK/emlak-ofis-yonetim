import React from "react";
import { formatContractFormDate, getSaleClosingArticleNumbering, SALE_CLOSING_APPROVED_ARTICLE_COUNT } from "@/../../shared/contractForms";
import { resolveAuthoritySealSrc } from "@/components/AuthorityContractDocument";

type SaleClosingClause = {
  id: number;
  title: string;
  bodyTemplate: string;
  articleNumber?: number | null;
  requesterFootnote?: string;
};

type SaleClosingContractDocumentProps = {
  fieldValues: Record<string, unknown>;
  contractNo: string;
  fontSize: string;
  clauses?: SaleClosingClause[];
  officeName?: string;
  officeAuthorizationNo?: string;
  officePhone?: string;
  officeAddress?: string;
};

const value = (raw: unknown) => {
  const text = String(raw ?? "").trim();
  return text || "................................";
};

const field = (fieldValues: Record<string, unknown>, key: string) => formatContractFormDate(key, fieldValues[key]);

function Row({ firstLabel, firstValue, secondLabel, secondValue }: { firstLabel: string; firstValue: string; secondLabel?: string; secondValue?: string }) {
  return <tr><th scope="row">{firstLabel}</th><td>{value(firstValue)}</td>{secondLabel && <><th scope="row">{secondLabel}</th><td>{value(secondValue ?? "")}</td></>}</tr>;
}

/**
 * ÖNEMLİ — HENÜZ TAMAMLANMADI:
 * Bu 16 maddenin nihai, onaylı hukuki metni bu depoda hiçbir yerde saklı değil;
 * todo.md içinde yalnızca hangi kararın verildiğine dair özet notlar var (örn.
 * "Madde 11: vazgeçen taraf %4+KDV komisyon öder"). Buraya o özetlerden metin
 * uydurulmadı — gerçek sözleşme metni olduğu için tahmini/parafraze metin
 * yazmak risklidir. Kazım Bey'den (veya Manus'un önceki onaylı çıktısından)
 * asıl 16 maddenin tam metnini alıp bu diziye SIRAYLA yapıştırın; sıra ve
 * numaralandırma (Madde 1–16) todo.md'deki kararlarla birebir örtüşüyor
 * olmalı — özellikle Madde 10 (komisyon paylaşımı) ve Madde 11 (cayma bedeli).
 */
const SALE_CLOSING_ARTICLE_PLACEHOLDERS: string[] = Array.from(
  { length: SALE_CLOSING_APPROVED_ARTICLE_COUNT },
  (_, index) => `[Madde ${index + 1} — onaylı sözleşme metni buraya eklenecek]`,
);

export default function SaleClosingContractDocument({
  fieldValues,
  contractNo,
  fontSize,
  clauses = [],
  officeName = "Global 1881 Gayrimenkul",
  officeAuthorizationNo = "3500211",
  officePhone = "+90 534 975 05 82",
  officeAddress = "HACI İSA MAHALLESİ 75. YIL CUMHURİYET CADDESİ NO:5/38 URLA",
}: SaleClosingContractDocumentProps) {
  const [sealFailed, setSealFailed] = React.useState(false);
  const desktopSealSrc = typeof window === "undefined" ? undefined : (window as Window & { global1881Desktop?: { authoritySealSrc?: string } }).global1881Desktop?.authoritySealSrc;
  const sealSrc = resolveAuthoritySealSrc(desktopSealSrc);

  const activeClauses = clauses.filter((clause) => clause.bodyTemplate.trim().length > 0);
  const numbering = getSaleClosingArticleNumbering(activeClauses.length);
  const hasOptionalClauses = activeClauses.length > 0;

  return (
    <article className="authority-print-document authority-contract-document bg-[#fff] text-[#1c2524]" style={{ "--authority-print-font-size": `${fontSize}pt` } as React.CSSProperties}>
      <header className="authority-document-brand">
        {sealFailed ? <div className="authority-document-seal-fallback" aria-label="Global 1881 mühür"><span>GLOBAL</span><strong>1881</strong><small>MÜHÜR</small></div> : <img className="authority-document-seal-image" src={sealSrc} alt="Global 1881 şeffaf mühür" onError={() => setSealFailed(true)} />}
        <div className="authority-document-office-details"><p className="authority-document-office-name">{value(officeName)}</p><p>{value(officeAddress)}</p><p>Tel: {value(officePhone)} · Yetki Belgesi No: {value(officeAuthorizationNo)}</p></div>
      </header>
      <div className="authority-document-rule" />
      <h2 className="authority-document-title">ALIM-SATIM ÖN PROTOKOLÜ</h2>
      <p className="authority-document-meta">Kayıt No: <strong>{contractNo}</strong> · Düzenleme Tarihi: <strong>{field(fieldValues, "contractDate") || "................"}</strong></p>

      <section className="authority-document-section">
        <h3>TARAFLAR</h3>
        <table><tbody>
          <Row firstLabel="Satıcı" firstValue={String(fieldValues.sellerName ?? "")} />
          <Row firstLabel="Alıcı" firstValue={String(fieldValues.buyerName ?? "")} />
        </tbody></table>
      </section>

      <section className="authority-document-section">
        <h3>TAŞINMAZ VE BEDEL BİLGİLERİ</h3>
        <table><tbody>
          <Row firstLabel="Taşınmaz Adresi" firstValue={String(fieldValues.propertyAddress ?? "")} />
          <Row firstLabel="Tapu ve Bağımsız Bölüm Bilgileri" firstValue={String(fieldValues.titleDeedInfo ?? "")} />
          <Row firstLabel="Satış Bedeli" firstValue={String(fieldValues.salePrice ?? "")} secondLabel="Son Tapu Devir Tarihi" secondValue={field(fieldValues, "finalDeedTransferDate")} />
          <Row firstLabel="Kapora Tutarı" firstValue={String(fieldValues.reservationAmount ?? "")} secondLabel="Kapora Ödeme Şekli" secondValue={String(fieldValues.reservationPaymentMethod ?? "")} />
          {String(fieldValues.reservationPaymentMethod ?? "").startsWith("Nakit") && (
            <Row firstLabel="Kapora Transfer Tarihi" firstValue={field(fieldValues, "reservationTransferDate")} secondLabel="Nakit Teslim Belge No" secondValue={String(fieldValues.reservationCashReceiptNo ?? "")} />
          )}
          <Row firstLabel="Cayma Bedeli" firstValue={String(fieldValues.agreedWithdrawalFee ?? "")} />
        </tbody></table>
      </section>

      <section className="authority-document-conditions">
        <h3>SÖZLEŞME MADDELERİ</h3>
        <ol>
          {SALE_CLOSING_ARTICLE_PLACEHOLDERS.map((placeholder, index) => (
            <li key={`fixed-${index}`}>{placeholder}</li>
          ))}
          {hasOptionalClauses && activeClauses.map((clause, index) => (
            <li key={`optional-${clause.id}`}>
              <strong>{clause.title}</strong> — {clause.bodyTemplate}
              {clause.requesterFootnote && <><br /><em>{clause.requesterFootnote}</em></>}
            </li>
          ))}
          <li key="jurisdiction">
            Uyuşmazlık hâlinde {numbering.jurisdictionArticleTitle} yetkilidir.
          </li>
        </ol>
        {!hasOptionalClauses && (
          <p className="authority-document-meta" style={{ marginTop: "2mm" }}>
            (Taraflarca kabul edilmiş isteğe bağlı ek madde bulunmadığından bu başlık ve
            ilgili madde numaraları çıktıda yer almaz; numaralandırma doğrudan Madde{" "}
            {SALE_CLOSING_APPROVED_ARTICLE_COUNT + 1}'e — yetkili mahkeme maddesine — geçer.)
          </p>
        )}
      </section>

      <section className="authority-document-signatures authority-party-signature-boxes">
        <div className="authority-party-signature-box"><p>SATICI</p><strong>{value(fieldValues.sellerName)}</strong><span>İmza</span></div>
        <div className="authority-party-signature-box"><p>ALICI</p><strong>{value(fieldValues.buyerName)}</strong><span>İmza</span></div>
        <div className="authority-party-signature-box"><p>ARACI EMLAK OFİSİ</p><strong>{value(officeName)}</strong><span>Kaşe / İmza</span></div>
      </section>
    </article>
  );
}
