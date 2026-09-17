import { describe, expect, it } from "vitest";
import { formatContractPhoneInput, normalizeContractPhoneDraft } from "./contractFormFormatting";

describe("contract form field formatting", () => {
  it("keeps partial phone input usable while normalizing a complete Turkish number", () => {
    expect(normalizeContractPhoneDraft("(0532) 169 33 34")).toBe("05321693334");
    expect(formatContractPhoneInput("05321693334")).toBe("0532 169 33 34");
    expect(formatContractPhoneInput("+90 532 169 33 34")).toBe("0532 169 33 34");
    expect(formatContractPhoneInput("0532")).toBe("0532");
  });

  it("leaves empty phone input empty", () => {
    expect(formatContractPhoneInput("   ")).toBe("");
  });
});
