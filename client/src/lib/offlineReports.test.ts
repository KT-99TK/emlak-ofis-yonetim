import { describe, expect, it } from "vitest";
import { isUpcomingEvacuation } from "./offlineReports";
import type { OfflineRecord } from "./offlineStore";

const base = { id: "1", entity: "evacuation", title: "Tahliye", userId: "u", deviceId: "d", recordVersion: 1, updatedAt: "2026-01-01T00:00:00.000Z", status: "draft" } as OfflineRecord;

describe("isUpcomingEvacuation", () => {
  const now = Date.parse("2026-01-01T00:00:00.000Z");
  it("uses the default 60-day lead time", () => {
    expect(isUpcomingEvacuation({ ...base, noticeDate: "2026-02-15T00:00:00.000Z" }, now)).toBe(true);
    expect(isUpcomingEvacuation({ ...base, noticeDate: "2026-03-10T00:00:00.000Z" }, now)).toBe(false);
  });
  it("uses a custom noticeDays threshold and excludes overdue dates", () => {
    expect(isUpcomingEvacuation({ ...base, noticeDate: "2026-01-14T00:00:00.000Z", noticeDays: 14 }, now)).toBe(true);
    expect(isUpcomingEvacuation({ ...base, noticeDate: "2025-12-20T00:00:00.000Z", noticeDays: 60 }, now)).toBe(false);
  });
});
