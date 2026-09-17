import React from "react";
import {
  buildBonoLines,
  buildConsultancyServiceArticles,
  buildTemlikArticles,
  normalizeConsultancyAssignmentDetails,
  type ConsultancyAssignmentDetails,
} from "@/lib/consultancyAssignmentContract";
import { resolveAuthoritySealSrc } from "@/components/AuthorityContractDocument";

export type ConsultancyDocumentKind = "service" | "bono" | "temlik";

type Props = {
  kind: ConsultancyDocumentKind;
  details: ConsultancyAssignmentDetails;
  contractNo: string;
  fontSize: string;
  officeName?: string;
  officeAuthorizationNo?: string;
  officePhone?: string;
  officeAddress?: string;
};

const value = (text: string) => text.trim() || "................................";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <tr><th scope="row">{label}</th><td>{children}</td></tr>;
}

function annexPrefix(label: string) {
  return label.trim() ? `${label.trim().toLocaleUpperCase("tr-TR")} — ` : "";
}

export default function ConsultancyAssignmentDocument({
  kind,
  details,
  contractNo,
  fontSize,
  officeName = "Global 1881 Gayrimenkul",
  officeAuthorizationNo = "3500211",
  officePhone = "+90 534 975 05 82",
  officeAddress = "HACI İSA MAHALLESİ 75. YIL CUMHURİYET CADDESİ NO:5/38 URLA",
}: Props) {
  const [sealFailed, setSealFailed] = React.useState(false);
  const desktopSealSrc = typeof window === "undefined" ? undefined : (window as Window & { global1881Desktop?: { authoritySealSrc?: string } }).global1881Desktop?.authoritySealSrc;
  const sealSrc = resolveAuthoritySealSrc(desktopSealSrc);
  const normalized = normalizeConsultancyAssignmentDetails(details);

  const title = kind === "service"
    ? "KAT KARŞILIĞI DANIŞMANLIK HİZMET SÖZLEŞMESİ"
    : kind === "bono"
      ? `${annexPrefix(normalized.bonoAnnexLabel)}BONO DÜZENLEME ESASLARI VE ÖRNEĞİ`
      : `${annexPrefix(normalized.temlikAnnexLabel)}ALACAĞIN TEMLİKİ SÖZLEŞMESİ`;

  return (
    <article className="authority-print-document authority-contract-document bg-[#fff] text-[#1c2524]" style={{ "--authority-print-font-size": `${fontSize}pt` } as React.CSSProperties}>
      <header className="authority-document-brand">
        {sealFailed ? <div className="authority-document-seal-fallback" aria-label="Global 1881 mühür"><span>GLOBAL</span><strong>1881</strong><small>MÜHÜR</small></div> : <img className="authority-document-seal-image" src={sealSrc} alt="Global 1881 şeffaf mühür" onError={() => setSealFailed(true)} />}
        <div className="authority-document-office-details"><p className="authority-document-office-name">{value(officeName)}</p><p>{value(officeAddress)}</p><p>Tel: {value(officePhone)} · Yetki Belgesi No: {value(officeAuthorizationNo)}</p></div>
      </header>
      <div className="authority-document-rule" />
      <h2 className="authority-document-title">{title}</h2>
      <p className="authority-document-meta">
        Kayıt No: <strong>{contractNo}</strong> · Düzenleme Tarihi: <strong>{value(normalized.contractDate)}</strong> · Düzenleme Yeri: <strong>{value(normalized.signPlace)}</strong>
        {kind !== "service" && <> · Bağlı olduğu sözleşme: <strong>{value(normalized.projectName)} Danışmanlık Hizmet Sözleşmesi</strong></>}
      </p>

      {kind === "service" && (
        <>
          <section className="authority-document-section">
            <h3>TARAFLAR</h3>
            <table><tbody>
              <Row label="İş Sahibi (Yüklenici)">{value(normalized.jobOwnerName)}</Row>
              <Row label="Danışman (Simsar)">{value(normalized.consultantName)}</Row>
            </tbody></table>
          </section>
          <section className="authority-document-conditions">
            <h3>SÖZLEŞME MADDELERİ</h3>
            <ol>
              {buildConsultancyServiceArticles(normalized).map((article, index) => (
                <li key={index}><strong>{article.title}</strong><br />{article.body.split("\n").map((line, lineIndex) => <React.Fragment key={lineIndex}>{lineIndex > 0 && <br />}{line}</React.Fragment>)}</li>
              ))}
            </ol>
          </section>
          <section className="authority-document-signatures authority-party-signature-boxes">
            <div className="authority-party-signature-box"><p>İŞ SAHİBİ (YÜKLENİCİ)</p><strong>{value(normalized.jobOwnerName)}</strong><span>Kaşe ve İmza</span></div>
            <div className="authority-party-signature-box"><p>DANIŞMAN (SİMSAR)</p><strong>{value(normalized.consultantName)}</strong><span>İmza</span></div>
          </section>
        </>
      )}

      {kind === "bono" && (
        <>
          <p className="authority-document-meta">Bu ek, Danışmanlık Hizmet Sözleşmesinin 4.1. maddesinin ekidir. Bono, aşağıdaki bilgilerle Türk Ticaret Kanunu m. 776 hükümlerine tam uygun şekilde matbu bono kağıdına doldurularak ayrıca imzalanır; bu unsurlardan biri eksik kalırsa senet kambiyo senedi niteliğini kaybedebilir.</p>
          <section className="authority-document-section">
            <h3>BONODA YER ALACAK ZORUNLU BİLGİLER</h3>
            <table><tbody>
              <Row label={`Senet metninde "BONO" ibaresi`}>Türkçe olarak, senet diline uygun</Row>
              {buildBonoLines(normalized).map((line) => <Row key={line.label} label={line.label}>{line.text}</Row>)}
            </tbody></table>
          </section>
          <section className="authority-document-conditions">
            <h3>TESLİM VE İADE</h3>
            <ol>
              <li>Bono, Danışmanlık Hizmet Sözleşmesinin imzalandığı gün İş Sahibi tarafından Danışmana teslim edilir. Bağımsız Bölümün Danışman adına tescili ve teslimi ile (sözleşme madde 3.3 ve 6.3) Danışman, aynı gün bonoyu aslını iade eder ve iadeyi yazılı olarak teyit eder.</li>
              <li>Bono, devir tamamlanıncaya kadar Danışman tarafından üçüncü kişilere {normalized.bonoCiroRule === "free" ? "serbestçe ciro edilebilir" : "ciro edilmez/devredilmez"}.</li>
            </ol>
          </section>
          <section className="authority-document-signatures authority-party-signature-boxes">
            <div className="authority-party-signature-box"><p>İŞ SAHİBİ (KEŞİDECİ)</p><strong>{value(normalized.jobOwnerName)}</strong><span>Kaşe ve İmza</span></div>
            <div className="authority-party-signature-box"><p>DANIŞMAN (LEHTAR)</p><strong>{value(normalized.consultantName)}</strong><span>İmza</span></div>
          </section>
        </>
      )}

      {kind === "temlik" && (
        <>
          <p className="authority-document-meta">{value(normalized.contractDate)} tarihli {value(normalized.projectName)} Danışmanlık Hizmet Sözleşmesinin 4.2. maddesinin ekidir ve o sözleşmenin ayrılmaz parçasıdır.</p>
          <section className="authority-document-conditions">
            <ol>
              {buildTemlikArticles(normalized).map((article, index) => (
                <li key={index}><strong>{article.title}</strong><br />{article.body}</li>
              ))}
            </ol>
          </section>
          <section className="authority-document-signatures authority-party-signature-boxes">
            <div className="authority-party-signature-box"><p>TEMLİK EDEN (İŞ SAHİBİ)</p><strong>{value(normalized.jobOwnerName)}</strong><span>Kaşe ve İmza</span></div>
            <div className="authority-party-signature-box"><p>TEMLİK ALAN (DANIŞMAN)</p><strong>{value(normalized.consultantName)}</strong><span>İmza</span></div>
          </section>
        </>
      )}
    </article>
  );
}
