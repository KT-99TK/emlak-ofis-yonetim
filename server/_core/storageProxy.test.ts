import { describe, expect, it, vi } from "vitest";
import type { Express } from "express";
import { isProtectedOfficeDocumentKey, registerStorageProxy } from "./storageProxy";

describe("storage proxy Express 5 rotası", () => {
  it("adlandırılmış wildcard ile çok parçalı storage anahtarını kaydeder", () => {
    const get = vi.fn();
    registerStorageProxy({ get } as unknown as Express);

    expect(get).toHaveBeenCalledWith("/manus-storage/*key", expect.any(Function));
  });

  it("ofis sözleşme belgelerini genel storage rotasından ayırır", () => {
    expect(isProtectedOfficeDocumentKey("office-documents/kira-001.pdf")).toBe(true);
    expect(isProtectedOfficeDocumentKey("templates/aktif-kira.xlsx")).toBe(false);
  });
});
