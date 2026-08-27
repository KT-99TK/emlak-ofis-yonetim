import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OfficeFlowPanel } from "./OfficeFlowPanel";

const obligations = [
  { id: 1, title: "Kendi kira vadesi — Gizli Kiracı", dueDate: "2026-08-22", status: "open" },
  { id: 2, title: "Kendi vergi vadesi", dueDate: "2026-08-27", status: "open" },
];
const contracts = [{ id: 1, status: "review", title: "Gizli sözleşme başlığı" }, { id: 2, status: "active", title: "İkinci gizli sözleşme" }];
const ledgerEntries = [{ id: 1, entryType: "receivable", status: "pending", description: "Gizli tahsilat açıklaması" }, { id: 2, entryType: "income", status: "paid", description: "Ödenen hareket" }];

describe("OfficeFlowPanel", () => {
  it("shows a consultant only the work titles sent for that consultant", () => {
    const html = renderToStaticMarkup(<OfficeFlowPanel role="user" obligations={obligations} contracts={contracts} ledgerEntries={ledgerEntries} attentionLabel="Cahit Beyin Dikkatine" onOpenObligations={() => undefined} now={new Date("2026-08-23T09:00:00")} />);
    expect(html).toContain("Size Özel Gündem");
    expect(html).toContain("Cahit Beyin Dikkatine");
    expect(html).toContain("Kendi kira vadesi — Gizli Kiracı");
    expect(html).toContain("1 gün gecikmiş");
    expect(html).toContain("Sözleşme adımı");
    expect(html).toContain("Açık tahsilat");
  });

  it("keeps obligation titles out of the broker manager summary", () => {
    const html = renderToStaticMarkup(<OfficeFlowPanel role="admin" obligations={obligations} contracts={contracts} ledgerEntries={ledgerEntries} rentalServiceSummary={{ open: 7, overdue: 2, planned: 3, prepared: 1, reviewed: 1, shared: 4 }} attentionLabel="Cahit Beyin Dikkatine" onOpenObligations={() => undefined} now={new Date("2026-08-23T09:00:00")} />);
    expect(html).toContain("Ofis Akışı");
    expect(html).toContain("Gecikmiş vade");
    expect(html).not.toContain("Gizli Kiracı");
    expect(html).not.toContain("Kendi kira vadesi");
    expect(html).not.toContain("Gizli sözleşme başlığı");
    expect(html).not.toContain("Gizli tahsilat açıklaması");
    expect(html).not.toContain("Cahit Beyin Dikkatine");
    expect(html).toContain("Sözleşme işlemi");
    expect(html).toContain("Açık tahsilat");
    expect(html).toContain("Müşteri hizmeti");
    expect(html).toContain("Manager incelemesi: 1");
  });

  it("shows a safe retry state instead of a zero service-task summary when the broker query fails", () => {
    const html = renderToStaticMarkup(<OfficeFlowPanel role="admin" obligations={obligations} rentalServiceState="error" rentalServiceSummary={{ open: 0, overdue: 0, planned: 0, prepared: 0, reviewed: 0, shared: 0 }} onRefreshRentalServiceTasks={() => undefined} onOpenObligations={() => undefined} now={new Date("2026-08-23T09:00:00")} />);
    expect(html).toContain("Müşteri hizmeti görevleri yüklenemedi. Sıfır görev bilgisi gösterilmez.");
    expect(html).toContain("Tekrar dene");
    expect(html).not.toContain("Gizli Kiracı");
  });
});
