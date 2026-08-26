import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("mobile online companion", () => {
  it("uses authenticated central data queries and is exposed as the installable mobile route", () => {
    const root = process.cwd();
    const screen = fs.readFileSync(path.join(root, "client", "src", "pages", "MobileCompanion.tsx"), "utf8");
    const app = fs.readFileSync(path.join(root, "client", "src", "App.tsx"), "utf8");
    const entry = fs.readFileSync(path.join(root, "client", "src", "main.tsx"), "utf8");
    const manifest = fs.readFileSync(path.join(root, "client", "public", "manifest.webmanifest"), "utf8");
    const worker = fs.readFileSync(path.join(root, "client", "public", "mobile-sw.js"), "utf8");
    expect(screen).toContain("trpc.dashboard.summary.useQuery");
    expect(screen).toContain("trpc.clients.list.useQuery");
    expect(screen).toContain("trpc.properties.list.useQuery");
    expect(screen).toContain("trpc.contracts.list.useQuery");
    expect(screen).toContain("trpc.obligations.list.useQuery");
    expect(screen).toContain("trpc.onlineStart.status.useQuery");
    expect(screen).toContain("Merkezi online başlangıç bekliyor.");
    expect(screen).toContain("Eski offline sözleşme, arşiv ve finans kayıtları taşınmaz.");
    expect(screen).toContain("Geçmiş Offline Arşiv");
    expect(screen).toContain("legacyArchiveImportEnabled = false");
    expect(screen).toContain("const centralOperationsLocked = !onlineStart.isLoading && onlineStartPending");
    expect(screen).toContain("Merkezi online başlangıç tarihi gelmeden kasa hareketi beyan edilemez.");
    expect(app).toContain('window.location.pathname === "/mobile"');
    expect(manifest).toContain('"start_url": "/mobile"');
    expect(manifest).toContain('"display": "standalone"');
    expect(manifest).toContain('"purpose": "any maskable"');
    expect(entry).toContain('navigator.serviceWorker.register("/mobile-sw.js")');
    expect(worker).toContain("event.respondWith(fetch(event.request))");
  });
});
