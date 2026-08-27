import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("offline route code splitting", () => {
  it("merkezi ve offline sözleşme ekranlarını dinamik yüklerken rota ile offline fallback akışını korur", () => {
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

    expect(app).toMatch(/const OfflineAuthorityContracts = lazy\(\s*\(\) => import\("\.\/pages\/OfflineAuthorityContracts"\)/);
    expect(app).toMatch(/const OfflineRentalContracts = lazy\(\s*\(\) => import\("\.\/pages\/OfflineRentalContracts"\)/);
    expect(app).not.toContain('import OfflineAuthorityContracts from "./pages/OfflineAuthorityContracts";');
    expect(app).not.toContain('import OfflineRentalContracts from "./pages/OfflineRentalContracts";');
    expect(app).toContain('const OfflineContractArchive = lazy(() => import("./pages/OfflineContractArchive"));');
    expect(app).toContain('const OfflineInternalControl = lazy(() => import("./pages/OfflineInternalControl"));');
    expect(app).toContain('const Records = lazy(() => import("./pages/Records"));');
    expect(app).toContain('const Obligations = lazy(() => import("./pages/Obligations"));');
    expect(app).toContain('const OnlineStart = lazy(() => import("./pages/OnlineStart"));');
    expect(app).toContain('<Route path="/online-start" component={OnlineStart} />');
    expect(app).toContain('const MobileCompanion = lazy(() => import("./pages/MobileCompanion"));');
    expect(app).toContain('window.location.pathname === "/mobile") return <Suspense fallback={<RouteLoader />}><MobileCompanion /></Suspense>');
    expect(app).toContain("function RouteLoader()");
    expect(app).toContain("<Suspense fallback={<RouteLoader />}>" );
    expect(app).not.toContain("Offline cihaz:");
    expect(app).not.toContain("const navigate =");
  });
});
