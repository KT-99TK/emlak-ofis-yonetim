import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("office LAN check guide", () => {
  it("contains safe main-PC and client diagnostics", () => {
    const script = readFileSync(resolve(process.cwd(), "docs/office-lan-check.ps1"), "utf8");
    const guide = readFileSync(resolve(process.cwd(), "docs/OFFICE-LAN-CONNECTION.md"), "utf8");
    expect(script).toContain("Get-NetConnectionProfile");
    expect(script).toContain("Get-NetTCPConnection -State Listen");
    expect(script).toContain("Test-NetConnection -ComputerName $MainPcIp -Port $Port");
    expect(script).toContain("New-NetFirewallRule");
    expect(guide).toContain("office-lan-check.ps1 -ClientTest");
  });
});
