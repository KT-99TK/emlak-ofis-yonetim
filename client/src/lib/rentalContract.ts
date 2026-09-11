import { RENTAL_CONDITIONS_TEMPLATE_VERSION, rentalContractConditions } from "./rentalConditions";

import { formatTurkishDate } from "./turkishDate";
import { maskIdentityOrTaxNo, maskPhone } from "./privacy";
import { formatIban, isUppercaseTextField, normalizeIban, toTurkishUpperCase } from "./textFormatting";

export type RentalFixtureItem = { id: string; item: string; quantity: string; condition: string };
export type RentalAppendixSelection = { evacuation: boolean; handover: boolean; return: boolean; fixtures: boolean };

let fixtureSequence = 0;
export const createRentalFixtureItem = (): RentalFixtureItem => ({ id: `fixture-${Date.now()}-${++fixtureSequence}`, item: "", quantity: "", condition: "" });

/** Claude şablonundaki `Cinsi / Markası | Adet | Teslim Durumu` satır düzeniyle eski metin alanını birlikte korur. */
export function fixtureItemsFromLegacy(fixtures: string): RentalFixtureItem[] {
  return fixtures.split("\n").map((line, index) => line.split("|").map((value) => value.trim())).filter((parts) => parts.some(Boolean)).map((parts, index) => ({ id: `legacy-fixture-${index}`, item: parts[0] ?? "", quantity: parts[1] ?? "", condition: parts.slice(2).join(" | ") }));
}

export const fixtureItemsToLegacy = (items: RentalFixtureItem[]) => items.filter((item) => [item.item, item.quantity, item.condition].some((value) => value.trim())).map((item) => [item.item.trim(), item.quantity.trim(), item.condition.trim()].join(" | ")).join("\n");

export const rentalFixtureItems = (details: Pick<OfflineRentalDetails, "fixtures" | "fixtureItems">) => details.fixtureItems?.filter((item) => [item.item, item.quantity, item.condition].some((value) => value.trim())).length ? details.fixtureItems.filter((item) => [item.item, item.quantity, item.condition].some((value) => value.trim())) : fixtureItemsFromLegacy(details.fixtures);

export const rentalFixtureSummary = (details: Pick<OfflineRentalDetails, "fixtures" | "fixtureItems">) => fixtureItemsToLegacy(rentalFixtureItems(details)) || details.fixtures.trim();

export type OfflineRentalDetails = {
  useType: "residential" | "commercial";
  ownerName: string;
  ownerIdentity: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAddress: string;
  ownerVatRegistered: boolean;
  tenantName: string;
  tenantIdentity: string;
  tenantPhone: string;
  tenantEmail: string;
  tenantTaxOffice: string;
  tenantWithholdingRegistered: boolean;
  tenantAddress: string;
  guarantorName: string;
  guarantorIdentity: string;
  guarantorLimit: string;
  hasGuarantor: boolean;
  /** Fizikî kira sözleşmesinin taraflarca imzalandığını teyit eden yalnız back-office alanı. */
  signedByParties: boolean;
  signedAt: string;
  propertyNeighborhood: string;
  propertyAddress: string;
  propertyType: string;
  parcelInfo: string;
  independentSectionNo: string;
  occupancyPermit: "present" | "absent" | "unknown";
  condominiumStatus: "yes" | "no" | "unknown";
  fixtures: string;
  /** v3 snapshot’larında demirbaşlar satır bazlı tutulur; v1/v2 `fixtures` metni okunmaya devam eder. */
  fixtureItems?: RentalFixtureItem[];
  electricityMeterNo: string;
  waterMeterNo: string;
  naturalGasMeterNo: string;
  daskPolicyNo: string;
  meterNotes: string;
  monthlyRent: string;
  deposit: string;
  proratedStartDate: string;
  proratedEndDate: string;
  proratedDays: string;
  proratedAmount: string;
  currency: "TRY";
  vatCollection: "separate" | "included";
  paymentDay: string;
  /** İlk kira için sözleşme tarihinden en fazla beş gün sonrasına izin veren vade alanı. */
  firstPaymentDueDate: string;
  /** Ana sözleşmeyle birlikte yazdırılacak eklerin kullanıcı seçimi. */
  appendixSelection: RentalAppendixSelection;
  iban: string;
  startDate: string;
  durationMonths: string;
  noticeDays: string;
  /** Tahliye taahhüdünde tarafların ayrıca belirlediği tarih; sözleşme bitişinden otomatik türetilmez. */
  evacuationCommitmentDate?: string;
  kdvIncluded: boolean;
  usagePurpose: string;
  residentsCount: string;
  courtCity: string;
  documentPlace: string;
  ownerApproval: "pending" | "approved";
  consultantName: string;
  consultantCode: string;
  officeName: string;
  officeAuthorizationNo: string;
};

export const RENTAL_APPENDIX_TEMPLATE_VERSION = "global1881-rental-appendices-2026-08-v4";

export const emptyRentalDetails = (): OfflineRentalDetails => ({
  useType: "residential", ownerName: "", ownerIdentity: "", ownerPhone: "", ownerEmail: "", ownerAddress: "", ownerVatRegistered: false,
  tenantName: "", tenantIdentity: "", tenantPhone: "", tenantEmail: "", tenantTaxOffice: "", tenantWithholdingRegistered: false, tenantAddress: "", guarantorName: "", guarantorIdentity: "", guarantorLimit: "", hasGuarantor: false, signedByParties: false, signedAt: "",
  propertyNeighborhood: "", propertyAddress: "", propertyType: "", parcelInfo: "", independentSectionNo: "", occupancyPermit: "unknown", condominiumStatus: "unknown", fixtures: "", fixtureItems: [createRentalFixtureItem(), createRentalFixtureItem(), createRentalFixtureItem()], electricityMeterNo: "", waterMeterNo: "", naturalGasMeterNo: "", daskPolicyNo: "", meterNotes: "", monthlyRent: "", deposit: "", proratedStartDate: "", proratedEndDate: "", proratedDays: "", proratedAmount: "", currency: "TRY", vatCollection: "separate", paymentDay: "1", firstPaymentDueDate: addDays(new Date().toISOString().slice(0, 10), 5), appendixSelection: { evacuation: false, handover: true, return: false, fixtures: true }, iban: "",
  startDate: new Date().toISOString().slice(0, 10), durationMonths: "12", noticeDays: "60", kdvIncluded: false,
  usagePurpose: "Konut", residentsCount: "", courtCity: "Urla", documentPlace: "Urla", ownerApproval: "pending", consultantName: "", consultantCode: "", officeName: "Global 1881 Gayrimenkul", officeAuthorizationNo: "3500211",
});

/** Kira formundaki isim/adres alanlarını Türkçe büyük harfe, IBAN'ı kompakt biçime taşır. */
export function normalizeRentalField(key: keyof OfflineRentalDetails, value: string) {
  if (key === "iban") return normalizeIban(value);
  return isUppercaseTextField(String(key)) ? toTurkishUpperCase(value) : value;
}

export function normalizeRentalDetails(details: OfflineRentalDetails): OfflineRentalDetails {
  const normalized = { ...details };
  (Object.keys(normalized) as Array<keyof OfflineRentalDetails>).forEach((key) => {
    const value = normalized[key];
    if (typeof value === "string") {
      (normalized as Record<string, unknown>)[key] = normalizeRentalField(key, value);
    }
  });
  return normalized;
}

const money = (value: string) => {
  const compact = value.trim().replace(/\s/g, "");
  const normalized = compact.includes(",") ? compact.replace(/\./g, "").replace(",", ".") : compact.replace(/\./g, "");
  return Math.max(0, Math.round(Number(normalized) || 0));
};

/** Kuruş kabul etmeyen kira/depozito alanını Türkçe binlik ayırıcıyla biçimlendirir. */
export function formatWholeRentalAmount(raw: string) {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Number(digits));
}
const pad = (value: number) => String(value).padStart(2, "0");

export function addMonths(dateValue: string, months: number) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setMonth(date.getMonth() + months);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function subtractDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() - days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** İlk kira, ofis kuralı gereği sözleşme başlangıcından en fazla beş gün sonra vadelidir. */
export function firstPaymentDeadline(startDate: string) {
  return addDays(startDate, 5);
}

export function firstPaymentDueDate(startDate: string, requestedDate: string) {
  const deadline = firstPaymentDeadline(startDate);
  return /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && requestedDate >= startDate && requestedDate <= deadline ? requestedDate : deadline;
}

export function firstPaymentDate(startDate: string, paymentDay: number) {
  const start = new Date(`${startDate}T12:00:00`);
  const date = new Date(`${startDate}T12:00:00`);
  date.setDate(paymentDay);
  if (date.getTime() < start.getTime()) date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function calculateRentalSummary(details: OfflineRentalDetails) {
  const durationMonths = Math.max(1, Math.min(120, Number.parseInt(details.durationMonths, 10) || 12));
  const paymentDay = Math.max(1, Math.min(28, Number.parseInt(details.paymentDay, 10) || 1));
  const noticeDays = Math.max(1, Math.min(365, Number.parseInt(details.noticeDays, 10) || 60));
  const monthlyRent = money(details.monthlyRent);
  const endDate = addMonths(details.startDate, durationMonths);
  const maxFirstPaymentDate = firstPaymentDeadline(details.startDate);
  return { durationMonths, paymentDay, noticeDays, monthlyRent, annualRent: monthlyRent * 12, endDate, noticeDate: subtractDays(endDate, noticeDays), maxFirstPaymentDate, firstDueDate: firstPaymentDueDate(details.startDate, details.firstPaymentDueDate) };
}

export function renderRentalContract(details: OfflineRentalDetails) {
  const normalized = normalizeRentalDetails(details);
  const value = (raw: string) => raw.trim() || "................................";
  const summary = calculateRentalSummary(normalized);
  const kind = normalized.useType === "commercial" ? "İŞYERİ KİRA SÖZLEŞMESİ" : "KONUT KİRA SÖZLEŞMESİ";
  return [
    kind, "",
    `Kiraya veren: ${value(normalized.ownerName)} | TCKN/VKN: ${value(normalized.ownerIdentity)}`,
    `Kiracı: ${value(normalized.tenantName)} | TCKN/VKN: ${value(normalized.tenantIdentity)}`,
    `Taşınmaz: ${value(normalized.propertyAddress)} | Nitelik: ${value(normalized.propertyType)}`,
    `Ada/Parsel/Bağımsız Bölüm: ${value(normalized.parcelInfo)}`,
    `Kullanım amacı: ${value(normalized.usagePurpose)}`,
    `Aylık kira: ${value(normalized.monthlyRent)} ${normalized.currency} | Yıllık kira: ${summary.annualRent || "................................"} ${normalized.currency}`,
    `Depozito: ${value(normalized.deposit)} ${normalized.currency} | İlk kira son ödeme tarihi: ${formatTurkishDate(summary.firstDueDate)} (sözleşmeden en geç 5 gün sonra)`,
    `Sonraki aylarda ödeme günü: her ayın ${summary.paymentDay}. günü | IBAN: ${value(formatIban(normalized.iban))}`,
    `Süre: ${summary.durationMonths} ay | Başlangıç: ${formatTurkishDate(normalized.startDate)} | Bitiş: ${formatTurkishDate(summary.endDate)}`,
    `Tahliye ihbarı: ${summary.noticeDays} gün | Uyarı tarihi: ${formatTurkishDate(summary.noticeDate)}`,
    `Elektrik sayaç no: ${value(normalized.electricityMeterNo)} | Su sayaç no: ${value(normalized.waterMeterNo)} | Doğalgaz sayaç no: ${value(normalized.naturalGasMeterNo)}`,
    `DASK poliçe no: ${value(normalized.daskPolicyNo)} | Demirbaş/teslim notu: ${value(rentalFixtureSummary(normalized))} | Sayaç notu: ${value(normalized.meterNotes)}`,
    normalized.hasGuarantor ? `Kefil: ${value(normalized.guarantorName)} | TCKN: ${value(normalized.guarantorIdentity)} | Azami tutar: ${value(normalized.guarantorLimit)} ${normalized.currency}` : "",
    `Mülk sahibi yeniden kiralama onayı: ${normalized.ownerApproval === "approved" ? "onaylandı" : "onay bekliyor"}.`,
    `Danışman: ${value(normalized.consultantName)} | Kod: ${value(normalized.consultantCode)} | Ofis: ${value(normalized.officeName)} | Yetki belgesi: ${value(normalized.officeAuthorizationNo)}`,
    "", "TESLİM / DEMİRBAŞ VE İMZA EKİ",
    `Teslim/demirbaş listesi: ${value(rentalFixtureSummary(normalized))}`,
    `Elektrik / su / doğalgaz sayaç no: ${value(normalized.electricityMeterNo)} / ${value(normalized.waterMeterNo)} / ${value(normalized.naturalGasMeterNo)}`,
    `DASK poliçe no: ${value(normalized.daskPolicyNo)} | Sayaç / abonelik notu: ${value(normalized.meterNotes)}`,
    normalized.hasGuarantor ? "Kiraya Veren imza: ____________________    Kiracı imza: ____________________    Kefil imza: ____________________" : "Kiraya Veren imza: ____________________    Kiracı imza: ____________________",
    "", "HUSUSİ ŞARTLAR", "Hususi şartlar kira sözleşmesinin ayrılmaz bir parçasıdır.",
    ...rentalContractConditions(normalized, summary.endDate).map((condition, index) => `${index + 1}. ${condition}`),
    "", "Bu taslak offline cihazda oluşturulmuştur. Aktifleştirme, owner approval ve imza kontrolünden sonra gerçekleştirilmelidir.",
  ].join("\n");
}

export function createOfflineRentalSnapshot(details: OfflineRentalDetails, contractNo: string, sourceOwnerRecordId?: string, sourceTenantRecordId?: string, sourcePropertyRecordId?: string) {
  const normalized = normalizeRentalDetails(details);
  const summary = calculateRentalSummary(normalized);
  const evacuationCommitmentDate = normalized.evacuationCommitmentDate ?? "";
  const maskedDetails: OfflineRentalDetails = {
    ...normalized,
    ownerIdentity: maskIdentityOrTaxNo(details.ownerIdentity),
    ownerPhone: maskPhone(details.ownerPhone),
    tenantIdentity: maskIdentityOrTaxNo(details.tenantIdentity),
    tenantPhone: maskPhone(details.tenantPhone),
    guarantorIdentity: maskIdentityOrTaxNo(details.guarantorIdentity),
  };
  return {
    schema: "global1881-offline-rental-v6" as const,
    contractNo: contractNo.trim(),
    sourceOwnerRecordId,
    sourceTenantRecordId,
    sourcePropertyRecordId,
    ...maskedDetails,
    vatCollection: "separate" as const,
    summary,
    conditionTemplateVersion: RENTAL_CONDITIONS_TEMPLATE_VERSION,
    conditions: rentalContractConditions(normalized, summary.endDate),
    deliveryAppendix: { fixtures: rentalFixtureSummary(normalized), fixtureItems: rentalFixtureItems(normalized), meterNotes: normalized.meterNotes, electricityMeterNo: normalized.electricityMeterNo, waterMeterNo: normalized.waterMeterNo, naturalGasMeterNo: normalized.naturalGasMeterNo, daskPolicyNo: normalized.daskPolicyNo, deliveryDate: normalized.startDate },
    appendixTemplateVersion: RENTAL_APPENDIX_TEMPLATE_VERSION,
    appendices: { evacuation: { plannedDate: evacuationCommitmentDate, commitmentDate: evacuationCommitmentDate, includedInPackage: normalized.appendixSelection.evacuation }, handover: { plannedDate: normalized.startDate, includedInPackage: normalized.appendixSelection.handover, fixtures: rentalFixtureSummary(normalized), fixtureItems: rentalFixtureItems(normalized), electricityMeterNo: normalized.electricityMeterNo, waterMeterNo: normalized.waterMeterNo, naturalGasMeterNo: normalized.naturalGasMeterNo }, return: { plannedDate: summary.endDate, includedInPackage: normalized.appendixSelection.return, fixtures: rentalFixtureSummary(normalized), fixtureItems: rentalFixtureItems(normalized), electricityMeterNo: normalized.electricityMeterNo, waterMeterNo: normalized.waterMeterNo, naturalGasMeterNo: normalized.naturalGasMeterNo }, fixtures: { fixtures: rentalFixtureSummary(normalized), fixtureItems: rentalFixtureItems(normalized), meterNotes: normalized.meterNotes, includedInPackage: normalized.appendixSelection.fixtures } },
  };
}
