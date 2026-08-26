import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Temiz Online Başlangıç ekranı", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/pages/OnlineStart.tsx"), "utf8");

  it("yalnız managera ayar yetkisi verir ve sıfır bakiye/devir ilkesini açıkça korur", () => {
    expect(source).toContain('if (user?.role !== "admin")');
    expect(source).toContain("Açılış bakiyesi, devir ve eski finansal kayıt oluşturulmaz.");
    expect(source).toContain("Eski offline sözleşmeler, PDF arşivi, yedekler, kasa/banka hareketleri ve bakiye taşınmaz veya silinmez.");
    expect(source).toContain("TEMİZ ONLINE BAŞLANGICI AKTİFLEŞTİR");
    expect(source).toContain("trpc.onlineStart.configure.useMutation");
    expect(source).toContain('timeZone: "Europe/Istanbul"');
    expect(source).toContain("Devam eden aktif dosya gerekirse");
    expect(source).toContain("başlangıç özeti");
    expect(source).toContain("Eski PDF ve offline yedekler yerel geçmiş arşivinde kalır");
  });
});
