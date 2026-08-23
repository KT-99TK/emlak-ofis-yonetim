// @vitest-environment jsdom
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

let root: Root | undefined;

describe("Select client panel", () => {
  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    document.body.innerHTML = "";
  });

  it("uses a fully opaque, elevated panel with generously spaced options", async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    Object.defineProperties(HTMLElement.prototype, {
      hasPointerCapture: { configurable: true, value: () => false },
      setPointerCapture: { configurable: true, value: () => undefined },
      releasePointerCapture: { configurable: true, value: () => undefined },
      scrollIntoView: { configurable: true, value: () => undefined },
    });
    const host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    await act(async () => {
      root?.render(<Select defaultValue="client"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="client">Müşteri</SelectItem><SelectItem value="property">Mülk</SelectItem></SelectContent></Select>);
    });

    const trigger = host.querySelector<HTMLElement>("[data-slot='select-trigger']");
    expect(trigger).not.toBeNull();
    await act(async () => {
      const pointerDown = new MouseEvent("pointerdown", { bubbles: true, button: 0 });
      Object.defineProperty(pointerDown, "pointerType", { value: "mouse" });
      Object.defineProperty(pointerDown, "pointerId", { value: 1 });
      trigger?.dispatchEvent(pointerDown);
      await Promise.resolve();
    });

    const panel = document.body.querySelector<HTMLElement>("[data-slot='select-content']");
    expect(panel).not.toBeNull();
    expect(panel?.className).toContain("!bg-[#ffffff]");
    expect(panel?.className).toContain("z-[200]");
    expect(panel?.className).toContain("!opacity-100");
    expect(document.body.querySelector("[data-slot='select-item']")?.className).toContain("min-h-10");
  });
});
