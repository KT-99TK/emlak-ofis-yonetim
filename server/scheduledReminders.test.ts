import { describe, expect, it } from "vitest";
import { parseLeadDays } from "./scheduledReminders";

describe("scheduled reminder preferences", () => {
  it("uses descending valid lead days and ignores malformed values", () => {
    expect(parseLeadDays("1,14,garbage,-2,366,7,7")).toEqual([14, 7, 7, 1]);
  });

  it("uses the documented defaults when no preference exists", () => {
    expect(parseLeadDays(undefined)).toEqual([30, 14, 7, 3, 1]);
  });
});
