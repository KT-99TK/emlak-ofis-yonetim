import { describe, expect, it } from "vitest";
import {
  getRentalServiceTaskSummary,
  listPersonalRentalServiceTasks,
  rentalServiceTaskLabel,
  type RentalServiceTaskOverviewItem,
} from "./rentalServiceTaskOverview";

const tasks: RentalServiceTaskOverviewItem[] = [
  { task: { id: 1, serviceType: "ownerLeaseReview", dueDate: "2026-08-25", status: "planned" }, clientName: "Malik A", propertyLocation: "Urla" },
  { task: { id: 2, serviceType: "propertyTaxSecondInstallment", dueDate: "2026-11-15", status: "prepared" }, clientName: "Malik B", propertyLocation: "Çeşme" },
  { task: { id: 3, serviceType: "rentIncrease", dueDate: "2026-09-01", status: "reviewed" }, clientName: "Malik C", propertyLocation: "Seferihisar" },
  { task: { id: 4, serviceType: "rentalIncomeTaxDeclaration", dueDate: "2027-03-31", status: "shared" }, clientName: "Malik D", propertyLocation: "Urla" },
];

describe("rentalServiceTaskOverview", () => {
  it("broker manager için görev durumlarını ve gecikmeyi müşteri ayrıntısı olmadan sayar", () => {
    expect(getRentalServiceTaskSummary(tasks, new Date("2026-08-27T12:00:00"))).toEqual({
      open: 3,
      overdue: 1,
      planned: 1,
      prepared: 1,
      reviewed: 1,
      shared: 1,
    });
  });

  it("kişisel mobil listede kapatılmış/paylaşılmış kayıtları çıkarır ve en yakın görevi öne alır", () => {
    expect(listPersonalRentalServiceTasks(tasks)).toEqual([
      { id: 1, title: "Malik kontrolü · kira dönemi", dueDate: "2026-08-25", status: "planned", customerContext: "Malik A · Urla" },
      { id: 3, title: "Kira artışı", dueDate: "2026-09-01", status: "reviewed", customerContext: "Malik C · Seferihisar" },
      { id: 2, title: "Emlak vergisi · 2. taksit araması", dueDate: "2026-11-15", status: "prepared", customerContext: "Malik B · Çeşme" },
    ]);
  });

  it("iş türlerini açık ve tahliye varsayımı içermeyen metinlerle etiketler", () => {
    expect(rentalServiceTaskLabel("ownerLeaseReview")).toBe("Malik kontrolü · kira dönemi");
    expect(rentalServiceTaskLabel("eviction")).toBe("Açık tahliye bildirimi");
  });
});
