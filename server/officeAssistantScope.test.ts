import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("central office assistant scope", () => {
  it("uses explicit active assignments instead of granting office-wide access", () => {
    const dbSource = fs.readFileSync(path.join(process.cwd(), "server", "db.ts"), "utf8");
    expect(dbSource).toContain("getCentralAccessScope");
    expect(dbSource).toContain("officeAssistantAssignments.assistantUserId");
    expect(dbSource).toContain("officeAssistantAssignments.active, 1");
    expect(dbSource).toContain("inArray(contractDocuments.assignedUserId, scopedIds)");
    expect(dbSource).toContain("inArray(clients.assignedUserId, scopedIds)");
  });

  it("applies the same scope to mobile lists, document opening, and download links", () => {
    const routerSource = fs.readFileSync(path.join(process.cwd(), "server", "routers.ts"), "utf8");
    const downloadSource = fs.readFileSync(path.join(process.cwd(), "server", "contractDocumentDownload.ts"), "utf8");
    const schemaSource = fs.readFileSync(path.join(process.cwd(), "drizzle", "schema.ts"), "utf8");
    expect(routerSource).toContain("getCentralAccessScope(ctx.user.id, isManager(ctx.user))");
    expect(routerSource).toContain("setOfficeAssistantScope: adminProcedure");
    expect(routerSource).toContain("Ofis asistanı tahsilat veya gider kaydı oluşturamaz.");
    expect(routerSource).toContain("Ofis asistanı yeni sözleşme oluşturamaz.");
    expect(downloadSource).toContain("getCentralAccessScope(user.id, isManager(user))");
    expect(downloadSource).toContain("scope.permittedUserIds");
    expect(schemaSource).toContain('"office_assistant"');
    expect(schemaSource).toContain("officeAssistantAssignments");
    expect(routerSource).toContain("recordContractDocumentShareIntent");
  });
});
