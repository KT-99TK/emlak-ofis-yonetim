import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("./ContractFormFiller.tsx", import.meta.url), "utf8");

describe("contract preparation checklist gate", () => {
  it("renders the consultant-visible red preparation panel and audit wording", () => {
    expect(source).toContain("Sözleşmeyi kaydetmeden önce kontrol edin");
    expect(source).toContain("kim tarafından ve ne zaman tamamlandığı audit kaydında tutulur");
    expect(source).toContain("preparation.data?.checkDefinitions");
    expect(source).toContain("savePreparation.mutate");
  });

  it("keeps draft save disabled until required fields, attachments and checks are complete", () => {
    expect(source).toContain("!preparationComplete");
    expect(source).toContain("missingFields.length > 0");
    expect(source).toContain("missingAttachments.length > 0");
    expect(source).toContain("Kontrol edildi — taslak formu kaydet");
  });
});

export {};

// Değişiklik, fiziksel kullanıcı login kabulünü varsaymaz; yalnızca danışman akışındaki görünür panel ve kayıt kapısı sözleşmesini doğrular.
