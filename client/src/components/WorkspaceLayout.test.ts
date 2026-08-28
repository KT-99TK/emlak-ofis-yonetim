import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import OfflineAuthorityContracts from "@/pages/OfflineAuthorityContracts";
import OfflineRentalContracts, { PropertyAddressDaskFields } from "@/pages/OfflineRentalContracts";
import OfflineWorkspace from "@/pages/OfflineWorkspace";

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
    expect(authorityHtml).toContain("offline-operation-grid");
    expect(authorityHtml).toContain("offline-operation-aside");
    expect(rentalHtml).toContain("offline-operation-grid");
    expect(rentalHtml).toContain("offline-operation-aside");

    vi.stubGlobal("window", { location: { protocol: "file:" }, localStorage: { getItem: () => "TEST-MANAGER" } });
    const desktopWorkspaceHtml = renderToStaticMarkup(createElement(OfflineWorkspace));
    const workspaceSource = projectFile("client/src/pages/OfflineWorkspace.tsx");
    expect(desktopWorkspaceHtml).toContain("Bu cihazdaki kayıtlar");
    expect(workspaceSource).toContain('value="all">Tüm offline kayıtlar');
    expect(workspaceSource).toContain('value="evacuation">Tahliye bildirimleri');
    expect(workspaceSource).toContain('value="ownerApproval">Mülk sahibi onayları');
    expect(workspaceSource).toContain('value="client">Müşteri');
    expect(workspaceSource).toContain('value="evacuation">Tahliye');
    expect(workspaceSource).toContain("mb-4 flex flex-wrap gap-2");
    expect(workspaceSource).toContain("w-full max-w-full sm:w-44");

    vi.stubGlobal("window", { location: { protocol: "https:" }, localStorage: { getItem: () => "TEST-MANAGER" } });
    const narrowWorkspaceHtml = renderToStaticMarkup(createElement(OfflineWorkspace));
    expect(narrowWorkspaceHtml).toContain("Bu merkezi HTTPS kısayolu yerel veri yazmaz.");
  });

  it("keeps the workspace flow panel at page level rather than in the shared dashboard shell", () => {
    const workspace = projectFile("client/src/pages/OfflineWorkspace.tsx");
    const dashboard = projectFile("client/src/components/DashboardLayout.tsx");

    expect(workspace).toContain('<OfflineOfficeFlowPanel className="offline-operation-aside"');
    expect(dashboard).not.toContain("<OfflineOfficeFlowPanel");
  });

  it("uses a compact shared offline operation surface without letting the helper panel dominate the form", () => {
    const css = projectFile("client/src/index.css");

    expect(css).toContain('.offline-page-surface .offline-operation-main > .rounded-2xl > [data-slot="card-header"]');
    expect(css).toContain('.offline-page-surface .offline-operation-main :is(input, textarea, [data-slot="select-trigger"])');
    expect(css).toContain('.offline-operation-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.5rem; max-width: 1180px; margin: 0 auto; }');
    expect(css).toContain('.offline-root-with-flow { display: grid; grid-template-columns: minmax(0, 1fr); gap: 1.5rem; max-width: 1180px; margin: 0 auto; }');
    expect(css).toContain('grid-template-columns: minmax(0, 1fr) minmax(248px, 280px);');
    expect(css).toContain('.offline-operation-aside { position: sticky; top: 1.25rem; }');
  });

  it("keeps the authority and rental workspaces on the same responsive flow surface", () => {
    const authorityPage = projectFile("client/src/pages/OfflineAuthorityContracts.tsx");
    const rentalPage = projectFile("client/src/pages/OfflineRentalContracts.tsx");
    const css = projectFile("client/src/index.css");

    expect(authorityPage).toContain('className="offline-operation-grid print:block"');
    expect(rentalPage).toContain('className="offline-operation-grid print:block"');
    expect(authorityPage).toContain('offline-operation-aside print:hidden');
    expect(rentalPage).toContain('offline-operation-aside print:hidden');
    expect(css).toContain("@media (min-width: 1280px)");
    expect(css).toContain("grid-template-columns: minmax(0, 1fr) minmax(248px, 280px);");
  });

  it("places the authority document type decision before the optional previous-draft lookup", () => {
    const authorityPage = projectFile("client/src/pages/OfflineAuthorityContracts.tsx");

    expect(authorityPage.indexOf("Belge türü")).toBeLessThan(authorityPage.indexOf("Önceki yetki taslağını çağır"));
    expect(authorityPage).toContain("Belge türünü seçtikten sonra");
  });

  it("places the numeric EİDS authority number below the owner name/TCKN row and keeps it outside the A4 preview", () => {
    const authorityPage = projectFile("client/src/pages/OfflineAuthorityContracts.tsx");
    const authorityDocument = projectFile("client/src/components/AuthorityContractDocument.tsx");

    expect(authorityPage.indexOf("const ownerIdentityFields")).toBeLessThan(authorityPage.indexOf("const ownerContactFields"));
    expect(authorityPage.indexOf("ownerIdentityFields.map(renderDetailsField)")).toBeLessThan(authorityPage.indexOf("EİDS Yetki Numarası"));
    expect(authorityPage.indexOf("EİDS Yetki Numarası")).toBeLessThan(authorityPage.indexOf("ownerContactFields.map(renderDetailsField)"));
    expect(authorityPage).not.toContain('["eidsAuthorizationNumber", "EİDS Yetki Numarası"]');
    expect(authorityPage).toContain('inputMode="numeric" pattern="[0-9]*" value={details.eidsAuthorizationNumber}');
    expect(authorityPage).not.toContain('key === "ownerName" &&');
    expect(authorityPage).toContain('value.replace(/\\D/g, "")');
    expect(authorityPage).toContain("authority-eids-confirmed");
    expect(authorityPage).toContain("canEditOfflineContractEids");
    expect(authorityPage).toContain("kayıt sahibi danışman veya açık broker manager");
    expect(authorityDocument).not.toContain("EİDS Yetki Numarası");
  });

  it("places the rental type decision before the optional previous-contract lookup", () => {
    const rentalPage = projectFile("client/src/pages/OfflineRentalContracts.tsx");

    expect(rentalPage.indexOf("Kiralama türü")).toBeLessThan(rentalPage.indexOf("Önceki kira sözleşmesini çağır"));
    expect(rentalPage).toContain("Konut veya işyeri türünü seçtikten sonra");
  });

  it("renders DASK policy and property address in one compact property detail group", () => {
    vi.stubGlobal("React", React);
    const html = renderToStaticMarkup(createElement(PropertyAddressDaskFields, {
      propertyAddress: "Rüstem Mahallesi, Urla",
      daskPolicyNo: "DASK-2026-1881",
      onChange: () => undefined,
    }));

    expect(html).toContain("Taşınmaz açık adresi");
    expect(html).toContain("Rüstem Mahallesi, Urla");
    expect(html).toContain("DASK poliçe numarası");
    expect(html).toContain("DASK-2026-1881");
    expect(html).toContain("sm:col-span-2");
    expect(html).toContain("sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.62fr)]");
    expect(html).not.toContain("border-[#b8d0c6]");
  });

  it("keeps customer-facing rental preview notes visually quiet until the document is assigned", () => {
    const css = projectFile("client/src/index.css");

    expect(css).toContain(".rental-selected-appendices-heading { display: none; }");
    expect(css).toContain(".rental-trace-unassigned .rental-advisor-trace { display: none; }");
  });

  it("gives fixture sequence and quantity columns hard widths that override generic A4 table cells", () => {
    const css = projectFile("client/src/index.css");

    expect(css).toContain(".rental-fixture-table th:nth-child(1), .rental-fixture-table td:nth-child(1) { width: 7% !important; }");
    expect(css).toContain(".rental-fixture-table th:nth-child(3), .rental-fixture-table td:nth-child(3) { width: 8% !important; }");
    expect(css).toContain(".rental-fixture-table th:nth-child(4), .rental-fixture-table td:nth-child(4) { width: 54% !important; }");
  });

  it("uses a restrained emerald and gold matbu design language across A4 documents", () => {
    const css = projectFile("client/src/index.css");

    expect(css).toContain("--document-ink: #173e39;");
    expect(css).toContain("--document-gold: #b48b42;");
    expect(css).toContain("font-family: 'Playfair Display', Georgia, serif;");
    expect(css).toContain("border-left: 2.2mm solid var(--document-gold);");
    expect(css).toContain("background: linear-gradient(90deg, var(--document-ink) 0 84%, var(--document-gold) 84% 100%);");
  });

  it("keeps the evacuation commitment date as a separate blank manual field", () => {
    const rentalPage = projectFile("client/src/pages/OfflineRentalContracts.tsx");

    expect(rentalPage).toContain("Taahhüt edilen tahliye tarihi");
    expect(rentalPage).toContain('value={details.evacuationCommitmentDate ?? ""}');
    expect(rentalPage).toContain('update("evacuationCommitmentDate", value)');
  });

  it("uses the Turkish date input for transaction collection and optional reservation dates", () => {
    const transactionPage = projectFile("client/src/pages/OfflineTransactionClosings.tsx");

    expect(transactionPage).toContain('import TurkishDateInput from "@/components/TurkishDateInput";');
    expect(transactionPage).toContain('aria-label="Tahsilat tarihi"');
    expect(transactionPage).toContain('aria-label="Kapora vade tarihi"');
    expect(transactionPage).not.toContain('type="date" value={collectionEditor.collectedAt}');
    expect(transactionPage).not.toContain('type="date" value={optionalEditor.dueDate}');
  });
});
