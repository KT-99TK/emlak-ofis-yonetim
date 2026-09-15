import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("web local login gate", () => {
  it("uses the long login name and forces temporary password change before workspace", () => {
    const source = readFileSync(new URL("./LocalLoginGate.tsx", import.meta.url), "utf8");
    expect(source).toContain("loginName.trim().toUpperCase()");
    expect(source).toContain("C-TERCAN");
    expect(source).toContain("mustChangePassword");
    expect(source).toContain("Geçici parola kabul edildi");
    expect(source).toContain("Parolayı değiştir");
  });

  it("keeps the role-aware dashboard gate after auth state is resolved", () => {
    const source = readFileSync(new URL("./DashboardLayout.tsx", import.meta.url), "utf8");
    expect(source).toContain("if (!user && !isDesktop) return <LocalLoginGate />");
    expect(source).toContain("DashboardLayoutContent");
  });
});
