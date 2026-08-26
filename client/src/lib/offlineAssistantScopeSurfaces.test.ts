import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("offline assistant scope access surfaces", () => {
  it("carries the assigned consultant scope through contracts, document views, workspace lists and the Electron PDF bridge", () => {
    const authority = source("client/src/pages/OfflineAuthorityContracts.tsx");
    const rental = source("client/src/pages/OfflineRentalContracts.tsx");
    const workspace = source("client/src/pages/OfflineWorkspace.tsx");
    const activeDocuments = source("client/src/pages/OfflineActiveContractDocuments.tsx");
    const archive = source("client/src/pages/OfflineContractArchive.tsx");
    const transactions = source("client/src/pages/OfflineTransactionClosings.tsx");
    const desktopMain = source("desktop/main.mjs");

    expect(authority).toContain("assistantAssignedUserIds: getOfflineAssistantAssignedUserIds()");
    expect(rental).toContain("assistantAssignedUserIds: getOfflineAssistantAssignedUserIds()");
    expect(transactions).toContain("assistantAssignedUserIds: getOfflineAssistantAssignedUserIds()");
    expect(workspace).toContain("assignOfflineAssistantScope");
    expect(workspace).toContain("const authorizedRecords = records.filter");
    expect(workspace).toContain("Ofis asistanı danışman kapsamı");
    expect(activeDocuments).toContain("isLocalManagerSessionActive()");
    expect(archive).toContain("assistantAssignedUserIds.includes(assignmentUserId.trim())");
    expect(desktopMain).toContain("function canOpenOfflineDocument");
    expect(desktopMain).toContain("access.assistantAssignedUserIds.includes(ownerUserId)");
  });
});
