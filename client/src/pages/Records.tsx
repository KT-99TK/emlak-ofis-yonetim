import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Banknote, FolderKanban, Plus, Printer, RefreshCw, UserRound } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { BanaHatirlatButton } from "@/components/PersonalTaskPanel";

export default function Records() {
  const [location] = useLocation();
  const { user } = useAuth();
  const kind = location === "/clients" ? "clients" : location === "/properties" ? "properties" : "ledger";
  const [includeInactive, setIncludeInactive] = useState(false);
  const [consultantCode, setConsultantCode] = useState("");
  const recordFilters = useMemo(() => ({ includeInactive, consultantCode: consultantCode.trim() || undefined }), [includeInactive, consultantCode]);
  const clientListInput = useMemo(() => recordFilters.consultantCode ? { consultantCode: recordFilters.consultantCode } : undefined, [recordFilters.consultantCode]);
  const clients = trpc.clients.list.useQuery(clientListInput, { enabled: kind === "clients", retry: false });
  const properties = trpc.properties.list.useQuery(recordFilters, { enabled: kind === "properties", retry: false });
  const ledger = trpc.ledger.list.useQuery(recordFilters, { enabled: kind === "ledger", retry: false });
  const query = kind === "clients" ? clients : kind === "properties" ? properties : ledger;
  const utils = trpc.useUtils();
  const createClient = trpc.clients.create.useMutation({ onSuccess: () => { utils.clients.list.invalidate(); setValue(""); } });
  const createProperty = trpc.properties.create.useMutation({ onSuccess: () => { utils.properties.list.invalidate(); setValue(""); } });
  const createLedger = trpc.ledger.create.useMutation({ onSuccess: () => { utils.ledger.list.invalidate(); setValue(""); } });
  const [value, setValue] = useState("");
  const [search, setSearch] = useState("");
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [ownerApprovalStatus, setOwnerApprovalStatus] = useState<"notRequired" | "pending" | "approved" | "rejected">("notRequired");
  const [dossierClientId, setDossierClientId] = useState<number | null>(null);
  const [printPreviewHtml, setPrintPreviewHtml] = useState<string | null>(null);
  const clientFile = trpc.clients.file.useQuery(
    { clientId: dossierClientId ?? 0 },
    { enabled: dossierClientId !== null, retry: false }
  );
  const create = () => {
    if (!value.trim()) return;
    if (kind === "clients") createClient.mutate({ name: value });
    else if (kind === "properties") createProperty.mutate({ referenceNo: `PRT-${Date.now()}`, title: value, address: value, listingType, ownerApprovalStatus: listingType === "rent" ? ownerApprovalStatus : "notRequired" });
    else createLedger.mutate({ description: value, amount: "0", entryType: "income" });
  };

  const config = kind === "clients"
    ? { title: "Müşteriler", eyebrow: "İlişkiler merkezi", desc: "Müşteri bilgilerini bir kez girin; sözleşme ve portföylerle ilişkilendirin.", icon: UserRound }
    : kind === "properties"
      ? { title: "Portföy", eyebrow: "Mülk merkezi", desc: "Yetki sözleşmesi, fiyat ve taşınmaz bilgilerini tek kayıtta yönetin.", icon: FolderKanban }
      : { title: "Ön muhasebe", eyebrow: "Nakit akışı", desc: "Gelir, gider, alacak, borç ve işlem bağlantılı tahsilatları izleyin.", icon: Banknote };
  const Icon = config.icon;
  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");
  const visibleItems = (query.data ?? []).filter((item: any) => {
    if (!normalizedSearch) return true;
    return [item.referenceNo, item.name, item.email, item.phone, item.title, item.address, item.listingType, item.consultantCode]
      .filter(Boolean)
      .some(value => String(value).toLocaleLowerCase("tr-TR").includes(normalizedSearch));
  });
  const printRecordsPdf = () => {
    const safe = (value: unknown) => String(value ?? "").replace(/[&<>\"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" })[character] ?? character);
    const isClientList = kind === "clients";
    const rows = visibleItems.map((item: any) => isClientList
      ? `<tr><td>${safe(item.referenceNo || item.id)}</td><td>${safe(item.name)}</td><td>${safe(item.consultantCode || "Atanmamış")}</td><td>${safe(item.status || "Aktif")}</td><td>${safe(item.phone || "Maskeli")}</td><td>${safe(item.email || "-")}</td><td>${safe(item.portfolioSummary ? `${item.portfolioSummary.active}/${item.portfolioSummary.total} aktif${item.portfolioSummary.titles?.length ? ` · ${item.portfolioSummary.titles.join(" · ")}` : ""}` : "0 kayıt")}</td></tr>`
      : `<tr><td>${safe(item.referenceNo || item.id)}</td><td>${safe(item.name || item.title || item.description)}</td><td>${safe(item.consultantCode || "Atanmamış")}</td><td>${safe(item.status || "Aktif")}</td><td>${safe(item.amount)}</td><td>${safe(item.address || item.entryType || item.listingType)}</td>`
    ).join("");
    const filterSummary = `${includeInactive ? "Aktif + pasif/arşiv" : "Yalnız aktif"} · Danışman: ${consultantCode.trim() || "kapsama göre"} · Merkezi no/ad araması: ${search.trim() || "yok"}`;
    const headings = isClientList
      ? "<th>Merkezi müşteri no</th><th>Müşteri adı</th><th>Sorumlu danışman</th><th>Durum</th><th>Telefon</th><th>E-posta</th><th>Portföy özeti</th>"
      : "<th>Referans / ID</th><th>Kayıt</th><th>Danışman</th><th>Durum</th><th>Tutar</th><th>Detay</th>";
    setPrintPreviewHtml(`<h1>GLOBAL 1881 — ${safe(config.title).toUpperCase()}</h1><p>Filtreler: ${safe(filterSummary)} · Kayıt sayısı: ${visibleItems.length}</p><table><thead><tr>${headings}</tr></thead><tbody>${rows || `<tr><td colspan="${isClientList ? 7 : 6}">Filtreye uyan kayıt bulunamadı.</td></tr>`}</tbody></table>`);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9">
      <header className="mb-7 flex flex-col items-stretch gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]">{config.eyebrow}</p><h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">{config.title}</h1><p className="mt-2 max-w-xl text-sm text-[#70807c]">{config.desc}</p></div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end"><Button variant="outline" size="icon" onClick={() => query.refetch()} aria-label="Kayıtları yenile"><RefreshCw className="h-4 w-4" /></Button><div className="flex w-full flex-wrap items-center gap-2 sm:w-auto"><Input className="w-full min-w-0 bg-white sm:w-44" value={value} onChange={(event) => setValue(event.target.value)} placeholder={kind === "clients" ? "Ad soyad" : kind === "properties" ? "Mülk başlığı" : "Hareket açıklaması"} />{kind === "properties" && <><Select value={listingType} onValueChange={(next) => setListingType(next as typeof listingType)}><SelectTrigger className="h-9 w-[112px] bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sale">Satılık</SelectItem><SelectItem value="rent">Kiralık</SelectItem></SelectContent></Select><Select value={ownerApprovalStatus} onValueChange={(next) => setOwnerApprovalStatus(next as typeof ownerApprovalStatus)} disabled={listingType !== "rent"}><SelectTrigger className="h-9 w-[144px] bg-white"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="notRequired">Onay gerekmiyor</SelectItem><SelectItem value="pending">Onay bekliyor</SelectItem><SelectItem value="approved">Mülk sahibi onayladı</SelectItem><SelectItem value="rejected">Onaylanmadı</SelectItem></SelectContent></Select></>}<Button onClick={create} disabled={!value.trim()} className="rounded-xl bg-[#173e39] hover:bg-[#20554e]"><Plus className="mr-2 h-4 w-4" /> Yeni kayıt</Button></div></div>
      </header>
      <Card className="rounded-2xl border-[#e5e8e3] bg-white/80"><CardHeader className="flex flex-col items-stretch gap-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="font-serif text-xl">Merkezi kayıtlar</CardTitle><p className="text-xs text-[#87938f]">{includeInactive ? "Aktif ve pasif/arşiv kayıtlar" : "Yalnız aktif kayıtlar"} · Rolünüze göre yetkili olduğunuz veriler</p></div><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={printRecordsPdf} aria-label="Filtreli PDF yazdır"><Printer className="mr-1.5 h-4 w-4" /> PDF</Button><Icon className="h-5 w-5 text-[#a17b43]" /></div></div><div className="grid gap-2 sm:grid-cols-3"><div className="relative"><Input className="bg-white pr-16" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={kind === "clients" ? "Müşteri no ara (örn. 0001)" : "Kayıt ara"} aria-label={kind === "clients" ? "Merkezi müşteri numarası veya ad ara" : "Kayıt ara"} />{kind === "clients" && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#a17b43]">NO / AD</span>}</div><Select value={includeInactive ? "all" : "active"} onValueChange={(value) => setIncludeInactive(value === "all")}><SelectTrigger className="bg-white" aria-label="Kayıt durum filtresi"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Yalnız aktif</SelectItem><SelectItem value="all">Pasif/arşiv dahil</SelectItem></SelectContent></Select><Input className="bg-white" value={consultantCode} onChange={(event) => setConsultantCode(event.target.value.toUpperCase())} placeholder="Danışman kodu (manager)" aria-label="Danışman kodu filtresi" /></div><p className="text-xs text-[#87938f]">{kind === "clients" ? `Merkezi müşteri araması · ${visibleItems.length} kayıt gösteriliyor` : `${visibleItems.length} kayıt gösteriliyor`}</p></CardHeader><CardContent>{query.isLoading ? <p role="status" className="py-12 text-center text-sm text-[#87938f]">Kayıtlar yükleniyor…</p> : query.isError ? <p role="alert" className="py-12 text-center text-sm text-[#a85745]">Kayıtlar alınamadı. Bağlantıyı kontrol edin.</p> : !query.data?.length ? <div className="rounded-xl bg-[#f7f7f4] px-4 py-12 text-center text-sm text-[#87938f]"><Icon className="mx-auto mb-3 h-6 w-6 text-[#bd975d]" />Henüz kayıt bulunmuyor. İlk kaydı oluşturmak için Yeni kayıt butonunu kullanın.</div> : !visibleItems.length ? <div className="rounded-xl bg-[#f7f7f4] px-4 py-12 text-center text-sm text-[#87938f]">Arama kriterine uyan müşteri bulunamadı.</div> : <div className="space-y-2">{visibleItems.map((item: any) => { return <div key={item.id} className="flex flex-col items-stretch gap-3 rounded-xl border border-[#edf0ec] p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#34433f]">{item.name || item.title || item.description || item.referenceNo}</p>{kind === "clients" && item.referenceNo && <p className="mt-1 text-[11px] font-semibold tracking-wide text-[#a17b43]">Müşteri No: {item.referenceNo}</p>}{kind === "clients" && <p className="mt-1 text-[11px] font-semibold text-[#173e39]">Sorumlu danışman: {item.consultantCode || "Atanmamış"}</p>}<p className="mt-1 text-[10px] text-[#87938f]">{item.email || item.address || item.entryType || item.listingType || "Merkezi kayıt"}</p>{kind === "clients" && <p className="mt-1 text-[11px] text-[#6f7c77]">Telefon: {item.phone || "Kayıtlı değil"}</p>}{kind === "clients" && <p className="mt-1 text-[11px] text-[#56635f]">Portföy: {item.portfolioSummary?.total ?? 0} kayıt · {item.portfolioSummary?.active ?? 0} aktif{item.portfolioSummary?.titles?.length ? ` · ${item.portfolioSummary.titles.join(" · ")}` : ""}</p>}</div><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-[#173e39]">{item.amount ? `₺ ${Number(item.amount).toLocaleString("tr-TR")}` : item.status || "Aktif"}</span><BanaHatirlatButton seed={{ title: `${config.title} takibi: ${item.name || item.title || item.description || item.referenceNo}`, linkedEntityType: kind === "clients" ? "client" : kind === "properties" ? "property" : "ledger", linkedEntityId: item.id, linkedLabel: item.name || item.title || item.description || item.referenceNo, linkedPath: location }} className="h-8 px-2.5" />{kind === "clients" && <Button variant="outline" size="sm" onClick={() => setDossierClientId(item.id)} className="border-[#b8c9c2] text-[#173e39]">Müşteri Dosyası</Button>}</div></div>; })}</div>}</CardContent></Card>
      <Dialog open={dossierClientId !== null} onOpenChange={(open) => { if (!open) setDossierClientId(null); }}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle className="font-serif text-2xl text-[#223230]">Müşteri Dosyası</DialogTitle><DialogDescription>Müşteri numarası, portföyler, kira/sözleşme kayıtları, yükümlülükler ve finans hareketleri tek kapsam içinde gösterilir.</DialogDescription></DialogHeader>{clientFile.isLoading ? <p role="status" className="py-8 text-center text-sm text-[#87938f]">Müşteri dosyası yükleniyor…</p> : clientFile.error ? <p role="alert" className="text-sm text-[#a85745]">Müşteri dosyası alınamadı. Yetki ve bağlantıyı kontrol edin.</p> : clientFile.data ? <div className="space-y-4"><div className="rounded-xl bg-[#f7f7f4] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#a17b43]">{clientFile.data.client.referenceNo || "Müşteri numarası yok"}</p><h2 className="mt-1 font-serif text-xl text-[#223230]">{clientFile.data.client.name}</h2><p className="mt-1 text-xs font-semibold text-[#173e39]">Sorumlu danışman: {clientFile.data.client.consultantCode || "Atanmamış"}</p><p className="mt-1 text-xs text-[#6f7c77]">{clientFile.data.client.email || "E-posta kayıtlı değil"} · Telefon: {clientFile.data.client.phone || "Kayıtlı değil"}</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-[#e5e8e3] p-3"><p className="text-xs font-semibold text-[#a17b43]">Portföyler</p><p className="mt-1 text-lg font-semibold text-[#173e39]">{clientFile.data.properties.length}</p>{clientFile.data.properties.slice(0, 3).map((property) => <p key={property.id} className="truncate text-xs text-[#6f7c77]">{property.title} · {property.address}</p>)}</div><div className="rounded-xl border border-[#e5e8e3] p-3"><p className="text-xs font-semibold text-[#a17b43]">Kira kayıtları</p><p className="mt-1 text-lg font-semibold text-[#173e39]">{clientFile.data.activeRentals.length}</p>{clientFile.data.activeRentals.slice(0, 3).map((rental) => <p key={rental.id} className="truncate text-xs text-[#6f7c77]">{rental.unitInfo || rental.propertyLocation || rental.tenantName}</p>)}</div><div className="rounded-xl border border-[#e5e8e3] p-3"><p className="text-xs font-semibold text-[#a17b43]">Sözleşmeler</p><p className="mt-1 text-lg font-semibold text-[#173e39]">{clientFile.data.contracts.length}</p>{clientFile.data.contracts.slice(0, 3).map((contract) => <p key={contract.id} className="truncate text-xs text-[#6f7c77]">{contract.contractNo} · {contract.title}</p>)}</div><div className="rounded-xl border border-[#e5e8e3] p-3"><p className="text-xs font-semibold text-[#a17b43]">Tahsilat / yükümlülük</p><p className="mt-1 text-lg font-semibold text-[#173e39]">{clientFile.data.ledger.length + clientFile.data.obligations.length}</p><p className="text-xs text-[#6f7c77]">{clientFile.data.ledger.length} finans hareketi · {clientFile.data.obligations.length} yükümlülük</p></div></div></div> : <p className="text-sm text-[#87938f]">Müşteri dosyası bulunamadı.</p>}<DialogFooter><Button variant="outline" onClick={() => setDossierClientId(null)}>Kapat</Button></DialogFooter></DialogContent></Dialog>
      {printPreviewHtml && <div className="records-print-preview" role="dialog" aria-label="PDF yazdırma önizlemesi"><div className="print-preview-controls"><p>PDF önizlemesi hazır. Tarayıcı yazdırma penceresinden “PDF olarak kaydet” seçeneğini kullanabilirsiniz.</p><div className="flex gap-2"><Button variant="outline" onClick={() => setPrintPreviewHtml(null)}>Kapat</Button><Button onClick={() => window.print()} className="bg-[#173e39] hover:bg-[#20554e]"><Printer className="mr-2 h-4 w-4" /> Yazdır / PDF olarak kaydet</Button></div></div><article className="records-print-paper" dangerouslySetInnerHTML={{ __html: printPreviewHtml }} /></div>}
    </div>
  );
}
