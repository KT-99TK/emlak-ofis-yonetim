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

  it("does not show a service fee or KDV field on the rental authority document", () => {
    const html = renderToStaticMarkup(<AuthorityContractDocument details={{ ...emptyAuthorityDetails(), mode: "rent", ownerName: "Ayşe Malik", price: "25000", serviceFeeAmount: "25000", serviceFeeRate: "2" }} contractNo="YET-2026-CT-002" fontSize="10" />);
    expect(html).toContain("Aylık Kira Bedeli (Sözleşmeye Esas)");
    expect(html).not.toContain("Hizmet Bedeli");
    expect(html).not.toContain("KDV tahsil edildi");
  });
});
