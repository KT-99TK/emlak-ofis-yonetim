// @vitest-environment jsdom
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { role: "admin", name: "Test Manager" }, loading: false }),
}));
const { mutation, query } = vi.hoisted(() => ({
  mutation: () => ({ mutate: vi.fn(), isPending: false, error: null }),
  query: (data: unknown) => ({ data, isLoading: false, isError: false, error: null }),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ activeRentals: { list: { invalidate: vi.fn() }, serviceTasks: { list: { invalidate: vi.fn() } }, rentalIncomeTaxProfiles: { list: { invalidate: vi.fn() } } } }),
    team: { list: { useQuery: () => query([]) } },
    activeRentals: {
      list: { useQuery: () => query([{ id: 1, clientId: 1, clientName: "Mustafa Ekin", clientPhone: "", tenantName: "Hasan Öncü", tenantPhone: "", contractDate: "2025-05-10", rentIncreaseDate: "2026-05-10", evictionDate: null, monthlyRent: "50000", neighborhood: "İskele", propertyLocation: "İskele işyeri 1", unitInfo: "Daire 1", consultantCode: "KT1", assignedUserId: 21 }]) },
      revealSensitive: { useMutation: mutation },
      importSummaries: { useMutation: mutation },
      serviceTasks: { list: { useQuery: () => query([]) }, refresh: { useMutation: mutation }, prepare: { useMutation: mutation }, review: { useMutation: mutation }, markShared: { useMutation: mutation }, startReletting: { useMutation: mutation } },
      rentalIncomeTaxProfiles: { list: { useQuery: () => query([]) }, save: { useMutation: mutation } },
    },
  },
}));
vi.mock("@/components/OfflineOfficeFlowPanel", () => ({ default: () => null }));

import ActiveRentalSummaries from "./ActiveRentalSummaries";

describe("ActiveRentalSummaries tarih renderı", () => {
  it("renders the contract date in Turkish format in the visible table", () => {
    vi.stubGlobal("React", React);
    const html = renderToStaticMarkup(<ActiveRentalSummaries />);
    expect(html).toContain("10.05.2025");
    expect(html).not.toContain("2025-05-10");
  });
});
