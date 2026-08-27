import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schemaSource = readFileSync(
  new URL("../drizzle/schema.ts", import.meta.url),
  "utf8"
);
const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(
  new URL("./routers.ts", import.meta.url),
  "utf8"
);
const pageSource = readFileSync(
  new URL("../client/src/pages/ActiveRentalSummaries.tsx", import.meta.url),
  "utf8"
);

describe("malik kira geliri vergisi ön bilgi profili", () => {
  it("malik ve vergi yılı için tek merkezi parametre kaydı tutar", () => {
    expect(schemaSource).toContain('"rentalIncomeTaxProfiles"');
    expect(schemaSource).toContain("ownershipSharePercent");
    expect(schemaSource).toContain("residentialExemptionEligible");
    expect(schemaSource).toContain("actualExpenseTotal");
    expect(schemaSource).toContain(
      'uniqueIndex("rentalIncomeTaxProfiles_client_year_unique")'
    );
  });

  it("listeleme ve kaydetmede aktif kira rol kapsamını, merkezi başlangıç kapısını ve audit izini kullanır", () => {
    expect(dbSource).toContain("export async function listRentalIncomeTaxProfiles");
    expect(dbSource).toContain("activeRentalScope(userId, isManager, permittedUserIds)");
    expect(dbSource).toContain("export async function saveRentalIncomeTaxProfile");
    expect(dbSource).toContain("await assertCentralOnlineStartAllowsRecord();");
    expect(dbSource).toContain('action: "rental_income_tax_profile_saved"');
    expect(dbSource).toContain("resmî beyan veya tahakkuk değildir");
  });

  it("yalnız doğrulanmış sayısal parametreyi aktif kira yönlendiricisinden kabul eder", () => {
    expect(routerSource).toContain("rentalIncomeTaxProfiles: router({");
    expect(routerSource).toContain("ownershipSharePercent");
    expect(routerSource).toContain("Number(value) > 0 && Number(value) <= 100");
    expect(routerSource).toContain("actualExpenseTotal");
    expect(routerSource).toContain("saveRentalIncomeTaxProfile");
  });

  it("ekranda kalıcı profili ayrı sorgular ve resmî işlem oluşturmadığını açıkça belirtir", () => {
    expect(pageSource).toContain("rentalIncomeTaxProfiles.list.useQuery");
    expect(pageSource).toContain("rentalIncomeTaxProfiles.save.useMutation");
    expect(pageSource).toContain("Vergi ön bilgisini kaydet");
    expect(pageSource).toContain("resmî beyan, tahakkuk veya belge üretilmez");
    expect(pageSource).toContain("taxProfiles.isError");
    expect(pageSource).toContain("mevcut merkezi kaydı korumak için kayıt kapalı");
  });
});
