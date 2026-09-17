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

/**
 * Doldurulmuş örnek bono görseli. Belirli bir matbu senet kağıdının (marka/kırtasiye) birebir
 * kopyası DEĞİLDİR — TTK m. 776'daki zorunlu unsurların gerçek bir bonoda nerede ve nasıl
 * göründüğünü göstermek amacıyla çizilmiş, tamamen kurgusal isim ve tutarlarla doldurulmuş bir
 * şema/örnektir. Danışmanların "bono nasıl doldurulur" sorusuyla karşılaşmaması için açıklama
 * metninin hemen altına, zorunlu bilgiler tablosundan önce yerleştirilir.
 */
function BonoSampleFacsimile() {
  return (
    <figure className="authority-document-section" style={{ margin: "3mm 0" }}>
      <svg viewBox="0 0 720 300" role="img" aria-label="Doldurulmuş örnek bono görseli" style={{ width: "100%", maxWidth: "640px", height: "auto", display: "block", margin: "0 auto" }}>
        <rect x="4" y="4" width="712" height="292" fill="#fffdf6" stroke="#7c6a3f" strokeWidth="2" />
        <rect x="14" y="14" width="692" height="272" fill="none" stroke="#c9b989" strokeWidth="1" />
        {/* Watermark: bunun gerçek bir kıymetli evrak olmadığını açıkça belirtir */}
        <text x="360" y="165" textAnchor="middle" fontSize="46" fill="#c9b989" opacity="0.45" transform="rotate(-18 360 165)" fontFamily="Georgia, serif" fontWeight="bold">ÖRNEK — NUMUNE</text>

        <text x="30" y="42" fontSize="12" fill="#3a3226" fontFamily="Georgia, serif">No: 000000</text>
        <text x="690" y="42" textAnchor="end" fontSize="12" fill="#3a3226" fontFamily="Georgia, serif">Vade Tarihi: 01.06.2027</text>
        <text x="360" y="40" textAnchor="middle" fontSize="20" fontWeight="bold" letterSpacing="2" fill="#3a3226" fontFamily="Georgia, serif">BONO</text>

        <line x1="30" y1="54" x2="690" y2="54" stroke="#c9b989" strokeWidth="1" />

        <text x="30" y="80" fontSize="12.5" fill="#2a2418" fontFamily="Georgia, serif">
          Bu bonoya karşılık, bu bononun tarafı olarak, işbu bono karşılığında aşağıda yazılı bedeli, bu bononun
        </text>
        <text x="30" y="100" fontSize="12.5" fill="#2a2418" fontFamily="Georgia, serif">
          hamiline / emrine, kayıtsız ve şartsız olarak ödeyeceğimi taahhüt ederim.
        </text>

        <rect x="30" y="118" width="330" height="44" fill="#fbf7ea" stroke="#c9b989" />
        <text x="38" y="132" fontSize="10" fill="#6b5c37" fontFamily="Arial, sans-serif">BEDELİ (rakamla)</text>
        <text x="38" y="150" fontSize="13" fontWeight="bold" fill="#1c2524" fontFamily="Arial, sans-serif">500.000,00 TL</text>

        <rect x="368" y="118" width="322" height="44" fill="#fbf7ea" stroke="#c9b989" />
        <text x="376" y="132" fontSize="10" fill="#6b5c37" fontFamily="Arial, sans-serif">YAZIYLA</text>
        <text x="376" y="150" fontSize="12" fontWeight="bold" fill="#1c2524" fontFamily="Arial, sans-serif">Beşyüzbin Türk Lirası</text>

        <text x="30" y="182" fontSize="11" fill="#2a2418" fontFamily="Arial, sans-serif">Lehtar (kime/kimin emrine ödenecek): <tspan fontWeight="bold">Ahmet ÖRNEK</tspan></text>
        <text x="30" y="200" fontSize="11" fill="#2a2418" fontFamily="Arial, sans-serif">Ödeme yeri: <tspan fontWeight="bold">İzmir</tspan></text>
        <text x="30" y="218" fontSize="11" fill="#2a2418" fontFamily="Arial, sans-serif">Düzenleme yeri ve tarihi: <tspan fontWeight="bold">Urla, 17.09.2026</tspan></text>

        <line x1="430" y1="252" x2="690" y2="252" stroke="#3a3226" strokeWidth="1" />
        <text x="430" y="268" fontSize="10.5" fill="#2a2418" fontFamily="Arial, sans-serif">Keşideci (düzenleyen) adı, unvanı ve imzası</text>
        <text x="430" y="246" fontSize="12" fontStyle="italic" fill="#1c2524" fontFamily="Georgia, serif">Örnek Yapı A.Ş. — (kaşe/imza)</text>
      </svg>
      <figcaption className="authority-document-meta" style={{ textAlign: "center", marginTop: "1.5mm" }}>
        Yukarıdaki görsel yalnızca örnek amaçlıdır; gerçek bir kıymetli evrak değildir ve isim/tutarlar
        kurgusaldır. Gerçek bono, matbu senet kağıdına bu düzene benzer şekilde, aşağıdaki zorunlu
        bilgilerle eksiksiz doldurulup ıslak imza ile düzenlenir.
      </figcaption>
    </figure>
  );
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
          <p className="authority-document-meta" style={{ fontWeight: 600 }}>ÖNEMLİ: Bu bono, yalnızca yukarıda belirtilen Danışmanlık Hizmet Sözleşmesinin ilgili maddesinde açıkça atıf yapılıp bu sözleşmeye bağlandığında anlam ve geçerlilik kazanır. Danışmanlık Hizmet Sözleşmesine atıfsız, tek başına düzenlenmiş bir bono, teminat amacını ve dayandığı hukuki ilişkiyi ispat açısından zayıflatır; bono her zaman ilgili hizmet sözleşmesiyle birlikte saklanmalı ve ibraz edilmelidir.</p>
          <BonoSampleFacsimile />
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
          <section className="authority-document-conditions">
            <h3>BONO DOLDURULDUKTAN SONRA YAPILACAK İŞLEMLER</h3>
            <ol>
              <li>İmza kontrolü: Keşidecinin (ve tüzel kişi ise aval verenin) imzasının bizzat ve ıslak olarak atıldığını kontrol edin; kaşe tek başına yeterli değildir.</li>
              <li>Eksiksizlik kontrolü: Yukarıdaki zorunlu bilgiler tablosundaki tüm alanların okunaklı ve eksiksiz dolduğunu, kazıntı/silinti bulunmadığını kontrol edin; hata varsa senedi iptal edip yenisini düzenleyin.</li>
              <li>Kopyalama: İmzalı bononun taranmış/fotokopi bir örneğini hem Danışman hem İş Sahibi kendi dosyasında saklasın; asıl (ıslak imzalı) nüsha yalnızca lehtarda (Danışmanda) kalır.</li>
              <li>Güvenli saklama: Asıl nüshayı kasa veya kilitli evrak dolabı gibi güvenli bir yerde saklayın; asıl senet olmadan tahsil ve icra takibi yapmak güçleşir.</li>
              <li>Vade takibi: Vade tarihini bir hatırlatma/takvim kaydına ekleyin; devir süreci (madde 3.3) vadeden önce tamamlanacaksa bu adım bilgi amaçlıdır.</li>
              <li>İade ve teyit: Bağımsız Bölümün Danışman adına tescili ve teslimiyle birlikte bonoyu derhâl İş Sahibine iade edin ve iadeyi yazılı olarak (imzalı tutanak veya yazılı teyit ile) belgeleyin; bu belge ileride "borç ödendi" ispatı olarak saklanmalıdır.</li>
              <li>Gecikme hâlinde: Devir süresinde gerçekleşmez ve bedel nakden talep edilirse (Hizmet Sözleşmesi madde 5), bonoyu tahsil veya icra sürecinde kullanmadan önce mutlaka bir avukata danışın; kambiyo senetlerine özgü haciz yoluyla takip, ibraz ve başvuru süreleri bakımından özel süre sınırlamalarına tabidir.</li>
              <li>Vergi/muhasebe: Damga vergisi istisnası ve muhasebe kaydı gerekip gerekmediğini mali müşavirinizle teyit edin.</li>
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
          <p className="authority-document-meta" style={{ fontWeight: 600 }}>ÖNEMLİ: Bu temlik sözleşmesi, yalnızca yukarıda belirtilen Danışmanlık Hizmet Sözleşmesinin ilgili maddesinde açıkça atıf yapılıp bu sözleşmeye bağlandığında hüküm ifade eder. Danışmanlık Hizmet Sözleşmesine atıfsız, tek başına düzenlenmiş bir temlik sözleşmesi, hangi alacağa ve hangi hukuki ilişkiye dayandığı belirsiz kalacağından anlam ifade etmez; temlik her zaman ilgili hizmet sözleşmesiyle birlikte saklanmalı ve ibraz edilmelidir.</p>
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
