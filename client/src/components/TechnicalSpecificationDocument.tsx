import React from "react";
import { TECHNICAL_MATERIAL_FIELDS, TECHNICAL_SPECIFICATION_DEFAULT_TEXT_BY_FIELD_KEY } from "@/../../shared/contractForms";
import { resolveAuthoritySealSrc } from "@/components/AuthorityContractDocument";

type TechnicalSpecificationDocumentProps = {
  fieldValues: Record<string, unknown>;
  contractNo: string;
  fontSize: string;
  officeName?: string;
  officeAuthorizationNo?: string;
  officePhone?: string;
  officeAddress?: string;
};

const value = (raw: unknown) => {
  const text = String(raw ?? "").trim();
  return text || "................................";
};

/**
 * Her satırı ayrı basar; "- " ile başlayan satırlar madde içi alt madde (bullet) olarak, diğerleri
 * paragraf olarak gösterilir. Hem `TECHNICAL_SPECIFICATION_DEFAULT_TEXT_BY_FIELD_KEY`'deki silüet
 * metin hem de danışmanın üzerine yazdığı serbest metin bu biçimde gösterilebilir.
 */
function ClauseBody({ bodyTemplate }: { bodyTemplate: string }) {
  const lines = bodyTemplate.split("\n");
  const nodes: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  const flushBullets = (key: string) => {
    if (bulletBuffer.length === 0) return;
    nodes.push(
      <ul key={key} style={{ margin: "1mm 0", paddingLeft: "5mm" }}>
        {bulletBuffer.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    );
    bulletBuffer = [];
  };
  lines.forEach((line, index) => {
    if (line.startsWith("- ")) {
      bulletBuffer.push(line.slice(2));
      return;
    }
    flushBullets(`ul-${index}`);
    nodes.push(<p key={`p-${index}`} style={{ margin: "1mm 0" }}>{line}</p>);
  });
  flushBullets("ul-end");
  return <>{nodes}</>;
}

/**
 * EK-1 — Teknik Şartname (Kat Karşılığı İnşaat Sözleşmesi'nin eki). 30 madde, `shared/contractForms.ts`'teki
 * `TECHNICAL_MATERIAL_FIELDS` (fieldKey: technical_madde1..30) üzerinden aynı `fieldValues` nesnesiyle
 * `LandShareContractDocument`'la paylaşılır. Her madde için danışman bir değer girmediyse, notere
 * verilecek nihai metin (`TECHNICAL_SPECIFICATION_DEFAULT_TEXT_BY_FIELD_KEY`) "silüet" olarak aynen
 * basılır; danışman değeri değiştirirse çıktıda onun girdiği metin kullanılır. Silüet metin sözleşmenin
 * mutabık kalınmış hâlidir — boş bırakmak, o maddenin değişmediği/aynen geçerli olduğu anlamına gelir.
 */
export default function TechnicalSpecificationDocument({
  fieldValues,
  contractNo,
  fontSize,
  officeName = "Global 1881 Gayrimenkul",
  officeAuthorizationNo = "3500211",
  officePhone = "0534 975 05 82",
  officeAddress = "HACI İSA MAHALLESİ 75. YIL CUMHURİYET CADDESİ NO:5/38 URLA",
}: TechnicalSpecificationDocumentProps) {
  const [sealFailed, setSealFailed] = React.useState(false);
  const desktopSealSrc = typeof window === "undefined" ? undefined : (window as Window & { global1881Desktop?: { authoritySealSrc?: string } }).global1881Desktop?.authoritySealSrc;
  const sealSrc = resolveAuthoritySealSrc(desktopSealSrc);

  return (
    <article className="authority-print-document authority-contract-document bg-[#fff] text-[#1c2524]" style={{ "--authority-print-font-size": `${fontSize}pt` } as React.CSSProperties}>
      <header className="authority-document-brand">
        {sealFailed ? <div className="authority-document-seal-fallback" aria-label="Global 1881 mühür"><span>GLOBAL</span><strong>1881</strong><small>MÜHÜR</small></div> : <img className="authority-document-seal-image" src={sealSrc} alt="Global 1881 şeffaf mühür" onError={() => setSealFailed(true)} />}
        <div className="authority-document-office-details"><p className="authority-document-office-name">{value(officeName) || officeName}</p><p>{value(officeAddress) || officeAddress}</p><p>Tel: {value(officePhone) || officePhone} · Yetki Belgesi No: {value(officeAuthorizationNo) || officeAuthorizationNo}</p></div>
      </header>
      <div className="authority-document-rule" />
      <h2 className="authority-document-title">EK-1 — TEKNİK ŞARTNAME</h2>
      <p className="authority-document-meta">
        Kayıt No: <strong>{contractNo}</strong> · Proje: <strong>{value(fieldValues.projectNameAndLogo)}</strong> · Bağlı olduğu sözleşme: <strong>Kat Karşılığı İnşaat Sözleşmesi</strong>
      </p>
      <p className="authority-document-meta">
        Bu belge, Kat Karşılığı İnşaat Sözleşmesi'nin ayrılmaz eki olan Teknik Şartname'dir; sözleşme ile bu ek arasında çelişki hâlinde sözleşme hükümleri esas alınır. Aşağıdaki maddelerden değeri elle
        girilmemiş olanlar, notere verilecek nihai metni (silüet) aynen taşır; danışman tarafından değiştirilen maddelerde ise girilen metin esas alınır.
      </p>

      <section className="authority-document-conditions">
        {TECHNICAL_MATERIAL_FIELDS.map((field, index) => {
          const entered = String(fieldValues[field.fieldKey] ?? "").trim();
          const body = entered || TECHNICAL_SPECIFICATION_DEFAULT_TEXT_BY_FIELD_KEY[field.fieldKey] || "";
          return (
            <div key={field.fieldKey} style={{ marginBottom: "2.4mm" }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{index + 1}. {field.label}</p>
              <ClauseBody bodyTemplate={body} />
            </div>
          );
        })}
      </section>

      <section className="authority-document-signatures authority-party-signature-boxes">
        <div className="authority-party-signature-box"><p>ARSA SAHİBİ / SAHİPLERİ (VEKİLİ)</p><strong>{value(fieldValues.landownerRepresentativeName) || value(fieldValues.landownerName)}</strong><span>Kaşe ve İmza</span></div>
        <div className="authority-party-signature-box"><p>YÜKLENİCİ</p><strong>{value(fieldValues.contractorName)}</strong><span>Kaşe ve İmza</span></div>
      </section>
    </article>
  );
}
