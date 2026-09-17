/** Türkçe karakterleri koruyarak metni büyük harfe çevirir. */
export function toTurkishUpperCase(value: string) {
  return value.toLocaleUpperCase("tr-TR");
}

/** IBAN için yalnız harf/rakamları bırakır ve ülke kodunu büyük harfe çevirir. */
export function normalizeIban(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "").toLocaleUpperCase("tr-TR");
}

/** IBAN’ı ekranda/çıktıda okunabilir dört karakterlik gruplara ayırır. */
export function formatIban(value: string) {
  const normalized = normalizeIban(value);
  return normalized.match(/.{1,4}/g)?.join(" ") ?? "";
}

/** Metin alanlarında büyük harf uygulanacak kira/yetki anahtarlarını merkezi tutar. */
export function isUppercaseTextField(key: string) {
  return [
    "ownerName",
    "ownerAddress",
    "tenantName",
    "tenantAddress",
    "guarantorName",
    "propertyNeighborhood",
    "propertyAddress",
    "propertyType",
    "parcelInfo",
    "usagePurpose",
    "consultantName",
    "consultantTitle",
    "officeName",
    "officeAddress",
    "officeTaxOffice",
    "tenantTaxOffice",
    "eidsAuthorizedBy",
    "floorAndView",
    "condition",
    "sellerName",
    "seller2Name",
    "buyerName",
    "titleDeedOfficeName",
    "brokerSignatoryName",
    "titleDeedInfo",
    // Kat Karşılığı İnşaat Sözleşmesi (land_share) taraf/unvan ve yer alanları — Alım-Satım
    // Protokolü'ndeki sellerName/buyerName ile aynı muameleyi görmesi için eklendi.
    "landownerName",
    "landownerRepresentativeName",
    "contractorName",
    "contractorRepresentativeName",
    "projectNameAndLogo",
    "localAuthorityName",
    "notaryOfficeName",
    "executionPlace",
    "competentCourtAndEnforcementOffice",
    // İl/ilçe, komşu alan propertyNeighborhood gibi büyük harfle yazılır.
    "propertyProvince",
    "propertyDistrict",
  ].includes(key);
}
