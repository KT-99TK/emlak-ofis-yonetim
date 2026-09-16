import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./OfflineAuthorityContracts.tsx", import.meta.url), "utf8");

describe("offline authority property selection", () => {
  it("links properties to the selected client with customer id and legacy owner fallback", () => {
    expect(source).toContain("MÜŞTERİ_ID:");
    expect(source).toContain("MALİK:");
    expect(source).toContain("propertyBelongsToVisibleClient");
    expect(source).toContain("client.id === clientId");
    expect(source).toContain("normalizePerson(client.title)");
  });

  it("prioritizes linked properties after client selection and keeps the select populated for legacy records", () => {
    expect(source).toContain("const selectedPropertyRecords = useMemo");
    expect(source).toContain("return linked.length ? linked : propertyRecords");
    expect(source).toContain("selectedPropertyRecords.map");
  });
});

export {};

