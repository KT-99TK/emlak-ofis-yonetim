import { describe, expect, it } from "vitest";
import { isManager } from "./routers";

describe("office role visibility", () => {
  it("treats admin accounts as broker managers", () => {
    expect(isManager({ role: "admin" })).toBe(true);
  });

  it("keeps consultant accounts out of manager-only views", () => {
    expect(isManager({ role: "user" })).toBe(false);
  });
});
