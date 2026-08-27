import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(
  new URL("./routers.ts", import.meta.url),
  "utf8"
);
const pageSource = readFileSync(
  new URL("../client/src/pages/ActiveRentalSummaries.tsx", import.meta.url),
  "utf8"
);
const schemaSource = readFileSync(
  new URL("../drizzle/schema.ts", import.meta.url),
  "utf8"
);

describe("aktif kira müşteri hizmeti politikası", () => {
  it("kira dönemi için tahliye varsayımı yerine 60 günlük malik kontrolü üretir", () => {
    expect(dbSource).toContain('serviceType: "ownerLeaseReview"');
    expect(dbSource).toContain("daysBefore(periodEnd, 60)");
    expect(dbSource).not.toContain(
      'events.push({ serviceType: "eviction", dueDate: eviction })'
    );
  });

  it("emlak vergisi görevini 15 gün önceki danışman aramasına bağlar", () => {
    expect(dbSource).toContain('["propertyTaxFirstInstallment", 4, 31, 15]');
    expect(dbSource).toContain('["propertyTaxSecondInstallment", 10, 30, 15]');
    expect(dbSource).toContain("const dueDate = daysBefore(date, leadDays)");
  });

  it("yeniden kiralama hazırlığını yalnız paylaşılmış malik kontrolünden sonra başlatır", () => {
    expect(dbSource).toContain(
      'source.serviceType !== "ownerLeaseReview" || source.status !== "shared"'
    );
    expect(dbSource).toContain("source.ownerConfirmedTenantExit !== 1");
    expect(dbSource).toContain(
      "Olumlu ayrılma teyidi için malik görüşme notu girilmelidir."
    );
    expect(schemaSource).toContain("ownerConfirmedTenantExit");
    expect(routerSource).toContain("startReletting: protectedProcedure");
    expect(pageSource).toContain("Yeniden kiralama hazırlığını başlat");
    expect(pageSource).toContain("ownerExitConfirmed");
    expect(pageSource).toContain("task.ownerConfirmedTenantExit === 1");
    expect(pageSource).toContain("Sistem dış mesaj göndermez");
  });
});
