import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AuthorityContractDocument from "./AuthorityContractDocument";
import { emptyAuthorityDetails } from "@/lib/authorityContract";

describe("authority contract signature boxes", () => {
  it("keeps the owner and the authorized office/advisor as the two signature parties", () => {
    const html = renderToStaticMarkup(<AuthorityContractDocument details={{ ...emptyAuthorityDetails(), ownerName: "Ayşe Malik", officeName: "Global 1881 Gayrimenkul", consultantName: "Cahit Tercan" }} contractNo="YET-2026-CT-001" fontSize="10" />);
    expect(html).toContain("TAŞINMAZ MALİKİ");
    expect(html).toContain("YETKİ ALAN EMLAK OFİSİ / DANIŞMAN");
    expect(html).toContain("Yetkili danışman: Cahit Tercan");
    expect(html.match(/<div class="authority-party-signature-box"/g)).toHaveLength(2);
  });
});
