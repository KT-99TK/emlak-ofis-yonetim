import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { parse as parseCookieHeader } from "cookie";
import { createHeartbeatJob } from "./_core/heartbeat";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { assertCentralOnlineStartAllowsRecord, closeTreasuryCashDay, configureFreshOnlineStart, createClient, createContract, createContractDocument, createTreasuryCashMovement, decideOwnerApproval, getCentralAccessScope, getContractDocumentForUser, getContractForAssignedUser, getOnlineStartSetting, getTreasuryCashBalance, invalidateContractDocument, recordContractDocumentShareIntent, requestOwnerApproval, createLedger, createObligation, createProperty, getDashboardSummary, getReminderPreferenceByUserId, listAudit, listCentralArchiveDocuments, listClients, listContractDocuments, listContracts, listLedger, listObligations, listProperties, listTeamMembers, saveReminderSchedule, setOfficeAssistantAssignments, transitionContract, verifyTreasuryCashMovement } from "./db";
import { storagePut } from "./storage";
import { createHash } from "node:crypto";
import { z } from "zod";

export const isManager = (user: { role: string }) => user.role === "admin";
const MAX_MOBILE_PDF_BYTES = 12 * 1024 * 1024;
const safeFileName = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^_+/, "").slice(0, 120) || "imzali-sozlesme.pdf";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  dashboard: router({
    summary: protectedProcedure.query(async ({ ctx }) => { const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user)); return getDashboardSummary(ctx.user.id, scope.isManager, scope.permittedUserIds); }),
  }),
  onlineStart: router({
    status: protectedProcedure.query(() => getOnlineStartSetting()),
    configure: adminProcedure.input(z.object({
      effectiveAt: z.coerce.date(),
      note: z.string().max(1000).optional(),
      confirmationText: z.string().min(1).max(120),
    })).mutation(({ ctx, input }) => configureFreshOnlineStart({ ...input, managerUserId: ctx.user.id })),
  }),
  contracts: router({
    list: protectedProcedure.query(async ({ ctx }) => { const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user)); return listContracts(ctx.user.id, scope.isManager, scope.permittedUserIds); }),
    create: protectedProcedure.input(z.object({ contractNo: z.string().min(3), type: z.enum(["rental", "sale", "authority"]), subtype: z.string().optional(), title: z.string().min(3), amount: z.string().optional(), clientId: z.number().optional(), propertyId: z.number().optional(), evictionNoticeDays: z.number().int().positive().optional(), evictionNoticeDate: z.date().optional(), ownerApprovalStatus: z.enum(["notRequired", "pending", "approved", "rejected"]).optional(), ownerApprovalDate: z.date().optional(), ownerApprovalNote: z.string().optional(), details: z.string().max(20000).optional() })).mutation(async ({ ctx, input }) => { const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user)); if (scope.officeRole === "office_assistant") throw new Error("Ofis asistanı yeni sözleşme oluşturamaz."); return createContract({ ...input, assignedUserId: ctx.user.id, actorUserId: ctx.user.id }); }),
    requestOwnerApproval: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => requestOwnerApproval(input.id, ctx.user.id)),
    decideOwnerApproval: adminProcedure.input(z.object({ id: z.number(), decision: z.enum(["approved", "rejected"]), note: z.string().optional() })).mutation(({ ctx, input }) => decideOwnerApproval(input.id, input.decision, input.note, ctx.user.id)),
    transition: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["draft", "review", "approved", "signed", "active", "completed", "cancelled"]) })).mutation(({ ctx, input }) => transitionContract(input.id, input.status, ctx.user.id)),
  }),
  documents: router({
    list: protectedProcedure.query(async ({ ctx }) => { const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user)); return listContractDocuments(ctx.user.id, scope.isManager, scope.permittedUserIds); }),
    archiveList: protectedProcedure.query(async ({ ctx }) => { const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user)); return listCentralArchiveDocuments(ctx.user.id, scope.isManager, scope.permittedUserIds); }),
    attachArchive: adminProcedure.input(z.object({
      assignedUserId: z.number().int().positive(),
      primaryClientId: z.number().int().positive(),
      relatedClients: z.array(z.object({ clientId: z.number().int().positive(), partyRole: z.enum(["propertyOwner", "tenant", "other"]) })).max(8).default([]),
      documentType: z.enum(["authority", "rental", "sales", "appendix", "other"]),
      documentDate: z.coerce.date().optional(),
      historicalActivity: z.string().min(3).max(3000),
      archiveNote: z.string().max(3000).optional(),
      originalFileName: z.string().min(5).max(255),
      pdfBase64: z.string().min(100).max(18_000_000),
    })).mutation(() => {
      throw new Error("Temiz online başlangıçta eski offline PDF arşivi merkezi sisteme aktarılmaz. Eski dosyalar yerel geçmiş arşivinde korunur.");
    }),
    attachActiveSigned: protectedProcedure.input(z.object({
      contractId: z.number().int().positive(),
      originalFileName: z.string().min(5).max(255),
      pdfBase64: z.string().min(100).max(18_000_000),
    })).mutation(async ({ ctx, input }) => {
      const contract = await getContractForAssignedUser(input.contractId, ctx.user.id);
      if (!contract) throw new Error("Yalnız kendi sözleşmenize belge ekleyebilirsiniz.");
      await assertCentralOnlineStartAllowsRecord(contract.createdAt);
      if (!['signed', 'active'].includes(contract.status)) throw new Error("PDF yalnız imza teyitli veya aktif sözleşmeye eklenebilir.");
      const base64 = input.pdfBase64.replace(/^data:application\/pdf;base64,/i, "");
      const bytes = Buffer.from(base64, "base64");
      if (!bytes.length || bytes.length > MAX_MOBILE_PDF_BYTES || bytes.subarray(0, 4).toString() !== "%PDF") throw new Error("Yalnız 12 MB altındaki geçerli PDF belgeleri eklenebilir.");
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      const stored = await storagePut(`office-documents/active-signed/${ctx.user.id}/${contract.id}/${safeFileName(input.originalFileName)}`, bytes, "application/pdf");
      const documentId = await createContractDocument({
        contractId: contract.id,
        clientId: contract.clientId,
        assignedUserId: ctx.user.id,
        category: "activeSigned",
        originalFileName: safeFileName(input.originalFileName),
        storageKey: stored.key,
        sha256,
        byteSize: bytes.byteLength,
        createdByUserId: ctx.user.id,
      });
      return { id: documentId, sha256, byteSize: bytes.byteLength };
    }),
    open: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user));
      const document = await getContractDocumentForUser(input.id, ctx.user.id, scope.isManager, scope.permittedUserIds);
      if (!document) throw new Error("Bu belge için görüntüleme yetkiniz bulunmuyor.");
      if (document.invalidatedAt && !scope.isManager) throw new Error("Bu belge manager tarafından geçersiz kılındı.");
      return {
        id: document.id,
        originalFileName: document.originalFileName,
        // Bu rota her çağrıda session + rol + sahiplik denetimi yapar.
        url: `/api/contract-documents/${document.id}/download`,
        immutable: Boolean(document.immutable),
        sha256: document.sha256,
      };
    }),
    shareIntent: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user));
      await recordContractDocumentShareIntent({ documentId: input.id, actorUserId: ctx.user.id, isManager: scope.isManager, permittedUserIds: scope.permittedUserIds });
      return { ok: true };
    }),
    invalidate: protectedProcedure.input(z.object({
      id: z.number().int().positive(),
      reason: z.string().min(20).max(1000),
      confirmationText: z.literal("GEÇERSİZ KIL"),
    })).mutation(async ({ ctx, input }) => {
      if (!isManager(ctx.user)) throw new Error("Belgeyi geçersiz kılma yetkisi yalnız broker manager hesabındadır.");
      await invalidateContractDocument(input.id, ctx.user.id, input.reason.trim());
      return { ok: true };
    }),
  }),
  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => { const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user)); return listClients(ctx.user.id, scope.isManager, scope.permittedUserIds); }),
    create: protectedProcedure.input(z.object({ name: z.string().min(2) })).mutation(async ({ ctx, input }) => { const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user)); if (scope.officeRole === "office_assistant") throw new Error("Ofis asistanı yeni müşteri kaydı oluşturamaz."); return createClient({ ...input, assignedUserId: ctx.user.id }); }),
  }),
  properties: router({
    list: protectedProcedure.query(async ({ ctx }) => { const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user)); return listProperties(ctx.user.id, scope.isManager, scope.permittedUserIds); }),
    create: protectedProcedure.input(z.object({ referenceNo: z.string().min(2), title: z.string().min(2), address: z.string().min(2), listingType: z.enum(["sale", "rent"]).optional(), ownerApprovalStatus: z.enum(["notRequired", "pending", "approved", "rejected"]).optional() })).mutation(async ({ ctx, input }) => { const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user)); if (scope.officeRole === "office_assistant") throw new Error("Ofis asistanı yeni portföy kaydı oluşturamaz."); return createProperty({ ...input, assignedUserId: ctx.user.id }); }),
  }),
  obligations: router({
    list: protectedProcedure.query(async ({ ctx }) => { const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user)); return listObligations(ctx.user.id, scope.isManager, scope.permittedUserIds); }),
    create: protectedProcedure.input(z.object({ title: z.string().min(2), obligationType: z.enum(["rent", "tax", "insurance", "other"]), dueDate: z.coerce.date(), periodStart: z.coerce.date(), periodEnd: z.coerce.date(), amount: z.string().min(1) })).mutation(async ({ ctx, input }) => { const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user)); if (scope.officeRole === "office_assistant") throw new Error("Ofis asistanı vade kaydı oluşturamaz."); return createObligation({ ...input, assignedUserId: ctx.user.id }); }),
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
    list: protectedProcedure.query(async ({ ctx }) => { const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user)); return listLedger(ctx.user.id, scope.isManager, scope.permittedUserIds); }),
    create: protectedProcedure.input(z.object({ description: z.string().min(2), amount: z.string().min(1), entryType: z.enum(["income", "expense", "receivable", "payable"]) })).mutation(async ({ ctx, input }) => { const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user)); if (scope.officeRole === "office_assistant") throw new Error("Ofis asistanı tahsilat veya gider kaydı oluşturamaz."); return createLedger({ ...input, assignedUserId: ctx.user.id }); }),
  }),
  treasury: router({
    summary: protectedProcedure.input(z.object({ date: z.coerce.date().optional() }).optional()).query(async ({ ctx, input }) => {
      const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user));
      if (!scope.isManager && scope.officeRole !== "office_assistant") throw new Error("Kasa balansı yalnız broker manager ve ofis asistanı için görünür.");
      return getTreasuryCashBalance(input?.date ?? new Date());
    }),
    declareMovement: protectedProcedure.input(z.object({ movementType: z.enum(["bankToCash", "cashExpense", "cashReceipt", "cashDeposit", "other"]), direction: z.enum(["in", "out"]), amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Tutar sayı olmalıdır"), occurredOn: z.coerce.date(), counterparty: z.string().min(2).max(180), evidenceReference: z.string().min(2).max(180), note: z.string().max(1000).optional() })).mutation(async ({ ctx, input }) => {
      const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user));
      if (!scope.isManager && scope.officeRole !== "office_assistant") throw new Error("Kasa hareketi yalnız broker manager veya ofis asistanı tarafından beyan edilebilir.");
      return createTreasuryCashMovement({ ...input, enteredByUserId: ctx.user.id });
    }),
    verifyMovement: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ ctx, input }) => verifyTreasuryCashMovement(input.id, ctx.user.id)),
    closeDay: adminProcedure.input(z.object({ date: z.coerce.date(), openingCash: z.string().regex(/^\d+(\.\d{1,2})?$/), countedCash: z.string().regex(/^\d+(\.\d{1,2})?$/), note: z.string().max(1000).optional() })).mutation(({ ctx, input }) => closeTreasuryCashDay({ ...input, managerUserId: ctx.user.id })),
  }),
  team: router({
    list: adminProcedure.query(() => listTeamMembers()),
    setOfficeAssistantScope: adminProcedure.input(z.object({ assistantUserId: z.number().int().positive(), consultantUserIds: z.array(z.number().int().positive()).max(50) })).mutation(({ ctx, input }) => setOfficeAssistantAssignments({ ...input, managerUserId: ctx.user.id })),
  }),
  audit: router({
    list: adminProcedure.query(() => listAudit(true)),
  }),
});

export type AppRouter = typeof appRouter;
