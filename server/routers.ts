import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { parse as parseCookieHeader } from "cookie";
import { createHeartbeatJob } from "./_core/heartbeat";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createClient, createContract, decideOwnerApproval, requestOwnerApproval, createLedger, createObligation, createProperty, getDashboardSummary, getReminderPreferenceByUserId, listAudit, listClients, listContracts, listLedger, listObligations, listProperties, listTeamMembers, saveReminderSchedule, transitionContract } from "./db";
import { z } from "zod";

export const isManager = (user: { role: string }) => user.role === "admin";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  dashboard: router({
    summary: protectedProcedure.query(({ ctx }) => getDashboardSummary(ctx.user.id, isManager(ctx.user))),
  }),
  contracts: router({
    list: protectedProcedure.query(({ ctx }) => listContracts(ctx.user.id, isManager(ctx.user))),
    create: protectedProcedure.input(z.object({ contractNo: z.string().min(3), type: z.enum(["rental", "sale", "authority"]), subtype: z.string().optional(), title: z.string().min(3), amount: z.string().optional(), clientId: z.number().optional(), propertyId: z.number().optional(), evictionNoticeDays: z.number().int().positive().optional(), evictionNoticeDate: z.date().optional(), ownerApprovalStatus: z.enum(["notRequired", "pending", "approved", "rejected"]).optional(), ownerApprovalDate: z.date().optional(), ownerApprovalNote: z.string().optional() })).mutation(({ ctx, input }) => createContract({ ...input, assignedUserId: ctx.user.id, actorUserId: ctx.user.id })),
    requestOwnerApproval: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => requestOwnerApproval(input.id, ctx.user.id)),
    decideOwnerApproval: adminProcedure.input(z.object({ id: z.number(), decision: z.enum(["approved", "rejected"]), note: z.string().optional() })).mutation(({ ctx, input }) => decideOwnerApproval(input.id, input.decision, input.note, ctx.user.id)),
    transition: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["draft", "review", "approved", "signed", "active", "completed", "cancelled"]) })).mutation(({ ctx, input }) => transitionContract(input.id, input.status, ctx.user.id)),
  }),
  clients: router({
    list: protectedProcedure.query(({ ctx }) => listClients(ctx.user.id, isManager(ctx.user))),
    create: protectedProcedure.input(z.object({ name: z.string().min(2) })).mutation(({ ctx, input }) => createClient({ ...input, assignedUserId: ctx.user.id })),
  }),
  properties: router({
    list: protectedProcedure.query(({ ctx }) => listProperties(ctx.user.id, isManager(ctx.user))),
    create: protectedProcedure.input(z.object({ referenceNo: z.string().min(2), title: z.string().min(2), address: z.string().min(2), listingType: z.enum(["sale", "rent"]).optional(), ownerApprovalStatus: z.enum(["notRequired", "pending", "approved", "rejected"]).optional() })).mutation(({ ctx, input }) => createProperty({ ...input, assignedUserId: ctx.user.id })),
  }),
  obligations: router({
    list: protectedProcedure.query(({ ctx }) => listObligations(ctx.user.id, isManager(ctx.user))),
    create: protectedProcedure.input(z.object({ title: z.string().min(2), obligationType: z.enum(["rent", "tax", "insurance", "other"]), dueDate: z.coerce.date(), periodStart: z.coerce.date(), periodEnd: z.coerce.date(), amount: z.string().min(1) })).mutation(({ ctx, input }) => createObligation({ ...input, assignedUserId: ctx.user.id })),
  }),
  reminders: router({
    schedule: protectedProcedure.input(z.object({ cron: z.string().regex(/^\d+ \d+ \d+ \* \* \*$/, "6 alanlı UTC cron ifadesi girin") })).mutation(async ({ ctx, input }) => {
      const existing = await getReminderPreferenceByUserId(ctx.user.id);
      if (existing?.scheduleCronTaskUid) return { taskUid: existing.scheduleCronTaskUid, reused: true };
      const cookie = parseCookieHeader(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
      const job = await createHeartbeatJob({ name: `global1881-reminders-${ctx.user.id}`, cron: input.cron, path: "/api/scheduled/reminders", description: "Global 1881 kira, vergi ve tahliye vade hatırlatıcıları" }, cookie);
      await saveReminderSchedule(ctx.user.id, job.taskUid);
      return { ...job, reused: false };
    }),
  }),
  ledger: router({
    list: protectedProcedure.query(({ ctx }) => listLedger(ctx.user.id, isManager(ctx.user))),
    create: protectedProcedure.input(z.object({ description: z.string().min(2), amount: z.string().min(1), entryType: z.enum(["income", "expense", "receivable", "payable"]) })).mutation(({ ctx, input }) => createLedger({ ...input, assignedUserId: ctx.user.id })),
  }),
  team: router({
    list: adminProcedure.query(() => listTeamMembers()),
  }),
  audit: router({
    list: adminProcedure.query(() => listAudit(true)),
  }),
});

export type AppRouter = typeof appRouter;
