import { RENTAL_CONDITIONS_TEMPLATE_VERSION, rentalContractConditions } from "./rentalConditions";

export type OfflineRentalDetails = {
  useType: "residential" | "commercial";
  ownerName: string;
  ownerIdentity: string;
  ownerPhone: string;
  ownerAddress: string;
  tenantName: string;
  tenantIdentity: string;
  tenantPhone: string;
  tenantAddress: string;
  guarantorName: string;
  guarantorIdentity: string;
  guarantorLimit: string;
  hasGuarantor: boolean;
  propertyNeighborhood: string;
  propertyAddress: string;
  propertyType: string;
  parcelInfo: string;
  fixtures: string;
  meterNotes: string;
  monthlyRent: string;
  deposit: string;
  currency: "TRY";
  vatCollection: "separate" | "included";
  paymentDay: string;
  iban: string;
  startDate: string;
  durationMonths: string;
  noticeDays: string;
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

export const RENTAL_APPENDIX_TEMPLATE_VERSION = "global1881-rental-appendices-2026-08-v1";

export const emptyRentalDetails = (): OfflineRentalDetails => ({
  useType: "residential", ownerName: "", ownerIdentity: "", ownerPhone: "", ownerAddress: "",
  tenantName: "", tenantIdentity: "", tenantPhone: "", tenantAddress: "", guarantorName: "", guarantorIdentity: "", guarantorLimit: "", hasGuarantor: false,
  propertyNeighborhood: "", propertyAddress: "", propertyType: "", parcelInfo: "", fixtures: "", meterNotes: "", monthlyRent: "", deposit: "", currency: "TRY", vatCollection: "separate", paymentDay: "1", iban: "",
  startDate: new Date().toISOString().slice(0, 10), durationMonths: "12", noticeDays: "60", kdvIncluded: false,
  usagePurpose: "Konut", residentsCount: "", courtCity: "Urla", documentPlace: "Urla", ownerApproval: "pending", consultantName: "", consultantCode: "", officeName: "Global 1881 Gayrimenkul", officeAuthorizationNo: "3500211",
});

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
  return { durationMonths, paymentDay, noticeDays, monthlyRent, annualRent: monthlyRent * 12, endDate, noticeDate: subtractDays(endDate, noticeDays), firstDueDate: firstPaymentDate(details.startDate, paymentDay) };
}

export function renderRentalContract(details: OfflineRentalDetails) {
  const value = (raw: string) => raw.trim() || "................................";
  const summary = calculateRentalSummary(details);
  const kind = details.useType === "commercial" ? "İŞYERİ KİRA SÖZLEŞMESİ" : "KONUT KİRA SÖZLEŞMESİ";
  return [
    kind, "",
    `Kiraya veren: ${value(details.ownerName)} | TCKN/VKN: ${value(details.ownerIdentity)}`,
    `Kiracı: ${value(details.tenantName)} | TCKN/VKN: ${value(details.tenantIdentity)}`,
    `Taşınmaz: ${value(details.propertyAddress)} | Nitelik: ${value(details.propertyType)}`,
    `Ada/Parsel/Bağımsız Bölüm: ${value(details.parcelInfo)}`,
    `Kullanım amacı: ${value(details.usagePurpose)}`,
    `Aylık kira: ${value(details.monthlyRent)} ${details.currency} | Yıllık kira: ${summary.annualRent || "................................"} ${details.currency}`,
    `Depozito: ${value(details.deposit)} ${details.currency} | Ödeme günü: her ayın ${summary.paymentDay}. günü | IBAN: ${value(details.iban)}`,
    `Süre: ${summary.durationMonths} ay | Başlangıç: ${value(details.startDate)} | Bitiş: ${summary.endDate}`,
    `Tahliye ihbarı: ${summary.noticeDays} gün | Uyarı tarihi: ${summary.noticeDate}`,
    `Demirbaş/teslim notu: ${value(details.fixtures)} | Sayaç notu: ${value(details.meterNotes)}`,
    details.hasGuarantor ? `Kefil: ${value(details.guarantorName)} | TCKN: ${value(details.guarantorIdentity)} | Azami tutar: ${value(details.guarantorLimit)} ${details.currency}` : "",
    `Mülk sahibi yeniden kiralama onayı: ${details.ownerApproval === "approved" ? "onaylandı" : "onay bekliyor"}.`,
    `Danışman: ${value(details.consultantName)} | Kod: ${value(details.consultantCode)} | Ofis: ${value(details.officeName)} | Yetki belgesi: ${value(details.officeAuthorizationNo)}`,
    "", "TESLİM / DEMİRBAŞ VE İMZA EKİ",
    `Teslim/demirbaş listesi: ${value(details.fixtures)}`,
    `Sayaç / abonelik notu: ${value(details.meterNotes)}`,
    "Kiraya Veren imza: ____________________    Kiracı imza: ____________________    Danışman imza: ____________________",
    "", "SÖZLEŞME KOŞULLARI",
    ...rentalContractConditions(details, summary.endDate).map((condition, index) => `${index + 1}. ${condition}`),
    "", "Bu taslak offline cihazda oluşturulmuştur. Aktifleştirme, owner approval ve imza kontrolünden sonra gerçekleştirilmelidir.",
  ].join("\n");
}

export function createOfflineRentalSnapshot(details: OfflineRentalDetails, contractNo: string, sourceOwnerRecordId?: string, sourceTenantRecordId?: string, sourcePropertyRecordId?: string) {
  const summary = calculateRentalSummary(details);
  return {
    schema: "global1881-offline-rental-v2" as const,
    contractNo: contractNo.trim(),
    sourceOwnerRecordId,
    sourceTenantRecordId,
    sourcePropertyRecordId,
    ...details,
    summary,
    conditionTemplateVersion: RENTAL_CONDITIONS_TEMPLATE_VERSION,
    conditions: rentalContractConditions(details, summary.endDate),
    deliveryAppendix: { fixtures: details.fixtures, meterNotes: details.meterNotes, deliveryDate: details.startDate },
    appendixTemplateVersion: RENTAL_APPENDIX_TEMPLATE_VERSION,
    appendices: { evacuation: { plannedDate: summary.endDate }, handover: { plannedDate: details.startDate }, return: { plannedDate: summary.endDate }, fixtures: { fixtures: details.fixtures, meterNotes: details.meterNotes } },
  };
}
