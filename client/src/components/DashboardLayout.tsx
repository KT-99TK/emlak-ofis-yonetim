import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { Banknote, CalendarClock, FileSignature, FolderKanban, LayoutDashboard, LogOut, PanelLeft, ShieldCheck, Users, UserRound } from "lucide-react";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { getUserId } from "@/lib/offlineStore";
import { normalizeOfflineHash, offlineNavigationItems } from "@/lib/offlineNavigation";
import GlobalBrandLockup from "@/components/GlobalBrandLockup";

const menuItems = [
  { icon: LayoutDashboard, label: "Genel Bakış", path: "/" },
  { icon: FileSignature, label: "Yetki Sözleşmeleri", path: "/authority-contracts" },
  { icon: FileSignature, label: "Kira Sözleşmeleri", path: "/contracts" },
  { icon: UserRound, label: "Müşteriler", path: "/clients" },
  { icon: FolderKanban, label: "Portföy", path: "/properties" },
  { icon: Banknote, label: "Ön Muhasebe", path: "/accounting" },
  { icon: CalendarClock, label: "Kira & Vergi Vadeleri", path: "/obligations" },
  { icon: Users, label: "Ekip Yönetimi", path: "/team" },
  { icon: ShieldCheck, label: "Denetim Kayıtları", path: "/audit" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const isDesktop = typeof window !== "undefined" && (window.location.protocol === "file:" || Boolean((window as Window & { global1881Desktop?: { platform: string } }).global1881Desktop));
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading && !isDesktop) {
    return <DashboardLayoutSkeleton />
  }

  if (!user && !isDesktop) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Sign in to continue
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Access to this dashboard requires authentication. Continue to launch the login flow.
            </p>
          </div>
          <Button
            onClick={() => startLogin()}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const isDesktop = typeof window !== "undefined" && (window.location.protocol === "file:" || Boolean((window as Window & { global1881Desktop?: { platform: string } }).global1881Desktop));
  const offlineUserId = isDesktop ? getUserId() : "";
  const [location, setLocation] = useLocation();
  const [currentOfflineHash, setCurrentOfflineHash] = useState(() => normalizeOfflineHash(typeof window === "undefined" ? undefined : window.location.hash));
  const visibleOfflineMenuItems = offlineNavigationItems.filter((item) => !item.managerOnly || user?.role === "admin");
  const visibleMenuItems = isDesktop ? visibleOfflineMenuItems : menuItems;
  const officeOfflineMenuItems = visibleOfflineMenuItems.filter((item) => item.section === "office");
  const personalOfflineMenuItems = visibleOfflineMenuItems.filter((item) => item.section === "personal");
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = isDesktop
    ? offlineNavigationItems.find(item => item.path === currentOfflineHash)
    : menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const syncOfflineHash = () => setCurrentOfflineHash(normalizeOfflineHash(window.location.hash));
    window.addEventListener("hashchange", syncOfflineHash);
    return () => window.removeEventListener("hashchange", syncOfflineHash);
  }, []);
  useEffect(() => { const onOnline = () => setIsOnline(true); const onOffline = () => setIsOnline(false); window.addEventListener("online", onOnline); window.addEventListener("offline", onOffline); return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); }; }, []);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-auto min-h-[102px] border-b border-[#315f56] bg-[#173e39] px-2 py-3">
            <div className="flex w-full items-center gap-2 transition-all">
              <button
                onClick={toggleSidebar}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-[#d7e9df] transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e6c47d] shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              {!isCollapsed && <GlobalBrandLockup variant="offline-sidebar" />}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            {isDesktop ? (
              <>
                <SidebarMenu aria-label="Offline menü: Ortak Ofis Operasyonları" className="px-2 py-1">
                  {officeOfflineMenuItems.map(item => {
                    const isActive = currentOfflineHash === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => window.location.hash = item.path.slice(1)}
                          tooltip={item.label}
                          className="group relative h-10 rounded-xl px-3 font-medium text-[#50665f] transition-all hover:bg-[#edf5f0] hover:text-[#173e39] focus-visible:ring-2 focus-visible:ring-[#b99b5a] data-[active=true]:bg-[#173e39] data-[active=true]:text-white data-[active=true]:shadow-[0_8px_18px_rgba(23,62,57,.16)]"
                        >
                          <span aria-hidden="true" className={`absolute left-0 h-5 w-1 rounded-r-full transition-colors ${isActive ? "bg-[#e6c47d]" : "bg-transparent group-hover:bg-[#b7d3c8]"}`} />
                          <item.icon className={`h-4 w-4 transition-colors ${isActive ? "text-[#e6c47d]" : "text-[#729087] group-hover:text-[#2b786e]"}`} />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
                <div className="mx-4 mt-3 border-t border-[#d8e6df] pt-3 group-data-[collapsible=icon]:mx-2" />
                <div className="px-5 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78958b] group-data-[collapsible=icon]:sr-only">
                  Kişisel Çalışma Alanı
                </div>
                <SidebarMenu aria-label="Offline menü: Kişisel Çalışma Alanı" className="px-2 py-1">
                  {personalOfflineMenuItems.map(item => {
                    const isActive = currentOfflineHash === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => window.location.hash = item.path.slice(1)}
                          tooltip={item.label}
                          className="group relative h-10 rounded-xl px-3 font-medium text-[#50665f] transition-all hover:bg-[#edf5f0] hover:text-[#173e39] focus-visible:ring-2 focus-visible:ring-[#b99b5a] data-[active=true]:bg-[#173e39] data-[active=true]:text-white data-[active=true]:shadow-[0_8px_18px_rgba(23,62,57,.16)]"
                        >
                          <span aria-hidden="true" className={`absolute left-0 h-5 w-1 rounded-r-full transition-colors ${isActive ? "bg-[#e6c47d]" : "bg-transparent group-hover:bg-[#b7d3c8]"}`} />
                          <item.icon className={`h-4 w-4 transition-colors ${isActive ? "text-[#e6c47d]" : "text-[#729087] group-hover:text-[#2b786e]"}`} />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </>
            ) : (
              <SidebarMenu className="px-2 py-1">
                {visibleMenuItems.map(item => {
                const isActive = isDesktop ? currentOfflineHash === item.path : location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => {
                        if (isDesktop) window.location.hash = item.path.slice(1);
                        else setLocation(item.path);
                      }}
                      tooltip={item.label}
                      className="group relative h-10 rounded-xl px-3 font-medium text-[#50665f] transition-all hover:bg-[#edf5f0] hover:text-[#173e39] focus-visible:ring-2 focus-visible:ring-[#b99b5a] data-[active=true]:bg-[#173e39] data-[active=true]:text-white data-[active=true]:shadow-[0_8px_18px_rgba(23,62,57,.16)]"
                    >
                      <span aria-hidden="true" className={`absolute left-0 h-5 w-1 rounded-r-full transition-colors ${isActive ? "bg-[#e6c47d]" : "bg-transparent group-hover:bg-[#b7d3c8]"}`} />
                      <item.icon
                        className={`h-4 w-4 transition-colors ${isActive ? "text-[#e6c47d]" : "text-[#729087] group-hover:text-[#2b786e]"}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              </SidebarMenu>
            )}
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase() || offlineUserId.charAt(0).toUpperCase() || "O"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || offlineUserId || "Offline kullanıcı"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "Yerel çalışma alanı"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Oturumu kapat</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        {!isOnline && <div className="mx-4 mt-4 rounded-xl border border-[#ead6d0] bg-[#fff8f6] px-4 py-3 text-sm text-[#a85745]" role="alert"><strong>Merkezi server bağlantısı yok.</strong><p className="mt-1 text-xs">Yeni merkezi kayıt yazımı durduruldu. Bağlantı geldiğinde sayfayı yenileyin; offline veri girişi yalnızca Windows offline uygulamasında yapılabilir.</p><Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>Yeniden bağlanmayı dene</Button></div>}<main className="flex-1 p-3 md:p-5"><div className="workspace-content-frame">{children}</div></main>
      </SidebarInset>
    </>
  );
}
