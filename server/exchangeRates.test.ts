import { describe, expect, it } from "vitest";
import { __exchangeRateTestables } from "./exchangeRates";

describe("ECB EUR/TL veri parserı", () => {
  it("virgüllü ve tırnaklı CSV alanlarını bozmadan okur", () => {
    const values = __exchangeRateTestables.parseCsvLine('EXR.D.TRY.EUR.SP00.A,D,TRY,EUR,"ECB, reference",56.3329');
    expect(values).toEqual([
      "EXR.D.TRY.EUR.SP00.A",
      "D",
      "TRY",
      "EUR",
      "ECB, reference",
      "56.3329",
    ]);
  });

  it("kur serisi satırındaki tarih ve değer alanlarını ayrı okur", () => {
    const header = __exchangeRateTestables.parseCsvLine("KEY,TIME_PERIOD,OBS_VALUE");
    const row = __exchangeRateTestables.parseCsvLine("D.TRY,2026-09-11,56.3329");
    expect(header.indexOf("TIME_PERIOD")).toBe(1);
    expect(header.indexOf("OBS_VALUE")).toBe(2);
    expect(row[1]).toBe("2026-09-11");
    expect(Number(row[2])).toBe(56.3329);
  });
});
