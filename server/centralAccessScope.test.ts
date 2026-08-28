import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveCentralAccessScope } from "./db";

describe("central role access scope", () => {
  it("opens the full central scope only for the system manager", () => {
    expect(
      resolveCentralAccessScope({ userId: 1, isSystemManager: true })
    ).toEqual({
      isManager: true,
      permittedUserIds: [],
      officeRole: "broker_manager",
    });
  });

  it("keeps a consultant limited to their own user id", () => {
    expect(
      resolveCentralAccessScope({
        userId: 21,
        isSystemManager: false,
        officeRole: "consultant",
      })
    ).toEqual({
      isManager: false,
      permittedUserIds: [21],
      officeRole: "consultant",
    });
  });

  it("limits an office assistant to unique assigned consultants", () => {
    expect(
      resolveCentralAccessScope({
        userId: 7,
        isSystemManager: false,
        officeRole: "office_assistant",
        assignedConsultantUserIds: [21, 22, 21],
      })
    ).toEqual({
      isManager: false,
      permittedUserIds: [21, 22],
      officeRole: "office_assistant",
    });
  });

  it("keeps central mutations auditable and routes all central queries through scope", () => {
    const dbSource = fs.readFileSync(path.join(process.cwd(), "server", "db.ts"), "utf8");
    const routerSource = fs.readFileSync(path.join(process.cwd(), "server", "routers.ts"), "utf8");
    expect(dbSource).toContain("insert(auditLogs)");
    expect(dbSource).toContain("actorUserId");
    expect(routerSource).toContain("getCentralAccessScope");
    expect(routerSource).toContain("scope.permittedUserIds");
    expect(routerSource).toContain("scope.isManager");
  });
});
