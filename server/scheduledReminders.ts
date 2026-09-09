import type { Request, Response } from "express";
import * as db from "./db";
import { sdk } from "./_core/sdk";

export function parseLeadDays(value: string | null | undefined) {
  return (value ?? "30,14,7,3,1").split(",").map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 365).sort((a, b) => b - a);
}

/**
 * Heartbeat callback retained only as a safe no-op compatibility endpoint.
 * Global 1881 uses manual renewal of the service calendar; no external
 * notification is emitted even when a legacy preference/taskUid remains.
 */
export async function scheduledRemindersHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const preferences = await db.getReminderPreferenceByTaskUid(user.taskUid);
    if (!preferences) return res.json({ ok: true, skipped: "orphan" });
    return res.json({ ok: true, skipped: "disabled-by-policy", taskUid: user.taskUid });
  } catch (error) {
    return res.status(500).json({ error: String(error), context: { url: req.originalUrl, taskUid: req.headers["x-manus-task-uid"] ?? null }, timestamp: new Date().toISOString() });
  }
}
