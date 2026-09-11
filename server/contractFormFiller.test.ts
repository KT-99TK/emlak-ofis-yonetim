import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Kat Karşılığı gerçek form ekranı", () => {
  const page = readFileSync(resolve(process.cwd(), "client/src/components/ContractFormFiller.tsx"), "utf8");
  const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");

  it("uses the shared missing-field helper, red warning state and existing contract id", () => {
    expect(page).toContain("getMissingRequiredContractFormFields");
    expect(page).toContain("border-[#cf6b5d]");
    expect(page).toContain("Mevcut sözleşme ID’si");
    expect(page).toContain("createInstance.mutate");
    expect(page).toContain('field.fieldType === "select"');
    expect(page).toContain("optionsJson");
  });

  it("keeps instance creation behind the existing backend contract and does not fabricate records", () => {
    expect(router).toContain("createInstance: protectedProcedure");
    expect(router).toContain("contractId: z.number().int().positive()");
    expect(page).toContain("Yeni müşteri veya sahte kayıt oluşturulmaz");
  });

  it("does not force Kat Karşılığı through the sales preparation checklist", () => {
    expect(db).toContain('if (input.formType !== "sale_closing")');
    expect(db).toContain("checkDefinitions: []");
  });
});
