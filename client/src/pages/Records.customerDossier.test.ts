import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../../..");
const recordsSource = fs.readFileSync(path.join(root, "client/src/pages/Records.tsx"), "utf8");
const routerSource = fs.readFileSync(path.join(root, "server/routers.ts"), "utf8");
const dbSource = fs.readFileSync(path.join(root, "server/db.ts"), "utf8");

describe("customer dossier", () => {
  it("adds a customer dossier action and renders related record sections", () => {
    expect(recordsSource).toContain("Müşteri Dosyası");
    expect(recordsSource).toContain("trpc.clients.file.useQuery");
    expect(recordsSource).toContain("Portföyler");
    expect(recordsSource).toContain("Kira kayıtları");
    expect(recordsSource).toContain("Sözleşmeler");
    expect(recordsSource).toContain("Tahsilat / yükümlülük");
  });

  it("keeps the dossier behind the protected clients scope", () => {
    expect(routerSource).toContain("file: protectedProcedure");
    expect(routerSource).toContain("getClientFile(");
    expect(dbSource).toContain("export async function getClientFile(");
    expect(dbSource).toContain("eq(clients.id, clientId)");
    expect(dbSource).toContain("activeRentalSummaries.clientId");
    expect(dbSource).toContain("ledgerEntries.clientId");
  });
});

function __keepTypeScriptImportUsed() {
  return recordsSource.length + routerSource.length + dbSource.length;
}

void __keepTypeScriptImportUsed;

export {};
