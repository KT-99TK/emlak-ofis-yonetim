// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { role: "admin", name: "Test Manager" }, loading: false }),
}));
vi.mock("wouter", () => ({ useLocation: () => ["/", vi.fn()] }));
vi.mock("@/components/DashboardFlowGrid", () => ({
  DashboardFlowGrid: ({ aside }: { primary: React.ReactNode; aside: React.ReactNode }) => <>{aside}</>,
}));
const { query, mutation, officeFlowProps } = vi.hoisted(() => ({
  query: (data: unknown) => ({ data, isLoading: false, isError: false, error: null, refetch: vi.fn() }),
  mutation: () => ({ mutate: vi.fn(), isPending: false, error: null }),
  officeFlowProps: [] as Array<Record<string, unknown>>,
}));
vi.mock("@/components/OfficeFlowPanel", () => ({
  OfficeFlowPanel: (props: Record<string, unknown>) => {
    officeFlowProps.push(props);
    const obligations = props.obligations as Array<{ title: string }>;
    const contracts = props.contracts as unknown[];
    const ledgerEntries = props.ledgerEntries as unknown[];
    return <section aria-label="Ofis Akışı test kartı">Açık vade: {obligations.length} · Sözleşme işlemi: {contracts.length} · Açık tahsilat: {ledgerEntries.length}</section>;
  },
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({}),
    dashboard: { summary: { useQuery: () => query({ contracts: 1, portfolio: 1, clients: 1, teamBreakdown: [], recentActivity: [] }) } },
    onlineStart: { status: { useQuery: () => query({ configured: true, startedAt: "2026-08-27" }) } },
    obligations: { list: { useQuery: () => query([{ id: 1, title: "Gizli malik / Urla İskele", dueDate: "2026-09-15", status: "open" }]) } },
    contracts: { list: { useQuery: () => query([{ id: 11, status: "draft" }]) } },
    ledger: { list: { useQuery: () => query([{ id: 21, entryType: "receivable", status: "pending" }]) } },
    activeRentals: { serviceTasks: { list: { useQuery: () => query([]) } } },
    brokerGuidanceNotes: { list: { useQuery: () => query([]) }, create: { useMutation: mutation }, resolve: { useMutation: mutation } },
  },
}));

import Home from "./Home";

describe("Home route OfficeFlowPanel merkezi veri bağı", () => {
  it("query sonuçlarını anonim vade, sözleşme ve tahsilat sayaçlarına bağlar", () => {
    vi.stubGlobal("React", React);
    officeFlowProps.length = 0;
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain("Açık vade: 1");
    expect(html).toContain("Sözleşme işlemi: 1");
    expect(html).toContain("Açık tahsilat: 1");
    expect(officeFlowProps[0]?.obligations).toEqual([{ id: 1, title: "Gizli malik / Urla İskele", dueDate: "2026-09-15", status: "open" }]);
    expect(officeFlowProps[0]?.contracts).toEqual([{ id: 11, status: "draft" }]);
    expect(officeFlowProps[0]?.ledgerEntries).toEqual([{ id: 21, entryType: "receivable", status: "pending" }]);
  });
});
