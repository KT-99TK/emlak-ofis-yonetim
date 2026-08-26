import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { canUploadOwnActiveContractDocument, createActiveContractDocumentMetadata, getActiveSignedRentalEligibility, parseActiveContractDocumentMetadata } from "@/lib/activeContractDocuments";
import { canViewFullOfflineContract, getOfflineAccessRole, getOfflineAssistantAssignedUserIds } from "@/lib/offlineContractAccess";
import { formatArchiveByteSize } from "@/lib/contractArchive";
import { isLocalManagerSessionActive } from "@/lib/offlineManagerAccess";
import { getUserId, listOfflineRecords, recordOfflineAudit, saveOfflineRecord, type OfflineRecord } from "@/lib/offlineStore";
import { FileCheck2, FileLock2, FolderOpen, LoaderCircle, ShieldCheck, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ActiveDocumentBridge = { activeContractDocuments?: { selectPdfFiles: () => Promise<Array<{ storageKey: string; originalName: string; byteSize: number; sha256: string }>>; registerPdf: (request: { documentRecordId: string; storageKey: string; ownerUserId: string; contractRecordId: string; sha256: string }) => Promise<{ ok: boolean; immutable: boolean }>; openPdf: (request: { documentRecordId: string; access: { userId: string; role: "consultant" | "officeAssistant"; managerSessionActive: boolean; assistantAssignedUserIds?: string[] } }) => Promise<{ ok: boolean; message?: string }> } };
const desktopBridge = () => (window as Window & { global1881Desktop?: ActiveDocumentBridge }).global1881Desktop;

export default function OfflineActiveContractDocuments() {
  const { user } = useAuth();
  const [records, setRecords] = useState<OfflineRecord[]>([]);
  const [selectedContractId, setSelectedContractId] = useState("");
  const [signatureDate, setSignatureDate] = useState("");
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const localUserId = getUserId();
  const role = getOfflineAccessRole();
  const managerSessionActive = user?.role === "admin" || isLocalManagerSessionActive();
  const assistantAssignedUserIds = getOfflineAssistantAssignedUserIds();
  const accessContext = { userId: localUserId, role, managerSessionActive, assistantAssignedUserIds } as const;
  const refresh = async () => setRecords(await listOfflineRecords());
  useEffect(() => { void refresh(); }, []);

  const ownEligibleContracts = useMemo(() => records.filter((record) => canUploadOwnActiveContractDocument(record, localUserId)), [records, localUserId]);
  const selectedContract = ownEligibleContracts.find((record) => record.id === selectedContractId);
  const selectedEligibility = selectedContract ? getActiveSignedRentalEligibility(selectedContract) : null;
  const visibleDocuments = useMemo(() => records.filter((record) => record.entity === "activeContractDocument" && canViewFullOfflineContract(record, accessContext)).map((record) => ({ record, metadata: parseActiveContractDocumentMetadata(record) })).filter((item): item is { record: OfflineRecord; metadata: NonNullable<typeof item.metadata> } => Boolean(item.metadata)), [records, accessContext.userId, accessContext.role, accessContext.managerSessionActive, assistantAssignedUserIds.join(",")]);

  useEffect(() => {
    if (!selectedContract) { setSignatureDate(""); return; }
    const eligibility = getActiveSignedRentalEligibility(selectedContract);
    if (eligibility.eligible) setSignatureDate(String(eligibility.snapshot.signedAt || eligibility.snapshot.startDate || ""));
  }, [selectedContractId]);

  const upload = async () => {
    if (!selectedContract || !selectedEligibility?.eligible) { setMessage("Önce yalnız size ait, imzalı ve aktif bir kira sözleşmesi seçin."); return; }
    const bridge = desktopBridge()?.activeContractDocuments;
    if (!bridge) { setMessage("İmzalı belge ekleme yalnız Windows masaüstü uygulamasında kullanılabilir."); return; }
    setWorking(true); setMessage("");
    try {
      const files = await bridge.selectPdfFiles();
      if (!files.length) { setMessage("Dosya seçilmedi."); return; }
      for (const file of files) {
        const metadata = createActiveContractDocumentMetadata({ contractRecordId: selectedContract.id, contractNo: String(selectedEligibility.snapshot.contractNo ?? "Aktif kira"), customerNames: selectedEligibility.customerNames, signatureDate: signatureDate || String(selectedEligibility.snapshot.startDate ?? ""), originalFileName: file.originalName, sha256: file.sha256, byteSize: file.byteSize, storageKey: file.storageKey, uploadedByUserId: localUserId });
        const documentRecord = await saveOfflineRecord({ entity: "activeContractDocument", title: `${metadata.customerNames[0]} · İmzalı aktif kira belgesi`, details: JSON.stringify(metadata), status: "attached" });
        const registered = await bridge.registerPdf({ documentRecordId: documentRecord.id, storageKey: metadata.storageKey, ownerUserId: documentRecord.userId, contractRecordId: selectedContract.id, sha256: metadata.sha256 });
        if (!registered.ok) throw new Error("İmzalı belge manifesti kaydedilemedi.");
        recordOfflineAudit("active-contract-document-uploaded", { documentRecordId: documentRecord.id, contractRecordId: selectedContract.id, byteSize: file.byteSize, immutable: true });
      }
      setMessage(`${files.length} imzalı PDF müşteri dosyasına eklendi. Bu belgeler silinemez/değiştirilemez; yeni vade veya tahsilat oluşturulmadı.`);
      await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "İmzalı belge eklenemedi."); } finally { setWorking(false); }
  };

  const open = async (record: OfflineRecord, storageKey: string) => {
    if (!canViewFullOfflineContract(record, accessContext)) { setMessage("Bu imzalı belgeyi açma yetkiniz yok."); return; }
    const bridge = desktopBridge()?.activeContractDocuments;
    if (!bridge) { setMessage("PDF açma yalnız Windows masaüstü uygulamasında kullanılabilir."); return; }
    const result = await bridge.openPdf({ documentRecordId: record.id, access: accessContext });
    if (!result.ok) { setMessage(result.message ?? "PDF açılamadı."); return; }
    recordOfflineAudit("active-contract-document-opened", { documentRecordId: record.id, storageKey, immutable: true });
  };

  return <div className="min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9"><header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]"><FileLock2 className="h-3.5 w-3.5" /> Aktif sözleşme dosyası · silinemez</p><h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Aktif İmzalı Belgeler</h1><p className="mt-2 max-w-3xl text-sm text-[#70807c]">Danışman yalnız kendi imzalı ve devam eden kira sözleşmesine PDF ekler. Eklenen dosya müşteri taraflarıyla bağlantılıdır; <strong className="font-semibold text-[#34433f]">silme ve düzenleme seçeneği yoktur.</strong></p></div><Button variant="outline" onClick={() => void refresh()} className="rounded-xl bg-white">Listeyi yenile</Button></header><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px]"><div className="space-y-5"><Card className="rounded-2xl border-[#e5e8e3] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-xl text-[#223230]"><Upload className="h-5 w-5 text-[#a17b43]" /> İmzalı PDF ekle</CardTitle><p className="text-xs leading-5 text-[#70807c]">Yalnız kendi kullanıcı kodunuza ait, taraf imzaları teyitli ve aktif dönem içindeki kira sözleşmeleri seçilebilir. PDF eklemek mevcut vade/tahliye kaydını değiştirmez.</p></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><div className="md:col-span-2"><Label htmlFor="active-contract-select">Kendi aktif imzalı kira sözleşmeniz</Label><select id="active-contract-select" className="mt-1.5 h-10 w-full rounded-md border border-input bg-white px-3 text-sm" value={selectedContractId} onChange={(event) => setSelectedContractId(event.target.value)}><option value="">Sözleşme seçin</option>{ownEligibleContracts.map((record) => { const eligibility = getActiveSignedRentalEligibility(record); return eligibility.eligible ? <option key={record.id} value={record.id}>{String(eligibility.snapshot.contractNo ?? "Kira sözleşmesi")} · {eligibility.customerNames.join(" / ")} · Bitiş: {eligibility.endDate}</option> : null; })}</select>{!ownEligibleContracts.length && <p className="mt-2 text-xs text-[#9a6e38]">Size ait, imza teyitli ve aktif kira sözleşmesi bulunmuyor. Önce Kira Sözleşmeleri ekranında sözleşmeyi kaydedip taraf imzasını teyit edin.</p>}</div><div><Label htmlFor="signature-date">İmza tarihi</Label><Input id="signature-date" className="mt-1.5 bg-white" value={signatureDate} onChange={(event) => setSignatureDate(event.target.value)} placeholder="GG.AA.YYYY" /></div><div className="flex items-end"><Button onClick={() => void upload()} disabled={working || !selectedContract} className="w-full rounded-xl bg-[#173e39] text-white hover:bg-[#20554e] hover:text-white">{working ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} PDF seç ve kalıcı ekle</Button></div><div className="md:col-span-2 flex items-center gap-2 rounded-xl border border-[#e1e9e3] bg-[#f8fbf8] px-3 py-2 text-xs text-[#537067]"><FileLock2 className="h-4 w-4 text-[#a17b43]" /> SHA-256 bütünlük özeti ve yükleme audit’i saklanır. Bu ekranda belge silme, değiştirme veya yeniden yükleme komutu bulunmaz.</div></CardContent></Card><Card className="rounded-2xl border-[#e5e8e3] bg-white"><CardHeader><CardTitle className="font-serif text-xl">Müşteri dosyasındaki imzalı belgeler</CardTitle><p className="mt-1 text-xs text-[#87938f]">Kendi belgelerinizi; manager veya atanmış ofis asistanı yetkili erişimle görebilir. Başka danışmanların müşteri adları ve PDF’leri görünmez.</p></CardHeader><CardContent className="space-y-3">{visibleDocuments.length ? visibleDocuments.map(({ record, metadata }) => <div key={record.id} className="flex flex-col justify-between gap-3 rounded-xl border border-[#e3e9e4] bg-[#fbfcfa] p-4 md:flex-row md:items-center"><div className="min-w-0"><p className="flex items-center gap-2 font-semibold text-[#34433f]"><FileCheck2 className="h-4 w-4 text-[#a17b43]" /> <span className="truncate">{metadata.customerNames.join(" / ")}</span></p><p className="mt-1 truncate text-sm text-[#6e7b76]">{metadata.originalFileName}</p><p className="mt-2 text-xs text-[#87938f]">{metadata.contractNo} · İmza: {metadata.signatureDateDisplay} · {formatArchiveByteSize(metadata.byteSize)} · SHA-256 mevcut · Silinemez{(managerSessionActive || role === "officeAssistant") ? ` · Danışman: ${record.userId}` : ""}</p></div><Button variant="outline" onClick={() => void open(record, metadata.storageKey)} className="shrink-0 rounded-xl bg-white"><FolderOpen className="mr-2 h-4 w-4" /> PDF aç</Button></div>) : <div className="rounded-xl border border-dashed border-[#cbd5cf] px-5 py-10 text-center"><FileLock2 className="mx-auto h-8 w-8 text-[#b49358]" /><p className="mt-3 font-medium text-[#42514c]">Görüntüleyebileceğiniz imzalı belge bulunmuyor.</p><p className="mt-1 text-xs text-[#87938f]">Kendi aktif kira sözleşmenize PDF eklediğinizde burada müşteri dosyasında görünür.</p></div>}</CardContent></Card></div><aside className="h-fit rounded-2xl bg-[#173e39] p-5 text-[#e0eee9]"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e6c47d]">Belge ilkesi</p><h2 className="mt-2 font-serif text-2xl text-white">Eklenir; yok edilmez.</h2><div className="mt-5 space-y-3 text-xs leading-5 text-[#bed5ce]"><p>Danışman yalnız kendi aktif sözleşmesine belge ekler.</p><p>Belge eklemek vade, tahsilat veya tahliye kaydı oluşturmaz; mevcut sözleşme süreci korunur.</p><p>Dosya Windows kullanıcı verisinde saklanır. Silme IPC’si ve silme butonu bu sürümde bulunmaz.</p></div></aside></div>{message && <p role="status" className="mt-5 rounded-xl border border-[#d9e8df] bg-[#f4fbf7] px-4 py-3 text-sm text-[#2e6f5f]">{message}</p>}</div>;
}
