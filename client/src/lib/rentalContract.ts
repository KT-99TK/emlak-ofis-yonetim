import { RENTAL_CONDITIONS_TEMPLATE_VERSION, rentalContractConditions } from "./rentalConditions";

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
  ownerAddress: string;
  tenantName: string;
  tenantIdentity: string;
  tenantPhone: string;
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

export const RENTAL_APPENDIX_TEMPLATE_VERSION = "global1881-rental-appendices-2026-08-v3";

export const emptyRentalDetails = (): OfflineRentalDetails => ({
  useType: "residential", ownerName: "", ownerIdentity: "", ownerPhone: "", ownerAddress: "",
  tenantName: "", tenantIdentity: "", tenantPhone: "", tenantAddress: "", guarantorName: "", guarantorIdentity: "", guarantorLimit: "", hasGuarantor: false, signedByParties: false, signedAt: "",
  propertyNeighborhood: "", propertyAddress: "", propertyType: "", parcelInfo: "", fixtures: "", fixtureItems: [createRentalFixtureItem(), createRentalFixtureItem(), createRentalFixtureItem()], electricityMeterNo: "", waterMeterNo: "", naturalGasMeterNo: "", daskPolicyNo: "", meterNotes: "", monthlyRent: "", deposit: "", currency: "TRY", vatCollection: "separate", paymentDay: "1", firstPaymentDueDate: addDays(new Date().toISOString().slice(0, 10), 5), appendixSelection: { evacuation: false, handover: true, return: false, fixtures: true }, iban: "",
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
    `Depozito: ${value(details.deposit)} ${details.currency} | İlk kira son ödeme tarihi: ${summary.firstDueDate} (sözleşmeden en geç 5 gün sonra)`,
    `Sonraki aylarda ödeme günü: her ayın ${summary.paymentDay}. günü | IBAN: ${value(details.iban)}`,
    `Süre: ${summary.durationMonths} ay | Başlangıç: ${value(details.startDate)} | Bitiş: ${summary.endDate}`,
    `Tahliye ihbarı: ${summary.noticeDays} gün | Uyarı tarihi: ${summary.noticeDate}`,
    `Elektrik sayaç no: ${value(details.electricityMeterNo)} | Su sayaç no: ${value(details.waterMeterNo)} | Doğalgaz sayaç no: ${value(details.naturalGasMeterNo)}`,
    `DASK poliçe no: ${value(details.daskPolicyNo)} | Demirbaş/teslim notu: ${value(rentalFixtureSummary(details))} | Sayaç notu: ${value(details.meterNotes)}`,
    details.hasGuarantor ? `Kefil: ${value(details.guarantorName)} | TCKN: ${value(details.guarantorIdentity)} | Azami tutar: ${value(details.guarantorLimit)} ${details.currency}` : "",
    `Mülk sahibi yeniden kiralama onayı: ${details.ownerApproval === "approved" ? "onaylandı" : "onay bekliyor"}.`,
    `Danışman: ${value(details.consultantName)} | Kod: ${value(details.consultantCode)} | Ofis: ${value(details.officeName)} | Yetki belgesi: ${value(details.officeAuthorizationNo)}`,
    "", "TESLİM / DEMİRBAŞ VE İMZA EKİ",
    `Teslim/demirbaş listesi: ${value(rentalFixtureSummary(details))}`,
    `Elektrik / su / doğalgaz sayaç no: ${value(details.electricityMeterNo)} / ${value(details.waterMeterNo)} / ${value(details.naturalGasMeterNo)}`,
    `DASK poliçe no: ${value(details.daskPolicyNo)} | Sayaç / abonelik notu: ${value(details.meterNotes)}`,
    details.hasGuarantor ? "Kiraya Veren imza: ____________________    Kiracı imza: ____________________    Kefil imza: ____________________" : "Kiraya Veren imza: ____________________    Kiracı imza: ____________________",
    "", "SÖZLEŞME KOŞULLARI",
    ...rentalContractConditions(details, summary.endDate).map((condition, index) => `${index + 1}. ${condition}`),
    "", "Bu taslak offline cihazda oluşturulmuştur. Aktifleştirme, owner approval ve imza kontrolünden sonra gerçekleştirilmelidir.",
  ].join("\n");
}

export function createOfflineRentalSnapshot(details: OfflineRentalDetails, contractNo: string, sourceOwnerRecordId?: string, sourceTenantRecordId?: string, sourcePropertyRecordId?: string) {
  const summary = calculateRentalSummary(details);
  return {
    schema: "global1881-offline-rental-v6" as const,
    contractNo: contractNo.trim(),
    sourceOwnerRecordId,
    sourceTenantRecordId,
    sourcePropertyRecordId,
    ...details,
    vatCollection: "separate" as const,
    summary,
    conditionTemplateVersion: RENTAL_CONDITIONS_TEMPLATE_VERSION,
    conditions: rentalContractConditions(details, summary.endDate),
    deliveryAppendix: { fixtures: rentalFixtureSummary(details), fixtureItems: rentalFixtureItems(details), meterNotes: details.meterNotes, electricityMeterNo: details.electricityMeterNo, waterMeterNo: details.waterMeterNo, naturalGasMeterNo: details.naturalGasMeterNo, daskPolicyNo: details.daskPolicyNo, deliveryDate: details.startDate },
    appendixTemplateVersion: RENTAL_APPENDIX_TEMPLATE_VERSION,
    appendices: { evacuation: { plannedDate: summary.endDate, includedInPackage: details.appendixSelection.evacuation }, handover: { plannedDate: details.startDate, includedInPackage: details.appendixSelection.handover, fixtures: rentalFixtureSummary(details), fixtureItems: rentalFixtureItems(details), electricityMeterNo: details.electricityMeterNo, waterMeterNo: details.waterMeterNo, naturalGasMeterNo: details.naturalGasMeterNo }, return: { plannedDate: summary.endDate, includedInPackage: details.appendixSelection.return, fixtures: rentalFixtureSummary(details), fixtureItems: rentalFixtureItems(details), electricityMeterNo: details.electricityMeterNo, waterMeterNo: details.waterMeterNo, naturalGasMeterNo: details.naturalGasMeterNo }, fixtures: { fixtures: rentalFixtureSummary(details), fixtureItems: rentalFixtureItems(details), meterNotes: details.meterNotes, includedInPackage: details.appendixSelection.fixtures } },
  };
}
