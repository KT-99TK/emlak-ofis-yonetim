import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import OfflineOfficeFlowPanel from "./OfflineOfficeFlowPanel";
import type { OfflineRecord } from "@/lib/offlineStore";

const record = (overrides: Partial<OfflineRecord>): OfflineRecord => ({
  id: "r-1", entity: "obligation", title: "Kira vadesi", details: "", dueDate: "2026-08-25", status: "draft", deviceId: "device", updatedAt: "2026-08-20T10:00:00.000Z", userId: "danisman-a", recordVersion: 1, ...overrides,
});

describe("OfflineOfficeFlowPanel", () => {
  it("renders the personal green workflow sidebar with only the current user's due items", () => {
    const html = renderToStaticMarkup(<OfflineOfficeFlowPanel userId="danisman-a" records={[record({ title: "Kendi kira vadesi" }), record({ id: "r-2", title: "Başka danışmanın vadesi", userId: "danisman-b" })]} />);
    expect(html).toContain("Kişisel akışım");
    expect(html).toContain("Kendi kira vadesi");
    expect(html).not.toContain("Başka danışmanın vadesi");
    expect(html).toContain("Rolünüze göre filtrelendi");
  });

  it("keeps record titles out of the manager exception summary", () => {
    const html = renderToStaticMarkup(<OfflineOfficeFlowPanel managerActive userId="broker" records={[record({ title: "Müşteri adı taşımaması gereken vade" })]} />);
    expect(html).toContain("Ofis Akışı");
    expect(html).toContain("Gecikmiş vade");
    expect(html).not.toContain("Müşteri adı taşımaması gereken vade");
  });
});
