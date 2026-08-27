import { describe, expect, it } from "vitest";
import { formatTurkishDate, formatTurkishDateTime, formatTurkishLongDate, parseTurkishDateInput } from "./turkishDate";

describe("Turkish date formatting", () => {
  it("formats ISO-only business dates as DD.MM.YYYY without timezone drift", () => {
    expect(formatTurkishDate("2026-08-23")).toBe("23.08.2026");
  });

  it("formats timestamps with date and time for manifest/audit views", () => {
    expect(formatTurkishDateTime("2026-08-23T14:05:00+03:00")).toContain("23.08.2026");
  });

  it("uses Turkish long date and weekday labels", () => {
    expect(formatTurkishLongDate("2026-08-23")).toBe("23 Ağustos 2026 Pazar");
  });

  it("converts valid Turkish date input to ISO storage and rejects impossible dates", () => {
    expect(parseTurkishDateInput("24.08.2026")).toBe("2026-08-24");
    expect(parseTurkishDateInput("4/2/2026")).toBe("2026-02-04");
    expect(parseTurkishDateInput("31.02.2026")).toBeNull();
    expect(parseTurkishDateInput("2026-02-29")).toBeNull();
    expect(parseTurkishDateInput("29.02.2024")).toBe("2024-02-29");
    expect(parseTurkishDateInput("")).toBe("");
    expect(parseTurkishDateInput("bugün")).toBeNull();
  });

  it("uses an explicit fallback for missing or invalid display values", () => {
    expect(formatTurkishDate(null, "Kayıtlı değil")).toBe("Kayıtlı değil");
    expect(formatTurkishDate("2026-99-99", "Kayıtlı değil")).toBe("Kayıtlı değil");
    expect(formatTurkishDateTime(undefined, "—")).toBe("—");
  });
});
