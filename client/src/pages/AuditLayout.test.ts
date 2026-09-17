import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("audit compact log layout", () => {
  it("keeps descriptions compact with hover-readable full text and readable actor labels", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Audit.tsx"), "utf8");

    expect(source).toContain("space-y-1.5");
    expect(source).toContain("px-3 py-2.5");
    expect(source).toContain('className="mt-0.5 flex items-center justify-between gap-3"');
    expect(source).toContain('className="truncate text-xs text-[#70807c]"');
    expect(source).toContain("title={log.summary ?? undefined}");
    expect(source).toContain("text-xs font-semibold text-[#50665f]");
    expect(source).toContain("Kullanıcı #{log.actorUserId}");
    expect(source).toContain("Kullanıcı adı / kullanıcı no");
    expect(source).toContain('type="date"');
    expect(source).toContain("Filtre sonucu: {filteredLogs.length} kayıt");
    expect(source).toContain("Bu filtrelerle eşleşen kayıt bulunamadı.");
    expect(source).toContain("createdAt");
  });
});
