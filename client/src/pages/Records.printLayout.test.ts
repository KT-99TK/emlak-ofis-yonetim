import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const records = readFileSync(new URL("./Records.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../index.css", import.meta.url), "utf8");

describe("Records print layout", () => {
  it("closes portfolio table rows so filtered print output is valid HTML", () => {
    expect(records).toContain('safe(item.address || item.entryType || item.listingType)}</td></tr>`');
  });

  it("uses compact A4 print rules to avoid unnecessary blank pages", () => {
    expect(css).toContain("@page { size: A4 portrait; margin: 8mm; }");
    expect(css).toContain("table-layout: fixed");
    expect(css).toContain("break-inside: avoid");
  });

  it("prints the central customer number separately from the rental technical id", () => {
    expect(records).toContain("item.clientReferenceNo || \"—\"");
    expect(records).toContain("Merkezi müşteri no");
    expect(records).toContain("Kira / portföy kayıt no");
    expect(records).toContain("[item.clientReferenceNo || \"\", item.referenceNo || item.id");
  });
});
