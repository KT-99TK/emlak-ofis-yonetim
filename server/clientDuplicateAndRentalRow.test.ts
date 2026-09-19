import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("central client duplicate and rental row safeguards", () => {
  it("checks normalized customer names across all consultants", () => {
    const source = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
    expect(source).toContain("Bu müşteri merkezi kayıtlarda zaten mevcut");
    expect(source).toContain("regexp_replace");
    expect(source).toContain("Sorumlu danışman");
    expect(source).toContain("consultantCode: userProfiles.consultantCode");
  });

  it("renders the requested rental summary fields in one compact row", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Records.tsx"), "utf8");
    expect(source).toContain("Müşteri:");
    expect(source).toContain("Kiracı:");
    expect(source).toContain("İlk sözleşme:");
    expect(source).toContain("Güncel kira:");
  });

  it("renders a direct profile link for duplicate customer warnings", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Records.tsx"), "utf8");
    expect(source).toContain("DUPLICATE_CLIENT_ID");
    expect(source).toContain("Mevcut müşteri profilini aç ve düzelt");
    expect(source).toContain("/clients?clientId=");
  });
});
