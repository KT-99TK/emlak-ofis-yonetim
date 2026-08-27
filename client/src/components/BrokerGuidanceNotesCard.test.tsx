import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BrokerGuidanceNotesCard } from "./BrokerGuidanceNotesCard";

describe("BrokerGuidanceNotesCard", () => {
  it("açık anonim not sayısını ve müşteri ayrıntısı yazmama uyarısını gösterir", () => {
    const html = renderToStaticMarkup(
      <BrokerGuidanceNotesCard
        notes={[
          { id: 3, subject: "rental_service", summary: "Kira hizmeti hazırlık kuyruğu kontrol edilsin.", status: "open" },
          { id: 4, subject: "general", summary: "Haftalık ofis işlem kontrolü tamamlandı.", status: "resolved" },
        ]}
        onRetry={() => undefined}
        onCreate={() => undefined}
        onResolve={() => undefined}
      />
    );
    expect(html).toContain("Açık broker notu");
    expect(html).toContain("1");
    expect(html).toContain("1 çözüldü");
  });

  it("sorgu hatasında nota ait sayısal toplam yerine açık hata ve yenileme denetimi verir", () => {
    const html = renderToStaticMarkup(
      <BrokerGuidanceNotesCard
        state="error"
        onRetry={() => undefined}
        onCreate={() => undefined}
        onResolve={() => undefined}
      />
    );
    expect(html).toContain("Notlar yüklenemedi.");
    expect(html).toContain("Yenile");
  });

  it("iletişim penceresi açıkken mahremiyet uyarısını render eder", () => {
    const html = renderToStaticMarkup(
      <BrokerGuidanceNotesCard
        initiallyOpen
        onRetry={() => undefined}
        onCreate={() => undefined}
        onResolve={() => undefined}
      />
    );
    expect(html).toContain("Müşteri, danışman, telefon, kimlik ve taşınmaz ayrıntısı yazmayın.");
  });
});
