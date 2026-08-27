import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("merkezi temiz başlangıç kayıt kapısı", () => {
  const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
  const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

  function assertGateBeforeInsert(functionName: string, insertPattern: RegExp) {
    const functionStart = dbSource.indexOf(`export async function ${functionName}(`);
    expect(functionStart, `${functionName} fonksiyonu bulunamadı`).toBeGreaterThan(-1);
    const nextFunctionStart = dbSource.indexOf("\nexport async function ", functionStart + 1);
    const body = nextFunctionStart === -1 ? dbSource.slice(functionStart) : dbSource.slice(functionStart, nextFunctionStart);
    const gateIndex = body.indexOf("assertCentralOnlineStartAllowsRecord(");
    const insertMatch = body.match(insertPattern);
    expect(gateIndex, `${functionName} içinde kayıt kapısı bulunamadı`).toBeGreaterThan(-1);
    expect(insertMatch?.index, `${functionName} içinde kayıt ekleme bulunamadı`).toBeTypeOf("number");
    expect(gateIndex, `${functionName} içinde kayıt kapısı ekleme işleminden önce çalışmalı`).toBeLessThan(insertMatch!.index!);
  }

  it("geçiş tarihi ayarlanmadıkça veya tarih öncesinde yeni merkezi operasyon kaydı açılmasını engeller", () => {
    assertGateBeforeInsert("createContract", /db\s*\.insert\s*\(\s*contracts\s*\)/);
    assertGateBeforeInsert("createClient", /db\s*\.insert\s*\(\s*clients\s*\)/);
    assertGateBeforeInsert("createProperty", /db\s*\.insert\s*\(\s*properties\s*\)/);
    assertGateBeforeInsert("createLedger", /db\s*\.insert\s*\(\s*ledgerEntries\s*\)/);
    expect(dbSource).toContain("await assertCentralOnlineStartAllowsRecord(input.occurredOn);");
  });

  it("başlangıç ayarını yalnız adminProcedure ve tam teyit alanıyla sunar", () => {
    expect(routerSource).toContain("onlineStart: router({");
    expect(routerSource).toMatch(/configure:\s*adminProcedure\s*\.input\s*\(\s*z\.object\s*\(\s*\{/);
    expect(routerSource).toMatch(/confirmationText:\s*z\.string\s*\(\s*\)\s*\.min\s*\(\s*1\s*\)\s*\.max\s*\(\s*120\s*\)/);
  });

  it("eski offline PDF aktarımını kapatır ve imzalı PDF’i yeni merkezi sözleşmeye bağlar", () => {
    expect(routerSource).toContain("Temiz online başlangıçta eski offline PDF arşivi merkezi sisteme aktarılmaz.");
    expect(routerSource).toMatch(/await\s+assertCentralOnlineStartAllowsRecord\s*\(\s*contract\.createdAt\s*\)/);
    expect(dbSource).toContain("startOfTurkeyBusinessDay(input.effectiveAt)");
    expect(dbSource).toMatch(/const\s+turkeyToday\s*=\s*startOfTurkeyBusinessDay\s*\(\s*new Date\s*\(\s*\)\s*\)/);
  });
});
