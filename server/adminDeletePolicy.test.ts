import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("admin-only record deletion", () => {
  it("protects client and property deletion at the router and UI layers", () => {
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const records = readFileSync(resolve(process.cwd(), "client/src/pages/Records.tsx"), "utf8");
    const db = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    expect(router).toMatch(/clients:\s*router[\s\S]*delete:\s*adminProcedure/);
    expect(router).toMatch(/properties:\s*router[\s\S]*delete:\s*adminProcedure/);
    expect(records).toContain('user?.role === "admin"');
    expect(records).toContain("Kalıcı olarak sil");
    expect(db).toContain("export async function deleteClient");
    expect(db).toContain("export async function deleteProperty");
    expect(db).toContain("auditLogs");
  });
});
