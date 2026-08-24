import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("contract document sharing audit", () => {
  it("requires the existing document access check before recording a recipient-free sharing intent", () => {
    const dbSource = fs.readFileSync(path.join(process.cwd(), "server", "db.ts"), "utf8");
    expect(dbSource).toContain("recordContractDocumentShareIntent");
    expect(dbSource).toContain("getContractDocumentForUser(input.documentId");
    expect(dbSource).toContain("Bu belge için paylaşım yetkiniz bulunmuyor.");
    expect(dbSource).toContain("document_share_intent");
    expect(dbSource).toContain("alıcı bilgisi saklanmadı");
  });
});
