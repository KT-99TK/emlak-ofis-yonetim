import type { Request, Response } from "express";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";
import { sdk } from "./_core/sdk";

const DAY_MS = 86_400_000;

export function parseLeadDays(value: string | null | undefined) {
  return (value ?? "30,14,7,3,1").split(",").map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 365).sort((a, b) => b - a);
}

/** Heartbeat callback; only the platform cron identity may invoke this route. */
export async function scheduledRemindersHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const preferences = await db.getReminderPreferenceByTaskUid(user.taskUid);
    if (!preferences) return res.json({ ok: true, skipped: "orphan" });
    if (!preferences.enabled) return res.json({ ok: true, skipped: "disabled" });

    const now = new Date();
    const leadDays = parseLeadDays(preferences.leadDays);
    const obligations = await db.listDueObligationsForReminder(preferences.userId, now);
    const candidates = obligations.filter((obligation) => {
      const daysUntil = Math.ceil((new Date(obligation.dueDate).getTime() - now.getTime()) / DAY_MS);
      return daysUntil < 0 || leadDays.includes(daysUntil);
    });
    if (!candidates.length) return res.json({ ok: true, sent: false, candidateCount: 0 });

    const runKey = `${now.toISOString().slice(0, 10)}:${candidates.map((item) => item.id).sort((a, b) => a - b).join("-")}`;
    const claimed = await db.markReminderRun(preferences.userId, runKey);
    if (!claimed) return res.json({ ok: true, skipped: "duplicate-run", runKey });

    const content = candidates.map((obligation) => {
      const daysUntil = Math.ceil((new Date(obligation.dueDate).getTime() - now.getTime()) / DAY_MS);
      const timing = daysUntil < 0 ? `${Math.abs(daysUntil)} gün gecikmiş` : `${daysUntil} gün kaldı`;
      return `• ${obligation.title} (${obligation.obligationType}) — ${timing} — ${obligation.amount} TL`;
    }).join("\n");
    const accepted = await notifyOwner({ title: "Global 1881 vade hatırlatması", content });
    if (!accepted) return res.status(503).json({ error: "notification-not-accepted", candidateCount: candidates.length, runKey });
    return res.json({ ok: true, sent: true, candidateCount: candidates.length, runKey });
  } catch (error) {
    return res.status(500).json({ error: String(error), context: { url: req.originalUrl, taskUid: req.headers["x-manus-task-uid"] ?? null }, timestamp: new Date().toISOString() });
  }
}
