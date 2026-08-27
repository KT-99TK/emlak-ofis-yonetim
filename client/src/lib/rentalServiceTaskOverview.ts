export type RentalServiceTaskStatus =
  | "planned"
  | "prepared"
  | "reviewed"
  | "shared"
  | "completed";

export type RentalServiceTaskType =
  | "rentIncrease"
  | "eviction"
  | "ownerLeaseReview"
  | "relettingPreparation"
  | "propertyTaxFirstInstallment"
  | "propertyTaxSecondInstallment"
  | "rentalIncomeTaxDeclaration";

export type RentalServiceTaskOverviewItem = {
  task: {
    id: number;
    serviceType: RentalServiceTaskType;
    dueDate: Date | string;
    status: RentalServiceTaskStatus;
  };
  clientName?: string | null;
  propertyLocation?: string | null;
  unitInfo?: string | null;
};

export function rentalServiceTaskLabel(type: RentalServiceTaskType) {
  switch (type) {
    case "rentIncrease": return "Kira artışı";
    case "eviction": return "Açık tahliye bildirimi";
    case "ownerLeaseReview": return "Malik kontrolü · kira dönemi";
    case "relettingPreparation": return "Yeniden kiralama hazırlığı";
    case "propertyTaxFirstInstallment": return "Emlak vergisi · 1. taksit araması";
    case "propertyTaxSecondInstallment": return "Emlak vergisi · 2. taksit araması";
    case "rentalIncomeTaxDeclaration": return "Kira geliri vergi dönemi";
  }
}

function startOfDay(value: Date | string) {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function getRentalServiceTaskSummary(items: RentalServiceTaskOverviewItem[], now = new Date()) {
  const active = items.filter(item => item.task.status !== "shared" && item.task.status !== "completed");
  return {
    open: active.length,
    overdue: active.filter(item => startOfDay(item.task.dueDate) < startOfDay(now)).length,
    planned: items.filter(item => item.task.status === "planned").length,
    prepared: items.filter(item => item.task.status === "prepared").length,
    reviewed: items.filter(item => item.task.status === "reviewed").length,
    shared: items.filter(item => item.task.status === "shared").length,
  };
}

/** Kişisel görünümde yalnız sunucunun rol kapsamıyla döndürdüğü görevler kullanılır. */
export function listPersonalRentalServiceTasks(items: RentalServiceTaskOverviewItem[], limit = 5) {
  return items
    .filter(item => item.task.status !== "shared" && item.task.status !== "completed")
    .slice()
    .sort((left, right) => startOfDay(left.task.dueDate) - startOfDay(right.task.dueDate))
    .slice(0, limit)
    .map(item => ({
      id: item.task.id,
      title: rentalServiceTaskLabel(item.task.serviceType),
      dueDate: item.task.dueDate,
      status: item.task.status,
      customerContext: [item.clientName, item.propertyLocation, item.unitInfo && item.unitInfo !== "—" ? item.unitInfo : null].filter(Boolean).join(" · "),
    }));
}
