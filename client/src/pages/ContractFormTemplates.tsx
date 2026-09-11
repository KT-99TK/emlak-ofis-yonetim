import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, FileText, Paperclip, Plus, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const typeLabels = { sale_closing: "Alım-Satım Ön Protokolü", land_share: "Kat Karşılığı" } as const;
const partyLabels = { shared: "Ortak", seller: "Satıcı", buyer: "Alıcı", landowner: "Arsa sahibi", contractor: "Yüklenici" } as const;
const attachmentStatusLabels = { missing: "Eksik", draft: "Taslak", ready: "Hazır", archived: "Arşiv" } as const;

export default function ContractFormTemplates() {
  const { user } = useAuth();
  const canManageTemplates = user?.role === "admin";
  const utils = trpc.useUtils();
  const templates = trpc.contracts.formTemplates.list.useQuery({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const preview = trpc.contracts.formTemplates.preview.useQuery(
    { templateId: selectedId ?? 0 },
    { enabled: selectedId !== null },
  );
  const bundle = trpc.contracts.formTemplates.get.useQuery(
    { templateId: selectedId ?? 0 },
    { enabled: selectedId !== null },
  );
  const [formType, setFormType] = useState<"sale_closing" | "land_share">("sale_closing");
  const [title, setTitle] = useState("");
  const [partyScope, setPartyScope] = useState<keyof typeof partyLabels>("shared");
  const [clauseTitle, setClauseTitle] = useState("");
  const [clauseBody, setClauseBody] = useState("");
  const [requesterDisplayName, setRequesterDisplayName] = useState("");
  const [includeRequesterFootnote, setIncludeRequesterFootnote] = useState(true);
  const [preparationDraftKey] = useState(() => `sale-prep-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`);
  const preparation = trpc.contracts.formTemplates.preparationChecks.useQuery({ draftKey: preparationDraftKey, formType: "sale_closing" });
  const [preparationChecks, setPreparationChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (preparation.data?.checks) setPreparationChecks(preparation.data.checks);
  }, [preparation.data?.checks]);

  const savePreparation = trpc.contracts.formTemplates.savePreparationChecks.useMutation({
    onSuccess: (saved) => setPreparationChecks(saved.checks),
  });

  const togglePreparation = (key: string, checked: boolean) => {
    const next = { ...preparationChecks, [key]: checked };
    setPreparationChecks(next);
    savePreparation.mutate({ draftKey: preparationDraftKey, formType: "sale_closing", checks: next });
  };

  const preparationComplete = Boolean(preparation.data?.completed || Object.values(preparationChecks).length > 0 && Object.values(preparationChecks).every(Boolean));

  const createTemplate = trpc.contracts.formTemplates.create.useMutation({
    onSuccess: (created) => {
      setTitle("");
      void templates.refetch();
      if (created?.template.id) setSelectedId(created.template.id);
    },
  });
  const setTemplateStatus = trpc.contracts.formTemplates.setStatus.useMutation({
    onSuccess: () => { void templates.refetch(); if (selectedId) void utils.contracts.formTemplates.get.invalidate({ templateId: selectedId }); },
  });
  const setClauseStatus = trpc.contracts.formTemplates.setClauseStatus.useMutation({
    onSuccess: () => { if (selectedId) void utils.contracts.formTemplates.get.invalidate({ templateId: selectedId }); },
  });
  const addClause = trpc.contracts.formTemplates.addClause.useMutation({
    onSuccess: () => {
      setClauseTitle("");
      setClauseBody("");
      setRequesterDisplayName("");
      setIncludeRequesterFootnote(true);
      if (selectedId) void utils.contracts.formTemplates.get.invalidate({ templateId: selectedId });
    },
  });

  const submitTemplate = () => {
    if (title.trim().length < 3) return;
    createTemplate.mutate({ formType, title: title.trim(), legalReviewNote: "Metinler kullanıcı tarafından sağlanacak; yayın öncesi hukuki kontrol gerektirir." });
  };
  const submitClause = () => {
    if (!selectedId || clauseTitle.trim().length < 1 || clauseBody.trim().length < 1) return;
    addClause.mutate({ templateId: selectedId, partyScope, title: clauseTitle.trim(), bodyTemplate: clauseBody.trim(), status: "draft", requesterDisplayName: requesterDisplayName.trim() || undefined, includeRequesterFootnote });
  };

  return <div className="min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9">
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]">Sözleşme form altyapısı</p><h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Alım-Satım Ön Protokolü ve Kat Karşılığı Formları</h1><p className="mt-2 max-w-3xl text-sm text-[#70807c]">Genel sözleşme, teknik şartname ve tarafların isteğe bağlı ek maddeleri için taslak şablonları yönetin. Hukuki metinler kullanıcı tarafından sağlanana kadar bu ekran yalnız altyapı ve taslak kayıtlarını tutar.</p></div>
      <Button variant="outline" className="rounded-xl bg-white" onClick={() => void templates.refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Yenile</Button>
    </header>
    <div className="grid gap-6 xl:grid-cols-[minmax(300px,.8fr)_minmax(0,1.2fr)]">
      {canManageTemplates && <Card className="rounded-2xl border-[#e5e8e3] bg-white/80"><CardHeader><CardTitle className="font-serif text-xl">Yeni taslak şablon</CardTitle></CardHeader><CardContent className="space-y-4">
        <div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Form türü</label><Select value={formType} onValueChange={(value) => setFormType(value as typeof formType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sale_closing">Alım-Satım Ön Protokolü</SelectItem><SelectItem value="land_share">Kat Karşılığı</SelectItem></SelectContent></Select></div>
        <div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Şablon başlığı</label><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Örn. Alım-Satım Ön Protokolü v1" /></div>
        <Button className="w-full rounded-xl bg-[#173e39] hover:bg-[#20554e]" disabled={title.trim().length < 3 || createTemplate.isPending || !preparationComplete} onClick={submitTemplate}><Plus className="mr-2 h-4 w-4" /> Taslak şablon oluştur</Button>
        {createTemplate.error && <p role="alert" className="text-xs text-[#a85745]">{createTemplate.error.message}</p>}
      </CardContent></Card>}
      <Card className="rounded-2xl border-[#e5e8e3] bg-white/80"><CardHeader><CardTitle className="font-serif text-xl">Kayıtlı şablonlar</CardTitle></CardHeader><CardContent className="space-y-2">{templates.isLoading ? <p className="py-8 text-center text-sm text-[#87938f]">Şablonlar yükleniyor…</p> : !templates.data?.length ? <div className="rounded-xl bg-[#f7f7f4] px-4 py-10 text-center text-sm text-[#87938f]"><FileText className="mx-auto mb-3 h-6 w-6 text-[#bd975d]" />Henüz taslak şablon yok.</div> : templates.data.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${selectedId === item.id ? "border-[#7fae9d] bg-[#f0f7f3]" : "border-[#edf0ec] bg-white"}`}><FileText className="h-5 w-5 text-[#4b8878]" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-[#34433f]">{item.title}</span><span className="mt-1 block text-xs text-[#87938f]">{typeLabels[item.formType]} · v{item.version}</span></span><Badge variant="outline">{item.status === "draft" ? "Taslak" : item.status}</Badge></button>)}</CardContent></Card>
    </div>
    <Card className="mt-6 rounded-2xl border-2 border-[#d98b7c] bg-[#fff8f6] shadow-sm"><CardHeader><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#b44b3b]" /><div><CardTitle className="font-serif text-xl text-[#7f3026]">Protokolü hazırlamadan önce kontrol edin</CardTitle><p className="mt-1 text-sm text-[#8c5148]">Aşağıdaki işlemler tamamlanmadan protokol kaydı ve çıktı alınmamalıdır. Bu liste sözleşme metnine eklenmez; danışman kontrolü olarak audit kaydında tutulur.</p></div></div></CardHeader><CardContent className="space-y-3"><div className="space-y-2">{(preparation.data?.checkDefinitions ?? []).map((check) => <label key={check.key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#f0d6d1] bg-white px-3 py-3"><Checkbox checked={Boolean(preparationChecks[check.key])} onCheckedChange={(value) => togglePreparation(check.key, value === true)} /><span className="text-sm leading-5 text-[#5e332d]">{check.label}</span></label>)}</div><div className="flex items-center justify-between gap-3 border-t border-[#f0d6d1] pt-3 text-sm">{preparationComplete ? <span className="flex items-center gap-2 font-semibold text-[#2f765a]"><CheckCircle2 className="h-4 w-4" /> Tüm ön kontroller tamamlandı</span> : <span className="font-semibold text-[#b44b3b]">Tüm kutular işaretlenmeden kayıt/çıktı kapalıdır</span>}<Badge variant="outline" className="border-[#e3b4aa] text-[#8c5148]">{Object.values(preparationChecks).filter(Boolean).length}/{preparation.data?.checkDefinitions.length ?? 0}</Badge></div></CardContent></Card>
    {selectedId !== null && <Card className="mt-6 rounded-2xl border-[#e5e8e3] bg-white/80"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="font-serif text-xl">{bundle.data?.template.title ?? "Şablon ayrıntıları"}</CardTitle><p className="text-xs text-[#87938f]">Bölümler ve alanlar örnek metin gelmeden boş tutulur. Ek maddeler yayınlanmadan önce manager kontrolünde kalır.</p><p className="mt-2 text-xs font-semibold text-[#4b8878]">Çıktıya aday aktif ek madde: {preview.data?.clauses.length ?? 0}</p></div><div className="flex gap-2">{canManageTemplates && bundle.data?.template.status === "draft" && <Button size="sm" variant="outline" onClick={() => setTemplateStatus.mutate({ templateId: selectedId, status: "review" })}>İncelemeye al</Button>}{canManageTemplates && bundle.data?.template.status === "review" && <Button size="sm" variant="outline" onClick={() => setTemplateStatus.mutate({ templateId: selectedId, status: "published" })}>Yayınla</Button>}{canManageTemplates && bundle.data?.template.status === "published" && <Button size="sm" variant="outline" onClick={() => setTemplateStatus.mutate({ templateId: selectedId, status: "archived" })}>Arşivle</Button>}</div></div></CardHeader><CardContent className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <div className="space-y-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a17b43]">Bölümler</p>{(bundle.data?.sections ?? []).length ? bundle.data?.sections.map((section) => <div key={section.id} className="rounded-xl border border-[#edf0ec] p-3"><p className="text-sm font-semibold text-[#34433f]">{section.title}</p><p className="mt-1 text-xs text-[#87938f]">{section.sectionType} · sıra {section.sortOrder}</p></div>) : <p className="rounded-xl bg-[#f7f7f4] p-4 text-sm text-[#87938f]">Genel sözleşme ve teknik şartname bölümleri metinler geldiğinde eklenecek.</p>}<div className="mt-4 rounded-xl border border-[#e8e2d7] bg-[#fffdf8] p-3"><div className="flex items-center gap-2"><Paperclip className="h-4 w-4 text-[#a17b43]" /><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a17b43]">Ek belgeler</p></div><p className="mt-1 text-[11px] text-[#87938f]">Ekler genel sözleşmeden ayrı metadata olarak izlenir. Zorunlu ekler hazır olmadan Kat Karşılığı şablonu yayınlanamaz.</p><div className="mt-3 space-y-2">{(bundle.data?.attachments ?? []).length ? bundle.data?.attachments.map((attachment) => <div key={attachment.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#eee8dd] bg-white px-3 py-2"><span className="min-w-0 text-xs text-[#34433f]">{attachment.title}{attachment.required ? <strong className="ml-1 text-[#a14f3f]">*</strong> : null}</span><Badge variant="outline" className={attachment.status === "ready" ? "border-[#9bc3aa] text-[#287052]" : attachment.required ? "border-[#e3b4aa] text-[#a14f3f]" : "text-[#87938f]"}>{attachmentStatusLabels[attachment.status as keyof typeof attachmentStatusLabels] ?? attachment.status}</Badge></div>) : <p className="rounded-lg bg-white px-3 py-2 text-xs text-[#87938f]">Bu şablon için ayrı ek metadata kaydı yok.</p>}</div></div><p className="pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#a17b43]">Doldurulabilir alanlar ({bundle.data?.fields.length ?? 0})</p><div className="space-y-2">{(bundle.data?.fields ?? []).map((field) => <div key={field.id} className="flex items-center justify-between gap-3 rounded-lg bg-[#f7f7f4] px-3 py-2"><span className="text-xs text-[#34433f]">{field.label}</span><span className="text-[10px] text-[#87938f]">{field.partyScope}{field.required ? " · zorunlu" : ""}</span></div>)}</div></div>
      <div className="space-y-4"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a17b43]">İsteğe bağlı ek madde ekle</p><p className="mt-1 text-xs text-[#87938f]">Satıcı, alıcı, arsa sahibi veya yüklenici özel maddesi taslak olarak kaydedilir; aktif edilmeden çıktıya girmez.</p></div><Select value={partyScope} onValueChange={(value) => setPartyScope(value as typeof partyScope)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(partyLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><Input value={clauseTitle} onChange={(event) => setClauseTitle(event.target.value)} placeholder="Ek madde başlığı" /><Input value={requesterDisplayName} onChange={(event) => setRequesterDisplayName(event.target.value)} placeholder="Talep sahibi görünen adı/unvanı (örn. Mustafa Bey)" /><label className="flex items-start gap-2 rounded-lg border border-[#edf0ec] bg-[#f7f7f4] px-3 py-2 text-xs text-[#56635f]"><Checkbox checked={includeRequesterFootnote} onCheckedChange={(value) => setIncludeRequesterFootnote(value === true)} /><span>Çıktıda “Bu madde, {partyLabels[partyScope]} {requesterDisplayName.trim() || "[ad/unvan]"} talebi üzerine protokole eklenmiştir.” dipnotunu göster</span></label><Textarea value={clauseBody} onChange={(event) => setClauseBody(event.target.value)} placeholder="Örnek sözleşme metni geldiğinde bu alana girilecek madde metni" className="min-h-32" /><Button className="rounded-xl bg-[#173e39] hover:bg-[#20554e]" disabled={!canManageTemplates || !clauseTitle.trim() || !clauseBody.trim() || addClause.isPending} onClick={submitClause}><Plus className="mr-2 h-4 w-4" /> Taslak ek madde kaydet</Button>{addClause.error && <p role="alert" className="text-xs text-[#a85745]">{addClause.error.message}</p>}<div className="space-y-2 pt-3">{(bundle.data?.clauses ?? []).map((clause) => <div key={clause.id} className="rounded-xl border border-[#edf0ec] p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[#34433f]">{clause.title}</p><div className="flex items-center gap-2"><Badge variant="outline">{partyLabels[clause.partyScope]} · {clause.status === "draft" ? "Taslak" : clause.status}</Badge>{canManageTemplates && clause.status === "draft" && <Button size="sm" variant="outline" onClick={() => setClauseStatus.mutate({ clauseId: clause.id, status: "active" })}>Yayınla</Button>}{canManageTemplates && clause.status === "active" && <Button size="sm" variant="outline" onClick={() => setClauseStatus.mutate({ clauseId: clause.id, status: "archived" })}>Arşivle</Button>}</div></div><p className="mt-2 whitespace-pre-wrap text-xs text-[#70807c]">{clause.bodyTemplate}</p>{clause.requesterDisplayName && clause.includeRequesterFootnote !== 0 && <p className="mt-2 text-[11px] italic text-[#8c5148]">{`(Bu madde, ${partyLabels[clause.partyScope as keyof typeof partyLabels] ?? "Tarafların"} ${clause.requesterDisplayName} talebi üzerine protokole eklenmiştir.)`}</p>}</div>)}</div><div className="mt-5 rounded-xl border border-[#dce8df] bg-[#f8fbf8] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4b8878]">Çıktı önizleme adayı</p>{preview.data?.articleNumbering && <p className="mt-2 text-xs text-[#70807c]">İsteğe bağlı maddeler <strong>Madde {preview.data.articleNumbering.firstOptionalArticleNumber}</strong> itibarıyla sıralanır; yetkili mahkeme başlığı <strong>Madde {preview.data.articleNumbering.jurisdictionArticleNumber}</strong> olarak ilerler ({preview.data.articleNumbering.jurisdictionArticleTitle}).</p>}{preview.data?.clauses.length ? <div className="mt-3 space-y-2">{preview.data.clauses.map((clause) => <div key={clause.id} className="rounded-lg bg-white p-3"><p className="text-sm font-semibold text-[#34433f]">{clause.articleNumber ? `Madde ${clause.articleNumber} — ` : ""}{clause.title}</p><p className="mt-1 whitespace-pre-wrap text-xs text-[#70807c]">{clause.bodyTemplate}</p>{clause.requesterFootnote && <p className="mt-2 text-[11px] italic text-[#8c5148]">{clause.requesterFootnote}</p>}</div>)}</div> : <p className="mt-2 text-xs text-[#70807c]">Yayınlanmış ek madde bulunmuyor; taslak maddeler çıktıya alınmaz.</p>}</div></div>
    </CardContent></Card>}
  </div>;
}
