import { describe, expect, it } from "vitest";
import { canEditOfflineContractEids, canViewArchiveDocument, canViewFullOfflineContract, isOfficeRecordAccessAllowed, maskedOwnerSummary, maskUnauthorizedOfficeRecord } from "./offlineContractAccess";

const contract = { userId: "danisman-a" };

describe("offline contract access", () => {
  it("allows the contract owner and a local manager session; office assistants need an explicit consultant scope", () => {
    expect(canViewFullOfflineContract(contract, { userId: "danisman-a", role: "consultant", managerSessionActive: false })).toBe(true);
    expect(canViewFullOfflineContract(contract, { userId: "danisman-b", role: "consultant", managerSessionActive: true })).toBe(true);
    expect(canViewFullOfflineContract(contract, { userId: "asistan", role: "officeAssistant", managerSessionActive: false, assistantAssignedUserIds: ["danisman-a"] })).toBe(true);
    expect(canViewFullOfflineContract(contract, { userId: "asistan", role: "officeAssistant", managerSessionActive: false, assistantAssignedUserIds: ["danisman-b"] })).toBe(false);
  });

  it("denies a different consultant access to a full contract", () => {
    expect(canViewFullOfflineContract(contract, { userId: "danisman-b", role: "consultant", managerSessionActive: false })).toBe(false);
    expect(isOfficeRecordAccessAllowed(contract, { userId: "danisman-b", role: "consultant", managerSessionActive: false })).toBe(false);
    expect(maskedOwnerSummary("Ayşe Malik")).toBe("A••• M••••");
  });

  it("limits EİDS completion to the record owner or an active local broker manager", () => {
    expect(canEditOfflineContractEids(contract, { userId: "danisman-a", role: "consultant", managerSessionActive: false })).toBe(true);
    expect(canEditOfflineContractEids(contract, { userId: "danisman-b", role: "consultant", managerSessionActive: false })).toBe(false);
    expect(canEditOfflineContractEids(contract, { userId: "asistan", role: "officeAssistant", managerSessionActive: false })).toBe(false);
    expect(canEditOfflineContractEids(contract, { userId: "broker", role: "consultant", managerSessionActive: true })).toBe(true);
    expect(canEditOfflineContractEids(contract, { userId: "broker", role: "officeAssistant", managerSessionActive: true })).toBe(true);
  });

  it("applies the same owner, manager and office assistant policy to read-only archive PDFs", () => {
    const archive = { userId: "danisman-a" };
    expect(canViewArchiveDocument(archive, { userId: "danisman-a", role: "consultant", managerSessionActive: false })).toBe(true);
    expect(canViewArchiveDocument(archive, { userId: "danisman-b", role: "consultant", managerSessionActive: false })).toBe(false);
    expect(canViewArchiveDocument(archive, { userId: "manager", role: "consultant", managerSessionActive: true })).toBe(true);
    expect(canViewArchiveDocument(archive, { userId: "asistan", role: "officeAssistant", managerSessionActive: false, assistantAssignedUserIds: ["danisman-a"] })).toBe(true);
  });

  it("masks another consultant's contract, client and property summaries without masking authorized roles", () => {
    const context = { userId: "danisman-b", role: "consultant" as const, managerSessionActive: false };
    const hiddenContract = maskUnauthorizedOfficeRecord({ entity: "contract", userId: "danisman-a", title: "Ayşe Malik kira sözleşmesi", details: "Adres, TCKN ve telefon" }, context);
    expect(hiddenContract).toMatchObject({ title: "Başka danışmana ait sözleşme", details: expect.stringContaining("gizli") });
    expect(hiddenContract.title).not.toContain("Ayşe");
    expect(hiddenContract.details).not.toContain("Telefon");
    expect(maskUnauthorizedOfficeRecord({ entity: "client", userId: "danisman-a", title: "Ayşe Malik", details: "Telefon" }, context)).toMatchObject({ title: "Başka danışmana ait müşteri", details: expect.stringContaining("gizli") });
    expect(maskUnauthorizedOfficeRecord({ entity: "property", userId: "danisman-a", title: "Urla adres", details: "Malik bağlantısı" }, context)).toMatchObject({ title: "Başka danışmana ait portföy", details: expect.stringContaining("gizli") });
    expect(maskUnauthorizedOfficeRecord({ entity: "contractArchive", userId: "danisman-a", title: "Ayşe Malik PDF", details: "Sözleşme içeriği" }, context)).toMatchObject({ title: "Başka danışmana ait arşiv belgesi", details: expect.stringContaining("gizli") });
    expect(maskUnauthorizedOfficeRecord({ entity: "activeContractDocument", userId: "danisman-a", title: "Ayşe Malik imzalı PDF", details: "PDF adı ve müşteri bilgisi" }, context)).toMatchObject({ title: "Başka danışmana ait imzalı belge", details: expect.stringContaining("gizli") });
    expect(maskUnauthorizedOfficeRecord({ entity: "client", userId: "danisman-a", title: "Ayşe Malik", details: "Telefon" }, { ...context, role: "officeAssistant", assistantAssignedUserIds: ["danisman-a"] })).toMatchObject({ title: "Ayşe Malik", details: "Telefon" });
  });
});
