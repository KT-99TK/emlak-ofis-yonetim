import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSignature, Printer, Plus, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatTurkishDate } from "@/lib/turkishDate";

const labels: Record<string, string> = { rental: "Kira", sale: "Satış", authority: "Yetki" };
const statusLabels: Record<string, string> = { draft: "Taslak", review: "İncelemede", approved: "Onaylandı", signed: "İmzalandı", active: "Aktif", completed: "Tamamlandı", cancelled: "İptal" };

export default function Contracts() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const contracts = trpc.contracts.list.useQuery();
  const nextNumber = trpc.contracts.nextNumber.useQuery();
  const [type, setType] = useState<"rental" | "sale" | "authority">("rental");
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

  const requestOwnerApproval = trpc.contracts.requestOwnerApproval.useMutation({ onSuccess: () => utils.contracts.list.invalidate() });
  const decideOwnerApproval = trpc.contracts.decideOwnerApproval.useMutation({ onSuccess: () => { setApprovalDecisionNote(""); utils.contracts.list.invalidate(); } });
  const create = trpc.contracts.create.useMutation({ onSuccess: () => { setLastCreatedContractNo(contractNo); setTitle(""); setAmount(""); setOwnerApprovalNote(""); utils.contracts.list.invalidate(); utils.contracts.nextNumber.invalidate(); } });
  const transition = trpc.contracts.transition.useMutation({ onSuccess: () => utils.contracts.list.invalidate() });

  useEffect(() => {
    const suggestion = nextNumber.data?.nextContractNo;
    if (suggestion && (!contractNo || contractNo === lastCreatedContractNo)) setContractNo(suggestion);
  }, [contractNo, lastCreatedContractNo, nextNumber.data?.nextContractNo]);

  const visibleContracts = useMemo(() => {
    const term = search.trim().toUpperCase();
    if (!term) return contracts.data ?? [];
    return (contracts.data ?? []).filter((item) => item.contractNo.toUpperCase().includes(term) || item.title.toLocaleUpperCase("tr-TR").includes(search.trim().toLocaleUpperCase("tr-TR")));
  }, [contracts.data, search]);

  const submit = () => {
    if (!title || !contractNo || !nextNumber.data?.consultantCode) return;
    create.mutate({
      type,
      title,
      contractNo,
      amount: amount || undefined,
      evictionNoticeDays: type === "rental" ? Number(evictionNoticeDays) || 60 : undefined,
      evictionNoticeDate: type === "rental" && evictionNoticeDate ? new Date(`${evictionNoticeDate}T12:00:00`) : undefined,
      ownerApprovalStatus: type === "rental" ? ownerApprovalStatus : "notRequired",
      ownerApprovalNote: type === "rental" ? ownerApprovalNote || undefined : undefined,
    });
  };

  const canCreate = Boolean(nextNumber.data?.consultantCode && contractNo && title) && !create.isPending;

  return <div className="min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9">
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]">Merkezi sözleşme kayıt alanı</p><h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Sözleşme Kayıtları</h1><p className="mt-2 max-w-2xl text-sm text-[#70807c]">Kira, satış ve yetki sözleşmelerini kodlu taslak, onay ve tahliye bilgileriyle izleyin. İmzaya hazır A4 belgeler Windows offline çalışma alanında hazırlanır.</p><img src="/manus-storage/21_muhur_seffaf_9a34c4d4.png" alt="Global 1881 mühür" className="hidden print:block print:absolute print:right-10 print:top-10 print:h-24 print:w-24 print:object-contain" /></div><Button onClick={() => window.print()} variant="outline" className="rounded-xl bg-white"><Printer className="mr-2 h-4 w-4" /> Yazdır</Button></header>
    <div className="grid gap-6 xl:grid-cols-[minmax(340px,.72fr)_minmax(0,1.28fr)]">
      <Card className="rounded-2xl border-[#e5e8e3] bg-white/80"><CardHeader><CardTitle className="font-serif text-xl">Yeni sözleşme kaydı</CardTitle><p className="text-xs text-[#87938f]">Numara, kendi danışman kodunuzla otomatik verilir. Örneğin IP1-001 veya KT1-001.</p></CardHeader><CardContent className="space-y-4">
        <div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Sözleşme türü</label><Select value={type} onValueChange={(value) => setType(value as typeof type)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rental">Kira sözleşmesi</SelectItem><SelectItem value="sale">Satış sözleşmesi</SelectItem><SelectItem value="authority">Yetki sözleşmesi</SelectItem></SelectContent></Select></div>
        <div className="rounded-xl border border-[#dce8df] bg-[#f8fbf8] p-3"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4b8878]">Danışman kodu</p><p className="mt-1 text-sm font-bold text-[#173e39]">{nextNumber.isLoading ? "Kod yükleniyor…" : nextNumber.data?.consultantCode ?? "Kod tanımlı değil"}</p><p className="mt-1 text-xs text-[#718079]">Kodlar ekip yönetiminde büyük harfle tanımlanır: IP1, KT1, CT1; çakışmada CT2, CT3.</p></div>
        <div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Kayıt numarası</label><Input value={contractNo} readOnly aria-readonly="true" placeholder="IP1-001" className="bg-[#f7f7f4] font-mono font-semibold tracking-wide" />{nextNumber.data?.nextContractNo && <p className="mt-1.5 text-[11px] text-[#587069]">Sıradaki kullanılabilir numara otomatik önerildi.</p>}</div>
        {nextNumber.isError && <p role="alert" className="rounded-lg bg-[#fff3ef] p-3 text-xs text-[#a85745]">Danışman kodu alınamadı. Ekip Yönetimi ekranından hesabınıza kod tanımlandığını kontrol edin.</p>}
        {!nextNumber.isLoading && !nextNumber.data?.consultantCode && <p role="alert" className="rounded-lg bg-[#fff8e8] p-3 text-xs text-[#8c6630]">Bu hesap için danışman kodu tanımlanmadan yeni sözleşme kaydı açılamaz.</p>}
        <div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Başlık</label><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Taşınmaz / taraf özeti" /></div>
        <div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Bedel (₺)</label><Input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder="450000" /></div>
        {type === "rental" && <><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Tahliye ihbar süresi (gün)</label><Input type="number" min="1" value={evictionNoticeDays} onChange={(event) => setEvictionNoticeDays(event.target.value)} /></div><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Tahliye tarihi</label><Input type="date" value={evictionNoticeDate} onChange={(event) => setEvictionNoticeDate(event.target.value)} /></div><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Mülk sahibi onayı</label><Select value={ownerApprovalStatus} onValueChange={(value) => setOwnerApprovalStatus(value as typeof ownerApprovalStatus)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Onay bekliyor</SelectItem><SelectItem value="approved">Onaylandı</SelectItem><SelectItem value="rejected">Reddedildi</SelectItem></SelectContent></Select></div><Input value={ownerApprovalNote} onChange={(event) => setOwnerApprovalNote(event.target.value)} placeholder="Mülk sahibi onay notu" /></>}
        <Button onClick={submit} disabled={!canCreate} className="w-full rounded-xl bg-[#173e39] hover:bg-[#20554e]"><Plus className="mr-2 h-4 w-4" /> {create.isPending ? "Kaydediliyor…" : "Taslak oluştur"}</Button>
        {create.isError && <p role="alert" className="text-xs text-[#a85745]">{create.error.message}</p>}
      </CardContent></Card>
      <Card className="rounded-2xl border-[#e5e8e3] bg-white/80"><CardHeader className="gap-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="font-serif text-xl">Sözleşme kayıtları</CardTitle><p className="text-xs text-[#87938f]">Rolünüze göre görünür merkezi sözleşmeler</p></div><Button variant="ghost" size="icon" onClick={() => contracts.refetch()} aria-label="Sözleşmeleri yenile"><RefreshCw className="h-4 w-4" /></Button></div><Input value={search} onChange={(event) => setSearch(event.target.value.toUpperCase())} placeholder="Sözleşme no veya başlıkla ara: IP1-001" aria-label="Sözleşme ara" /></CardHeader><CardContent>{contracts.isLoading ? <p role="status" className="py-10 text-center text-sm text-[#87938f]">Sözleşmeler yükleniyor…</p> : contracts.isError ? <p role="alert" className="py-10 text-center text-sm text-[#a85745]">Sözleşmeler alınamadı.</p> : !contracts.data?.length ? <div className="rounded-xl bg-[#f7f7f4] px-4 py-10 text-center text-sm text-[#87938f]"><FileSignature className="mx-auto mb-3 h-6 w-6 text-[#bd975d]" />Henüz sözleşme kaydı yok.</div> : !visibleContracts.length ? <p className="rounded-xl bg-[#f7f7f4] px-4 py-10 text-center text-sm text-[#87938f]">Bu aramayla eşleşen sözleşme bulunamadı.</p> : <div className="space-y-2">{visibleContracts.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#edf0ec] p-4"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8dfcc] text-[#8d6f3f]"><FileSignature className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#34433f]">{item.title}</p><p className="mt-1 font-mono text-[10px] font-semibold text-[#556861]">{item.contractNo} · {labels[item.type]}{item.evictionNoticeDays ? ` · tahliye ihbarı ${item.evictionNoticeDays} gün` : ""}{item.evictionNoticeDate ? ` · ${formatTurkishDate(item.evictionNoticeDate)}` : ""}</p><p className="mt-1 text-[10px] text-[#8d6f3f]">Mülk sahibi onayı: {item.ownerApprovalStatus === "approved" ? "onaylandı" : item.ownerApprovalStatus === "rejected" ? "reddedildi" : item.ownerApprovalStatus === "pending" ? "bekliyor" : "gerekli değil"}{item.ownerApprovalDate ? ` · ${formatTurkishDate(item.ownerApprovalDate)}` : ""}{item.ownerApprovalNote ? ` · ${item.ownerApprovalNote}` : ""}</p></div><span className="rounded-full bg-[#eef1ed] px-2.5 py-1 text-[10px] font-semibold text-[#60706b]">{statusLabels[item.status]}</span>{item.status === "draft" && <Button size="sm" variant="outline" onClick={() => transition.mutate({ id: item.id, status: "review" })}>İncelemeye gönder</Button>}{item.type === "rental" && item.ownerApprovalStatus !== "approved" && <Button size="sm" variant="outline" onClick={() => requestOwnerApproval.mutate({ id: item.id })}>Onaya gönder</Button>}{user?.role === "admin" && item.ownerApprovalStatus === "pending" && <><Input className="h-8 max-w-[220px]" value={approvalDecisionNote} onChange={(event) => setApprovalDecisionNote(event.target.value)} placeholder="Karar açıklaması (zorunlu)" aria-label="Owner approval karar açıklaması" /><Button size="sm" disabled={!approvalDecisionNote.trim() || decideOwnerApproval.isPending} onClick={() => decideOwnerApproval.mutate({ id: item.id, decision: "approved", note: approvalDecisionNote.trim() })}>Onayla</Button><Button size="sm" variant="outline" disabled={!approvalDecisionNote.trim() || decideOwnerApproval.isPending} onClick={() => decideOwnerApproval.mutate({ id: item.id, decision: "rejected", note: approvalDecisionNote.trim() })}>Reddet</Button></>}</div>)}</div>}</CardContent></Card>
    </div>
  </div>;
}
