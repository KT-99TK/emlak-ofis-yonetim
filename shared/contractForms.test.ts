import { describe, expect, it } from "vitest";
import { activeClausesForOutput, getDefaultFormFields, normalizeClauseDraft } from "./contractForms";

describe("contract form clause model", () => {
  it("normalizes a party-specific optional clause without inventing legal text", () => {
    expect(normalizeClauseDraft({
      partyScope: "seller",
      title: "  Satıcı özel maddesi  ",
      bodyTemplate: "  Kullanıcının sağlayacağı metin  ",
    })).toMatchObject({
      partyScope: "seller",
      title: "Satıcı özel maddesi",
      bodyTemplate: "Kullanıcının sağlayacağı metin",
      status: "draft",
      sortOrder: 0,
    });
  });

  it("keeps sale closing and land-share party fields distinct", () => {
    const saleKeys = getDefaultFormFields("sale_closing").map(field => field.fieldKey);
    const landShareKeys = getDefaultFormFields("land_share").map(field => field.fieldKey);
    expect(saleKeys).toContain("sellerName");
    expect(saleKeys).toContain("buyerName");
    expect(saleKeys).toContain("salePrice");
    expect(landShareKeys).toContain("landownerName");
    expect(landShareKeys).toContain("contractorName");
    expect(landShareKeys).toContain("landShareRatio");
    expect(landShareKeys).not.toContain("salePrice");
  });

  it("outputs only active non-empty clauses in their configured order", () => {
    const clauses = activeClausesForOutput([
      { status: "active", bodyTemplate: "ikinci", sortOrder: 20 },
      { status: "draft", bodyTemplate: "taslak", sortOrder: 1 },
      { status: "active", bodyTemplate: " ", sortOrder: 2 },
      { status: "active", bodyTemplate: "birinci", sortOrder: 10 },
    ]);
    expect(clauses.map(clause => clause.bodyTemplate)).toEqual(["birinci", "ikinci"]);
  });
});
