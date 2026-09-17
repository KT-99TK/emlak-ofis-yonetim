import React from "react";
import { formatContractFormDate, getDefaultFormFields } from "@/../../shared/contractForms";
import { resolveAuthoritySealSrc } from "@/components/AuthorityContractDocument";

type LandShareClause = {
  id: number;
  title: string;
  bodyTemplate: string;
  articleNumber?: number | null;
};

type LandShareContractDocumentProps = {
  fieldValues: Record<string, unknown>;
  contractNo: string;
  fontSize: string;
  clauses?: LandShareClause[];
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

const LAND_SHARE_FIELD_TYPES: Map<string, string> = new Map(getDefaultFormFields("land_share").map((f) => [f.fieldKey as string, f.fieldType as string]));

/**
 * `shared/landShareFixedClauses.ts`'teki {{fieldKey}} token'larını, alan tipine göre biçimlendirerek
 * çözer. Boş alanlar sale_closing/authority belgelerindeki gibi noktalı boşlukla ("................")
 * gösterilir; bu sayede madde metninin ortasında çıplak boşluk kalmaz. Tarih alanları
 * `formatContractFormDate` ile GG.AA.YYYY'ye, para alanları Türkçe binlik ayraçla biçimlendirilir.
 */
function resolveLandShareClauseText(bodyTemplate: string, fieldValues: Record<string, unknown>) {
  return bodyTemplate.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_match, key: string) => {
    const formatted = formatContractFormDate(key, fieldValues[key]);
    const text = String(formatted ?? "").trim();
    if (!text) return "................................";
    if (LAND_SHARE_FIELD_TYPES.get(key) === "currency") {
      const digits = text.replace(/\D/g, "");
      return digits ? new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Number(digits)) : text;
    }
    return text;
  });
}

/**
 * Kat Karşılığı (Arsa Payı Karşılığı İnşaat ve Gayrimenkul Satış Vaadi) Sözleşmesi — A4 yazdırma
 * belgesi. Hukuki metin, kullanıcının paylaştığı mutabık taslağa (`LAND_SHARE_FIXED_CLAUSES`) dayanır
 * ve değiştirilmedi; yalnızca değişken kısımlar (taraf bilgileri, süreler, bedeller) alan haline
 * getirildi (`parameterizeLandShareClauseBody`). 21 madde sabit sırada, isteğe bağlı madde eklemesi
 * yoktur — bu yüzden Satış Ön Protokolü'ndeki gibi dinamik madde numaralandırmasına gerek yoktur;
 * madde numarası doğrudan `clauses` dizisindeki sıraya (1'den başlayarak) karşılık gelir.
 */
export default function LandShareContractDocument({
  fieldValues,
  contractNo,
  fontSize,
  clauses = [],
  officeName = "Global 1881 Gayrimenkul",
  officeAuthorizationNo = "3500211",
  officePhone = "0534 975 05 82",
  officeAddress = "HACI İSA MAHALLESİ 75. YIL CUMHURİYET CADDESİ NO:5/38 URLA",
}: LandShareContractDocumentProps) {
  const [sealFailed, setSealFailed] = React.useState(false);
  const desktopSealSrc = typeof window === "undefined" ? undefined : (window as Window & { global1881Desktop?: { authoritySealSrc?: string } }).global1881Desktop?.authoritySealSrc;
  const sealSrc = resolveAuthoritySealSrc(desktopSealSrc);

  const orderedClauses = [...clauses].sort((a, b) => a.id - b.id);

  return (
    <article className="authority-print-document authority-contract-document bg-[#fff] text-[#1c2524]" style={{ "--authority-print-font-size": `${fontSize}pt` } as React.CSSProperties}>
      <header className="authority-document-brand">
        {sealFailed ? <div className="authority-document-seal-fallback" aria-label="Global 1881 mühür"><span>GLOBAL</span><strong>1881</strong><small>MÜHÜR</small></div> : <img className="authority-document-seal-image" src={sealSrc} alt="Global 1881 şeffaf mühür" onError={() => setSealFailed(true)} />}
        <div className="authority-document-office-details"><p className="authority-document-office-name">{value(officeName)}</p><p>{value(officeAddress)}</p><p>Tel: {value(officePhone)} · Yetki Belgesi No: {value(officeAuthorizationNo)}</p></div>
      </header>
      <div className="authority-document-rule" />
      <h2 className="authority-document-title">ARSA PAYI KARŞILIĞI İNŞAAT VE GAYRİMENKUL SATIŞ VAADİ SÖZLEŞMESİ</h2>
      <p className="authority-document-meta">
        Kayıt No: <strong>{contractNo}</strong> · Düzenleme Tarihi: <strong>{field(fieldValues, "contractDate") || "................"}</strong> · Düzenleme Yeri: <strong>{value(fieldValues.executionPlace)}</strong>
      </p>

      <section className="authority-document-section">
        <h3>TARAFLAR</h3>
        <table><tbody>
          <Row firstLabel="Arsa Sahibi/Sahipleri" firstValue={String(fieldValues.landownerName ?? "")} secondLabel="Vekili" secondValue={String(fieldValues.landownerRepresentativeName ?? "")} />
          <Row firstLabel="Vekâletname Bilgisi" firstValue={String(fieldValues.powerOfAttorneyReference ?? "")} />
          <Row firstLabel="Yüklenici" firstValue={String(fieldValues.contractorName ?? "")} secondLabel="Temsilcisi" secondValue={String(fieldValues.contractorRepresentativeName ?? "")} />
        </tbody></table>
      </section>

      <section className="authority-document-section">
        <h3>TAŞINMAZ VE PROJE BİLGİLERİ</h3>
        <table><tbody>
          <Row firstLabel="İl / İlçe / Mahalle" firstValue={`${value(fieldValues.propertyProvince)} / ${value(fieldValues.propertyDistrict)} / ${value(fieldValues.propertyNeighborhood)}`} />
          <Row firstLabel="Pafta, Ada, Parsel" firstValue={String(fieldValues.titleDeedParcelDetails ?? "")} />
          <Row firstLabel="Proje Adı" firstValue={String(fieldValues.projectNameAndLogo ?? "")} secondLabel="Daire/Villa Adetleri" secondValue={String(fieldValues.apartmentAndVillaCounts ?? "")} />
          <Row firstLabel="Paylaşım Oranı" firstValue={String(fieldValues.landShareRatio ?? "")} secondLabel="Toplam Bağımsız Bölüm" secondValue={String(fieldValues.totalIndependentSections ?? "")} />
        </tbody></table>
      </section>

      <section className="authority-document-conditions">
        <h3>SÖZLEŞME MADDELERİ</h3>
        <ol>
          {orderedClauses.map((clause, index) => (
            <li key={clause.id}>
              <strong>Madde {clause.articleNumber ?? index + 1} — {clause.title.replace(/:$/, "")}</strong>
              <br />
              {resolveLandShareClauseText(clause.bodyTemplate, fieldValues).split("\n").map((line, lineIndex) => (
                <React.Fragment key={lineIndex}>{lineIndex > 0 && <br />}{line}</React.Fragment>
              ))}
            </li>
          ))}
        </ol>
      </section>

      <section className="authority-document-signatures authority-party-signature-boxes">
        <div className="authority-party-signature-box"><p>ARSA SAHİBİ / SAHİPLERİ (VEKİLİ)</p><strong>{value(fieldValues.landownerRepresentativeName || fieldValues.landownerName)}</strong><span>Kaşe ve İmza</span></div>
        <div className="authority-party-signature-box"><p>YÜKLENİCİ</p><strong>{value(fieldValues.contractorName)}</strong><small>{value(String(fieldValues.contractorRepresentativeName ?? ""))}</small><span>Kaşe ve İmza</span></div>
      </section>
    </article>
  );
}
