import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("manual reminder policy", () => {
  it("does not create platform schedules from the router", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "server", "routers.ts"), "utf8");
    const block = source.slice(source.indexOf("reminders: router({"), source.indexOf("commissions: router({"));
    expect(block).toContain('code: "FORBIDDEN"');
    expect(block).toContain("Otomatik dış bildirimler kapalıdır");
    expect(block).not.toContain("createHeartbeatJob");
    expect(block).not.toContain("saveReminderSchedule");
  });

  it("keeps the scheduled handler side-effect-free when disabled", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "server", "scheduledReminders.ts"), "utf8");
    expect(source).toContain('return res.json({ ok: true, skipped: "disabled-by-policy", taskUid: user.taskUid });');
    expect(source).not.toContain("notifyOwner");
  });
});
