import React, { type ReactNode } from "react";

type DashboardFlowGridProps = { primary: ReactNode; aside: ReactNode };

/** The aside stays below the primary card until xl width, then becomes the dashboard's right rail. */
export function DashboardFlowGrid({ primary, aside }: DashboardFlowGridProps) {
  return <section data-testid="dashboard-flow-grid" className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><div data-testid="dashboard-flow-primary">{primary}</div><aside data-testid="dashboard-flow-aside">{aside}</aside></section>;
}
