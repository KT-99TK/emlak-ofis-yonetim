import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("danışman çalışma masası responsive sözleşmesi", () => {
  it("dashboard çalışma alanını mobilde tek sütuna, geniş ekranda iki kolona düşürür", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    expect(home).toContain("grid gap-6 lg:grid-cols-[1.35fr_.65fr]");
    expect(home).toContain("<RoleSuggestionCard");
  });

  it("görev ve kılavuz panelleri dar ekran taşmasını sınırlayan sınıfları içerir", () => {
    const panel = readFileSync(resolve(process.cwd(), "client/src/components/PersonalTaskPanel.tsx"), "utf8");
    const guide = readFileSync(resolve(process.cwd(), "client/src/components/UserGuideDialog.tsx"), "utf8");
    const roleCard = readFileSync(resolve(process.cwd(), "client/src/components/RoleSuggestionCard.tsx"), "utf8");
    expect(panel).toContain("min-w-0 flex-1");
    expect(panel).toContain("max-w-full");
    expect(panel).toContain("max-h-[90vh]");
    expect(guide).toContain("max-h-[90vh]");
    expect(guide).toContain("overflow-y-auto");
    expect(roleCard).toContain("flex-col gap-4");
    expect(roleCard).toContain("sm:flex-row");
  });
});
