import { calculateAuthoritySummary, consultantInitials, toTurkishTitleCase, type AuthorityContractDetails } from "./authorityContract";
import { calculateRentalSummary, emptyRentalDetails, type OfflineRentalDetails } from "./rentalContract";
import { calculateVatCollectionScenario } from "./vatCollection";
import type { OfflineRecord } from "./offlineStore";

type AuthoritySnapshot = Partial<AuthorityContractDetails> & { schema?: string; contractNo?: string; summary?: { contractAmount?: number; serviceFeeAmount?: number } };
type RentalSnapshot = Partial<OfflineRentalDetails> & { schema?: string; contractNo?: string; summary?: { monthlyRent?: number } };

export type ConsultantAuthorityPerformance = {
  consultantName: string;
  consultantCode: string;
  initials: string;
  contractCount: number;
  saleContractCount: number;
  rentalContractCount: number;
  contractAmountByCurrency: Record<string, number>;
  serviceFeeByCurrency: Record<string, number>;
  expectedVatByCurrency: Record<string, number>;
  netServiceIncomeByCurrency: Record<string, number>;
  absorbedVatLossByCurrency: Record<string, number>;
  latestContractDate?: string;
};

export type YearlyVatCollectionSummary = { year: string; contractCount: number; expectedVatByCurrency: Record<string, number>; netServiceIncomeByCurrency: Record<string, number>; absorbedVatLossByCurrency: Record<string, number> };

type PerformanceItem = { consultantName: string; consultantCode: string; kind: "sale" | "rental"; currency: string; contractAmount: number; serviceFeeExcludingVat: number; vatCollection: "separate" | "included"; date: string };

function isAuthoritySnapshot(snapshot: AuthoritySnapshot | RentalSnapshot): snapshot is AuthoritySnapshot { return snapshot.schema === "global1881-offline-authority-v1" || snapshot.schema === "global1881-offline-authority-v2"; }
function isRentalSnapshot(snapshot: AuthoritySnapshot | RentalSnapshot): snapshot is RentalSnapshot { return snapshot.schema === "global1881-offline-rental-v1" || snapshot.schema === "global1881-offline-rental-v2" || snapshot.schema === "global1881-offline-rental-v3" || snapshot.schema === "global1881-offline-rental-v4"; }
function addTotal(target: Record<string, number>, currency: string, value: number) { target[currency] = Math.round(((target[currency] ?? 0) + value) * 100) / 100; }

function safeAuthorityDetails(snapshot: AuthoritySnapshot): AuthorityContractDetails {
  return {
    mode: snapshot.mode === "sale" ? "sale" : "rent", ownerName: snapshot.ownerName ?? "", ownerIdentity: snapshot.ownerIdentity ?? "", ownerPhone: snapshot.ownerPhone ?? "", ownerAddress: snapshot.ownerAddress ?? "",
    propertyNeighborhood: snapshot.propertyNeighborhood ?? "", propertyAddress: snapshot.propertyAddress ?? "", parcelInfo: snapshot.parcelInfo ?? "", propertyType: snapshot.propertyType ?? "", grossM2: snapshot.grossM2 ?? "", roomCount: snapshot.roomCount ?? "", floorAndView: snapshot.floorAndView ?? "", condition: snapshot.condition ?? "",
    price: snapshot.price ?? "", currency: snapshot.currency === "USD" || snapshot.currency === "EUR" ? snapshot.currency : "TRY", serviceFeeRate: snapshot.serviceFeeRate ?? "", serviceFeeAmount: snapshot.serviceFeeAmount ?? "", vatCollection: snapshot.vatCollection === "included" ? "included" : "separate", contractDate: snapshot.contractDate ?? "", authorityDurationMonths: snapshot.authorityDurationMonths ?? "3",
    consultantName: snapshot.consultantName ?? "", consultantPhone: snapshot.consultantPhone ?? "", consultantCode: snapshot.consultantCode ?? "", consultantTitle: snapshot.consultantTitle ?? "", officeName: snapshot.officeName ?? "", officeAuthorizationNo: snapshot.officeAuthorizationNo ?? "", officeTaxOffice: snapshot.officeTaxOffice ?? "", officeTaxNo: snapshot.officeTaxNo ?? "", officePhone: snapshot.officePhone ?? "", officeAddress: snapshot.officeAddress ?? "",
  };
}

function safeRentalDetails(snapshot: RentalSnapshot): OfflineRentalDetails {
  const { currency: _currency, ...snapshotWithoutCurrency } = snapshot;
  return { ...emptyRentalDetails(), ...snapshotWithoutCurrency, useType: snapshot.useType === "commercial" ? "commercial" : "residential", currency: "TRY", vatCollection: snapshot.vatCollection === "included" ? "included" : "separate", ownerApproval: snapshot.ownerApproval === "approved" ? "approved" : "pending", kdvIncluded: Boolean(snapshot.kdvIncluded) };
}

function authorityServiceFee(details: AuthorityContractDetails, snapshot: AuthoritySnapshot) {
  const calculated = calculateAuthoritySummary(details);
  const snapshotFee = snapshot.summary?.serviceFeeAmount;
  if (snapshotFee && snapshotFee > 0) return snapshotFee;
  if (calculated.serviceFeeAmount > 0) return calculated.serviceFeeAmount;
  return details.mode === "sale" ? Math.round(calculated.contractAmount * 0.02) : calculated.contractAmount;
}

function performanceItems(records: OfflineRecord[]): PerformanceItem[] {
  const items: PerformanceItem[] = [];
  for (const record of records) {
    if (record.entity !== "contract") continue;
    try {
      const snapshot = JSON.parse(record.details) as AuthoritySnapshot | RentalSnapshot;
      if (isAuthoritySnapshot(snapshot)) {
        const details = safeAuthorityDetails(snapshot);
        if (details.mode !== "sale") continue;
        const calculated = calculateAuthoritySummary(details);
        items.push({ consultantName: details.consultantName, consultantCode: details.consultantCode, kind: details.mode === "sale" ? "sale" : "rental", currency: details.currency, contractAmount: snapshot.summary?.contractAmount ?? calculated.contractAmount, serviceFeeExcludingVat: authorityServiceFee(details, snapshot), vatCollection: details.vatCollection, date: details.contractDate });
      } else if (isRentalSnapshot(snapshot)) {
        const details = safeRentalDetails(snapshot);
        const calculated = calculateRentalSummary(details);
        items.push({ consultantName: details.consultantName, consultantCode: details.consultantCode, kind: "rental", currency: "TRY", contractAmount: calculated.monthlyRent, serviceFeeExcludingVat: calculated.monthlyRent, vatCollection: details.vatCollection, date: details.startDate });
      }
    } catch { /* Bozuk yerel kayıt, diğer performans kalemlerini engellemez. */ }
  }
  return items;
}

function addItem(target: ConsultantAuthorityPerformance, item: PerformanceItem) {
  const vat = calculateVatCollectionScenario(item.serviceFeeExcludingVat, item.vatCollection);
  addTotal(target.contractAmountByCurrency, item.currency, item.contractAmount);
  addTotal(target.serviceFeeByCurrency, item.currency, item.serviceFeeExcludingVat);
  addTotal(target.expectedVatByCurrency, item.currency, vat.separatelyUncollectedVat || vat.invoiceVatPayable);
  addTotal(target.netServiceIncomeByCurrency, item.currency, vat.netServiceIncome);
  addTotal(target.absorbedVatLossByCurrency, item.currency, vat.absorbedVatLoss);
  target.contractCount += 1;
  if (item.kind === "sale") target.saleContractCount += 1; else target.rentalContractCount += 1;
  if (item.date && (!target.latestContractDate || item.date > target.latestContractDate)) target.latestContractDate = item.date;
}

export function buildAuthorityPerformance(records: OfflineRecord[]): ConsultantAuthorityPerformance[] {
  const rows = new Map<string, ConsultantAuthorityPerformance>();
  for (const item of performanceItems(records)) {
    const consultantName = toTurkishTitleCase(item.consultantName) || "Atanmamış danışman";
    const consultantCode = item.consultantCode.trim();
    const key = `${consultantCode || consultantInitials(consultantName)}:${consultantName.toLocaleLowerCase("tr-TR")}`;
    const row = rows.get(key) ?? { consultantName, consultantCode, initials: consultantInitials(consultantName), contractCount: 0, saleContractCount: 0, rentalContractCount: 0, contractAmountByCurrency: {}, serviceFeeByCurrency: {}, expectedVatByCurrency: {}, netServiceIncomeByCurrency: {}, absorbedVatLossByCurrency: {}, latestContractDate: undefined };
    addItem(row, item); rows.set(key, row);
  }
  return Array.from(rows.values()).sort((a, b) => (b.absorbedVatLossByCurrency.TRY ?? 0) - (a.absorbedVatLossByCurrency.TRY ?? 0) || (b.serviceFeeByCurrency.TRY ?? 0) - (a.serviceFeeByCurrency.TRY ?? 0) || a.consultantName.localeCompare(b.consultantName, "tr"));
}

export function sumAuthorityPerformance(rows: ConsultantAuthorityPerformance[]) {
  return rows.reduce((total, row) => ({
    contractCount: total.contractCount + row.contractCount, saleContractCount: total.saleContractCount + row.saleContractCount, rentalContractCount: total.rentalContractCount + row.rentalContractCount,
    contractAmountByCurrency: mergeCurrency(total.contractAmountByCurrency, row.contractAmountByCurrency), serviceFeeByCurrency: mergeCurrency(total.serviceFeeByCurrency, row.serviceFeeByCurrency), expectedVatByCurrency: mergeCurrency(total.expectedVatByCurrency, row.expectedVatByCurrency), netServiceIncomeByCurrency: mergeCurrency(total.netServiceIncomeByCurrency, row.netServiceIncomeByCurrency), absorbedVatLossByCurrency: mergeCurrency(total.absorbedVatLossByCurrency, row.absorbedVatLossByCurrency),
  }), { contractCount: 0, saleContractCount: 0, rentalContractCount: 0, contractAmountByCurrency: {} as Record<string, number>, serviceFeeByCurrency: {} as Record<string, number>, expectedVatByCurrency: {} as Record<string, number>, netServiceIncomeByCurrency: {} as Record<string, number>, absorbedVatLossByCurrency: {} as Record<string, number> });
}

function mergeCurrency(left: Record<string, number>, right: Record<string, number>) { const result = { ...left }; for (const [currency, value] of Object.entries(right)) addTotal(result, currency, value); return result; }

export function buildYearlyVatCollectionSummary(records: OfflineRecord[]): YearlyVatCollectionSummary[] {
  const rows = new Map<string, YearlyVatCollectionSummary>();
  for (const item of performanceItems(records)) {
    const year = /^\d{4}/.test(item.date) ? item.date.slice(0, 4) : "Tarihsiz";
    const row = rows.get(year) ?? { year, contractCount: 0, expectedVatByCurrency: {}, netServiceIncomeByCurrency: {}, absorbedVatLossByCurrency: {} };
    const vat = calculateVatCollectionScenario(item.serviceFeeExcludingVat, item.vatCollection);
    row.contractCount += 1; addTotal(row.expectedVatByCurrency, item.currency, vat.separatelyUncollectedVat || vat.invoiceVatPayable); addTotal(row.netServiceIncomeByCurrency, item.currency, vat.netServiceIncome); addTotal(row.absorbedVatLossByCurrency, item.currency, vat.absorbedVatLoss); rows.set(year, row);
  }
  return Array.from(rows.values()).sort((a, b) => b.year.localeCompare(a.year));
}
