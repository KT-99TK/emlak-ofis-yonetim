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
    expect(css).toContain(".workspace-content-frame .grid > * { min-width: 0; }");
    expect(css).toContain('img[src="/manus-storage/01_logo_yatay_6b31c4b8.webp"] { display: none; }');
    expect(css).toContain(".workspace-content-frame:has(.authority-print-shell) { max-width: none; }");
    expect(css).toContain(".rental-contract-document { max-width: none; margin-inline: auto; }");
    expect(css).toContain(".rental-appendix-document { display: none; margin: 8mm auto 0; }");
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

  it("keeps the workspace flow panel at page level rather than in the shared dashboard shell", () => {
    const workspace = projectFile("client/src/pages/OfflineWorkspace.tsx");
    const dashboard = projectFile("client/src/components/DashboardLayout.tsx");

    expect(workspace).toContain('<OfflineOfficeFlowPanel className="offline-operation-aside"');
    expect(dashboard).not.toContain("<OfflineOfficeFlowPanel");
  });

  it("places the authority document type decision before the optional previous-draft lookup", () => {
    const authorityPage = projectFile("client/src/pages/OfflineAuthorityContracts.tsx");

    expect(authorityPage.indexOf("Belge türü")).toBeLessThan(authorityPage.indexOf("Önceki yetki taslağını çağır"));
    expect(authorityPage).toContain("Belge türünü seçtikten sonra");
  });
});
