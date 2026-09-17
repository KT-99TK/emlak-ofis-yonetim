import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, FileSignature, Printer, Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { BanaHatirlatButton } from "@/components/PersonalTaskPanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatTurkishDate } from "@/lib/turkishDate";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatWholeCurrencyInput } from "@/lib/authorityContract";

const labels: Record<string, string> = { rental: "Kira", sale: "Satış", authority: "Yetki" };
const statusLabels: Record<string, string> = { draft: "Taslak", review: "İncelemede", approved: "Onaylandı", signed: "İmzalandı", active: "Aktif", completed: "Tamamlandı", cancelled: "İptal" };

export default function Contracts() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [consultantCode, setConsultantCode] = useState("");
  const contracts = trpc.contracts.list.useQuery({ includeInactive, consultantCode: consultantCode.trim() || undefined });
  const clients = trpc.clients.list.useQuery();
  const nextNumber = trpc.contracts.nextNumber.useQuery();
  const [type, setType] = useState<"rental" | "sale" | "authority">("rental");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [quickClientName, setQuickClientName] = useState("");
  const [title, setTitle] = useState("");
  const [contractNo, setContractNo] = useState("");
  const [lastCreatedContractNo, setLastCreatedContractNo] = useState("");
  const [amount, setAmount] = useState("");
  const [evictionNoticeDays, setEvictionNoticeDays] = useState("60");
  const [evictionNoticeDate, setEvictionNoticeDate] = useState("");
  const [ownerApprovalStatus, setOwnerApprovalStatus] = useState<"notRequired" | "pending" | "approved" | "rejected">("pending");
  const [ownerApprovalNote, setOwnerApprovalNote] = useState("");
  const [approvalDecisionNote, setApprovalDecisionNote] = useState("");
  const [search, setSearch] = useState("");
  const [revealContractId, setRevealContractId] = useState<number | null>(null);
  const [revealReason, setRevealReason] = useState("");
  const [revealedFields, setRevealedFields] = useState<Record<string, string> | null>(null);
  const [printPreviewHtml, setPrintPreviewHtml] = useState<string | null>(null);

  const requestOwnerApproval = trpc.contracts.requestOwnerApproval.useMutation({ onSuccess: () => utils.contracts.list.invalidate() });
  const decideOwnerApproval = trpc.contracts.decideOwnerApproval.useMutation({ onSuccess: () => { setApprovalDecisionNote(""); utils.contracts.list.invalidate(); } });
  const create = trpc.contracts.create.useMutation({ onSuccess: () => { setLastCreatedContractNo(contractNo); setTitle(""); setAmount(""); setOwnerApprovalNote(""); utils.contracts.list.invalidate(); utils.contracts.nextNumber.invalidate(); } });
  const createQuickClient = trpc.clients.create.useMutation({ onSuccess: (clientId) => { setSelectedClientId(String(clientId)); setQuickClientName(""); setQuickClientOpen(false); utils.clients.list.invalidate(); } });
  const matchingQuickClient = useMemo(() => {
    const normalized = quickClientName.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
    if (normalized.length < 2) return null;
    return (clients.data ?? []).find(client => client.name.trim().toLocaleLowerCase("tr-TR").replace(/\s+/g, " ") === normalized) ?? null;
  }, [clients.data, quickClientName]);
  const submitQuickClient = () => {
    if (matchingQuickClient) {
      setSelectedClientId(String(matchingQuickClient.id));
      setQuickClientName("");
      setQuickClientOpen(false);
      return;
    }
    if (quickClientName.trim().length >= 2) createQuickClient.mutate({ name: quickClientName.trim() });
  };
  const transition = trpc.contracts.transition.useMutation({ onSuccess: () => utils.contracts.list.invalidate() });
  const revealSensitive = trpc.contracts.revealSensitive.useMutation({ onSuccess: (result) => { setRevealedFields(result.fields); setRevealContractId(null); setRevealReason(""); } });

  useEffect(() => {
    if (!revealedFields) return;
    const timer = window.setTimeout(() => setRevealedFields(null), 30_000);
    return () => window.clearTimeout(timer);
  }, [revealedFields]);

  useEffect(() => {
    const suggestion = nextNumber.data?.nextContractNo;
    if (suggestion && (!contractNo || contractNo === lastCreatedContractNo)) setContractNo(suggestion);
  }, [contractNo, lastCreatedContractNo, nextNumber.data?.nextContractNo]);

  const visibleContracts = useMemo(() => {
    const term = search.trim().toUpperCase();
    if (!term) return contracts.data ?? [];
    return (contracts.data ?? []).filter((item) => item.contractNo.toUpperCase().includes(term) || item.title.toLocaleUpperCase("tr-TR").includes(search.trim().toLocaleUpperCase("tr-TR")));
  }, [contracts.data, search]);

  const printFilteredContractsPdf = () => {
    const safe = (value: unknown) => String(value ?? "").replace(/[&<>\"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
    const rows = visibleContracts.map(item => `<tr><td>${safe(item.contractNo)}</td><td>${safe(item.title)}</td><td>${safe(labels[item.type])}</td><td>${safe(item.status)}</td><td>${safe(item.amount)}</td></tr>`).join("");
    const filterSummary = `${includeInactive ? "Aktif + pasif/arşiv" : "Yalnız aktif"} · Danışman: ${consultantCode.trim() || "kapsama göre"} · Arama: ${search.trim() || "yok"}`;
    setPrintPreviewHtml(`<h1>GLOBAL 1881 — SÖZLEŞME KAYITLARI</h1><p>Filtreler: ${safe(filterSummary)} · Kayıt sayısı: ${visibleContracts.length}</p><table><thead><tr><th>Sözleşme No</th><th>Başlık</th><th>Tür</th><th>Durum</th><th>Bedel</th></tr></thead><tbody>${rows || '<tr><td colspan="5">Filtreye uyan sözleşme bulunamadı.</td></tr>'}</tbody></table>`);
  };

  const submit = () => {
    if (!title || !contractNo || !selectedClientId || !nextNumber.data?.consultantCode) return;
    create.mutate({
      type,
      title,
      clientId: selectedClientId ? Number(selectedClientId) : undefined,
      contractNo,
      amount: amount || undefined,
      evictionNoticeDays: type === "rental" ? Number(evictionNoticeDays) || 60 : undefined,
      evictionNoticeDate: type === "rental" && evictionNoticeDate ? new Date(`${evictionNoticeDate}T12:00:00`) : undefined,
      ownerApprovalStatus: type === "rental" ? ownerApprovalStatus : "notRequired",
      ownerApprovalNote: type === "rental" ? ownerApprovalNote || undefined : undefined,
    });
  };

  const canCreate = Boolean(nextNumber.data?.consultantCode && contractNo && title && selectedClientId) && !create.isPending;

  return <div className="min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9">
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]">Merkezi sözleşme kayıt alanı</p><h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Sözleşme Kayıtları</h1><p className="mt-2 max-w-2xl text-sm text-[#70807c]">Kira, satış ve yetki sözleşmelerini kodlu taslak, onay ve tahliye bilgileriyle izleyin. İmzaya hazır A4 belgeler Windows offline çalışma alanında hazırlanır.</p><img src="/manus-storage/21_muhur_seffaf_9a34c4d4.png" alt="Global 1881 mühür" className="hidden print:block print:absolute print:right-10 print:top-10 print:h-24 print:w-24 print:object-contain" /></div><Button onClick={() => window.print()} variant="outline" className="rounded-xl bg-white"><Printer className="mr-2 h-4 w-4" /> Yazdır</Button></header>
    <div className="grid gap-6 xl:grid-cols-[minmax(340px,.72fr)_minmax(0,1.28fr)]">
      <Card className="rounded-2xl border-[#dfe8e1] bg-white shadow-[0_12px_28px_rgba(23,62,57,.06)]">
        <CardHeader className="border-b border-[#edf1ed] px-5 py-4"><div className="flex items-start justify-between gap-3"><div><CardTitle className="font-serif text-xl text-[#223230]">Yeni sözleşme</CardTitle><p className="mt-1 text-xs text-[#718079]">Müşteri kütüğünden kayıt seçin; sözleşmeye ait bilgileri kısa formdan tamamlayın.</p></div><span className="rounded-full bg-[#edf5ef] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#287052]">Adım 1/2</span></div></CardHeader>
        <CardContent className="space-y-3 px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="mb-1 block text-[11px] font-semibold text-[#56635f]">Sözleşme türü</label><Select value={type} onValueChange={(value) => setType(value as typeof type)}><SelectTrigger className="h-10 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rental">Kira sözleşmesi</SelectItem><SelectItem value="sale">Satış sözleşmesi</SelectItem><SelectItem value="authority">Yetki sözleşmesi</SelectItem></SelectContent></Select></div>
            <div><div className="mb-1 flex items-center justify-between gap-2"><label className="text-[11px] font-semibold text-[#56635f]">Müşteri kütüğü</label><Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-[#173e39]" onClick={() => setQuickClientOpen(true)}><Plus className="mr-1 h-3 w-3" />Yeni müşteri</Button></div><Select value={selectedClientId} onValueChange={setSelectedClientId}><SelectTrigger className="h-10 bg-white"><SelectValue placeholder={clients.isLoading ? "Müşteriler yükleniyor…" : "Müşteri no / ad seçin"} /></SelectTrigger><SelectContent>{clients.isLoading ? <SelectItem value="__loading-client" disabled>Müşteriler yükleniyor…</SelectItem> : (clients.data ?? []).length ? (clients.data ?? []).map((client) => <SelectItem key={client.id} value={String(client.id)}>{client.referenceNo ? `${client.referenceNo} · ` : ""}{client.name}{client.consultantCode ? ` · ${client.consultantCode}` : ""}</SelectItem>) : <SelectItem value="__empty-client" disabled>Müşteri kütüğünde kayıt yok</SelectItem>}</SelectContent></Select><p className="mt-1 text-[10px] text-[#8b9691]">Seçilen müşteri sözleşme kaydına bağlanır; müşteri verisi kütükten çağrılır. Yeni müşteri kaydı merkezi numara alır.</p></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-[11px] font-semibold text-[#56635f]">Kayıt numarası</label><Input value={contractNo} readOnly aria-readonly="true" placeholder="IP1-001" className="h-10 bg-[#f7f7f4] font-mono text-xs font-semibold tracking-wide" /></div><div><label className="mb-1 block text-[11px] font-semibold text-[#56635f]">Danışman kodu</label><div className="flex h-10 items-center rounded-md border border-[#dce8df] bg-[#f7f9f6] px-3 font-mono text-xs font-bold text-[#173e39]">{nextNumber.isLoading ? "Kod yükleniyor…" : nextNumber.data?.consultantCode ?? "Kod tanımlı değil"}</div></div></div>
          {nextNumber.isError && <p role="alert" className="rounded-lg bg-[#fff3ef] p-2.5 text-xs text-[#a85745]">Danışman kodu alınamadı. Ekip Yönetimi ekranından kod tanımını kontrol edin.</p>}
          {!nextNumber.isLoading && !nextNumber.data?.consultantCode && <p role="alert" className="rounded-lg bg-[#fff8e8] p-2.5 text-xs text-[#8c6630]">Danışman kodu tanımlanmadan sözleşme kaydı açılamaz.</p>}
          <div><label className="mb-1 block text-[11px] font-semibold text-[#56635f]">Başlık</label><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Taşınmaz / taraf özeti" className="h-10" /></div>
          <div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-[11px] font-semibold text-[#56635f]">Bedel (₺)</label><Input value={amount} onChange={(event) => setAmount(formatWholeCurrencyInput(event.target.value))} inputMode="numeric" placeholder="Örn. 450.000 (kuruşsuz, TL)" className="h-10" /></div>{type === "rental" && <div><label className="mb-1 block text-[11px] font-semibold text-[#56635f]">Tahliye ihbarı (gün)</label><Input type="number" min="1" value={evictionNoticeDays} onChange={(event) => setEvictionNoticeDays(event.target.value)} className="h-10" /></div>}</div>
          {type === "rental" && <div className="grid gap-3 rounded-xl border border-[#e5ede8] bg-[#f8fbf8] p-3 sm:grid-cols-2"><div><label className="mb-1 block text-[11px] font-semibold text-[#56635f]">Tahliye tarihi</label><Input type="date" value={evictionNoticeDate} onChange={(event) => setEvictionNoticeDate(event.target.value)} className="h-10 bg-white" /></div><div><label className="mb-1 block text-[11px] font-semibold text-[#56635f]">Mülk sahibi onayı</label><Select value={ownerApprovalStatus} onValueChange={(value) => setOwnerApprovalStatus(value as typeof ownerApprovalStatus)}><SelectTrigger className="h-10 bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Onay bekliyor</SelectItem><SelectItem value="approved">Onaylandı</SelectItem><SelectItem value="rejected">Reddedildi</SelectItem></SelectContent></Select></div><Input value={ownerApprovalNote} onChange={(event) => setOwnerApprovalNote(event.target.value)} placeholder="Mülk sahibi onay notu" className="h-10 bg-white sm:col-span-2" /></div>}
          <Button onClick={submit} disabled={!canCreate} className="h-10 w-full rounded-xl bg-[#173e39] hover:bg-[#20554e]"><Plus className="mr-2 h-4 w-4" /> {create.isPending ? "Kaydediliyor…" : "Taslak oluştur"}</Button>
          {create.isError && <p role="alert" className="text-xs text-[#a85745]">{create.error.message}</p>}{lastCreatedContractNo && <p role="status" className="rounded-lg bg-[#edf8f0] px-3 py-2 text-xs font-semibold text-[#287052]">{lastCreatedContractNo} taslak olarak kaydedildi.</p>}
        </CardContent>
      </Card>
      <Card className="rounded-2xl border-[#e5e8e3] bg-white/80"><CardHeader className="gap-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="font-serif text-xl">Sözleşme kayıtları</CardTitle><p className="text-xs text-[#87938f]">Rolünüze göre görünür merkezi sözleşmeler</p></div><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={printFilteredContractsPdf} aria-label="Filtreli sözleşme PDF yazdır"><Printer className="mr-1.5 h-4 w-4" /> PDF</Button><Button variant="ghost" size="icon" onClick={() => contracts.refetch()} aria-label="Sözleşmeleri yenile"><RefreshCw className="h-4 w-4" /></Button></div></div><div className="flex flex-wrap gap-2"><Select value={includeInactive ? "all" : "active"} onValueChange={(value) => setIncludeInactive(value === "all")}><SelectTrigger className="w-[190px] bg-white" aria-label="Sözleşme durum filtresi"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Yalnız aktif sözleşmeler</SelectItem><SelectItem value="all">Pasif/arşiv dahil</SelectItem></SelectContent></Select><Input value={consultantCode} onChange={(event) => setConsultantCode(event.target.value.toUpperCase())} placeholder="Danışman kodu (manager)" aria-label="Danışman kodu filtresi" /><Input value={search} onChange={(event) => setSearch(event.target.value.toUpperCase())} placeholder="Sözleşme no veya başlıkla ara: IP1-001" aria-label="Sözleşme ara" /></div></CardHeader><CardContent>{contracts.isLoading ? <p role="status" className="py-10 text-center text-sm text-[#87938f]">Sözleşmeler yükleniyor…</p> : contracts.isError ? <p role="alert" className="py-10 text-center text-sm text-[#a85745]">Sözleşmeler alınamadı.</p> : !contracts.data?.length ? <div className="rounded-xl bg-[#f7f7f4] px-4 py-10 text-center text-sm text-[#87938f]"><FileSignature className="mx-auto mb-3 h-6 w-6 text-[#bd975d]" />Henüz sözleşme kaydı yok.</div> : !visibleContracts.length ? <p className="rounded-xl bg-[#f7f7f4] px-4 py-10 text-center text-sm text-[#87938f]">Bu aramayla eşleşen sözleşme bulunamadı.</p> : <div className="space-y-2">{visibleContracts.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#edf0ec] p-4"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8dfcc] text-[#8d6f3f]"><FileSignature className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#34433f]">{item.title}</p><p className="mt-1 font-mono text-[10px] font-semibold text-[#556861]">{item.contractNo} · {labels[item.type]}{item.evictionNoticeDays ? ` · tahliye ihbarı ${item.evictionNoticeDays} gün` : ""}{item.evictionNoticeDate ? ` · ${formatTurkishDate(item.evictionNoticeDate)}` : ""}</p><p className="mt-1 text-[10px] text-[#8d6f3f]">Mülk sahibi onayı: {item.ownerApprovalStatus === "approved" ? "onaylandı" : item.ownerApprovalStatus === "rejected" ? "reddedildi" : item.ownerApprovalStatus === "pending" ? "bekliyor" : "gerekli değil"}{item.ownerApprovalDate ? ` · ${formatTurkishDate(item.ownerApprovalDate)}` : ""}{item.ownerApprovalNote ? ` · ${item.ownerApprovalNote}` : ""}</p></div><span className="rounded-full bg-[#eef1ed] px-2.5 py-1 text-[10px] font-semibold text-[#60706b]">{statusLabels[item.status]}</span><BanaHatirlatButton seed={{ title: `${labels[item.type]} takibi: ${item.title}`, linkedEntityType: "contract", linkedEntityId: item.id, linkedLabel: `${item.contractNo} · ${item.title}`, linkedPath: "/contracts" }} className="h-8 px-2.5" />{item.status === "draft" && <Button size="sm" variant="outline" onClick={() => transition.mutate({ id: item.id, status: "review" })}>İncelemeye gönder</Button>}{item.type === "rental" && item.ownerApprovalStatus !== "approved" && <Button size="sm" variant="outline" onClick={() => requestOwnerApproval.mutate({ id: item.id })}>Onaya gönder</Button>}{item.canRevealSensitive && <Button size="sm" variant="outline" className="border-[#d7b270] text-[#74561f]" onClick={() => { setRevealContractId(item.id); setRevealReason(""); }}><Eye className="mr-1.5 h-3.5 w-3.5" /> Hassas alanı aç</Button>}{user?.role === "admin" && item.ownerApprovalStatus === "pending" && <><Input className="h-8 max-w-[220px]" value={approvalDecisionNote} onChange={(event) => setApprovalDecisionNote(event.target.value)} placeholder="Karar açıklaması (zorunlu)" aria-label="Owner approval karar açıklaması" /><Button size="sm" disabled={!approvalDecisionNote.trim() || decideOwnerApproval.isPending} onClick={() => decideOwnerApproval.mutate({ id: item.id, decision: "approved", note: approvalDecisionNote.trim() })}>Onayla</Button><Button size="sm" variant="outline" disabled={!approvalDecisionNote.trim() || decideOwnerApproval.isPending} onClick={() => decideOwnerApproval.mutate({ id: item.id, decision: "rejected", note: approvalDecisionNote.trim() })}>Reddet</Button></>}</div>)}</div>}</CardContent></Card>
    </div>
          <Dialog open={quickClientOpen} onOpenChange={setQuickClientOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle className="font-serif text-xl text-[#223230]">Kütüğe hızlı müşteri kaydı</DialogTitle><DialogDescription>Bu kayıt müşteri kütüğüne eklenir ve sözleşme için otomatik merkezi müşteri numarası alır.</DialogDescription></DialogHeader><Input autoFocus value={quickClientName} onChange={(event) => setQuickClientName(event.target.value)} placeholder="Müşteri adı / unvanı" aria-label="Yeni müşteri adı" />{matchingQuickClient && <div className="rounded-lg border border-[#e7c98e] bg-[#fff8e8] p-3 text-xs text-[#755b28]">Bu adla kayıtlı müşteri bulundu: <strong>{matchingQuickClient.referenceNo || matchingQuickClient.id} · {matchingQuickClient.name}</strong>. Yeni kayıt açmak yerine mevcut kaydı sözleşmeye bağlayabilirsiniz.</div>}<DialogFooter><Button type="button" variant="outline" onClick={() => setQuickClientOpen(false)}>Vazgeç</Button>{matchingQuickClient ? <Button type="button" onClick={submitQuickClient} className="bg-[#173e39] hover:bg-[#20554e]">Mevcut kaydı seç</Button> : <Button type="button" disabled={quickClientName.trim().length < 2 || createQuickClient.isPending} onClick={submitQuickClient} className="bg-[#173e39] hover:bg-[#20554e]">{createQuickClient.isPending ? "Kaydediliyor…" : "Kütüğe kaydet"}</Button>}</DialogFooter>{createQuickClient.isError && <p role="alert" className="text-xs text-[#a85745]">{createQuickClient.error.message}</p>}</DialogContent></Dialog>
      {printPreviewHtml && <div className="contracts-print-preview" role="dialog" aria-label="Sözleşme PDF yazdırma önizlemesi"><div className="print-preview-controls"><p>PDF önizlemesi hazır. Tarayıcı yazdırma penceresinden “PDF olarak kaydet” seçeneğini kullanabilirsiniz.</p><div className="flex gap-2"><Button variant="outline" onClick={() => setPrintPreviewHtml(null)}>Kapat</Button><Button onClick={() => window.print()} className="bg-[#173e39] hover:bg-[#20554e]"><Printer className="mr-2 h-4 w-4" /> Yazdır / PDF olarak kaydet</Button></div></div><article className="contracts-print-paper" dangerouslySetInnerHTML={{ __html: printPreviewHtml }} /></div>}
    <Dialog open={revealContractId !== null} onOpenChange={(open) => { if (!open && !revealSensitive.isPending) setRevealContractId(null); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="font-serif text-xl text-[#223230]">Sözleşme hassas alan erişimi</DialogTitle><DialogDescription>Kimlik ve telefon değerleri yalnız bu pencerede 30 saniye gösterilir. Gerekçe audit kaydına eklenir; değerlerin kendisi kaydedilmez.</DialogDescription></DialogHeader>
        <Textarea value={revealReason} onChange={(event) => setRevealReason(event.target.value)} placeholder="Örn. fizikî imzalı nüsha ile kimlik eşleştirmesi" aria-label="Görüntüleme gerekçesi" />
        {revealSensitive.error && <p role="alert" className="text-sm text-[#a85745]">{revealSensitive.error.message}</p>}
        {revealedFields && <div className="rounded-lg border border-[#d7b270] bg-[#fffaf0] p-3 text-xs text-[#4a4130]">{Object.entries(revealedFields).length ? Object.entries(revealedFields).map(([field, value]) => <p key={field}><strong>{field}:</strong> {value}</p>) : <p>Bu sözleşmede şifreli hassas alan bulunmuyor.</p>}</div>}
        <DialogFooter><Button variant="outline" onClick={() => { setRevealContractId(null); setRevealedFields(null); }} disabled={revealSensitive.isPending}>Gizle / Vazgeç</Button><Button className="bg-[#173e39] hover:bg-[#20554e]" disabled={revealReason.trim().length < 8 || revealSensitive.isPending} onClick={() => revealContractId && revealSensitive.mutate({ contractId: revealContractId, reason: revealReason.trim() })}><Eye className="mr-2 h-4 w-4" /> Tam değeri aç</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
