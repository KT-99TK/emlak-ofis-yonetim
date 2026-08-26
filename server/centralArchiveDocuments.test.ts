import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("central customer digital archive", () => {
  it("mevcut arşiv metadata’sını korur ancak temiz başlangıçta eski offline PDF yüklemesini kapatır", () => {
    const root = process.cwd();
    const schema = fs.readFileSync(path.join(root, "drizzle", "schema.ts"), "utf8");
    const db = fs.readFileSync(path.join(root, "server", "db.ts"), "utf8");
    const router = fs.readFileSync(path.join(root, "server", "routers.ts"), "utf8");
    expect(schema).toContain("contractDocumentParticipants");
    expect(schema).toContain('documentType: varchar("documentType"');
    expect(schema).toContain('historicalActivity: text("historicalActivity")');
    expect(db).toContain("listCentralArchiveDocuments");
    expect(db).toContain("createCentralArchiveDocument");
    expect(db).toContain('category: "archive"');
    expect(router).toContain("archiveList:");
    expect(router).toContain("attachArchive:");
    expect(router).toContain("adminProcedure.input");
    expect(router).toContain("Temiz online başlangıçta eski offline PDF arşivi merkezi sisteme aktarılmaz.");
    expect(router).not.toContain("office-documents/archive/");
    expect(router).not.toContain("deleteArchive");
  });
});
