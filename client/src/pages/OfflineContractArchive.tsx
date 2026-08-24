import { useEffect, useMemo, useState } from "react";
import { Archive, FileCheck2, FileLock2, FolderOpen, LoaderCircle, Search, ShieldCheck, Upload } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { canViewArchiveDocument, getOfflineAccessRole } from "@/lib/offlineContractAccess";
import { archiveCustomerNames, compareContractArchiveChronologically, contractArchiveDocumentTypes, contractArchivePartyRoles, createContractArchiveMetadata, formatArchiveByteSize, parseContractArchiveMetadata, type ContractArchiveCustomerParty, type ContractArchiveDocumentType } from "@/lib/contractArchive";
import { getUserId, listOfflineRecords, recordOfflineAudit, saveOfflineRecordForAssignedUser, type OfflineRecord } from "@/lib/offlineStore";

type ArchiveDesktopBridge = { contractArchive?: { selectPdfFiles: () => Promise<Array<{ archiveKey: string; originalName: string; byteSize: number; sha256: string }>>; registerPdf: (request: { recordId: string; archiveKey: string; ownerUserId: string; sha256: string }) => Promise<{ ok: boolean }>; openPdf: (request: { recordId: string; access: { userId: string; role: "consultant" | "officeAssistant"; managerSessionActive: boolean } }) => Promise<{ ok: boolean; message?: string }> } };
const desktopBridge = () => (window as Window & { global1881Desktop?: ArchiveDesktopBridge }).global1881Desktop;

export default function OfflineContractArchive() {
  const { user } = useAuth();
  const [records, setRecords] = useState<OfflineRecord[]>([]);
  const [query, setQuery] = useState("");
  const [assignmentUserId, setAssignmentUserId] = useState("");
  const [documentType, setDocumentType] = useState<ContractArchiveDocumentType>("authority");
  const [customerName, setCustomerName] = useState("");
  const [relatedCustomers, setRelatedCustomers] = useState<ContractArchiveCustomerParty[]>([]);
  const [documentDate, setDocumentDate] = useState("");
  const [historicalActivity, setHistoricalActivity] = useState("");
  const [archiveNote, setArchiveNote] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const localUserId = getUserId();
  const accessRole = getOfflineAccessRole();
  const managerSessionActive = user?.role === "admin";
  const canImport = managerSessionActive || accessRole === "officeAssistant";
  const accessContext = { userId: localUserId, role: accessRole, managerSessionActive } as const;

  const refresh = async () => setRecords((await listOfflineRecords()).filter((record) => record.entity === "contractArchive"));
  useEffect(() => { void refresh(); }, []);

  const visibleRows = useMemo(() => records
    .filter((record) => canViewArchiveDocument(record, accessContext))
    .map((record) => ({ record, metadata: parseContractArchiveMetadata(record) }))
    .filter((row): row is { record: OfflineRecord; metadata: NonNullable<typeof row.metadata> } => Boolean(row.metadata))
    .filter(({ record, metadata }) => [record.title, record.userId, ...archiveCustomerNames(metadata), metadata.historicalActivity, metadata.originalFileName, metadata.documentTypeLabel].join(" ").toLocaleLowerCase("tr-TR").includes(query.trim().toLocaleLowerCase("tr-TR"))), [records, accessContext.userId, accessContext.role, accessContext.managerSessionActive, query]);

  const customerGroups = useMemo(() => {
    const groups = new Map<string, typeof visibleRows>();
    visibleRows.forEach((row) => {
      archiveCustomerNames(row.metadata).forEach((customerName) => {
        const name = customerName.trim() || "Müşteri adı belirtilmemiş";
        groups.set(name, [...(groups.get(name) ?? []), row].sort((left, right) => compareContractArchiveChronologically(left.metadata, right.metadata)));
      });
    });
    return Array.from(groups.entries()).sort(([left], [right]) => left.localeCompare(right, "tr"));
  }, [visibleRows]);

  const importPdf = async () => {
    if (!canImport) { setMessage("Eski PDF arşivi yalnız açık broker manager oturumunda veya manager tarafından atanmış ofis asistanı rolüyle eklenebilir."); return; }
    if (!assignmentUserId.trim()) { setMessage("Belgenin bağlı olacağı danışman kullanıcı kimliğini yazın."); return; }
    if (!customerName.trim()) { setMessage("Arşivin bağlı olacağı müşteri adını yazın."); return; }
    if (!historicalActivity.trim()) { setMessage("Müşteriye ait kısa geçmiş işlem özetini yazın."); return; }
    const bridge = desktopBridge()?.contractArchive;
    if (!bridge) { setMessage("PDF arşivi yalnız Windows masaüstü uygulamasında içe aktarılabilir."); return; }
    setWorking(true); setMessage("");
    try {
      const files = await bridge.selectPdfFiles();
      if (!files.length) { setMessage("Dosya seçilmedi."); return; }
      for (const file of files) {
        const metadata = createContractArchiveMetadata({ documentType, customerName, relatedCustomers, documentDate, historicalActivity, originalFileName: file.originalName, sha256: file.sha256, byteSize: file.byteSize, storageKey: file.archiveKey, archiveNote });
        const record = await saveOfflineRecordForAssignedUser({ entity: "contractArchive", title: `${metadata.customerName} · ${metadata.documentTypeLabel}`, details: JSON.stringify(metadata), status: "archived" }, assignmentUserId);
        await bridge.registerPdf({ recordId: record.id, archiveKey: metadata.storageKey, ownerUserId: record.userId, sha256: metadata.sha256 });
        recordOfflineAudit("contract-archive-imported", { assignedUserId: assignmentUserId.trim(), byteSize: file.byteSize, storageKey: file.archiveKey, readonly: true });
      }
      setMessage(`${files.length} PDF salt-okunur arşive eklendi. Vade, tahsilat, finans veya performans kaydı oluşturulmadı.`);
      setCustomerName(""); setRelatedCustomers([]); setDocumentDate(""); setHistoricalActivity(""); setArchiveNote(""); await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "PDF arşive eklenemedi."); } finally { setWorking(false); }
  };

  const openPdf = async (record: OfflineRecord, storageKey: string) => {
    if (!canViewArchiveDocument(record, accessContext)) { setMessage("Bu arşiv belgesini açma yetkiniz yok."); return; }
    const bridge = desktopBridge()?.contractArchive;
    if (!bridge) { setMessage("PDF açma yalnız Windows masaüstü uygulamasında kullanılabilir."); return; }
    const result = await bridge.openPdf({ recordId: record.id, access: accessContext });
    if (!result.ok) { setMessage(result.message ?? "PDF açılamadı."); return; }
    recordOfflineAudit("contract-archive-opened", { recordId: record.id, storageKey });
  };

  return <div className="offline-page-surface min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9">
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]"><Archive className="h-3.5 w-3.5" /> Geçmiş belgeler · salt-okunur</p>
        <h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Müşteri Dijital Arşivi</h1>
        <p className="mt-2 max-w-3xl text-sm text-[#70807c]">Eski PDF belgeleri ilgili danışman ve <strong className="font-semibold text-[#34433f]">müşteri tarafları</strong> adına bağlanır. Bir kira sözleşmesi malik ve kiracı adıyla bulunabilir; bu belgeler aktif sözleşme, vade, tahsilat, ön muhasebe veya performans kaydı oluşturmaz.</p>
      </div>
      <Button variant="outline" onClick={() => void refresh()} className="rounded-xl bg-white"><Search className="mr-2 h-4 w-4" /> Listeyi yenile</Button>
    </header>

    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
      <div className="space-y-5">
        {canImport ? <Card className="rounded-2xl border-[#e5e8e3] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-xl text-[#223230]"><Upload className="h-5 w-5 text-[#a17b43]" /> Eski PDF içe aktar</CardTitle><p className="text-xs leading-5 text-[#70807c]">Dosya baytları Windows kullanıcı verisi altındaki arşiv klasörüne alınır; şifreli JSON yedeklerinde yalnız metadata bulunur. Birleştirme sonrası PDF dosyası ayrıca güvenli taşınmalıdır.</p></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
          <div><Label htmlFor="archive-owner">Danışman kullanıcı kimliği</Label><Input id="archive-owner" className="mt-1.5 bg-white" value={assignmentUserId} onChange={(event) => setAssignmentUserId(event.target.value)} placeholder="ör. cahit-yilmaz" /></div>
          <div><Label>Belge türü</Label><Select value={documentType} onValueChange={(value) => setDocumentType(value as ContractArchiveDocumentType)}><SelectTrigger className="mt-1.5 bg-white"><SelectValue /></SelectTrigger><SelectContent>{contractArchiveDocumentTypes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div>
          <div><Label htmlFor="archive-customer-name">Ana müşteri adı</Label><Input id="archive-customer-name" className="mt-1.5 bg-white" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Ör. Ayşe Demir" /></div>
          <div><Label htmlFor="archive-document-date">Belge tarihi <span className="font-normal text-[#87938f]">(varsa)</span></Label><Input id="archive-document-date" className="mt-1.5 bg-white" value={documentDate} onChange={(event) => setDocumentDate(event.target.value)} placeholder="GG.AA.YYYY" /></div>
          <div className="md:col-span-2 rounded-xl border border-[#dce7df] bg-[#f8fbf8] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><Label>İlgili müşteri / taraflar <span className="font-normal text-[#87938f]">(isteğe bağlı)</span></Label><p className="mt-1 text-xs text-[#718079]">Kira sözleşmesinde kiracı gibi diğer tarafı ekleyin; aynı PDF o müşteri adıyla da bulunur.</p></div><Button type="button" variant="outline" size="sm" onClick={() => setRelatedCustomers((current) => [...current, { name: "", role: "tenant" }])}>Taraf ekle</Button></div><div className="mt-3 space-y-2">{relatedCustomers.map((party, index) => <div key={`${party.role}-${index}`} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px_auto]"><Input value={party.name} onChange={(event) => setRelatedCustomers((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} placeholder="Ör. Tevfik Ateş Kut" /><Select value={party.role} onValueChange={(role) => setRelatedCustomers((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, role: role as ContractArchiveCustomerParty["role"] } : item))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{contractArchivePartyRoles.map((role) => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}</SelectContent></Select><Button type="button" variant="ghost" size="sm" onClick={() => setRelatedCustomers((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Kaldır</Button></div>)}</div></div>
          <div><Label htmlFor="archive-historical-activity">Geçmiş işlem özeti</Label><Textarea id="archive-historical-activity" className="mt-1.5 min-h-20 bg-white" value={historicalActivity} onChange={(event) => setHistoricalActivity(event.target.value)} placeholder="Ör. 2024 yaz dönemindeki eski kira işlemi." /></div>
          <div><Label htmlFor="archive-note">Kısa arşiv notu <span className="font-normal text-[#87938f]">(isteğe bağlı)</span></Label><Textarea id="archive-note" className="mt-1.5 min-h-20 bg-white" value={archiveNote} onChange={(event) => setArchiveNote(event.target.value)} placeholder="Ör. Belge taraması okunaklı; yalnız referans için." /></div>
          <div className="md:col-span-2 flex flex-wrap items-center gap-3"><Button onClick={() => void importPdf()} disabled={working} className="rounded-xl bg-[#173e39] text-white hover:bg-[#20554e] hover:text-white">{working ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} PDF seç ve arşivle</Button><span className="flex items-center gap-1.5 text-xs text-[#6c837d]"><FileLock2 className="h-3.5 w-3.5" /> Salt-okunur saklama · SHA-256 bütünlük özeti</span></div>
        </CardContent></Card> : <Card className="rounded-2xl border-[#e7dfc9] bg-[#fffaf0]"><CardContent className="flex gap-3 p-5 text-sm text-[#806536]"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><p>Danışman olarak yalnız kendi arşiv belgelerinizi görüntüleyebilirsiniz. Geçmiş PDF ekleme yetkisi broker manager veya manager tarafından atanmış ofis asistanı rolündedir.</p></CardContent></Card>}

        <Card className="rounded-2xl border-[#e5e8e3] bg-white"><CardHeader className="flex-row items-center justify-between gap-4 space-y-0"><div><CardTitle className="font-serif text-xl">Müşteri dijital arşivleri</CardTitle><p className="mt-1 text-xs text-[#87938f]">Her müşterinin eski PDF belgeleri ve geçmiş işlem notu aynı arşiv kartında eskiden yeniye görünür. Birden fazla tarafı olan belge, her ilgili müşteri adıyla aranabilir. Tarihi belirtilmeyen belgeler kartın sonunda yer alır; başka danışmanların bilgileri görünmez.</p></div><div className="w-full max-w-xs"><Label className="sr-only" htmlFor="archive-search">Arşivde ara</Label><Input id="archive-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Müşteri, işlem veya PDF adı ara" className="bg-[#fbfcfa]" /></div></CardHeader><CardContent className="space-y-4">
          {customerGroups.length ? customerGroups.map(([customer, documents]) => <section key={customer} className="rounded-xl border border-[#e7ebe6] bg-[#fbfcfa] p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#e1e8e2] pb-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a17b43]">Müşteri arşivi</p><h3 className="mt-1 font-serif text-xl text-[#223230]">{customer}</h3></div><span className="rounded-full bg-[#e8f1eb] px-2.5 py-1 text-xs font-semibold text-[#3c6459]">{documents.length} PDF</span></div><div className="space-y-3">{documents.map(({ record, metadata }) => <div key={record.id} className="flex flex-col justify-between gap-4 rounded-lg border border-[#e3e9e4] bg-white p-3 md:flex-row md:items-center"><div className="min-w-0"><p className="flex items-center gap-2 font-semibold text-[#34433f]"><FileCheck2 className="h-4 w-4 shrink-0 text-[#a17b43]" /> <span className="truncate">{metadata.documentTypeLabel}</span></p><p className="mt-1 truncate text-sm text-[#6e7b76]">{metadata.originalFileName}</p><p className="mt-2 text-xs text-[#87938f]">{metadata.documentDateDisplay} · {formatArchiveByteSize(metadata.byteSize)} · SHA-256 kaydı mevcut{(managerSessionActive || accessRole === "officeAssistant") ? ` · Danışman: ${record.userId}` : ""}</p>{metadata.historicalActivity && <p className="mt-2 text-xs font-medium text-[#536b64]">Geçmiş işlem: {metadata.historicalActivity}</p>}{metadata.archiveNote && <p className="mt-1 text-xs text-[#70807c]">Not: {metadata.archiveNote}</p>}</div><Button variant="outline" onClick={() => void openPdf(record, metadata.storageKey)} className="shrink-0 rounded-xl bg-white"><FolderOpen className="mr-2 h-4 w-4" /> PDF aç</Button></div>)}</div></section>) : <div className="rounded-xl border border-dashed border-[#cbd5cf] px-5 py-10 text-center"><Archive className="mx-auto h-8 w-8 text-[#b49358]" /><p className="mt-3 font-medium text-[#42514c]">Görüntüleyebileceğiniz müşteri arşivi bulunmuyor.</p><p className="mt-1 text-xs text-[#87938f]">Manager/yardımcı eski PDF’yi müşteri ve danışman kullanıcı kimliğiyle bağladığında burada görünür.</p></div>}
        </CardContent></Card>
      </div>
      <aside className="h-fit rounded-2xl bg-[#173e39] p-5 text-[#e0eee9]"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e6c47d]">Arşiv ilkesi</p><h2 className="mt-2 font-serif text-2xl text-white">Geçmişi korur, bugünü etkilemez.</h2><div className="mt-5 space-y-3 text-xs leading-5 text-[#bed5ce]"><p>PDF bütünlüğü içe alma anında SHA-256 özetiyle kayda alınır.</p><p>Belge yalnız sahibi danışman, açık manager oturumu veya atanmış ofis asistanı tarafından açılabilir.</p><p>Yerel JSON yedeği PDF baytlarını içermez. Cihaz değişiminde arşiv PDF klasörü şifreli harici ortamla ayrıca taşınmalıdır.</p></div></aside>
    </div>
    {message && <p role="status" className="mt-5 rounded-xl border border-[#d9e8df] bg-[#f4fbf7] px-4 py-3 text-sm text-[#2e6f5f]">{message}</p>}
  </div>;
}
