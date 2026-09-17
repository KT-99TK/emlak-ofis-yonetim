import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Global 1881 color-only hover contract", () => {
  it("keeps shared buttons and links on color-only transitions", () => {
    const button = readFileSync(resolve(process.cwd(), "client/src/components/ui/button.tsx"), "utf8");
    const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

    expect(button).toContain("transition-colors duration-150");
    expect(button).toContain("hover:bg-[#edf5f0] hover:text-[#12302A]");
    expect(button).toContain("hover:text-[#2C6B55]");
    expect(css).toContain("button, a { transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease; }");
    expect(css).toContain('a:not([aria-disabled="true"]):not([data-no-hover]):hover { color: #2C6B55; }');
    expect(css).not.toContain("button, a { transition: transform");
  });
});
