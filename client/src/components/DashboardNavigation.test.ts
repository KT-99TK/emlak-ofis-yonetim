import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("dashboard navigation color hierarchy", () => {
  it("defines green active states, gold selection accents, soft hover feedback, and visible keyboard focus", () => {
    const layout = readFileSync(resolve(process.cwd(), "client/src/components/DashboardLayout.tsx"), "utf8");

    expect(layout).toContain("data-[active=true]:bg-[#173e39]");
    expect(layout).toContain("bg-[#e6c47d]");
    expect(layout).toContain("hover:bg-[#edf5f0]");
    expect(layout).toContain("focus-visible:ring-[#b99b5a]");
    expect(layout).toContain("Ofis Operasyonları");
    expect(layout).toContain("Kişisel Çalışma Alanı");
    expect(layout).toContain('min-h-[116px]');
    expect(layout).toContain('border-t border-[#d8e6df] bg-[#f5f9f6]');
    expect(layout).toContain("const DEFAULT_WIDTH = 280;");
    expect(layout).toContain("const MAX_WIDTH = 360;");
    expect(layout).toContain("const isMobile = useIsMobile()");
    expect(layout).toContain("<SidebarTrigger");
    expect(layout).toContain('collapsible="icon"');
  });
});
