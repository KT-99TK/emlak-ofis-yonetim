import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homeSource = readFileSync(new URL("../pages/Home.tsx", import.meta.url), "utf8");
const rateSource = readFileSync(new URL("./ExchangeRateCard.tsx", import.meta.url), "utf8");
const taskSource = readFileSync(new URL("./PersonalTaskPanel.tsx", import.meta.url), "utf8");

describe("dashboard loading fallbacks", () => {
  it("does not leave central summary loading without a retry path", () => {
    expect(homeSource).toContain("summaryWaitExceeded");
    expect(homeSource).toContain("setSummaryWaitExceeded(true)");
    expect(homeSource).toContain("summaryQuery.refetch()");
    expect(homeSource).toContain("Merkezi veri yanıtı beklenenden uzun sürdü");
  });

  it("does not leave TCMB rates loading forever", () => {
    expect(rateSource).toContain("loadingTimedOut");
    expect(rateSource).toContain("Kur bilgisi gösterilemedi");
    expect(rateSource).toContain("rateQuery.refetch()");
  });

  it("does not leave the personal plan loading forever", () => {
    expect(taskSource).toContain("taskLoadingTimedOut");
    expect(taskSource).toContain("Kişisel plan yanıtı beklenenden uzun sürdü");
    expect(taskSource).toContain("tasksQuery.refetch()");
  });
});

export {};

