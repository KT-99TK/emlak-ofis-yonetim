import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { getMissingRequiredContractFormFields, isTechnicalContractFormField } from "@/../../shared/contractForms";

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
};

type FillerPreview = {
  clauses: Array<{ id: number; title: string; bodyTemplate: string; articleNumber?: number | null; requesterFootnote?: string }>;
};

function fieldValueForInput(value: unknown) {
  return value == null ? "" : String(value);
}

export function ContractFormFiller({ bundle, preview }: { bundle: FillerBundle; preview?: FillerPreview | null }) {
  const [contractId, setContractId] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const draftKey = `form-${bundle.template.id}`;
  const missingFields = useMemo(
    () => getMissingRequiredContractFormFields(bundle.fields.map((field) => ({ ...field, required: field.required ?? undefined })), fieldValues),
    [bundle.fields, fieldValues],
  );
  const createInstance = trpc.contracts.formTemplates.createInstance.useMutation({
    onSuccess: () => setStatusMessage("Taslak form kaydedildi. Gerçek müşteri/taşınmaz kaydı değiştirilmedi."),
    onError: (error) => setStatusMessage(error.message),
  });

  const updateValue = (fieldKey: string, value: unknown) => {
    setFieldValues((current) => ({ ...current, [fieldKey]: value }));
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
    return <div className={shell}>{label}<Input type={field.fieldType === "date" ? "date" : field.fieldType === "number" || field.fieldType === "currency" ? "number" : "text"} value={fieldValueForInput(value)} onChange={(event) => updateValue(field.fieldKey, event.target.value)} placeholder="Bu alanı proje mutabakatına göre doldurun" className="bg-white" /></div>;
  };

  const saveDraft = () => {
    const parsedContractId = Number(contractId);
    if (!Number.isSafeInteger(parsedContractId) || parsedContractId <= 0) {
      setStatusMessage("Taslağı kaydetmek için mevcut bir sözleşme kaydının ID numarasını girin.");
      return;
    }
    createInstance.mutate({
      contractId: parsedContractId,
      templateId: bundle.template.id,
      fieldValues,
      selectedClauseIds: (preview?.clauses ?? []).map((clause) => clause.id),
      status: "draft",
      preparationDraftKey: draftKey,
    });
  };

  return <Card className="mt-6 rounded-2xl border-[#c9dcd3] bg-[#fbfdfb]"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="font-serif text-xl">{bundle.template.title} — doldurma ekranı</CardTitle><p className="mt-1 text-xs text-[#70807c]">Bu ekran mevcut alanları doldurup önizlemek içindir. Kişisel veya müşteri kaydı oluşturmadan önce mevcut sözleşme ID’si gerekir.</p></div><Badge variant="outline" className="border-[#b8d4c7] text-[#4b8878]">{bundle.template.formType === "land_share" ? "Kat Karşılığı" : "Alım-Satım"}</Badge></div></CardHeader><CardContent className="space-y-5"><div className="rounded-xl border border-[#e8e2d7] bg-[#fffdf8] p-4"><label className="text-xs font-semibold text-[#56635f]">Mevcut sözleşme ID’si</label><Input value={contractId} onChange={(event) => setContractId(event.target.value.replace(/[^0-9]/g, ""))} placeholder="Örn. 123" inputMode="numeric" className="mt-1.5 max-w-xs bg-white" /><p className="mt-1 text-[11px] text-[#87938f]">Yeni müşteri veya sahte kayıt oluşturulmaz; yalnızca sistemdeki gerçek sözleşme kaydı kullanılabilir.</p></div><div className="grid gap-3 lg:grid-cols-2">{bundle.fields.map(renderField)}</div>{missingFields.length > 0 ? <div className="flex items-start gap-3 rounded-xl border-2 border-[#cf6b5d] bg-[#fff1ee] p-4 text-sm text-[#8e382d]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><div><strong>Eksik zorunlu alanlar</strong><p className="mt-1">{missingFields.map((field) => field.label).join(", ")}</p><p className="mt-1 text-xs">Bu alanlar doldurulmadan onaylı veya imzalı duruma geçirilemez.</p></div></div> : <div className="flex items-center gap-2 rounded-xl border border-[#b8d4c7] bg-[#f1faf4] p-4 text-sm font-semibold text-[#287052]"><CheckCircle2 className="h-4 w-4" />Zorunlu alanlar tamamlandı.</div>}<div className="flex flex-wrap items-center gap-3"><Button onClick={saveDraft} disabled={createInstance.isPending || !contractId.trim()} className="rounded-xl bg-[#173e39] hover:bg-[#20554e]"><Save className="mr-2 h-4 w-4" />Taslak formu kaydet</Button>{statusMessage && <p role="status" className="text-xs text-[#56635f]">{statusMessage}</p>}</div><div className="rounded-xl border border-[#dce8df] bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4b8878]">Çıktı önizleme — boş alanlar</p><div className="mt-3 space-y-2">{bundle.fields.map((field) => <div key={field.fieldKey} className="flex items-start justify-between gap-4 border-b border-[#edf0ec] py-2 text-xs"><span className="text-[#56635f]">{field.label}</span><span className="max-w-[55%] text-right text-[#34433f]">{fieldValueForInput(fieldValues[field.fieldKey]) || ""}</span></div>)}</div></div></CardContent></Card>;
}

export default ContractFormFiller;
