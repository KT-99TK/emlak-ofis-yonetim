import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("offline rental record selectors", () => {
  it("offers scoped client and property records for owner, tenant, and property selection", () => {
    const source = readFileSync(new URL("./OfflineRentalContracts.tsx", import.meta.url), "utf8");
    expect(source).toContain('const people = records.filter');
    expect(source).toContain('record.entity === "client"');
    expect(source).toContain('const properties = records.filter');
    expect(source).toContain('record.entity === "property"');
    expect(source).toContain('placeholder="Malik seçin"');
    expect(source).toContain('placeholder="Kiracı seçin"');
    expect(source).toContain('placeholder="Mülk seçin"');
    expect(source).toContain('onValueChange={id => fillPerson(id, "owner")}');
    expect(source).toContain('onValueChange={id => fillPerson(id, "tenant")}');
    expect(source).toContain('onValueChange={fillProperty}');
    expect(source).toContain('Kayıtlar yükleniyor…');
    expect(source).toContain('Malik kaydı bulunamadı');
    expect(source).toContain('Kiracı kaydı bulunamadı');
    expect(source).toContain('Mülk kaydı bulunamadı');
  });

  it("keeps selectors inside the offline contract access scope", () => {
    const source = readFileSync(new URL("./OfflineRentalContracts.tsx", import.meta.url), "utf8");
    expect(source).toContain("canViewFullOfflineContract(record, contractAccess)");
    expect(source).toContain("const contractAccess = {");
  });
});

