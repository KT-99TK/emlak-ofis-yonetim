import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("customer requests personal card layout", () => {
  it("uses the concise personal open-requests heading while retaining the ownership note", () => {
    const source = readFileSync(new URL("./CustomerRequests.tsx", import.meta.url), "utf8");
    expect(source).toContain(">Açık Taleplerim</CardTitle>");
    expect(source).not.toContain(">Benim açık taleplerim</CardTitle>");
    expect(source).toContain("Yalnız kendi talepleriniz görünür.");
  });
});
