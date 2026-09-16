import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./AuthorityContracts.tsx", import.meta.url), "utf8");

describe("online authority contract save and formatting contract", () => {
  it("uses the consultant-scoped automatic contract number instead of the old YET placeholder", () => {
    expect(source).toContain("trpc.contracts.nextNumber.useQuery()");
    expect(source).toContain("nextNumber.data?.nextContractNo");
    expect(source).toContain('placeholder="KT1-001"');
  });

  it("shows server or validation errors instead of silently returning", () => {
    expect(source).toContain("Kayıt için sözleşme numarası, malik ve taşınmaz adresi zorunludur.");
    expect(source).toContain("create.error?.message");
    expect(source).toContain('role="alert"');
  });

  it("keeps phone and amount inputs on the shared grouped and whole-amount formatters", () => {
    expect(source).toContain("formatContractPhoneInput(value)");
    expect(source).toContain("formatWholeCurrencyInput(value)");
    expect(source).toContain("toInternationalPhone(client.phone ?? \"\")");
  });
});
