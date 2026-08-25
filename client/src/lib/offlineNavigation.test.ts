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
    expect(normalizeOfflineHash("#/offline-active-documents")).toBe("#/offline-active-documents");
    expect(normalizeOfflineHash("#/offline-archive")).toBe("#/offline-archive");
    expect(normalizeOfflineHash("#/offline-performance")).toBe("#/offline-performance");
    expect(normalizeOfflineHash("#/offline-my-contracts")).toBe("#/offline-my-contracts");
    expect(normalizeOfflineHash("#/offline-targets")).toBe("#/offline-targets");
    expect(normalizeOfflineHash("#/offline-requests")).toBe("#/offline-requests");
    expect(normalizeOfflineHash("#/offline-request-matches")).toBe("#/offline-request-matches");
    expect(normalizeOfflineHash("#/offline-transactions")).toBe("#/offline-transactions");
    expect(normalizeOfflineHash("#/offline-cash-bank")).toBe("#/offline-cash-bank");
    expect(offlineNavigationItems.map((item) => item.path)).toEqual(["#/offline", "#/offline-authority", "#/offline-rental", "#/offline-transactions", "#/offline-performance", "#/offline-cash-bank", "#/offline-targets", "#/offline-request-matches", "#/offline-merge", "#/offline-my-contracts", "#/offline-active-documents", "#/offline-requests", "#/offline-archive"]);
    expect(offlineNavigationItems.filter((item) => item.section === "personal").map((item) => item.path)).toEqual(["#/offline-my-contracts", "#/offline-active-documents", "#/offline-requests", "#/offline-archive"]);
    expect(offlineNavigationItems.find((item) => item.path === "#/offline-performance")?.label).toBe("Sözleşme ve Finansal İstatistikler");
  });
});
