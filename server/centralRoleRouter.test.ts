import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const getCentralAccessScope = vi.fn();
const getActiveRentalAccess = vi.fn();
const listAudit = vi.fn();
const revealClientSensitive = vi.fn();
const revealContractSensitive = vi.fn();
const revealActiveRentalSensitive = vi.fn();

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getCentralAccessScope,
    getActiveRentalAccess,
    listAudit,
    revealClientSensitive,
    revealContractSensitive,
    revealActiveRentalSensitive,
  };
});

const { appRouter } = await import("./routers");

type User = NonNullable<TrpcContext["user"]>;

function context(user: User): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function user(id: number, role: "user" | "admin"): User {
  return {
    id,
    openId: `role-${id}`,
    email: `role-${id}@example.com`,
    name: `Role ${id}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
}

describe("central role router access", () => {
  it("passes consultant, assistant and manager scopes through the real access procedure", async () => {
    getActiveRentalAccess.mockImplementation(async (userId, isManager, permittedUserIds) => ({
      userId,
      isManager,
      permittedUserIds,
      canImport: isManager,
      canManageNotices: isManager || permittedUserIds.includes(userId),
    }));

    const cases = [
      { actor: user(21, "user"), scope: { isManager: false, permittedUserIds: [21], officeRole: "consultant" as const } },
      { actor: user(7, "user"), scope: { isManager: false, permittedUserIds: [21, 22], officeRole: "office_assistant" as const } },
      { actor: user(1, "admin"), scope: { isManager: true, permittedUserIds: [], officeRole: "broker_manager" as const } },
    ];

    for (const testCase of cases) {
      getCentralAccessScope.mockResolvedValueOnce(testCase.scope);
      const result = await appRouter
        .createCaller(context(testCase.actor))
        .activeRentals.access();
      expect(result).toMatchObject({
        isManager: testCase.scope.isManager,
        permittedUserIds: testCase.scope.permittedUserIds,
        canImport: testCase.scope.isManager,
      });
      expect(getCentralAccessScope).toHaveBeenLastCalledWith(
        testCase.actor.id,
        testCase.actor.role === "admin"
      );
    }
  });

  it("allows only the manager to list retained central audit records", async () => {
    const retainedAudit = [{
      id: 44,
      actorUserId: 1,
      action: "broker_guidance_note_resolved",
      entityType: "brokerGuidanceNote",
      entityId: 9,
      summary: "Merkezi yönlendirme notu çözüldü",
    }];
    listAudit.mockResolvedValueOnce(retainedAudit);

    const managerResult = await appRouter
      .createCaller(context(user(1, "admin")))
      .audit.list();
    expect(managerResult).toEqual(retainedAudit);
    expect(listAudit).toHaveBeenCalledWith(true);

    await expect(
      appRouter.createCaller(context(user(21, "user"))).audit.list()
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("broker manager ve atanmış danışmanın gerekçeli hassas müşteri görüntüleme rotasına erişim kapsamını iletir", async () => {
    revealClientSensitive.mockResolvedValueOnce({ phone: "05321234567", identityOrTaxNo: "12345678901" });
    getCentralAccessScope.mockResolvedValueOnce({ isManager: true, permittedUserIds: [], officeRole: "broker_manager" });
    const result = await appRouter.createCaller(context(user(1, "admin"))).clients.revealSensitive({ clientId: 44, reason: "Fizikî dosya ile kimlik eşleştirmesi" });
    expect(result.phone).toBe("05321234567");
    expect(revealClientSensitive).toHaveBeenCalledWith(44, "Fizikî dosya ile kimlik eşleştirmesi", 1, true, "broker_manager");
    revealClientSensitive.mockResolvedValueOnce({ phone: "05321234567", identityOrTaxNo: "12345678901" });
    getCentralAccessScope.mockResolvedValueOnce({ isManager: false, permittedUserIds: [21], officeRole: "consultant" });
    await expect(appRouter.createCaller(context(user(21, "user"))).clients.revealSensitive({ clientId: 44, reason: "Fizikî dosya ile kimlik eşleştirmesi" })).resolves.toMatchObject({ phone: "05321234567" });
    expect(revealClientSensitive).toHaveBeenLastCalledWith(44, "Fizikî dosya ile kimlik eşleştirmesi", 21, false, "consultant");
  });

  it("sözleşme ve aktif kira erişiminde danışman kapsamını veri katmanına iletir", async () => {
    revealContractSensitive.mockResolvedValueOnce({ fields: { ownerIdentity: "12345678901" } });
    revealActiveRentalSensitive.mockResolvedValueOnce({ tenantPhone: "05321234567" });
    getCentralAccessScope.mockResolvedValueOnce({ isManager: false, permittedUserIds: [21], officeRole: "consultant" });
    await expect(appRouter.createCaller(context(user(21, "user"))).contracts.revealSensitive({ contractId: 9, reason: "Fizikî sözleşme kontrolü" })).resolves.toMatchObject({ fields: { ownerIdentity: "12345678901" } });
    getCentralAccessScope.mockResolvedValueOnce({ isManager: false, permittedUserIds: [21], officeRole: "consultant" });
    await expect(appRouter.createCaller(context(user(21, "user"))).activeRentals.revealSensitive({ summaryId: 9, reason: "Fizikî sözleşme kontrolü" })).resolves.toMatchObject({ tenantPhone: "05321234567" });
  });
});
