import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, HardDrive, Import, Plus, RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import {
  applyOfflineRecords,
  applyWithRollback,
  createRollbackSnapshot,
  downloadCurrentBackup,
  restoreRollbackSnapshot,
  exportOfflineBackup,
  getDeviceId,
  getUserId,
  listOfflineRecords,
  mergeOfflineBackups,
  saveOfflineRecord,
  setUserId,
  type BackupMergeResult,
  type OfflineRecord,
} from "@/lib/offlineStore";
import { isUpcomingEvacuation } from "@/lib/offlineReports";
import ManifestPreviewRow from "@/components/ManifestPreviewRow";
import { URLA_NEIGHBORHOODS, titleCaseTurkish } from "@/lib/urlaNeighborhoods";
import { presentOfflineRecord } from "@/lib/offlineRecordPresentation";
import { assignOfflineAccessRole, assignOfflineAssistantScope, canViewFullOfflineContract, getOfflineAccessRole, getOfflineAssistantAssignedUserIds, maskUnauthorizedOfficeRecord, type OfflineAccessRole } from "@/lib/offlineContractAccess";
import { isLocalManagerSessionActive } from "@/lib/offlineManagerAccess";
import { getOfflineProfileGreeting, setOfflineProfileGreeting } from "@/lib/offlineProfile";
import { formatTurkishDate, formatTurkishDateTime } from "@/lib/turkishDate";
import OfflineOfficeFlowPanel from "@/components/OfflineOfficeFlowPanel";

const displayRecordDate = (value?: string) => value ? formatTurkishDate(value) : "—";

export default function OfflineWorkspace() {
  const isDesktop = typeof window !== "undefined" && (window.location.protocol === "file:" || Boolean((window as Window & { global1881Desktop?: { platform: string } }).global1881Desktop));
  const [records, setRecords] = useState<OfflineRecord[]>([]);
  const [reportFilter, setReportFilter] = useState<"all" | "evacuation" | "evacuationUpcoming" | "ownerApproval">("all");
  const [restoreResult, setRestoreResult] = useState<BackupMergeResult | null>(null);
  const [userId, setUserIdState] = useState(() => getUserId());
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [noticeDays, setNoticeDays] = useState("60");
  const [approvalDecision, setApprovalDecision] = useState<OfflineRecord["approvalDecision"]>("pending");
  const [approvalNote, setApprovalNote] = useState("");
  const [obligationType, setObligationType] = useState<OfflineRecord["obligationType"]>("rent");
  const [ledgerType, setLedgerType] = useState<OfflineRecord["ledgerType"]>("income");
  const [entity, setEntity] = useState<OfflineRecord["entity"]>("client");
  const [message, setMessage] = useState("");
  const [backupPassword, setBackupPassword] = useState("");
  const [accessRole, setAccessRole] = useState<OfflineAccessRole>(() => getOfflineAccessRole());
  const [assistantScopeInput, setAssistantScopeInput] = useState(() => getOfflineAssistantAssignedUserIds().join(", "));
  const [profileGreeting, setProfileGreeting] = useState(() => getOfflineProfileGreeting());

  const managerSessionActive = isLocalManagerSessionActive();
  const assistantAssignedUserIds = getOfflineAssistantAssignedUserIds();
  const contractAccess = { userId, role: accessRole, managerSessionActive, assistantAssignedUserIds } as const;

  const authorizedRecords = records.filter((record) => canViewFullOfflineContract(record, contractAccess));
  const visibleRecords = authorizedRecords.filter((record) => reportFilter === "all" ? true : reportFilter === "evacuationUpcoming" ? isUpcomingEvacuation(record) : record.entity === reportFilter);
  const presentedVisibleRecords = visibleRecords.map((record) => maskUnauthorizedOfficeRecord(record, contractAccess));
  const upcomingEvacuations = authorizedRecords.filter(isUpcomingEvacuation).sort((a, b) => new Date(a.noticeDate ?? a.dueDate ?? 0).getTime() - new Date(b.noticeDate ?? b.dueDate ?? 0).getTime());
  const evacuationCount = authorizedRecords.filter((record) => record.entity === "evacuation").length;
  const pendingApprovalCount = authorizedRecords.filter((record) => record.entity === "ownerApproval" && record.approvalDecision === "pending").length;
  const approvedCount = authorizedRecords.filter((record) => record.entity === "ownerApproval" && record.approvalDecision === "approved").length;

  const refresh = async () => setRecords((await listOfflineRecords()).map((record) => ({ ...record, details: presentOfflineRecord(record).summary })));

  useEffect(() => { if (isDesktop) void refresh(); }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop || entity !== "property") return;
    const field = document.querySelector<HTMLInputElement>('input[placeholder="Kısa açıklama"]');
    if (!field) return;

    const datalistId = "offline-property-neighborhoods";
    const list = document.createElement("datalist");
    list.id = datalistId;
    URLA_NEIGHBORHOODS.forEach((neighborhood) => {
      const option = document.createElement("option");
      option.value = neighborhood;
      list.appendChild(option);
    });

    field.placeholder = "Portföy mahallesi / yerleşimi";
    field.setAttribute("aria-label", "Portföy mahallesi veya yerleşimi");
    field.setAttribute("list", datalistId);
    document.body.appendChild(list);
    const normalizeLocation = () => setDetails((value) => titleCaseTurkish(value));
    field.addEventListener("blur", normalizeLocation);

    return () => {
      field.removeEventListener("blur", normalizeLocation);
      field.removeAttribute("list");
      field.removeAttribute("aria-label");
      field.placeholder = "Kısa açıklama";
      list.remove();
    };
  }, [entity, isDesktop]);

  if (!isDesktop) {
    return <div className="min-h-screen bg-[#f7f7f4] px-6 py-12"><Card className="mx-auto max-w-xl rounded-2xl border-[#e7dfc9] bg-[#fffaf0]"><CardHeader><CardTitle className="font-serif text-2xl">Merkezi web çalışma alanı</CardTitle></CardHeader><CardContent><p className="text-sm leading-6 text-[#70807c]">Bu merkezi HTTPS kısayolu yerel veri yazmaz. Offline kayıt, tahliye/onay formları ve IndexedDB yalnızca imzalı Windows offline uygulaması içinde kullanılabilir.</p><p className="mt-3 text-xs text-[#8d6f3f]">Merkezi kayıtlar için Genel Bakış, Sözleşmeler, Portföy ve Kira & Vergi Vadeleri ekranlarını kullanın.</p></CardContent></Card></div>;
  }

  const add = async () => {
    if (!userId.trim()) { setMessage("Önce offline kullanıcı kimliğini kaydedin."); return; }
    if (!title.trim()) return;
    await saveOfflineRecord({
      entity,
      title: title.trim(),
      details: details.trim(),
      amount: amount.trim() || undefined,
      dueDate: dueDate || undefined,
      noticeDate: entity === "evacuation" ? dueDate || undefined : undefined,
      noticeDays: entity === "evacuation" ? Number(noticeDays) || 60 : undefined,
      approvalDecision: entity === "ownerApproval" ? approvalDecision : undefined,
      approvalNote: entity === "ownerApproval" ? approvalNote.trim() || undefined : undefined,
      obligationType: entity === "obligation" ? obligationType : undefined,
      ledgerType: entity === "ledger" ? ledgerType : undefined,
      status: entity === "ownerApproval" ? approvalDecision === "approved" ? "approved" : "approvalPending" : "draft",
    });
    setTitle(""); setDetails(""); setAmount(""); setDueDate(""); setApprovalNote("");
    setMessage("Kayıt bu laptopun yerel veritabanına yazıldı.");
    await refresh();
  };

  const saveUser = () => {
    if (!userId.trim()) return;
    setUserId(userId);
    setUserIdState(userId.trim());
    setMessage("Offline kullanıcı kimliği bu cihaza kaydedildi.");
  };

  const updateAccessRole = (role: OfflineAccessRole) => {
    try {
      assignOfflineAccessRole(role, managerSessionActive);
      setAccessRole(role);
      setMessage(role === "officeAssistant" ? "Bu cihaz ofis asistanı rolüne alındı. Yalnız managerın atadığı danışman kapsamındaki sözleşme ve malik bilgileri görünürdür." : "Bu cihaz danışman rolüne alındı. Yalnız kendi sözleşmeleriniz ve maskeli ofis özetleri görünürdür.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Cihaz erişim rolü değiştirilemedi.");
    }
  };

  const saveProfileGreeting = () => {
    setOfflineProfileGreeting(profileGreeting);
    setProfileGreeting(getOfflineProfileGreeting());
    setMessage(profileGreeting.trim() ? "Size Özel Gündem için cihazınıza ait hitap kaydedildi." : "Size Özel Gündem hitabı kaldırıldı; varsayılan başlık kullanılır.");
  };

  const saveAssistantScope = () => {
    try {
      const assigned = assignOfflineAssistantScope(assistantScopeInput.split(/[,;\n]/), managerSessionActive);
      setAssistantScopeInput(assigned.join(", "));
      setMessage(assigned.length ? `Ofis asistanı kapsamı ${assigned.length} danışman kullanıcı kodu için kaydedildi.` : "Ofis asistanı kapsamı boşaltıldı; bu cihazda başka danışman sözleşmesi görünmez.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ofis asistanı kapsamı kaydedilemedi.");
    }
  };

  const backup = async () => {
    try {
      const blob = await exportOfflineBackup(backupPassword);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `global1881-${userId}-${getDeviceId().slice(-8)}-sifreli-yedek-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("AES-GCM ile şifrelenmiş, checksum ve ECDSA imzalı yedek oluşturuldu.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Yedek oluşturulamadı.");
    }
  };

  const restore = async (file?: File) => {
    if (!file) return;
    try {
      setRestoreResult(await mergeOfflineBackups([file], backupPassword));
      setMessage("Şifreli yedek açıldı ve doğrulandı; kayıt yazmadan önce manifesti ve çakışmaları kontrol edin.");
    } catch (error) {
      setRestoreResult(null);
      setMessage(error instanceof Error ? error.message : "Yedek dosyası geçersiz veya parola hatalı.");
    }
  };

  const applyRestore = async () => {
    if (!restoreResult || restoreResult.invalid.length || restoreResult.conflicts.length || !userId.trim()) return;
    const outcome = await applyWithRollback({
      createSnapshot: createRollbackSnapshot,
      applyRecords: () => applyOfflineRecords(restoreResult.pendingRecords),
      createBackup: () => downloadCurrentBackup(`global1881-geri-yukleme-${new Date().toISOString().slice(0, 10)}.json`, backupPassword),
      restoreSnapshot: restoreRollbackSnapshot,
    });
    if (outcome.success) {
      setMessage("Onaylanan yedek kayıtları yazıldı; rollback noktası ve yeni şifreli ana yedek oluşturuldu.");
      setRestoreResult(null);
      await refresh();
    } else if (outcome.rollbackApplied) {
      setMessage("Geri yükleme tamamlanamadı; kayıtlar önceki güvenli rollback noktasına döndürüldü.");
    } else if ("rollbackError" in outcome && outcome.rollbackError instanceof Error) {
      setMessage(`Geri yükleme başarısız oldu ve rollback uygulanamadı: ${outcome.rollbackError.message}`);
    } else {
      setMessage(outcome.error instanceof Error ? outcome.error.message : "Geri yükleme başarısız oldu.");
    }
  };

  return <div className="offline-page-surface min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9"><div className="offline-operation-grid"><div className="offline-operation-main">
    <header className="mb-7"><p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]"><WifiOff className="h-3.5 w-3.5" /> Offline geçiş modu</p><h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Yerel çalışma alanı</h1><p className="mt-2 max-w-2xl text-sm text-[#70807c]">Bu laptop internet olmadan çalışır. Kayıtlar yalnızca bu cihaza yazılır; haftalık yedek manager laptopunda birleştirilir.</p></header>

    <div className="mb-6 grid gap-3 rounded-2xl border border-[#e7dfc9] bg-[#fffaf0] p-4 text-xs text-[#8d6f3f] md:grid-cols-[1fr_1fr_auto]"><span><strong>Cihaz kimliği:</strong> {getDeviceId()}</span><div className="flex items-center gap-2"><Input value={userId} onChange={(event) => setUserIdState(event.target.value)} placeholder="Offline kullanıcı kodu" className="h-8 bg-white" /><Button size="sm" variant="outline" onClick={saveUser}>Kimliği kaydet</Button></div><span className="flex items-center gap-2"><HardDrive className="h-4 w-4" /> Yerel veri deposu</span></div>
    <Card className="mb-6 rounded-2xl border-[#dbe5dd] bg-white/90"><CardHeader><CardTitle className="font-serif text-xl">Size Özel Gündem hitabı</CardTitle><p className="text-xs text-[#70807c]">Bu satır yalnız bu cihazın sağ gündem panelinde görünür. Boş bırakırsanız genel “Size Özel Gündem” başlığı kullanılır.</p></CardHeader><CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="w-full max-w-md"><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">İsteğe bağlı hitap</label><Input value={profileGreeting} onChange={(event) => setProfileGreeting(event.target.value)} maxLength={72} placeholder="Örn. Cahit Beyin Dikkatine" className="bg-white" /></div><Button type="button" onClick={saveProfileGreeting}>Hitabı kaydet</Button></CardContent></Card>
    <Card className="mb-6 rounded-2xl border-[#dbe5dd] bg-white/90"><CardHeader><CardTitle className="font-serif text-xl">Sözleşme erişim rolü</CardTitle><p className="text-xs text-[#70807c]">Danışman yalnız kendi sözleşmesi için tam malik bilgisi ve A4 yazdırma görür. Ofis asistanı, yalnız broker managerın bu cihaz için atadığı danışman kapsamındaki sözleşmeleri görür.</p></CardHeader><CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div className="w-full max-w-sm"><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Bu cihazın rolü</label><Select value={accessRole} onValueChange={(value) => updateAccessRole(value as OfflineAccessRole)} disabled={!managerSessionActive}><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="consultant">Danışman — yalnız kendi sözleşmeleri</SelectItem><SelectItem value="officeAssistant">Ofis asistanı — atanmış danışman kapsamı</SelectItem></SelectContent></Select></div><p className={`text-xs ${managerSessionActive ? "text-[#287052]" : "text-[#8d6f3f]"}`}>{managerSessionActive ? "Yerel broker manager oturumu açık; rol değişikliği kayda alınır." : "Rol değişikliği için İşlem Kapanışları ekranından yerel broker manager oturumunu açın."}</p></CardContent></Card><Card className="mb-6 rounded-2xl border-[#dbe5dd] bg-white/90"><CardHeader><CardTitle className="font-serif text-xl">Ofis asistanı danışman kapsamı</CardTitle><p className="text-xs text-[#70807c]">Yalnız açık yerel broker manager oturumunda düzenlenir. Virgülle kullanıcı kodlarını yazın; boş kapsam, başka danışman kaydını tamamen gizler.</p></CardHeader><CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="w-full max-w-xl"><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Atanmış danışman kullanıcı kodları</label><Input value={assistantScopeInput} onChange={(event) => setAssistantScopeInput(event.target.value)} disabled={!managerSessionActive} placeholder="Örn. i_parin, k_tasliarmut" className="bg-white" /></div><Button type="button" onClick={saveAssistantScope} disabled={!managerSessionActive}>Kapsamı kaydet</Button></CardContent></Card>

    {upcomingEvacuations.length > 0 && <Card className="mb-6 rounded-2xl border-[#f0d8c8] bg-[#fff8f2]" role="status"><CardHeader><CardTitle className="font-serif text-xl text-[#8f4f38]">Tahliye uyarıları</CardTitle><p className="text-xs text-[#a06a51]">Danışman ve broker manager için, kayıtlı ihbar süresi eşiğine giren görevler.</p></CardHeader><CardContent><div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]"><div className="space-y-2"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a06a51]">Görev listesi</p>{upcomingEvacuations.map((record) => <div key={record.id} className="flex items-center justify-between rounded-xl border border-[#f0d8c8] bg-white px-3 py-2 text-sm"><span className="font-medium text-[#5e3f34]">{record.title}</span><span className="text-xs text-[#a06a51]">{displayRecordDate(record.noticeDate ?? record.dueDate)} · {record.noticeDays ?? 60} gün</span></div>)}</div><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#a06a51]">Takvim</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{upcomingEvacuations.map((record) => <div key={`calendar-${record.id}`} className="rounded-xl bg-[#fbe9dc] p-3"><p className="text-sm font-semibold text-[#8f4f38]">{displayRecordDate(record.noticeDate ?? record.dueDate)}</p><p className="mt-1 truncate text-xs text-[#5e3f34]">{record.title}</p></div>)}</div></div></div></CardContent></Card>}

    <div className="grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
      <Card className="rounded-2xl border-[#e5e8e3] bg-white/80"><CardHeader><CardTitle className="font-serif text-xl">Offline kayıt</CardTitle></CardHeader><CardContent className="space-y-4"><Select value={entity} onValueChange={(value) => setEntity(value as typeof entity)}><SelectTrigger aria-label="Kayıt türü"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="client">Müşteri</SelectItem><SelectItem value="property">Mülk</SelectItem><SelectItem value="contract">Sözleşme</SelectItem><SelectItem value="obligation">Kira/vergi vadesi</SelectItem><SelectItem value="evacuation">Tahliye bildirimi</SelectItem><SelectItem value="ownerApproval">Mülk sahibi onayı</SelectItem><SelectItem value="ledger">Ön muhasebe</SelectItem></SelectContent></Select><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Kayıt başlığı" /><Input value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Kısa açıklama" /><Input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Tutar (opsiyonel)" /><Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Vade veya tahliye tarihi" />{entity === "obligation" && <Select value={obligationType} onValueChange={(value) => setObligationType(value as typeof obligationType)}><SelectTrigger><SelectValue placeholder="Yükümlülük türü" /></SelectTrigger><SelectContent><SelectItem value="rent">Kira</SelectItem><SelectItem value="tax">Vergi</SelectItem><SelectItem value="insurance">Sigorta</SelectItem><SelectItem value="other">Diğer</SelectItem></SelectContent></Select>}{entity === "evacuation" && <Input type="number" min="1" value={noticeDays} onChange={(event) => setNoticeDays(event.target.value)} placeholder="İhbar süresi (gün)" />}{entity === "ownerApproval" && <><Select value={approvalDecision} onValueChange={(value) => setApprovalDecision(value as typeof approvalDecision)}><SelectTrigger><SelectValue placeholder="Onay kararı" /></SelectTrigger><SelectContent><SelectItem value="pending">Onay bekliyor</SelectItem><SelectItem value="approved">Onaylandı</SelectItem><SelectItem value="rejected">Reddedildi</SelectItem></SelectContent></Select><Input value={approvalNote} onChange={(event) => setApprovalNote(event.target.value)} placeholder="Mülk sahibi notu" /></>}{entity === "ledger" && <Select value={ledgerType} onValueChange={(value) => setLedgerType(value as typeof ledgerType)}><SelectTrigger><SelectValue placeholder="İşlem tipi" /></SelectTrigger><SelectContent><SelectItem value="income">Gelir</SelectItem><SelectItem value="expense">Gider</SelectItem><SelectItem value="receivable">Alacak</SelectItem><SelectItem value="payable">Borç</SelectItem><SelectItem value="collection">Tahsilat</SelectItem><SelectItem value="payment">Ödeme</SelectItem></SelectContent></Select>}<Button onClick={add} disabled={!title.trim() || !userId.trim()} className="w-full rounded-xl bg-[#173e39] font-semibold text-white hover:bg-[#20554e] hover:text-white [&_svg]:text-white disabled:cursor-not-allowed disabled:bg-[#a8b9b2] disabled:text-white disabled:opacity-100 disabled:[&_svg]:text-white"><Plus className="mr-2 h-4 w-4" /> Yerel kaydet</Button></CardContent></Card>

      <Card className="rounded-2xl border-[#e5e8e3] bg-white/80"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle className="font-serif text-xl">Bu cihazdaki kayıtlar</CardTitle><p className="text-xs text-[#87938f]">{records.length} yerel kayıt · her kayıtta sürüm ve son aktarım zamanı tutulur</p></div><Button variant="ghost" size="icon" onClick={() => void refresh()} aria-label="Kayıtları yenile"><RefreshCw className="h-4 w-4" /></Button></CardHeader><CardContent><div className="mb-4 rounded-xl border border-[#e7dfc9] bg-[#fffaf0] p-4"><label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8d6f3f]" htmlFor="offline-backup-password">Şifreli yedek parolası</label><Input id="offline-backup-password" type="password" value={backupPassword} onChange={(event) => setBackupPassword(event.target.value)} placeholder="En az 8 karakter" className="mt-2 max-w-md bg-white" /><p className="mt-2 text-xs text-[#8d6f3f]">Aynı parola ile yedek oluşturulur ve geri yükleme öncesi açılır. Parolayı güvenli bir kanaldan paylaşın; uygulama parolayı saklamaz.</p></div><div className="mb-4 flex flex-wrap gap-2"><Button variant="outline" onClick={() => void backup()} disabled={!userId.trim() || backupPassword.trim().length < 8}><Download className="mr-2 h-4 w-4" /> Şifreli yedek oluştur</Button><Select value={reportFilter} onValueChange={(value) => setReportFilter(value as typeof reportFilter)}><SelectTrigger aria-label="Offline kayıt filtresi" className="h-9 w-full max-w-full sm:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tüm offline kayıtlar</SelectItem><SelectItem value="evacuation">Tahliye bildirimleri</SelectItem><SelectItem value="evacuationUpcoming">Yaklaşan tahliyeler</SelectItem><SelectItem value="ownerApproval">Mülk sahibi onayları</SelectItem></SelectContent></Select><label className={`inline-flex cursor-pointer items-center rounded-md border border-[#dfe4df] bg-white px-3 py-2 text-sm font-medium text-[#34433f] ${backupPassword.trim().length < 8 ? "cursor-not-allowed opacity-50" : ""}`}><Import className="mr-2 h-4 w-4" /> Şifreli yedek içe aktar<input type="file" accept="application/json" className="hidden" onChange={(event) => void restore(event.target.files?.[0])} /></label></div><div className="mb-4 grid grid-cols-2 gap-2 rounded-xl border border-[#e5e8e3] bg-[#fbfcfa] p-3 text-xs md:grid-cols-4"><div><p className="text-[#87938f]">Tahliye bildirimi</p><p className="mt-1 font-semibold text-[#a85745]">{evacuationCount}</p></div><div><p className="text-[#87938f]">Yaklaşan tahliye</p><p className="mt-1 font-semibold text-[#bd6b45]">{upcomingEvacuations.length}</p></div><div><p className="text-[#87938f]">Onay bekleyen</p><p className="mt-1 font-semibold text-[#8d6f3f]">{pendingApprovalCount}</p></div><div><p className="text-[#87938f]">Onaylanan</p><p className="mt-1 font-semibold text-[#2b786e]">{approvedCount}</p></div></div>{restoreResult && <div className="mb-4 rounded-xl border border-[#e7dfc9] bg-[#fffaf0] p-4 text-xs text-[#8d6f3f]"><p className="font-semibold">Tekil yedek önizlemesi</p>{restoreResult.manifests.map((manifest) => <ManifestPreviewRow key={manifest.file} manifest={manifest} testId="single-manifest-preview-row" />)}{restoreResult.conflicts.length > 0 && <p className="mt-2 text-[#a85745]">{restoreResult.conflicts.length} çakışma bulundu; kayıt yazımı engellendi.</p>}<Button className="mt-3" size="sm" onClick={() => void applyRestore()} disabled={restoreResult.invalid.length > 0 || restoreResult.conflicts.length > 0 || !userId.trim()}>Önizlemeyi onayla ve geri yükle</Button></div>}{message && <p className="mb-4 rounded-lg bg-[#f5fbf8] px-3 py-2 text-xs text-[#2b786e]" role="status">{message}</p>}{!presentedVisibleRecords.length ? <p className="rounded-xl bg-[#f7f7f4] px-4 py-12 text-center text-sm text-[#87938f]">Bu filtrede yerel kayıt yok.</p> : <div className="space-y-2">{presentedVisibleRecords.map((record) => <div key={record.id} className="rounded-xl border border-[#edf0ec] p-4"><p className="text-sm font-semibold text-[#34433f]">{record.title}</p><p className="mt-1 text-xs text-[#87938f]">{record.entity}{record.entity === "obligation" && record.obligationType ? ` · ${record.obligationType === "rent" ? "kira" : record.obligationType === "tax" ? "vergi" : record.obligationType}` : ""} · {record.details || "Açıklama yok"} · sürüm {record.recordVersion} · güncelleme {formatTurkishDateTime(record.updatedAt)}{record.lastSyncAt ? ` · son aktarım ${formatTurkishDateTime(record.lastSyncAt)}` : " · henüz aktarılmadı"}</p></div>)}</div>}</CardContent></Card>
    </div>
  </div><OfflineOfficeFlowPanel className="offline-operation-aside" records={records} userId={userId} managerActive={managerSessionActive} /></div></div>;
}
