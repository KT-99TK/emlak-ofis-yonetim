import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import Home from "./pages/Home";
import Contracts from "./pages/Contracts";
import AuthorityContracts from "./pages/AuthorityContracts";
import Records from "./pages/Records";
import Audit from "./pages/Audit";
import Team from "./pages/Team";
import OfflineWorkspace from "./pages/OfflineWorkspace";
import BackupMerge from "./pages/BackupMerge";
import OfflineAuthorityContracts from "./pages/OfflineAuthorityContracts";
import OfflineRentalContracts from "./pages/OfflineRentalContracts";
import OfflineConsultantPerformance from "./pages/OfflineConsultantPerformance";
import MyOfflineContracts from "./pages/MyOfflineContracts";
import BrokerAnnualTargets from "./pages/BrokerAnnualTargets";
import Obligations from "./pages/Obligations";

const isElectronDesktop = () => typeof window !== "undefined" && (window.location.protocol === "file:" || Boolean((window as Window & { global1881Desktop?: { platform: string } }).global1881Desktop));

function DesktopRouter() {
  const { user } = useAuth();
  const routeFromHash = () => window.location.hash === "#/offline-merge" ? "merge" : window.location.hash === "#/offline-authority" ? "authority" : window.location.hash === "#/offline-rental" ? "rental" : window.location.hash === "#/offline-performance" ? "performance" : window.location.hash === "#/offline-my-contracts" ? "my-contracts" : window.location.hash === "#/offline-targets" ? "targets" : "offline";
  const [route, setRoute] = useState<"offline" | "authority" | "rental" | "performance" | "my-contracts" | "targets" | "merge">(() => typeof window !== "undefined" ? routeFromHash() : "offline");

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (next: "offline" | "authority" | "rental" | "performance" | "my-contracts" | "targets" | "merge") => {
    window.location.hash = next === "merge" ? "/offline-merge" : next === "authority" ? "/offline-authority" : next === "rental" ? "/offline-rental" : next === "performance" ? "/offline-performance" : next === "my-contracts" ? "/offline-my-contracts" : next === "targets" ? "/offline-targets" : "/offline";
    setRoute(next);
  };

  return (
    <DashboardLayout>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#e7dfc9] bg-[#fffaf0] px-3 py-2 text-xs text-[#8d6f3f]">
        <strong>Offline cihaz:</strong>
        <button type="button" onClick={() => navigate("offline")} className={`rounded-md px-2 py-1 font-medium ${route === "offline" ? "bg-[#173e39] text-white" : "bg-white text-[#34433f]"}`}>Çalışma alanı</button>
        <button type="button" onClick={() => navigate("authority")} className={`rounded-md px-2 py-1 font-medium ${route === "authority" ? "bg-[#173e39] text-white" : "bg-white text-[#34433f]"}`}>Yetki sözleşmeleri</button>
        <button type="button" onClick={() => navigate("rental")} className={`rounded-md px-2 py-1 font-medium ${route === "rental" ? "bg-[#173e39] text-white" : "bg-white text-[#34433f]"}`}>Kira sözleşmeleri</button>
        <button type="button" onClick={() => navigate("performance")} className={`rounded-md px-2 py-1 font-medium ${route === "performance" ? "bg-[#173e39] text-white" : "bg-white text-[#34433f]"}`}>Sözleşme ve finansal istatistikler</button>
        <button type="button" onClick={() => navigate("my-contracts")} className={`rounded-md px-2 py-1 font-medium ${route === "my-contracts" ? "bg-[#173e39] text-white" : "bg-white text-[#34433f]"}`}>Benim sözleşmelerim</button>
        {user?.role === "admin" && <button type="button" onClick={() => navigate("targets")} className={`rounded-md px-2 py-1 font-medium ${route === "targets" ? "bg-[#173e39] text-white" : "bg-white text-[#34433f]"}`}>Yıllık ciro hedefleri</button>}
        <button type="button" onClick={() => navigate("merge")} className={`rounded-md px-2 py-1 font-medium ${route === "merge" ? "bg-[#173e39] text-white" : "bg-white text-[#34433f]"}`}>Yedekleri birleştir</button>
      </div>
      {route === "merge" ? <BackupMerge /> : route === "authority" ? <OfflineAuthorityContracts /> : route === "rental" ? <OfflineRentalContracts /> : route === "performance" ? <OfflineConsultantPerformance /> : route === "my-contracts" ? <MyOfflineContracts /> : route === "targets" ? <BrokerAnnualTargets /> : <OfflineWorkspace />}
    </DashboardLayout>
  );
}

function Router() {
  if (isElectronDesktop()) return <DesktopRouter />;

  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/authority-contracts" component={AuthorityContracts} />
        <Route path="/clients" component={Records} />
        <Route path="/properties" component={Records} />
        <Route path="/accounting" component={Records} />
        <Route path="/obligations" component={Obligations} />
        <Route path="/team" component={Team} />
        <Route path="/audit" component={Audit} />
        <Route path="/offline" component={OfflineWorkspace} />
        <Route path="/offline-merge" component={BackupMerge} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
