import React from "react";
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
  return text || "";
};

// `shared/contractForms.ts`'teki TECHNICAL_MATERIAL_FIELDS ve TECHNICAL_FORM_FIELD_KEYS listeleriyle
// bire bir aynı alan anahtarlarını kullanır; etiketteki " — silüet: ..." kısmı burada alt başlık ve
// (alan boşsa) doldurma rehberi olarak ayrıştırılır.
type TechFieldDef = { fieldKey: string; label: string };

function splitLabel(label: string): { title: string; guide: string } {
  const idx = label.indexOf(" — silüet:");
  if (idx === -1) return { title: label, guide: "" };
  return { title: label.slice(0, idx), guide: label.slice(idx + " — silüet:".length).trim() };
}

function TechField({ def, fieldValues }: { def: TechFieldDef; fieldValues: Record<string, unknown> }) {
  const { title, guide } = splitLabel(def.label);
  const filled = value(fieldValues[def.fieldKey]);
  return (
    <div className="authority-document-tech-item" style={{ marginBottom: "2.6mm" }}>
      <p style={{ margin: 0, fontWeight: 700 }}>{title}</p>
      {filled ? (
        <p style={{ margin: "0.6mm 0 0" }}>{filled}</p>
      ) : guide ? (
        <p style={{ margin: "0.6mm 0 0", fontStyle: "italic", color: "#7c8783" }}>Doldurulmadı — rehber: {guide}.</p>
      ) : null}
    </div>
  );
}

const GENERAL_FIELDS: TechFieldDef[] = [
  { fieldKey: "technicalSpecificationNotes", label: "Teknik Şartname bağlantı notları" },
  { fieldKey: "projectStandards", label: "Proje ve imalat standartları" },
  { fieldKey: "approvedProjectReferences", label: "Onaylı mimari ve mühendislik proje referansları" },
  { fieldKey: "soilStudyAndGroundImprovement", label: "Zemin etüdü ve zemin iyileştirme koşulları" },
];

const STRUCTURE_FIELDS: TechFieldDef[] = [
  { fieldKey: "technical_foundationAndGroundwork", label: "Temel ve zemin uygulamaları — silüet: B420C/S420 nervürlü demir, C30 grobeton, membran ve pas payı" },
  { fieldKey: "technical_waterproofingAndDrainage", label: "Perde beton, bohçalama ve su yalıtımı — silüet: membran, XPS, koruma duvarı ve drenaj" },
  { fieldKey: "technical_concreteAndMasonry", label: "Beton, duvar ve dolgu — silüet: C30/C35 beton, dikey-yatay delikli tuğla ve mıcır" },
];

const FACADE_FIELDS: TechFieldDef[] = [
  { fieldKey: "technical_exteriorFacade", label: "Dış cephe, taş/granit ve kaplama — silüet: mekanik kaplama, taş yünü ve buhar kesici" },
  { fieldKey: "technical_insulation", label: "Isı ve su yalıtımı — silüet: taş yünü, XPS ve marka/ürün standardı" },
  { fieldKey: "technical_windowsAndGlazing", label: "Doğrama ve cam — silüet: ısı yalıtımlı alüminyum, sineklik, ısıcam ve kaplama" },
  { fieldKey: "technical_shutters", label: "Panjurlar — silüet: otomasyon, manuel anahtar, alüminyum panel ve motor" },
  { fieldKey: "technical_roofAndTerrace", label: "Çatı, çatı terası ve kışlık bahçe — silüet: çatı sistemi, yalıtım ve kullanım tahsisi" },
  { fieldKey: "technical_facadeApproval", label: "Dış cephe tasarım ve onay süreci — silüet: render, kesit, numune ve yazılı onay" },
];

const INTERIOR_FIELDS: TechFieldDef[] = [
  { fieldKey: "technical_plasterAndPaint", label: "Sıva ve boya — silüet: alçı sıva, köşe profili, sıva filesi ve iç cephe boya" },
  { fieldKey: "technical_doorsAndHardware", label: "Kapı, kasa, pervaz ve donanım — silüet: iç kapı, çelik kapı ve kilit sistemi" },
  { fieldKey: "technical_cabinetsAndJoinery", label: "Mutfak, banyo, gömme dolap ve vestiyer — silüet: MDF lam/lake, kuvars ve donanım" },
  { fieldKey: "technical_floorAndWallFinishes", label: "Taban, duvar ve merdiven kaplamaları — silüet: seramik, mermer ve kaydırmaz yüzey" },
];

const KITCHEN_BATH_FIELDS: TechFieldDef[] = [
  { fieldKey: "technical_kitchenEquipment", label: "Mutfak eviyesi, batarya ve ankastre set — silüet: marka/model veya muadili" },
  { fieldKey: "technical_bathroomEquipment", label: "Banyo armatürleri, klozet, duş ve havalandırma — silüet: marka/model veya muadili" },
];

const MEP_FIELDS: TechFieldDef[] = [
  { fieldKey: "technical_plumbingAndHeating", label: "Sıhhi tesisat, kombi ve yerden ısıtma — silüet: kapasite, boru tipi ve sistem markası" },
  { fieldKey: "technical_electricalInstallation", label: "Elektrik tesisatı ve priz planı — silüet: kablo, priz, sigorta, kaçak akım ve topraklama" },
  { fieldKey: "technical_communicationInfrastructure", label: "Uydu, internet, telefon ve TV altyapısı — silüet: merkezi sistem, fiber ve Cat6" },
  { fieldKey: "technical_automationAndIntercom", label: "Bina otomasyonu, diafon ve güvenlik — silüet: interkom, dedektör, sulama ve panjur kontrolü" },
  { fieldKey: "technical_hvacAndCooling", label: "Isıtma, soğutma ve klima — silüet: kapasite, dış ünite konumu ve yerden ısıtma" },
  { fieldKey: "technical_waterSupply", label: "Su temini, artezyen, depo ve hidrofor — silüet: şehir suyu, bahçe/havuz suyu ve kullanım sınırı" },
];

const OUTDOOR_FIELDS: TechFieldDef[] = [
  { fieldKey: "technical_landscapeAndGarden", label: "Peyzaj, bahçe ve dış aydınlatma — silüet: toprak, çim, çit, sulama ve LED" },
  { fieldKey: "technical_pool", label: "Havuz ve makine dairesi — silüet: beton, yalıtım, seramik, filtrasyon ve klorlama" },
];

const OFFICE_FIELDS: TechFieldDef[] = [
  { fieldKey: "technical_officeAppendix", label: "Ofis eklentisi — silüet: A Blok 1 ve 5 için ofis planı, iklimlendirme ve cephe" },
];

const WARRANTY_FIELDS: TechFieldDef[] = [
  { fieldKey: "technical_warrantyDetails", label: "Ürün ve imalat garanti detayları — silüet: ürün garantisi ve yüklenici giderim süresi" },
  { fieldKey: "warrantyAndInsuranceTerms", label: "Garanti ve sigorta bilgileri" },
  { fieldKey: "temporaryAcceptanceCriteria", label: "Geçici kabul ve eksik/kusurlu işler kriterleri" },
  { fieldKey: "technicalControlNotes", label: "Teknik kontrol ve raporlama notları" },
  { fieldKey: "constructionMilestones", label: "İnşaat ara takvimi" },
];

const SECTIONS: { title: string; fields: TechFieldDef[] }[] = [
  { title: "1. GENEL ESASLAR", fields: GENERAL_FIELDS },
  { title: "2. YAPISAL VE KABA İNŞAAT", fields: STRUCTURE_FIELDS },
  { title: "3. CEPHE, YALITIM VE DOĞRAMA", fields: FACADE_FIELDS },
  { title: "4. İÇ MEKAN VE İNCE İŞLER", fields: INTERIOR_FIELDS },
  { title: "5. MUTFAK VE BANYO DONANIMI", fields: KITCHEN_BATH_FIELDS },
  { title: "6. TESİSAT VE ALTYAPI", fields: MEP_FIELDS },
  { title: "7. PEYZAJ, HAVUZ VE DIŞ ALANLAR", fields: OUTDOOR_FIELDS },
  { title: "8. OFİS (BÜRO) EKLENTİSİ", fields: OFFICE_FIELDS },
  { title: "9. GARANTİ, KABUL VE TEKNİK KONTROL", fields: WARRANTY_FIELDS },
];

/**
 * EK-1 — Teknik Şartname (Kat Karşılığı İnşaat Sözleşmesi'nin eki). Aynı `fieldValues` nesnesini
 * `LandShareContractDocument`'la paylaşır (`technical_*` alanları ve `TECHNICAL_FORM_FIELD_KEYS`),
 * bu yüzden land_share formu bir kez doldurulduğunda hem ana sözleşme hem bu EK otomatik güncellenir.
 * Boş bırakılan alanlar, danışmana ne yazması gerektiğini gösteren "silüet" rehber metniyle görünür;
 * bu rehber metin sözleşmenin hukuki bir parçası değildir, yalnızca doldurma kolaylığı içindir.
 */
export default function TechnicalSpecificationDocument({
  fieldValues,
  contractNo,
  fontSize,
  officeName = "Global 1881 Gayrimenkul",
  officeAuthorizationNo = "3500211",
  officePhone = "+90 534 975 05 82",
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
        Kayıt No: <strong>{contractNo}</strong> · Proje: <strong>{value(fieldValues.projectNameAndLogo) || "................................"}</strong> · Bağlı olduğu sözleşme: <strong>Kat Karşılığı İnşaat Sözleşmesi</strong>
      </p>
      <p className="authority-document-meta">
        Bu belge, Kat Karşılığı İnşaat Sözleşmesi'nin ayrılmaz eki olan Teknik Şartname'dir; sözleşme ile bu ek arasında çelişki hâlinde sözleşme hükümleri esas alınır. Aşağıdaki başlıklar proje mutabakatına göre doldurulur; boş bırakılan başlıklarda parantez içindeki rehber metin yalnızca doldurma kolaylığı amaçlıdır ve sözleşme metni sayılmaz.
      </p>

      {SECTIONS.map((section) => (
        <section className="authority-document-section" key={section.title}>
          <h3>{section.title}</h3>
          {section.fields.map((def) => <TechField key={def.fieldKey} def={def} fieldValues={fieldValues} />)}
        </section>
      ))}

      <section className="authority-document-signatures authority-party-signature-boxes">
        <div className="authority-party-signature-box"><p>ARSA SAHİBİ / SAHİPLERİ (VEKİLİ)</p><strong>{value(fieldValues.landownerRepresentativeName) || value(fieldValues.landownerName) || "................................"}</strong><span>Kaşe ve İmza</span></div>
        <div className="authority-party-signature-box"><p>YÜKLENİCİ</p><strong>{value(fieldValues.contractorName) || "................................"}</strong><span>Kaşe ve İmza</span></div>
      </section>
    </article>
  );
}
