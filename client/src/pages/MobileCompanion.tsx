import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, BellRing, Building2, FileText, LogOut, Paperclip, RefreshCw, ShieldCheck, Upload, UsersRound } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";

type MobileSection = "gundem" | "kayitlar" | "sozlesmeler" | "belgeler";

function formatDate(value: unknown) {
  if (!value) return "Tarih belirtilmemiş";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "Tarih belirtilmemiş" : new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export default function MobileCompanion() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [section, setSection] = useState<MobileSection>("gundem");
  const [selectedContractId, setSelectedContractId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [invalidationId, setInvalidationId] = useState<number | null>(null);
  const [invalidationReason, setInvalidationReason] = useState("");
  const [invalidationConfirmation, setInvalidationConfirmation] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const summary = trpc.dashboard.summary.useQuery(undefined, { enabled: isAuthenticated, refetchOnWindowFocus: true });
  const clients = trpc.clients.list.useQuery(undefined, { enabled: isAuthenticated, refetchOnWindowFocus: true });
  const properties = trpc.properties.list.useQuery(undefined, { enabled: isAuthenticated, refetchOnWindowFocus: true });
  const contracts = trpc.contracts.list.useQuery(undefined, { enabled: isAuthenticated, refetchOnWindowFocus: true });
  const obligations = trpc.obligations.list.useQuery(undefined, { enabled: isAuthenticated, refetchOnWindowFocus: true });
  const documents = trpc.documents.list.useQuery(undefined, { enabled: isAuthenticated, refetchOnWindowFocus: true });
  const attachDocument = trpc.documents.attachActiveSigned.useMutation({
    onSuccess: () => {
      setNotice("İmzalı PDF merkezi dosyaya silinemez belge olarak eklendi.");
      void documents.refetch();
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (error) => setNotice(error.message),
  });
  const invalidateDocument = trpc.documents.invalidate.useMutation({
    onSuccess: () => {
      setNotice("Belge silinmedi; manager gerekçesiyle geçersiz kılındı ve denetim izine eklendi.");
      setInvalidationId(null);
      setInvalidationReason("");
      setInvalidationConfirmation("");
      void documents.refetch();
    },
    onError: (error) => setNotice(error.message),
  });

  const isManager = user?.role === "admin";
  const upcoming = useMemo(() => (obligations.data ?? []).filter((item) => ["planned", "due", "overdue"].includes(item.status)).slice(0, 5), [obligations.data]);
  const uploadableContracts = useMemo(() => isManager ? [] : (contracts.data ?? []).filter((item) => ["signed", "active"].includes(item.status)), [contracts.data, isManager]);

  const refresh = () => {
    void Promise.all([summary.refetch(), clients.refetch(), properties.refetch(), contracts.refetch(), obligations.refetch(), documents.refetch()]);
  };

  const handlePdf = (file?: File) => {
    setNotice(null);
    if (!file || !selectedContractId) {
      setNotice("Önce kendi imza teyitli veya aktif sözleşmenizi seçin.");
      return;
    }
    if (file.size > 12 * 1024 * 1024 || (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf"))) {
      setNotice("Yalnız 12 MB altındaki PDF belgeleri eklenebilir.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setNotice("PDF okunamadı.");
        return;
      }
      attachDocument.mutate({ contractId: Number(selectedContractId), originalFileName: file.name, pdfBase64: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const openDocument = async (id: number) => {
    try {
      const document = await utils.documents.open.fetch({ id });
      window.open(document.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Belge açılamadı.");
    }
  };

  const submitInvalidation = () => {
    if (!invalidationId || invalidationConfirmation !== "GEÇERSİZ KIL") return;
    if (!window.confirm("Belge silinmeyecek ancak danışmana kapatılacak ve denetim izine manager gerekçesi yazılacak. Devam edilsin mi?")) return;
    invalidateDocument.mutate({ id: invalidationId, reason: invalidationReason, confirmationText: "GEÇERSİZ KIL" });
  };

  if (loading) return <main className="min-h-screen bg-[#f7f7f4] p-6 text-center text-sm text-[#60706b]">Güvenli mobil oturum hazırlanıyor…</main>;

  if (!isAuthenticated) {
    return <main className="flex min-h-screen items-center justify-center bg-[#173e39] p-6">
      <section className="w-full max-w-sm rounded-3xl bg-[#f7f7f4] p-7 shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a17b43]">Global 1881 · Mobil deneme</p>
        <h1 className="mt-3 font-serif text-3xl text-[#213532]">Ofisiniz cebinizde.</h1>
        <p className="mt-3 text-sm leading-6 text-[#60706b]">Android veya iPhone’dan merkezi ofis verinize güvenli erişim için giriş yapın.</p>
        <button type="button" onClick={startLogin} className="mt-6 w-full rounded-xl bg-[#173e39] px-4 py-3 text-sm font-semibold text-white">Güvenli giriş yap</button>
      </section>
    </main>;
  }

  return <main className="min-h-screen bg-[#f7f7f4] pb-24 text-[#243733]">
    <header className="bg-[#173e39] px-5 pb-6 pt-10 text-white">
      <div className="mx-auto flex max-w-xl items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e6c47d]">Global 1881 · Merkezi online</p>
          <h1 className="mt-2 font-serif text-3xl">{isManager ? "Ofis Akışı" : "Size Özel Gündem"}</h1>
          <p className="mt-2 text-sm text-[#c7d9d2]">{user?.name || "Danışman"} · {isManager ? "Broker manager görünümü" : "Kendi kayıtlarınız"}</p>
        </div>
        <button type="button" aria-label="Verileri yenile" onClick={refresh} className="rounded-xl border border-[#5c8277] p-2 text-[#f2d999]"><RefreshCw className="h-5 w-5" /></button>
      </div>
    </header>

    <section className="mx-auto max-w-xl space-y-4 px-4 pt-5">
      {section === "gundem" && <>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Aktif sözleşmeler" value={summary.data?.contracts} icon={<FileText />} />
          <Metric label="Açık portföy" value={summary.data?.portfolio} icon={<Building2 />} />
          <Metric label="Bekleyen tahsilat" value={summary.data?.outstanding ? `₺${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Number(summary.data.outstanding))}` : undefined} icon={<BellRing />} />
          <Metric label={isManager ? "Aktif ekip" : "Müşterilerim"} value={isManager ? summary.data?.activeTeam : clients.data?.length} icon={<UsersRound />} />
        </div>
        <section className="rounded-2xl border border-[#dce7df] bg-white p-4">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#a17b43]" /><h2 className="font-serif text-xl">Yaklaşan gündem</h2></div>
          {upcoming.length ? <div className="mt-3 space-y-2">{upcoming.map((item) => <div key={item.id} className="rounded-xl bg-[#f5f8f5] px-3 py-3"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-[#687a74]">Vade: {formatDate(item.dueDate)} · {item.status === "overdue" ? "Gecikmiş" : "Takipte"}</p></div>)}</div> : <p className="mt-3 text-sm text-[#687a74]">Şu an merkezi kaydınızda gösterilecek yaklaşan vade bulunmuyor.</p>}
        </section>
        {isManager && <section className="rounded-2xl bg-[#eaf2ed] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#507268]">Yönetim notu</p><p className="mt-2 text-sm leading-6 text-[#37574e]">Bu görünüm yalnız merkezi sunucudaki güncel veriyi gösterir. Danışmanların müşteri gizliliği sunucu tarafında korunur.</p></section>}
      </>}

      {section === "kayitlar" && <>
        <ListCard title="Müşteriler" empty="Görüntüleyebileceğiniz müşteri kaydı yok." items={(clients.data ?? []).slice(0, 12).map((item) => ({ id: item.id, title: item.name, subtitle: `${item.type === "company" ? "Şirket" : "Bireysel müşteri"} · Güncelleme: ${formatDate(item.updatedAt)}` }))} />
        <ListCard title="Portföyler" empty="Görüntüleyebileceğiniz portföy kaydı yok." items={(properties.data ?? []).slice(0, 12).map((item) => ({ id: item.id, title: item.title, subtitle: `${item.listingType === "rent" ? "Kiralık" : "Satılık"} · ${item.status}` }))} />
      </>}

      {section === "sozlesmeler" && <ListCard title="Sözleşmeler" empty="Görüntüleyebileceğiniz sözleşme kaydı yok." items={(contracts.data ?? []).slice(0, 15).map((item) => ({ id: item.id, title: item.title, subtitle: `${item.contractNo} · ${item.type === "rental" ? "Kira" : item.type === "sale" ? "Satış" : "Yetki"} · ${item.status}` }))} />}

      {section === "belgeler" && <>
        {!isManager && <section className="rounded-2xl border border-[#dce7df] bg-white p-4">
          <div className="flex items-center gap-2"><Paperclip className="h-4 w-4 text-[#a17b43]" /><h2 className="font-serif text-xl">Aktif imzalı belgeler</h2></div>
          <p className="mt-2 text-xs leading-5 text-[#697a74]">PDF yalnız kendi imza teyitli/aktif sözleşmenize eklenir. Eklenen belge silinemez veya değiştirilemez.</p>
          <select aria-label="İmzalı sözleşme seç" value={selectedContractId} onChange={(event) => setSelectedContractId(event.target.value)} className="mt-3 h-11 w-full rounded-xl border border-[#d2dfd7] bg-white px-3 text-sm">
            <option value="">Sözleşme seçin</option>
            {uploadableContracts.map((contract) => <option key={contract.id} value={contract.id}>{contract.contractNo} · {contract.title}</option>)}
          </select>
          <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" className="mt-3 block w-full text-xs" onChange={(event) => handlePdf(event.target.files?.[0])} />
          <button type="button" disabled={attachDocument.isPending || !selectedContractId} onClick={() => fileInputRef.current?.click()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173e39] px-4 py-3 text-sm font-semibold text-white disabled:bg-[#8ca39b]"><Upload className="h-4 w-4" />{attachDocument.isPending ? "PDF ekleniyor…" : "İmzalı PDF ekle"}</button>
          {notice && <p className="mt-3 rounded-lg bg-[#eef5ef] p-2 text-xs text-[#355b4e]">{notice}</p>}
        </section>}
        <section className="rounded-2xl border border-[#dce7df] bg-white p-4">
          <h2 className="font-serif text-xl">{isManager ? "Yetkili belge kayıtları" : "Dosyamdaki belgeler"}</h2>
          {documents.data?.length ? <div className="mt-3 divide-y divide-[#e4ebe6]">{documents.data.map((document) => <div key={document.id} className="py-3"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#314842]">{document.originalFileName}</p><p className={`mt-1 text-xs ${document.invalidatedAt ? "text-[#a64c38]" : "text-[#71817b]"}`}>{formatDate(document.createdAt)} · {document.invalidatedAt ? "Geçersiz kılındı — dosya saklanıyor" : "Silinemez belge"}</p></div>{(!document.invalidatedAt || isManager) && <button type="button" onClick={() => void openDocument(document.id)} className="shrink-0 rounded-lg border border-[#bdcfbf] px-3 py-2 text-xs font-semibold text-[#285348]">Aç</button>}</div>{isManager && !document.invalidatedAt && <button type="button" onClick={() => { setInvalidationId(document.id); setInvalidationReason(""); setInvalidationConfirmation(""); }} className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#9a503c]"><AlertTriangle className="h-3.5 w-3.5" />Geçersiz kıl</button>}{isManager && invalidationId === document.id && <div className="mt-3 rounded-xl border border-[#eed5cc] bg-[#fff8f5] p-3"><p className="text-xs font-semibold text-[#7c4131]">Silme yoktur. Gerekçe ve ikinci teyit zorunludur.</p><textarea value={invalidationReason} onChange={(event) => setInvalidationReason(event.target.value)} placeholder="Geçersiz kılma gerekçesi (en az 20 karakter)" className="mt-2 min-h-20 w-full rounded-lg border border-[#e6c8bd] bg-white p-2 text-xs" /><input value={invalidationConfirmation} onChange={(event) => setInvalidationConfirmation(event.target.value)} placeholder="GEÇERSİZ KIL yazın" className="mt-2 h-10 w-full rounded-lg border border-[#e6c8bd] bg-white px-2 text-xs" /><button type="button" disabled={invalidateDocument.isPending || invalidationReason.trim().length < 20 || invalidationConfirmation !== "GEÇERSİZ KIL"} onClick={submitInvalidation} className="mt-2 w-full rounded-lg bg-[#8f4839] px-3 py-2 text-xs font-semibold text-white disabled:bg-[#c9a9a0]">{invalidateDocument.isPending ? "Kaydediliyor…" : "Silmeden geçersiz kıl"}</button></div>}</div>)}</div> : <p className="mt-3 text-sm text-[#71817b]">Yetkili olduğunuz merkezi imzalı belge bulunmuyor.</p>}
        </section>
      </>}
    </section>

    <nav className="fixed inset-x-0 bottom-0 border-t border-[#dce5df] bg-white/95 px-3 pb-4 pt-2 backdrop-blur"><div className="mx-auto flex max-w-xl items-center justify-between gap-1"><Tab label="Gündem" active={section === "gundem"} onClick={() => setSection("gundem")} icon={<BellRing />} /><Tab label="Kayıtlar" active={section === "kayitlar"} onClick={() => setSection("kayitlar")} icon={<UsersRound />} /><Tab label="Sözleşme" active={section === "sozlesmeler"} onClick={() => setSection("sozlesmeler")} icon={<FileText />} /><Tab label="Belgeler" active={section === "belgeler"} onClick={() => setSection("belgeler")} icon={<Paperclip />} /><button type="button" onClick={() => void logout()} className="flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium text-[#8a6051]"><LogOut className="h-5 w-5" />Çıkış</button></div></nav>
  </main>;
}

function Metric({ label, value, icon }: { label: string; value: string | number | undefined; icon: ReactNode }) {
  return <div className="rounded-2xl border border-[#dce7df] bg-white p-3"><div className="flex items-center justify-between text-[#a17b43]"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#74837e]">{label}</span>{icon}</div><p className="mt-3 font-serif text-2xl text-[#213532]">{value ?? "—"}</p></div>;
}

function ListCard({ title, empty, items }: { title: string; empty: string; items: Array<{ id: number; title: string; subtitle: string }> }) {
  return <section className="rounded-2xl border border-[#dce7df] bg-white p-4"><h2 className="font-serif text-xl">{title}</h2>{items.length ? <div className="mt-3 divide-y divide-[#e4ebe6]">{items.map((item) => <div key={item.id} className="py-3"><p className="text-sm font-semibold text-[#314842]">{item.title}</p><p className="mt-1 text-xs text-[#71817b]">{item.subtitle}</p></div>)}</div> : <p className="mt-3 text-sm text-[#71817b]">{empty}</p>}</section>;
}

function Tab({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void; icon: ReactNode }) {
  return <button type="button" onClick={onClick} className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-medium ${active ? "bg-[#173e39] text-white" : "text-[#667770]"}`}>{icon}{label}</button>;
}
