import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("central mobile contract documents", () => {
  it("stores only metadata centrally and protects attachment/opening through ownership checks", () => {
    const root = process.cwd();
    const schema = fs.readFileSync(path.join(root, "drizzle", "schema.ts"), "utf8");
    const db = fs.readFileSync(path.join(root, "server", "db.ts"), "utf8");
    const router = fs.readFileSync(path.join(root, "server", "routers.ts"), "utf8");
    const download = fs.readFileSync(path.join(root, "server", "contractDocumentDownload.ts"), "utf8");
    expect(schema).toContain('export const contractDocuments');
    expect(schema).toContain('storageKey: varchar("storageKey"');
    expect(schema).not.toContain('blob("content")');
    expect(db).toContain("getContractForAssignedUser");
    expect(db).toContain("listContractDocuments");
    expect(router).toContain("attachActiveSigned");
    expect(router).toMatch(/getContractForAssignedUser\s*\(\s*input\.contractId\s*,\s*ctx\.user\.id/);
    expect(router).toMatch(/\[\s*["']signed["']\s*,\s*["']active["']\s*\]/);
    expect(router).toContain("createHash(\"sha256\")");
    expect(router).toContain("storagePut(");
    expect(router).not.toContain("storageGet(document.storageKey)");
    expect(router).toContain("/api/contract-documents/${document.id}/download");
    expect(download).toContain("sdk.authenticateRequest(req)");
    expect(download).toContain("getContractDocumentForUser(");
    expect(download).toContain("storageGetSignedUrl(document.storageKey)");
    expect(router).toContain("invalidate:");
    expect(router).toContain('confirmationText: z.literal("GEÇERSİZ KIL")');
    expect(db).toContain("invalidateContractDocument");
    expect(router).not.toContain("documents: router({\n    delete");
  });
});
