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

  it("places the rental type decision before the optional previous-contract lookup", () => {
    const rentalPage = projectFile("client/src/pages/OfflineRentalContracts.tsx");

    expect(rentalPage.indexOf("Kiralama türü")).toBeLessThan(rentalPage.indexOf("Önceki kira sözleşmesini çağır"));
    expect(rentalPage).toContain("Konut veya işyeri türünü seçtikten sonra");
  });

  it("keeps the DASK policy input in the same plain field rhythm as the property address", () => {
    const css = projectFile("client/src/index.css");

    expect(css).toContain('input[placeholder="DASK poliçe numarasını yazın"]) > :nth-child(5) {');
    expect(css).toContain("padding: 0;");
    expect(css).toContain("background: transparent;");
  });

  it("keeps customer-facing rental preview notes visually quiet until the document is assigned", () => {
    const css = projectFile("client/src/index.css");

    expect(css).toContain(".rental-selected-appendices-heading { display: none; }");
    expect(css).toContain(".rental-trace-unassigned .rental-advisor-trace { display: none; }");
  });

  it("keeps the evacuation commitment date as a separate blank manual field", () => {
    const rentalPage = projectFile("client/src/pages/OfflineRentalContracts.tsx");

    expect(rentalPage).toContain("Taahhüt edilen tahliye tarihi");
    expect(rentalPage).toContain('value={details.evacuationCommitmentDate ?? ""}');
    expect(rentalPage).toContain('update("evacuationCommitmentDate", value)');
  });
});
