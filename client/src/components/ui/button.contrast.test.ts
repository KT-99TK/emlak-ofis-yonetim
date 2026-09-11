import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("primary button kontrast sözleşmesi", () => {
  it("primary ve disabled yeşil butonlarda beyaz metin/ikon kullanır", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/ui/button.tsx"), "utf8");
    expect(source).toContain('default: "bg-primary text-white');
    expect(source).toContain("disabled:text-white");
    expect(source).toContain("disabled:[&_svg]:text-white");
  });
});
