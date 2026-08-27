export function normalizeActiveRentalText(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
}

export function calculateIncreasedRent(currentRent: string | number, ratePercent: string | number) {
  const current = Number(currentRent);
  const rate = Number(ratePercent);
  if (!Number.isFinite(current) || !Number.isFinite(rate) || current <= 0 || rate <= 0) return null;
  return current * (1 + rate / 100);
}

export function nextRentIncreaseDate(summary: { contractDate: Date | string; rentIncreaseDate?: Date | string | null }, now = new Date()) {
  if (summary.rentIncreaseDate) return new Date(summary.rentIncreaseDate);
  const contract = new Date(summary.contractDate);
  const candidate = new Date(now.getFullYear(), contract.getMonth(), contract.getDate());
  if (candidate.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) {
    candidate.setFullYear(candidate.getFullYear() + 1);
  }
  return candidate;
}

export function listActiveRentalAttention(summary: { id: number; contractDate: Date | string; rentIncreaseDate?: Date | string | null; evictionDate?: Date | string | null }, now = new Date(), horizonDays = 45) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const attention: Array<{ kind: "rentIncrease" | "eviction"; date: Date; days: number }> = [];
  
  const increaseDate = nextRentIncreaseDate(summary, now);
  const increaseDays = Math.round((increaseDate.getTime() - today.getTime()) / 86_400_000);
  if (increaseDays <= horizonDays) attention.push({ kind: "rentIncrease", date: increaseDate, days: increaseDays });
  
  if (summary.evictionDate) {
    const eviction = new Date(summary.evictionDate);
    const evictionDays = Math.round((eviction.getTime() - today.getTime()) / 86_400_000);
    if (evictionDays <= horizonDays) attention.push({ kind: "eviction", date: eviction, days: evictionDays });
  }
  
  return attention.sort((a, b) => a.days - b.days);
}

export function buildRentIncreaseNoticeDraft(input: { tenantName: string; neighborhood: string; currentRent: string | number; proposedRent: number; increaseRate: string | number; effectiveDate: Date }) {
  const formatter = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });
  const dateStr = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(input.effectiveDate);
  return `Sayın ${input.tenantName},\n\n${input.neighborhood} mahallesindeki kiralamanızın ${dateStr} tarihi itibarıyla yeni dönemi başlamaktadır.\n\nSözleşmeniz uyarınca uygulanacak artış oranı %${input.increaseRate} olarak belirlenmiş olup, yeni dönem aylık kira bedeliniz ${formatter.format(input.proposedRent)} olmuştur.\n\nBilgilerinize sunar, iyi günler dileriz.\n\nGlobal 1881 Gayrimenkul`;
}
