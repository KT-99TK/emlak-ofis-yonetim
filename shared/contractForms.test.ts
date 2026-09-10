import { describe, expect, it } from "vitest";
import { activeClausesForOutput, getDefaultFormFields, normalizeClauseDraft, renderContractFormOutput } from "./contractForms";

describe("contract form clause model", () => {
  it("normalizes a party-specific optional clause without inventing legal text", () => {
    expect(normalizeClauseDraft({
      partyScope: "seller",
      title: "Özel teslim notu",
      bodyTemplate: "[teslim koşulu]",
    })).toMatchObject({
      partyScope: "seller",
      title: "Özel teslim notu",
      bodyTemplate: "[teslim koşulu]",
      status: "draft",
      sortOrder: 0,
    });
  });

  it("keeps sale closing and land-share party fields distinct", () => {
    const saleKeys = getDefaultFormFields("sale_closing").map(field => field.fieldKey);
    const landShareKeys = getDefaultFormFields("land_share").map(field => field.fieldKey);
    expect(saleKeys).toContain("sellerName");
    expect(saleKeys).toContain("buyerName");
    expect(saleKeys).toContain("finalDeedTransferDate");
    expect(saleKeys).toContain("agreedWithdrawalFee");
    expect(saleKeys).toContain("sellerResidenceStatus");
    expect(saleKeys).toContain("buyerResidenceStatus");
    expect(saleKeys).not.toContain("landShareRatio");
    expect(landShareKeys).toContain("landShareRatio");
    expect(landShareKeys).not.toContain("salePrice");
  });

  it("renders fillable fields and excludes draft clauses from output", () => {
    const output = renderContractFormOutput({
      fields: [
        { fieldKey: "buyerName", label: "Alıcı", sortOrder: 20 },
        { fieldKey: "contractDate", label: "Tarih", sortOrder: 10 },
      ],
      fieldValues: { buyerName: "Ayşe Kaya" },
      clauses: [
        { id: 2, title: "Taslak", bodyTemplate: "taslak metin", sortOrder: 20, status: "draft" },
        { id: 1, title: "Aktif", bodyTemplate: "aktif metin", sortOrder: 10, status: "active" },
      ],
    });
    expect(output.fields).toEqual([
      { fieldKey: "contractDate", label: "Tarih", value: "" },
      { fieldKey: "buyerName", label: "Alıcı", value: "Ayşe Kaya" },
    ]);
    expect(output.clauses.map(clause => clause.id)).toEqual([1]);
  });

  it("outputs only active non-empty clauses in their configured order", () => {
    const clauses = activeClausesForOutput([
      { status: "active", bodyTemplate: "ikinci", sortOrder: 20 },
      { status: "draft", bodyTemplate: "taslak", sortOrder: 1 },
      { status: "active", bodyTemplate: " ", sortOrder: 2 },
      { status: "active", bodyTemplate: "birinci", sortOrder: 10 },
    ]);
    expect(clauses.map(item => item.bodyTemplate)).toEqual(["birinci", "ikinci"]);
  });
});
