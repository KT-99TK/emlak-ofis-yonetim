import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { assertLocalPasswordPolicy, isTemporaryPasswordReusable } from "./localAuth";

describe("local consultant onboarding policy", () => {
  const source = readFileSync(resolve(process.cwd(), "server/localAuth.ts"), "utf8");
  const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
  const uiSource = readFileSync(resolve(process.cwd(), "client/src/pages/Team.tsx"), "utf8");
  const loginGateSource = readFileSync(resolve(process.cwd(), "client/src/components/LocalLoginGate.tsx"), "utf8");

  it("enforces the password strength policy", () => {
    expect(() => assertLocalPasswordPolicy("short")).toThrow();
    expect(() => assertLocalPasswordPolicy("Aa1bcdef")).not.toThrow();
    expect(() => assertLocalPasswordPolicy("abcdefgh")).toThrow();
    expect(() => assertLocalPasswordPolicy("StrongPassword1")).not.toThrow();
  });

  it("rejects a second use of a temporary password after it is consumed", () => {
    expect(isTemporaryPasswordReusable(1, null)).toBe(false);
    expect(isTemporaryPasswordReusable(1, new Date())).toBe(true);
    expect(isTemporaryPasswordReusable(0, new Date())).toBe(false);
  });

  it("commits temporary-password consumption together with session creation", () => {
    expect(source).toContain("await db.transaction(async tx =>");
    expect(source).toContain("await tx.insert(localLoginSessions)");
    expect(source).toContain("await tx.insert(auditLogs)");
    expect(source).toContain("Geçici parola, zorunlu parola değişimi tamamlanana kadar yeniden giriş için kullanılabilir.");
    expect(source).not.toContain("if (isTemporaryPasswordReusable(row.credentials.mustChangePassword, row.credentials.temporaryPasswordUsedAt))");
  });

  it("stores only a scrypt password hash and expires temporary passwords", () => {
    expect(source).toContain("scrypt$");
    expect(source).toContain("temporaryPasswordExpiresAt");
    expect(source).toContain("mustChangePassword: 1");
    expect(source).not.toContain("temporaryPassword: temporaryPassword");
  });

  it("records the local auth audit actions and keeps sessions separate", () => {
    expect(source).toContain("localLoginSessions");
    expect(source).toContain("changeLocalPassword");
    expect(source).toContain("local_login_failed");
    expect(source).toContain("local_login_success");
    expect(source).toContain("local_password_changed");
    expect(source).toContain("local_logout");
    expect(source).toContain("mustChangePassword: 0");
    expect(routerSource).toContain("auth: router");
    expect(routerSource).toContain("localLogin: publicProcedure");
    expect(routerSource).toContain("changeLocalPassword: protectedProcedure");
  });

  it("prevents duplicate temporary-password login requests in the login gate", () => {
    expect(loginGateSource).toContain("loginSubmitLock");
    expect(loginGateSource).toContain("onSettled: () => { loginSubmitLock.current = false; }");
    expect(loginGateSource).toContain('type="button"');
  });

  it("exposes manager-only onboarding and temporary-password handling in Team", () => {
    expect(routerSource).toContain("createLocalConsultant: adminProcedure");
    expect(uiSource).toContain("createLocalConsultant");
    expect(uiSource).toContain("Geçici parola");
    expect(uiSource).toContain("Danışman hesabı oluştur");
  });
});
