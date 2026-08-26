import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("customer-facing A4 contract output", () => {
  it("does not expose internal template-version, snapshot, or draft footer explanations", () => {
    const authority = source("client/src/components/AuthorityContractDocument.tsx");
    const rental = source("client/src/components/RentalContractDocument.tsx");

    expect(authority).not.toContain("Koşul şablon sürümü:");
    expect(authority).not.toContain("offline sözleşme anındaki snapshot");
    expect(authority).not.toContain("authority-print-running-footer");
    expect(authority).not.toContain("EİDS Yetki Numarası");
    expect(authority).not.toContain("eidsAuthorizationNumber");
    expect(rental).not.toContain("Koşul şablon sürümü:");
    expect(rental).not.toContain("sözleşme anındaki offline snapshot");
  });

  it("keeps the contract number and date in the A4 document header", () => {
    const authority = source("client/src/components/AuthorityContractDocument.tsx");

    expect(authority).toContain("Kayıt No:");
    expect(authority).toContain("Düzenleme Tarihi:");
    expect(authority).toContain("authority-document-office-details");
  });

  it("keeps versioning only in internal snapshot generators", () => {
    const authorityModel = source("client/src/lib/authorityContract.ts");
    const rentalModel = source("client/src/lib/rentalContract.ts");

    expect(authorityModel).toContain("conditionTemplateVersion");
    expect(rentalModel).toContain("conditionTemplateVersion");
  });
});
