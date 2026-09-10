import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { parse as parseCookieHeader } from "cookie";
import { createHeartbeatJob } from "./_core/heartbeat";
import { systemRouter } from "./_core/systemRouter";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "./_core/trpc";
import {
  assertCentralOnlineStartAllowsRecord,
  closeTreasuryCashDay,
  configureFreshOnlineStart,
  createBrokerGuidanceNote,
  createClient,
  createContract,
  revealContractSensitive,
  createContractDocument,
  createTreasuryCashMovement,
  decideOwnerApproval,
  getCentralAccessScope,
  getContractDocumentForUser,
  getContractForAssignedUser,
  getOnlineStartSetting,
  getTreasuryCashBalance,
  invalidateContractDocument,
  recordContractDocumentShareIntent,
  requestOwnerApproval,
  createLedger,
  resolveBrokerGuidanceNote,
  createObligation,
  createProperty,
  getDashboardSummary,
  getReminderPreferenceByUserId,
  listAudit,
  listBrokerGuidanceNotes,
  listCentralArchiveDocuments,
  listClients,
  listContractDocuments,
  listContracts,
  getNextContractNumber,
  listLedger,
  listObligations,
  listProperties,
  listTeamMembers,
  saveReminderSchedule,
  setOfficeAssistantAssignments,
  transitionContract,
  verifyTreasuryCashMovement,
  setConsultantCode,
  getActiveRentalAccess,
  listActiveRentalSummaries,
  revealActiveRentalSensitive,
  listRentalIncomeTaxProfiles,
  importActiveRentalSummaries,
  saveActiveRentalIncreaseReference,
  reviewActiveRentalNotice,
  markActiveRentalNoticeShared,
  refreshRentalServiceTasks,
  listRentalServiceTasks,
  prepareRentalServiceTask,
  reviewRentalServiceTask,
  markRentalServiceTaskShared,
  startRelettingPreparation,
  saveRentalIncomeTaxProfile,
  revealClientSensitive,
  createCentralCommissionTransaction,
  listCentralCommissionTransactions,
  verifyCentralCommissionTransaction,
  recordCentralCommissionCollection,
  cancelCentralCommissionTransaction,
  listConsultantAgreementProfiles,
  createConsultantAgreementProfile,
  createPortfolioRightsTransfer,
  listPortfolioRightsTransfers,
  approvePortfolioRightsTransfer,
  listContractFormTemplates,
  getContractFormBundle,
  createContractFormTemplate,
  addContractFormSection,
  addContractFormField,
  addContractFormClause,
  setContractFormClauseStatus,
  createContractFormInstance,
  renderActiveContractFormClauses,
} from "./db";
import { storagePut } from "./storage";
import { createHash } from "node:crypto";
import { z } from "zod";
import { changeLocalPassword, createLocalConsultantAccount, loginLocalUser, logoutLocalUser, resetLocalConsultantPassword } from "./localAuth";

export const isManager = (user: { role: string }) => user.role === "admin";
const MAX_MOBILE_PDF_BYTES = 12 * 1024 * 1024;
const safeFileName = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^_+/, "")
    .slice(0, 120) || "imzali-sozlesme.pdf";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return logoutLocalUser(ctx.req, ctx.res);
    }),
    localLogin: publicProcedure
      .input(z.object({ loginName: z.string().min(3).max(120), password: z.string().min(1).max(200) }))
      .mutation(({ ctx, input }) => loginLocalUser({ ...input, res: ctx.res })),
    changeLocalPassword: protectedProcedure
      .input(z.object({ newPassword: z.string().min(12).max(200) }))
      .mutation(({ ctx, input }) => changeLocalPassword({ userId: ctx.user.id, newPassword: input.newPassword, res: ctx.res })),
  }),
  dashboard: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      const scope = await getCentralAccessScope(
        ctx.user.id,
        isManager(ctx.user)
      );
      return getDashboardSummary(
        ctx.user.id,
        scope.isManager,
        scope.permittedUserIds
      );
    }),
  }),
  onlineStart: router({
    status: protectedProcedure.query(() => getOnlineStartSetting()),
    configure: adminProcedure
      .input(
        z.object({
          effectiveAt: z.coerce.date(),
          note: z.string().max(1000).optional(),
          confirmationText: z.string().min(1).max(120),
        })
      )
      .mutation(({ ctx, input }) =>
        configureFreshOnlineStart({ ...input, managerUserId: ctx.user.id })
      ),
  }),
  activeRentals: router({
    access: protectedProcedure.query(async ({ ctx }) => {
      const scope = await getCentralAccessScope(
        ctx.user.id,
        isManager(ctx.user)
      );
      return getActiveRentalAccess(
        ctx.user.id,
        scope.isManager,
        scope.permittedUserIds
      );
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const scope = await getCentralAccessScope(
        ctx.user.id,
        isManager(ctx.user)
      );
      return listActiveRentalSummaries(
        ctx.user.id,
        scope.isManager,
        scope.permittedUserIds,
        scope.officeRole
      );
    }),
    revealSensitive: protectedProcedure
      .input(
        z.object({
          summaryId: z.number().int().positive(),
          reason: z.string().min(8).max(280),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        return revealActiveRentalSensitive(
          input.summaryId,
          input.reason,
          ctx.user.id,
          scope.isManager,
          scope.officeRole
        );
      }),
    importSummaries: adminProcedure
      .input(
        z.object({
          rows: z
            .array(
              z.object({
                clientName: z.string().min(2).max(180),
                clientPhone: z.string().min(5).max(40),
                tenantName: z.string().min(2).max(180),
                tenantPhone: z.string().min(5).max(40),
                contractDate: z.coerce.date(),
                rentIncreaseDate: z.coerce.date().optional(),
                evictionDate: z.coerce.date().optional(),
                monthlyRent: z.string().regex(/^\d+(\.\d{1,2})?$/),
                neighborhood: z.string().min(2).max(120),
                propertyLocation: z.string().min(1).max(180),
                unitInfo: z.string().min(1).max(100),
                assignedUserId: z.number().int().positive(),
                consultantCode: z.string().min(2).max(40),
              })
            )
            .max(500),
        })
      )
      .mutation(({ ctx, input }) =>
        importActiveRentalSummaries(input.rows, ctx.user.id)
      ),
    saveIncreaseReference: protectedProcedure
      .input(
        z.object({
          summaryId: z.number().int().positive(),
          increaseRate: z.string().regex(/^\d+(\.\d{1,4})?$/),
          source: z.string().min(2).max(180),
          period: z.string().min(2).max(20),
          entryMethod: z.enum(["official_reference", "manual"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        return saveActiveRentalIncreaseReference({
          ...input,
          actorUserId: ctx.user.id,
          isManager: scope.isManager,
          permittedUserIds: scope.permittedUserIds,
        });
      }),
    reviewNotice: adminProcedure
      .input(z.object({ summaryId: z.number().int().positive() }))
      .mutation(({ ctx, input }) =>
        reviewActiveRentalNotice(input.summaryId, ctx.user.id)
      ),
    markNoticeShared: protectedProcedure
      .input(z.object({ summaryId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        return markActiveRentalNoticeShared({
          summaryId: input.summaryId,
          actorUserId: ctx.user.id,
          isManager: scope.isManager,
          permittedUserIds: scope.permittedUserIds,
        });
      }),
    rentalIncomeTaxProfiles: router({
      list: protectedProcedure
        .input(z.object({ taxYear: z.number().int().min(2026).max(2100) }))
        .query(async ({ ctx, input }) => {
          const scope = await getCentralAccessScope(
            ctx.user.id,
            isManager(ctx.user)
          );
          return listRentalIncomeTaxProfiles(
            ctx.user.id,
            scope.isManager,
            scope.permittedUserIds,
            input.taxYear
          );
        }),
      save: protectedProcedure
        .input(
          z.object({
            clientId: z.number().int().positive(),
            taxYear: z.number().int().min(2026).max(2100),
            ownershipSharePercent: z
              .string()
              .regex(/^\d+(\.\d{1,2})?$/)
              .refine(value => Number(value) > 0 && Number(value) <= 100),
            residentialExemptionEligible: z.boolean(),
            expenseMethod: z.enum(["lump_sum", "actual"]),
            actualExpenseTotal: z
              .string()
              .regex(/^\d+(\.\d{1,2})?$/)
              .refine(value => Number(value) >= 0 && Number(value) <= 99_999_999),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const scope = await getCentralAccessScope(
            ctx.user.id,
            isManager(ctx.user)
          );
          return saveRentalIncomeTaxProfile({
            ...input,
            actorUserId: ctx.user.id,
            isManager: scope.isManager,
            permittedUserIds: scope.permittedUserIds,
          });
        }),
    }),
    serviceTasks: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        return listRentalServiceTasks(
          ctx.user.id,
          scope.isManager,
          scope.permittedUserIds
        );
      }),
      refresh: adminProcedure.mutation(({ ctx }) =>
        refreshRentalServiceTasks(ctx.user.id)
      ),
      prepare: protectedProcedure
        .input(z.object({ taskId: z.number().int().positive() }))
        .mutation(async ({ ctx, input }) => {
          const scope = await getCentralAccessScope(
            ctx.user.id,
            isManager(ctx.user)
          );
          return prepareRentalServiceTask(
            input.taskId,
            ctx.user.id,
            scope.isManager,
            scope.permittedUserIds
          );
        }),
      review: adminProcedure
        .input(z.object({ taskId: z.number().int().positive() }))
        .mutation(({ ctx, input }) =>
          reviewRentalServiceTask(input.taskId, ctx.user.id)
        ),
      markShared: protectedProcedure
        .input(
          z.object({
            taskId: z.number().int().positive(),
            responseNote: z.string().max(1000).optional(),
            ownerConfirmedTenantExit: z.boolean().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          const scope = await getCentralAccessScope(
            ctx.user.id,
            isManager(ctx.user)
          );
          return markRentalServiceTaskShared({
            taskId: input.taskId,
            actorUserId: ctx.user.id,
            isManager: scope.isManager,
            permittedUserIds: scope.permittedUserIds,
            responseNote: input.responseNote,
            ownerConfirmedTenantExit: input.ownerConfirmedTenantExit,
          });
        }),
      startReletting: protectedProcedure
        .input(z.object({ sourceTaskId: z.number().int().positive() }))
        .mutation(async ({ ctx, input }) => {
          const scope = await getCentralAccessScope(
            ctx.user.id,
            isManager(ctx.user)
          );
          return startRelettingPreparation({
            sourceTaskId: input.sourceTaskId,
            actorUserId: ctx.user.id,
            isManager: scope.isManager,
            permittedUserIds: scope.permittedUserIds,
          });
        }),
    }),
  }),
  contracts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const scope = await getCentralAccessScope(
        ctx.user.id,
        isManager(ctx.user)
      );
      return listContracts(
        ctx.user.id,
        scope.isManager,
        scope.permittedUserIds,
        scope.officeRole
      );
    }),
    nextNumber: protectedProcedure.query(({ ctx }) =>
      getNextContractNumber(ctx.user.id)
    ),
    revealSensitive: protectedProcedure
      .input(
        z.object({
          contractId: z.number().int().positive(),
          reason: z.string().min(8).max(280),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        return revealContractSensitive(
          input.contractId,
          input.reason,
          ctx.user.id,
          scope.isManager,
          scope.officeRole
        );
      }),
    create: protectedProcedure
      .input(
        z.object({
          contractNo: z.string().min(3),
          type: z.enum(["rental", "sale", "authority"]),
          subtype: z.string().optional(),
          title: z.string().min(3),
          amount: z.string().optional(),
          clientId: z.number().optional(),
          propertyId: z.number().optional(),
          evictionNoticeDays: z.number().int().positive().optional(),
          evictionNoticeDate: z.date().optional(),
          ownerApprovalStatus: z
            .enum(["notRequired", "pending", "approved", "rejected"])
            .optional(),
          ownerApprovalDate: z.date().optional(),
          ownerApprovalNote: z.string().optional(),
          details: z.string().max(20000).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        if (scope.officeRole === "office_assistant")
          throw new Error("Ofis asistanı yeni sözleşme oluşturamaz.");
        return createContract({
          ...input,
          assignedUserId: ctx.user.id,
          actorUserId: ctx.user.id,
        });
      }),
    requestOwnerApproval: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) =>
        requestOwnerApproval(input.id, ctx.user.id)
      ),
    decideOwnerApproval: adminProcedure
      .input(
        z.object({
          id: z.number(),
          decision: z.enum(["approved", "rejected"]),
          note: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        decideOwnerApproval(input.id, input.decision, input.note, ctx.user.id)
      ),
    transition: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum([
            "draft",
            "review",
            "approved",
            "signed",
            "active",
            "completed",
            "cancelled",
          ]),
        })
      )
      .mutation(({ ctx, input }) =>
        transitionContract(input.id, input.status, ctx.user.id)
      ),
    formTemplates: router({
      list: protectedProcedure
        .input(z.object({ formType: z.enum(["sale_closing", "land_share"]).optional() }).optional())
        .query(({ input }) => listContractFormTemplates(input?.formType)),
      get: protectedProcedure
        .input(z.object({ templateId: z.number().int().positive() }))
        .query(({ input }) => getContractFormBundle(input.templateId)),
      create: adminProcedure
        .input(z.object({ formType: z.enum(["sale_closing", "land_share"]), title: z.string().min(3).max(200), legalReviewNote: z.string().max(2000).optional() }))
        .mutation(({ ctx, input }) => createContractFormTemplate({ ...input, createdByUserId: ctx.user.id })),
      addSection: adminProcedure
        .input(z.object({ templateId: z.number().int().positive(), sectionKey: z.string().min(2).max(80), sectionType: z.enum(["general", "technical", "optional_clauses"]), title: z.string().min(2).max(200), contentTemplate: z.string().max(20000).optional(), sortOrder: z.number().int().min(0).optional() }))
        .mutation(({ input }) => addContractFormSection(input)),
      addField: adminProcedure
        .input(z.object({ templateId: z.number().int().positive(), sectionId: z.number().int().positive().optional(), fieldKey: z.string().min(2).max(100), label: z.string().min(2).max(200), fieldType: z.enum(["text", "multiline", "date", "currency", "number", "checkbox", "select"]), partyScope: z.enum(["shared", "seller", "buyer", "landowner", "contractor"]), optionsJson: z.string().max(10000).optional(), required: z.boolean().optional(), sortOrder: z.number().int().min(0).optional() }))
        .mutation(({ input }) => addContractFormField(input)),
      addClause: adminProcedure
        .input(z.object({ templateId: z.number().int().positive(), partyScope: z.enum(["shared", "seller", "buyer", "landowner", "contractor"]), title: z.string().min(1).max(200), bodyTemplate: z.string().min(1).max(20000), sortOrder: z.number().int().min(0).optional(), status: z.enum(["draft", "active", "archived"]).optional(), sourceNote: z.string().max(500).optional() }))
        .mutation(({ ctx, input }) => addContractFormClause({ ...input, createdByUserId: ctx.user.id })),
      setClauseStatus: adminProcedure
        .input(z.object({ clauseId: z.number().int().positive(), status: z.enum(["draft", "active", "archived"]) }))
        .mutation(({ ctx, input }) => setContractFormClauseStatus({ ...input, actorUserId: ctx.user.id })),
      activeClauses: protectedProcedure
        .input(z.object({ templateId: z.number().int().positive() }))
        .query(({ input }) => renderActiveContractFormClauses(input.templateId)),
      createInstance: protectedProcedure
        .input(z.object({ contractId: z.number().int().positive(), templateId: z.number().int().positive(), fieldValues: z.record(z.string(), z.unknown()), selectedClauseIds: z.array(z.number().int().positive()).max(100), status: z.enum(["draft", "review", "approved", "signed", "archived"]).optional() }))
        .mutation(({ ctx, input }) => createContractFormInstance({ ...input, createdByUserId: ctx.user.id })),
    }),
  }),
  documents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const scope = await getCentralAccessScope(
        ctx.user.id,
        isManager(ctx.user)
      );
      return listContractDocuments(
        ctx.user.id,
        scope.isManager,
        scope.permittedUserIds
      );
    }),
    archiveList: protectedProcedure.query(async ({ ctx }) => {
      const scope = await getCentralAccessScope(
        ctx.user.id,
        isManager(ctx.user)
      );
      return listCentralArchiveDocuments(
        ctx.user.id,
        scope.isManager,
        scope.permittedUserIds
      );
    }),
    attachArchive: adminProcedure
      .input(
        z.object({
          assignedUserId: z.number().int().positive(),
          primaryClientId: z.number().int().positive(),
          relatedClients: z
            .array(
              z.object({
                clientId: z.number().int().positive(),
                partyRole: z.enum(["propertyOwner", "tenant", "other"]),
              })
            )
            .max(8)
            .default([]),
          documentType: z.enum([
            "authority",
            "rental",
            "sales",
            "appendix",
            "other",
          ]),
          documentDate: z.coerce.date().optional(),
          historicalActivity: z.string().min(3).max(3000),
          archiveNote: z.string().max(3000).optional(),
          originalFileName: z.string().min(5).max(255),
          pdfBase64: z.string().min(100).max(18_000_000),
        })
      )
      .mutation(() => {
        throw new Error(
          "Temiz online başlangıçta eski offline PDF arşivi merkezi sisteme aktarılmaz. Eski dosyalar yerel geçmiş arşivinde korunur."
        );
      }),
    attachActiveSigned: protectedProcedure
      .input(
        z.object({
          contractId: z.number().int().positive(),
          originalFileName: z.string().min(5).max(255),
          pdfBase64: z.string().min(100).max(18_000_000),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const contract = await getContractForAssignedUser(
          input.contractId,
          ctx.user.id
        );
        if (!contract)
          throw new Error("Yalnız kendi sözleşmenize belge ekleyebilirsiniz.");
        await assertCentralOnlineStartAllowsRecord(contract.createdAt);
        if (!["signed", "active"].includes(contract.status))
          throw new Error(
            "PDF yalnız imza teyitli veya aktif sözleşmeye eklenebilir."
          );
        const base64 = input.pdfBase64.replace(
          /^data:application\/pdf;base64,/i,
          ""
        );
        const bytes = Buffer.from(base64, "base64");
        if (
          !bytes.length ||
          bytes.length > MAX_MOBILE_PDF_BYTES ||
          bytes.subarray(0, 4).toString() !== "%PDF"
        )
          throw new Error(
            "Yalnız 12 MB altındaki geçerli PDF belgeleri eklenebilir."
          );
        const sha256 = createHash("sha256").update(bytes).digest("hex");
        const stored = await storagePut(
          `office-documents/active-signed/${ctx.user.id}/${contract.id}/${safeFileName(input.originalFileName)}`,
          bytes,
          "application/pdf"
        );
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
    open: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        const document = await getContractDocumentForUser(
          input.id,
          ctx.user.id,
          scope.isManager,
          scope.permittedUserIds
        );
        if (!document)
          throw new Error("Bu belge için görüntüleme yetkiniz bulunmuyor.");
        if (document.invalidatedAt && !scope.isManager)
          throw new Error("Bu belge manager tarafından geçersiz kılındı.");
        return {
          id: document.id,
          originalFileName: document.originalFileName,
          // Bu rota her çağrıda session + rol + sahiplik denetimi yapar.
          url: `/api/contract-documents/${document.id}/download`,
          immutable: Boolean(document.immutable),
          sha256: document.sha256,
        };
      }),
    shareIntent: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        await recordContractDocumentShareIntent({
          documentId: input.id,
          actorUserId: ctx.user.id,
          isManager: scope.isManager,
          permittedUserIds: scope.permittedUserIds,
        });
        return { ok: true };
      }),
    invalidate: protectedProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          reason: z.string().min(20).max(1000),
          confirmationText: z.literal("GEÇERSİZ KIL"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!isManager(ctx.user))
          throw new Error(
            "Belgeyi geçersiz kılma yetkisi yalnız broker manager hesabındadır."
          );
        await invalidateContractDocument(
          input.id,
          ctx.user.id,
          input.reason.trim()
        );
        return { ok: true };
      }),
  }),
  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const scope = await getCentralAccessScope(
        ctx.user.id,
        isManager(ctx.user)
      );
      return listClients(
        ctx.user.id,
        scope.isManager,
        scope.permittedUserIds,
        scope.officeRole
      );
    }),
    create: protectedProcedure
      .input(z.object({ name: z.string().min(2) }))
      .mutation(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        if (scope.officeRole === "office_assistant")
          throw new Error("Ofis asistanı yeni müşteri kaydı oluşturamaz.");
        return createClient({ ...input, assignedUserId: ctx.user.id });
      }),
    revealSensitive: protectedProcedure
      .input(
        z.object({
          clientId: z.number().int().positive(),
          reason: z.string().min(8).max(280),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        return revealClientSensitive(
          input.clientId,
          input.reason,
          ctx.user.id,
          scope.isManager,
          scope.officeRole
        );
      }),
  }),
  brokerGuidanceNotes: router({
    list: adminProcedure.query(() => listBrokerGuidanceNotes()),
    create: adminProcedure
      .input(
        z.object({
          subject: z.enum([
            "rental_service",
            "contract_review",
            "collection",
            "general",
          ]),
          summary: z.string().min(8).max(280),
        })
      )
      .mutation(({ ctx, input }) =>
        createBrokerGuidanceNote({ ...input, actorUserId: ctx.user.id })
      ),
    resolve: adminProcedure
      .input(z.object({ noteId: z.number().int().positive() }))
      .mutation(({ ctx, input }) =>
        resolveBrokerGuidanceNote(input.noteId, ctx.user.id)
      ),
  }),
  properties: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const scope = await getCentralAccessScope(
        ctx.user.id,
        isManager(ctx.user)
      );
      return listProperties(
        ctx.user.id,
        scope.isManager,
        scope.permittedUserIds
      );
    }),
    create: protectedProcedure
      .input(
        z.object({
          referenceNo: z.string().min(2),
          title: z.string().min(2),
          address: z.string().min(2),
          listingType: z.enum(["sale", "rent"]).optional(),
          ownerApprovalStatus: z
            .enum(["notRequired", "pending", "approved", "rejected"])
            .optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        if (scope.officeRole === "office_assistant")
          throw new Error("Ofis asistanı yeni portföy kaydı oluşturamaz.");
        return createProperty({ ...input, assignedUserId: ctx.user.id });
      }),
  }),
  obligations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const scope = await getCentralAccessScope(
        ctx.user.id,
        isManager(ctx.user)
      );
      return listObligations(
        ctx.user.id,
        scope.isManager,
        scope.permittedUserIds
      );
    }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(2),
          obligationType: z.enum(["rent", "tax", "insurance", "other"]),
          dueDate: z.coerce.date(),
          periodStart: z.coerce.date(),
          periodEnd: z.coerce.date(),
          amount: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        if (scope.officeRole === "office_assistant")
          throw new Error("Ofis asistanı vade kaydı oluşturamaz.");
        return createObligation({ ...input, assignedUserId: ctx.user.id });
      }),
  }),
  reminders: router({
    schedule: protectedProcedure.mutation(async () => {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Otomatik dış bildirimler kapalıdır. Vade ve hizmet takvimi yalnız kullanıcı tarafından manuel yenilenir.",
      });
    }),
  }),
  commissions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user));
      return listCentralCommissionTransactions(ctx.user.id, scope.isManager, scope.permittedUserIds);
    }),
    create: protectedProcedure.input(z.object({
      transactionNo: z.string().min(2).max(80),
      contractId: z.number().int().positive().optional(),
      buyerClientId: z.number().int().positive().optional(),
      sellerClientId: z.number().int().positive().optional(),
      collectionNote: z.string().max(1000).optional(),
      netServiceFee: z.string().regex(/^\d+(\.\d{1,2})?$/),
      discountAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
      vatAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
      portfolioOwnerType: z.enum(["consultant", "office"]).default("consultant"),
      portfolioRightsPolicy: z.enum(["individualConsultant", "corporateOffice"]).default("individualConsultant"),
      originatingConsultantUserId: z.number().int().positive().optional(),
      fulfillingConsultantUserId: z.number().int().positive().optional(),
      consultantRightsSplitPercent: z.number().min(0).max(100).default(50),
      corporateOfficePaysConsultant: z.boolean().default(true),
      externalOfficeRole: z.enum(["none", "counterpartyPortfolio", "global1881External"]).default("none"),
      agreementProfileId: z.number().int().positive().optional(),
      collectionReference: z.string().min(2).max(180),
      overrideReason: z.string().max(1000).optional(),
      externalOfficeAgreementReference: z.string().max(180).optional(),
      externalOfficeAgreementPartyName: z.string().max(180).optional(),
      externalOfficeAgreementScopeNote: z.string().max(1000).optional(),
      externalOfficeAgreementMinFee: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
      externalOfficeAgreementMaxFee: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
      externalOfficeAgreementSignedAt: z.coerce.date().optional(),
      externalOfficeAgreementValidFrom: z.coerce.date().optional(),
      externalOfficeAgreementValidTo: z.coerce.date().optional(),
      participants: z.array(z.object({
        participantType: z.enum(["consultant", "externalOffice"]),
        side: z.enum(["buyer", "seller", "shared"]),
        consultantUserId: z.number().int().positive().optional(),
        participantCode: z.string().min(2).max(60),
        participantName: z.string().min(2).max(180),
        externalOfficeName: z.string().max(180).optional(),
        rate: z.number().min(0).max(100),
      })).min(1).max(20),
    })).mutation(async ({ ctx, input }) => {
      const scope = await getCentralAccessScope(ctx.user.id, isManager(ctx.user));
      return createCentralCommissionTransaction(input, ctx.user.id, scope.isManager);
    }),
    verify: adminProcedure.input(z.object({ transactionId: z.number().int().positive(), note: z.string().max(1000).optional() })).mutation(({ ctx, input }) => verifyCentralCommissionTransaction(input.transactionId, ctx.user.id, input.note ?? "")),
    collect: protectedProcedure.input(z.object({ transactionId: z.number().int().positive(), amount: z.string().regex(/^\d+(\.\d{1,2})?$/), reference: z.string().min(2).max(180) })).mutation(({ ctx, input }) => recordCentralCommissionCollection(input.transactionId, input.amount, input.reference, ctx.user.id)),
    cancel: adminProcedure.input(z.object({ transactionId: z.number().int().positive(), reason: z.string().min(8).max(1000) })).mutation(({ ctx, input }) => cancelCentralCommissionTransaction(input.transactionId, input.reason, ctx.user.id)),
  }),
  ledger: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const scope = await getCentralAccessScope(
        ctx.user.id,
        isManager(ctx.user)
      );
      return listLedger(ctx.user.id, scope.isManager, scope.permittedUserIds);
    }),
    create: protectedProcedure
      .input(
        z.object({
          description: z.string().min(2),
          amount: z.string().min(1),
          entryType: z.enum(["income", "expense", "receivable", "payable"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        if (scope.officeRole === "office_assistant")
          throw new Error(
            "Ofis asistanı tahsilat veya gider kaydı oluşturamaz."
          );
        return createLedger({ ...input, assignedUserId: ctx.user.id });
      }),
  }),
  treasury: router({
    summary: protectedProcedure
      .input(z.object({ date: z.coerce.date().optional() }).optional())
      .query(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        if (!scope.isManager && scope.officeRole !== "office_assistant")
          throw new Error(
            "Kasa balansı yalnız broker manager ve ofis asistanı için görünür."
          );
        return getTreasuryCashBalance(input?.date ?? new Date());
      }),
    declareMovement: protectedProcedure
      .input(
        z.object({
          movementType: z.enum([
            "bankToCash",
            "cashExpense",
            "cashReceipt",
            "cashDeposit",
            "other",
          ]),
          direction: z.enum(["in", "out"]),
          amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Tutar sayı olmalıdır"),
          occurredOn: z.coerce.date(),
          counterparty: z.string().min(2).max(180),
          evidenceReference: z.string().min(2).max(180),
          note: z.string().max(1000).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const scope = await getCentralAccessScope(
          ctx.user.id,
          isManager(ctx.user)
        );
        if (!scope.isManager && scope.officeRole !== "office_assistant")
          throw new Error(
            "Kasa hareketi yalnız broker manager veya ofis asistanı tarafından beyan edilebilir."
          );
        return createTreasuryCashMovement({
          ...input,
          enteredByUserId: ctx.user.id,
        });
      }),
    verifyMovement: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ ctx, input }) =>
        verifyTreasuryCashMovement(input.id, ctx.user.id)
      ),
    closeDay: adminProcedure
      .input(
        z.object({
          date: z.coerce.date(),
          openingCash: z.string().regex(/^\d+(\.\d{1,2})?$/),
          countedCash: z.string().regex(/^\d+(\.\d{1,2})?$/),
          note: z.string().max(1000).optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        closeTreasuryCashDay({ ...input, managerUserId: ctx.user.id })
      ),
  }),
  team: router({
    list: adminProcedure.query(() => listTeamMembers()),
    createLocalConsultant: adminProcedure
      .input(z.object({ firstName: z.string().min(2).max(80), lastName: z.string().min(2).max(120), title: z.string().max(120).optional(), companyName: z.string().max(180).optional() }))
      .mutation(({ ctx, input }) => createLocalConsultantAccount({ ...input, managerUserId: ctx.user.id })),
    resetLocalPassword: adminProcedure
      .input(z.object({ userId: z.number().int().positive() }))
      .mutation(({ ctx, input }) => resetLocalConsultantPassword({ ...input, managerUserId: ctx.user.id })),
    setConsultantCode: adminProcedure
      .input(
        z.object({
          userId: z.number().int().positive(),
          consultantCode: z.string().min(2).max(40),
        })
      )
      .mutation(({ ctx, input }) =>
        setConsultantCode(input.userId, input.consultantCode, ctx.user.id)
      ),
    agreementProfiles: adminProcedure.query(({ ctx }) => listConsultantAgreementProfiles()),
    createAgreementProfile: adminProcedure
      .input(z.object({ userId: z.number().int().positive(), consultantSharePercent: z.number().min(0).max(100), officeSharePercent: z.number().min(0).max(100), monthlyDeskFee: z.string().regex(/^\d+(\.\d{1,2})?$/), validFrom: z.coerce.date(), validTo: z.coerce.date().optional(), note: z.string().max(1000).optional() }))
      .mutation(({ ctx, input }) => createConsultantAgreementProfile(input, ctx.user.id)),
    createPortfolioRightsTransfer: adminProcedure
      .input(z.object({ clientId: z.number().int().positive().optional(), propertyId: z.number().int().positive().optional(), originatingConsultantUserId: z.number().int().positive(), fulfillingConsultantUserId: z.number().int().positive().optional(), rightsOwnerType: z.enum(["consultant", "office"]).default("consultant"), effectiveFrom: z.coerce.date(), effectiveTo: z.coerce.date().optional(), reason: z.string().min(8).max(1000) }))
      .mutation(({ ctx, input }) => createPortfolioRightsTransfer(input, ctx.user.id, true)),
    portfolioRightsTransfers: adminProcedure.query(() => listPortfolioRightsTransfers(true)),
    approvePortfolioRightsTransfer: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(({ ctx, input }) => approvePortfolioRightsTransfer(input.id, ctx.user.id, true)),
    setOfficeAssistantScope: adminProcedure
      .input(
        z.object({
          assistantUserId: z.number().int().positive(),
          consultantUserIds: z.array(z.number().int().positive()).max(50),
        })
      )
      .mutation(({ ctx, input }) =>
        setOfficeAssistantAssignments({ ...input, managerUserId: ctx.user.id })
      ),
  }),
  audit: router({
    list: adminProcedure.query(() => listAudit(true)),
  }),
});

export type AppRouter = typeof appRouter;
