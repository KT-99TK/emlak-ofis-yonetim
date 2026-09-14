import { Archive, ExternalLink, FileLock2, History, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BackupArchiveCard() {
  return (
    <Card className="rounded-2xl border-[#dfe6df] bg-white/90 shadow-[0_10px_30px_rgba(26,46,42,.04)]">
      <CardHeader className="flex flex-row items-start justify-between gap-3 p-5 pb-3">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a17b43]">
            <Archive className="h-3.5 w-3.5" /> Güvenli arşiv
          </div>
          <CardTitle className="font-serif text-xl font-medium text-[#20312e]">
            Proje yedekleri ve geçmiş
          </CardTitle>
          <p className="mt-1 text-xs leading-5 text-[#74827e]">
            Kod checkpoint’i, resmi Manus yedeği ve teknik kararların durumu.
          </p>
        </div>
        <Badge className="shrink-0 border-[#cfe4dc] bg-[#f1faf6] text-[10px] text-[#287362]">
          Takipte
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 p-5 pt-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-[#edf0ec] bg-[#fafcf9] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#34433f]">
              <ShieldCheck className="h-4 w-4 text-[#2b786e]" /> Kod checkpoint’i
            </div>
            <p className="mt-1 text-[11px] text-[#7a8783]">
              Durum: <strong className="text-[#34433f]">Son kayıtlı sürüm</strong>
            </p>
          </div>
          <div className="rounded-xl border border-[#f0e5d2] bg-[#fffbf3] p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#705529]">
              <FileLock2 className="h-4 w-4 text-[#a17b43]" /> Resmi Task Data Backup
            </div>
            <p className="mt-1 text-[11px] text-[#8b7755]">
              Hesap panelinden ayrıca alınmalı ve doğrulanmalıdır.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-[#e5e8e3] bg-[#f7f7f4] p-3 text-[11px] leading-5 text-[#64716e]">
          <div className="flex items-center gap-2 font-semibold text-[#34433f]">
            <History className="h-4 w-4 text-[#4d4b7e]" /> Görüşme arşivi durumu
          </div>
          <p className="mt-1">
            Kod ve teknik kararlar checkpoint’lerle korunur. Bu kart, sohbetin tam metin dışa aktarımının yerine geçmez; son sürüm Management UI sürüm geçmişinden, tam görev yedeği ise Manus Backup sayfasından doğrulanmalıdır.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            asChild
            className="h-9 flex-1 rounded-xl bg-[#173e39] text-xs font-semibold text-white hover:bg-[#20554e]"
          >
            <a href="https://manus.im/backup" target="_blank" rel="noreferrer">
              Resmi yedekleme sayfası <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-9 flex-1 rounded-xl border-[#d8ddd8] bg-white text-xs text-[#34433f] hover:bg-[#f1f5f2]"
          >
            <a href="https://help.manus.im" target="_blank" rel="noreferrer">
              Yedekleme yardımını aç <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
