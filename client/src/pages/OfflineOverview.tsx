import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ClipboardCheck, FileSignature, HardDrive, WalletCards } from "lucide-react";
import OfflineOfficeFlowPanel from "@/components/OfflineOfficeFlowPanel";
import { getUserId, listOfflineRecords, type OfflineRecord } from "@/lib/offlineStore";

function goTo(hash: string) {
  if (typeof window !== "undefined") window.location.hash = hash;
}

const cards = [
  { key: "contract", label: "Yerel sözleşmeler", icon: FileSignature, hash: "#/offline-rental", tone: "text-[#1c675c]" },
  { key: "obligation", label: "Açık takip", icon: ClipboardCheck, hash: "#/offline", tone: "text-[#a85745]" },
  { key: "ledger", label: "Finans hareketi", icon: WalletCards, hash: "#/offline-cash-bank", tone: "text-[#8d6f3f]" },
] as const;

export default function OfflineOverview() {
  const [records, setRecords] = useState<OfflineRecord[]>([]);
  const userId = getUserId();

  useEffect(() => {
    void listOfflineRecords().then(setRecords).catch(() => setRecords([]));
  }, []);

  const counts = useMemo(() => ({
    contract: records.filter(record => record.entity === "contract" || record.entity === "transaction").length,
    obligation: records.filter(record => (record.entity === "obligation" || record.entity === "evacuation") && record.status !== "paid" && record.status !== "cancelled").length,
    ledger: records.filter(record => record.entity === "ledger").length,
  }), [records]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 rounded-2xl bg-[#124d47] px-6 py-7 text-white shadow-[0_18px_45px_rgba(18,77,71,0.18)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d5c18d]">Offline başlangıç ekranı</p>
          <h1 className="mt-2 font-serif text-4xl tracking-[-0.03em] md:text-5xl">Genel Bakış</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#d9ebe4]">Bu cihazdaki kayıtlarınızı, bekleyen takipleri ve güvenli çalışma alanını tek bakışta yönetin.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs text-[#e3f1eb]">
          <HardDrive className="h-4 w-4" />
          <span>Yerel veri deposu</span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <button key={card.key} type="button" onClick={() => goTo(card.hash)} className="group rounded-2xl border border-[#dbe5dd] bg-white p-5 text-left shadow-[0_8px_26px_rgba(32,62,55,0.06)] transition hover:-translate-y-0.5 hover:border-[#b8d0c6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c675c]">
              <div className="flex items-center justify-between">
                <span className={`rounded-xl bg-[#f3f7f4] p-2.5 ${card.tone}`}><Icon className="h-5 w-5" /></span>
                <ArrowUpRight className="h-4 w-4 text-[#91a39c] transition group-hover:text-[#1c675c]" />
              </div>
              <p className="mt-6 text-sm font-medium text-[#52635e]">{card.label}</p>
              <p className="mt-1 font-serif text-3xl text-[#173f3a]">{counts[card.key]}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="rounded-2xl border border-[#dbe5dd] bg-white p-6 shadow-[0_8px_26px_rgba(32,62,55,0.05)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8d6f3f]">Güvenli çalışma düzeni</p>
          <h2 className="mt-2 font-serif text-2xl text-[#173f3a]">Bugün için hazır</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66756f]">Kayıtlar yalnızca bu bilgisayardaki yerel depoya yazılır. Yedekleri Birleştir ekranından manager bilgisayarındaki güvenli yedekle birleştirme işlemini başlatabilirsiniz.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => goTo("#/offline-rental")} className="rounded-xl bg-[#124d47] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c3e39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c675c]">Kira sözleşmesi oluştur</button>
            <button type="button" onClick={() => goTo("#/offline-authority")} className="rounded-xl border border-[#c8d8d0] px-4 py-2.5 text-sm font-semibold text-[#1c675c] transition hover:bg-[#f2f7f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c675c]">Yetki sözleşmesi</button>
          </div>
        </section>
        <OfflineOfficeFlowPanel records={records} userId={userId} className="offline-operation-aside print:hidden" />
      </div>
    </div>
  );
}

export { goTo };
export function offlineOverviewCounts(records: OfflineRecord[]) {
  return {
    contracts: records.filter(record => record.entity === "contract" || record.entity === "transaction").length,
    openObligations: records.filter(record => (record.entity === "obligation" || record.entity === "evacuation") && record.status !== "paid" && record.status !== "cancelled").length,
    ledger: records.filter(record => record.entity === "ledger").length,
  };
}
