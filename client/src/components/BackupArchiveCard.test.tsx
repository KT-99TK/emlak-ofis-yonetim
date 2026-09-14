import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const componentSource = fs.readFileSync(
  path.resolve(process.cwd(), "client/src/components/BackupArchiveCard.tsx"),
  "utf8"
);
const homeSource = fs.readFileSync(
  path.resolve(process.cwd(), "client/src/pages/Home.tsx"),
  "utf8"
);

describe("BackupArchiveCard", () => {
  it("shows the latest checkpoint and official backup destinations", () => {
    expect(componentSource).toContain("Son kayıtlı sürüm");
    expect(componentSource).toContain("Hesap panelinden ayrıca alınmalı ve doğrulanmalıdır.");
    expect(componentSource).toContain("https://manus.im/backup");
    expect(componentSource).toContain("https://help.manus.im");
  });

  it("does not claim the card is a complete conversation export", () => {
    expect(componentSource).toContain("tam metin dışa aktarımının yerine geçmez");
  });

  it("is rendered on the dashboard", () => {
    expect(homeSource).toContain("<BackupArchiveCard />");
  });
});
