import { useEffect, useMemo, useState } from "react";
import { BarChart3, RefreshCw, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildAuthorityPerformance, sumAuthorityPerformance, type ConsultantAuthorityPerformance } from "@/lib/authorityPerformance";
import { formatAuthorityCurrency } from "@/lib/authorityContract";
import { listOfflineRecords, type OfflineRecord } from "@/lib/offlineStore";

function CurrencyAmounts({ values }: { values: Record<string, number> }) {
  const entries = Object.entries(values).filter(([, amount]) => amount > 0);
  return entries.length ? <div className="space-y-1">{entries.map(([currency, amount]) => <p key={currency} className="whitespace-nowrap">{formatAuthorityCurrency(amount, currency as "TRY" | "USD" | "EUR")}</p>)}</div> : <span className="text-muted-foreground">—</span>;
}

export default function OfflineConsultantPerformance() {
  const [records, setRecords] = useState<OfflineRecord[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const refresh = async () => { setRecords(await listOfflineRecords()); setUpdatedAt(new Date().toLocaleString("tr-TR")); };
  useEffect(() => { void refresh(); }, []);
  const rows = useMemo(() => buildAuthorityPerformance(records), [records]);
  const totals = useMemo(() => sumAuthorityPerformance(rows), [rows]);

  return (
    <div className="min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]"><BarChart3 className="h-3.5 w-3.5" /> Offline performans görünümü</p><h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Danışman Performansı</h1><p className="mt-2 max-w-2xl text-sm text-[#70807c]">Yalnızca yerel cihazdaki ve manager tarafından birleştirilmiş yetki sözleşmesi taslaklarından hesaplanır. Para birimleri birbirine çevrilmeden ayrı gösterilir.</p></div><Button variant="outline" onClick={() => void refresh()} className="rounded-xl bg-white"><RefreshCw className="mr-2 h-4 w-4" /> Yenile</Button></header>
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><Card className="rounded-2xl"><CardContent className="p-5"><p className="text-xs text-muted-foreground">Toplam yetki sözleşmesi</p><p className="mt-2 font-serif text-3xl text-[#173e39]">{totals.contractCount}</p></CardContent></Card><Card className="rounded-2xl"><CardContent className="p-5"><p className="text-xs text-muted-foreground">Sözleşmeye esas toplam</p><div className="mt-2 font-serif text-xl text-[#173e39]"><CurrencyAmounts values={totals.contractAmountByCurrency} /></div></CardContent></Card><Card className="rounded-2xl"><CardContent className="p-5"><p className="text-xs text-muted-foreground">Toplam hizmet bedeli</p><div className="mt-2 font-serif text-xl text-[#173e39]"><CurrencyAmounts values={totals.serviceFeeByCurrency} /></div></CardContent></Card></div>
      <Card className="rounded-2xl border-[#e5e8e3] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-xl"><UsersRound className="h-5 w-5 text-[#a17b43]" /> Danışman bazında kayıt ve tutar özeti</CardTitle><p className="text-xs text-[#87938f]">Son yenileme: {updatedAt || "yükleniyor"}. Kayıt numarası danışman baş harfi ve yıl içi sırayı taşıdığı için kaynak izlenebilirliği korunur.</p></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="border-b text-left text-xs uppercase tracking-wide text-[#718079]"><tr><th className="px-3 py-3">Danışman</th><th className="px-3 py-3">Kod</th><th className="px-3 py-3 text-right">Sözleşme</th><th className="px-3 py-3">Sözleşmeye esas bedel</th><th className="px-3 py-3">Hizmet bedeli</th><th className="px-3 py-3">Son kayıt tarihi</th></tr></thead><tbody>{rows.map((row: ConsultantAuthorityPerformance) => <tr key={`${row.consultantCode}-${row.consultantName}`} className="border-b border-[#edf0ec] text-[#34433f]"><td className="px-3 py-4 font-medium"><span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#e7efe9] text-xs font-bold text-[#173e39]">{row.initials}</span>{row.consultantName}</td><td className="px-3 py-4">{row.consultantCode || "—"}</td><td className="px-3 py-4 text-right font-semibold">{row.contractCount}</td><td className="px-3 py-4"><CurrencyAmounts values={row.contractAmountByCurrency} /></td><td className="px-3 py-4"><CurrencyAmounts values={row.serviceFeeByCurrency} /></td><td className="px-3 py-4">{row.latestContractDate || "—"}</td></tr>)}</tbody></table></div>{!rows.length && <div className="rounded-xl border border-dashed border-[#d7ded7] py-14 text-center text-sm text-[#718079]">Henüz performans tablosuna girecek bir offline yetki sözleşmesi kaydı bulunmuyor.</div>}</CardContent></Card>
    </div>
  );
}
