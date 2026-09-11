import { BookOpen, CheckCircle2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const guideSteps = [
  {
    number: "01",
    title: "Güne açılış ekranından başlayın",
    description: "Bugünkü Planım, yaklaşan vade ve sistemden gelen takipleri kontrol edin. Tamamlanan görevleri işaretleyerek gün içindeki ilerlemenizi görün.",
    path: null,
  },
  {
    number: "02",
    title: "Müşteri ve portföy kaydını önce oluşturun",
    description: "Sözleşme hazırlamadan önce müşteriyi ve taşınmazı sistemde doğru kayıtla eşleştirin. Böylece sonraki takipler tek yerde toplanır.",
    path: "/clients",
  },
  {
    number: "03",
    title: "Bana Hatırlat ile takip bırakın",
    description: "Müşteri, portföy, sözleşme veya tahsilat satırındaki düğmeye basın; tarih, öncelik ve not seçerek görevi kişisel listenize alın.",
    path: null,
  },
  {
    number: "04",
    title: "Sözleşme ve tahsilat adımını tamamlayın",
    description: "Kira, satış ve yetki kayıtlarını ilgili modülden ilerletin. Kimlik ve telefon gibi hassas alanları yalnız gerekli gerekçeyle görüntüleyin.",
    path: "/contracts",
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
            <DialogTitle className="font-serif text-3xl text-[#173e39]">Sistemi günlük çalışma masanız yapın</DialogTitle>
            <DialogDescription className="leading-5">
              En sık kullanılan akışı dört adımda takip edin. Kılavuz, hassas verileri gereksiz yere açmadan günlük işlemleri doğru sırayla yürütmenize yardımcı olur.
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
