import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RentalServiceTaskMobilePanel } from "./RentalServiceTaskMobilePanel";

const summary = { open: 4, overdue: 1, planned: 2, prepared: 1, reviewed: 1, shared: 3 };
const scopedTasks = [{ id: 7, title: "Malik kontrolü · kira dönemi", dueDate: "2026-09-01", status: "planned", customerContext: "Yalnız danışmanın maliki · Urla" }];

describe("RentalServiceTaskMobilePanel", () => {
  it("broker managera yalnız anonim durum toplamlarını gösterir ve kişisel görev metnini işlemez", () => {
    const html = renderToStaticMarkup(<RentalServiceTaskMobilePanel isManager state="ready" summary={summary} personalTasks={scopedTasks} onRetry={() => undefined} />);
    expect(html).toContain("Müşteri hizmeti yönlendirmesi");
    expect(html).toContain("Açık görev");
    expect(html).toContain("Manager incelemesi");
    expect(html).toContain("4");
    expect(html).not.toContain("Yalnız danışmanın maliki");
    expect(html).not.toContain("Malik kontrolü · kira dönemi");
  });

  it("danışmana yalnız sunucudan gelen kapsam içi görevleri, boş ve hata durumlarını ayrı gösterir", () => {
    const personalHtml = renderToStaticMarkup(<RentalServiceTaskMobilePanel isManager={false} state="ready" summary={summary} personalTasks={scopedTasks} onRetry={() => undefined} />);
    expect(personalHtml).toContain("Kira müşteri hizmeti");
    expect(personalHtml).toContain("Yalnız danışmanın maliki · Urla");

    const emptyHtml = renderToStaticMarkup(<RentalServiceTaskMobilePanel isManager={false} state="ready" summary={summary} personalTasks={[]} onRetry={() => undefined} />);
    expect(emptyHtml).toContain("Şu an size atanmış açık kira müşteri hizmet görevi bulunmuyor.");

    const errorHtml = renderToStaticMarkup(<RentalServiceTaskMobilePanel isManager={false} state="error" summary={summary} personalTasks={[]} onRetry={() => undefined} />);
    expect(errorHtml).toContain("Kişisel hizmet görevleri yüklenemedi. Boş görev bilgisi gösterilmez.");
    expect(errorHtml).toContain("Tekrar dene");
  });
});
