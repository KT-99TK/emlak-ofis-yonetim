// @vitest-environment jsdom
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import TurkishDateInput from "./TurkishDateInput";

let root: Root | undefined;

describe("TurkishDateInput", () => {
  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    document.body.innerHTML = "";
  });

  it("shows ISO storage values as GG.AA.YYYY and commits valid Turkish input back as ISO", async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    let storedValue = "";
    const host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    await act(async () => {
      root?.render(<TurkishDateInput value="2026-08-24" onValueChange={(value) => { storedValue = value; }} aria-label="Sözleşme tarihi" />);
    });

    const input = host.querySelector<HTMLInputElement>("input");
    expect(input?.value).toBe("24.08.2026");
    expect(input?.placeholder).toBe("GG.AA.YYYY");

    await act(async () => {
      if (!input) return;
      const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
      descriptor?.set?.call(input, "25.08.2026");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    });

    expect(storedValue).toBe("2026-08-25");
  });
});
