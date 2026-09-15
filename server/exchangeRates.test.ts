import { describe, expect, it } from "vitest";
import { __exchangeRateTestables } from "./exchangeRates";

const tcmbXml = `<?xml version="1.0" encoding="UTF-8"?>
<Tarih_Date Tarih="15.09.2026" Date="09/15/2026" Bulten_No="2026/173">
  <Currency CurrencyCode="USD">
    <Unit>1</Unit><ForexBuying>48.5343</ForexBuying><ForexSelling>48.6218</ForexSelling>
  </Currency>
  <Currency CurrencyCode="EUR">
    <Unit>1</Unit><ForexBuying>56.0284</ForexBuying><ForexSelling>56.1294</ForexSelling>
  </Currency>
</Tarih_Date>`;

describe("TCMB günlük kur XML parserı", () => {
  it("TCMB tarihini ISO biçimine dönüştürür", () => {
    expect(__exchangeRateTestables.parseRateDate(tcmbXml)).toBe("2026-09-15");
  });

  it("USD ve EUR alış/satış alanlarını ayrı okur", () => {
    expect(__exchangeRateTestables.parseCurrency(tcmbXml, "USD")).toEqual({ buying: 48.5343, selling: 48.6218 });
    expect(__exchangeRateTestables.parseCurrency(tcmbXml, "EUR")).toEqual({ buying: 56.0284, selling: 56.1294 });
  });

  it("eksik para biriminde anlamlı hata verir", () => {
    expect(() => __exchangeRateTestables.parseCurrency(tcmbXml, "EUR")).not.toThrow();
    expect(() => __exchangeRateTestables.parseCurrency(tcmbXml.replace('CurrencyCode="EUR"', 'CurrencyCode="GBP"'), "EUR")).toThrow("TCMB yanıtında EUR kuru bulunamadı.");
  });
});
