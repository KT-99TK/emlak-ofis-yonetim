import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDashboardSummary, listAudit, listClients, listContracts, listLedger, listProperties } from "./db";

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
  }),
  clients: router({
    list: protectedProcedure.query(({ ctx }) => listClients(ctx.user.id, isManager(ctx.user))),
  }),
  properties: router({
    list: protectedProcedure.query(({ ctx }) => listProperties(ctx.user.id, isManager(ctx.user))),
  }),
  ledger: router({
    list: protectedProcedure.query(({ ctx }) => listLedger(ctx.user.id, isManager(ctx.user))),
  }),
  audit: router({
    list: adminProcedure.query(() => listAudit(true)),
  }),
});

export type AppRouter = typeof appRouter;
