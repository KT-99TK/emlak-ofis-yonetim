import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import OfflineAuthorityContracts from "@/pages/OfflineAuthorityContracts";
import OfflineRentalContracts from "@/pages/OfflineRentalContracts";

const projectFile = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("workspace content layout", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps the shared operational width controlled while allowing A4 preview shells to use their own canvas", () => {
    const css = projectFile("client/src/index.css");

    expect(css).toContain(".workspace-content-frame { width: 100%; max-width: 1180px; margin-inline: auto; }");
    expect(css).toContain(".workspace-content-frame:has(.authority-print-shell) { max-width: none; }");
  });

  it("renders both offline A4 preview shells inside their document screen DOM", () => {
    vi.stubGlobal("React", React);
    vi.stubGlobal("window", { localStorage: { getItem: () => "TEST-MANAGER" } });

    const rentalHtml = renderToStaticMarkup(createElement(OfflineRentalContracts));
    const authorityHtml = renderToStaticMarkup(createElement(OfflineAuthorityContracts));

    expect(rentalHtml).toContain("authority-print-shell rental-print-contract");
    expect(rentalHtml).toContain("rental-contract-document");
    expect(authorityHtml).toContain("authority-print-shell");
    expect(authorityHtml).toContain("authority-contract-document");
  });
});
