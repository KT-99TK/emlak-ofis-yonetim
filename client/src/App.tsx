import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Contracts from "./pages/Contracts";
import Records from "./pages/Records";
import Audit from "./pages/Audit";
import Team from "./pages/Team";
import OfflineWorkspace from "./pages/OfflineWorkspace";
import BackupMerge from "./pages/BackupMerge";
import Obligations from "./pages/Obligations";

const isElectronDesktop = () => typeof window !== "undefined" && Boolean((window as Window & { global1881Desktop?: { platform: string } }).global1881Desktop);

function DesktopRouter() {
  const [route, setRoute] = useState<"offline" | "merge">(() => typeof window !== "undefined" && window.location.hash === "#/offline-merge" ? "merge" : "offline");

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash === "#/offline-merge" ? "merge" : "offline");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (next: "offline" | "merge") => {
    window.location.hash = next === "merge" ? "/offline-merge" : "/offline";
    setRoute(next);
  };

  return (
    <DashboardLayout>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-[#e7dfc9] bg-[#fffaf0] px-3 py-2 text-xs text-[#8d6f3f]">
        <strong>Offline cihaz:</strong>
        <button type="button" onClick={() => navigate("offline")} className={`rounded-md px-2 py-1 font-medium ${route === "offline" ? "bg-[#173e39] text-white" : "bg-white text-[#34433f]"}`}>Çalışma alanı</button>
        <button type="button" onClick={() => navigate("merge")} className={`rounded-md px-2 py-1 font-medium ${route === "merge" ? "bg-[#173e39] text-white" : "bg-white text-[#34433f]"}`}>Yedekleri birleştir</button>
      </div>
      {route === "merge" ? <BackupMerge /> : <OfflineWorkspace />}
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
