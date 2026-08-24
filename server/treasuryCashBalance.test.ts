import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("central cash balance controls", () => {
  it("limits the summary to manager or office assistant and requires evidence for movement declarations", () => {
    const router = fs.readFileSync(path.join(process.cwd(), "server", "routers.ts"), "utf8");
    expect(router).toContain("treasury: router");
    expect(router).toContain("Kasa balansı yalnız broker manager ve ofis asistanı için görünür.");
    expect(router).toContain('evidenceReference: z.string().min(2).max(180)');
    expect(router).toContain("verifyMovement: adminProcedure");
    expect(router).toContain("closeDay: adminProcedure");
  });

  it("keeps declared movements outside of the balance until manager verification", () => {
    const db = fs.readFileSync(path.join(process.cwd(), "server", "db.ts"), "utf8");
    expect(db).toContain('["managerVerified", "reconciled"].includes(movement.status)');
    expect(db).toContain("treasury_cash_declared");
    expect(db).toContain("treasury_cash_verified");
    expect(db).toContain("treasury_cash_day_closed");
  });
});
