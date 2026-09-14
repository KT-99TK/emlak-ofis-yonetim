import { Archive, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { BackupArchiveCard } from "@/components/BackupArchiveCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const includedItems = [
  "Uygulama kaynak kodu ve yapılandırma dosyaları",
  "Veritabanı şeması ve migration dosyaları",
  "Testler, teknik kararlar ve sözleşme/form tanımları",
  "Projenin devamı için gerekli operasyonel durum özeti",
];

const excludedItems = [
  "Manus destek ve TLS yazışmaları",
  "Geçici render ve görsel doğrulama çıktıları",
  "Parolalar, tokenlar, API anahtarları ve .env değerleri",
];

export default function ProjectBackups() {
  return (
    <main className="min-h-full bg-[#f7faf7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-[#dfe8e1] bg-white px-5 py-6 shadow-[0_12px_30px_rgba(26,46,42,.04)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a17b43]">
              <Archive className="h-4 w-4" /> Proje güvenliği
            </div>
            <h1 className="font-serif text-3xl font-medium text-[#20312e] sm:text-4xl">
              Proje Yedekleri
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687873]">
              Yazılımın devamı için gerekli kaynakları, teknik kararları ve son checkpoint durumunu tek yerde takip edin.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-[#cfe4dc] bg-[#f1faf6] px-4 py-3 text-xs font-semibold text-[#287362]">
            <CheckCircle2 className="h-4 w-4" /> Kapsam görünür
          </div>
        </header>

        <BackupArchiveCard />

        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="rounded-2xl border-[#dfe6df] bg-white shadow-[0_10px_30px_rgba(26,46,42,.04)]">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="flex items-center gap-2 font-serif text-xl font-medium text-[#20312e]">
                <FileText className="h-5 w-5 text-[#2b786e]" /> Yedek kapsamına dahil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-5 pt-2">
              {includedItems.map((item) => (
                <div key={item} className="flex items-start gap-2 rounded-xl bg-[#f7fbf8] px-3 py-2.5 text-sm leading-5 text-[#4b5f58]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2b786e]" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#eadfca] bg-[#fffdf8] shadow-[0_10px_30px_rgba(90,69,33,.04)]">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="flex items-center gap-2 font-serif text-xl font-medium text-[#4e4028]">
                <ShieldCheck className="h-5 w-5 text-[#a17b43]" /> Yedek dışında bırakılanlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-5 pt-2">
              {excludedItems.map((item) => (
                <div key={item} className="flex items-start gap-2 rounded-xl bg-[#fffaf0] px-3 py-2.5 text-sm leading-5 text-[#6f6047]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#a17b43]" />
                  <span>{item}</span>
                </div>
              ))}
              <p className="pt-2 text-xs leading-5 text-[#7f7158]">
                Resmi Manus Task Data Backup kapsamı ayrıca Manus hesabı içinden doğrulanmalıdır. Bu ekran, sohbetin kelimesi kelimesine tam dışa aktarımını garanti etmez.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
