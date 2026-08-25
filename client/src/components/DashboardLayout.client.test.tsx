// @vitest-environment jsdom
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ loading: false, user: { name: "Test Broker", email: "broker@test.local", role: "admin" }, logout: () => undefined }),
}));

import DashboardLayout from "./DashboardLayout";

let root: Root | undefined;

function configureViewport(width: number) {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("max-width") ? width < 768 : false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
}

async function renderAt(width: number) {
  configureViewport(width);
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(<DashboardLayout><main>TEST İÇERİĞİ</main></DashboardLayout>);
    await Promise.resolve();
  });
  return container.innerHTML;
}

describe("DashboardLayout client viewport navigation", () => {
  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    document.body.innerHTML = "";
    window.localStorage.clear();
    Object.defineProperty(window, "global1881Desktop", { configurable: true, value: undefined });
    window.location.hash = "";
  });

  it("renders a desktop sidebar at wide width and the mobile navigation header at narrow width", async () => {
    const desktop = await renderAt(1440);
    expect(desktop).toContain("Genel Bakış");
    expect(desktop).toContain("data-[active=true]:bg-[#173e39]");
    expect(desktop).not.toContain("sticky top-0 z-40");

    await act(async () => root?.unmount());
    root = undefined;
    document.body.innerHTML = "";

    const narrow = await renderAt(600);
    expect(narrow).toContain("Genel Bakış");
    expect(narrow).toContain("sticky top-0 z-40");
    expect(narrow).not.toContain("Yetki Sözleşmeleri");
  });

  it("does not render an application-shell flow sidebar for the offline workspace or child routes", async () => {
    Object.defineProperty(window, "global1881Desktop", { configurable: true, value: { platform: "win32" } });
    window.location.hash = "#/offline";
    const baseLayout = await renderAt(1440);
    expect(baseLayout).not.toContain('aria-label="Kişisel Ofis Akışı"');

    await act(async () => {
      window.location.hash = "#/offline-cash-bank";
      window.dispatchEvent(new Event("hashchange"));
      await Promise.resolve();
    });
    expect(document.body.innerHTML).not.toContain('aria-label="Kişisel Ofis Akışı"');
  });

  it("groups offline navigation into shared office operations and a lower personal workspace without changing routes", async () => {
    Object.defineProperty(window, "global1881Desktop", { configurable: true, value: { platform: "win32" } });
    window.location.hash = "#/offline";
    const desktop = await renderAt(1440);

    expect(desktop).toContain('aria-label="Offline menü: Ortak Ofis Operasyonları"');
    expect(desktop).toContain('aria-label="Offline menü: Kişisel Çalışma Alanı"');
    expect(desktop).toContain("Kişisel Çalışma Alanı");
    expect(desktop.indexOf("Sözleşme ve Finansal İstatistikler")).toBeLessThan(desktop.indexOf("Kasa ve Banka"));
    expect(desktop.indexOf("Kasa ve Banka")).toBeLessThan(desktop.indexOf("Yedekleri Birleştir"));
    expect(desktop.indexOf("Kasa ve Banka")).toBeLessThan(desktop.indexOf("Benim Sözleşmelerim"));
    expect(desktop.indexOf("Benim Sözleşmelerim")).toBeLessThan(desktop.indexOf("Aktif İmzalı Belgeler"));
    expect(desktop.indexOf("Aktif İmzalı Belgeler")).toBeLessThan(desktop.indexOf("Müşteri Talepleri"));
    expect(desktop.indexOf("Müşteri Talepleri")).toBeLessThan(desktop.indexOf("Müşteri Dijital Arşivi"));
    const personalContractsButton = Array.from(document.querySelectorAll("button")).find((button) => button.textContent?.includes("Benim Sözleşmelerim"));
    const archiveButton = Array.from(document.querySelectorAll("button")).find((button) => button.textContent?.includes("Müşteri Dijital Arşivi"));

    expect(personalContractsButton).toBeDefined();
    expect(archiveButton).toBeDefined();
    await act(async () => personalContractsButton?.click());
    expect(window.location.hash).toBe("#/offline-my-contracts");
    await act(async () => archiveButton?.click());
    expect(window.location.hash).toBe("#/offline-archive");
  });
});
