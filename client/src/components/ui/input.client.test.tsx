// @vitest-environment jsdom
import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { Input } from "./input";

let root: Root | undefined;

describe("Input tarih standardı", () => {
  afterEach(async () => {
    await act(async () => root?.unmount());
    root = undefined;
    document.body.innerHTML = "";
  });

  it("native tarih alanını GG.AA.YYYY olarak gösterir ve blur anında ISO değerini korur", async () => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    let storedValue = "";
    const host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);

    await act(async () => {
      root?.render(<Input type="date" value="2026-08-24" onChange={(event) => { storedValue = event.target.value; }} aria-label="Vade tarihi" />);
    });

    const input = host.querySelector<HTMLInputElement>("input");
    expect(input?.type).toBe("text");
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
