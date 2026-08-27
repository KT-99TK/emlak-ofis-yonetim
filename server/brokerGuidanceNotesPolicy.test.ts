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
const panelSource = readFileSync(
  new URL("../client/src/components/BrokerGuidanceNotesCard.tsx", import.meta.url),
  "utf8"
);

describe("anonim broker yönlendirme notları", () => {
  it("müşteri bağlantısı olmadan konu, kısa operasyon notu ve çözüm durumunu saklar", () => {
    expect(schemaSource).toContain('"brokerGuidanceNotes"');
    expect(schemaSource).toContain('"rental_service"');
    expect(schemaSource).toContain('"resolved"');
    expect(schemaSource).not.toContain('brokerGuidanceNotes", {\n  clientId');
  });

  it("telefon, e-posta ile merkezi müşteri, kiracı ve taşınmaz adlarını nottan engeller", () => {
    expect(dbSource).toContain("assertAnonymousBrokerGuidanceSummary");
    expect(dbSource).toContain("telefon, kimlik veya e-posta bilgisi yazılamaz");
    expect(dbSource).toContain("merkezi müşteri, kiracı veya taşınmaz adı yazılamaz");
    expect(dbSource).toContain("knownClients");
    expect(dbSource).toContain("knownRentals");
  });

  it("oluşturma ve çözümde merkezi başlangıç kapısı ile audit izini; rotada admin yetkisini kullanır", () => {
    expect(dbSource).toContain("await assertCentralOnlineStartAllowsRecord()");
    expect(dbSource).toContain('action: "broker_guidance_note_created"');
    expect(dbSource).toContain('action: "broker_guidance_note_resolved"');
    expect(routerSource).toContain("brokerGuidanceNotes: router({");
    expect(routerSource).toContain("list: adminProcedure");
    expect(routerSource).toContain("create: adminProcedure");
    expect(routerSource).toContain("resolve: adminProcedure");
  });

  it("broker kartında mahremiyet uyarısı, hata yenilemesi ve açık not çözümleme denetimi bulunur", () => {
    expect(panelSource).toMatch(/Müşteri, danışman,\s+telefon, kimlik ve taşınmaz ayrıntısı yazmayın/);
    expect(panelSource).toContain("Notlar yüklenemedi.");
    expect(panelSource).toContain("Yenile");
    expect(panelSource).toContain("Çözüldü");
  });
});
