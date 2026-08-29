import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.restoreAllMocks());
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("onlineStart.status router integration", () => {
  it("gerçek protected procedure çağrısında undefined döndürmez", async () => {
    const now = new Date();
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "online-start-test",
        email: "online-start-test@example.com",
        name: "Online Start Test",
        loginMethod: "test",
        role: "user",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await appRouter.createCaller(ctx).onlineStart.status();

    expect(result).not.toBeUndefined();
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain("data is undefined");
    expect(result === null || typeof result === "object").toBe(true);
  });
});
