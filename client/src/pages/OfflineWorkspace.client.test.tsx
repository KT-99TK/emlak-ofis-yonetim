// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/offlineStore", () => ({
  applyOfflineRecords: vi.fn(),
  applyWithRollback: vi.fn(),
  createRollbackSnapshot: vi.fn(),
  downloadCurrentBackup: vi.fn(),
  restoreRollbackSnapshot: vi.fn(),
  exportOfflineBackup: vi.fn(),
  getDeviceId: () => "device-test",
  getUserId: () => "TEST-MANAGER",
  listOfflineRecords: vi.fn(async () => []),
  mergeOfflineBackups: vi.fn(),
  saveOfflineRecord: vi.fn(),
  setUserId: vi.fn(),
}));

import OfflineWorkspace from "./OfflineWorkspace";

let root: Root | undefined;

function configureDesktop(width: number) {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.stubGlobal("React", React);
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "global1881Desktop", { configurable: true, value: { platform: "win32" } });
}

async function renderWorkspace(width: number) {
  configureDesktop(width);
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(<OfflineWorkspace />);
    await Promise.resolve();
  });
  return container;
}

describe("OfflineWorkspace client viewport controls", () => {
  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    document.body.innerHTML = "";
    window.localStorage.clear();
  });

  it("keeps filter and record-type controls visible and keyboard-addressable in a narrow viewport", async () => {
    const container = await renderWorkspace(600);

    expect(container.textContent).toContain("Tüm offline kayıtlar");
    expect(container.textContent).toContain("Müşteri");
    expect(container.textContent).toContain("Tahliye");
    expect(container.querySelectorAll("button").length).toBeGreaterThan(2);
    const filterSelect = container.querySelector('[aria-label="Offline kayıt filtresi"]');
    const recordTypeSelect = container.querySelector('[aria-label="Kayıt türü"]');
    expect(filterSelect?.getAttribute("role")).toBe("combobox");
    expect(recordTypeSelect?.getAttribute("role")).toBe("combobox");
    expect(Number(filterSelect?.getAttribute("tabindex"))).toBeGreaterThanOrEqual(0);
    expect(Number(recordTypeSelect?.getAttribute("tabindex"))).toBeGreaterThanOrEqual(0);
    expect(filterSelect?.className).toContain("w-full");
    expect(filterSelect?.className).toContain("sm:w-44");
    expect(recordTypeSelect?.closest(".space-y-4")).not.toBeNull();
    expect(container.querySelector('input[placeholder="Kısa açıklama"]')).not.toBeNull();
  });

  it("renders the same controls in the wide desktop workspace without losing the flow panel", async () => {
    const container = await renderWorkspace(1440);

    expect(container.textContent).toContain("Bu cihazdaki kayıtlar");
    expect(container.textContent).toContain("Tüm offline kayıtlar");
    expect(container.querySelector(".offline-operation-aside")).not.toBeNull();
    expect(container.querySelector(".offline-operation-grid")).not.toBeNull();
  });
});
