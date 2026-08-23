import { describe, expect, it } from "vitest";
import { formatTurkishDate, formatTurkishDateTime, formatTurkishLongDate } from "./turkishDate";

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
});
