import { describe, expect, it } from "vitest";
import { isProtectedOfficeDocumentKey } from "./_core/storageProxy";

describe("protected central contract document paths", () => {
  it("blocks protected office document keys from the generic storage proxy", () => {
    expect(isProtectedOfficeDocumentKey("office-documents/active-signed/7/19/imzali.pdf")).toBe(true);
    expect(isProtectedOfficeDocumentKey("public-assets/global-1881-seal.png")).toBe(false);
  });
});
