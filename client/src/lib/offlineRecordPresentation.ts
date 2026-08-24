import type { OfflineRecord } from "./offlineStore";
import { titleCaseTurkish } from "./urlaNeighborhoods";

type Snapshot = Record<string, unknown>;
const parse = (value: string): Snapshot | null => { try { const result = JSON.parse(value); return result && typeof result === "object" ? result as Snapshot : null; } catch { return null; } };
const number = (value: unknown) => Math.max(0, Math.round(Number(value) || 0));
const money = (value: unknown, currency = "TRY") => new Intl.NumberFormat("tr-TR", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number(value));
const entityLabels: Record<OfflineRecord["entity"], string> = { client: "Müşteri", property: "Portföy", contract: "Sözleşme", contractArchive: "Sözleşme arşivi", obligation: "Vade kaydı", evacuation: "Tahliye bildirimi", ownerApproval: "Mülk sahibi onayı", ledger: "Ön muhasebe", target: "Ciro hedefi", request: "Müşteri talebi", transaction: "İşlem kapanışı" };

export type OfflineRecordPresentation = { label: string; summary: string };

/** Teknik snapshot veri yapısını açığa çıkarmadan yerel kayıt listesinde kullanılacak kısa özet. */
export function presentOfflineRecord(record: OfflineRecord): OfflineRecordPresentation {
  const raw = parse(record.details);
  if (!raw) return { label: entityLabels[record.entity], summary: record.details.trim() || "Açıklama yok" };
  const schema = String(raw.schema ?? "");
  if (record.entity === "contractArchive" || schema === "global1881-offline-contract-archive-v1") {
    return { label: "Sözleşme arşivi", summary: [String(raw.customerName ?? "Müşteri belirtilmemiş"), String(raw.documentTypeLabel ?? "Eski sözleşme"), String(raw.documentDateDisplay ?? ""), String(raw.originalFileName ?? "")].filter(Boolean).join(" · ") };
  }
  if (record.entity === "request" || schema === "global1881-offline-customer-request-v1") {
    const operation = raw.operation === "rental" ? "Kiralık" : "Satılık";
    const location = titleCaseTurkish(String(raw.location ?? "")) || "Konum belirtilmemiş";
    const propertyType = titleCaseTurkish(String(raw.propertyType ?? ""));
    const min = number(raw.minBudget); const max = number(raw.maxBudget);
    const budget = max ? `${min ? `${money(min)}–` : ""}${money(max)}` : min ? money(min) : "Bütçe belirtilmemiş";
    const requester = titleCaseTurkish(String(raw.requesterName ?? ""));
    return { label: "Müşteri talebi", summary: [operation, location, propertyType, budget, requester ? `Talep sahibi: ${requester}` : ""].filter(Boolean).join(" · ") };
  }
  if (record.entity === "target" || schema === "global1881-offline-annual-target-v1") return { label: "Ciro hedefi", summary: `${raw.year ?? "—"} · Hedef: ${money(raw.targetAmount, String(raw.currency ?? "TRY"))}` };
  if (record.entity === "transaction" || schema === "global1881-offline-transaction-v1") {
    const collections = Array.isArray(raw.collections) ? raw.collections : [];
    const expected = collections.reduce((total, item) => total + number((item as Snapshot).expectedAmount), 0);
    const verified = collections.filter((item) => (item as Snapshot).state === "verified").reduce((total, item) => total + number((item as Snapshot).collectedAmount), 0);
    return { label: "İşlem kapanışı", summary: [raw.kind === "rental" ? "Kira" : "Satış", String(raw.propertyLabel ?? ""), `Beklenen: ${money(expected)}`, `Doğrulanan: ${money(verified)}`, String(raw.status ?? "hazırlanıyor")].filter(Boolean).join(" · ") };
  }
  if (record.entity === "contract" && schema.startsWith("global1881-offline-authority")) return { label: "Yetki sözleşmesi", summary: [raw.mode === "sale" ? "Satış" : "Kiralama", String(raw.contractNo ?? ""), String(raw.propertyNeighborhood ?? ""), String(raw.propertyAddress ?? ""), raw.price ? `Bedel: ${money(raw.price, String(raw.currency ?? "TRY"))}` : ""].filter(Boolean).join(" · ") };
  if (record.entity === "contract" && schema.startsWith("global1881-offline-rental")) return { label: "Kira sözleşmesi", summary: [String(raw.contractNo ?? ""), String(raw.propertyNeighborhood ?? ""), String(raw.propertyAddress ?? ""), raw.monthlyRent ? `Aylık kira: ${money(raw.monthlyRent)}` : ""].filter(Boolean).join(" · ") };
  if (record.entity === "obligation") return { label: "Vade kaydı", summary: [String(raw.contractNo ?? ""), raw.recurring === "monthly" ? "Aylık tekrar" : "Planlı vade", raw.paymentDay ? `Ödeme günü: ${raw.paymentDay}` : ""].filter(Boolean).join(" · ") };
  if (record.entity === "ownerApproval") return { label: "Mülk sahibi onayı", summary: [String(raw.contractNo ?? ""), record.approvalDecision === "approved" ? "Onaylandı" : record.approvalDecision === "rejected" ? "Reddedildi" : "Onay bekliyor"].filter(Boolean).join(" · ") };
  if (record.entity === "ledger") return { label: "Ön muhasebe", summary: [String(raw.contractNo ?? ""), record.amount ? `Tutar: ${money(record.amount)}` : "", record.dueDate ? `Vade: ${record.dueDate}` : ""].filter(Boolean).join(" · ") };
  return { label: entityLabels[record.entity], summary: "Teknik ayrıntılar güvenli snapshot içinde saklanır." };
}
