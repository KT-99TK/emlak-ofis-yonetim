import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("merkezi temiz başlangıç kayıt kapısı", () => {
  const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
  const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

  it("geçiş tarihi ayarlanmadıkça veya tarih öncesinde yeni merkezi operasyon kaydı açılmasını engeller", () => {
    expect(dbSource).toContain("assertCentralOnlineStartAllowsRecord(); const result = await db.insert(contracts)");
    expect(dbSource).toContain("assertCentralOnlineStartAllowsRecord(); const result = await db.insert(clients)");
    expect(dbSource).toContain("assertCentralOnlineStartAllowsRecord(); if (input.listingType");
    expect(dbSource).toContain("assertCentralOnlineStartAllowsRecord(); const result = await db.insert(ledgerEntries)");
    expect(dbSource).toContain("await assertCentralOnlineStartAllowsRecord(input.occurredOn);");
  });

  it("başlangıç ayarını yalnız adminProcedure ve tam teyit alanıyla sunar", () => {
    expect(routerSource).toContain("onlineStart: router({");
    expect(routerSource).toContain("configure: adminProcedure.input(z.object({");
    expect(routerSource).toContain("confirmationText: z.string().min(1).max(120)");
  });

  it("eski offline PDF aktarımını kapatır ve imzalı PDF’i yeni merkezi sözleşmeye bağlar", () => {
    expect(routerSource).toContain("Temiz online başlangıçta eski offline PDF arşivi merkezi sisteme aktarılmaz.");
    expect(routerSource).toContain("await assertCentralOnlineStartAllowsRecord(contract.createdAt);");
    expect(dbSource).toContain("startOfTurkeyBusinessDay(input.effectiveAt)");
    expect(dbSource).toContain("const turkeyToday = startOfTurkeyBusinessDay(new Date())");
  });
});
