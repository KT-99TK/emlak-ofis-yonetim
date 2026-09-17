import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ loading: false, user: { name: "Test Broker", email: "broker@test.local", role: "admin" }, logout: () => undefined }),
}));

import DashboardLayout from "./DashboardLayout";

function renderAt(width: number) {
  const storage = { getItem: () => null, setItem: () => undefined };
  const browserLocation = { protocol: "https:", hash: "", pathname: "/", search: "" };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("navigator", { onLine: true });
  vi.stubGlobal("location", browserLocation);
  vi.stubGlobal("window", {
    innerWidth: width,
    localStorage: storage,
    location: browserLocation,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  });

  return renderToStaticMarkup(<DashboardLayout><main>TEST İÇERİĞİ</main></DashboardLayout>);
}

describe("DashboardLayout navigation render", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders the colored navigation and its active dashboard item in both wide and narrow browser contexts", () => {
    const desktop = renderAt(1440);
    const narrow = renderAt(768);

    [desktop, narrow].forEach((html) => {
      expect(html).toContain("Genel Bakış");
      expect(html).toContain("Yetki Sözleşmeleri");
      expect(html).toContain("Kira &amp; Vergi Vadeleri");
      expect(html).toContain("data-[active=true]:bg-[#12302A]");
      expect(html).toContain("bg-[#D4622A]");
    });
  });
});
