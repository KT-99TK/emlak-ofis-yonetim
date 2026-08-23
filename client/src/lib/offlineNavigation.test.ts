import { describe, expect, it } from "vitest";
import { normalizeOfflineHash, offlineNavigationItems } from "./offlineNavigation";

describe("offline navigation", () => {
  it("uses the workspace as the safe default hash", () => {
    expect(normalizeOfflineHash("")).toBe("#/offline");
    expect(normalizeOfflineHash("#/unsupported")).toBe("#/offline");
  });

  it("keeps the merge route and exposes only local desktop destinations", () => {
    expect(normalizeOfflineHash("#/offline-merge")).toBe("#/offline-merge");
    expect(offlineNavigationItems.map((item) => item.path)).toEqual(["#/offline", "#/offline-merge"]);
  });
});
