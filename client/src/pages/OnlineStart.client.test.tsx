// @vitest-environment jsdom
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { role: "admin", name: "Test Manager" }, loading: false }),
}));

const { state } = vi.hoisted(() => ({
  state: { status: null as unknown },
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ onlineStart: { status: { invalidate: vi.fn() } } }),
    onlineStart: {
      status: {
        useQuery: () => ({ data: state.status, isLoading: false, isError: false, error: null }),
      },
      configure: {
        useMutation: () => ({ mutate: vi.fn(), isPending: false, error: null }),
      },
    },
  },
}));

import OnlineStart from "./OnlineStart";

afterEach(() => cleanup());

describe("OnlineStart null davranışı", () => {
  it("merkezi başlangıç ayarı null iken ekran çökmeden boş durum ve ayar formunu gösterir", () => {
    vi.stubGlobal("React", React);
    state.status = null;
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <OnlineStart />
      </QueryClientProvider>
    );

    expect(screen.getByText("Başlangıç tarihi henüz ayarlanmadı")).toBeTruthy();
    expect(screen.getByLabelText("Online geçiş tarihi")).toBeTruthy();
    expect(screen.queryByText("Merkezi başlangıç durumu yükleniyor…")).toBeNull();
  });
});
