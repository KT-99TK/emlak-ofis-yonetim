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
import { Archive, Banknote, CalendarClock, Cloud, FileSignature, FolderKanban, KeyRound, LayoutDashboard, LogOut, PanelLeft, ShieldCheck, Users, UserRound } from "lucide-react";
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { getUserId } from "@/lib/offlineStore";
import { isLocalManagerSessionActive } from "@/lib/offlineManagerAccess";
import { normalizeOfflineHash, offlineNavigationItems } from "@/lib/offlineNavigation";
import GlobalBrandLockup from "@/components/GlobalBrandLockup";
import LocalLoginGate from "@/components/LocalLoginGate";

// Menü sırası kullanım sıklığını takip eder: günlük açılan sayfalar en üstte,
// evrak/finans/ofis işleri kendi grubunda. Bkz. "Menü yapısı ve sayfa düzeni
// önerisi" prototipi (grup adları ve sıralama oradan alınmıştır).
const MENU_GROUP_ORDER = [
  "Günlük",
  "Portföy & Müşteri",
  "Sözleşmeler",
  "Finans",
  "Ofis",
] as const;

type MenuItem = {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  group: (typeof MENU_GROUP_ORDER)[number];
  managerOnly?: boolean;
};

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Genel Bakış", path: "/", group: "Günlük" },
  { icon: FolderKanban, label: "Portföy", path: "/properties", group: "Portföy & Müşteri" },
  { icon: UserRound, label: "Müşteriler", path: "/clients", group: "Portföy & Müşteri" },
  { icon: KeyRound, label: "Aktif Kiralamalar", path: "/active-rentals", group: "Portföy & Müşteri" },
  { icon: FileSignature, label: "Yetki Sözleşmeleri", path: "/authority-contracts", group: "Sözleşmeler" },
  { icon: FileSignature, label: "Kira Sözleşmeleri", path: "/contracts", group: "Sözleşmeler" },
  { icon: FileSignature, label: "Satış ve Kat Karşılığı Formları", path: "/contract-form-templates", group: "Sözleşmeler" },
  { icon: FileSignature, label: "Kat Karşılığı Danışmanlık Sözleşmesi", path: "/consultancy-agreements", group: "Sözleşmeler" },
  { icon: CalendarClock, label: "Kira & Vergi Vadeleri", path: "/obligations", group: "Finans" },
  { icon: Banknote, label: "Ön Muhasebe", path: "/accounting", group: "Finans" },
  { icon: Users, label: "Ekip Yönetimi", path: "/team", managerOnly: true, group: "Ofis" },
  { icon: Cloud, label: "Online Başlangıç", path: "/online-start", managerOnly: true, group: "Ofis" },
  { icon: ShieldCheck, label: "Denetim Kayıtları", path: "/audit", managerOnly: true, group: "Ofis" },
  { icon: Archive, label: "Proje Yedekleri", path: "/backups", managerOnly: true, group: "Ofis" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 360;

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

  if (!user && !isDesktop) return <LocalLoginGate />;

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
  const visibleOfflineMenuItems = offlineNavigationItems.filter((item) => !item.managerOnly || user?.role === "admin" || isLocalManagerSessionActive());
  const visibleMenuItems = isDesktop ? visibleOfflineMenuItems : menuItems.filter((item) => !item.managerOnly || user?.role === "admin");
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
          <SidebarHeader className="h-auto min-h-[116px] border-b border-[#24463c] bg-[#12302A] px-2 py-3">
            <div className="flex w-full items-center gap-2 transition-all">
              <button
                onClick={toggleSidebar}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-[#d7e9df] transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4622A] shrink-0"
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
                <div className="px-5 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78958b] group-data-[collapsible=icon]:sr-only">
                  Ofis Operasyonları
                </div>
                <SidebarMenu aria-label="Offline menü: Ortak Ofis Operasyonları" className="px-2 py-1">
                  {officeOfflineMenuItems.map(item => {
                    const isActive = currentOfflineHash === item.path;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() => window.location.hash = item.path.slice(1)}
                          tooltip={item.label}
                          className="group relative h-10 rounded-xl px-3 font-medium text-[#50665f] transition-colors duration-150 hover:bg-[#edf5f0] hover:text-[#12302A] focus-visible:ring-2 focus-visible:ring-[#D4622A] data-[active=true]:bg-[#12302A] data-[active=true]:text-white data-[active=true]:shadow-[0_8px_18px_rgba(23,62,57,.16)]"
                        >
                          <span aria-hidden="true" className={`absolute left-0 h-5 w-1 rounded-r-full transition-colors ${isActive ? "bg-[#D4622A]" : "bg-transparent group-hover:bg-[#b7d3c8]"}`} />
                          <item.icon className={`h-4 w-4 transition-colors ${isActive ? "text-[#D4622A]" : "text-[#729087] group-hover:text-[#2C6B55]"}`} />
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
                          className="group relative h-10 rounded-xl px-3 font-medium text-[#50665f] transition-colors duration-150 hover:bg-[#edf5f0] hover:text-[#12302A] focus-visible:ring-2 focus-visible:ring-[#D4622A] data-[active=true]:bg-[#12302A] data-[active=true]:text-white data-[active=true]:shadow-[0_8px_18px_rgba(23,62,57,.16)]"
                        >
                          <span aria-hidden="true" className={`absolute left-0 h-5 w-1 rounded-r-full transition-colors ${isActive ? "bg-[#D4622A]" : "bg-transparent group-hover:bg-[#b7d3c8]"}`} />
                          <item.icon className={`h-4 w-4 transition-colors ${isActive ? "text-[#D4622A]" : "text-[#729087] group-hover:text-[#2C6B55]"}`} />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </>
            ) : (
              <>
                {MENU_GROUP_ORDER.map(group => {
                  const groupItems = (visibleMenuItems as MenuItem[]).filter(item => item.group === group);
                  if (groupItems.length === 0) return null;
                  return (
                    <div key={group}>
                      <div className="px-5 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78958b] group-data-[collapsible=icon]:sr-only first:pt-2">
                        {group}
                      </div>
                      <SidebarMenu aria-label={`Menü: ${group}`} className="px-2 py-1">
                        {groupItems.map(item => {
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
                                className="group relative h-10 rounded-xl px-3 font-medium text-[#50665f] transition-colors duration-150 hover:bg-[#edf5f0] hover:text-[#12302A] focus-visible:ring-2 focus-visible:ring-[#D4622A] data-[active=true]:bg-[#12302A] data-[active=true]:text-white data-[active=true]:shadow-[0_8px_18px_rgba(23,62,57,.16)]"
                              >
                                <span aria-hidden="true" className={`absolute left-0 h-5 w-1 rounded-r-full transition-colors ${isActive ? "bg-[#D4622A]" : "bg-transparent group-hover:bg-[#b7d3c8]"}`} />
                                <item.icon
                                  className={`h-4 w-4 transition-colors ${isActive ? "text-[#D4622A]" : "text-[#729087] group-hover:text-[#2C6B55]"}`}
                                />
                                <span>{item.label}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </div>
                  );
                })}
              </>
            )}
          </SidebarContent>

          <SidebarFooter className={isDesktop ? "border-t border-[#d8e6df] bg-[#f5f9f6] p-3" : "p-3"}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-[#e5f0e9] group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
