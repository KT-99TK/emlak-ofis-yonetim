import { listActiveRentalAttention } from "./activeRentalSummary";

export type RentalServiceSummary = {
  id: number;
  clientId: number;
  clientName: string;
  tenantName: string;
  contractDate: Date | string;
  rentIncreaseDate?: Date | string | null;
  evictionDate?: Date | string | null;
};

export type RentalServiceKind = "rentIncrease" | "eviction" | "propertyTaxFirstInstallment" | "propertyTaxSecondInstallment" | "rentalIncomeTaxDeclaration";

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

export function listRentalServiceAttention(summaries: RentalServiceSummary[], now = new Date(), horizonDays = 45): RentalServiceAttention[] {
  const rentalEvents = summaries.flatMap((summary) => listActiveRentalAttention(summary, now, horizonDays).map((attention) => ({
    id: `rental-${attention.kind}-${summary.id}`,
    kind: attention.kind,
    clientId: summary.clientId,
    assignedUserId: (summary as RentalServiceSummary & { assignedUserId?: number }).assignedUserId ?? 0,
    activeRentalSummaryId: summary.id,
    clientName: summary.clientName,
    tenantName: summary.tenantName,
    date: attention.date,
    days: attention.days,
  })));
  const ownerGroups = new Map<number, { clientName: string; propertyCount: number; assignedUserId: number }>();
  summaries.forEach((summary) => {
    const owner = ownerGroups.get(summary.clientId) ?? { clientName: summary.clientName, propertyCount: 0, assignedUserId: (summary as RentalServiceSummary & { assignedUserId?: number }).assignedUserId ?? 0 };
    owner.propertyCount += 1;
    ownerGroups.set(summary.clientId, owner);
  });
  const firstInstallment = nextAnnualDate(4, 31, now);
  const secondInstallment = nextAnnualDate(10, 30, now);
  const incomeDeclaration = nextAnnualDate(2, 31, now);
  const ownerEvents = Array.from(ownerGroups.entries()).flatMap(([clientId, owner]) => [
    { id: `property-tax-first-${clientId}-${firstInstallment.getFullYear()}`, kind: "propertyTaxFirstInstallment" as const, clientId, assignedUserId: owner.assignedUserId, clientName: owner.clientName, date: firstInstallment, days: daysUntil(firstInstallment, now), propertyCount: owner.propertyCount },
    { id: `property-tax-second-${clientId}-${secondInstallment.getFullYear()}`, kind: "propertyTaxSecondInstallment" as const, clientId, assignedUserId: owner.assignedUserId, clientName: owner.clientName, date: secondInstallment, days: daysUntil(secondInstallment, now), propertyCount: owner.propertyCount },
    { id: `rental-income-tax-${clientId}-${incomeDeclaration.getFullYear()}`, kind: "rentalIncomeTaxDeclaration" as const, clientId, assignedUserId: owner.assignedUserId, clientName: owner.clientName, date: incomeDeclaration, days: daysUntil(incomeDeclaration, now), propertyCount: owner.propertyCount },
  ]);
  return [...rentalEvents, ...ownerEvents].filter((item) => item.days <= horizonDays).sort((left, right) => left.days - right.days);
}

export function rentalServiceLabel(kind: RentalServiceKind) {
  if (kind === "rentIncrease") return "Kira artışı";
  if (kind === "eviction") return "Tahliye / sözleşme bitişi";
  if (kind === "propertyTaxFirstInstallment") return "Emlak vergisi · 1. taksit";
  if (kind === "propertyTaxSecondInstallment") return "Emlak vergisi · 2. taksit";
  return "Kira geliri vergi dönemi";
}
