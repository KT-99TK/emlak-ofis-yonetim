import React from "react";
import { formatContractFormDate, getSaleClosingArticleNumbering } from "@/../../shared/contractForms";
import { resolveAuthoritySealSrc } from "@/components/AuthorityContractDocument";
import { formatIban, isUppercaseTextField, toTurkishUpperCase } from "@/lib/textFormatting";

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

const raw = (fieldValues: Record<string, unknown>, key: string) => String(fieldValues[key] ?? "").trim();

// Alan değeri gösterilirken: isim/adres alanları Türkçe büyük harfe taşınır (isUppercaseTextField
// ile ContractFormFiller.tsx'teki yazım anında normalizasyonla aynı liste), böylece eski taslaklarda
// küçük harf girilmiş olsa bile çıktıda tutarlı büyük harf görünür.
const fieldText = (fieldValues: Record<string, unknown>, key: string) => {
  const text = raw(fieldValues, key);
  if (!text) return "................................";
  return isUppercaseTextField(key) ? toTurkishUpperCase(text) : text;
};

// Kuruş kabul etmeyen, Türkçe binlik ayırıcıyla (nokta) biçimlendirilmiş tutar. Girdi zaten
// ContractFormFiller'da bu şekilde formatlanıyor; burada rakam dışı karakterleri temizleyip
// yeniden biçimlendirmek, elle yapıştırılan veya eski taslaklardaki değerleri de düzeltir.
const money = (fieldValues: Record<string, unknown>, key: string) => {
  const text = raw(fieldValues, key);
  if (!text) return "................ TL";
  const digits = text.replace(/\D/g, "");
  if (!digits) return `${text} TL`;
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Number(digits))} TL`;
};

const ibanText = (fieldValues: Record<string, unknown>, key: string) => {
  const text = raw(fieldValues, key);
  return text ? formatIban(text) : "................................";
};

const field = (fieldValues: Record<string, unknown>, key: string) => formatContractFormDate(key, fieldValues[key]);
const isChecked = (fieldValues: Record<string, unknown>, key: string) => {
  const v = fieldValues[key];
  return v === true || v === 1 || v === "1" || v === "true";
};

function Row({ firstLabel, firstValue, secondLabel, secondValue }: { firstLabel: string; firstValue: string; secondLabel?: string; secondValue?: string }) {
  return <tr><th scope="row">{firstLabel}</th><td>{value(firstValue)}</td>{secondLabel && <><th scope="row">{secondLabel}</th><td>{value(secondValue ?? "")}</td></>}</tr>;
}

/**
 * İzmir Emlakçılar Odası'nın onaylı "Alım-Satım Ön Protokolü" metnine dayanır (Kazım Bey'in
 * paylaştığı, kişisel verileri temizlenmiş gerçek örnek üzerinden). Metin, kullanıcıyla birlikte
 * madde madde onaylanarak buraya işlendi; hukuki metne dokunulmadı, yalnızca değişken kısımlar
 * (isim, TCKN, bedel, tarih, IBAN) alanlarla değiştirildi. İki tekrarlı madde (eski Madde 5 ve 7,
 * ikisi de %4 tapu harcı hükmünü içeriyordu) kullanıcı onayıyla tek maddede birleştirildi.
 *
 * Madde 2 (2. satıcı kabulü) yalnızca `hasSecondSeller` işaretliyse görünür; görünmediğinde
 * sonraki maddelerin numarası bir basamak kayar (bkz. getSaleClosingArticleNumbering).
 */
function buildSaleClosingApprovedArticles(fieldValues: Record<string, unknown>, officeName: string): string[] {
  const hasSecondSeller = isChecked(fieldValues, "hasSecondSeller");
  const isFullDeclaration = raw(fieldValues, "declaredValueMode").startsWith("Gerçek satış bedelinin tamamı");
  const sellerShareRaw = raw(fieldValues, "sellerShareAmount") || raw(fieldValues, "salePrice");
  const sellerShare = sellerShareRaw ? money({ sellerShare: sellerShareRaw }, "sellerShare") : "................ TL";
  const articles: string[] = [];

  articles.push(
    `SATICI ${fieldText(fieldValues, "sellerName")}, hissedarı olduğu yukarıda tapu bilgileri belirtilen gayrimenkulü, ${sellerShare} bedelle Alıcı'ya satmayı kabul etmektedir.`
  );

  if (hasSecondSeller) {
    articles.push(
      `SATICI ${fieldText(fieldValues, "seller2Name")}, hissedarı olduğu yukarıda tapu bilgileri belirtilen gayrimenkulü, ${money(fieldValues, "seller2ShareAmount")} bedelle Alıcı'ya satmayı kabul etmektedir.`
    );
  }

  articles.push(
    `ALICI, ${hasSecondSeller ? "satıcılara" : "satıcıya"} ait yukarıda tapu bilgileri belirtilen gayrimenkulü toplamda ${money(fieldValues, "salePrice")} bedelle almayı kabul etmektedir.`
  );

  const kaporaCumlesi = `Alıcı'dan bu satışa mahsuben ${money(fieldValues, "reservationAmount")} kapora bedeli ${hasSecondSeller ? "satıcıların banka hesaplarına" : "satıcının banka hesabına"} ${field(fieldValues, "reservationTransferDate") || "................"} tarihinde transfer edilecektir. Tapu satış işlemleri en geç ${field(fieldValues, "finalDeedTransferDate") || "................"} tarihine kadar yapılacaktır.`;
  const bakiyeBaslik = isFullDeclaration ? "Satış bedelinin kalan bakiyesi" : "Resmi satış bedeline ait bakiye tutarlar";
  const bakiyeCumlesi = `${bakiyeBaslik} tapu devir günü ${fieldText(fieldValues, "sellerName")} IBAN: ${ibanText(fieldValues, "sellerIban")} hesabına ${money(fieldValues, "sellerBalanceAmount")}${hasSecondSeller ? `, ${fieldText(fieldValues, "seller2Name")} IBAN NO: ${ibanText(fieldValues, "seller2Iban")} hesabına ${money(fieldValues, "seller2BalanceAmount")}` : ""} transfer edilecektir.`;
  articles.push(kaporaCumlesi + " " + bakiyeCumlesi + (!isFullDeclaration
    ? ` Gerçek satış bedeline ait bakiye tutarları tapu günü ${fieldText(fieldValues, "sellerName")}'e ${money(fieldValues, "sellerCashBalanceAmount")}${hasSecondSeller ? `, ${fieldText(fieldValues, "seller2Name")}'ye ${money(fieldValues, "seller2CashBalanceAmount")}` : ""} elden nakit ödenecektir.`
    : ""));

  const beyanCumlesi = isFullDeclaration
    ? "Söz konusu gayrimenkulün satış bedeli tapuya, gerçek satış bedelinin tamamı üzerinden beyan edilecektir."
    : `Söz konusu gayrimenkulün satış bedeli tapuya ${money(fieldValues, "declaredTapuValue")} üzerinden beyan edilecektir.`;
  articles.push(`${beyanCumlesi} Tapu devir satış işleminden kaynaklı tapu harç ve döner sermaye masrafları (%4) ALICI tarafından ödenecektir.`);

  articles.push(
    `Bu akdin imzasından sonra satıcı veya alıcı gayrimenkulü satmaktan veya almaktan vazgeçerse, vazgeçen taraf diğer tarafa ${money(fieldValues, "agreedWithdrawalFee")} vazgeçme bedelini ödemeyi koşulsuz olarak kabul eder.`
  );

  articles.push(
    `Tapu devri ile ilgili işlemler en geç ${field(fieldValues, "finalDeedTransferDate") || "................"} tarihine kadar, alım, satım devir işlemleri ${fieldText(fieldValues, "titleDeedOfficeName")} Tapu Müdürlüğü'nde yapılacaktır.`
  );

  articles.push(
    "Yukarıda adres ve tapu kayıtları bulunan gayrimenkulü belirtilen bedelle GAYRIMENKUL SAHİBİ satmayı, ALICI almayı ve taraflar gayrimenkulün alım satımında emlak komisyoncusunun aracılık hizmetlerini tamamladığını kabul ve taahhüt etmişlerdir."
  );

  articles.push(
    "Alıcı ve taşınmaz sahibi, taşınmazın satışı konusunda alıcı ve taşınmaz sahibi ile aralarında aracılık eden emlak komisyoncusunun Borçlar Kanunu'nun 521. maddesi ve 5 Haziran 2018 tarihli Taşınmaz Ticareti Hakkında Yönetmelik uyarınca üzerine düşen edimini eksiksiz yerine getirerek hizmet bedeline hak kazandığını kayıtsız, şartsız beyan ve kabul etmiştir. Aracılık hizmetinin yerine getirilmiş olması ücrete hak kazanılması için yeterlidir."
  );

  articles.push(
    "İşbu akdin imzalanmasından itibaren emlak komisyoncusuna gayrimenkulün yukarıda gösterilen gerçek satış bedeli üzerinden, 5 Haziran 2018 tarihli Resmi Gazete'de yayımlanan Taşınmaz Ticareti Hakkında Yönetmeliğin 13. ve 20. maddesi kapsamınca, Alıcı ve SATICI toplamda %4+KDV (%2+KDV alıcıdan, %2+KDV satıcıdan) emlak komisyon bedeli ödemeyi kabul ve taahhüt etmiştir."
  );

  articles.push(
    `Taşınmaz sahibi ya da alıcı, ${field(fieldValues, "finalDeedTransferDate") || "................"} tarihinde taşınmazı tapu dairesinde satmaktan/almaktan vazgeçerse ya da bu tarihe kadar yüklendiği edimini ve/veya tapu dairesinde satış akdini gerçekleştirmezse, Borçlar Kanunu 521. maddesi uyarınca edinimini eksiksiz yerine getirmiş olan emlak komisyoncusuna, gayrimenkulün sözleşmede belirtilen satış bedeli üzerinden %4+KDV emlak komisyon bedelini ödeyeceğini kabul ve taahhüt eder. Ayrıca cayan taraf, karşı tarafa ${money(fieldValues, "agreedWithdrawalFee")} bedeli ödemeyi kabul ve taahhüt eder.`
  );

  articles.push(
    "Bu sözleşmenin imzalanmasında Alıcı ve/veya SATICI şayet bir vekille temsil edilmişse ve sözleşmeyi imzalamaya yetkili vekili olduğunu beyan eden kişinin ileride vekaleti olmadığı veya yetkisiz temsilci olduğunun ortaya çıkması durumunda, kendisini vekil olarak gösteren ve bu sıfatla imzalayan kişi, işbu sözleşmeden ötürü adına imza attığı kişi adına doğmuş ve doğacak bilumum borçlardan ve özellikle komisyon ücretinden ve diğer danışmanlık bedelinden şahsen sorumlu olmayı kabul ve taahhüt eder."
  );

  articles.push(
    "Alıcı, tapu devrini herhangi bir neden veya gerekçe ile eşi, çocukları, usul veya füruu, kayınpederi, kayınvalidesi, hala, dayı, teyze gibi kan veya sıhri hısımları, kendisinin veya bu kişilerden herhangi birinin ortağı veya temsilcisi olduğu şirket ya da iş ortağı adına yapmış olsa bile, bu durumu işbu sözleşmeden kaynaklanacak borçlarını ödememe konusunda bir mazeret olarak ileri süremez. Sözleşmeden doğan tüm borç ve sorumluluklardan Alıcı aynen ve şahsen sorumludur."
  );

  articles.push(
    `İşbu alım satım sözleşmesi yukarıda belirtilen ve aşağıda yer alan özel koşullarda geçerli olmak üzere Alıcı ve SATICI arasında düzenlenmiş olup imzalar ${officeName} ofisinde tarafların hür iradeleri ile imza altına alınmıştır. Emlak Komisyoncusu emlak alım satım sözleşmesinin tarafı değildir. Bu sözleşmedeki muhataplığı %2+KDV alım, %2+KDV satım komisyon ücreti ile ilgili olup emlakçının başkaca bir sorumluluğu ve yükümlülüğü yoktur.`
  );

  articles.push(
    "Gerek alıcı gerekse taşınmaz sahibi, resmi şekil şartına tabi olmayan bir cayma akçesi ve hizmet bedeli sözleşmesi akdetmiş olduklarından, resmi şekil şartı zorunluluğundan bahisle işbu sözleşmenin geçersizliği hakkında her türlü talep ve dava haklarından gayrikabili rücu peşinen feragat etmişlerdir."
  );

  articles.push(
    "İşbu sözleşme üç nüsha düzenlenmiş olup, sözleşmeden doğan ve sözleşmenin yerine getirilmesi ile ilgili her türlü vergi, resim ve harçlar, özel koşullarda yer alan düzenlemede belirtilen alıcı/satıcı taraf(lar)a aittir."
  );

  return articles;
}

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

  const hasSecondSeller = isChecked(fieldValues, "hasSecondSeller");
  const approvedArticles = buildSaleClosingApprovedArticles(fieldValues, officeName);
  const activeClauses = clauses.filter((clause) => clause.bodyTemplate.trim().length > 0);
  const numbering = getSaleClosingArticleNumbering(activeClauses.length, hasSecondSeller);
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
          <Row firstLabel="Satıcı" firstValue={fieldText(fieldValues, "sellerName")} secondLabel="Satıcı TCKN" secondValue={String(fieldValues.sellerTckn ?? "")} />
          {hasSecondSeller && <Row firstLabel="2. Satıcı" firstValue={fieldText(fieldValues, "seller2Name")} secondLabel="2. Satıcı TCKN" secondValue={String(fieldValues.seller2Tckn ?? "")} />}
          <Row firstLabel="Alıcı" firstValue={fieldText(fieldValues, "buyerName")} secondLabel="Alıcı TCKN" secondValue={String(fieldValues.buyerTckn ?? "")} />
        </tbody></table>
      </section>

      <section className="authority-document-section">
        <h3>TAŞINMAZ VE BEDEL BİLGİLERİ</h3>
        <table><tbody>
          <Row firstLabel="Taşınmaz Adresi" firstValue={fieldText(fieldValues, "propertyAddress")} />
          <Row firstLabel="Tapu ve Bağımsız Bölüm Bilgileri" firstValue={fieldText(fieldValues, "titleDeedInfo")} />
          <Row firstLabel="Satış Bedeli (Toplam)" firstValue={money(fieldValues, "salePrice")} secondLabel="Son Tapu Devir Tarihi" secondValue={field(fieldValues, "finalDeedTransferDate")} />
          <Row firstLabel="Kapora Tutarı" firstValue={money(fieldValues, "reservationAmount")} secondLabel="Kapora Ödeme Şekli" secondValue={String(fieldValues.reservationPaymentMethod ?? "")} />
          {String(fieldValues.reservationPaymentMethod ?? "").startsWith("Nakit") && (
            <Row firstLabel="Kapora Transfer Tarihi" firstValue={field(fieldValues, "reservationTransferDate")} secondLabel="Nakit Teslim Belge No" secondValue={String(fieldValues.reservationCashReceiptNo ?? "")} />
          )}
          <Row firstLabel="Tapuya Beyan Şekli" firstValue={String(fieldValues.declaredValueMode ?? "")} secondLabel="Tapuya Beyan Edilecek Bedel" secondValue={money(fieldValues, "declaredTapuValue")} />
          <Row firstLabel="Cayma Bedeli" firstValue={money(fieldValues, "agreedWithdrawalFee")} />
        </tbody></table>
      </section>

      <section className="authority-document-conditions">
        <h3>SÖZLEŞME MADDELERİ</h3>
        <ol>
          {approvedArticles.map((articleText, index) => (
            <li key={`fixed-${index}`}>{articleText}</li>
          ))}
          {hasOptionalClauses && activeClauses.map((clause) => (
            <li key={`optional-${clause.id}`}>
              <strong>{clause.title}</strong> — {clause.bodyTemplate}
              {clause.requesterFootnote && <><br /><em>{clause.requesterFootnote}</em></>}
            </li>
          ))}
          <li key="jurisdiction">
            Sözleşmenin uygulanmasından doğabilecek uyuşmazlıkların çözümünde İzmir Urla Mahkemeleri ve İcra Müdürlükleri yetkilidir.
          </li>
          <li key="closing">
            İşbu sözleşme toplam {numbering.finalArticleNumber} maddeden ibaret olup, taraflarca karşılıklı düzenlenerek {field(fieldValues, "contractDate") || "................"} tarihinde imzalanmıştır.
          </li>
        </ol>
        {!hasOptionalClauses && (
          <p className="authority-document-meta" style={{ marginTop: "2mm" }}>
            (Taraflarca kabul edilmiş isteğe bağlı ek madde bulunmadığından bu başlık ve
            ilgili madde numaraları çıktıda yer almaz; numaralandırma doğrudan Madde{" "}
            {numbering.jurisdictionArticleNumber}'e — yetkili mahkeme maddesine — geçer.)
          </p>
        )}
      </section>

      <section className="authority-document-signatures authority-party-signature-boxes">
        <div className="authority-party-signature-box"><p>SATICI</p><strong>{fieldText(fieldValues, "sellerName")}</strong><span>İmza</span></div>
        {hasSecondSeller && <div className="authority-party-signature-box"><p>2. SATICI</p><strong>{fieldText(fieldValues, "seller2Name")}</strong><span>İmza</span></div>}
        <div className="authority-party-signature-box"><p>ALICI</p><strong>{fieldText(fieldValues, "buyerName")}</strong><span>İmza</span></div>
        <div className="authority-party-signature-box"><p>EMLAK KOMİSYONCUSU</p><strong>{fieldText(fieldValues, "brokerSignatoryName")}</strong><small>{value(String(fieldValues.brokerSignatoryTckn ?? ""))}</small><span>İmza</span></div>
      </section>
    </article>
  );
}
