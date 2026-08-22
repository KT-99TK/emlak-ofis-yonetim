import { describe, expect, it } from "vitest";
import { matchesNoticeLevel, noticePreferenceKey } from "./noticePreferences";

describe("notice preferences", () => {
  it("keeps preference keys isolated per user and stable across level changes", () => {
    const key = noticePreferenceKey("ayse", "level");
    expect(key).toBe(noticePreferenceKey("ayse", "level"));
    expect(key).not.toBe(noticePreferenceKey("mehmet", "level"));
  });

  it("matches only urgent records for the urgent level", () => {
    expect(matchesNoticeLevel(5, "urgent", 30)).toBe(true);
    expect(matchesNoticeLevel(12, "urgent", 30)).toBe(false);
    expect(matchesNoticeLevel(-2, "urgent", 30)).toBe(false);
  });

  it("matches the configured early window for the early level", () => {
    expect(matchesNoticeLevel(12, "early", 30)).toBe(true);
    expect(matchesNoticeLevel(31, "early", 30)).toBe(false);
    expect(matchesNoticeLevel(-2, "early", 30)).toBe(false);
  });

  it("includes both upcoming and overdue records for overdue-inclusive level", () => {
    expect(matchesNoticeLevel(-2, "overdue", 30)).toBe(true);
    expect(matchesNoticeLevel(12, "overdue", 30)).toBe(true);
    expect(matchesNoticeLevel(31, "overdue", 30)).toBe(false);
  });

  it("recalculates popup scope when the selected level changes", () => {
    expect(matchesNoticeLevel(-1, "early", 30)).toBe(false);
    expect(matchesNoticeLevel(-1, "overdue", 30)).toBe(true);
  });
});
