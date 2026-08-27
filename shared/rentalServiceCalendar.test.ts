import { describe, expect, it } from "vitest";
import { listRentalServiceAttention, rentalServiceLabel } from "./rentalServiceCalendar";

const summary = {
  id: 18,
  clientId: 7,
  assignedUserId: 12,
  clientName: "Mustafa Ekin",
  tenantName: "Kiracı",
  contractDate: new Date("2025-05-30T12:00:00"),
};

describe("rentalServiceCalendar", () => {
  it("yıllık dönem sonunu tahliye olarak üretmez; 60 gün önce malik kontrolü üretir", () => {
    const items = listRentalServiceAttention([summary], new Date("2026-03-01T12:00:00"), 45);
    const ownerReview = items.find((item) => item.kind === "ownerLeaseReview");
    expect(ownerReview).toMatchObject({ activeRentalSummaryId: 18, assignedUserId: 12, date: new Date("2026-03-31T00:00:00") });
    expect(items.some((item) => item.kind === "eviction")).toBe(false);
  });

  it("emlak vergisi aramasını varsayılan son ödeme gününden 15 gün önce üretir", () => {
    const items = listRentalServiceAttention([summary], new Date("2026-04-01T12:00:00"), 50);
    const firstTaxCall = items.find((item) => item.kind === "propertyTaxFirstInstallment");
    expect(firstTaxCall?.date).toEqual(new Date("2026-05-16T00:00:00"));
    expect(firstTaxCall?.days).toBe(45);
  });

  it("açık tahliye tarihi varsa onu ayrı bir tahliye bildirimi olarak gösterir", () => {
    const items = listRentalServiceAttention([{ ...summary, evictionDate: new Date("2026-03-12T12:00:00") }], new Date("2026-03-01T12:00:00"), 45);
    expect(items.find((item) => item.kind === "eviction")?.date).toEqual(new Date("2026-03-12T12:00:00"));
    expect(rentalServiceLabel("eviction")).toBe("Açık tahliye bildirimi");
  });
});
