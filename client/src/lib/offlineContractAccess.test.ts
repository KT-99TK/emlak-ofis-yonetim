import { describe, expect, it } from "vitest";
import { canViewFullOfflineContract, isOfficeRecordAccessAllowed, maskedOwnerSummary, maskUnauthorizedOfficeRecord } from "./offlineContractAccess";

const contract = { userId: "danisman-a" };

describe("offline contract access", () => {
  it("allows the contract owner, a local manager session and office assistant access", () => {
    expect(canViewFullOfflineContract(contract, { userId: "danisman-a", role: "consultant", managerSessionActive: false })).toBe(true);
    expect(canViewFullOfflineContract(contract, { userId: "danisman-b", role: "consultant", managerSessionActive: true })).toBe(true);
    expect(canViewFullOfflineContract(contract, { userId: "asistan", role: "officeAssistant", managerSessionActive: false })).toBe(true);
  });

  it("denies a different consultant access to a full contract", () => {
    expect(canViewFullOfflineContract(contract, { userId: "danisman-b", role: "consultant", managerSessionActive: false })).toBe(false);
    expect(isOfficeRecordAccessAllowed(contract, { userId: "danisman-b", role: "consultant", managerSessionActive: false })).toBe(false);
    expect(maskedOwnerSummary("Ayşe Malik")).toBe("A••• M••••");
  });

  it("masks another consultant's contract, client and property summaries without masking authorized roles", () => {
    const context = { userId: "danisman-b", role: "consultant" as const, managerSessionActive: false };
    const hiddenContract = maskUnauthorizedOfficeRecord({ entity: "contract", userId: "danisman-a", title: "Ayşe Malik kira sözleşmesi", details: "Adres, TCKN ve telefon" }, context);
    expect(hiddenContract).toMatchObject({ title: "Başka danışmana ait sözleşme", details: expect.stringContaining("gizli") });
    expect(hiddenContract.title).not.toContain("Ayşe");
    expect(hiddenContract.details).not.toContain("Telefon");
    expect(maskUnauthorizedOfficeRecord({ entity: "client", userId: "danisman-a", title: "Ayşe Malik", details: "Telefon" }, context)).toMatchObject({ title: "Başka danışmana ait müşteri", details: expect.stringContaining("gizli") });
    expect(maskUnauthorizedOfficeRecord({ entity: "property", userId: "danisman-a", title: "Urla adres", details: "Malik bağlantısı" }, context)).toMatchObject({ title: "Başka danışmana ait portföy", details: expect.stringContaining("gizli") });
    expect(maskUnauthorizedOfficeRecord({ entity: "client", userId: "danisman-a", title: "Ayşe Malik", details: "Telefon" }, { ...context, role: "officeAssistant" })).toMatchObject({ title: "Ayşe Malik", details: "Telefon" });
  });
});
