import { formatTurkishDate } from "./turkishDate";
export type AuthorityContractDetails = {
  mode: "sale" | "rent";
  ownerName: string;
  ownerIdentity: string;
  ownerPhone: string;
  ownerAddress: string;
  propertyNeighborhood: string;
  propertyAddress: string;
  parcelInfo: string;
  propertyType: string;
  grossM2: string;
  roomCount: string;
  floorAndView: string;
  condition: string;
  price: string;
  currency: "TRY" | "USD" | "EUR";
  serviceFeeRate: string;
  serviceFeeAmount: string;
  vatCollection: "separate" | "included";
  contractDate: string;
  authorityDurationMonths: string;
  consultantName: string;
  consultantPhone: string;
  consultantCode: string;
  consultantTitle: string;
  officeName: string;
  officeAuthorizationNo: string;
  officeTaxOffice: string;
  officeTaxNo: string;
  officePhone: string;
  officeAddress: string;
};

export type AuthorityContractSummary = {
  contractAmount: number;
  serviceFeeRate: number;
  serviceFeeAmount: number;
};

export const AUTHORITY_CONDITIONS_TEMPLATE_VERSION = "global1881-authority-conditions-2026-08-v1";

export const emptyAuthorityDetails = (): AuthorityContractDetails => ({
  mode: "rent", ownerName: "", ownerIdentity: "", ownerPhone: "", ownerAddress: "",
  propertyNeighborhood: "", propertyAddress: "", parcelInfo: "", propertyType: "", grossM2: "", roomCount: "",
  floorAndView: "", condition: "", price: "", currency: "TRY", serviceFeeRate: "", serviceFeeAmount: "", vatCollection: "separate",
  contractDate: new Date().toISOString().slice(0, 10), authorityDurationMonths: "3", consultantName: "", consultantPhone: "", consultantCode: "", consultantTitle: "",
  officeName: "Global 1881 Gayrimenkul", officeAuthorizationNo: "3500211", officeTaxOffice: "", officeTaxNo: "", officePhone: "", officeAddress: "",
});

export function authorityContractTitle(mode: AuthorityContractDetails["mode"]) {
  return mode === "sale" ? "SATIŞ YETKİ SÖZLEŞMESİ" : "KİRALAMA YETKİ SÖZLEŞMESİ";
}

function parseNumericValue(raw: string) {
  const compact = raw.trim().replace(/\s/g, "");
  const value = compact.includes(",")
    ? compact.replace(/\./g, "").replace(",", ".")
    : compact.split(".").length > 2
      ? compact.replace(/\./g, "")
      : compact;
  return Math.max(0, Number(value) || 0);
}

function amount(raw: string) {
  return Math.round(parseNumericValue(raw));
}

function normalizeAuthorityDuration(raw: string) {
  const value = Math.trunc(Number(raw.replace(/\D/g, "")) || 3);
  return String(Math.min(120, Math.max(1, value)));
}

function durationWord(value: string) {
  const words: Record<string, string> = { "1": "bir", "2": "iki", "3": "üç", "4": "dört", "5": "beş", "6": "altı", "7": "yedi", "8": "sekiz", "9": "dokuz", "10": "on", "11": "on bir", "12": "on iki" };
  return words[value] ?? value;
}

function formatWholeAmount(raw: string) {
  if (!raw.trim()) return "";
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(amount(raw));
}

/** Kuruş kabul etmeyen tutar alanını Türkçe binlik ayırıcıyla biçimlendirir. */
export function formatWholeCurrencyInput(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Number(digits));
}

function titleWord(word: string) {
  if (!word) return word;
  const lower = word.toLocaleLowerCase("tr-TR");
  return lower.charAt(0).toLocaleUpperCase("tr-TR") + lower.slice(1);
}

/** Türkçe kişi/unvan ve adres alanları için okunaklı baş harf düzeni. */
export function toTurkishTitleCase(value: string) {
  return value.trim().split(/(\s+|-)/).map((part) => /^\s+$|^-$/.test(part) ? part : titleWord(part)).join("");
}

/** Türkiye yerel numaralarını E.164 biçimine çevirir; zaten uluslararası olanı korur. */
export function toInternationalPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (value.trim().startsWith("+")) return `+${digits}`;
  if (digits.startsWith("0090") && digits.length === 14) return `+${digits.slice(2)}`;
  if (digits.startsWith("90") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+90${digits.slice(1)}`;
  if (digits.startsWith("5") && digits.length === 10) return `+90${digits}`;
  return `+${digits}`;
}

export function consultantInitials(name: string) {
  const parts = toTurkishTitleCase(name).split(/\s+/).filter((part) => part && !["Ve", "De", "Da"].includes(part));
  return parts.map((part) => part.charAt(0).toLocaleUpperCase("tr-TR")).join("").slice(0, 6) || "DSN";
}

export function contractYear(contractDate: string) {
  const year = Number.parseInt(contractDate.slice(0, 4), 10);
  return Number.isFinite(year) ? year : new Date().getFullYear();
}

export function nextAuthorityContractNo(existingContractNumbers: string[], consultantName: string, contractDate: string) {
  const year = contractYear(contractDate);
  const initials = consultantInitials(consultantName);
  const prefix = `YET-${year}-${initials}-`;
  const highest = existingContractNumbers
    .filter((number) => number.startsWith(prefix))
    .map((number) => Number.parseInt(number.slice(prefix.length), 10))
    .filter(Number.isFinite)
    .reduce((max, value) => Math.max(max, value), 0);
  return `${prefix}${String(highest + 1).padStart(3, "0")}`;
}

export function calculateAuthoritySummary(details: AuthorityContractDetails): AuthorityContractSummary {
  const contractAmount = amount(details.price);
  if (details.mode === "rent") return { contractAmount, serviceFeeRate: 0, serviceFeeAmount: 0 };
  const serviceFeeRate = parseNumericValue(details.serviceFeeRate);
  const manualServiceFee = amount(details.serviceFeeAmount);
  return { contractAmount, serviceFeeRate, serviceFeeAmount: manualServiceFee || Math.round(contractAmount * serviceFeeRate / 100) };
}

export function formatAuthorityCurrency(value: number, currency: AuthorityContractDetails["currency"] = "TRY") {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(value));
}

export function normalizeAuthorityDetails(details: AuthorityContractDetails): AuthorityContractDetails {
  return {
    ...details,
    ownerName: toTurkishTitleCase(details.ownerName),
    ownerAddress: toTurkishTitleCase(details.ownerAddress),
    propertyAddress: toTurkishTitleCase(details.propertyAddress),
    propertyType: toTurkishTitleCase(details.propertyType),
    floorAndView: toTurkishTitleCase(details.floorAndView),
    condition: toTurkishTitleCase(details.condition),
    consultantName: toTurkishTitleCase(details.consultantName),
    consultantTitle: toTurkishTitleCase(details.consultantTitle),
    officeName: toTurkishTitleCase(details.officeName),
    officeAddress: toTurkishTitleCase(details.officeAddress),
    price: formatWholeAmount(details.price),
    serviceFeeAmount: formatWholeAmount(details.serviceFeeAmount),
    authorityDurationMonths: normalizeAuthorityDuration(details.authorityDurationMonths),
    ownerPhone: toInternationalPhone(details.ownerPhone),
    consultantPhone: toInternationalPhone(details.consultantPhone),
    officePhone: toInternationalPhone(details.officePhone),
  };
}

/** Kullanıcının sağladığı Claude şablonundan türetilen, belgeye snapshot olarak yazılan koşul metni. */
export function authorityContractConditions(details: AuthorityContractDetails) {
  const isSale = details.mode === "sale";
  const commission = "%2 + KDV";
  const penalty = "%4 + KDV";
  const amountAccusative = isSale ? "satış bedelini" : "kira bedelini";
  const amountGenitive = isSale ? "satış bedelinin" : "kira bedelinin";
  const action = isSale ? "satma" : "kiralama";
  const actionNoun = isSale ? "satış" : "kiralama";
  const heading = isSale ? "Satış" : "Kiralama";
  const restriction = isSale ? "satamaz/sattıramaz" : "kiralayamaz/kiralatamaz";
  const recipient = isSale ? "alıcıya" : "kiracıya";
  const advisor = details.consultantName.trim() || "……………………………";
  const advisorCode = details.consultantCode.trim() ? ` (${details.consultantCode.trim()})` : "";
  const advisorTitle = details.consultantTitle.trim() || "emlak danışmanı";
  const officeTax = details.officeTaxNo.trim() ? ` ve VKN: ${details.officeTaxNo.trim()}` : "";
  const officeSentence = `İşbu sözleşme, Yetki Belgesi No: ${details.officeAuthorizationNo.trim() || "……………………………"}${officeTax} ile faaliyet gösteren ${details.officeName.trim() || "……………………………"} adına düzenlenmiştir. İşlemi yürüten ${advisorTitle} ${advisor}${advisorCode}, işletme adına kiralık ve satılık portföy almaya ve işletme adına sözleşme imzalamaya yetkilidir.`;
  const duration = normalizeAuthorityDuration(details.authorityDurationMonths);
  return [
    isSale
      ? `Taşınmaz maliki, işbu sözleşme ile emlak danışmanına, yukarıda nitelikleri belirtilen taşınmazı üçüncü kişilere ${action} yetkisi vermiştir. Satış gerçekleştiğinde, 05.06.2018 tarihli Resmî Gazete'de yayımlanan Taşınmaz Ticareti Hakkında Yönetmelik hükümleri uyarınca taşınmaz maliki, ${commission} tutarındaki hizmet bedelini emlak danışmanına ödemeyi kabul ve taahhüt eder.`
      : `Taşınmaz maliki, işbu sözleşme ile emlak danışmanına, yukarıda nitelikleri belirtilen taşınmazı üçüncü kişilere ${action} yetkisi vermiştir. İşbu kiralama yetki belgesi, taşınmaz malikine hizmet bedeli veya KDV tahakkuku doğurmaz.`,
    officeSentence,
    `Sözleşme süresi imza tarihinden itibaren ${duration} (${durationWord(duration)}) aydır. Süre bitiminden 15 (on beş) gün önce yazılı fesih bildirimi yapılmadığı takdirde sözleşme aynı koşullarla 3 (üç) ay süreyle uzamış sayılır.`,
    "Emlak danışmanı, taşınmazın pazarlanması için başka emlak danışmanlarıyla iş birliği yapabilir.",
    `Taşınmaz maliki, sözleşme süresince ${amountAccusative} emlak danışmanının yazılı onayı olmadan değiştiremez; aksi hâlde komisyon, eski ve yeni bedelden yüksek olanı üzerinden hesaplanır.`,
    isSale
      ? `Taşınmaz maliki, sözleşme süresince emlak danışmanının yazılı muvafakati olmadan taşınmazı üçüncü kişilere ${restriction}. Aksi hâlde gerçek ${amountGenitive} ${penalty} tutarını emlak danışmanına ödemeyi kabul ve taahhüt eder.`
      : `Taşınmaz maliki, sözleşme süresince emlak danışmanının yazılı muvafakati olmadan taşınmazı üçüncü kişilere ${restriction}. Bu aykırılığın sonuçları, ilgili mevzuat ve somut sözleşme hükümleri çerçevesinde değerlendirilir.`,
    "Taşınmaz maliki, yukarıda kendisi ve taşınmazı hakkında verdiği bilgilerin doğru olduğunu kabul eder; bilgilerin gerçeği yansıtmamasından emlak danışmanı sorumlu tutulamaz.",
    "Taşınmaz maliki, işbu sözleşme süresince başka hiçbir aracı kişi veya kuruma yetki vermeyeceğini beyan ve taahhüt eder.",
    isSale
      ? `Emlak danışmanının gösterdiği ${recipient}, sözleşme süresi içinde veya bitiminden sonraki 3 (üç) ay içinde emlak danışmanı aracılığı dışında ${actionNoun} yapılması hâlinde taşınmaz maliki, ${amountGenitive} ${penalty} tutarını emlak danışmanına ödemeyi kabul ve taahhüt eder.`
      : `Emlak danışmanının gösterdiği ${recipient} ile sözleşme süresi içinde veya bitiminden sonraki 3 (üç) ay içinde emlak danışmanı aracılığı dışında ${actionNoun} yapılması hâlinde durum, ilgili mevzuat ve somut sözleşme hükümleri çerçevesinde değerlendirilir.`,
    "Taraflar yukarıdaki adresleri yasal tebligat adresi olarak kabul eder. Sözleşmeden doğan vergi, resim ve harçlar taşınmaz sahibine aittir. İşbu sözleşme 2 (iki) nüsha düzenlenmiş olup uyuşmazlıklarda İzmir Mahkemeleri ve İcra Müdürlükleri yetkilidir.",
  ];
}

export function renderAuthorityContract(details: AuthorityContractDetails, contractNo?: string) {
  const normalized = normalizeAuthorityDetails(details);
  const display = (value: string) => value.trim() || "................................";
  const displayDate = (value: string) => value.trim() ? formatTurkishDate(value) : "................................";
  const action = normalized.mode === "sale" ? "satış" : "kiralama";
  const priceLabel = normalized.mode === "sale" ? "satış bedeli" : "aylık kira bedeli";
  const summary = calculateAuthoritySummary(normalized);
  const currency = normalized.currency;
  return [
    authorityContractTitle(normalized.mode),
    `Kayıt no: ${contractNo || "otomatik numara kayıtta atanır"} | Düzenleme tarihi: ${displayDate(normalized.contractDate)}`,
    "",
    "1. TARAFLAR",
    `Taşınmaz maliki: ${display(normalized.ownerName)} | TCKN/VKN: ${display(normalized.ownerIdentity)}`,
    `Malik iletişim: ${display(normalized.ownerPhone)} | Adres: ${display(normalized.ownerAddress)}`,
    "",
    "2. TAŞINMAZ BİLGİLERİ",
    `Taşınmaz: ${display(normalized.propertyAddress)}`,
    `Ada/Parsel/Bağımsız Bölüm: ${display(normalized.parcelInfo)} | Nitelik: ${display(normalized.propertyType)}`,
    `Alan: ${display(normalized.grossM2)} m² | Oda: ${display(normalized.roomCount)} | Kat/Cephe: ${display(normalized.floorAndView)}`,
    `Durum: ${display(normalized.condition)}`,
    "",
    normalized.mode === "sale" ? "3. YETKİ VE HİZMET BEDELİ" : "3. KİRALAMA YETKİSİ",
    `Malik, yukarıda bilgileri belirtilen taşınmazın ${action} işlemleri için aşağıda bilgileri bulunan emlak danışmanını yetkilendirir.`,
    `Sözleşmeye esas ${priceLabel}: ${summary.contractAmount ? formatAuthorityCurrency(summary.contractAmount, currency) : display(normalized.price)}`,
    ...(normalized.mode === "sale" ? [`Hizmet bedeli: ${summary.serviceFeeAmount ? formatAuthorityCurrency(summary.serviceFeeAmount, currency) : "belirtilmemiş"}${summary.serviceFeeRate ? ` | Oran: %${summary.serviceFeeRate}` : ""}`] : []),
    "",
    "4. DANIŞMAN VE OFİS",
    `Danışman: ${display(normalized.consultantName)} | Baş harf kodu: ${consultantInitials(normalized.consultantName)} | Personel kodu: ${display(normalized.consultantCode)}`,
    `Sıfat: ${display(normalized.consultantTitle)} | Danışman iletişim: ${display(normalized.consultantPhone)}`,
    `Ofis: ${display(normalized.officeName)} | Yetki belgesi no: ${display(normalized.officeAuthorizationNo)}`,
    `Ofis iletişim: ${display(normalized.officePhone)} | ${display(normalized.officeAddress)}`,
    "",
    "5. DÜZENLEME VE İMZA",
    `Bu belge ${displayDate(normalized.contractDate)} tarihinde iki nüsha olarak düzenlenmiştir. Ana sözleşme maddeleri, ofis tarafından onaylanmış şablon sürümü üzerinden uygulanır.`,
    "Malik imza: ________________________________    Danışman imza: ________________________________",
    "",
    "SÖZLEŞME KOŞULLARI",
    ...authorityContractConditions(normalized).map((condition, index) => `${index + 1}. ${condition}`),
  ].join("\n");
}

export function createOfflineAuthoritySnapshot(details: AuthorityContractDetails, contractNo: string, sourceClientRecordId?: string, sourcePropertyRecordId?: string, sourceAuthorityContractRecordId?: string) {
  const normalized = normalizeAuthorityDetails(details);
  return {
    schema: "global1881-offline-authority-v2" as const,
    contractNo: contractNo.trim(),
    sourceClientRecordId,
    sourcePropertyRecordId,
    sourceAuthorityContractRecordId,
    ...normalized,
    summary: calculateAuthoritySummary(normalized),
    conditionTemplateVersion: AUTHORITY_CONDITIONS_TEMPLATE_VERSION,
    conditions: authorityContractConditions(normalized),
  };
}
