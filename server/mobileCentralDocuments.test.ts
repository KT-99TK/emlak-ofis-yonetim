import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("central mobile contract documents", () => {
  it("stores only metadata centrally and protects attachment/opening through ownership checks", () => {
    const root = process.cwd();
    const schema = fs.readFileSync(path.join(root, "drizzle", "schema.ts"), "utf8");
    const db = fs.readFileSync(path.join(root, "server", "db.ts"), "utf8");
    const router = fs.readFileSync(path.join(root, "server", "routers.ts"), "utf8");
    expect(schema).toContain('export const contractDocuments');
    expect(schema).toContain('storageKey: varchar("storageKey"');
    expect(schema).not.toContain('blob("content")');
    expect(db).toContain("getContractForAssignedUser");
    expect(db).toContain("listContractDocuments");
    expect(router).toContain("attachActiveSigned");
    expect(router).toContain("getContractForAssignedUser(input.contractId, ctx.user.id)");
    expect(router).toContain("['signed', 'active']");
    expect(router).toContain("createHash(\"sha256\")");
    expect(router).toContain("storagePut(");
    expect(router).not.toContain("documents: router({\n    delete");
  });
});
