import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("danışman günlük çalışma masası", () => {
  it("Home ekranında kişisel görev, EUR/TL ve kılavuz bileşenlerini gösterir", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain("<PersonalTaskPanel");
    expect(home).toContain("<ExchangeRateCard");
    expect(home).toContain("<UserGuideDialog");
    expect(home).toContain("<RoleSuggestionCard");
    expect(home).toContain('className="mb-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]"');
  });

  it("kişisel görev alanı yalnız kullanıcının kendi tRPC listesini kullanır", () => {
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const panel = readFileSync(resolve(process.cwd(), "client/src/components/PersonalTaskPanel.tsx"), "utf8");
    expect(router).toContain("personalTasks: router({");
    expect(router).toContain("list: protectedProcedure.query(({ ctx }) => listPersonalTasks(ctx.user.id))");
    expect(panel).toContain("trpc.personalTasks.list.useQuery");
    expect(panel).toContain("PERSONAL_TASK_REMINDER_EVENT");
    expect(panel).toContain("Yaklaşan Hatırlatmalar");
    expect(panel).toContain("Görevi düzenle");
    expect(panel).toContain("Harici bildirim gönderilmez");
  });

  it("kayıt ekranları Bana Hatırlat düğmesini ortak olay üzerinden yayınlar", () => {
    const contracts = readFileSync(resolve(process.cwd(), "client/src/pages/Contracts.tsx"), "utf8");
    const records = readFileSync(resolve(process.cwd(), "client/src/pages/Records.tsx"), "utf8");
    expect(contracts).toContain("<BanaHatirlatButton");
    expect(records).toContain("<BanaHatirlatButton");
    expect(records).toContain('linkedEntityType: kind === "clients" ? "client"');
  });
});
