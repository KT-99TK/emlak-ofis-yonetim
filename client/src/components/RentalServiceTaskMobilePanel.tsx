import { AlertTriangle, BellRing, CheckCircle2, ShieldCheck } from "lucide-react";
import React, { type ReactNode } from "react";

export type RentalServiceTaskSummary = {
  open: number;
  overdue: number;
  planned: number;
  prepared: number;
  reviewed: number;
  shared: number;
};

export type PersonalRentalServiceTask = {
  id: number;
  title: string;
  dueDate: Date | string;
  status: string;
  customerContext: string;
};

type QueryState = "loading" | "error" | "ready";

type RentalServiceTaskMobilePanelProps = {
  isManager: boolean;
  state: QueryState;
  summary: RentalServiceTaskSummary;
  personalTasks: PersonalRentalServiceTask[];
  onRetry: () => void;
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function taskStatusLabel(status: string) {
  return status === "planned"
    ? "Hazırlık bekliyor"
    : status === "prepared"
      ? "Manager gözden geçirmesi"
      : status === "reviewed"
        ? "Paylaşım için hazır"
        : "Takipte";
}

function Metric({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return <div className="rounded-2xl border border-[#dce7df] bg-white p-3"><div className="flex items-center justify-between text-[#a17b43]"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#74837e]">{label}</span>{icon}</div><p className="mt-3 font-serif text-2xl text-[#213532]">{value}</p></div>;
}

/** Broker yüzeyinde görev öğeleri hiç işlenmez; yalnız durum toplamları görünür. */
export function RentalServiceTaskMobilePanel({ isManager, state, summary, personalTasks, onRetry }: RentalServiceTaskMobilePanelProps) {
  if (isManager) {
    return <section className="rounded-2xl border border-[#d9c99e] bg-[#fffdf7] p-4"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#a17b43]" /><h2 className="font-serif text-xl">Müşteri hizmeti yönlendirmesi</h2></div><p className="mt-2 text-xs leading-5 text-[#697a74]">Bu özet müşteri, kiracı, telefon ve taşınmaz bilgisi göstermez. Danışmanların hazırlık ve paylaşım akışını yönlendirmek içindir.</p>{state === "loading" ? <p className="mt-3 rounded-xl bg-[#f7f1df] px-3 py-3 text-xs text-[#7a6947]" role="status">Hizmet görevleri yükleniyor…</p> : state === "error" ? <div className="mt-3 rounded-xl border border-[#e8c8bf] bg-[#fff8f5] p-3 text-xs text-[#934736]" role="alert"><p>Hizmet görevleri şu anda yüklenemedi. Sıfır görev bilgisi gösterilmez.</p><button type="button" onClick={onRetry} className="mt-2 rounded-lg border border-[#c99486] bg-white px-3 py-1.5 font-semibold text-[#8a4435]">Tekrar dene</button></div> : <><div className="mt-3 grid grid-cols-2 gap-2"><Metric label="Açık görev" value={summary.open} icon={<BellRing />} /><Metric label="Gecikmiş" value={summary.overdue} icon={<AlertTriangle />} /><Metric label="Manager incelemesi" value={summary.prepared} icon={<ShieldCheck />} /><Metric label="Paylaşım için hazır" value={summary.reviewed} icon={<CheckCircle2 />} /></div><p className="mt-3 text-xs text-[#7a6947]">Planlı: {summary.planned} · Paylaşım kaydı: {summary.shared}</p></>}</section>;
  }

  return <section className="rounded-2xl border border-[#dce7df] bg-white p-4"><div className="flex items-center gap-2"><BellRing className="h-4 w-4 text-[#a17b43]" /><h2 className="font-serif text-xl">Kira müşteri hizmeti</h2></div><p className="mt-2 text-xs leading-5 text-[#697a74]">Yalnız yetkili olduğunuz aktif kira kayıtlarındaki arama ve takip görevleri gösterilir. Sistem dış mesaj göndermez.</p>{state === "loading" ? <p className="mt-3 rounded-xl bg-[#f5f8f5] px-3 py-3 text-sm text-[#687a74]" role="status">Kişisel hizmet görevleri yükleniyor…</p> : state === "error" ? <div className="mt-3 rounded-xl border border-[#e8c8bf] bg-[#fff8f5] p-3 text-sm text-[#934736]" role="alert"><p>Kişisel hizmet görevleri yüklenemedi. Boş görev bilgisi gösterilmez.</p><button type="button" onClick={onRetry} className="mt-2 rounded-lg border border-[#c99486] bg-white px-3 py-1.5 text-xs font-semibold text-[#8a4435]">Tekrar dene</button></div> : personalTasks.length ? <div className="mt-3 space-y-2">{personalTasks.map(task => <div key={task.id} className="rounded-xl bg-[#f5f8f5] px-3 py-3"><p className="text-sm font-semibold text-[#27463e]">{task.title}</p><p className="mt-1 text-xs text-[#687a74]">{task.customerContext || "Yetkili aktif kira kaydı"}</p><p className="mt-1 text-xs text-[#687a74]">Takip: {formatDate(task.dueDate)} · {taskStatusLabel(task.status)}</p></div>)}</div> : <p className="mt-3 text-sm text-[#687a74]">Şu an size atanmış açık kira müşteri hizmet görevi bulunmuyor.</p>}</section>;
}
