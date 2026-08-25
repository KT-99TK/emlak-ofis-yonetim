import type { ReactNode } from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type DocumentPrintPreviewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
  onPrint: () => void;
  children: ReactNode;
};

export default function DocumentPrintPreview({ open, onOpenChange, title, subtitle, onPrint, children }: DocumentPrintPreviewProps) {
  const continueToSystemPrint = () => {
    onOpenChange(false);
    window.setTimeout(onPrint, 140);
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent showCloseButton={false} className="max-h-[94vh] max-w-[calc(100vw-1.25rem)] overflow-hidden rounded-2xl border-[#d9e2dc] bg-[#f5f7f4] p-0 shadow-2xl sm:max-w-[1180px]">
      <div className="flex items-start justify-between gap-5 border-b border-[#d9e2dc] bg-white px-5 py-4">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a17b43]">Uygulama içi A4 yazdırma önizlemesi</p><h2 className="mt-1 font-serif text-2xl text-[#223230]">{title}</h2><p className="mt-1 text-xs text-[#68736f]">{subtitle}</p></div>
        <Button type="button" variant="ghost" size="icon" className="shrink-0" aria-label="Önizlemeyi kapat" onClick={() => onOpenChange(false)}><X className="h-4 w-4" /></Button>
      </div>
      <div className="max-h-[64vh] overflow-auto bg-[#dfe6e1] p-4 sm:p-7" aria-label="A4 belge önizlemesi"><div className="mx-auto w-fit min-w-[210mm] shadow-[0_18px_38px_rgba(20,46,40,.22)]">{children}</div></div>
      <div className="flex flex-col-reverse gap-2 border-t border-[#d9e2dc] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[#68736f]">A4 oranını ve tablo sınırlarını burada kontrol edin. Onaydan sonra sistem yazdırmasına geçin.</p><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Kapat</Button><Button type="button" className="bg-[#173e39] text-white hover:bg-[#20554e] hover:text-white" onClick={continueToSystemPrint}><Printer className="mr-2 h-4 w-4" /> Sistem yazdırmasına geç</Button></div></div>
    </DialogContent>
  </Dialog>;
}
