// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { assignOfflineAccessRole, getOfflineAccessRole } from "./offlineContractAccess";

describe("offline contract access device role", () => {
  beforeEach(() => window.localStorage.clear());

  it("permits an office assistant device role only through an active manager session", () => {
    expect(() => assignOfflineAccessRole("officeAssistant", false)).toThrow("yalnız açık yerel broker manager oturumunda");
    assignOfflineAccessRole("officeAssistant", true);
    expect(getOfflineAccessRole()).toBe("officeAssistant");
    expect(window.localStorage.getItem("global1881-offline-audit")).toContain("contract-access-role-assigned");
  });
});
