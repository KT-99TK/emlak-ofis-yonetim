import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("contracts quick client creation", () => {
  it("offers a compact customer-registry shortcut and reconnects the new client", () => {
    const source = readFileSync(new URL("./Contracts.tsx", import.meta.url), "utf8");
    expect(source).toContain("createQuickClient = trpc.clients.create.useMutation");
    expect(source).toContain("setSelectedClientId(String(clientId))");
    expect(source).toContain("Yeni müşteri");
    expect(source).toContain("Kütüğe hızlı müşteri kaydı");
    expect(source).toContain("Yeni müşteri kaydı merkezi numara alır.");
    expect(source).toContain('aria-label="Yeni müşteri adı"');
    expect(source).toContain("matchingQuickClient");
    expect(source).toContain("Mevcut kaydı seç");
    expect(source).toContain("Yeni kayıt açmak yerine mevcut kaydı");
  });

  it("keeps the contract creation gate tied to a selected client", () => {
    const source = readFileSync(new URL("./Contracts.tsx", import.meta.url), "utf8");
    expect(source).toContain("selectedClientId");
    expect(source).toContain("selectedClientId ? Number(selectedClientId) : undefined");
    expect(source).toContain("&& selectedClientId");
  });
});

