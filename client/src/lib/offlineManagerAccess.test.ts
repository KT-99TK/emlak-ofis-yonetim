import { beforeEach, describe, expect, it } from "vitest";
import { configureLocalManagerPasscode, hasLocalManagerPasscode, isLocalManagerSessionActive, lockLocalManagerAccess, unlockLocalManagerAccess } from "./offlineManagerAccess";

function installStorage() {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) } } });
}

describe("offline local manager access", () => {
  beforeEach(() => installStorage());

  it("stores a salted verifier and only enables a temporary session after the correct passcode", async () => {
    await configureLocalManagerPasscode("Global1881-Broker-2026", "broker");
    expect(hasLocalManagerPasscode()).toBe(true);
    lockLocalManagerAccess();
    await expect(unlockLocalManagerAccess("yanlış-parola")).rejects.toThrow("doğrulanamadı");
    expect(isLocalManagerSessionActive()).toBe(false);
    await expect(unlockLocalManagerAccess("Global1881-Broker-2026")).resolves.toBe(true);
    expect(isLocalManagerSessionActive()).toBe(true);
  });
});
