import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { lazy, Suspense, useEffect, useState } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardLayout from "./components/DashboardLayout";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Contracts from "./pages/Contracts";
import AuthorityContracts from "./pages/AuthorityContracts";
import OfflineWorkspace from "./pages/OfflineWorkspace";
import OfflineAuthorityContracts from "./pages/OfflineAuthorityContracts";
import OfflineRentalContracts from "./pages/OfflineRentalContracts";
import OfflineTransactionClosings from "./pages/OfflineTransactionClosings";

const Records = lazy(() => import("./pages/Records"));
const Audit = lazy(() => import("./pages/Audit"));
const Team = lazy(() => import("./pages/Team"));
const OnlineStart = lazy(() => import("./pages/OnlineStart"));
const Obligations = lazy(() => import("./pages/Obligations"));
const MobileCompanion = lazy(() => import("./pages/MobileCompanion"));
const BackupMerge = lazy(() => import("./pages/BackupMerge"));
const OfflineConsultantPerformance = lazy(() => import("./pages/OfflineConsultantPerformance"));
const MyOfflineContracts = lazy(() => import("./pages/MyOfflineContracts"));
const BrokerAnnualTargets = lazy(() => import("./pages/BrokerAnnualTargets"));
const CustomerRequests = lazy(() => import("./pages/CustomerRequests"));
const BrokerRequestMatches = lazy(() => import("./pages/BrokerRequestMatches"));
const OfflineCashBankControl = lazy(() => import("./pages/OfflineCashBankControl"));
const OfflineInternalControl = lazy(() => import("./pages/OfflineInternalControl"));
const OfflineOfficeContributionControl = lazy(() => import("./pages/OfflineOfficeContributionControl"));
const MyOfficeContributionSummary = lazy(() => import("./pages/MyOfficeContributionSummary"));
const OfflineContractArchive = lazy(() => import("./pages/OfflineContractArchive"));
const OfflineActiveContractDocuments = lazy(() => import("./pages/OfflineActiveContractDocuments"));

const isElectronDesktop = () => typeof window !== "undefined" && (window.location.protocol === "file:" || Boolean((window as Window & { global1881Desktop?: { platform: string } }).global1881Desktop));

function RouteLoader() {
  return <div className="mx-auto flex min-h-[240px] max-w-xl items-center justify-center rounded-2xl border border-[#dbe5dd] bg-white px-6 py-10 text-center text-sm text-[#52635e]">Çalışma alanı hazırlanıyor…</div>;
}

function DesktopRouter() {
  const routeFromHash = () => window.location.hash === "#/offline-merge" ? "merge" : window.location.hash === "#/offline-authority" ? "authority" : window.location.hash === "#/offline-rental" ? "rental" : window.location.hash === "#/offline-active-documents" ? "active-documents" : window.location.hash === "#/offline-archive" ? "archive" : window.location.hash === "#/offline-performance" ? "performance" : window.location.hash === "#/offline-my-contracts" ? "my-contracts" : window.location.hash === "#/offline-my-contributions" ? "my-contributions" : window.location.hash === "#/offline-targets" ? "targets" : window.location.hash === "#/offline-requests" ? "requests" : window.location.hash === "#/offline-request-matches" ? "request-matches" : window.location.hash === "#/offline-transactions" ? "transactions" : window.location.hash === "#/offline-cash-bank" ? "cash-bank" : window.location.hash === "#/offline-internal-control" ? "internal-control" : window.location.hash === "#/offline-office-contributions" ? "office-contributions" : "offline";
  const [route, setRoute] = useState<"offline" | "authority" | "rental" | "active-documents" | "archive" | "performance" | "my-contracts" | "my-contributions" | "targets" | "requests" | "request-matches" | "transactions" | "cash-bank" | "internal-control" | "office-contributions" | "merge">(() => typeof window !== "undefined" ? routeFromHash() : "offline");

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <DashboardLayout>
      <Suspense fallback={<RouteLoader />}>{route === "merge" ? <BackupMerge /> : route === "authority" ? <OfflineAuthorityContracts /> : route === "rental" ? <OfflineRentalContracts /> : route === "active-documents" ? <OfflineActiveContractDocuments /> : route === "archive" ? <OfflineContractArchive /> : route === "performance" ? <OfflineConsultantPerformance /> : route === "my-contracts" ? <MyOfflineContracts /> : route === "my-contributions" ? <MyOfficeContributionSummary /> : route === "targets" ? <BrokerAnnualTargets /> : route === "requests" ? <CustomerRequests /> : route === "request-matches" ? <BrokerRequestMatches /> : route === "transactions" ? <OfflineTransactionClosings /> : route === "cash-bank" ? <OfflineCashBankControl /> : route === "internal-control" ? <OfflineInternalControl /> : route === "office-contributions" ? <OfflineOfficeContributionControl /> : <OfflineWorkspace />}</Suspense>
    </DashboardLayout>
  );
}

function Router() {
  if (isElectronDesktop()) return <DesktopRouter />;
  if (typeof window !== "undefined" && window.location.pathname === "/mobile") return <Suspense fallback={<RouteLoader />}><MobileCompanion /></Suspense>;

  return (
    <DashboardLayout>
      <Suspense fallback={<RouteLoader />}><Switch>
        <Route path="/" component={Home} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/authority-contracts" component={AuthorityContracts} />
        <Route path="/clients" component={Records} />
        <Route path="/properties" component={Records} />
        <Route path="/accounting" component={Records} />
        <Route path="/obligations" component={Obligations} />
        <Route path="/team" component={Team} />
        <Route path="/online-start" component={OnlineStart} />
        <Route path="/audit" component={Audit} />
        <Route path="/offline" component={OfflineWorkspace} />
        <Route path="/offline-archive" component={OfflineContractArchive} />
        <Route path="/offline-active-documents" component={OfflineActiveContractDocuments} />
        <Route path="/offline-merge" component={BackupMerge} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch></Suspense>
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
