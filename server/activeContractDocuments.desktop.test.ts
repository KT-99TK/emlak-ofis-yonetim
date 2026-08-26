import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("active signed document Electron bridge", () => {
  it("exposes append/open IPC only and intentionally provides no delete or edit IPC", () => {
    const projectRoot = process.cwd();
    const main = fs.readFileSync(path.join(projectRoot, "desktop", "main.mjs"), "utf8");
    const preload = fs.readFileSync(path.join(projectRoot, "desktop", "preload.mjs"), "utf8");
    expect(main).toContain('ipcMain.handle("active-contract-document:select"');
    expect(main).toContain('ipcMain.handle("active-contract-document:register"');
    expect(main).toContain('ipcMain.handle("active-contract-document:open"');
    expect(main).toContain("assistantAssignedUserIds");
    expect(main).toContain("canOpenOfflineDocument(entry.ownerUserId, access)");
    expect(main).not.toContain("active-contract-document:delete");
    expect(main).not.toContain("active-contract-document:update");
    expect(preload).toContain("activeContractDocuments");
    expect(preload).not.toContain("deletePdf");
    expect(preload).not.toContain("updatePdf");
  });
});
