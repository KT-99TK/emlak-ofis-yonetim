import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("office LAN bind policy", () => {
  it("binds the central server to a configurable host and documents the client URL", () => {
    const source = readFileSync(resolve(process.cwd(), "server/_core/index.ts"), "utf8");
    const guide = readFileSync(resolve(process.cwd(), "docs/OFFICE-LAN-CONNECTION.md"), "utf8");
    expect(source).toContain('const host = process.env.HOST || "0.0.0.0"');
    expect(source).toContain("server.listen(port, host");
    expect(source).toContain("LAN clients should use the main PC IPv4 address");
    expect(guide).toContain("Test-NetConnection");
    expect(guide).toContain("New-NetFirewallRule");
    expect(guide).toContain("1.0.22 offline Electron");
  });
});
