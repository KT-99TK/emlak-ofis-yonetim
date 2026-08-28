import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const getCentralAccessScope = vi.fn();
const getActiveRentalAccess = vi.fn();
const listAudit = vi.fn();

vi.mock("./db", async importOriginal => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getCentralAccessScope,
    getActiveRentalAccess,
    listAudit,
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
});
