import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardFlowGrid } from "@/components/DashboardFlowGrid";
import { OfficeFlowPanel } from "@/components/OfficeFlowPanel";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowUpRight, Banknote, CalendarClock, CheckCircle2, ChevronRight, CircleDollarSign, FileSignature, FolderKanban, Plus, ShieldCheck, Sparkles, Users, WalletCards } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { DASHBOARD_GREETING, formatDashboardDate } from "@/lib/dashboardGreeting";
import { noticePreferenceKey } from "@/lib/noticePreferences";
import { selectCriticalDashboardFlowObligations, shouldShowDashboardFlowPopup } from "@/lib/dashboardFlowAlerts";
import { formatTurkishDate } from "@/lib/turkishDate";

const activity = [
  { title: "Kira sözleşmesi incelemeye gönderildi", meta: "KRS-2026-014 · Urla / İzmir", tone: "gold" },
  { title: "Satış yetki sözleşmesi imzalandı", meta: "YTS-2026-008 · 1881 Portföy", tone: "green" },
  { title: "Tahsilat planı güncellendi", meta: "SLS-2026-021 · 425.000 ₺", tone: "blue" },
];

const modules = [
  { icon: FileSignature, label: "Sözleşme oluştur", detail: "Kira, satış veya yetki", path: "/contracts", accent: "bg-[#e8dfcc] text-[#8d6f3f]" },
  { icon: Users, label: "Müşteri ekle", detail: "Tek kayıttan tüm bağlantılar", path: "/clients", accent: "bg-[#dce8e4] text-[#1c675c]" },
  { icon: FolderKanban, label: "Portföy oluştur", detail: "Mülk ve yetki bilgileri", path: "/properties", accent: "bg-[#e3e2ef] text-[#4d4b7e]" },
  { icon: Banknote, label: "Finans hareketi", detail: "Gelir, gider, tahsilat", path: "/accounting", accent: "bg-[#efe0dc] text-[#a85745]" },
];

function formatRole(role?: string) {
  return role === "admin" ? "Broker Manager" : "Consultant";
}

export default function Home() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [showCriticalFlowPopup, setShowCriticalFlowPopup] = useState(false);
  const isDashboard = location === "/";
  const summaryQuery = trpc.dashboard.summary.useQuery(undefined, { retry: false });
  const obligationsQuery = trpc.obligations.list.useQuery(undefined, { retry: false });
  const contractsQuery = trpc.contracts.list.useQuery(undefined, { retry: false });
  const ledgerQuery = trpc.ledger.list.useQuery(undefined, { retry: false });
  const openObligations = obligationsQuery.data?.filter((item) => item.status !== "paid" && item.status !== "cancelled") ?? [];
  const dueObligations = openObligations.slice(0, 3);
  const criticalFlowObligations = useMemo(() => selectCriticalDashboardFlowObligations(openObligations), [openObligations]);
  const preferenceUserId = user?.openId || user?.email || "anonymous";
  useEffect(() => {
    const popupEnabled = typeof window === "undefined" || window.localStorage.getItem(noticePreferenceKey(preferenceUserId, "popup")) !== "false";
    setShowCriticalFlowPopup(shouldShowDashboardFlowPopup({ isConsultant: user?.role !== "admin", popupEnabled, criticalCount: criticalFlowObligations.length }));
  }, [criticalFlowObligations.length, preferenceUserId, user?.role]);
  const summary = summaryQuery.data;
  const dashboardDate = formatDashboardDate();
  const liveStats = summary ? [
    { label: "Aktif sözleşmeler", value: String(summary.contracts), note: "Merkezi kayıt", icon: FileSignature, color: "text-[#2b786e]" },
    { label: "Açık portföy", value: String(summary.portfolio), note: "Merkezi kayıt", icon: FolderKanban, color: "text-[#8d6f3f]" },
    { label: "Bekleyen tahsilat", value: `₺ ${Number(summary.outstanding).toLocaleString("tr-TR")}`, note: "Açık bakiye", icon: WalletCards, color: "text-[#a85745]" },
    { label: "Ekip görünümü", value: String(summary.activeTeam), note: "Aktif kullanıcı", icon: Users, color: "text-[#4d4b7e]" },
  ] : [
    { label: "Aktif sözleşmeler", value: "24", note: "Örnek görünüm", icon: FileSignature, color: "text-[#2b786e]" },
    { label: "Açık portföy", value: "68", note: "Örnek görünüm", icon: FolderKanban, color: "text-[#8d6f3f]" },
    { label: "Bekleyen tahsilat", value: "₺ 184.500", note: "Örnek görünüm", icon: WalletCards, color: "text-[#a85745]" },
    { label: "Ekip görünümü", value: "20 / 20", note: "Örnek görünüm", icon: Users, color: "text-[#4d4b7e]" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#1d2928]">
      <div className="mx-auto max-w-[1440px] px-5 py-7 md:px-10 md:py-9">
        <header className="mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]"><span className="h-2 w-2 rounded-full bg-[#bd975d]" /> Global 1881 Gayrimenkul</div>
            <h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230] md:text-5xl">{isDashboard ? dashboardDate : "Ofis çalışma alanı"}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#70807c]">{isDashboard ? DASHBOARD_GREETING : "Sözleşmeden tahsilata, ofisinizin kritik işlerini tek ve güvenli bir merkezden yönetin."}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-[#d8ddd8] bg-white/70 px-3 py-2 text-[11px] font-medium text-[#64716e]"><ShieldCheck className="mr-2 h-3.5 w-3.5 text-[#2b786e]" /> Güvenli çalışma alanı</Badge>
            <Button onClick={() => setLocation("/contracts")} className="h-10 rounded-xl bg-[#173e39] px-4 text-xs font-semibold shadow-[0_8px_20px_rgba(23,62,57,.16)] hover:bg-[#20554e]"><Plus className="mr-2 h-4 w-4" /> Yeni kayıt</Button>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {liveStats.map((stat) => <Card key={stat.label} className="rounded-2xl border-[#e5e8e3] bg-white/80 shadow-[0_10px_30px_rgba(26,46,42,.04)]">
            <CardContent className="p-5"><div className="mb-5 flex items-center justify-between"><span className="text-xs font-medium text-[#7a8783]">{stat.label}</span><stat.icon className={`h-4 w-4 ${stat.color}`} /></div><div className="flex items-end justify-between"><strong className="font-serif text-3xl font-medium tracking-[-0.04em] text-[#20312e]">{stat.value}</strong><span className="text-[10px] font-medium text-[#7a8783]">{stat.note}</span></div></CardContent>
          </Card>)}
        </section>

        {summaryQuery.isLoading && <div className="mb-4 rounded-xl border border-[#e7dfc9] bg-[#fffaf0] px-4 py-3 text-xs text-[#8d6f3f]" role="status">Merkezi ofis verileri yükleniyor…</div>}
        {summaryQuery.isError && <div className="mb-4 rounded-xl border border-[#ead6d0] bg-[#fff8f6] px-4 py-3 text-xs text-[#a85745]" role="alert">Merkezi veri bağlantısı şu anda kullanılamıyor. Örnek görünüm gösteriliyor; işlemler kaydedilmeden önce bağlantıyı kontrol edin.</div>}
        {!summaryQuery.isLoading && !summaryQuery.isError && summary && summary.contracts === 0 && summary.portfolio === 0 && <div className="mb-4 rounded-xl border border-[#dce8e4] bg-[#f5fbf8] px-4 py-3 text-xs text-[#2b786e]">Henüz merkezi kayıt yok. Hızlı işlemlerden ilk müşteri, portföy veya sözleşmenizi oluşturabilirsiniz.</div>}
        {obligationsQuery.isLoading && <div className="mb-4 rounded-xl border border-[#e7dfc9] bg-[#fffaf0] px-4 py-3 text-xs text-[#8d6f3f]" role="status">Kira ve vergi vadeleri kontrol ediliyor…</div>}
        {!obligationsQuery.isLoading && !obligationsQuery.isError && dueObligations.length > 0 && <div className="mb-4 rounded-xl border border-[#ead6d0] bg-[#fff8f6] px-4 py-3 text-xs text-[#a85745]" role="alert"><strong>Vade uyarısı:</strong> {dueObligations.map((item) => `${item.title} · ${formatTurkishDate(item.dueDate)}`).join("  |  ")} — tarih yaklaşan kira/vergi işlemlerini kontrol edin.</div>}

        {location === "/team" && user?.role === "admin" && <Card className="mb-6 rounded-2xl border-[#e5e8e3] bg-white/80 shadow-[0_10px_30px_rgba(26,46,42,.04)]"><CardHeader className="p-6 pb-3"><CardTitle className="font-serif text-xl font-medium">Ekip performans özeti</CardTitle><p className="mt-1 text-xs text-[#85918d]">Danışman bazında sözleşme, tahsilat, ödeme ve net nakit akışı</p></CardHeader><CardContent className="p-6 pt-2"><div className="grid grid-cols-[1.3fr_.7fr_.7fr_.8fr_.8fr] gap-3 border-b border-[#edf0ec] px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#96a09c]"><span>Danışman / ekip</span><span>Sözleşme</span><span>Tahsilat</span><span>Ödeme</span><span>Net akış</span></div><div className="divide-y divide-[#edf0ec]">{summary?.teamBreakdown?.length ? summary.teamBreakdown.map((member) => <div key={member.userId} className="grid grid-cols-[1.3fr_.7fr_.7fr_.8fr_.8fr] items-center gap-3 px-3 py-4 text-xs"><span><strong className="block font-semibold text-[#34433f]">Kullanıcı #{member.userId}</strong><small className="mt-1 block text-[10px] text-[#87938f]">{member.teamName}</small></span><span className="text-[#34433f]">{member.contracts}</span><span className="text-[#2b786e]">₺ {member.collections.toLocaleString("tr-TR")}</span><span className="text-[#a85745]">₺ {member.payments.toLocaleString("tr-TR")}</span><span className="font-semibold text-[#173e39]">₺ {member.netCashFlow.toLocaleString("tr-TR")}</span></div>) : <div className="rounded-xl bg-[#f7f7f4] px-4 py-8 text-center text-xs text-[#87938f]">Henüz aktif ekip kaydı bulunmuyor.</div>}</div></CardContent></Card>}

        <DashboardFlowGrid primary={<Card className="overflow-hidden rounded-2xl border-[#e5e8e3] bg-[#173e39] text-white shadow-[0_16px_38px_rgba(23,62,57,.15)]">
            <CardContent className="relative p-7 md:p-9"><div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" /><div className="absolute -right-10 -top-14 h-44 w-44 rounded-full border border-[#bd975d]/25" />
              <div className="relative max-w-lg"><div className="mb-8 flex items-center justify-between"><div><p className="text-[11px] uppercase tracking-[0.22em] text-[#cdb889]">Broker manager görünümü</p><p className="mt-2 text-sm text-[#c8d5d0]">Hoş geldiniz, {user?.name || "Ofis yöneticisi"}</p></div><Sparkles className="h-5 w-5 text-[#d6ba7b]" /></div><h2 className="font-serif text-3xl leading-tight tracking-[-0.04em] md:text-4xl">Veriyi değil, <em className="text-[#d6ba7b]">akışı</em> yönetin.</h2><p className="mt-4 max-w-md text-sm leading-6 text-[#b4c8c2]">{formatRole(user?.role)} hesabınızla ekip görünürlüğü, sözleşme onayları ve nakit akışını tek bakışta takip edin.</p><div className="mt-8 flex flex-wrap gap-3"><Button onClick={() => setLocation("/team")} className="rounded-xl bg-[#d6ba7b] px-4 text-xs font-bold text-[#173e39] hover:bg-[#e5ce98]">Ekip özetine git <ArrowUpRight className="ml-2 h-4 w-4" /></Button><Button variant="outline" onClick={() => setLocation("/audit")} className="rounded-xl border-white/20 bg-transparent px-4 text-xs text-white hover:bg-white/10 hover:text-white">Audit kayıtları</Button></div></div>
            </CardContent>
          </Card>} aside={<OfficeFlowPanel role={user?.role} obligations={openObligations} contracts={contractsQuery.data ?? []} ledgerEntries={ledgerQuery.data ?? []} onOpenObligations={() => setLocation("/obligations")} onOpenContracts={() => setLocation("/contracts")} onOpenAccounting={() => setLocation("/accounting")} />} />

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-2xl border-[#e5e8e3] bg-white/80 shadow-[0_10px_30px_rgba(26,46,42,.04)]"><CardHeader className="p-6 pb-3"><div className="flex items-center justify-between"><div><CardTitle className="font-serif text-xl font-medium">Hızlı işlemler</CardTitle><p className="mt-1 text-xs text-[#85918d]">Örnek paketten uyarlanan temel akışlar</p></div><CircleDollarSign className="h-5 w-5 text-[#a17b43]" /></div></CardHeader><CardContent className="grid gap-2 p-6 pt-2 sm:grid-cols-2">{modules.map((module) => <button key={module.label} onClick={() => setLocation(module.path)} className="group flex items-center gap-3 rounded-xl border border-[#edf0ec] p-3 text-left transition-all hover:-translate-y-0.5 hover:border-[#d9dfd9] hover:bg-[#fbfcfa]"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${module.accent}`}><module.icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-[#34433f]">{module.label}</span><span className="mt-1 block truncate text-[10px] text-[#87938f]">{module.detail}</span></span><ChevronRight className="h-4 w-4 text-[#bac2be] transition-transform group-hover:translate-x-1" /></button>)}</CardContent></Card>

          <Card className="rounded-2xl border-[#e5e8e3] bg-white/80 shadow-[0_10px_30px_rgba(26,46,42,.04)]"><CardHeader className="p-6 pb-3"><div className="flex items-center justify-between"><div><CardTitle className="font-serif text-xl font-medium">Son hareketler</CardTitle><p className="mt-1 text-xs text-[#85918d]">Kritik işlemler ve kayıt akışı</p></div><Button variant="ghost" onClick={() => setLocation("/audit")} className="text-xs text-[#3e716b] hover:bg-[#edf4f1]">Tümünü gör</Button></div></CardHeader><CardContent className="p-6 pt-2"><div className="space-y-1">{activity.map((item) => <div key={item.title} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#fbfcfa]"><span className={`h-2 w-2 rounded-full ${item.tone === "gold" ? "bg-[#bd975d]" : item.tone === "green" ? "bg-[#2b786e]" : "bg-[#7c83b0]"}`} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#34433f]">{item.title}</p><p className="mt-1 truncate text-[10px] text-[#87938f]">{item.meta}</p></div><CheckCircle2 className="h-4 w-4 text-[#abc4bb]" /></div>)}</div></CardContent></Card></section>

        <footer className="mt-8 flex flex-col gap-2 border-t border-[#e5e8e3] pt-5 text-[10px] text-[#9aa6a1] sm:flex-row sm:items-center sm:justify-between"><span>Global 1881 Gayrimenkul · Ofis yönetim sistemi</span><span>Rol: {formatRole(user?.role)} · Yetki kayıtları aktif</span></footer>
      </div>
      <Dialog open={showCriticalFlowPopup} onOpenChange={setShowCriticalFlowPopup}>
        <DialogContent className="max-w-md overflow-hidden border-[#a8ccc2] bg-[#f7fbf9] p-0 shadow-[0_24px_64px_rgba(15,71,63,.25)]">
          <div className="bg-[#0f473f] px-6 py-5 text-white"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b8dcd3]"><CalendarClock className="h-3.5 w-3.5 text-[#e6c47d]" /> Kişisel takip uyarısı</div><DialogHeader className="mt-2"><DialogTitle className="font-serif text-2xl font-medium text-white">Dikkat gerektiren vade var</DialogTitle><DialogDescription className="text-sm leading-5 text-[#c7ddd7]">Bu bildirim yalnız size atanmış sözleşme ve portföy kayıtlarından üretilir.</DialogDescription></DialogHeader></div>
          <div className="space-y-2 px-6 py-5">{criticalFlowObligations.slice(0, 3).map((item) => <div key={item.id} className="rounded-xl border border-[#dce8e4] bg-white px-3 py-3"><p className="text-xs font-semibold text-[#24413b]">{item.title}</p><p className="mt-1 text-[11px] text-[#6a7e77]">Son tarih: {formatTurkishDate(item.dueDate)}</p></div>)}{criticalFlowObligations.length > 3 && <p className="text-xs text-[#6a7e77]">Ek olarak {criticalFlowObligations.length - 3} kritik kayıt daha bulunuyor.</p>}</div>
          <DialogFooter className="flex-row justify-end gap-2 border-t border-[#dce8e4] bg-white px-6 py-4"><Button variant="ghost" onClick={() => setShowCriticalFlowPopup(false)} className="text-xs text-[#5d716b]">Daha sonra</Button><Button onClick={() => { setShowCriticalFlowPopup(false); setLocation("/obligations"); }} className="rounded-xl bg-[#0f473f] text-xs hover:bg-[#1c6559]">Vadeleri incele <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" /></Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
