import React from "react";
import {
  ArrowUpRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatTurkishDate } from "@/lib/turkishDate";

export type OfficeFlowObligation = {
  id: number | string;
  title: string;
  dueDate: Date | string;
  status: string;
  amount?: string | number | null;
};

export type OfficeFlowContract = {
  id: number | string;
  status: string;
  ownerApprovalStatus?: string | null;
};
export type OfficeFlowLedgerEntry = {
  id: number | string;
  entryType: string;
  status: string;
};
export type OfficeFlowServiceTaskSummary = {
  open: number;
  overdue: number;
  planned: number;
  prepared: number;
  reviewed: number;
  shared: number;
};

type OfficeFlowPanelProps = {
  role?: string;
  obligations: OfficeFlowObligation[];
  contracts?: OfficeFlowContract[];
  ledgerEntries?: OfficeFlowLedgerEntry[];
  rentalServiceSummary?: OfficeFlowServiceTaskSummary;
  rentalServiceState?: "loading" | "error";
  onRefreshRentalServiceTasks?: () => void;
  onOpenObligations: () => void;
  onOpenContracts?: () => void;
  onOpenAccounting?: () => void;
  attentionLabel?: string;
  now?: Date;
};

function dayDistance(dueDate: Date | string, now: Date) {
  const due = new Date(dueDate);
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const dueDay = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate()
  ).getTime();
  return Math.round((dueDay - today) / 86_400_000);
}

function dueLabel(days: number) {
  if (days < 0) return `${Math.abs(days)} gün gecikmiş`;
  if (days === 0) return "Bugün";
  if (days === 1) return "Yarın";
  return `${days} gün içinde`;
}

function dueTone(days: number) {
  if (days < 0) return "bg-[#ff9a7a] text-[#35170e]";
  if (days <= 3) return "bg-[#e6c47d] text-[#3d2d12]";
  return "bg-[#62c4ae] text-[#073d35]";
}

export function OfficeFlowPanel({
  role,
  obligations,
  contracts = [],
  ledgerEntries = [],
  rentalServiceSummary,
  rentalServiceState,
  onRefreshRentalServiceTasks,
  onOpenObligations,
  onOpenContracts,
  onOpenAccounting,
  attentionLabel,
  now = new Date(),
}: OfficeFlowPanelProps) {
  const isManager = role === "admin";
  const [showManagerExceptions, setShowManagerExceptions] =
    React.useState(false);
  const openItems = obligations.filter(
    item => item.status !== "paid" && item.status !== "cancelled"
  );
  const rankedItems = openItems
    .map(item => ({ ...item, days: dayDistance(item.dueDate, now) }))
    .sort((left, right) => left.days - right.days);
  const overdueCount = rankedItems.filter(item => item.days < 0).length;
  const weekCount = rankedItems.filter(
    item => item.days >= 0 && item.days <= 7
  ).length;
  const visiblePersonalItems = rankedItems.slice(0, 3);
  const reviewContractCount = contracts.filter(
    item =>
      item.status === "draft" ||
      item.status === "review" ||
      item.ownerApprovalStatus === "pending"
  ).length;
  const openCollectionCount = ledgerEntries.filter(
    item =>
      item.entryType === "receivable" &&
      item.status !== "paid" &&
      item.status !== "cancelled"
  ).length;

  return (
    <Card className="relative overflow-hidden rounded-2xl border-[#0f5145] bg-[#0f473f] text-white shadow-[0_18px_42px_rgba(15,71,63,.22)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_10%,rgba(98,196,174,.27),transparent_29%),radial-gradient(circle_at_12%_100%,rgba(230,196,125,.13),transparent_38%)]" />
      <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full border border-white/15" />
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-[#e6c47d]/30" />
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b8dcd3]">
              <BellRing className="h-3.5 w-3.5 text-[#e6c47d]" />{" "}
              {isManager ? "Broker manager" : "Size özel"}
            </div>
            <h2 className="mt-2 font-serif text-2xl tracking-[-0.035em] text-white">
              {isManager ? "Ofis Akışı" : "Size Özel Gündem"}
            </h2>
            {!isManager && attentionLabel && (
              <p className="mt-1 text-xs font-semibold text-[#e6c47d]">
                {attentionLabel}
              </p>
            )}
            <p className="mt-1 max-w-[260px] text-xs leading-5 text-[#c3d7d2]">
              {isManager
                ? "Kişi detayı olmadan, müdahale gerektiren ofis istisnaları."
                : "Bugün önceliğiniz olan sözleşme, vade ve tahsilat adımları."}
            </p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
            <CalendarClock className="h-5 w-5 text-[#e6c47d]" />
          </span>
        </div>

        {isManager ? (
          <div
            className="mt-6 space-y-2"
            aria-label="Ofis geneli istisna özeti"
          >
            <div className="rounded-xl border border-white/10 bg-white/[.08] px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#d8e8e3]">
                  Gecikmiş vade
                </span>
                <strong className="font-serif text-2xl text-[#ffb099]">
                  {overdueCount}
                </strong>
              </div>
              <p className="mt-1 text-[11px] text-[#aac8c0]">
                İnceleme gerektiren kayıt sayısı
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[.08] px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#d8e8e3]">
                  Önümüzdeki 7 gün
                </span>
                <strong className="font-serif text-2xl text-[#e6c47d]">
                  {weekCount}
                </strong>
              </div>
              <p className="mt-1 text-[11px] text-[#aac8c0]">
                Danışmanların kendi iş listelerinde görünür
              </p>
            </div>
            {rentalServiceState === "loading" ? (
              <div className="rounded-xl border border-white/10 bg-white/[.08] px-3 py-3 text-xs text-[#d8e8e3]" role="status">Müşteri hizmeti görevleri yükleniyor…</div>
            ) : rentalServiceState === "error" ? (
              <div className="rounded-xl border border-[#ffb099]/50 bg-[#6f332c]/45 px-3 py-3 text-xs text-[#ffe0d7]" role="alert"><p>Müşteri hizmeti görevleri yüklenemedi. Sıfır görev bilgisi gösterilmez.</p>{onRefreshRentalServiceTasks && <button type="button" onClick={onRefreshRentalServiceTasks} className="mt-2 rounded-lg border border-[#ffc1af]/60 px-2.5 py-1.5 font-semibold text-white hover:bg-white/10">Tekrar dene</button>}</div>
            ) : rentalServiceSummary && (
              <div className="rounded-xl border border-white/10 bg-white/[.08] px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-[#d8e8e3]">
                    Müşteri hizmeti
                  </span>
                  <strong className="font-serif text-2xl text-[#e6c47d]">
                    {rentalServiceSummary.open}
                  </strong>
                </div>
                <p className="mt-1 text-[11px] text-[#aac8c0]">
                  Gecikmiş: {rentalServiceSummary.overdue} · Manager incelemesi:{" "}
                  {rentalServiceSummary.prepared} · Paylaşım için hazır:{" "}
                  {rentalServiceSummary.reviewed}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowManagerExceptions(true)}
                className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-2 text-left transition-colors hover:bg-white/[.12]"
              >
                <span className="block text-lg font-serif text-white">
                  {reviewContractCount}
                </span>
                <span className="block text-[10px] leading-4 text-[#b4d1ca]">
                  Sözleşme işlemi
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowManagerExceptions(true)}
                className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-2 text-left transition-colors hover:bg-white/[.12]"
              >
                <span className="block text-lg font-serif text-white">
                  {openCollectionCount}
                </span>
                <span className="block text-[10px] leading-4 text-[#b4d1ca]">
                  Açık tahsilat
                </span>
              </button>
            </div>
          </div>
        ) : visiblePersonalItems.length ? (
          <div className="mt-6 space-y-2" aria-label="Size özel vade listesi">
            {visiblePersonalItems.map(item => (
              <div
                key={item.id}
                className="rounded-xl border border-white/[.08] px-3 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-xs font-semibold leading-5 text-white">
                    {item.title}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${dueTone(item.days)}`}
                  >
                    {dueLabel(item.days)}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-[#b4d1ca]">
                  Son tarih: {formatTurkishDate(item.dueDate)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-white/20 bg-white/[.06] px-4 py-5 text-center">
            <CheckCircle2 className="mx-auto h-5 w-5 text-[#62c4ae]" />
            <p className="mt-2 text-xs font-semibold text-white">
              Bugün için açık takip yok
            </p>
            <p className="mt-1 text-[11px] leading-4 text-[#b4d1ca]">
              Size atanmış vade veya işlem adımı oluştuğunda burada görünür.
            </p>
          </div>
        )}

        {!isManager && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenContracts}
              className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-2 text-left transition-colors hover:bg-white/[.12]"
            >
              <span className="block text-lg font-serif text-white">
                {reviewContractCount}
              </span>
              <span className="block text-[10px] leading-4 text-[#b4d1ca]">
                Sözleşme adımı
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenAccounting}
              className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-2 text-left transition-colors hover:bg-white/[.12]"
            >
              <span className="block text-lg font-serif text-white">
                {openCollectionCount}
              </span>
              <span className="block text-[10px] leading-4 text-[#b4d1ca]">
                Açık tahsilat
              </span>
            </button>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <span className="flex items-center gap-1.5 text-[10px] text-[#b4d1ca]">
            <ShieldCheck className="h-3.5 w-3.5" /> Rolünüze göre filtrelendi
          </span>
          <Button
            variant="ghost"
            onClick={onOpenObligations}
            className="h-8 rounded-lg px-2 text-xs font-semibold text-[#e6c47d] hover:bg-white/10 hover:text-white"
          >
            Vadeleri aç <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
      <Dialog
        open={showManagerExceptions}
        onOpenChange={setShowManagerExceptions}
      >
        <DialogContent className="max-w-sm border-[#a8ccc2] bg-[#f7fbf9]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#173e39]">
              İstisna özeti
            </DialogTitle>
            <DialogDescription>
              Bu görünüm danışman, müşteri ve sözleşme adı açmadan ofis geneli
              takip gereksinimini gösterir.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 text-sm">
            <div className="rounded-xl border border-[#dce8e4] bg-white p-3">
              <strong className="text-[#24413b]">
                {reviewContractCount} sözleşme işlemi
              </strong>
              <p className="mt-1 text-xs text-[#6a7e77]">
                Taslak, inceleme veya malik onayı bekleyen kayıtlar.
              </p>
            </div>
            <div className="rounded-xl border border-[#dce8e4] bg-white p-3">
              <strong className="text-[#24413b]">
                {openCollectionCount} açık tahsilat
              </strong>
              <p className="mt-1 text-xs text-[#6a7e77]">
                Kapanmamış alacak kaydı sayısı.
              </p>
            </div>
            <div className="rounded-xl border border-[#dce8e4] bg-white p-3">
              <strong className="text-[#24413b]">
                {overdueCount} gecikmiş vade
              </strong>
              <p className="mt-1 text-xs text-[#6a7e77]">
                Danışman iş listelerinde önceliklendirilen kayıtlar.
              </p>
            </div>
            {rentalServiceState === "loading" ? (
              <div className="rounded-xl border border-white/10 bg-white/[.08] px-3 py-3 text-xs text-[#d8e8e3]" role="status">Müşteri hizmeti görevleri yükleniyor…</div>
            ) : rentalServiceState === "error" ? (
              <div className="rounded-xl border border-[#ffb099]/50 bg-[#6f332c]/45 px-3 py-3 text-xs text-[#ffe0d7]" role="alert"><p>Müşteri hizmeti görevleri yüklenemedi. Sıfır görev bilgisi gösterilmez.</p>{onRefreshRentalServiceTasks && <button type="button" onClick={onRefreshRentalServiceTasks} className="mt-2 rounded-lg border border-[#ffc1af]/60 px-2.5 py-1.5 font-semibold text-white hover:bg-white/10">Tekrar dene</button>}</div>
            ) : rentalServiceSummary && (
              <div className="rounded-xl border border-[#dce8e4] bg-white p-3">
                <strong className="text-[#24413b]">
                  {rentalServiceSummary.open} açık müşteri hizmeti görevi
                </strong>
                <p className="mt-1 text-xs text-[#6a7e77]">
                  Gecikmiş: {rentalServiceSummary.overdue} · Manager incelemesi:{" "}
                  {rentalServiceSummary.prepared} · Paylaşım için hazır:{" "}
                  {rentalServiceSummary.reviewed}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManagerExceptions(false)}
            >
              Kapat
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setShowManagerExceptions(false);
                onOpenContracts?.();
              }}
            >
              Sözleşmeleri aç
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
