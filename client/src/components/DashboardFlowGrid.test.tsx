import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DashboardFlowGrid } from "./DashboardFlowGrid";
import { OfficeFlowPanel } from "./OfficeFlowPanel";

describe("DashboardFlowGrid", () => {
  it("renders the OfficeFlowPanel after the primary dashboard card in the responsive desktop-right-rail grid", () => {
    const html = renderToStaticMarkup(<DashboardFlowGrid primary={<div>ANA AKIŞ</div>} aside={<OfficeFlowPanel role="admin" obligations={[]} onOpenObligations={() => undefined} />} />);

    expect(html).toContain('data-testid="dashboard-flow-grid"');
    expect(html).toContain('class="grid gap-6 xl:grid-cols-[1.35fr_.65fr]"');
    expect(html).toContain('data-testid="dashboard-flow-aside"');
    expect(html.indexOf("ANA AKIŞ")).toBeLessThan(html.indexOf("Ofis Akışı"));
  });
});
