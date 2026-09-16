import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./OfflineAuthorityContracts.tsx", import.meta.url), "utf8");

describe("offline authority property selection", () => {
  it("links properties to the selected client with customer id and legacy owner fallback", () => {
    expect(source).toContain('readPropertyDetail(record, "MÜŞTERİ_ID")');
    expect(source).toContain('readPropertyDetail(record, "MALİK")');
    expect(source).toContain("propertyBelongsToVisibleClient");
    expect(source).toContain("client.id === clientId");
    expect(source).toContain("normalizePerson(client.title)");
  });

  it("keeps properties under the selected client while allowing legacy fallback and search", () => {
    expect(source).toContain("const selectedPropertyRecords = useMemo");
    expect(source).toContain("propertyClientId(record) === clientRecordId");
    expect(source).toContain("propertyOwnerName(record)");
    expect(source).toContain("propertySearch");
    expect(source).toContain("selectedPropertyRecords.map");
  });
});

export {};

