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
  propertyAddress: string;
  propertyType: string;
  parcelInfo: string;
  fixtures: string;
  meterNotes: string;
  monthlyRent: string;
  deposit: string;
  currency: "TRY";
  paymentDay: string;
  iban: string;
  startDate: string;
  durationMonths: string;
  noticeDays: string;
  kdvIncluded: boolean;
  usagePurpose: string;
  ownerApproval: "pending" | "approved";
  consultantName: string;
  consultantCode: string;
  officeName: string;
  officeAuthorizationNo: string;
};

export const emptyRentalDetails = (): OfflineRentalDetails => ({
  useType: "residential", ownerName: "", ownerIdentity: "", ownerPhone: "", ownerAddress: "",
  tenantName: "", tenantIdentity: "", tenantPhone: "", tenantAddress: "", guarantorName: "", guarantorIdentity: "", guarantorLimit: "",
  propertyAddress: "", propertyType: "", parcelInfo: "", fixtures: "", meterNotes: "", monthlyRent: "", deposit: "", currency: "TRY", paymentDay: "1", iban: "",
  startDate: new Date().toISOString().slice(0, 10), durationMonths: "12", noticeDays: "60", kdvIncluded: false,
  usagePurpose: "Konut", ownerApproval: "pending", consultantName: "", consultantCode: "", officeName: "Global 1881 Gayrimenkul", officeAuthorizationNo: "3500211",
});

const money = (value: string) => Number(value.replace(",", ".")) || 0;
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
    details.guarantorName.trim() ? `Kefil: ${details.guarantorName} | TCKN: ${value(details.guarantorIdentity)} | Azami tutar: ${value(details.guarantorLimit)} ${details.currency}` : "Kefil: belirtilmemiş.",
    `Mülk sahibi yeniden kiralama onayı: ${details.ownerApproval === "approved" ? "onaylandı" : "onay bekliyor"}.`,
    `Danışman: ${value(details.consultantName)} | Kod: ${value(details.consultantCode)} | Ofis: ${value(details.officeName)} | Yetki belgesi: ${value(details.officeAuthorizationNo)}`,
    "", "Bu taslak offline cihazda oluşturulmuştur. Aktifleştirme, owner approval ve imza kontrolünden sonra gerçekleştirilmelidir.",
  ].join("\n");
}

export function createOfflineRentalSnapshot(details: OfflineRentalDetails, contractNo: string, sourceOwnerRecordId?: string, sourceTenantRecordId?: string, sourcePropertyRecordId?: string) {
  return { schema: "global1881-offline-rental-v1" as const, contractNo: contractNo.trim(), sourceOwnerRecordId, sourceTenantRecordId, sourcePropertyRecordId, ...details, summary: calculateRentalSummary(details) };
}
