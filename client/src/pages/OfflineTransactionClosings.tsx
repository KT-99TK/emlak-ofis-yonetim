import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, Banknote, CheckCircle2, CircleDollarSign, ClipboardCheck, LockKeyhole, Plus, RefreshCw, ShieldAlert } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatAuthorityCurrency, formatWholeCurrencyInput } from "@/lib/authorityContract";
import { getUserId, listOfflineRecords, saveOfflineRecord, updateOfflineRecord, type OfflineRecord } from "@/lib/offlineStore";
import { configureLocalManagerPasscode, hasLocalManagerPasscode, isLocalManagerSessionActive, LOCAL_MANAGER_SESSION_MINUTES, lockLocalManagerAccess, unlockLocalManagerAccess } from "@/lib/offlineManagerAccess";
import { addOptionalCollection, closeTransaction, collectionCategoryLabels, collectionStateLabels, createTransactionFromContract, declareCollection, parseOfflineTransaction, transactionExpectedTotal, transactionRisks, transactionVerifiedTotal, verifyCollection, type OfflineTransactionDetails, type PaymentMethod } from "@/lib/transactionClosing";

type CollectionEditor = { transactionRecordId: string; collectionId: string; amount: string; method: PaymentMethod; reference: string; collectedAt: string; note: string };
type OptionalEditor = { transactionRecordId: string; amount: string; dueDate: string };

const statusLabel: Record<OfflineTransactionDetails["status"], string> = { prepared: "Hazırlanıyor", collectionPending: "Tahsilat bekliyor", managerReview: "Manager incelemesi", riskHold: "Riskte", closed: "Kapandı", cancelled: "İptal" };
const statusTone: Record<OfflineTransactionDetails["status"], string> = { prepared: "bg-[#eef1ed] text-[#5f6b67]", collectionPending: "bg-[#fff5e6] text-[#8d6f3f]", managerReview: "bg-[#eaf2f5] text-[#2d6573]", riskHold: "bg-[#fff0ee] text-[#a04b40]", closed: "bg-[#e7f4ed] text-[#287052]", cancelled: "bg-[#f0f0f0] text-[#6b6b6b]" };
const today = () => new Date().toISOString().slice(0, 10);
const toAmount = (value: string) => Number(value.replace(/\D/g, "")) || 0;

export default function OfflineTransactionClosings() {
  const { user } = useAuth();
  const [records, setRecords] = useState<OfflineRecord[]>([]);
  const [message, setMessage] = useState("");
  const [collectionEditor, setCollectionEditor] = useState<CollectionEditor | null>(null);
  const [optionalEditor, setOptionalEditor] = useState<OptionalEditor | null>(null);
  const [exceptionNotes, setExceptionNotes] = useState<Record<string, string>>({});
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

  const transactions = useMemo(() => records.flatMap((record) => {
    const details = parseOfflineTransaction(record);
    return details ? [{ record, details }] : [];
  }), [records]);
  const visibleTransactions = useMemo(() => isManager ? transactions : transactions.filter((item) => item.record.userId === userId), [isManager, transactions, userId]);
  const eligibleSources = useMemo(() => records.filter((record) => record.entity === "contract" && !transactions.some((transaction) => transaction.details.sourceContractRecordId === record.id)).flatMap((record) => {
    const preview = createTransactionFromContract(record, records, userId || "danışman");
    return preview ? [{ record, preview }] : [];
  }), [records, transactions, userId]);

  const createTransaction = async (sourceId: string) => {
    const source = records.find((record) => record.id === sourceId);
    if (!source || !userId.trim()) { setMessage("Önce Yerel Çalışma Alanı ekranından offline kullanıcı kodunu kaydedin."); return; }
    const details = createTransactionFromContract(source, records, userId);
    if (!details) { setMessage("Bu sözleşme işlem kapanışına uygun bir satış yetkisi veya kira sözleşmesi değildir."); return; }
    await saveOfflineRecord({ entity: "transaction", title: `${details.transactionNo} — ${details.kind === "sale" ? "SATIŞ" : "KİRA"} İŞLEM KAPANIŞI`, details: JSON.stringify(details), amount: String(transactionExpectedTotal(details)), dueDate: details.collections.map((item) => item.dueDate).filter(Boolean).sort()[0], status: details.status });
    setMessage(`${details.transactionNo} işlem dosyası açıldı. Tahsilat kalemlerini danışman beyan eder; broker manager doğrular ve kapatır.`);
    await refresh();
  };

  const persist = async (record: OfflineRecord, details: OfflineTransactionDetails, success: string) => {
    await updateOfflineRecord(record, { details: JSON.stringify(details), amount: String(transactionExpectedTotal(details)), dueDate: details.collections.map((item) => item.dueDate).filter(Boolean).sort()[0], status: details.status });
    setMessage(success); await refresh();
  };

  const startCollectionEditor = (record: OfflineRecord, details: OfflineTransactionDetails, collectionId: string) => {
    const item = details.collections.find((entry) => entry.id === collectionId); if (!item) return;
    setCollectionEditor({ transactionRecordId: record.id, collectionId, amount: item.collectedAmount ? formatWholeCurrencyInput(String(item.collectedAmount)) : formatWholeCurrencyInput(String(item.expectedAmount)), method: item.method ?? "bankTransfer", reference: item.reference ?? "", collectedAt: item.collectedAt ?? today(), note: item.note ?? "" });
  };

  const saveDeclaration = async (record: OfflineRecord, details: OfflineTransactionDetails) => {
    if (!collectionEditor) return;
    if (!collectionEditor.reference.trim()) { setMessage("Banka transferinde EFT/FAST açıklaması, nakitte makbuz/teslim numarası zorunludur."); return; }
    const next = declareCollection(details, collectionEditor.collectionId, { collectedAmount: toAmount(collectionEditor.amount), method: collectionEditor.method, reference: collectionEditor.reference, collectedAt: collectionEditor.collectedAt, note: collectionEditor.note }, userId || "danışman");
    setCollectionEditor(null); await persist(record, next, "Tahsilat beyanı kaydedildi. Broker manager doğrulaması bekleniyor.");
  };

  const addReservation = async (record: OfflineRecord, details: OfflineTransactionDetails) => {
    if (!optionalEditor) return;
    const expectedAmount = toAmount(optionalEditor.amount);
    if (!expectedAmount) { setMessage("Kapora tutarını girin."); return; }
    const next = addOptionalCollection(details, { category: "reservation", expectedAmount, dueDate: optionalEditor.dueDate }, userId || "danışman");
    setOptionalEditor(null); await persist(record, next, "Opsiyonel kapora kalemi işlem dosyasına eklendi.");
  };

  const managerVerify = async (record: OfflineRecord, details: OfflineTransactionDetails, collectionId: string) => {
    if (!isManager) { setMessage("Tahsilat doğrulaması için broker manager yerel parolasını açın."); return; }
    try { await persist(record, verifyCollection(details, collectionId, user?.name || userId || "broker manager"), "Tahsilat broker manager tarafından doğrulandı."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Tahsilat doğrulanamadı."); }
  };

  const managerClose = async (record: OfflineRecord, details: OfflineTransactionDetails) => {
    if (!isManager) { setMessage("İşlem kapanışı için broker manager yerel parolasını açın."); return; }
    try { await persist(record, closeTransaction(details, user?.name || userId || "broker manager", exceptionNotes[record.id] ?? ""), "İşlem broker manager onayıyla kapatıldı."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "İşlem kapatılamadı."); }
  };

  const submitLocalManagerAccess = async () => { setManagerWorking(true); try { if (!localManagerConfigured) { if (managerPasscode !== managerPasscodeRepeat) throw new Error("Parola tekrarını aynı girin."); await configureLocalManagerPasscode(managerPasscode, user?.name || userId || "broker-manager"); setLocalManagerConfigured(true); setMessage("Yerel broker manager parolası bu cihazda kuruldu ve kapanış yetkisi açıldı."); } else { await unlockLocalManagerAccess(managerPasscode); setMessage("Yerel broker manager yetkisi açıldı."); } setLocalManagerUnlocked(true); setManagerPasscode(""); setManagerPasscodeRepeat(""); } catch (error) { setMessage(error instanceof Error ? error.message : "Yerel yönetici doğrulaması tamamlanamadı."); } finally { setManagerWorking(false); } };
  const lockManagerAccess = () => { lockLocalManagerAccess(); setLocalManagerUnlocked(false); setMessage("Yerel broker manager oturumu kilitlendi."); };
  return <div className="min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9"><header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]"><ClipboardCheck className="h-3.5 w-3.5" /> Offline işlem güvenlik kontrolü</p><h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">İşlem Kapanışları</h1><p className="mt-2 max-w-3xl text-sm text-[#70807c]">Sözleşmeden gelen kapora, depozito, ilk kira, hizmet bedeli ve KDV kalemlerini yalnız back-office takibinde izleyin. Nakit makbuzu veya banka transfer referansı olmadan tahsilat doğrulanmaz; kapanış broker manager onayı gerektirir.</p></div><Button variant="outline" onClick={() => void refresh()} className="rounded-xl bg-white"><RefreshCw className="mr-2 h-4 w-4" /> Yenile</Button></header>
    {message && <p role="status" className="mb-5 rounded-xl border border-[#dbe8df] bg-[#f4fbf6] px-4 py-3 text-sm text-[#287052]">{message}</p>}
    {needsLocalManagerAccess && <Card className="mb-6 rounded-2xl border-[#d8e4df] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-xl"><LockKeyhole className="h-5 w-5 text-[#a17b43]" /> Yerel broker manager doğrulaması</CardTitle><p className="text-xs text-[#70807c]">Bu koruma yalnız bu laptopta geçerlidir. Parola PBKDF2-SHA-256 salt/hash ile saklanır; açık parolayı uygulama tutmaz.</p></CardHeader><CardContent>{localManagerUnlocked ? <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f4fbf6] p-4"><div><p className="text-sm font-semibold text-[#287052]">Broker manager yetkisi açık</p><p className="mt-1 text-xs text-[#60706b]">Kapanış, tahsilat doğrulama ve gerekçeli istisna işlemleri bu oturumda kullanılabilir.</p></div><Button variant="outline" onClick={lockManagerAccess}>Kilitle</Button></div> : <div className="space-y-3"><p className="text-sm text-[#4f5e58]">{localManagerConfigured ? "Kapanış onayını açmak için yerel broker manager parolasını girin." : "Bu cihaz broker manager laptopu ise önce en az 10 karakterlik yerel yönetici parolasını kurun."}</p><div className="grid gap-3 md:grid-cols-2"><Input type="password" autoComplete="new-password" value={managerPasscode} onChange={(event) => setManagerPasscode(event.target.value)} placeholder={localManagerConfigured ? "Yerel yönetici parolası" : "Yeni yerel yönetici parolası (en az 10 karakter)"} />{!localManagerConfigured && <Input type="password" autoComplete="new-password" value={managerPasscodeRepeat} onChange={(event) => setManagerPasscodeRepeat(event.target.value)} placeholder="Parolayı tekrar girin" />}</div><Button onClick={() => void submitLocalManagerAccess()} disabled={managerWorking}>{localManagerConfigured ? "Yetkiyi aç" : "Manager laptopunu kur"}</Button></div>}</CardContent></Card>}
    <Card className="mb-6 rounded-2xl border-[#e5e8e3] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-xl"><CircleDollarSign className="h-5 w-5 text-[#a17b43]" /> Sözleşmeden işlem dosyası aç</CardTitle><p className="text-xs text-[#87938f]">Yalnız satış yetki sözleşmeleri ile imzalı kira sözleşmeleri burada görünür. Kapora isteğe bağlıdır; kayıt oluşturulduktan sonra eklenir.</p></CardHeader><CardContent>{eligibleSources.length ? <div className="grid gap-3 lg:grid-cols-2">{eligibleSources.map(({ record, preview }) => <div key={record.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#edf0ec] p-4"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#34433f]">{preview.sourceContractNo} · {preview.kind === "sale" ? "Satış" : "Kira"}</p><p className="mt-1 truncate text-xs text-[#718079]">{preview.propertyLabel} · {preview.consultantName || "Danışman belirtilmemiş"}</p></div><Button size="sm" onClick={() => void createTransaction(record.id)}><Plus className="mr-1 h-3.5 w-3.5" /> Dosya aç</Button></div>)}</div> : <p className="rounded-xl bg-[#f7f7f4] px-4 py-6 text-center text-sm text-[#718079]">Bu cihazda işlem dosyasına dönüştürülebilecek yeni bir satış yetkisi veya kira sözleşmesi yok.</p>}</CardContent></Card>
    <section className="space-y-5">{visibleTransactions.map(({ record, details }) => {
      const risks = transactionRisks(details); const critical = risks.some((risk) => risk.severity === "critical"); const ownRecord = record.userId === userId;
      return <Card key={record.id} className="rounded-2xl border-[#e5e8e3] bg-white"><CardHeader className="flex flex-col gap-3 border-b border-[#edf0ec] p-5 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><CardTitle className="font-serif text-xl">{details.transactionNo}</CardTitle><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusTone[details.status]}`}>{statusLabel[details.status]}</span>{critical && <span className="rounded-full bg-[#fff0ee] px-2.5 py-1 text-[10px] font-semibold text-[#a04b40]">Risk var</span>}</div><p className="mt-2 text-sm text-[#4f5e58]">{details.kind === "sale" ? "Satış" : "Kira"} · {details.propertyLabel}</p><p className="mt-1 text-xs text-[#718079]">Kaynak sözleşme: {details.sourceContractNo} · Danışman: {details.consultantName || record.userId}</p></div><div className="text-left md:text-right"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#87938f]">Beklenen / doğrulanan</p><p className="mt-1 font-semibold text-[#173e39]">{formatAuthorityCurrency(transactionExpectedTotal(details), "TRY")} / {formatAuthorityCurrency(transactionVerifiedTotal(details), "TRY")}</p></div></CardHeader><CardContent className="space-y-4 p-5">{details.kind === "rental" && <p className="rounded-xl border border-[#dbe8df] bg-[#f4fbf6] px-3 py-2 text-xs text-[#365d53]">Kiracı hizmet bedeli ve %20 KDV kalemleri yalnız bu back-office işlem dosyasında izlenir; kira sözleşmesi veya müşteriye verilen eklerde görünmez.</p>}<div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm"><thead className="border-b border-[#edf0ec] text-left text-[10px] font-semibold uppercase tracking-wide text-[#87938f]"><tr><th className="px-2 py-2">Kalem</th><th className="px-2 py-2">Taraf</th><th className="px-2 py-2">Beklenen</th><th className="px-2 py-2">Beyan</th><th className="px-2 py-2">Yöntem / referans</th><th className="px-2 py-2">Durum</th><th className="px-2 py-2 text-right">İşlem</th></tr></thead><tbody>{details.collections.map((item) => <tr key={item.id} className="border-b border-[#f0f2ef]"><td className="px-2 py-3 font-medium text-[#34433f]">{item.label}{item.dueDate && <small className="mt-1 block text-[10px] text-[#87938f]">Vade: {new Date(`${item.dueDate}T12:00:00`).toLocaleDateString("tr-TR")}</small>}</td><td className="px-2 py-3 text-xs text-[#60706b]">{item.payer === "tenant" ? "Kiracı" : item.payer === "owner" ? "Malik" : "Diğer"}</td><td className="px-2 py-3">{formatAuthorityCurrency(item.expectedAmount, item.currency)}</td><td className="px-2 py-3">{item.collectedAmount ? formatAuthorityCurrency(item.collectedAmount, item.currency) : "—"}</td><td className="px-2 py-3 text-xs text-[#60706b]">{item.method === "cash" ? "Nakit" : item.method === "bankTransfer" ? "Banka transferi" : "—"}{item.reference ? ` · ${item.reference}` : ""}</td><td className="px-2 py-3"><span className="rounded-full bg-[#f1f4f1] px-2 py-1 text-[10px] font-medium text-[#52635d]">{collectionStateLabels[item.state]}</span></td><td className="px-2 py-3 text-right">{(ownRecord || isManager) && item.state !== "verified" && <Button size="sm" variant="outline" onClick={() => startCollectionEditor(record, details, item.id)}>Tahsilat gir</Button>}{isManager && item.state !== "verified" && item.collectedAmount > 0 && <Button size="sm" className="ml-2" onClick={() => void managerVerify(record, details, item.id)}><BadgeCheck className="mr-1 h-3.5 w-3.5" /> Doğrula</Button>}</td></tr>)}</tbody></table></div>
      {(ownRecord || isManager) && <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-[#d9dfd9] bg-[#fbfcfa] p-3"><Banknote className="h-4 w-4 text-[#a17b43]" /><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-[#34433f]">Opsiyonel kapora</p><p className="text-xs text-[#718079]">Kapora varsa ayrı kalem olarak eklenir; yoksa hiçbir kayıt oluşmaz.</p></div><Button size="sm" variant="outline" onClick={() => setOptionalEditor({ transactionRecordId: record.id, amount: "", dueDate: today() })}>Kapora ekle</Button></div>}
      {risks.length > 0 && <div className="rounded-xl border border-[#f0dfd9] bg-[#fffaf8] p-3"><p className="flex items-center gap-2 text-sm font-semibold text-[#8e493e]"><ShieldAlert className="h-4 w-4" /> Risk ve kontrol notları</p><ul className="mt-2 space-y-1 text-xs text-[#7b5d57]">{risks.map((risk, index) => <li key={`${risk.collectionId ?? "general"}-${index}`}>• {risk.message}</li>)}</ul></div>}
      {isManager ? <div className="rounded-xl border border-[#dce8e2] bg-[#f6fbf8] p-4"><p className="flex items-center gap-2 text-sm font-semibold text-[#173e39]"><LockKeyhole className="h-4 w-4" /> Broker manager kapanış kontrolü</p><p className="mt-1 text-xs text-[#60706b]">Kritik risk varsa gerekçeli istisna notu yazmadan kapatılamaz. Bu manuel back-office onayı müşteriye verilen kira/yetki belgelerinde görünmez; işlem snapshot’ında audit olayı olarak saklanır.</p><div className="mt-3 flex flex-col gap-2 md:flex-row"><Textarea value={exceptionNotes[record.id] ?? ""} onChange={(event) => setExceptionNotes((current) => ({ ...current, [record.id]: event.target.value }))} placeholder="Yalnız açık risk varsa gerekçeli istisna notu girin" className="min-h-[72px] flex-1 bg-white" /><Button onClick={() => void managerClose(record, details)} className="self-end bg-[#173e39]"><CheckCircle2 className="mr-2 h-4 w-4" /> {critical ? "Gerekçeli istisna ile kapat" : "İşlemi kapat"}</Button></div></div> : <p className="rounded-xl bg-[#fffaf0] px-4 py-3 text-xs text-[#8d6f3f]">Tahsilat beyanınızı kaydedin; nakit makbuzu veya banka transfer referansı ile broker manager doğrulaması sonrasında işlem kapanır.</p>}
      {collectionEditor?.transactionRecordId === record.id && <div className="rounded-xl border border-[#dbe5dd] bg-[#f8fbf8] p-4"><p className="text-sm font-semibold text-[#34433f]">Tahsilat beyanı</p><div className="mt-3 grid gap-3 md:grid-cols-2"><Input inputMode="numeric" value={collectionEditor.amount} onChange={(event) => setCollectionEditor({ ...collectionEditor, amount: formatWholeCurrencyInput(event.target.value) })} placeholder="Tahsil edilen tutar" /><Select value={collectionEditor.method} onValueChange={(value) => setCollectionEditor({ ...collectionEditor, method: value as PaymentMethod })}><SelectTrigger className="bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bankTransfer">Banka transferi</SelectItem><SelectItem value="cash">Nakit</SelectItem></SelectContent></Select><Input value={collectionEditor.reference} onChange={(event) => setCollectionEditor({ ...collectionEditor, reference: event.target.value })} placeholder="EFT/FAST açıklaması veya makbuz no *" /><Input type="date" value={collectionEditor.collectedAt} onChange={(event) => setCollectionEditor({ ...collectionEditor, collectedAt: event.target.value })} /><Textarea className="md:col-span-2" value={collectionEditor.note} onChange={(event) => setCollectionEditor({ ...collectionEditor, note: event.target.value })} placeholder="Açıklama (opsiyonel)" /></div><div className="mt-3 flex gap-2"><Button onClick={() => void saveDeclaration(record, details)}>Beyanı kaydet</Button><Button variant="outline" onClick={() => setCollectionEditor(null)}>Vazgeç</Button></div></div>}
      {optionalEditor?.transactionRecordId === record.id && <div className="rounded-xl border border-[#eadfca] bg-[#fffaf0] p-4"><p className="text-sm font-semibold text-[#6f542c]">Kapora kalemi ekle</p><div className="mt-3 grid gap-3 md:grid-cols-2"><Input inputMode="numeric" value={optionalEditor.amount} onChange={(event) => setOptionalEditor({ ...optionalEditor, amount: formatWholeCurrencyInput(event.target.value) })} placeholder="Beklenen kapora tutarı" /><Input type="date" value={optionalEditor.dueDate} onChange={(event) => setOptionalEditor({ ...optionalEditor, dueDate: event.target.value })} /></div><div className="mt-3 flex gap-2"><Button onClick={() => void addReservation(record, details)}>Kapora kalemini ekle</Button><Button variant="outline" onClick={() => setOptionalEditor(null)}>Vazgeç</Button></div></div>}
      </CardContent></Card>;
    })}</section>{!visibleTransactions.length && <Card className="rounded-2xl border-[#e5e8e3] bg-white"><CardContent className="py-12 text-center text-sm text-[#718079]"><AlertTriangle className="mx-auto mb-3 h-6 w-6 text-[#bd975d]" />Henüz görünür işlem kapanış dosyası yok.</CardContent></Card>}</div>;
}
