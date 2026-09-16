import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./OfflineAuthorityContracts.tsx", import.meta.url), "utf8");

describe("offline authority contract defaults", () => {
  it("provides office defaults and known consultant profiles without blocking edits", () => {
    expect(source).toContain('officeAuthorizationNo: "3500211"');
    expect(source).toContain('officePhone: "+90 534 975 05 82"');
    expect(source).toContain("DEFAULT_CONSULTANTS");
    expect(source).toContain("defaultAuthorityDetails(userId)");
    expect(source).toContain('placeholder="Ofis adresi *"');
  });

  it("recalls the selected client's address, phone and identity", () => {
    expect(source).toContain("decodeOfflineClientDetails(record.details)");
    expect(source).toContain("ownerAddress: clientDetails.address || current.ownerAddress");
    expect(source).toContain("ownerPhone: clientDetails.phone || current.ownerPhone");
    expect(source).toContain("ownerIdentity: clientDetails.identity || current.ownerIdentity");
  });
});
