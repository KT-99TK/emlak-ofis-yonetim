import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileSignature, Printer, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import TurkishDateInput from "@/components/TurkishDateInput";
import DocumentPrintPreview from "@/components/DocumentPrintPreview";
import ConsultancyAssignmentDocument, { type ConsultancyDocumentKind } from "@/components/ConsultancyAssignmentDocument";
import { formatWholeCurrencyInput } from "@/lib/authorityContract";
import {
  emptyConsultancyAssignmentDetails,
  normalizeConsultancyAssignmentDetails,
  normalizeConsultancyAssignmentField,
  type ConsultancyAssignmentDetails,
} from "@/lib/consultancyAssignmentContract";
import { deleteConsultancyAssignmentDraft, listConsultancyAssignmentDrafts, saveConsultancyAssignmentDraft, type ConsultancyAssignmentDraft } from "@/lib/consultancyAssignmentDrafts";

type TextKey = Extract<keyof ConsultancyAssignmentDetails, string>;

const REQUIRED_FIELDS: Partial<Record<TextKey, string>> = {
  jobOwnerName: "İş Sahibi adı/unvanı", consultantName: "Danışman adı", consultantIdentity: "Danışman TCKN",
  projectName: "Proje adı", unitDescription: "Bağımsız Bölüm tanımı", serviceFeeAmount: "Hizmet bedeli", contractDate: "Sözleşme tarihi",
};

const kindLabels: Record<ConsultancyDocumentKind, string> = {
  service: "Danışmanlık Hizmet Sözleşmesi",
  bono: "Bono (Ek)",
  temlik: "Alacağın Temliki Sözleşmesi (Ek)",
};

const kindFileNamePrefix: Record<ConsultancyDocumentKind, string> = {
  service: "Kat-Karsiligi-Danismanlik-Hizmet-Sozlesmesi",
  bono: "Bono",
  temlik: "Alacagin-Temliki-Sozlesmesi",
};

function TextField({ label, value, onChange, required, placeholder, className }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">{label}{required ? <span className="text-[#a85745]"> *</span> : null}</label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="bg-white" />
    </div>
  );
}

export default function ConsultancyAssignmentContracts() {
  const [contractNo, setContractNo] = useState("");
  const [details, setDetails] = useState<ConsultancyAssignmentDetails>(() => emptyConsultancyAssignmentDetails());
  const [kind, setKind] = useState<ConsultancyDocumentKind>("service");
  const [fontSize, setFontSize] = useState("10.5");
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [saveVisualState, setSaveVisualState] = useState<"idle" | "invalid" | "saved">("idle");
  const [message, setMessage] = useState("");
  const [drafts, setDrafts] = useState<ConsultancyAssignmentDraft[]>(() => listConsultancyAssignmentDrafts());
  const [selectedDraftId, setSelectedDraftId] = useState("");

  const missingKeys = useMemo(
    () => (Object.keys(REQUIRED_FIELDS) as TextKey[]).filter((key) => !String(details[key] ?? "").trim()),
    [details],
  );
  const missingLabels = missingKeys.map((key) => REQUIRED_FIELDS[key]).filter(Boolean);

  const update = (key: TextKey, value: string) => {
    setSaveVisualState("idle");
    setDetails((current) => ({ ...current, [key]: value }));
  };
  const normalizeOnBlur = (key: TextKey) => setDetails((current) => ({ ...current, [key]: normalizeConsultancyAssignmentField(key, current[key] as string) }));
  const updateFee = (value: string) => update("serviceFeeAmount", formatWholeCurrencyInput(value));
  const fieldClass = (key: TextKey) => saveAttempted && missingKeys.includes(key) ? "border-[#b34d43] bg-[#fff7f5]" : "";

  const openPrintPreview = () => setPrintPreviewOpen(true);
  const printFromPreview = () => { setPrintPreviewOpen(false); window.setTimeout(() => window.print(), 140); };

  const saveDraft = () => {
    setSaveAttempted(true);
    if (missingKeys.length) {
      setSaveVisualState("invalid");
      setMessage(`Kayıt için şu zorunlu alanları tamamlayın: ${missingLabels.join(", ")}.`);
      return;
    }
    const normalized = normalizeConsultancyAssignmentDetails(details);
    const saved = saveConsultancyAssignmentDraft({ id: selectedDraftId || undefined, contractNo: contractNo.trim() || "TASLAK", details: normalized });
    setDetails(normalized);
    setSelectedDraftId(saved.id);
    setDrafts(listConsultancyAssignmentDrafts());
    setSaveAttempted(false);
    setSaveVisualState("saved");
    setMessage("Taslak bu tarayıcıya kaydedildi. Bu belge paketi nadir/özel olduğundan merkezi veritabanına değil, yalnızca bu cihaza kaydedilir — başka bir cihazdan çağıramazsınız.");
  };

  const loadDraft = (id: string) => {
    setSelectedDraftId(id);
    const draft = drafts.find((item) => item.id === id);
    if (!draft) return;
    setContractNo(draft.contractNo);
    setDetails(normalizeConsultancyAssignmentDetails(draft.details));
    setSaveAttempted(false);
    setSaveVisualState("idle");
    setMessage(`"${draft.label}" taslağı yüklendi.`);
  };

  const removeDraft = (id: string) => {
    deleteConsultancyAssignmentDraft(id);
    setDrafts(listConsultancyAssignmentDrafts());
    if (selectedDraftId === id) setSelectedDraftId("");
  };

  const saveButtonClass = saveVisualState === "saved"
    ? "bg-[#004225] text-white hover:bg-[#00371f] hover:text-white [&_svg]:text-white"
    : saveVisualState === "invalid"
      ? "bg-[#b34d43] text-white hover:bg-[#963b34] hover:text-white [&_svg]:text-white"
      : "border border-[#173e39] bg-transparent text-[#173e39] hover:bg-[#eaf2ed] hover:text-[#173e39]";

  const documentNode = <ConsultancyAssignmentDocument kind={kind} details={details} contractNo={contractNo.trim() || "TASLAK"} fontSize={fontSize} />;

  return (
    <div className="consultancy-assignment-workspace min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]">Nadir / özel belge — yalnızca bu cihazda saklanır</p>
          <h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Kat Karşılığı Danışmanlık Sözleşmesi</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#70807c]">Danışmanın nakit komisyon yerine bir bağımsız bölüm karşılığında çalıştığı özel anlaşmalar içindir. Hizmet Sözleşmesi, Bono ve Alacağın Temliki Sözleşmesi aynı bilgilerle üç ayrı belge olarak üretilir.</p>
        </div>
        <Button onClick={openPrintPreview} variant="outline" className="rounded-xl bg-white"><Printer className="mr-2 h-4 w-4" /> A4 yazdırma önizlemesi</Button>
      </header>

      <div className="mx-auto max-w-[1200px] space-y-6">
        <Card className="rounded-2xl border-[#e5e8e3] bg-white/85 print:hidden">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Doldurulabilir sözleşme bilgileri</CardTitle>
            <p className="text-xs text-[#87938f]">Aynı bilgiler her üç belgede (Hizmet Sözleşmesi, Bono, Temlik) ortak kullanılır; kişiler ve proje adı tamamen değişkendir.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="rounded-xl border border-[#eadfca] bg-[#fffaf0] p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Kayıt No (serbest metin)</label>
                  <Input value={contractNo} onChange={(event) => setContractNo(event.target.value)} placeholder="Örn. DAN-2026-001" className="bg-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Önceki taslağı çağır</label>
                  <div className="flex gap-2">
                    <Select value={selectedDraftId} onValueChange={loadDraft}>
                      <SelectTrigger className="bg-white"><SelectValue placeholder={drafts.length ? "Bu cihazdaki taslaklardan seçin" : "Bu cihazda taslak yok"} /></SelectTrigger>
                      <SelectContent>{drafts.map((draft) => <SelectItem key={draft.id} value={draft.id}>{draft.contractNo} · {draft.label}</SelectItem>)}</SelectContent>
                    </Select>
                    {selectedDraftId && <Button type="button" variant="outline" className="shrink-0 bg-white" onClick={() => removeDraft(selectedDraftId)}>Taslağı sil</Button>}
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-3 sm:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Sözleşme tarihi <span className="text-[#a85745]">*</span></label>
                <TurkishDateInput value={details.contractDate} onValueChange={(value) => update("contractDate", value)} className={fieldClass("contractDate")} aria-invalid={saveAttempted && missingKeys.includes("contractDate")} />
              </div>
              <TextField label="Düzenleme yeri" value={details.signPlace} onChange={(value) => update("signPlace", value)} />
              <TextField label="Nüsha sayısı" value={details.copyCount} onChange={(value) => update("copyCount", value)} />
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Hangi belgeyi görüntülüyorsun?</label>
                <Select value={kind} onValueChange={(value) => setKind(value as ConsultancyDocumentKind)}>
                  <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(kindLabels) as ConsultancyDocumentKind[]).map((k) => <SelectItem key={k} value={k}>{kindLabels[k]}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#34433f]">İş Sahibi (Yüklenici)</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={fieldClass("jobOwnerName") ? "sm:col-span-2" : "sm:col-span-2"}>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">İş Sahibi adı / unvanı <span className="text-[#a85745]">*</span></label>
                  <Input className={fieldClass("jobOwnerName")} aria-invalid={saveAttempted && missingKeys.includes("jobOwnerName")} value={details.jobOwnerName} onChange={(event) => update("jobOwnerName", event.target.value)} onBlur={() => normalizeOnBlur("jobOwnerName")} />
                </div>
                <TextField label="Vergi Dairesi / Vergi No" value={details.jobOwnerTaxOfficeAndNo} onChange={(value) => update("jobOwnerTaxOfficeAndNo", value)} />
                <TextField label="Mersis No" value={details.jobOwnerMersisNo} onChange={(value) => update("jobOwnerMersisNo", value)} />
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Adres</label>
                  <Textarea value={details.jobOwnerAddress} onChange={(event) => update("jobOwnerAddress", event.target.value)} onBlur={() => normalizeOnBlur("jobOwnerAddress")} className="min-h-16 bg-white" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 rounded-lg border border-[#edf0ec] bg-white p-3">
                  <Checkbox checked={details.jobOwnerIsCompany} onCheckedChange={(checked) => setDetails((current) => ({ ...current, jobOwnerIsCompany: checked === true }))} />
                  <span className="text-sm text-[#34433f]">İş Sahibi tüzel kişi (bono'ya şahsen aval verecek ortak/yönetici olacak)</span>
                </div>
                {details.jobOwnerIsCompany && <TextField label="Aval verecek kişi (ortak/yönetici)" value={details.jobOwnerAvalName} onChange={(value) => update("jobOwnerAvalName", value)} className="sm:col-span-2" />}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#34433f]">Danışman (Simsar)</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Danışman adı soyadı <span className="text-[#a85745]">*</span></label>
                  <Input className={fieldClass("consultantName")} aria-invalid={saveAttempted && missingKeys.includes("consultantName")} value={details.consultantName} onChange={(event) => update("consultantName", event.target.value)} onBlur={() => normalizeOnBlur("consultantName")} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">T.C. Kimlik No <span className="text-[#a85745]">*</span></label>
                  <Input className={fieldClass("consultantIdentity")} aria-invalid={saveAttempted && missingKeys.includes("consultantIdentity")} value={details.consultantIdentity} onChange={(event) => update("consultantIdentity", event.target.value)} />
                </div>
                <TextField label="Taşınmaz Ticareti Yetki Belgesi No" value={details.consultantAuthorizationNo} onChange={(value) => update("consultantAuthorizationNo", value)} />
                <TextField label="Adres" value={details.consultantAddress} onChange={(value) => update("consultantAddress", value)} />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#34433f]">Taşınmaz ve Proje</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <TextField label="İl" value={details.propertyProvince} onChange={(value) => update("propertyProvince", value)} />
                <TextField label="İlçe" value={details.propertyDistrict} onChange={(value) => update("propertyDistrict", value)} />
                <TextField label="Mahalle" value={details.propertyNeighborhood} onChange={(value) => update("propertyNeighborhood", value)} />
                <TextField label="Pafta / Ada / Parsel" value={details.parcelInfo} onChange={(value) => update("parcelInfo", value)} className="sm:col-span-2" />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Proje adı <span className="text-[#a85745]">*</span></label>
                  <Input className={fieldClass("projectName")} aria-invalid={saveAttempted && missingKeys.includes("projectName")} value={details.projectName} onChange={(event) => update("projectName", event.target.value)} onBlur={() => normalizeOnBlur("projectName")} />
                </div>
                <div className="sm:col-span-3">
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Proje/bağımsız bölüm özeti</label>
                  <Textarea value={details.projectUnitSummary} onChange={(event) => update("projectUnitSummary", event.target.value)} className="min-h-16 bg-white" placeholder="Örn. 24 daire ve 4 villadan oluşan 28 bağımsız bölümlü konut projesi" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#34433f]">Bağlı olduğu Kat Karşılığı (İnşaat) Sözleşmesi</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Noterlik adı" value={details.landShareNotaryName} onChange={(value) => update("landShareNotaryName", value)} />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Sözleşme tarihi</label>
                  <TurkishDateInput value={details.landShareContractDate} onValueChange={(value) => update("landShareContractDate", value)} />
                </div>
                <TextField label="Yevmiye No" value={details.landShareYevmiyeNo} onChange={(value) => update("landShareYevmiyeNo", value)} />
                <TextField label="Arsa sahibi/sahipleri" value={details.landownerNames} onChange={(value) => update("landownerNames", value)} />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#34433f]">Bağımsız Bölüm ve Hizmet Bedeli</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Bağımsız Bölüm tanımı <span className="text-[#a85745]">*</span></label>
                  <Textarea className={`min-h-16 bg-white ${fieldClass("unitDescription")}`} aria-invalid={saveAttempted && missingKeys.includes("unitDescription")} value={details.unitDescription} onChange={(event) => update("unitDescription", event.target.value)} onBlur={() => normalizeOnBlur("unitDescription")} placeholder="Örn. A Blok, bahçe katı, No:4, 2+1, yaklaşık brüt 60 m² / net 55 m²" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Hizmet bedeli (kuruşsuz) <span className="text-[#a85745]">*</span></label>
                  <Input className={fieldClass("serviceFeeAmount")} aria-invalid={saveAttempted && missingKeys.includes("serviceFeeAmount")} inputMode="numeric" value={details.serviceFeeAmount} onChange={(event) => updateFee(event.target.value)} placeholder="Örn. 3.500.000" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">KDV</label>
                  <Select value={details.vatNote} onValueChange={(value) => setDetails((current) => ({ ...current, vatNote: value as "dahil" | "haric" }))}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="haric">KDV hariç</SelectItem><SelectItem value="dahil">KDV dahil</SelectItem></SelectContent>
                  </Select>
                </div>
                <TextField label="Nakit ödeme güncelleme esası" value={details.updateBasis} onChange={(value) => update("updateBasis", value)} className="sm:col-span-2" />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#34433f]">Süreler ve Devir Usulü</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="1. adım süresi (gün) — noter satış vaadi" value={details.step1DeadlineDays} onChange={(value) => update("step1DeadlineDays", value)} />
                <TextField label="2. adım süresi (gün) — tapuda tescil" value={details.step2DeadlineDays} onChange={(value) => update("step2DeadlineDays", value)} />
                <TextField label="2. adımın başlangıç referansı" value={details.step2Reference} onChange={(value) => update("step2Reference", value)} className="sm:col-span-2" />
                <TextField label="Gecikme sonrası ek süre (gün)" value={details.graceDays} onChange={(value) => update("graceDays", value)} />
                <TextField label="Uyuşmazlık şehri" value={details.disputeCity} onChange={(value) => update("disputeCity", value)} />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#34433f]">Diğer Hükümler</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Fatura düzenleme zamanı" value={details.invoiceTiming} onChange={(value) => update("invoiceTiming", value)} />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">KDV sorumluluğu</label>
                  <Select value={details.vatResponsibility} onValueChange={(value) => setDetails((current) => ({ ...current, vatResponsibility: value as "jobOwner" | "included" }))}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="jobOwner">İş Sahibi tarafından ayrıca ödenir</SelectItem><SelectItem value="included">Bedele dahildir</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Tapu harçları</label>
                  <Select value={details.titleFeeSplit} onValueChange={(value) => setDetails((current) => ({ ...current, titleFeeSplit: value as "equal" | "jobOwner" }))}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="equal">Taraflarca yarı yarıya</SelectItem><SelectItem value="jobOwner">İş Sahibi tarafından</SelectItem></SelectContent>
                  </Select>
                </div>
                <TextField label="Temlik bildirim masrafı kime ait" value={details.assignmentNoticeCostParty} onChange={(value) => update("assignmentNoticeCostParty", value)} />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#34433f]">Bono ve Ek Etiketleri</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Bono vade tarihi</label>
                  <TurkishDateInput value={details.bonoDueDate} onValueChange={(value) => update("bonoDueDate", value)} />
                </div>
                <TextField label="Bono ödeme yeri" value={details.bonoPaymentPlace} onChange={(value) => update("bonoPaymentPlace", value)} />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Bono ciro kuralı</label>
                  <Select value={details.bonoCiroRule} onValueChange={(value) => setDetails((current) => ({ ...current, bonoCiroRule: value as "forbidden" | "free" }))}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="forbidden">Ciro edilmez/devredilmez</SelectItem><SelectItem value="free">Serbestçe ciro edilebilir</SelectItem></SelectContent>
                  </Select>
                </div>
                <div />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Bono ek etiketi (boş bırakılırsa metinde hiç geçmez)</label>
                  <Input value={details.bonoAnnexLabel} onChange={(event) => update("bonoAnnexLabel", event.target.value)} placeholder="Örn. Ek-1" className="bg-white" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Temlik ek etiketi (boş bırakılırsa metinde hiç geçmez)</label>
                  <Input value={details.temlikAnnexLabel} onChange={(event) => update("temlikAnnexLabel", event.target.value)} placeholder="Örn. Ek-2" className="bg-white" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-[#87938f]">Bu üç belge bağımsız formlardır; hangi sözleşmenin kaçıncı eki olacağı sabit değildir, her kullanımda burada ayrıca belirlenir.</p>
            </section>

            <Button onClick={saveDraft} className={`w-full rounded-xl ${saveButtonClass}`}>
              {saveVisualState === "saved" ? <CheckCircle2 className="mr-2 h-4 w-4" /> : saveVisualState === "invalid" ? <AlertTriangle className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              {saveVisualState === "saved" ? "Taslak bu cihaza kaydedildi" : saveVisualState === "invalid" ? "Eksik alanları tamamlayın" : "Taslağı bu cihaza kaydet"}
            </Button>
            {message && <p role="status" className={`rounded-lg px-3 py-2 text-xs ${saveVisualState === "invalid" ? "bg-[#fff2f0] text-[#a13f36]" : "bg-[#f5fbf8] text-[#2b786e]"}`}>{message}</p>}
          </CardContent>
        </Card>

        <Card className="authority-print-shell overflow-hidden rounded-2xl border-[#d9e2dc] bg-[#eef3ef]">
          <CardHeader className="print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="font-serif text-xl">{kindLabels[kind]}</CardTitle>
                <p className="text-xs text-[#87938f]">Yukarıdaki alanlarla birlikte canlı güncellenir. Hangi belgeyi görüntüleyeceğinizi üstteki "Hangi belgeyi görüntülüyorsun?" seçiciyle değiştirin.</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[#56635f]">Punto</label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="w-[94px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="9">9 punto</SelectItem><SelectItem value="9.5">9.5 punto</SelectItem><SelectItem value="10">10 punto</SelectItem><SelectItem value="10.5">10.5 punto</SelectItem><SelectItem value="11">11 punto</SelectItem><SelectItem value="12">12 punto</SelectItem></SelectContent>
                </Select>
                <FileSignature className="h-5 w-5 text-[#a17b43]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 print:p-0">{documentNode}</CardContent>
        </Card>
      </div>

      <DocumentPrintPreview open={printPreviewOpen} onOpenChange={setPrintPreviewOpen} title={kindLabels[kind]} subtitle="Belge sistem yazdırma penceresine gönderilmeden önce burada gerçek A4 oranında incelenir." onPrint={printFromPreview} fileName={`${kindFileNamePrefix[kind]}-${contractNo.trim() || "taslak"}`}>{documentNode}</DocumentPrintPreview>
    </div>
  );
}
