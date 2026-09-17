import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("authority contract property selection", () => {
  it("loads properties from the selected client's file and keeps a safe empty state", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/AuthorityContracts.tsx"), "utf8");

    expect(source).toContain("trpc.clients.file.useQuery");
    expect(source).toContain("selectedClientFile.data?.properties");
    expect(source).toContain("setPropertyId(\"\")");
    expect(source).toContain("selectedClientFile.isLoading");
    expect(source).toContain("Seçilen müşteriye ait taşınmaz bulunamadı");
    expect(source).toContain("const chooseProperty");
    expect(source).toContain("propertyAddress: normalizeAuthorityField");
  });
});
