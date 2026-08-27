import { listActiveRentalAttention } from "./activeRentalSummary";

export type RentalServiceSummary = {
  id: number;
  clientId: number;
  assignedUserId: number;
  clientName: string;
  tenantName: string;
  contractDate: Date | string;
  rentIncreaseDate?: Date | string | null;
  evictionDate?: Date | string | null;
};

export type RentalServiceKind = "rentIncrease" | "eviction" | "propertyTaxFirstInstallment" | "propertyTaxSecondInstallment" | "rentalIncomeTaxDeclaration" | "ownerLeaseReview" | "relettingPreparation";

export type RentalServiceAttention = {
  id: string;
  kind: RentalServiceKind;
  clientId: number;
  assignedUserId: number;
  activeRentalSummaryId?: number;
  clientName: string;
  tenantName?: string;
  date: Date;
  days: number;
  propertyCount?: number;
};

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function daysUntil(date: Date, now: Date) {
  return Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000);
}

function nextAnnualDate(monthIndex: number, day: number, now: Date) {
  const candidate = new Date(now.getFullYear(), monthIndex, day);
  if (candidate.getTime() < startOfDay(now).getTime()) candidate.setFullYear(candidate.getFullYear() + 1);
  return candidate;
}

function nextAnnualDateFromContract(contractDate: Date | string, now: Date) {
  const contract = new Date(contractDate);
  const candidate = new Date(now.getFullYear(), contract.getMonth(), contract.getDate());
  if (candidate.getTime() < startOfDay(now).getTime()) candidate.setFullYear(candidate.getFullYear() + 1);
  return candidate;
}

function daysBefore(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() - amount);
  return result;
}

export function listRentalServiceAttention(summaries: RentalServiceSummary[], now = new Date(), horizonDays = 45): RentalServiceAttention[] {
  const rentalEvents = summaries.flatMap((summary) => listActiveRentalAttention(summary, now, horizonDays).map((attention) => ({
    id: `rental-${attention.kind}-${summary.id}`,
    kind: attention.kind,
    clientId: summary.clientId,
    assignedUserId: summary.assignedUserId,
    activeRentalSummaryId: summary.id,
    clientName: summary.clientName,
    tenantName: summary.tenantName,
    date: attention.date,
    days: attention.days,
  })));

  const ownerGroups = new Map<number, { clientName: string; propertyCount: number; assignedUserId: number }>();
  summaries.forEach((summary) => {
    const owner = ownerGroups.get(summary.clientId) ?? { clientName: summary.clientName, propertyCount: 0, assignedUserId: summary.assignedUserId };
    owner.propertyCount += 1;
    ownerGroups.set(summary.clientId, owner);
  });

  const firstInstallmentCall = daysBefore(nextAnnualDate(4, 31, now), 15);
  const secondInstallmentCall = daysBefore(nextAnnualDate(10, 30, now), 15);
  const incomeDeclaration = nextAnnualDate(2, 31, now);
  const ownerEvents = Array.from(ownerGroups.entries()).flatMap(([clientId, owner]) => [
    { id: `property-tax-first-${clientId}-${firstInstallmentCall.getFullYear()}`, kind: "propertyTaxFirstInstallment" as const, clientId, assignedUserId: owner.assignedUserId, clientName: owner.clientName, date: firstInstallmentCall, days: daysUntil(firstInstallmentCall, now), propertyCount: owner.propertyCount },
    { id: `property-tax-second-${clientId}-${secondInstallmentCall.getFullYear()}`, kind: "propertyTaxSecondInstallment" as const, clientId, assignedUserId: owner.assignedUserId, clientName: owner.clientName, date: secondInstallmentCall, days: daysUntil(secondInstallmentCall, now), propertyCount: owner.propertyCount },
    { id: `rental-income-tax-${clientId}-${incomeDeclaration.getFullYear()}`, kind: "rentalIncomeTaxDeclaration" as const, clientId, assignedUserId: owner.assignedUserId, clientName: owner.clientName, date: incomeDeclaration, days: daysUntil(incomeDeclaration, now), propertyCount: owner.propertyCount },
  ]);

  const ownerReviewEvents = summaries.map((summary) => {
    const nextPeriodEnd = nextAnnualDateFromContract(summary.contractDate, now);
    const date = daysBefore(nextPeriodEnd, 60);
    return { id: `owner-lease-review-${summary.id}-${nextPeriodEnd.getFullYear()}`, kind: "ownerLeaseReview" as const, clientId: summary.clientId, assignedUserId: summary.assignedUserId, activeRentalSummaryId: summary.id, clientName: summary.clientName, tenantName: summary.tenantName, date, days: daysUntil(date, now) };
  });

  return [...rentalEvents, ...ownerEvents, ...ownerReviewEvents].filter((item) => item.days >= 0 && item.days <= horizonDays).sort((left, right) => left.days - right.days);
}

export function rentalServiceLabel(kind: RentalServiceKind) {
  if (kind === "rentIncrease") return "Kira artışı";
  if (kind === "eviction") return "Açık tahliye bildirimi";
  if (kind === "ownerLeaseReview") return "Malik kontrolü · kira dönemi";
  if (kind === "relettingPreparation") return "Yeniden kiralama hazırlığı";
  if (kind === "propertyTaxFirstInstallment") return "Emlak vergisi · 1. taksit için arama";
  if (kind === "propertyTaxSecondInstallment") return "Emlak vergisi · 2. taksit için arama";
  return "Kira geliri vergi dönemi";
}
