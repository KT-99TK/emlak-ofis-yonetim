// @vitest-environment jsdom
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "../../../server/routers";
import type { TrpcContext } from "../../../server/_core/context";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { role: "admin", name: "Test Manager" }, loading: false }),
}));
vi.mock("wouter", () => ({ useLocation: () => ["/", vi.fn()] }));
vi.mock("@/components/DashboardFlowGrid", () => ({
  DashboardFlowGrid: ({ aside }: { primary: React.ReactNode; aside: React.ReactNode }) => <>{aside}</>,
}));
const { query, mutation, officeFlowProps, state } = vi.hoisted(() => ({
  state: { onlineStart: { configured: true, startedAt: "2026-08-27" } as unknown },
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
    onlineStart: { status: { useQuery: () => query(state.onlineStart) } },
    obligations: { list: { useQuery: () => query([{ id: 1, title: "Gizli malik / Urla İskele", dueDate: "2026-09-15", status: "open" }]) } },
    contracts: { list: { useQuery: () => query([{ id: 11, status: "draft" }]) } },
    ledger: { list: { useQuery: () => query([{ id: 21, entryType: "receivable", status: "pending" }]) } },
    activeRentals: { serviceTasks: { list: { useQuery: () => query([]) } } },
    personalTasks: { list: { useQuery: () => query([]) }, create: { useMutation: mutation }, update: { useMutation: mutation }, cancel: { useMutation: mutation } },
    exchangeRates: { daily: { useQuery: () => query({ rateDate: "2026-09-15", source: "TCMB", sourceUrl: "https://www.tcmb.gov.tr/kurlar/today.xml", isReferenceRate: true, rates: { EUR: { buying: 56.0284, selling: 56.1294 }, USD: { buying: 48.5343, selling: 48.6218 } } }) } },
    brokerGuidanceNotes: { list: { useQuery: () => query([]) }, create: { useMutation: mutation }, resolve: { useMutation: mutation } },
  },
}));

import Home from "./Home";

afterEach(() => cleanup());

describe("Home route OfficeFlowPanel merkezi veri bağı", () => {
  it("query sonuçlarını anonim vade, sözleşme ve tahsilat sayaçlarına bağlar", () => {
    vi.stubGlobal("React", React);
    state.onlineStart = { configured: true, startedAt: "2026-08-27" };
    officeFlowProps.length = 0;
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain("Açık vade: 1");
    expect(html).toContain("Sözleşme işlemi: 1");
    expect(html).toContain("Açık tahsilat: 1");
    expect(officeFlowProps[0]?.obligations).toEqual([{ id: 1, title: "Gizli malik / Urla İskele", dueDate: "2026-09-15", status: "open" }]);
    expect(officeFlowProps[0]?.contracts).toEqual([{ id: 11, status: "draft" }]);
    expect(officeFlowProps[0]?.ledgerEntries).toEqual([{ id: 21, entryType: "receivable", status: "pending" }]);
  });

  it("onlineStart null döndüğünde undefined hatası üretmeden başlangıç bekliyor durumunu gösterir", () => {
    vi.stubGlobal("React", React);
    state.onlineStart = null;
    officeFlowProps.length = 0;
    const html = renderToStaticMarkup(<Home />);
    expect(html).toContain("Başlangıç bekliyor");
    expect(html).not.toContain("Merkezi ofis verileri yükleniyor");
    expect(html).not.toContain("Kira ve vergi vadeleri kontrol ediliyor");
  });

  it("gerçek appRouter sonucunu QueryClient DOM akışında null durumuna bağlar", async () => {
    const now = new Date();
    const context: TrpcContext = {
      user: {
        id: 1,
        openId: "home-online-start-test",
        email: "home-online-start-test@example.com",
        name: "Home Online Start Test",
        loginMethod: "test",
        role: "user",
        createdAt: now,
        updatedAt: now,
        lastSignedIn: now,
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    const routerResult = await appRouter.createCaller(context).onlineStart.status();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    state.onlineStart = routerResult;
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    );
    expect(routerResult).not.toBeUndefined();
    expect(screen.getByText("Aktif sözleşmeler")).toBeTruthy();
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain("data is undefined");
    consoleError.mockRestore();
  });

  it("gerçek jsdom DOM ve QueryClientProvider içinde null durumunu çökmeden gösterir", () => {
    vi.stubGlobal("React", React);
    state.onlineStart = null;
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    );
    expect(screen.getAllByText("Başlangıç bekliyor").length).toBeGreaterThan(0);
    expect(screen.queryByText("Merkezi ofis verileri yükleniyor…")).toBeNull();
    expect(screen.queryByText("Kira ve vergi vadeleri kontrol ediliyor…")).toBeNull();
  });
});
