import TurkishDateInput from "@/components/TurkishDateInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, CircleAlert, Cloud, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";

const confirmationText = "TEMİZ ONLINE BAŞLANGICI AKTİFLEŞTİR";

function turkeyTodayIso() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export default function OnlineStart() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const status = trpc.onlineStart.status.useQuery(undefined, { retry: false });
  const [effectiveAt, setEffectiveAt] = useState(turkeyTodayIso);
  const [note, setNote] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const configure = trpc.onlineStart.configure.useMutation({
    onSuccess: async () => {
      setConfirmation("");
      await utils.onlineStart.status.invalidate();
    },
  });

  if (user?.role !== "admin") {
    return <div className="min-h-screen bg-[#f7f7f4] px-5 py-12 md:px-10"><Card className="mx-auto max-w-xl rounded-2xl border-[#ead6d0] bg-[#fff8f6]"><CardContent className="p-8 text-center"><LockKeyhole className="mx-auto mb-3 h-7 w-7 text-[#a85745]" /><h1 className="font-serif text-2xl text-[#34433f]">Manager yetkisi gerekli</h1><p className="mt-2 text-sm text-[#70807c]">Temiz online başlangıç tarihi yalnız broker manager tarafından ayarlanabilir.</p></CardContent></Card></div>;
  }

  const current = status.data;
  const isActive = current && new Date() >= new Date(current.effectiveAt);

  return <div className="min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9"><header className="mb-7"><p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]"><Cloud className="h-3.5 w-3.5" /> Merkezi çalışma geçişi</p><h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Temiz Online Başlangıç</h1><p className="mt-2 max-w-3xl text-sm text-[#70807c]">Online sistem, belirlediğiniz geçiş tarihinden itibaren yalnız yeni işlemler için tek kaynak olur. Eski offline sözleşmeler, PDF arşivi, yedekler, kasa/banka hareketleri ve bakiye taşınmaz veya silinmez.</p></header>
    <div className="grid max-w-5xl gap-6 lg:grid-cols-[1.15fr_.85fr]">
      <Card className="rounded-2xl border-[#d7e2dc] bg-white"><CardHeader><CardTitle className="font-serif text-xl">Geçiş kuralı</CardTitle><p className="text-xs text-[#70807c]">Bu ayar geçmiş veriyi dönüştürmez. Açılış bakiyesi, devir ve eski finansal kayıt oluşturulmaz.</p></CardHeader><CardContent className="space-y-5">
        {status.isLoading ? <p className="py-6 text-sm text-[#70807c]" role="status">Merkezi başlangıç durumu yükleniyor…</p> : current ? <div className={`rounded-xl border p-4 ${isActive ? "border-[#c9e1d6] bg-[#f3faf6]" : "border-[#eadfc7] bg-[#fffaf1]"}`}><div className="flex gap-3"><CheckCircle2 className={`mt-0.5 h-5 w-5 ${isActive ? "text-[#2b786e]" : "text-[#9a7441]"}`} /><div><p className="text-sm font-semibold text-[#24483f]">{isActive ? "Temiz online başlangıç aktif" : "Temiz online başlangıç planlandı"}</p><p className="mt-1 text-xs text-[#5d7169]">Geçiş tarihi: <strong>{new Date(current.effectiveAt).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}</strong>. Sıfır bakiyeyle yalnız yeni merkezi kayıtlar kabul edilir.</p>{current.note && <p className="mt-2 text-xs text-[#5d7169]">Manager notu: {current.note}</p>}</div></div></div> : <div className="rounded-xl border border-[#eadfc7] bg-[#fffaf1] p-4"><div className="flex gap-3"><CircleAlert className="mt-0.5 h-5 w-5 text-[#9a7441]" /><div><p className="text-sm font-semibold text-[#604d2e]">Başlangıç tarihi henüz ayarlanmadı</p><p className="mt-1 text-xs text-[#756545]">Yeni merkezi müşteri, portföy, sözleşme, vade, tahsilat ve gider kaydı bu ayar yapılmadan oluşturulamaz.</p></div></div></div>}
        {!isActive && <div className="space-y-4 rounded-xl border border-[#e5e8e3] bg-[#fbfcfa] p-4"><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Online geçiş tarihi</label><TurkishDateInput value={effectiveAt} onValueChange={setEffectiveAt} className="max-w-xs bg-white" aria-label="Online geçiş tarihi" /></div><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Manager notu <span className="font-normal text-[#87938f]">(isteğe bağlı)</span></label><Input value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} placeholder="Örn. Yeni günlük operasyon bu tarihte başlar" className="bg-white" /></div><div className="rounded-lg border border-[#dbe8df] bg-[#f4faf6] p-3 text-xs text-[#42685b]"><strong>Devir yoktur:</strong> Açılış bakiyesi, eski kasa/banka, geçmiş tahsilat/gider, eski sözleşme ve PDF aktarılmaz. Devam eden aktif dosyalar gerekirse ayrı, kısa bir yeni başlangıç kaydıyla manuel açılır.</div><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Tam teyit metni</label><Input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder={confirmationText} className="bg-white" /></div>{configure.error && <p className="rounded-lg bg-[#fff3f0] px-3 py-2 text-xs text-[#a85745]" role="alert">{configure.error.message}</p>}<Button disabled={!effectiveAt || confirmation !== confirmationText || configure.isPending} onClick={() => configure.mutate({ effectiveAt: new Date(`${effectiveAt}T00:00:00`), note: note.trim() || undefined, confirmationText: confirmation })} className="rounded-xl bg-[#173e39] hover:bg-[#20554e]"><ShieldCheck className="mr-2 h-4 w-4" /> {configure.isPending ? "Başlangıç ayarlanıyor…" : "Temiz online başlangıcı ayarla"}</Button></div>}
      </CardContent></Card>
      <Card className="h-fit rounded-2xl border-[#e5e8e3] bg-white/80"><CardHeader><CardTitle className="font-serif text-xl">Bu geçişte olanlar</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-[#56635f]"><p><strong className="text-[#24483f]">Online:</strong> Geçiş tarihinden itibaren yeni müşteri, portföy, sözleşme, vade ve finans hareketleri burada oluşur.</p><p><strong className="text-[#24483f]">Offline:</strong> Eski uygulama geçmiş sözleşme ve belge arşivi için korunur; veri silinmez.</p><p><strong className="text-[#24483f]">Bakiye/devir:</strong> Taşınmaz. Online finans takibi sıfırdan, yalnız yeni hareketlerle başlar.</p><div className="rounded-xl border border-[#dbe8df] bg-[#f4faf6] p-3 text-xs leading-5 text-[#42685b]"><p className="font-semibold text-[#24483f]">Devam eden aktif dosya gerekirse</p><ol className="mt-1 list-decimal space-y-1 pl-4"><li>Manager, yalnız güncel taraf ve portföy bilgileriyle yeni müşteri/portföy kaydını açar.</li><li>Yeni sözleşme kaydının açıklamasına kısa bir <strong>başlangıç özeti</strong> yazar; eski sözleşme ayrıntısı veya geçmiş finans girmez.</li><li>Tahsilat, gider ve kasa hareketleri yalnız geçiş tarihinden sonra yeniden oluşan işlemler için eklenir.</li><li>Eski PDF ve offline yedekler yerel geçmiş arşivinde kalır; merkezi sisteme yüklenmez.</li></ol></div></CardContent></Card>
    </div>
  </div>;
}
