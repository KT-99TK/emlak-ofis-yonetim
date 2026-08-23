import { calculateAuthoritySummary, consultantInitials, toTurkishTitleCase, type AuthorityContractDetails } from "./authorityContract";
import type { OfflineRecord } from "./offlineStore";

type AuthoritySnapshot = Partial<AuthorityContractDetails> & {
  schema?: string;
  contractNo?: string;
  summary?: { contractAmount?: number; serviceFeeAmount?: number };
};

export type ConsultantAuthorityPerformance = {
  consultantName: string;
  consultantCode: string;
  initials: string;
  contractCount: number;
  contractAmountByCurrency: Record<string, number>;
  serviceFeeByCurrency: Record<string, number>;
  latestContractDate?: string;
};

function isAuthoritySnapshot(snapshot: AuthoritySnapshot) {
  return snapshot.schema === "global1881-offline-authority-v1" || snapshot.schema === "global1881-offline-authority-v2";
}

function addTotal(target: Record<string, number>, currency: string, value: number) {
  target[currency] = (target[currency] ?? 0) + value;
}

function safeDetails(snapshot: AuthoritySnapshot): AuthorityContractDetails {
  return {
    mode: snapshot.mode === "sale" ? "sale" : "rent",
    ownerName: snapshot.ownerName ?? "", ownerIdentity: snapshot.ownerIdentity ?? "", ownerPhone: snapshot.ownerPhone ?? "", ownerAddress: snapshot.ownerAddress ?? "",
    propertyAddress: snapshot.propertyAddress ?? "", parcelInfo: snapshot.parcelInfo ?? "", propertyType: snapshot.propertyType ?? "", grossM2: snapshot.grossM2 ?? "", roomCount: snapshot.roomCount ?? "", floorAndView: snapshot.floorAndView ?? "", condition: snapshot.condition ?? "",
    price: snapshot.price ?? "", currency: snapshot.currency === "USD" || snapshot.currency === "EUR" ? snapshot.currency : "TRY",
    serviceFeeRate: snapshot.serviceFeeRate ?? "", serviceFeeAmount: snapshot.serviceFeeAmount ?? "", contractDate: snapshot.contractDate ?? "",
    consultantName: snapshot.consultantName ?? "", consultantPhone: snapshot.consultantPhone ?? "", consultantCode: snapshot.consultantCode ?? "", consultantTitle: snapshot.consultantTitle ?? "",
    officeName: snapshot.officeName ?? "", officeAuthorizationNo: snapshot.officeAuthorizationNo ?? "", officePhone: snapshot.officePhone ?? "", officeAddress: snapshot.officeAddress ?? "",
  };
}

export function buildAuthorityPerformance(records: OfflineRecord[]): ConsultantAuthorityPerformance[] {
  const rows = new Map<string, ConsultantAuthorityPerformance>();
  for (const record of records) {
    if (record.entity !== "contract") continue;
    try {
      const snapshot = JSON.parse(record.details) as AuthoritySnapshot;
      if (!isAuthoritySnapshot(snapshot)) continue;
      const details = safeDetails(snapshot);
      const consultantName = toTurkishTitleCase(details.consultantName) || "Atanmamış danışman";
      const consultantCode = details.consultantCode.trim();
      const key = `${consultantCode || consultantInitials(consultantName)}:${consultantName.toLocaleLowerCase("tr-TR")}`;
      const current = rows.get(key) ?? {
        consultantName,
        consultantCode,
        initials: consultantInitials(consultantName),
        contractCount: 0,
        contractAmountByCurrency: {},
        serviceFeeByCurrency: {},
        latestContractDate: undefined,
      };
      const calculated = calculateAuthoritySummary(details);
      const contractAmount = snapshot.summary?.contractAmount ?? calculated.contractAmount;
      const serviceFeeAmount = snapshot.summary?.serviceFeeAmount ?? calculated.serviceFeeAmount;
      addTotal(current.contractAmountByCurrency, details.currency, contractAmount);
      addTotal(current.serviceFeeByCurrency, details.currency, serviceFeeAmount);
      current.contractCount += 1;
      if (details.contractDate && (!current.latestContractDate || details.contractDate > current.latestContractDate)) current.latestContractDate = details.contractDate;
      rows.set(key, current);
    } catch {
      // Bozuk bir taslak performans raporunu engellemez; yalnızca yok sayılır.
    }
  }
  return Array.from(rows.values()).sort((a, b) => (b.serviceFeeByCurrency.TRY ?? 0) - (a.serviceFeeByCurrency.TRY ?? 0) || b.contractCount - a.contractCount || a.consultantName.localeCompare(b.consultantName, "tr"));
}

export function sumAuthorityPerformance(rows: ConsultantAuthorityPerformance[]) {
  return rows.reduce((total, row) => ({
    contractCount: total.contractCount + row.contractCount,
    contractAmountByCurrency: Object.entries(row.contractAmountByCurrency).reduce((acc, [currency, amount]) => ({ ...acc, [currency]: (acc[currency] ?? 0) + amount }), total.contractAmountByCurrency),
    serviceFeeByCurrency: Object.entries(row.serviceFeeByCurrency).reduce((acc, [currency, amount]) => ({ ...acc, [currency]: (acc[currency] ?? 0) + amount }), total.serviceFeeByCurrency),
  }), { contractCount: 0, contractAmountByCurrency: {} as Record<string, number>, serviceFeeByCurrency: {} as Record<string, number> });
}
