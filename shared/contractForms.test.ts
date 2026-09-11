import { describe, expect, it } from "vitest";
import { activeClausesForOutput, contractFormFieldsComplete, getDefaultFormFields, getMissingRequiredContractFormFields, getSaleClosingArticleNumbering, isTechnicalContractFormField, LAND_SHARE_ATTACHMENT_DEFINITIONS, normalizeClauseDraft, normalizePreparationChecks, numberSaleClosingOptionalClauses, preparationChecksComplete, renderContractFormOutput, requesterFootnote, SALE_CLOSING_PREPARATION_CHECKS } from "./contractForms";

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

  it("adds a requester footnote only when a display name and inclusion flag allow it", () => {
    expect(requesterFootnote({ partyScope: "seller", requesterDisplayName: "Mustafa Bey", includeRequesterFootnote: true })).toBe("(Bu madde, Satıcı Mustafa Bey talebi üzerine protokole eklenmiştir.)");
    expect(requesterFootnote({ partyScope: "buyer", requesterDisplayName: "Ayşe Hanım", includeRequesterFootnote: false })).toBeUndefined();
    expect(requesterFootnote({ partyScope: "buyer", requesterDisplayName: "   ", includeRequesterFootnote: true })).toBeUndefined();
  });

  it("numbers sale-closing optional clauses from article 17 and shifts trailing articles", () => {
    const numbered = numberSaleClosingOptionalClauses([{ title: "Alıcı özel hükmü" }, { title: "Satıcı özel hükmü" }]);
    expect(numbered.map(item => item.articleNumber)).toEqual([17, 18]);
    expect(getSaleClosingArticleNumbering(numbered.length)).toMatchObject({
      firstOptionalArticleNumber: 17,
      jurisdictionArticleNumber: 19,
      finalArticleNumber: 20,
      jurisdictionArticleTitle: "İzmir/Urla mahkemeleri",
    });
  });

  it("keeps sale closing and land-share party fields distinct", () => {
    const saleKeys = getDefaultFormFields("sale_closing").map(field => field.fieldKey);
    const landShareKeys = getDefaultFormFields("land_share").map(field => field.fieldKey);
    expect(saleKeys).toContain("sellerName");
    expect(saleKeys).toContain("buyerName");
    expect(saleKeys).toContain("finalDeedTransferDate");
    expect(saleKeys).toContain("agreedWithdrawalFee");
    expect(saleKeys).toContain("legalBasisReferences");
    expect(saleKeys).not.toContain("sellerResidenceStatus");
    expect(saleKeys).not.toContain("buyerResidenceStatus");
    expect(saleKeys).not.toContain("landShareRatio");
    expect(landShareKeys).toContain("landShareRatio");
    expect(landShareKeys).not.toContain("salePrice");
  });

  it("includes technical silhouette fields and leaves variable financial terms empty by default", () => {
    const landShareFields = getDefaultFormFields("land_share");
    const technicalField = landShareFields.find(field => field.fieldKey === "technical_kitchenEquipment");
    const delayPenalty = landShareFields.find(field => field.fieldKey === "delayPenaltyAmount");
    expect(technicalField).toMatchObject({ fieldType: "multiline", required: true });
    expect(technicalField?.label).toContain("silüet");
    expect(delayPenalty).toMatchObject({ fieldType: "currency", required: false });
  });

  it("blocks incomplete required fields and classifies technical silhouette fields", () => {
    const fields = [
      { fieldKey: "propertyAddress", label: "Taşınmaz adresi", required: true },
      { fieldKey: "delayPenaltyAmount", label: "Geç teslim bedeli", required: false },
      { fieldKey: "technical_kitchenEquipment", label: "Mutfak ekipmanı", required: true },
    ];
    expect(getMissingRequiredContractFormFields(fields, { propertyAddress: "", technical_kitchenEquipment: "" })).toEqual([
      { fieldKey: "propertyAddress", label: "Taşınmaz adresi" },
      { fieldKey: "technical_kitchenEquipment", label: "Mutfak ekipmanı" },
    ]);
    expect(contractFormFieldsComplete(fields, { propertyAddress: "Urla", technical_kitchenEquipment: "Franke veya muadili" })).toBe(true);
    expect(isTechnicalContractFormField("technical_kitchenEquipment")).toBe(true);
    expect(isTechnicalContractFormField("delayPenaltyAmount")).toBe(false);
  });

  it("keeps Kat Karşılığı annexes separate and makes Technical Specification required", () => {
    expect(LAND_SHARE_ATTACHMENT_DEFINITIONS.map(item => item.attachmentType)).toEqual([
      "technical_specification",
      "numbering_sketch",
      "management_plan",
      "power_of_attorney",
      "signature_circular",
    ]);
    expect(LAND_SHARE_ATTACHMENT_DEFINITIONS[0]).toMatchObject({ title: "EK-1 Teknik Şartname", required: true });
    expect(LAND_SHARE_ATTACHMENT_DEFINITIONS.slice(1).every(item => item.required === false)).toBe(true);
  });

  it("renders fillable fields and excludes draft clauses from output", () => {
    const output = renderContractFormOutput({
      formType: "sale_closing",
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
    expect(output.clauses[0].articleNumber).toBe(17);
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

  it("keeps fixed deed fees out of the variable preparation checklist", () => {
    const labels = SALE_CLOSING_PREPARATION_CHECKS.map(check => check.label).join(" ");
    expect(labels).not.toContain("%4");
    expect(labels).not.toContain("döner sermaye");
    expect(SALE_CLOSING_PREPARATION_CHECKS.length).toBe(8);
  });

  it("requires every preparation check before the protocol gate opens", () => {
    const partial = normalizePreparationChecks({ parties_verified: true });
    expect(preparationChecksComplete(partial)).toBe(false);
    const complete = normalizePreparationChecks(Object.fromEntries(SALE_CLOSING_PREPARATION_CHECKS.map(check => [check.key, true])));
    expect(preparationChecksComplete(complete)).toBe(true);
  });
});
