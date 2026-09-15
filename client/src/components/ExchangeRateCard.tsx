import { RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatTurkishDate } from "@/lib/turkishDate";

const formatRate = (value: number) =>
  value.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

export function ExchangeRateCard() {
  const rateQuery = trpc.exchangeRates.daily.useQuery(undefined, {
    retry: false,
    staleTime: 15 * 60 * 1000,
  });
  const data = rateQuery.data;

  return (
    <Card className="rounded-2xl border-[#e5e8e3] bg-white/90 shadow-[0_10px_30px_rgba(26,46,42,.04)]">
      <CardHeader className="flex flex-row items-start justify-between gap-3 p-5 pb-2 md:p-6 md:pb-2">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a17b43]">
            <TrendingUp className="h-3.5 w-3.5" /> Günlük bilgi
          </div>
          <CardTitle className="mt-2 font-serif text-2xl font-medium text-[#173e39]">
            EUR / USD / TRY
          </CardTitle>
        </div>
        <span className="rounded-full bg-[#f5fbf8] px-2.5 py-1 text-[10px] font-semibold text-[#2b786e]">
          TCMB referans
        </span>
      </CardHeader>
      <CardContent className="p-5 pt-2 md:p-6 md:pt-2">
        {rateQuery.isLoading ? (
          <p className="py-6 text-xs text-[#87938f]" role="status">Kur bilgisi yükleniyor…</p>
        ) : rateQuery.isError || !data ? (
          <div className="rounded-xl border border-[#ead6d0] bg-[#fff8f6] px-3 py-3 text-xs text-[#a85745]" role="alert">
            Kur bilgisi şu anda TCMB’den alınamadı.
            <Button type="button" variant="ghost" onClick={() => void rateQuery.refetch()} className="mt-1 h-8 px-1.5 text-xs text-[#a85745]">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Tekrar dene
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {(["EUR", "USD"] as const).map(currency => (
                <div key={currency} className="rounded-xl border border-[#edf0ec] bg-[#fbfdfb] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#70807c]">{currency} / TRY</p>
                  <p className="mt-1 font-serif text-2xl font-medium tracking-[-0.04em] text-[#20312e]">
                    {formatRate(data.rates[currency].buying)}
                  </p>
                  <p className="mt-1 text-[10px] text-[#87938f]">Alış · Satış {formatRate(data.rates[currency].selling)}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-[#87938f]">
              Veri tarihi: {formatTurkishDate(data.rateDate)} · Kaynak: TCMB
            </p>
            <p className="mt-3 border-t border-[#edf0ec] pt-3 text-[10px] leading-4 text-[#9aa6a1]">
              Gösterge niteliğindeki bilgilendirme kurudur; muhasebe veya işlem kuru olarak kullanılmaz.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
