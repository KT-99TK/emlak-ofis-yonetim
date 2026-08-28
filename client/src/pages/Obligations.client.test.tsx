// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: { role: "admin", name: "Test Manager" }, loading: false }),
}));
vi.mock("@/components/OfflineOfficeFlowPanel", () => ({ default: () => null }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ obligations: { list: { invalidate: vi.fn() } } }),
    obligations: {
      list: { useQuery: () => ({ data: [{ id: 1, title: "Emlak vergisi", obligationType: "tax", propertyId: 7, assignedUserId: 3, dueDate: "2026-11-30", amount: "1200", status: "pending" }], isLoading: false, isError: false }) },
      create: { useMutation: () => ({ mutate: vi.fn(), isPending: false, error: null }) },
    },
  },
}));

import Obligations from "./Obligations";

let root: Root | undefined;

describe("Obligations tarih renderı", () => {
  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    document.body.innerHTML = "";
  });

  it("renders the due date in Turkish format in the report and card", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal("React", React);
    await act(async () => {
      root?.render(<Obligations />);
      await Promise.resolve();
    });

    expect(container.textContent).toContain("30.11.2026");
    expect(container.textContent).not.toContain("2026-11-30");
  });
});
