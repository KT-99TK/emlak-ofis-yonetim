// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { assignOfflineAccessRole, assignOfflineAssistantScope, getOfflineAccessRole, getOfflineAssistantAssignedUserIds } from "./offlineContractAccess";

describe("offline contract access device role", () => {
  beforeEach(() => window.localStorage.clear());

  it("permits an office assistant device role only through an active manager session", () => {
    expect(() => assignOfflineAccessRole("officeAssistant", false)).toThrow("yalnız açık yerel broker manager oturumunda");
    assignOfflineAccessRole("officeAssistant", true);
    expect(getOfflineAccessRole()).toBe("officeAssistant");
    expect(window.localStorage.getItem("global1881-offline-audit")).toContain("contract-access-role-assigned");
  });

  it("stores an assistant's assigned consultant scope only through an active manager session", () => {
    expect(() => assignOfflineAssistantScope(["consultant-a"], false)).toThrow("yalnız açık yerel broker manager oturumunda");
    expect(assignOfflineAssistantScope(["consultant-a", " consultant-a ", "consultant-b"], true)).toEqual(["consultant-a", "consultant-b"]);
    expect(getOfflineAssistantAssignedUserIds()).toEqual(["consultant-a", "consultant-b"]);
    expect(window.localStorage.getItem("global1881-offline-audit")).toContain("contract-access-scope-assigned");
  });
});
