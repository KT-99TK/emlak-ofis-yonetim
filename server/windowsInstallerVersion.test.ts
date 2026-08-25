import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Windows installer version contract", () => {
  it("keeps the PowerShell installer expectation aligned with package.json", () => {
    const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8")) as { version: string };
    const installer = readFileSync(resolve(process.cwd(), "WINDOWS-KURULUM.ps1"), "utf8");
    expect(packageJson.version).toBe("1.0.14");
    expect(installer).toContain(`$expectedVersion = "${packageJson.version}"`);
    expect(installer).toContain("Global1881-Ofis-Offline-v$expectedVersion-FINAL.exe");
  });
});
