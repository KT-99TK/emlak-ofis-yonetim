import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Windows installer version contract", () => {
  it("keeps the PowerShell installer expectation aligned with package.json", () => {
    const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8")) as { version: string; scripts?: Record<string, string> };
    const installer = readFileSync(resolve(process.cwd(), "WINDOWS-KURULUM.ps1"), "utf8");
    const workspaceConfig = readFileSync(resolve(process.cwd(), "pnpm-workspace.yaml"), "utf8");
    expect(packageJson.version).toBe("1.0.23");
    expect(installer).toContain(`$expectedVersion = "${packageJson.version}"`);
    expect(installer).toContain("Global1881-Ofis-Offline-v$expectedVersion-FINAL.exe");
    expect(installer).toContain('Invoke-Pnpm @("install", "--frozen-lockfile", "--prefer-offline")');
    expect(packageJson.scripts?.["desktop:installer"]).toContain("vite build");
    expect(packageJson.scripts?.["desktop:installer"]).toContain("electron-builder");
    expect(workspaceConfig).toContain("wouter@3.7.1: patches/wouter@3.7.1.patch");
    expect(workspaceConfig).toContain("tailwindcss>nanoid: 3.3.7");
  });
});
