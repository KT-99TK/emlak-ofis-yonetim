import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dbSource = readFileSync(new URL("./db.ts", import.meta.url), "utf8");
const routerSource = readFileSync(new URL("./routers.ts", import.meta.url), "utf8");
const pageSource = readFileSync(new URL("../client/src/pages/Contracts.tsx", import.meta.url), "utf8");

describe("kodlu sözleşme numarası politikası", () => {
  it("sunucunun sonraki numarayı kullanıcıya özel üretmesini ve kod biçimini zorunlu tutmasını korur", () => {
    expect(dbSource).toContain("export async function getNextContractNumber(userId: number)");
    expect(dbSource).toContain("isContractNumberForCode(contractNo, consultantCode)");
    expect(dbSource).toContain("if (!isConsultantCode(normalized))");
    expect(dbSource).toContain("Bu sözleşme numarası daha önce kullanılmış.");
    expect(routerSource).toContain("nextNumber: protectedProcedure.query");
  });

  it("sözleşme ekranının otomatik öneri, kodsuz kayıt engeli ve numara aramasını korur", () => {
    expect(pageSource).toContain("trpc.contracts.nextNumber.useQuery()");
    expect(pageSource).toContain("Sıradaki kullanılabilir numara otomatik önerildi.");
    expect(pageSource).toContain("Bu hesap için danışman kodu tanımlanmadan yeni sözleşme kaydı açılamaz.");
    expect(pageSource).toContain("Sözleşme no veya başlıkla ara: IP1-001");
    expect(readFileSync(new URL("../client/src/pages/Team.tsx", import.meta.url), "utf8")).toContain("const validCode = isConsultantCode(code)");
    expect(pageSource).toContain("window.print()");
    expect(pageSource).toContain("{item.contractNo} · {labels[item.type]}");
    expect(dbSource).toContain("danışman=${consultantCode} · atananKullanici=${input.assignedUserId}");
  });
});
