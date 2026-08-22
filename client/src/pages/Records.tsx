import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Banknote, FolderKanban, Plus, RefreshCw, UserRound } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function Records() {
  const [location] = useLocation();
  const kind = location === "/clients" ? "clients" : location === "/properties" ? "properties" : "ledger";
  const clients = trpc.clients.list.useQuery(undefined, { enabled: kind === "clients", retry: false });
  const properties = trpc.properties.list.useQuery(undefined, { enabled: kind === "properties", retry: false });
  const ledger = trpc.ledger.list.useQuery(undefined, { enabled: kind === "ledger", retry: false });
  const query = kind === "clients" ? clients : kind === "properties" ? properties : ledger;
  const utils = trpc.useUtils();
  const createClient = trpc.clients.create.useMutation({ onSuccess: () => { utils.clients.list.invalidate(); setValue(""); } });
  const createProperty = trpc.properties.create.useMutation({ onSuccess: () => { utils.properties.list.invalidate(); setValue(""); } });
  const createLedger = trpc.ledger.create.useMutation({ onSuccess: () => { utils.ledger.list.invalidate(); setValue(""); } });
  const [value, setValue] = useState("");
  const create = () => { if (!value.trim()) return; if (kind === "clients") createClient.mutate({ name: value }); else if (kind === "properties") createProperty.mutate({ referenceNo: `PRT-${Date.now()}`, title: value, address: value }); else createLedger.mutate({ description: value, amount: "0", entryType: "income" }); };
  const config = kind === "clients" ? { title: "Müşteriler", eyebrow: "İlişkiler merkezi", desc: "Müşteri bilgilerini bir kez girin; sözleşme ve portföylerle ilişkilendirin.", icon: UserRound } : kind === "properties" ? { title: "Portföy", eyebrow: "Mülk merkezi", desc: "Yetki sözleşmesi, fiyat ve taşınmaz bilgilerini tek kayıtta yönetin.", icon: FolderKanban } : { title: "Ön muhasebe", eyebrow: "Nakit akışı", desc: "Gelir, gider, alacak, borç ve işlem bağlantılı tahsilatları izleyin.", icon: Banknote };
  const refresh = () => query.refetch();
  return <div className="min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9"><header className="mb-7 flex items-end justify-between"><div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]">{config.eyebrow}</p><h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">{config.title}</h1><p className="mt-2 max-w-xl text-sm text-[#70807c]">{config.desc}</p></div><div className="flex gap-2"><Button variant="outline" size="icon" onClick={refresh} aria-label="Kayıtları yenile"><RefreshCw className="h-4 w-4" /></Button><div className="flex gap-2"><Input className="hidden w-44 bg-white sm:block" value={value} onChange={(e) => setValue(e.target.value)} placeholder={kind === "clients" ? "Ad soyad" : kind === "properties" ? "Mülk başlığı" : "Hareket açıklaması"} /><Button onClick={create} disabled={!value.trim()} className="rounded-xl bg-[#173e39] hover:bg-[#20554e]"><Plus className="mr-2 h-4 w-4" /> Yeni kayıt</Button></div></div></header><Card className="rounded-2xl border-[#e5e8e3] bg-white/80"><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle className="font-serif text-xl">Merkezi kayıtlar</CardTitle><p className="text-xs text-[#87938f]">Rolünüze göre yetkili olduğunuz veriler</p></div><config.icon className="h-5 w-5 text-[#a17b43]" /></CardHeader><CardContent>{query.isLoading ? <p role="status" className="py-12 text-center text-sm text-[#87938f]">Kayıtlar yükleniyor…</p> : query.isError ? <p role="alert" className="py-12 text-center text-sm text-[#a85745]">Kayıtlar alınamadı. Bağlantıyı kontrol edin.</p> : !query.data?.length ? <div className="rounded-xl bg-[#f7f7f4] px-4 py-12 text-center text-sm text-[#87938f]"><config.icon className="mx-auto mb-3 h-6 w-6 text-[#bd975d]" />Henüz kayıt bulunmuyor. İlk kaydı oluşturmak için Yeni kayıt butonunu kullanın.</div> : <div className="space-y-2">{query.data.map((item: any) => <div key={item.id} className="flex items-center gap-4 rounded-xl border border-[#edf0ec] p-4"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#34433f]">{item.name || item.title || item.description || item.referenceNo}</p><p className="mt-1 text-[10px] text-[#87938f]">{item.email || item.address || item.entryType || item.listingType || "Merkezi kayıt"}</p></div><span className="text-xs font-semibold text-[#173e39]">{item.amount ? `₺ ${Number(item.amount).toLocaleString("tr-TR")}` : item.status || "Aktif"}</span></div>)}</div>}</CardContent></Card></div>;
}
