import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import AuthorityContractDocument, { resolveAuthoritySealSrc } from "./AuthorityContractDocument";
import { emptyAuthorityDetails } from "@/lib/authorityContract";

describe("authority contract signature boxes", () => {
  it("keeps the owner and the authorized office/advisor as the two signature parties", () => {
    const html = renderToStaticMarkup(<AuthorityContractDocument details={{ ...emptyAuthorityDetails(), ownerName: "Ayşe Malik", officeName: "Global 1881 Gayrimenkul", consultantName: "Cahit Tercan" }} contractNo="YET-2026-CT-001" fontSize="10" />);
    expect(html).toContain("TAŞINMAZ MALİKİ");
    expect(html).toContain("YETKİ ALAN EMLAK OFİSİ / DANIŞMAN");
    expect(html).toContain("Yetkili danışman: Cahit Tercan");
    expect(html.match(/<div class="authority-party-signature-box"/g)).toHaveLength(2);
    expect(html).toContain("global1881-muhur-seffaf_4acda0e7.png");
    expect(html).toContain("authority-contract-document");
    expect(html).toContain("authority-document-brand");
    expect(html).toContain("Yetki Süresi");
  });

  it("uses the packaged file URL only when Electron provides the bundled seal asset", () => {
    expect(resolveAuthoritySealSrc("file:///C:/Global1881/app.asar/desktop/brand/global1881-muhur-seffaf.png")).toContain("file:///C:/Global1881/");
    expect(resolveAuthoritySealSrc("https://example.invalid/seal.png")).toContain("/manus-storage/");
    expect(resolveAuthoritySealSrc(undefined)).toContain("/manus-storage/");
  });

  it("does not show a service fee or KDV field on the rental authority document", () => {
    const html = renderToStaticMarkup(<AuthorityContractDocument details={{ ...emptyAuthorityDetails(), mode: "rent", ownerName: "Ayşe Malik", price: "25000", serviceFeeAmount: "25000", serviceFeeRate: "2" }} contractNo="YET-2026-CT-002" fontSize="10" />);
    expect(html).toContain("Aylık Kira Bedeli (Sözleşmeye Esas)");
    expect(html).not.toContain("Hizmet Bedeli");
    expect(html).not.toContain("KDV tahsil edildi");
  });

  it("keeps the central authority screen on the shared A4 document component", () => {
    const source = readFileSync(new URL("../pages/AuthorityContracts.tsx", import.meta.url), "utf8");
    expect(source).toContain('import AuthorityContractDocument from "@/components/AuthorityContractDocument"');
    expect(source).toContain("authority-print-shell");
    expect(source).toContain("<AuthorityContractDocument details={details}");
  });

  it("does not expose a broken packaged seal path when the Electron asset is absent", () => {
    const preloadSource = readFileSync(new URL("../../../desktop/preload.mjs", import.meta.url), "utf8");
    expect(preloadSource).toContain("existsSync(authoritySealPath)");
    expect(preloadSource).toContain("authoritySealSrc = existsSync");
  });
});
