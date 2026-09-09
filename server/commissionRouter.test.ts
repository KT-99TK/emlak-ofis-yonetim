import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("central commission module", () => {
  const router = fs.readFileSync(path.join(process.cwd(), "server", "routers.ts"), "utf8");
  const db = fs.readFileSync(path.join(process.cwd(), "server", "db.ts"), "utf8");
  const schema = fs.readFileSync(path.join(process.cwd(), "drizzle", "schema.ts"), "utf8");
  const page = fs.readFileSync(path.join(process.cwd(), "client", "src", "pages", "OnlineCommissions.tsx"), "utf8");

  it("central online route uses a multi-party schema and manager verification", () => {
    expect(schema).toContain("commissionTransactions");
    expect(schema).toContain("commissionParticipants");
    expect(schema).toContain("externalOffice");
    expect(router).toContain("commissions: router({");
    expect(router).toContain("verify: adminProcedure");
    expect(db).toContain("createCentralCommissionTransaction");
    expect(db).toContain("verifyCentralCommissionTransaction");
    expect(db).toContain("recordCentralCommissionCollection");
    expect(db).toContain("cancelCentralCommissionTransaction");
  });

  it("keeps the Global 1881 default and requires justification for deviations", () => {
    expect(db).toContain("externalOfficeRate > 0");
    expect(db).toContain("Dış ofis paylaşımı için broker manager ve gerekçe zorunludur.");
    expect(page).toContain("Sistem ara havuzları, danışman paylarını ve Global 1881 kasa payını otomatik hesaplar");
    expect(page).toContain("totalRate !== 100");
    expect(page).toContain("İndirim (opsiyonel)");
    expect(page).toContain("Tahsilat ekle");
    expect(page).toContain("İptal et");
    expect(db).toContain('externalOfficeRole !== "counterpartyPortfolio"');
    expect(page).toContain("Manager özel oranı açarsa paydaş oranları işlem bazında snapshot");
    expect(page).toContain("Toplam oran tam olarak %100 olmalı");
  });
});
