import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("application print preview", () => {
  it("offers an in-app A4 review before the native Electron print dialog", () => {
    const preview = source("client/src/components/DocumentPrintPreview.tsx");

    expect(preview).toContain("Uygulama içi A4 yazdırma önizlemesi");
    expect(preview).toContain("Sistem yazdırmasına geç");
    expect(preview).toContain("window.setTimeout(onPrint, 140)");
  });

  it("routes both offline contract types through the shared preview before calling window.print", () => {
    const rental = source("client/src/pages/OfflineRentalContracts.tsx");
    const authority = source("client/src/pages/OfflineAuthorityContracts.tsx");

    expect(rental).toContain("setPrintPreviewOpen(true)");
    expect(rental).toContain("<DocumentPrintPreview");
    expect(authority).toContain("const openPrintPreview = () => setPrintPreviewOpen(true)");
    expect(authority).toContain("<DocumentPrintPreview");
  });
});
