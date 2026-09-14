import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../../..");

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("Project backups navigation", () => {
  it("exposes a visible sidebar route", () => {
    const layout = read("client/src/components/DashboardLayout.tsx");
    const app = read("client/src/App.tsx");

    expect(layout).toContain('label: "Proje Yedekleri"');
    expect(layout).toContain('path: "/backups"');
    expect(app).toContain('<Route path="/backups" component={ProjectBackups} />');
  });

  it("keeps backup scope and secret exclusions visible", () => {
    const page = read("client/src/pages/ProjectBackups.tsx");
    const card = read("client/src/components/BackupArchiveCard.tsx");

    expect(page).toContain("Yedek kapsamına dahil");
    expect(page).toContain("Yedek dışında bırakılanlar");
    expect(page).toContain("Parolalar, tokenlar, API anahtarları ve .env değerleri");
    expect(page).toContain("sözleşme/form tanımları");
    expect(card).toContain("Son kayıtlı sürüm");
    expect(card).toContain("Hesap panelinden ayrıca alınmalı ve doğrulanmalıdır.");
  });
});
