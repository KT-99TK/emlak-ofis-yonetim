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
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { getUserId } from "@/lib/offlineStore";
import { normalizeOfflineHash, offlineNavigationItems } from "@/lib/offlineNavigation";

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
  const currentOfflineHash = normalizeOfflineHash(typeof window === "undefined" ? undefined : window.location.hash);
  const visibleMenuItems = isDesktop ? offlineNavigationItems.filter((item) => !item.managerOnly || user?.role === "admin") : menuItems;
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = isDesktop
    ? offlineNavigationItems.find(item => item.path === currentOfflineHash)
    : menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" ? true : navigator.onLine);
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
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? isDesktop ? (
                <div className="flex min-w-0 items-center gap-2.5" aria-label="Global 1881 Gayrimenkul">
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-full border-2 border-double border-[#a6946e]/65 bg-[#fbfaf5] text-[#8d7a52] opacity-90">
                    <span className="text-[5px] font-bold leading-none tracking-[0.12em]">GLOBAL</span>
                    <strong className="my-0.5 font-serif text-[13px] font-semibold leading-none tracking-[0.04em]">1881</strong>
                    <span className="text-[4px] font-bold leading-none tracking-[0.08em]">GAYRİMENKUL</span>
                  </div>
                  <div className="min-w-0 leading-none">
                    <p className="truncate font-serif text-sm font-semibold tracking-[0.08em] text-[#223230]">GLOBAL 1881</p>
                    <p className="mt-1 truncate text-[9px] uppercase tracking-[0.15em] text-[#8d6f3f]">Gayrimenkul</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <img src="/manus-storage/01_logo_yatay_6b31c4b8.webp" alt="Global 1881 Gayrimenkul" className="h-9 w-auto max-w-[190px] object-contain object-left" />
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
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
                      className={`h-10 transition-all font-normal`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
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
        {!isOnline && <div className="mx-4 mt-4 rounded-xl border border-[#ead6d0] bg-[#fff8f6] px-4 py-3 text-sm text-[#a85745]" role="alert"><strong>Merkezi server bağlantısı yok.</strong><p className="mt-1 text-xs">Yeni merkezi kayıt yazımı durduruldu. Bağlantı geldiğinde sayfayı yenileyin; offline veri girişi yalnızca Windows offline uygulamasında yapılabilir.</p><Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>Yeniden bağlanmayı dene</Button></div>}<main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
