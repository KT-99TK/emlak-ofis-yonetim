import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

function formatAuditDate(value: Date | string | null | undefined) {
  if (!value) return "Tarih yok";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "Tarih yok" : date.toLocaleString("tr-TR");
}

export default function Audit() {
  const { user } = useAuth();
  const logs = trpc.audit.list.useQuery(undefined, { enabled: user?.role === "admin", retry: false });
  const [userFilter, setUserFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filteredLogs = useMemo(() => {
    const normalizedUserFilter = userFilter.trim().toLocaleLowerCase("tr-TR");
    return (logs.data ?? []).filter((log) => {
      const actor = log as typeof log & { actorName?: string | null; loginName?: string | null };
      const userText = [actor.actorName, actor.loginName, `Kullanıcı #${log.actorUserId}`, String(log.actorUserId)]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("tr-TR");
      const matchesUser = !normalizedUserFilter || userText.includes(normalizedUserFilter);
      const createdAt = log.createdAt ? new Date(log.createdAt) : null;
      const matchesDate = !dateFilter || (createdAt && !Number.isNaN(createdAt.getTime()) && createdAt.toISOString().slice(0, 10) === dateFilter);
      return matchesUser && matchesDate;
    });
  }, [dateFilter, logs.data, userFilter]);

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#f7f7f4] px-5 py-12 md:px-10">
        <Card className="mx-auto max-w-xl rounded-2xl border-[#ead6d0] bg-[#fff8f6]">
          <CardContent className="p-8 text-center">
            <ShieldCheck className="mx-auto mb-3 h-7 w-7 text-[#a85745]" />
            <h1 className="font-serif text-2xl text-[#34433f]">Manager yetkisi gerekli</h1>
            <p className="mt-2 text-sm text-[#87938f]">Denetim kayıtları yalnızca broker manager hesaplarına görünür.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9">
      <header className="mb-7">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]">Güven ve kontrol</p>
        <h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Denetim kayıtları</h1>
        <p className="mt-2 text-sm text-[#70807c]">Kritik sözleşme ve finans hareketlerinin değiştirilemez işlem izi.</p>
      </header>

      <Card className="rounded-2xl border-[#e5e8e3] bg-white/80">
        <CardHeader className="gap-4">
          <CardTitle className="font-serif text-xl">Son kritik hareketler</CardTitle>
          <div className="grid gap-3 rounded-xl border border-[#e5e8e3] bg-[#f8fbf8] p-3 md:grid-cols-[minmax(0,1fr)_180px]">
            <label className="relative block">
              <span className="mb-1.5 block text-xs font-semibold text-[#50665f]">Kullanıcı adı / kullanıcı no</span>
              <Search className="pointer-events-none absolute left-3 top-[31px] h-4 w-4 text-[#78958b]" />
              <Input
                value={userFilter}
                onChange={(event) => setUserFilter(event.target.value)}
                placeholder="K-TASLIARMUT veya 1"
                className="h-9 border-[#d4e0d9] bg-white pl-9"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#50665f]">İşlem tarihi</span>
              <Input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="h-9 border-[#d4e0d9] bg-white"
              />
            </label>
          </div>
          {(userFilter || dateFilter) && <p className="text-xs text-[#70807c]">Filtre sonucu: {filteredLogs.length} kayıt</p>}
        </CardHeader>
        <CardContent>
          {logs.isLoading ? (
            <p role="status" className="py-10 text-center text-sm text-[#87938f]">Kayıtlar yükleniyor…</p>
          ) : logs.isError ? (
            <p role="alert" className="py-10 text-center text-sm text-[#a85745]">Kayıtlar alınamadı.</p>
          ) : !logs.data?.length ? (
            <p className="py-10 text-center text-sm text-[#87938f]">Henüz audit kaydı bulunmuyor.</p>
          ) : !filteredLogs.length ? (
            <p className="py-10 text-center text-sm text-[#87938f]">Bu filtrelerle eşleşen kayıt bulunamadı.</p>
          ) : (
            <div className="space-y-1.5">
              {filteredLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-[#edf0ec] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-[#34433f]" title={`${log.action} · ${log.entityType}`}>
                      {log.action} · {log.entityType}
                    </p>
                    <span className="shrink-0 text-xs font-semibold text-[#50665f]">Kullanıcı #{log.actorUserId}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-3">
                    <p className="truncate text-xs text-[#70807c]" title={log.summary ?? undefined} aria-label={`Açıklama: ${log.summary ?? "Açıklama yok"}`}>
                      {log.summary}
                    </p>
                    <time className="shrink-0 text-[11px] text-[#87938f]" dateTime={log.createdAt ? new Date(log.createdAt).toISOString() : undefined}>
                      {formatAuditDate(log.createdAt)}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
