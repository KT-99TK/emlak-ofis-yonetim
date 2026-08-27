import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(new URL("./App.tsx", import.meta.url), "utf8");

describe("uygulama başlangıç yükü", () => {
  it("büyük merkezi ve offline sayfaları başlangıç paketine statik olarak eklemez", () => {
    [
      "Home",
      "Contracts",
      "AuthorityContracts",
      "OfflineWorkspace",
      "OfflineAuthorityContracts",
      "OfflineRentalContracts",
      "OfflineTransactionClosings",
    ].forEach(page => {
      expect(appSource).toMatch(
        new RegExp(
          `const\\s+${page}\\s*=\\s*lazy\\(\\s*\\(\\)\\s*=>\\s*import\\("\\./pages/${page}"\\)\\s*\\)`
        )
      );
      expect(appSource).not.toContain(`import ${page} from "./pages/${page}"`);
    });
  });

  it("merkezi ve Electron hash rotalarını aynı sayfa bileşenlerine bağlı tutar", () => {
    expect(appSource).toContain('<Route path="/contracts" component={Contracts} />');
    expect(appSource).toContain('<Route path="/authority-contracts" component={AuthorityContracts} />');
    expect(appSource).toContain('route === "authority" ? <OfflineAuthorityContracts />');
    expect(appSource).toContain('route === "rental" ? <OfflineRentalContracts />');
  });
});
