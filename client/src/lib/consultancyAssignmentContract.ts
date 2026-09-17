/**
 * "Kat Karşılığı Danışmanlık Hizmet Sözleşmesi" ve ekleri (Bono, Alacağın Temliki Sözleşmesi).
 * Danışmanın bir kat karşılığı projesini kurup nakit komisyon yerine bir bağımsız bölüm
 * karşılığında çalıştığı, nadir ve yüksek bedelli özel anlaşmaları kapsar. Kazım Bey'in
 * paylaştığı üç .docx dosyasındaki mutabık metne dayanır; hukuki metne dokunulmadı, yalnızca
 * değişken kısımlar (taraf/proje bilgileri, bedel, süreler) alan haline getirildi. Kişiler ve
 * proje isimleri değişkendir. Üç belge de bağımsız formlardır — hangi sözleşmenin kaçıncı eki
 * olacağı sabit değildir, `bonoAnnexLabel`/`temlikAnnexLabel` alanlarıyla her kullanımda ayrıca
 * belirlenir (boş bırakılırsa metinde ek numarası hiç geçmez).
 */
import { isUppercaseTextField, toTurkishUpperCase } from "./textFormatting";

export type ConsultancyAssignmentDetails = {
  contractDate: string;
  signPlace: string;
  copyCount: string;

  jobOwnerName: string;
  jobOwnerTaxOfficeAndNo: string;
  jobOwnerMersisNo: string;
  jobOwnerAddress: string;
  jobOwnerIsCompany: boolean;
  jobOwnerAvalName: string;

  consultantName: string;
  consultantIdentity: string;
  consultantAuthorizationNo: string;
  consultantAddress: string;

  propertyProvince: string;
  propertyDistrict: string;
  propertyNeighborhood: string;
  parcelInfo: string;
  projectName: string;
  projectUnitSummary: string;

  landShareNotaryName: string;
  landShareContractDate: string;
  landShareYevmiyeNo: string;
  landownerNames: string;

  unitDescription: string;

  serviceFeeAmount: string;
  vatNote: "dahil" | "haric";
  updateBasis: string;

  step1DeadlineDays: string;
  step2Reference: string;
  step2DeadlineDays: string;
  graceDays: string;

  invoiceTiming: string;
  vatResponsibility: "jobOwner" | "included";
  titleFeeSplit: "equal" | "jobOwner";
  disputeCity: string;

  bonoDueDate: string;
  bonoPaymentPlace: string;
  bonoCiroRule: "forbidden" | "free";
  bonoAnnexLabel: string;
  temlikAnnexLabel: string;

  assignmentNoticeCostParty: string;
};

export function emptyConsultancyAssignmentDetails(): ConsultancyAssignmentDetails {
  return {
    contractDate: "",
    signPlace: "Urla",
    copyCount: "2",
    jobOwnerName: "",
    jobOwnerTaxOfficeAndNo: "",
    jobOwnerMersisNo: "",
    jobOwnerAddress: "",
    jobOwnerIsCompany: false,
    jobOwnerAvalName: "",
    consultantName: "",
    consultantIdentity: "",
    consultantAuthorizationNo: "",
    consultantAddress: "",
    propertyProvince: "İzmir",
    propertyDistrict: "Urla",
    propertyNeighborhood: "",
    parcelInfo: "",
    projectName: "",
    projectUnitSummary: "",
    landShareNotaryName: "",
    landShareContractDate: "",
    landShareYevmiyeNo: "",
    landownerNames: "",
    unitDescription: "",
    serviceFeeAmount: "",
    vatNote: "haric",
    updateBasis: "TÜİK-TÜFE",
    step1DeadlineDays: "30",
    step2Reference: "yapı kullanma izin belgesinin alınmasını",
    step2DeadlineDays: "30",
    graceDays: "7",
    invoiceTiming: "tescil veya ödeme aşamasında",
    vatResponsibility: "jobOwner",
    titleFeeSplit: "equal",
    disputeCity: "İzmir",
    bonoDueDate: "",
    bonoPaymentPlace: "",
    bonoCiroRule: "forbidden",
    bonoAnnexLabel: "Ek-1",
    temlikAnnexLabel: "Ek-2",
    assignmentNoticeCostParty: "İş Sahibine",
  };
}

const annexRef = (label: string) => label.trim() ? ` (${label.trim()})` : "";

const UPPER_KEYS = new Set([
  "jobOwnerName", "jobOwnerAddress", "consultantName", "consultantAddress",
  "propertyNeighborhood", "landownerNames", "unitDescription", "projectName",
  "signPlace", "bonoPaymentPlace", "jobOwnerAvalName",
]);

export function normalizeConsultancyAssignmentField(key: keyof ConsultancyAssignmentDetails, value: string) {
  return UPPER_KEYS.has(key) || isUppercaseTextField(key) ? toTurkishUpperCase(value) : value;
}

export function normalizeConsultancyAssignmentDetails(details: ConsultancyAssignmentDetails): ConsultancyAssignmentDetails {
  const next = { ...details };
  for (const key of Object.keys(next) as (keyof ConsultancyAssignmentDetails)[]) {
    const value = next[key];
    if (typeof value === "string" && UPPER_KEYS.has(key)) {
      (next[key] as string) = toTurkishUpperCase(value);
    }
  }
  return next;
}

const v = (text: string) => text.trim() || "................................";
const money = (text: string) => {
  const digits = text.replace(/\D/g, "");
  return digits ? `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Number(digits))} TL` : "................ TL";
};

/** MADDE 1–6: Kat Karşılığı Danışmanlık Hizmet Sözleşmesi. */
export function buildConsultancyServiceArticles(d: ConsultancyAssignmentDetails): { title: string; body: string }[] {
  const step2ReferenceText = d.step2Reference.trim() || "yapı kullanma izin belgesinin alınmasını";
  const vatResponsibilityText = d.vatResponsibility === "included" ? "bedele dahildir" : "İş Sahibi tarafından ayrıca ödenir";
  const titleFeeSplitText = d.titleFeeSplit === "jobOwner" ? "İş Sahibi tarafından" : "taraflarca yarı yarıya";
  const bonoCiroText = d.bonoCiroRule === "free" ? "serbesttir" : "yasaktır";

  return [
    { title: "MADDE 1 — TARAFLAR VE TANIMLAR",
      body: `1.1. İş Sahibi (Yüklenici): ${v(d.jobOwnerName)}, ${v(d.jobOwnerTaxOfficeAndNo)}, Mersis No: ${v(d.jobOwnerMersisNo)}, adres: ${v(d.jobOwnerAddress)} ("İş Sahibi").\n1.2. Danışman (Simsar): ${v(d.consultantName)}, T.C. Kimlik No: ${v(d.consultantIdentity)}, Taşınmaz Ticareti Yetki Belgesi No: ${v(d.consultantAuthorizationNo)}, adres: ${v(d.consultantAddress)} ("Danışman"). Taraflar birlikte "Taraflar" olarak anılır.\n1.3. Taşınmaz: ${v(d.propertyProvince)} ili, ${v(d.propertyDistrict)} ilçesi, ${v(d.propertyNeighborhood)} Mahallesi, ${v(d.parcelInfo)} sayılı taşınmaz. Proje: ${v(d.projectName)} — ${v(d.projectUnitSummary)}. Kat Karşılığı Sözleşme: Arsa sahipleri ${v(d.landownerNames)} ile İş Sahibi arasında ${v(d.landShareNotaryName)} Noterliğinin ${d.landShareContractDate ? d.landShareContractDate : "[tarih]"}/${v(d.landShareYevmiyeNo)} ile akdedilen/akdedilecek Arsa Payı Karşılığı İnşaat ve Gayrimenkul Satış Vaadi Sözleşmesi. Bağımsız Bölüm: Madde 3'te tanımlanan, hizmet bedelinin ödenmesi amacıyla Danışmana devredilecek bağımsız bölüm.` },
    { title: "MADDE 2 — SÖZLEŞMENİN KONUSU VE DANIŞMANIN KATKISI",
      body: "2.1. Danışman; Projeye uygun Taşınmazın araştırılıp bulunması, arsa sahipleri ile İş Sahibinin bir araya getirilmesi, müzakerelerin yürütülmesi, Kat Karşılığı Sözleşmenin kurulmasına destek olunması, fizibilite ve maliyet çalışmalarına katkı sağlanması ile teknik şartnamedeki ana malzeme seçimlerinde piyasa araştırması yapılması hizmetlerini bu sözleşme tarihine kadar eksiksiz şekilde yerine getirmiştir. Taraflar bunu birlikte teyit eder.\n2.2. İşbu sözleşme, Türk Borçlar Kanunu'nun simsarlık ve danışmanlık hükümlerine uygun olarak, yazılı şekilde düzenlenmiştir." },
    { title: "MADDE 3 — HİZMET BEDELİ VE ÖDENME ŞEKLİ",
      body: `3.1. Taraflar, hizmet bedelinin net ${money(d.serviceFeeAmount)} (KDV ${d.vatNote === "dahil" ? "dahil" : "hariç"}) olarak belirlenmesinde ve bu bedelin, aşağıdaki Bağımsız Bölümün devri karşılığında ödenmesinde anlaşmıştır: ${v(d.unitDescription)}. Bağımsız Bölüm, Ek-4 Teknik Şartname ve onaylı projeye uygun, iskâna elverişli ve anahtar teslim şekilde tamamlanmış olarak devredilecektir.\n3.2. Danışman, Kat Karşılığı Sözleşmenin kurulmasıyla bu bedele hak kazanır. Bedelin nakden ödenmesinin gerektiği durumlarda (madde 5), tutar ödeme tarihine kadar ${v(d.updateBasis)} esasına göre güncellenir.\n3.3. Devir nasıl işleyecek: (a) Kat irtifakı kurulup bağımsız bölüm tapuları oluştuktan itibaren en geç ${v(d.step1DeadlineDays)} gün içinde İş Sahibi, Bağımsız Bölüm için noterde satış vaadi sözleşmesi düzenler ve tapu şerhine muvafakat eder (bu adımın masrafları Danışmana aittir). (b) En geç ${step2ReferenceText} izleyen ${v(d.step2DeadlineDays)} gün içinde Bağımsız Bölüm tapuda Danışman adına tescil edilir. Tescil ve teslim tamamlandığında bedel ödenmiş sayılır ve Danışman, aynı gün madde 4.1'deki bonoyu İş Sahibine geri verir.` },
    { title: "MADDE 4 — GÜVENCELER",
      body: `4.1. Bono: Ödemenin zamanında yapılacağının güvence altına alınması amacıyla İş Sahibi, sözleşmenin imzalandığı gün, madde 3.1'deki bedel tutarında ve ${d.bonoDueDate ? d.bonoDueDate : "[vade tarihi]"} vadeli bir bono düzenleyerek Danışmana teslim eder${annexRef(d.bonoAnnexLabel)}.${d.jobOwnerIsCompany ? ` İş Sahibi tüzel kişi olduğundan ${v(d.jobOwnerAvalName)} bonoya şahsen aval verir.` : ""} Bu bono yalnızca bir güvencedir; Bağımsız Bölüm Danışmana devredilir devredilmez derhâl iade edilir ve devir tamamlanana kadar ciro/devri ${bonoCiroText}.\n4.2. Temlik: İş Sahibi ayrıca, Kat Karşılığı Sözleşmeden doğan ve Bağımsız Bölüme ilişkin hak ve alacaklarını, aynı tarihli Alacağın Temliki Sözleşmesi${annexRef(d.temlikAnnexLabel)} ile Danışmana devreder. Bu devir, arsa sahiplerine noter aracılığıyla bildirilir; bildirim masrafı ${v(d.assignmentNoticeCostParty)} aittir.` },
    { title: "MADDE 5 — SÜRELERE UYULAMAMASI HÂLİNDE İZLENECEK YOL",
      body: `5.1. Madde 3.3'teki süreler herhangi bir nedenle aşılırsa, Danışman İş Sahibine yazılı bildirimde bulunarak ${v(d.graceDays)} günlük makul bir ek süre tanır. Bu ek sürede de devir gerçekleşmezse Danışman; dilerse Bağımsız Bölümün devrini talep etmeye devam eder, dilerse bedelin nakden ödenmesini ister. Bedelin nakden istenmesi hâlinde tutar madde 3.2'deki esasa göre güncellenir ve ödeme tarihine kadar 3095 sayılı Kanun'daki ticari avans faizi işletilir.\n5.2. Bedelin nakden tahsil edilmesi hâlinde Bağımsız Bölümün devri artık talep edilmez; yapılan kısmi ödemeler bedelden düşülür ve aynı alacak için iki kez tahsilat yapılmaz.` },
    { title: "MADDE 6 — DİĞER HÜKÜMLER",
      body: `6.1. Hizmet bedeline ilişkin fatura/serbest meslek makbuzu, ${v(d.invoiceTiming)} düzenlenir. KDV ${vatResponsibilityText}. Tapu harçları ${titleFeeSplitText} karşılanır.\n6.2. Danışman, bu sözleşmeden doğan alacaklarını üçüncü kişilere devredebilir; İş Sahibi ise borçlarını Danışmanın yazılı onayı olmadan devredemez.\n6.3. Madde 1'deki adresler yazışma adresidir; adres değişikliği yazılı bildirilmedikçe bu adreslere yapılan bildirimler geçerli sayılır. Taraflar arasındaki e-posta/KEP yazışmaları ile ticari kayıtlar, gerektiğinde delil olarak kullanılabilir.\n6.4. Bir anlaşmazlık çıkması hâlinde, önce arabuluculuk yoluna başvurulur; çözülemezse ${v(d.disputeCity)} Mahkemeleri ve İcra Daireleri yetkilidir.\n6.5. İşbu sözleşme 6 (altı) maddeden ibaret olup ${d.contractDate ? d.contractDate : "[tarih]"} tarihinde ${v(d.signPlace)}'de ${v(d.copyCount)} (${d.copyCount || "..."}) nüsha olarak imzalanmış, birer nüshası Taraflara verilmiştir. Ekler: Bono${annexRef(d.bonoAnnexLabel)}, Alacağın Temliki Sözleşmesi${annexRef(d.temlikAnnexLabel)}, İmza Sirküleri/Yetki Belgeleri, Teknik Şartname/Vaziyet Planı.` },
  ];
}

/** Ek-1 — Bono Düzenleme Esasları ve Örneği. */
export function buildBonoLines(d: ConsultancyAssignmentDetails) {
  return [
    { label: "Bedel (rakam ve yazıyla)", text: `${money(d.serviceFeeAmount)} — kayıtsız şartsız ödeme vaadi` },
    { label: "Vade tarihi", text: v(d.bonoDueDate) },
    { label: "Lehtar (kime / kimin emrine ödenecek)", text: v(d.consultantName) },
    { label: "Ödeme yeri", text: v(d.bonoPaymentPlace) },
    { label: "Düzenleme yeri ve tarihi", text: `${v(d.signPlace)}, ${d.contractDate ? d.contractDate : "[tarih]"}` },
    { label: "Keşideci (düzenleyen) adı, unvanı ve imzası", text: v(d.jobOwnerName) },
    ...(d.jobOwnerIsCompany ? [{ label: "Aval", text: `${v(d.jobOwnerAvalName)} — "işbu bonoya aval verilmiştir" şerhi ile şahsen imza` }] : []),
  ];
}

/** Ek-2 — Alacağın Temliki Sözleşmesi. */
export function buildTemlikArticles(d: ConsultancyAssignmentDetails): { title: string; body: string }[] {
  return [
    { title: "MADDE 1 — TARAFLAR",
      body: `Temlik Eden (İş Sahibi): ${v(d.jobOwnerName)}, adres: ${v(d.jobOwnerAddress)} ("Temlik Eden").\nTemlik Alan (Danışman): ${v(d.consultantName)}, T.C. Kimlik No: ${v(d.consultantIdentity)}, adres: ${v(d.consultantAddress)} ("Temlik Alan").` },
    { title: "MADDE 2 — TEMLİK KONUSU ALACAK",
      body: `Temlik Eden; arsa sahipleri ${v(d.landownerNames)} ile ${v(d.landShareNotaryName)} Noterliğinin ${d.landShareContractDate ? d.landShareContractDate : "[tarih]"}/${v(d.landShareYevmiyeNo)} ile akdettiği Kat Karşılığı Sözleşme uyarınca kendi payına isabet eden ve ${d.contractDate ? d.contractDate : "[tarih]"} tarihli Danışmanlık Hizmet Sözleşmesinin 3.1. maddesinde tanımlanan Bağımsız Bölüme (${v(d.unitDescription)}) ilişkin tapuda devir ve tescil talep hakkı dâhil tüm şahsi hak ve alacaklarını, işbu sözleşme ile Temlik Alan'a devretmiştir.` },
    { title: "MADDE 3 — TEMLİKİN SEBEBİ",
      body: `İşbu temlik, ${d.contractDate ? d.contractDate : "[tarih]"} tarihli Danışmanlık Hizmet Sözleşmesinin 3. ve 4.2. maddelerinde öngörülen hizmet bedelinin ifası amacına hizmet eder ve karşılıksız değildir.` },
    { title: "MADDE 4 — BEYAN VE GARANTİ",
      body: "Temlik Eden; temlik konusu alacağın mevcut ve devre elverişli olduğunu, daha önce üçüncü kişilere devredilmediğini, üzerinde haciz/rehin/takyidat bulunmadığını ve Kat Karşılığı Sözleşmede temliki engelleyen bir hüküm olmadığını beyan ve taahhüt eder." },
    { title: "MADDE 5 — BİLDİRİM",
      body: `Temlik Eden, işbu temliki arsa sahiplerine noter aracılığıyla derhâl bildirir; bildirim masrafları ${v(d.assignmentNoticeCostParty)} aittir. Bildirimden önce arsa sahiplerinin iyi niyetle Temlik Edene yaptığı ödemeler Temlik Alana karşı ileri sürülemez.` },
    { title: "MADDE 6 — YÜRÜRLÜK",
      body: `İşbu Alacağın Temliki Sözleşmesi, ${d.contractDate ? d.contractDate : "[tarih]"} tarihli Danışmanlık Hizmet Sözleşmesi ile birlikte yürürlüğe girer ve o sözleşme sona erdiğinde/ifa edildiğinde (madde 6.3) hükümsüz kalır. ${d.contractDate ? d.contractDate : "[tarih]"} tarihinde ${v(d.signPlace)}'de ${v(d.copyCount)} (${d.copyCount || "..."}) nüsha olarak imzalanmıştır.` },
  ];
}
