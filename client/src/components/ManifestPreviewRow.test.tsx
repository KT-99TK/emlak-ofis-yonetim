import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ManifestPreviewRow from "./ManifestPreviewRow";
import { formatTurkishDateTime } from "@/lib/turkishDate";

describe("ManifestPreviewRow", () => {
  it("renders identity, export date, checksum and ECDSA status for a single backup", () => {
    const html = renderToStaticMarkup(
      <ManifestPreviewRow
        testId="single-manifest-preview-row"
        manifest={{
          file: "global1881-ayse-device-a.json",
          userId: "danisman-ayse",
          deviceId: "device-a",
          recordCount: 7,
          exportedAt: "2026-08-22T10:00:00.000Z",
          maxRecordVersion: 4,
          checksumVerified: true,
          signatureVerified: true,
        }}
      />,
    );

    expect(html).toContain('data-testid="single-manifest-preview-row"');
    expect(html).toContain("danisman-ayse");
    expect(html).toContain("device-a");
    expect(html).toContain("7 kayıt");
    expect(html).toContain(formatTurkishDateTime("2026-08-22T10:00:00.000Z"));
    expect(html).toMatch(/22\.08\.2026/);
    expect(html).not.toContain("2026-08-22T10:00:00.000Z");
    expect(html).toContain("checksum: doğrulandı");
    expect(html).toContain("ECDSA: doğrulandı");
  });

  it("renders separate failed verification statuses for a multi-backup row", () => {
    const html = renderToStaticMarkup(
      <ManifestPreviewRow
        manifest={{
          file: "global1881-mehmet-device-b.json",
          userId: "danisman-mehmet",
          deviceId: "device-b",
          recordCount: 3,
          exportedAt: "2026-08-22T11:00:00.000Z",
          checksumVerified: false,
          signatureVerified: true,
        }}
      />,
    );

    expect(html).toContain("danisman-mehmet");
    expect(html).toContain("device-b");
    expect(html).toContain("checksum: başarısız");
    expect(html).toContain("ECDSA: doğrulandı");
  });
});
