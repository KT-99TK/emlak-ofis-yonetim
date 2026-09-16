import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("online commission manager filters", () => {
  it("exposes date, consultant and status filters in the UI", () => {
    const source = read("./OnlineCommissions.tsx");
    expect(source).toContain("Finans başlangıç tarihi");
    expect(source).toContain("Finans bitiş tarihi");
    expect(source).toContain("Finans danışman kodu");
    expect(source).toContain("Finans durum filtresi");
    expect(source).toContain("filteredTotals");
  });

  it("passes the same filters through the protected server list", () => {
    const router = read("../../../server/routers.ts");
    const db = read("../../../server/db.ts");
    expect(router).toContain("consultantCode: z.preprocess");
    expect(router).toContain("status: z.enum([\"declared\", \"managerVerified\", \"partiallySettled\", \"settled\", \"cancelled\"])");
    expect(router).toContain("listCentralCommissionTransactions(ctx.user.id, scope.isManager, scope.permittedUserIds, input ?? {})");
    expect(db).toContain("transaction.createdAt >= filters.from");
    expect(db).toContain("transaction.createdAt <= filters.to");
    expect(db).toContain("transaction.status === filters.status");
    expect(db).toContain("participant.participantCode.toLocaleUpperCase");
  });
});
