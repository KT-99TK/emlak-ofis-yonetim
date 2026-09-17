import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Printer, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import TurkishDateInput from "@/components/TurkishDateInput";
import DocumentPrintPreview from "@/components/DocumentPrintPreview";
import SaleClosingContractDocument from "@/components/SaleClosingContractDocument";
import LandShareContractDocument from "@/components/LandShareContractDocument";
import { formatContractPhoneInput } from "@/lib/contractFormFormatting";
import { formatWholeCurrencyInput } from "@/lib/authorityContract";
import { isUppercaseTextField, toTurkishUpperCase } from "@/lib/textFormatting";
import { trpc } from "@/lib/trpc";
import { getMissingRequiredContractFormFields, isTechnicalContractFormField, resolveContractFormPlaceholders } from "@/../../shared/contractForms";

type FillerField = {
  id: number;
  fieldKey: string;
  label: string;
  fieldType: "text" | "multiline" | "date" | "currency" | "number" | "checkbox" | "select";
  partyScope: string;
  optionsJson?: string | null;
  required?: boolean | number | null;
};

type FillerBundle = {
  template: { id: number; title: string; formType: "sale_closing" | "land_share"; status: string };
  fields: FillerField[];
  attachments?: Array<{ title: string; required?: boolean | number | null; status: string }>;
};

type FillerPreview = {
  clauses: Array<{ id: number; title: string; bodyTemplate: string; articleNumber?: number | null; requesterFootnote?: string }>;
};

function fieldValueForInput(value: unknown) {
  return value == null ? "" : String(value);
}

function parseOptions(optionsJson?: string | null) {
  if (!optionsJson) return [] as string[];
  try {
    const parsed = JSON.parse(optionsJson);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [] as string[];
  }
}

function isPhoneField(field: FillerField) {
  const searchable = `${field.fieldKey} ${field.label}`.toLocaleLowerCase("tr-TR");
  return /(telefon|phone|cep|gsm|iletişim)/i.test(searchable);
}

export function ContractFormFiller({ bundle, preview }: { bundle: FillerBundle; preview?: FillerPreview | null }) {
  const [contractId, setContractId] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [printFontSize, setPrintFontSize] = useState("11");
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const printFromPreview = () => { setPrintPreviewOpen(false); window.setTimeout(() => window.print(), 140); };
  const draftKey = `form-${bundle.template.id}`;
  const missingFields = useMemo(
    () => getMissingRequiredContractFormFields(bundle.fields.map((field) => ({ ...field, required: field.required ?? undefined })), fieldValues),
    [bundle.fields, fieldValues],
  );
  const missingAttachments = (bundle.attachments ?? []).filter((attachment) => Boolean(attachment.required) && attachment.status !== "ready");
  const preparationDraftKey = `form-${bundle.template.id}-${contractId || "new"}`;
  const preparation = trpc.contracts.formTemplates.preparationChecks.useQuery({ draftKey: preparationDraftKey, formType: bundle.template.formType });
  const [preparationChecks, setPreparationChecks] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setPreparationChecks(preparation.data?.checks ?? {});
  }, [preparationDraftKey, preparation.data?.checks]);
  const savePreparation = trpc.contracts.formTemplates.savePreparationChecks.useMutation({
    onSuccess: (saved) => { setPreparationChecks(saved.checks); setStatusMessage(saved.completed ? "Kontrol listesi tamamlandı. Sözleşme kaydına geçebilirsiniz." : "Kontrol listesi kaydedildi; eksik maddeler var."); },
    onError: (error) => setStatusMessage(error.message),
  });
  const togglePreparation = (key: string, checked: boolean) => {
    const next = { ...preparationChecks, [key]: checked };
    setPreparationChecks(next);
    savePreparation.mutate({ draftKey: preparationDraftKey, formType: bundle.template.formType, checks: next });
  };
  const preparationComplete = Boolean(preparation.data?.completed || (preparation.data?.checkDefinitions.length && preparation.data.checkDefinitions.every((check) => preparationChecks[check.key] === true)));
  const createInstance = trpc.contracts.formTemplates.createInstance.useMutation({
    onSuccess: () => setStatusMessage("Taslak form kaydedildi. Gerçek müşteri/taşınmaz kaydı değiştirilmedi."),
    onError: (error) => setStatusMessage(error.message),
  });

  const updateValue = (fieldKey: string, value: unknown) => {
    const nextValue = typeof value === "string" && isUppercaseTextField(fieldKey) ? toTurkishUpperCase(value) : value;
    setFieldValues((current) => ({ ...current, [fieldKey]: nextValue }));
    setStatusMessage(null);
  };

  const renderField = (field: FillerField) => {
    const missing = missingFields.some((item) => item.fieldKey === field.fieldKey);
    const technical = isTechnicalContractFormField(field.fieldKey);
    const shell = `rounded-xl border p-3 ${missing ? "border-[#cf6b5d] bg-[#fff5f2]" : technical ? "border-[#d8e5df] bg-[#f8fbf8]" : "border-[#edf0ec] bg-white"}`;
    const label = <div className="mb-1.5 flex items-start justify-between gap-2"><label className={`text-xs font-semibold ${missing ? "text-[#9e3e31]" : "text-[#56635f]"}`}>{field.label}{field.required ? " *" : ""}</label>{technical && <Badge variant="outline" className="border-[#b8d4c7] text-[#4b8878]">Teknik</Badge>}</div>;
    const value = fieldValues[field.fieldKey];
    if (field.fieldType === "checkbox") return <div className={shell}><label className="flex items-center gap-2 text-sm text-[#34433f]"><Checkbox checked={Boolean(value)} onCheckedChange={(checked) => updateValue(field.fieldKey, checked === true)} />{field.label}{field.required ? " *" : ""}</label></div>;
    if (field.fieldType === "multiline") return <div className={shell}>{label}<Textarea value={fieldValueForInput(value)} onChange={(event) => updateValue(field.fieldKey, event.target.value)} placeholder="Bu alanı proje mutabakatına göre doldurun" className="min-h-24 bg-white" /></div>;
    if (field.fieldType === "select") return <div className={shell}>{label}<select value={fieldValueForInput(value)} onChange={(event) => updateValue(field.fieldKey, event.target.value)} className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"><option value="">Seçiniz</option>{parseOptions(field.optionsJson).map((option) => <option key={option} value={option}>{option}</option>)}</select></div>;
    if (field.fieldType === "date") return <div className={shell}>{label}<TurkishDateInput value={fieldValueForInput(value)} onValueChange={(nextValue) => updateValue(field.fieldKey, nextValue)} aria-label={field.label} /></div>;
    if (isPhoneField(field)) return <div className={shell}>{label}<Input type="tel" inputMode="tel" value={fieldValueForInput(value)} onChange={(event) => updateValue(field.fieldKey, formatContractPhoneInput(event.target.value))} placeholder="+90 5XX XXX XX XX" className="bg-white" /></div>;
    if (field.fieldType === "currency") return <div className={shell}>{label}<Input inputMode="numeric" value={fieldValueForInput(value)} onChange={(event) => updateValue(field.fieldKey, formatWholeCurrencyInput(event.target.value))} placeholder="Örn. 1.250.000 (kuruşsuz, TL)" className="bg-white" /></div>;
    return <div className={shell}>{label}<Input type={field.fieldType === "number" ? "number" : "text"} value={fieldValueForInput(value)} onChange={(event) => updateValue(field.fieldKey, event.target.value)} placeholder="Bu alanı proje mutabakatına göre doldurun" className="bg-white" /></div>;
  };

  const saveDraft = () => {
    const parsedContractId = Number(contractId);
    if (!Number.isSafeInteger(parsedContractId) || parsedContractId <= 0) {
      setStatusMessage("Taslağı kaydetmek için mevcut bir sözleşme kaydının ID numarasını girin.");
      return;
    }
    if (!preparationComplete) {
      setStatusMessage("Sözleşmeyi tamamlamadan önce aşağıdaki kontrol listesindeki tüm maddeleri tek tek inceleyip işaretleyin.");
      return;
    }
    createInstance.mutate({
      contractId: parsedContractId,
      templateId: bundle.template.id,
      fieldValues,
      selectedClauseIds: (preview?.clauses ?? []).map((clause) => clause.id),
      status: "draft",
      preparationDraftKey,
    });
  };

  const isSaleClosing = bundle.template.formType === "sale_closing";
  const isLandShare = bundle.template.formType === "land_share";
  const hasPrintableDocument = isSaleClosing || isLandShare;
  const saleClosingDocument = isSaleClosing ? (
    <SaleClosingContractDocument fieldValues={fieldValues} contractNo={contractId.trim() || "TASLAK"} fontSize={printFontSize} clauses={preview?.clauses ?? []} />
  ) : null;
  const landShareDocument = isLandShare ? (
    <LandShareContractDocument fieldValues={fieldValues} contractNo={contractId.trim() || "TASLAK"} fontSize={printFontSize} clauses={preview?.clauses ?? []} />
  ) : null;
  const printDocument = saleClosingDocument ?? landShareDocument;
  const printTitle = isSaleClosing ? "Alım-Satım Ön Protokolü" : "Arsa Payı Karşılığı İnşaat Sözleşmesi";
  const printFileNamePrefix = isSaleClosing ? "Alim-Satim-On-Protokolu" : "Kat-Karsiligi-Insaat-Sozlesmesi";

  return <>
  <Card className="mt-6 rounded-2xl border-[#c9dcd3] bg-[#fbfdfb]"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="font-serif text-xl">{bundle.template.title} — doldurma ekranı</CardTitle><p className="mt-1 text-xs text-[#70807c]">Bu ekran mevcut alanları doldurup önizlemek içindir. Kişisel veya müşteri kaydı oluşturmadan önce mevcut sözleşme ID’si gerekir.</p></div><Badge variant="outline" className="border-[#b8d4c7] text-[#4b8878]">{bundle.template.formType === "land_share" ? "Kat Karşılığı İnşaat Sözleşmesi (arsa sahibi–yüklenici)" : "Alım-Satım"}</Badge></div></CardHeader><CardContent className="space-y-5"><div className="rounded-xl border border-[#e8e2d7] bg-[#fffdf8] p-4"><label className="text-xs font-semibold text-[#56635f]">Mevcut sözleşme ID’si</label><Input value={contractId} onChange={(event) => setContractId(event.target.value.replace(/[^0-9]/g, ""))} placeholder="Örn. 123" inputMode="numeric" className="mt-1.5 max-w-xs bg-white" /><p className="mt-1 text-[11px] text-[#87938f]">Yeni müşteri veya sahte kayıt oluşturulmaz; yalnızca sistemdeki gerçek sözleşme kaydı kullanılabilir.</p></div><div className="grid gap-3 lg:grid-cols-2">{bundle.fields.map(renderField)}</div>{missingFields.length > 0 ? <div className="flex items-start gap-3 rounded-xl border-2 border-[#cf6b5d] bg-[#fff1ee] p-4 text-sm text-[#8e382d]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><div><strong>Eksik zorunlu alanlar</strong><p className="mt-1">{missingFields.map((field) => field.label).join(", ")}</p><p className="mt-1 text-xs">Bu alanlar doldurulmadan onaylı veya imzalı duruma geçirilemez.</p></div></div> : <div className="flex items-center gap-2 rounded-xl border border-[#b8d4c7] bg-[#f1faf4] p-4 text-sm font-semibold text-[#287052]"><CheckCircle2 className="h-4 w-4" />Zorunlu alanlar tamamlandı.</div>}<div className="rounded-xl border border-[#e8e2d7] bg-[#fffdf8] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a17b43]">Ek belge durumu</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{(bundle.attachments ?? []).map((attachment) => <div key={attachment.title} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${attachment.required && attachment.status !== "ready" ? "border-[#e3b4aa] bg-[#fff1ee] text-[#8e382d]" : "border-[#dce8df] bg-white text-[#56635f]"}`}><span>{attachment.title}{attachment.required ? " *" : ""}</span><span>{attachment.status}</span></div>)}</div>{missingAttachments.length > 0 && <p className="mt-2 text-xs font-semibold text-[#a14f3f]">Zorunlu ekler hazır olmadan onaylı/imzalı çıktı kapalıdır.</p>}</div><div className="rounded-2xl border-2 border-[#d98b7c] bg-[#fff8f6] p-4"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#b44b3b]" /><div><p className="font-serif text-lg font-semibold text-[#7f3026]">Sözleşmeyi kaydetmeden önce kontrol edin</p><p className="mt-1 text-xs leading-5 text-[#8c5148]">Sözleşmenin ilgili maddelerini ve eklerini doldurduysanız aşağıdaki işlemleri tek tek kontrol edip işaretleyin. Bu liste sözleşme metnine eklenmez; kim tarafından ve ne zaman tamamlandığı audit kaydında tutulur.</p></div></div><div className="mt-4 space-y-2">{(preparation.data?.checkDefinitions ?? []).map((check) => <label key={check.key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#f0d6d1] bg-white px-3 py-3"><Checkbox checked={Boolean(preparationChecks[check.key])} onCheckedChange={(value) => togglePreparation(check.key, value === true)} /><span className="text-sm leading-5 text-[#5e332d]">{check.label}</span></label>)}</div><div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0d6d1] pt-3 text-sm">{preparationComplete ? <span className="flex items-center gap-2 font-semibold text-[#2f765a]"><CheckCircle2 className="h-4 w-4" /> Tüm kontroller tamamlandı</span> : <span className="font-semibold text-[#b44b3b]">Eksik kontrol var; kayıt düğmesi etkinleşmez.</span>}<Badge variant="outline" className="border-[#e3b4aa] text-[#8c5148]">{Object.values(preparationChecks).filter(Boolean).length}/{preparation.data?.checkDefinitions.length ?? 0}</Badge></div></div><div className="flex flex-wrap items-center gap-3"><Button onClick={saveDraft} disabled={createInstance.isPending || !contractId.trim() || missingFields.length > 0 || missingAttachments.length > 0 || !preparationComplete} className="rounded-xl bg-[#173e39] hover:bg-[#20554e]"><Save className="mr-2 h-4 w-4" /><span>{preparationComplete ? "Kontrol edildi — taslak formu kaydet" : "Önce kontrolleri tamamlayın"}</span></Button>{statusMessage && <p role="status" className="text-xs text-[#56635f]">{statusMessage}</p>}</div><div className="rounded-xl border border-[#dce8df] bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4b8878]">Çıktı önizleme — boş alanlar</p><div className="mt-3 space-y-2">{bundle.fields.map((field) => <div key={field.fieldKey} className="flex items-start justify-between gap-4 border-b border-[#edf0ec] py-2 text-xs"><span className="text-[#56635f]">{field.label}</span><span className="max-w-[55%] text-right text-[#34433f]">{fieldValueForInput(fieldValues[field.fieldKey]) || ""}</span></div>)}</div></div>{preview?.clauses?.length ? <div className="rounded-xl border border-[#dce8df] bg-[#f8fbf8] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4b8878]">Madde ve hükümler</p><div className="mt-3 space-y-3">{preview.clauses.map((clause, index) => <article key={clause.id} className="rounded-xl border border-[#dce8df] bg-white p-3"><div className="flex items-start gap-2"><span className="shrink-0 text-xs font-bold text-[#173e39]">{clause.articleNumber ? `Madde ${clause.articleNumber}` : `Madde ${index + 1}`}</span><h4 className="text-sm font-semibold text-[#34433f]">{clause.title}</h4></div><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-[#56635f]">{resolveContractFormPlaceholders(clause.bodyTemplate, fieldValues)}</p>{clause.requesterFootnote && <p className="mt-2 text-[11px] italic text-[#8b6b3b]">{clause.requesterFootnote}</p>}</article>)}</div></div> : null}</CardContent></Card>
  {hasPrintableDocument && <Card className="authority-print-shell mt-6 overflow-hidden rounded-2xl border-[#d9e2dc] bg-[#eef3ef]"><CardHeader className="print:hidden"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="font-serif text-xl">Yazdırma önizlemesi</CardTitle><p className="text-xs text-[#87938f]">Aşağıdaki A4 belge, üstteki alanlarla birlikte canlı güncellenir. Sayfa düzeni bozulursa punto küçültülerek yarım/boş sayfa kalması önlenebilir.</p></div><div className="flex items-center gap-2"><label className="text-xs font-semibold text-[#56635f]">Punto</label><Select value={printFontSize} onValueChange={setPrintFontSize}><SelectTrigger className="w-[94px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="9">9 punto</SelectItem><SelectItem value="10">10 punto</SelectItem><SelectItem value="11">11 punto</SelectItem><SelectItem value="12">12 punto</SelectItem></SelectContent></Select><Button type="button" variant="outline" className="rounded-xl bg-white" onClick={() => setPrintPreviewOpen(true)}><Printer className="mr-2 h-4 w-4" /> A4 yazdırma önizlemesi</Button></div></div></CardHeader><CardContent className="p-0 print:p-0">{printDocument}</CardContent></Card>}
  {hasPrintableDocument && <DocumentPrintPreview open={printPreviewOpen} onOpenChange={setPrintPreviewOpen} title={printTitle} subtitle="Belge sistem yazdırma penceresine gönderilmeden önce burada gerçek A4 oranında incelenir." onPrint={printFromPreview} fileName={`${printFileNamePrefix}-${contractId.trim() || "taslak"}`}>{printDocument}</DocumentPrintPreview>}
  </>;
}

export default ContractFormFiller;
