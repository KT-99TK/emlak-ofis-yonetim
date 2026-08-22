import { beforeEach, describe, expect, it } from "vitest";
import { requireUserId } from "./offlineStore";

function installStorage() {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } } });
  return values;
}

describe("offline güvenli işlem ön koşulları", () => {
  beforeEach(() => installStorage().clear());
  it("kullanıcı kimliği yokken güvenli işlem ön koşulunu reddeder", () => {
    expect(() => requireUserId()).toThrow("kullanıcı kimliğini");
  });
  it("kullanıcı kimliği olduğunda manager işlemi için kimliği döndürür", () => {
    const values = installStorage();
    values.set("global1881-user-id", "manager-01");
    expect(requireUserId()).toBe("manager-01");
  });
});
