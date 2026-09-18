import { BookOpen, CheckCircle2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const guideSteps = [
  {
    number: "01",
    title: "Müşteriyi (malik/alıcı/kiracı) kaydedin",
    description: "Her süreç burada başlar. Ad, telefon ve adres bilgisiyle müşteriyi oluşturun — sonraki hiçbir adım bu kayıt olmadan ilerlemez.",
    path: "/clients",
  },
  {
    number: "02",
    title: "Portföyü müşteriye bağlayarak girin",
    description: "Müşteri kaydından sonra ekranda çıkan \"Portföy ekle\" kısayolunu kullanın veya Portföy sayfasından mülk sahibini seçerek taşınmazı tanımlayın (başlık, açık adres, kiralık/satılık).",
    path: "/properties",
  },
  {
    number: "03",
    title: "Yetki Sözleşmesi (EİDS) düzenleyin",
    description: "Önce malik, sonra o malike bağlı portföy seçilir; m², oda sayısı ve bedel otomatik gelir, burada tamamlanır. Bu adım 1 ve 2. adımlar tamamlanmadan çalışmaz.",
    path: "/authority-contracts",
  },
  {
    number: "04",
    title: "Kiralık ise: Kira Sözleşmesi",
    description: "Kiracı bulunduğunda kiracı bilgisi, bedel ve tahliye ihbar süresiyle sözleşmeyi oluşturun. Aktif olduğunda kayıt otomatik olarak Aktif Kiralamalar listesine düşer.",
    path: "/contracts",
  },
  {
    number: "05",
    title: "Satılık ise: Ön Protokol → Satış Sözleşmesi",
    description: "Önce Satış ve Kat Karşılığı Formları'ndan Alım-Satım Ön Protokolü'nü doldurun, ardından aynı Sözleşmeler ekranından tür \"Satış\" seçilerek nihai kaydı oluşturun.",
    path: "/contract-form-templates",
  },
  {
    number: "06",
    title: "Kat karşılığı ise: Danışmanlık Sözleşmesi",
    description: "Hizmet sözleşmesi, bono ve alacağın temliki birlikte üretilir (temlik yalnızca hizmet sözleşmesine atıfla geçerlidir). İnşaat sözleşmesi şablonu Satış ve Kat Karşılığı Formları'nda ayrıca bulunur.",
    path: "/consultancy-agreements",
  },
  {
    number: "07",
    title: "Bana Hatırlat ile takip bırakın",
    description: "Müşteri, portföy, sözleşme veya tahsilat satırındaki düğmeye basın; tarih, öncelik ve not seçerek görevi kişisel listenize alın.",
    path: null,
  },
  {
    number: "08",
    title: "Kira ve tahsilatı izlemeye devam edin",
    description: "Aktif Kiralamalar'da kira artış/tahliye tarihlerini, Ön Muhasebe ve Kira & Vergi Vadeleri'nde tahsilat ve ödeme takibini sürdürün. Kimlik ve telefon gibi hassas alanları yalnız gerekli gerekçeyle görüntüleyin.",
    path: "/active-rentals",
  },
];

export function UserGuideDialog({ onOpenPath }: { onOpenPath?: (path: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-10 rounded-xl border-[#d8ddd8] bg-white/80 px-3 text-xs font-semibold text-[#345850] hover:bg-[#f1f8f5]"
      >
        <BookOpen className="mr-2 h-4 w-4 text-[#a17b43]" /> Kullanım Kılavuzu
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[#dce8e4] bg-[#f7fbf9]">
          <DialogHeader>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a17b43]">
              <BookOpen className="h-3.5 w-3.5" /> Global 1881 çalışma kılavuzu
            </div>
            <DialogTitle className="font-serif text-3xl text-[#173e39]">Müşteriden sözleşmeye: süreç omurgası</DialogTitle>
            <DialogDescription className="leading-5">
              Müşteri → Portföy → Yetki Sözleşmesi sırası her zaman zorunludur; ondan sonra kiralık, satılık veya kat karşılığı koluna geçilir. Kılavuz, hassas verileri gereksiz yere açmadan işlemleri doğru sırayla yürütmenize yardımcı olur.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-3">
            {guideSteps.map(step => (
              <div key={step.number} className="flex items-start gap-3 rounded-xl border border-[#e1ebe6] bg-white p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e8dfcc] text-[10px] font-bold text-[#8d6f3f]">{step.number}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-[#34433f]">{step.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#70807c]">{step.description}</p>
                  {step.path && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onOpenPath?.(step.path!);
                      }}
                      className="mt-2 inline-flex items-center text-xs font-semibold text-[#2b786e] hover:underline"
                    >
                      İlgili ekrana git <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#abc4bb]" />
              </div>
            ))}
          </div>
          <p className="border-t border-[#dce8e4] pt-3 text-[10px] leading-4 text-[#87938f]">
            Hatırlatmalar yalnızca uygulama içinde gösterilir. Sistem kapalıyken e-posta, SMS veya WhatsApp bildirimi gönderilmez.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
