import { LockKeyhole, RefreshCw, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import OfficeContributionControl from "@/components/OfficeContributionControl";
import OfflineOfficeFlowPanel from "@/components/OfflineOfficeFlowPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { configureLocalManagerPasscode, hasLocalManagerPasscode, isLocalManagerSessionActive, lockLocalManagerAccess, unlockLocalManagerAccess } from "@/lib/offlineManagerAccess";
import { currentInternalControlSettings } from "@/lib/internalControl";
import { getUserId, listOfflineRecords, type OfflineRecord } from "@/lib/offlineStore";

const currentYear = () => String(new Date().getFullYear());
const currentMonth = () => new Date().getMonth() + 1;

export default function OfflineOfficeContributionControl() {
  const { user } = useAuth();
  const [records, setRecords] = useState<OfflineRecord[]>([]);
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [message, setMessage] = useState("");
  const [localManagerConfigured, setLocalManagerConfigured] = useState(false);
  const [localManagerUnlocked, setLocalManagerUnlocked] = useState(false);
  const [managerPasscode, setManagerPasscode] = useState("");
  const [managerPasscodeRepeat, setManagerPasscodeRepeat] = useState("");
  const [managerWorking, setManagerWorking] = useState(false);
  const userId = getUserId();
  const serverManager = user?.role === "admin";
  const isOfflineDesktop = typeof window !== "undefined" && window.location.protocol === "file:";
  const needsLocalManagerAccess = isOfflineDesktop && !serverManager;
  const isManager = serverManager || (needsLocalManagerAccess && localManagerUnlocked);
  const refresh = async () => setRecords(await listOfflineRecords());
  useEffect(() => { void refresh(); setLocalManagerConfigured(hasLocalManagerPasscode()); setLocalManagerUnlocked(isLocalManagerSessionActive()); }, []);
  const submitLocalManagerAccess = async () => { setManagerWorking(true); try { if (!localManagerConfigured) { if (managerPasscode !== managerPasscodeRepeat) throw new Error("Parola tekrarını aynı girin."); await configureLocalManagerPasscode(managerPasscode, user?.name || userId || "broker-manager"); setLocalManagerConfigured(true); } else await unlockLocalManagerAccess(managerPasscode); setLocalManagerUnlocked(true); setManagerPasscode(""); setManagerPasscodeRepeat(""); setMessage("Yerel broker manager yetkisi açıldı."); } catch (error) { setMessage(error instanceof Error ? error.message : "Yerel yönetici doğrulaması tamamlanamadı."); } finally { setManagerWorking(false); } };

  if (!isManager) return <div className="offline-page-surface min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9"><Card className="mx-auto max-w-2xl rounded-2xl border-[#d8e4df] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl text-[#223230]"><LockKeyhole className="h-6 w-6 text-[#a17b43]" /> Ofis Payı ve Danışman Katkısı</CardTitle><p className="text-sm text-[#60706b]">Bu iç denetim ekranı yalnız broker manager içindir. Danışman–ofis paylaşımı ve KDV referansı resmî muhasebe kaydı değildir.</p></CardHeader><CardContent className="space-y-4">{message && <p role="status" className="rounded-lg bg-[#fff8ed] px-3 py-2 text-sm text-[#8d6f3f]">{message}</p>}{needsLocalManagerAccess && <div className="space-y-3 rounded-xl bg-[#f7faf7] p-4"><p className="text-sm font-semibold text-[#34433f]">Yerel broker manager doğrulaması</p><Input type="password" value={managerPasscode} onChange={(event) => setManagerPasscode(event.target.value)} placeholder={localManagerConfigured ? "Yerel yönetici parolası" : "Yeni yerel yönetici parolası"} />{!localManagerConfigured && <Input type="password" value={managerPasscodeRepeat} onChange={(event) => setManagerPasscodeRepeat(event.target.value)} placeholder="Parolayı tekrar girin" />}<Button onClick={() => void submitLocalManagerAccess()} disabled={managerWorking}>{localManagerConfigured ? "Yetkiyi aç" : "Manager laptopunu kur"}</Button></div>}</CardContent></Card></div>;

  return <div className="offline-page-surface min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9"><header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]"><WalletCards className="h-3.5 w-3.5" /> Broker manager · resmî olmayan iç denetim</p><h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Ofis Payı ve Danışman Katkısı</h1><p className="mt-2 max-w-4xl text-sm text-[#70807c]">KDV hariç hizmet bedelinde varsayılan %60 danışman / %40 ofis payını; sistem içi tahsilat, sistem dışı nakit bildirimi, ofis kasası aktarımı ve KDV referansından ayrı izler.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => void refresh()} className="rounded-xl bg-white"><RefreshCw className="mr-2 h-4 w-4" /> Yenile</Button>{needsLocalManagerAccess && <Button variant="outline" onClick={() => { lockLocalManagerAccess(); setLocalManagerUnlocked(false); setMessage("Yerel broker manager oturumu kilitlendi."); }} className="rounded-xl bg-white">Kilitle</Button>}</div></header>{message && <p role="status" className="mb-5 rounded-xl border border-[#dbe8df] bg-[#f4fbf6] px-4 py-3 text-sm text-[#287052]">{message}</p>}<div className="mb-6 grid gap-3 md:grid-cols-[1fr_180px]"><Input value={year} onChange={(event) => setYear(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="Yıl" /><Input type="number" min="1" max="12" value={month} onChange={(event) => setMonth(Math.min(12, Math.max(1, Number(event.target.value) || 1)))} /></div><div className="offline-operation-grid"><div className="offline-operation-main"><OfficeContributionControl records={records} userId={userId} settings={currentInternalControlSettings(records)} year={year} month={month} onRefresh={refresh} /></div><OfflineOfficeFlowPanel className="offline-operation-aside" records={records} userId={userId} managerActive={isManager} /></div></div>;
}
