// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { getOfflineProfileGreeting, setOfflineProfileGreeting } from "./offlineProfile";

describe("offline profile greeting", () => {
  beforeEach(() => window.localStorage.clear());

  it("stores only the current device greeting in normalized, bounded form", () => {
    setOfflineProfileGreeting("  Cahit   Beyin   Dikkatine  ");
    expect(getOfflineProfileGreeting()).toBe("Cahit Beyin Dikkatine");
    setOfflineProfileGreeting("");
    expect(getOfflineProfileGreeting()).toBe("");
  });
});
