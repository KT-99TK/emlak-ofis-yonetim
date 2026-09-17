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
    expect(html).toContain("bg-[#12302A]");
    expect(html).toContain("h-[62px] w-[62px]");
    expect(html).toContain("bg-[#fffdf6]");
    expect(html).toContain("text-[#12302A]");
    expect(html).toContain("ring-1 ring-[#D4622A]/70");
    expect(html).toContain("whitespace-nowrap");
  });
});
