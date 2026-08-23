export type AuthorityContractDetails = {
  mode: "sale" | "rent";
  ownerName: string;
  ownerIdentity: string;
  ownerPhone: string;
  ownerAddress: string;
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
  contractDate: string;
  consultantName: string;
  consultantPhone: string;
  consultantCode: string;
  consultantTitle: string;
  officeName: string;
  officeAuthorizationNo: string;
  officePhone: string;
  officeAddress: string;
};

export type AuthorityContractSummary = {
  contractAmount: number;
  serviceFeeRate: number;
  serviceFeeAmount: number;
};

export const emptyAuthorityDetails = (): AuthorityContractDetails => ({
  mode: "rent", ownerName: "", ownerIdentity: "", ownerPhone: "", ownerAddress: "",
  propertyAddress: "", parcelInfo: "", propertyType: "", grossM2: "", roomCount: "",
  floorAndView: "", condition: "", price: "", currency: "TRY", serviceFeeRate: "", serviceFeeAmount: "",
  contractDate: new Date().toISOString().slice(0, 10), consultantName: "", consultantPhone: "", consultantCode: "", consultantTitle: "",
  officeName: "Global 1881 Gayrimenkul", officeAuthorizationNo: "3500211", officePhone: "", officeAddress: "",
});

export function authorityContractTitle(mode: AuthorityContractDetails["mode"]) {
  return mode === "sale" ? "SATIŞ YETKİ SÖZLEŞMESİ" : "KİRALAMA YETKİ SÖZLEŞMESİ";
}

function amount(raw: string) {
  const compact = raw.trim().replace(/\s/g, "");
  const value = compact.includes(",")
    ? compact.replace(/\./g, "").replace(",", ".")
    : compact.split(".").length > 2
      ? compact.replace(/\./g, "")
      : compact;
  return Math.max(0, Number(value) || 0);
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
  const serviceFeeRate = amount(details.serviceFeeRate);
  const manualServiceFee = amount(details.serviceFeeAmount);
  return { contractAmount, serviceFeeRate, serviceFeeAmount: manualServiceFee || contractAmount * serviceFeeRate / 100 };
}

export function formatAuthorityCurrency(value: number, currency: AuthorityContractDetails["currency"] = "TRY") {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
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
    ownerPhone: toInternationalPhone(details.ownerPhone),
    consultantPhone: toInternationalPhone(details.consultantPhone),
    officePhone: toInternationalPhone(details.officePhone),
  };
}

export function renderAuthorityContract(details: AuthorityContractDetails, contractNo?: string) {
  const normalized = normalizeAuthorityDetails(details);
  const display = (value: string) => value.trim() || "................................";
  const action = normalized.mode === "sale" ? "satış" : "kiralama";
  const priceLabel = normalized.mode === "sale" ? "satış bedeli" : "aylık kira bedeli";
  const summary = calculateAuthoritySummary(normalized);
  const currency = normalized.currency;
  return [
    authorityContractTitle(normalized.mode),
    `Kayıt no: ${contractNo || "otomatik numara kayıtta atanır"} | Düzenleme tarihi: ${display(normalized.contractDate)}`,
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
    "3. YETKİ VE HİZMET BEDELİ",
    `Malik, yukarıda bilgileri belirtilen taşınmazın ${action} işlemleri için aşağıda bilgileri bulunan emlak danışmanını yetkilendirir.`,
    `Sözleşmeye esas ${priceLabel}: ${summary.contractAmount ? formatAuthorityCurrency(summary.contractAmount, currency) : display(normalized.price)}`,
    `Hizmet bedeli: ${summary.serviceFeeAmount ? formatAuthorityCurrency(summary.serviceFeeAmount, currency) : "belirtilmemiş"}${summary.serviceFeeRate ? ` | Oran: %${summary.serviceFeeRate}` : ""}`,
    "",
    "4. DANIŞMAN VE OFİS",
    `Danışman: ${display(normalized.consultantName)} | Baş harf kodu: ${consultantInitials(normalized.consultantName)} | Personel kodu: ${display(normalized.consultantCode)}`,
    `Sıfat: ${display(normalized.consultantTitle)} | Danışman iletişim: ${display(normalized.consultantPhone)}`,
    `Ofis: ${display(normalized.officeName)} | Yetki belgesi no: ${display(normalized.officeAuthorizationNo)}`,
    `Ofis iletişim: ${display(normalized.officePhone)} | ${display(normalized.officeAddress)}`,
    "",
    "5. DÜZENLEME VE İMZA",
    `Bu belge ${display(normalized.contractDate)} tarihinde iki nüsha olarak düzenlenmiştir. Ana sözleşme maddeleri, ofis tarafından onaylanmış şablon sürümü üzerinden uygulanır.`,
    "Malik imza: ________________________________    Danışman imza: ________________________________",
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
  };
}
