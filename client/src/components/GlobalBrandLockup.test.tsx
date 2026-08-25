import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import GlobalBrandLockup from "./GlobalBrandLockup";

describe("GlobalBrandLockup", () => {
  it("provides the same large Global 1881 brand hierarchy for every application mode", () => {
    const html = renderToStaticMarkup(<GlobalBrandLockup />);
    expect(html).toContain("GLOBAL 1881");
    expect(html).toContain("Gayrimenkul");
    expect(html).toContain("Ofis yönetim sistemi");
    expect(html).toContain("h-14 w-14");
  });

  it("provides a distinct emerald offline-sidebar lockup without changing the seal hierarchy", () => {
    const html = renderToStaticMarkup(<GlobalBrandLockup variant="offline-sidebar" />);
    expect(html).toContain("bg-[#123f39]");
    expect(html).toContain("h-[58px] w-[58px]");
    expect(html).toContain("text-[#fffdf6]");
    expect(html).toContain("whitespace-nowrap");
  });
});
