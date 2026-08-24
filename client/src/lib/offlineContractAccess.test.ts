import { describe, expect, it } from "vitest";
import { canViewFullOfflineContract, maskedOwnerSummary } from "./offlineContractAccess";

const contract = { userId: "danisman-a" };

describe("offline contract access", () => {
  it("allows the contract owner, a local manager session and office assistant access", () => {
    expect(canViewFullOfflineContract(contract, { userId: "danisman-a", role: "consultant", managerSessionActive: false })).toBe(true);
    expect(canViewFullOfflineContract(contract, { userId: "danisman-b", role: "consultant", managerSessionActive: true })).toBe(true);
    expect(canViewFullOfflineContract(contract, { userId: "asistan", role: "officeAssistant", managerSessionActive: false })).toBe(true);
  });

  it("denies a different consultant access to a full contract", () => {
    expect(canViewFullOfflineContract(contract, { userId: "danisman-b", role: "consultant", managerSessionActive: false })).toBe(false);
    expect(maskedOwnerSummary("Ayşe Malik")).toBe("A••• M••••");
  });
});
