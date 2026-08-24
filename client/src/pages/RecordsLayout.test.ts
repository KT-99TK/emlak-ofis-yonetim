import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("records responsive action layout", () => {
  it("keeps the mobile entry field and portfolio filters in wrapping action groups", () => {
    const source = readFileSync(new URL("./Records.tsx", import.meta.url), "utf8");
    expect(source).toContain("flex flex-col items-stretch gap-4 sm:flex-row");
    expect(source).toContain("flex w-full flex-wrap items-center gap-2 sm:w-auto");
    expect(source).toContain('className="w-full min-w-0 bg-white sm:w-44"');
    expect(source).toContain('className="h-9 w-[144px] bg-white"');
  });
});
