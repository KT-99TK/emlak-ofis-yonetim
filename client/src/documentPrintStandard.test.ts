import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Global 1881 ortak A4 belge standardı", () => {
  const css = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

  it("uses balanced Word-like A4 print margins for shared document shells", () => {
    expect(css).toContain("@page { size: A4 portrait; margin: 20mm 20mm 22mm; }");
    expect(css).toContain(".authority-print-document");
    expect(css).toContain("box-sizing: border-box");
  });

  it("centers filled document table values while keeping fixture explanations readable", () => {
    expect(css).toContain(".authority-contract-document .authority-document-section > table td { text-align: center; }");
    expect(css).toContain(".rental-fixture-table td:nth-child(2), .rental-fixture-table td:nth-child(4) { text-align: left !important; }");
    expect(css).toContain(".authority-contract-document table tr { break-inside: avoid; }");
  });

  it("allows long condition sections to flow without forcing a blank page", () => {
    expect(css).toContain(".authority-document-conditions { break-inside: auto; }");
    expect(css).toContain("break-inside: avoid;");
  });
});
