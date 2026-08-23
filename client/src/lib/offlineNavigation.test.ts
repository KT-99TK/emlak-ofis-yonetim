import { describe, expect, it } from "vitest";
import { normalizeOfflineHash, offlineNavigationItems } from "./offlineNavigation";

describe("offline navigation", () => {
  it("uses the workspace as the safe default hash", () => {
    expect(normalizeOfflineHash("")).toBe("#/offline");
    expect(normalizeOfflineHash("#/unsupported")).toBe("#/offline");
  });

  it("keeps the contract and merge routes among local desktop destinations", () => {
    expect(normalizeOfflineHash("#/offline-merge")).toBe("#/offline-merge");
    expect(normalizeOfflineHash("#/offline-authority")).toBe("#/offline-authority");
    expect(normalizeOfflineHash("#/offline-rental")).toBe("#/offline-rental");
    expect(normalizeOfflineHash("#/offline-performance")).toBe("#/offline-performance");
    expect(offlineNavigationItems.map((item) => item.path)).toEqual(["#/offline", "#/offline-authority", "#/offline-rental", "#/offline-performance", "#/offline-merge"]);
  });
});
