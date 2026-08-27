import { CheckCircle2, ClipboardList, Plus } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export type BrokerGuidanceNote = {
  id: number;
  subject: "rental_service" | "contract_review" | "collection" | "general";
  summary: string;
  status: "open" | "resolved";
};

type BrokerGuidanceNotesCardProps = {
  notes?: BrokerGuidanceNote[];
  state?: "loading" | "error";
  onRetry: () => void;
  onCreate: (input: {
    subject: BrokerGuidanceNote["subject"];
    summary: string;
  }) => void;
  onResolve: (noteId: number) => void;
  isSaving?: boolean;
  notice?: string;
  initiallyOpen?: boolean;
};

const subjectLabels: Record<BrokerGuidanceNote["subject"], string> = {
  rental_service: "Kira hizmeti",
  contract_review: "Sözleşme incelemesi",
  collection: "Tahsilat",
  general: "Genel ofis akışı",
};

/** Bu bileşen müşteri, danışman veya taşınmaz alanı kabul etmez; yalnız brokerın anonim operasyon notunu gösterir. */
export function BrokerGuidanceNotesCard({
  notes = [],
  state,
  onRetry,
  onCreate,
  onResolve,
  isSaving = false,
  notice,
  initiallyOpen = false,
}: BrokerGuidanceNotesCardProps) {
  const [open, setOpen] = useState(initiallyOpen);
  const [subject, setSubject] =
    useState<BrokerGuidanceNote["subject"]>("general");
  const [summary, setSummary] = useState("");
  const openNotes = useMemo(
    () => notes.filter(note => note.status === "open"),
    [notes]
  );
  const resolvedNotes = useMemo(
    () => notes.filter(note => note.status === "resolved"),
    [notes]
  );
  const submit = () => {
    const normalized = summary.trim();
    if (normalized.length < 8) return;
    onCreate({ subject, summary: normalized });
    setSummary("");
  };

  return (
    <>
      <div className="rounded-xl border border-white/10 bg-white/[.06] px-3 py-2 text-left">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full text-left transition-colors hover:text-[#e6c47d]"
          aria-label="Broker yönlendirme notlarını aç"
        >
          <span className="block text-lg font-serif text-white">
            {state ? "—" : openNotes.length}
          </span>
          <span className="block text-[10px] leading-4 text-[#b4d1ca]">
            Açık broker notu
          </span>
          {!state && (
            <span className="mt-1 block text-[10px] leading-4 text-[#b4d1ca]">
              {resolvedNotes.length} çözüldü
            </span>
          )}
        </button>
        {state === "error" && (
          <div className="mt-2 border-t border-white/10 pt-2 text-[10px] text-[#ffc1af]" role="alert">
            Notlar yüklenemedi.
            <button type="button" onClick={onRetry} className="ml-2 font-semibold text-white underline underline-offset-2">Yenile</button>
          </div>
        )}
      </div>
      {open && (
        <p className="sr-only">
          Müşteri, danışman, telefon, kimlik ve taşınmaz ayrıntısı yazmayın.
        </p>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg border-[#a8ccc2] bg-[#f7fbf9]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-2xl text-[#173e39]">
              <ClipboardList className="h-5 w-5 text-[#a17b43]" /> Broker
              yönlendirme notları
            </DialogTitle>
            <DialogDescription>
              Yalnız ofis içi işlem yönlendirmesi içindir. Müşteri, danışman,
              telefon, kimlik ve taşınmaz ayrıntısı yazmayın.
            </DialogDescription>
          </DialogHeader>
          {state === "loading" ? (
            <p
              className="rounded-xl bg-[#fff8e8] px-3 py-3 text-sm text-[#7a6947]"
              role="status"
            >
              Notlar yükleniyor…
            </p>
          ) : state === "error" ? (
            <div
              className="rounded-xl border border-[#e8c8bf] bg-[#fff8f5] p-3 text-sm text-[#934736]"
              role="alert"
            >
              <p>Yönlendirme notları yüklenemedi.</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={onRetry}
              >
                Tekrar dene
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-[#dce8e4] bg-white p-3">
                <label className="text-xs font-semibold text-[#51625c]">
                  Konu
                  <select
                    className="mt-1 block w-full rounded-md border border-[#d9e3dc] bg-white px-3 py-2 text-sm"
                    value={subject}
                    onChange={event =>
                      setSubject(
                        event.target.value as BrokerGuidanceNote["subject"]
                      )
                    }
                  >
                    {Object.entries(subjectLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-3 block text-xs font-semibold text-[#51625c]">
                  Anonim yönlendirme notu
                  <Textarea
                    className="mt-1 min-h-20 bg-white"
                    maxLength={280}
                    value={summary}
                    onChange={event => setSummary(event.target.value)}
                    placeholder="Örn. Kira hizmeti hazırlık kuyruğu bu hafta kontrol edilsin."
                  />
                </label>
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    disabled={isSaving || summary.trim().length < 8}
                    onClick={submit}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />{" "}
                    {isSaving ? "Kaydediliyor…" : "Notu ekle"}
                  </Button>
                </div>
                {notice && (
                  <p
                    className="mt-2 rounded-lg bg-[#f2f6f3] px-3 py-2 text-xs text-[#52635d]"
                    role="status"
                  >
                    {notice}
                  </p>
                )}
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {openNotes.map(note => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-[#dce8e4] bg-white p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#a17b43]">
                          {subjectLabels[note.subject]}
                        </p>
                        <p className="mt-1 text-sm text-[#34433f]">
                          {note.summary}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onResolve(note.id)}
                      >
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Çözüldü
                      </Button>
                    </div>
                  </div>
                ))}
                {!openNotes.length && (
                  <p className="rounded-xl bg-white px-4 py-8 text-center text-sm text-[#718079]">
                    Açık broker yönlendirme notu yok.
                  </p>
                )}
              </div>
              {resolvedNotes.length > 0 && (
                <details className="rounded-xl border border-[#dce8e4] bg-white px-3 py-2">
                  <summary className="cursor-pointer text-xs font-semibold text-[#51625c]">
                    Çözülen notlar ({resolvedNotes.length})
                  </summary>
                  <div className="mt-2 space-y-2 border-t border-[#edf1ed] pt-2">
                    {resolvedNotes.map(note => (
                      <div key={note.id} className="text-xs text-[#718079]">
                        <span className="font-semibold text-[#5e776f]">
                          {subjectLabels[note.subject]} · Çözüldü
                        </span>
                        <p className="mt-1">{note.summary}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
