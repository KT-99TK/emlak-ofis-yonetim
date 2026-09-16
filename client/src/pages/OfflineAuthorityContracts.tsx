import { CSSProperties, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileSignature, Printer, Save, WifiOff } from "lucide-react";
import AuthorityContractDocument from "@/components/AuthorityContractDocument";
import OfflineOfficeFlowPanel from "@/components/OfflineOfficeFlowPanel";
import DocumentPrintPreview from "@/components/DocumentPrintPreview";
import TurkishDateInput from "@/components/TurkishDateInput";
import UrlaLocationField from "@/components/UrlaLocationField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  authorityContractTitle,
  calculateAuthoritySummary,
  consultantInitials,
  createOfflineAuthoritySnapshot,
  emptyAuthorityDetails,
  formatAuthorityCurrency,
  formatWholeCurrencyInput,
  nextAuthorityContractNo,
  normalizeAuthorityDetails,
  type AuthorityContractDetails,
} from "@/lib/authorityContract";
import { filterOfflineAuthorityDrafts, listOfflineAuthorityDrafts } from "@/lib/authorityDrafts";
import { canEditOfflineContractEids, canViewFullOfflineContract, getOfflineAccessRole, getOfflineAssistantAssignedUserIds } from "@/lib/offlineContractAccess";
import { isLocalManagerSessionActive } from "@/lib/offlineManagerAccess";
import { decodeOfflineClientDetails } from "@/lib/offlineClientDetails";
import { getUserId, listOfflineRecords, recordOfflineAudit, saveOfflineRecord, updateOfflineRecord, type OfflineRecord } from "@/lib/offlineStore";

const ownerIdentityFields: Array<[keyof AuthorityContractDetails, string]> = [
  ["ownerName", "Malik adı / unvanı"], ["ownerIdentity", "TCKN / VKN"],
];

const ownerContactFields: Array<[keyof AuthorityContractDetails, string]> = [
  ["ownerPhone", "Malik telefonu"], ["ownerAddress", "Malik adresi"],
];

const detailsFields: Array<[keyof AuthorityContractDetails, string]> = [
  ["propertyAddress", "Taşınmaz açık adresi"], ["parcelInfo", "Ada / parsel / bağımsız bölüm"], ["propertyType", "Niteliği / cinsi"], ["grossM2", "Brüt / net m²"],
  ["roomCount", "Oda sayısı"], ["floorAndView", "Kat / cephe / manzara"], ["condition", "Bina yaşı / kullanım durumu"], ["price", "Sözleşmeye esas bedel"], ["contractDate", "Sözleşme tarihi"],
];

const requiredLabels: Partial<Record<keyof AuthorityContractDetails, string>> = {
  ownerName: "Malik adı / unvanı", ownerIdentity: "TCKN / VKN", ownerPhone: "Malik telefonu", ownerAddress: "Malik adresi", propertyAddress: "Taşınmaz açık adresi", propertyType: "Taşınmaz niteliği", price: "Sözleşmeye esas bedel", contractDate: "Sözleşme tarihi", consultantName: "Danışman adı", consultantPhone: "Danışman telefonu", consultantCode: "Danışman kodu", officeName: "Ofis unvanı", officeAuthorizationNo: "Ofis yetki belgesi no", officePhone: "Ofis telefonu", officeAddress: "Ofis adresi",
};

const DEFAULT_OFFICE_DETAILS: Pick<AuthorityContractDetails, "officeName" | "officeAuthorizationNo" | "officePhone" | "officeAddress"> = {
  officeName: "Global 1881 Gayrimenkul",
  officeAuthorizationNo: "3500211",
  officePhone: "+90 534 975 05 82",
  officeAddress: "HACI İSA MAHALLESİ 75. YIL CUMHURİYET CADDESİ NO:5/38 URLA",
};

const DEFAULT_CONSULTANTS: Record<string, Partial<Pick<AuthorityContractDetails, "consultantName" | "consultantCode" | "consultantPhone" | "consultantTitle">>> = {
  "K-TASLIARMUT": { consultantName: "KAZIM TAŞLIARMUT", consultantCode: "3500211/001", consultantPhone: "+90 541 935 29 59", consultantTitle: "SORUMLU EMLAK DANIŞMANI" },
  "I-PARIN": { consultantName: "İBRAHİM PARİN", consultantCode: "3500211/002", consultantTitle: "SORUMLU EMLAK DANIŞMANI" },
  "C-TERCAN": { consultantName: "CAHİT TERCAN", consultantCode: "3500211/003", consultantPhone: "+90 503 304 21 55", consultantTitle: "SORUMLU EMLAK DANIŞMANI" },
};

function defaultAuthorityDetails(userId: string) {
  return normalizeAuthorityDetails({ ...emptyAuthorityDetails(), ...DEFAULT_OFFICE_DETAILS, ...(DEFAULT_CONSULTANTS[userId.trim().toUpperCase()] ?? {}) });
}

type AuthoritySnapshot = Partial<AuthorityContractDetails> & { schema?: string; contractNo?: string };
type SaveVisualState = "idle" | "invalid" | "saved";

function existingAuthorityNumbers(records: OfflineRecord[]) {
  return records.flatMap((record) => {
    if (record.entity !== "contract") return [];
    try {
      const snapshot = JSON.parse(record.details) as AuthoritySnapshot;
      return snapshot.schema === "global1881-offline-authority-v1" || snapshot.schema === "global1881-offline-authority-v2" ? [snapshot.contractNo ?? ""] : [];
    } catch { return []; }
  });
}

export default function OfflineAuthorityContracts() {
  const userId = getUserId();
  const [records, setRecords] = useState<OfflineRecord[]>([]);
  const [details, setDetails] = useState<AuthorityContractDetails>(() => defaultAuthorityDetails(userId));
  const [clientRecordId, setClientRecordId] = useState("");
  const [propertyRecordId, setPropertyRecordId] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [sourceAuthorityContractRecordId, setSourceAuthorityContractRecordId] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [fontSize, setFontSize] = useState("11");
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [saveVisualState, setSaveVisualState] = useState<SaveVisualState>("idle");
  const [message, setMessage] = useState("");
  const contractAccess = { userId, role: getOfflineAccessRole(), managerSessionActive: isLocalManagerSessionActive(), assistantAssignedUserIds: getOfflineAssistantAssignedUserIds() } as const;
  const canEnterSensitive =
    contractAccess.managerSessionActive || contractAccess.role === "consultant";
  const refresh = async () => setRecords(await listOfflineRecords());
  useEffect(() => { void refresh(); }, []);
  const openPrintPreview = () => setPrintPreviewOpen(true);
  const printFromPreview = () => { setPrintPreviewOpen(false); window.setTimeout(() => window.print(), 140); };

  const clientRecords = records.filter((record) => record.entity === "client" && canViewFullOfflineContract(record, contractAccess));
  const normalizePerson = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleUpperCase("tr-TR");
  const readPropertyDetail = (record: OfflineRecord, key: string) => {
    const legacy = record.details.match(new RegExp(`(?:^|\\|)\\s*${key}:\\s*([^|]+)`, "i"))?.[1]?.trim() ?? "";
    if (legacy) return legacy;
    try {
      const parsed = JSON.parse(record.details) as Record<string, unknown>;
      return String(parsed[key] ?? parsed[key.toLowerCase()] ?? "").trim();
    } catch { return ""; }
  };
  const propertyClientId = (record: OfflineRecord) => readPropertyDetail(record, "MÜŞTERİ_ID");
  const propertyOwnerName = (record: OfflineRecord) => readPropertyDetail(record, "MALİK");
  const propertyBelongsToVisibleClient = (record: OfflineRecord) => {
    if (contractAccess.role !== "consultant") return false;
    const clientId = propertyClientId(record);
    const ownerName = propertyOwnerName(record);
    return clientRecords.some((client) => client.id === clientId || normalizePerson(client.title) === normalizePerson(ownerName));
  };
  const propertyRecords = records.filter((record) => record.entity === "property" && (canViewFullOfflineContract(record, contractAccess) || propertyBelongsToVisibleClient(record)));
  const selectedPropertyRecords = useMemo(() => {
    const selectedClient = clientRecords.find((client) => client.id === clientRecordId);
    const scoped = clientRecordId ? propertyRecords.filter((record) => propertyClientId(record) === clientRecordId || normalizePerson(propertyOwnerName(record)) === normalizePerson(selectedClient?.title ?? "")) : propertyRecords;
    const visible = scoped.length ? scoped : propertyRecords;
    const search = normalizePerson(propertySearch);
    return search ? visible.filter((record) => normalizePerson(`${record.title} ${record.details} ${propertyOwnerName(record)}`).includes(search)) : visible;
  }, [clientRecordId, propertyRecords, propertySearch, clientRecords]);
  const authorityDrafts = useMemo(() => listOfflineAuthorityDrafts(records.filter((record) => record.entity !== "contract" || canViewFullOfflineContract(record, contractAccess))), [records, contractAccess]);
  const matchingAuthorityDrafts = useMemo(() => filterOfflineAuthorityDrafts(authorityDrafts, draftSearch), [authorityDrafts, draftSearch]);
  const contractNo = useMemo(() => nextAuthorityContractNo(existingAuthorityNumbers(records), details.consultantName, details.contractDate), [details.consultantName, details.contractDate, records]);
  const summary = useMemo(() => calculateAuthoritySummary(details), [details]);
  const missingKeys = useMemo(() => (Object.keys(requiredLabels) as Array<keyof AuthorityContractDetails>).filter((key) => (canEnterSensitive || !/(Identity|Phone)/.test(String(key))) && !String(details[key] ?? "").trim()), [canEnterSensitive, details]);
  const missingLabels = missingKeys.map((key) => requiredLabels[key]).filter(Boolean);

  const update = (key: keyof AuthorityContractDetails, value: string) => { const nextValue = key === "eidsAuthorizationNumber" ? value.replace(/\D/g, "") : value; setSaveVisualState("idle"); setDetails((current) => key === "mode" && nextValue === "rent" ? { ...current, mode: "rent", serviceFeeRate: "", serviceFeeAmount: "", vatCollection: "separate" } : ({ ...current, [key]: nextValue })); };
  const updateWholeAmount = (key: "price" | "serviceFeeAmount", value: string) => update(key, formatWholeCurrencyInput(value));
  const normalizeForm = () => setDetails((current) => normalizeAuthorityDetails(current));
  const fieldClass = (key: keyof AuthorityContractDetails) => saveAttempted && missingKeys.includes(key) ? "border-[#b34d43] bg-[#fff7f5] focus-visible:ring-[#b34d43]" : "";
  const renderDetailsField = ([key, label]: [keyof AuthorityContractDetails, string]) => <div key={key} className={key === "ownerAddress" || key === "propertyAddress" ? "sm:col-span-2" : ""}><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">{label}{requiredLabels[key] && <span className="text-[#a85745]"> *</span>}</label>{key === "contractDate" ? <TurkishDateInput className={fieldClass(key)} aria-invalid={saveAttempted && missingKeys.includes(key)} value={details.contractDate} onValueChange={(value) => update("contractDate", value)} /> : <Input className={fieldClass(key)} aria-invalid={saveAttempted && missingKeys.includes(key)} inputMode={key === "price" ? "numeric" : undefined} type="text" value={details[key] as string} onChange={(event) => key === "price" ? updateWholeAmount("price", event.target.value) : update(key, event.target.value)} onBlur={normalizeForm} />}</div>;

  const chooseClient = (id: string) => { setSaveVisualState("idle"); setClientRecordId(id); const record = clientRecords.find((item) => item.id === id); if (record) { const clientDetails = decodeOfflineClientDetails(record.details); setDetails((current) => normalizeAuthorityDetails({ ...current, ownerName: record.title, ownerAddress: clientDetails.address || current.ownerAddress, ownerPhone: clientDetails.phone || current.ownerPhone, ownerIdentity: clientDetails.identity || current.ownerIdentity })); } };
  const chooseProperty = (id: string) => { setSaveVisualState("idle"); setPropertyRecordId(id); const record = propertyRecords.find((item) => item.id === id); if (record) { const owner = clientRecords.find((client) => client.id === propertyClientId(record) || normalizePerson(client.title) === normalizePerson(propertyOwnerName(record))); if (owner) setClientRecordId(owner.id); setDetails((current) => normalizeAuthorityDetails({ ...current, ownerName: owner?.title || current.ownerName, propertyAddress: record.details ? `${record.title} · ${record.details}` : record.title })); } };
  const copyPreviousDraft = (recordId: string) => { setSourceAuthorityContractRecordId(recordId); const source = authorityDrafts.find((draft) => draft.recordId === recordId); if (!source) return; setClientRecordId(source.sourceClientRecordId ?? ""); setPropertyRecordId(source.sourcePropertyRecordId ?? ""); setDetails(normalizeAuthorityDetails({ ...source.details, contractDate: new Date().toISOString().slice(0, 10) })); setSaveAttempted(false); setSaveVisualState("idle"); setMessage(`${source.contractNo} numaralı önceki taslak yeni sözleşmeye kopyalandı. Yeni kayıt numarası ve bugünün tarihi otomatik atanacaktır; kaydetmeden önce alanları kontrol edin.`); };

  const saveDraft = async () => {
    setSaveAttempted(true);
    const base = normalizeAuthorityDetails(details.mode === "rent" ? { ...details, serviceFeeRate: "", serviceFeeAmount: "", vatCollection: "separate" } : details);
    const eidsAuthorizationNumber = base.eidsAuthorizationNumber.replace(/\D/g, "");
    const normalized = { ...base, eidsAuthorizationNumber, eidsAuthorizedAt: eidsAuthorizationNumber ? base.eidsAuthorizedAt || new Date().toISOString() : "", eidsAuthorizedBy: eidsAuthorizationNumber ? base.eidsAuthorizedBy || userId : "" };
    if (!userId.trim()) { setSaveVisualState("invalid"); setMessage("Önce Yerel Çalışma Alanı ekranından offline kullanıcı kodunu kaydedin."); return; }
    if (missingKeys.length) { setSaveVisualState("invalid"); setMessage(`Kayıt için şu zorunlu alanları tamamlayın: ${missingLabels.join(", ")}. Kırmızı çerçeveli kutucuklar eksiktir.`); return; }
    const finalNumber = nextAuthorityContractNo(existingAuthorityNumbers(records), normalized.consultantName, normalized.contractDate);
    await saveOfflineRecord({ entity: "contract", title: `${finalNumber} — ${authorityContractTitle(normalized.mode)} — ${normalized.ownerName}`, details: JSON.stringify(createOfflineAuthoritySnapshot(normalized, finalNumber, clientRecordId || undefined, propertyRecordId || undefined, sourceAuthorityContractRecordId || undefined)), amount: normalized.price || undefined, status: "draft" });
    setDetails(normalized); setSaveAttempted(false); setSaveVisualState("saved"); setMessage(normalized.mode === "sale" ? `${finalNumber} numaralı satış yetki sözleşmesi taslağı kaydedildi. Danışman, bedel, koşul şablonu ve hizmet bedeli verileri şifreli yedek/merge ile performans tablosuna aktarılacaktır.` : `${finalNumber} numaralı kiralama yetki sözleşmesi taslağı kaydedildi. Malik için hizmet bedeli tahakkuku oluşturulmadı; kiracı hizmet bedeli yalnız kira sözleşmesinden sonra back-office işlem dosyasında oluşur.`); await refresh();
  };

  const updateEidsOnSelectedAuthority = async () => {
    const target = records.find((record) => record.id === sourceAuthorityContractRecordId);
    const eidsAuthorizationNumber = details.eidsAuthorizationNumber.replace(/\D/g, "");
    if (!userId.trim()) { setSaveVisualState("invalid"); setMessage("Önce Yerel Çalışma Alanı ekranından offline kullanıcı kodunu kaydedin."); return; }
    if (!target || target.entity !== "contract" || !canEditOfflineContractEids(target, contractAccess)) { setSaveVisualState("invalid"); setMessage("Önce üstteki listeden kendi yetki belgenizi çağırın; EİDS numarası yalnız kayıt sahibi danışman veya açık broker manager oturumunda işlenebilir."); return; }
    try {
      const snapshot = JSON.parse(target.details) as AuthoritySnapshot;
      if (snapshot.schema !== "global1881-offline-authority-v1" && snapshot.schema !== "global1881-offline-authority-v2") throw new Error("Yetki sözleşmesi kaydı bulunamadı.");
      const updatedDetails = normalizeAuthorityDetails({ ...emptyAuthorityDetails(), ...snapshot, eidsAuthorizationNumber, eidsAuthorizedAt: eidsAuthorizationNumber ? new Date().toISOString() : "", eidsAuthorizedBy: eidsAuthorizationNumber ? userId : "" });
      await updateOfflineRecord(target, { details: JSON.stringify({ ...snapshot, ...updatedDetails }) });
      recordOfflineAudit("authority-eids-confirmed", { contractNo: snapshot.contractNo ?? target.title, recordId: target.id, completed: Boolean(eidsAuthorizationNumber), localOnly: true });
      setDetails(updatedDetails); setSaveVisualState("saved"); setMessage(eidsAuthorizationNumber ? `${snapshot.contractNo ?? "Yetki belgesi"} için EİDS yetki numarası kaydedildi. Tarih, kullanıcı ve numara şifreli yedekte korunur.` : `${snapshot.contractNo ?? "Yetki belgesi"} için EİDS yetki numarası temizlendi; işlem bekliyor durumuna döndü.`); await refresh();
    } catch {
      setSaveVisualState("invalid"); setMessage("EİDS yetki numarası kaydedilemedi. İlgili yetki belgesini yeniden çağırıp tekrar deneyin.");
    }
  };

  const saveButtonClass = saveVisualState === "saved"
    ? "bg-[#004225] text-white hover:bg-[#00371f] hover:text-white [&_svg]:text-white"
    : saveVisualState === "invalid"
      ? "bg-[#b34d43] text-white hover:bg-[#963b34] hover:text-white [&_svg]:text-white"
      : "border border-[#173e39] bg-transparent text-[#173e39] hover:bg-[#eaf2ed] hover:text-[#173e39]";

  return <div className="authority-contract-workspace min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9"><header className="mb-7 flex flex-wrap items-end justify-between gap-4 print:hidden"><div><p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]"><WifiOff className="h-3.5 w-3.5" /> Offline sözleşme çalışma alanı</p><h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Yetki Sözleşmeleri</h1><p className="mt-2 max-w-2xl text-sm text-[#70807c]">Önce bilgileri girin; tamamlanan A4 sözleşme belgesi formun hemen altında güncellenir.</p></div><Button onClick={openPrintPreview} variant="outline" className="rounded-xl bg-white"><Printer className="mr-2 h-4 w-4" /> A4 yazdırma önizlemesi</Button></header>
    <div className="mx-auto max-w-[1440px] space-y-6"><div className="offline-operation-grid print:block"><div className="offline-operation-main"><Card className="rounded-2xl border-[#e5e8e3] bg-white/85 print:hidden"><CardHeader><CardTitle className="font-serif text-xl">Doldurulabilir sözleşme bilgileri</CardTitle><p className="text-xs text-[#87938f]">Tutarlar kuruşsuz saklanır ve yazarken binlik ayırıcıyla görünür. Kaydetmeye çalıştığınızda eksik zorunlu alanlar kırmızı çerçeveyle belirtilir.</p></CardHeader><CardContent className="space-y-6">
      <section className="rounded-xl border border-[#eadfca] bg-[#fffaf0] p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d6f3f]">Otomatik takip kimliği</p><p className="mt-1 font-mono text-lg font-semibold text-[#173e39]">{contractNo}</p><p className="mt-1 text-xs text-[#6f7a75]">Danışman baş harfi: <strong>{consultantInitials(details.consultantName)}</strong>. Aynı danışmanın yıl içindeki sıra numarası, önceki yerel kayıtlar dikkate alınarak otomatik artar.</p></section>
      <div className="grid gap-3 sm:grid-cols-3"><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Belge türü</label><Select value={details.mode} onValueChange={(value) => update("mode", value as "sale" | "rent")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rent">Kiralama yetki sözleşmesi</SelectItem><SelectItem value="sale">Satış yetki sözleşmesi</SelectItem></SelectContent></Select></div><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Para birimi</label><Select value={details.currency} onValueChange={(value) => update("currency", value as AuthorityContractDetails["currency"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TRY">Türk lirası (TRY)</SelectItem><SelectItem value="USD">ABD doları (USD)</SelectItem><SelectItem value="EUR">Euro (EUR)</SelectItem></SelectContent></Select></div><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Yetki süresi (ay)</label><Input type="number" min="1" max="120" value={details.authorityDurationMonths} onChange={(event) => update("authorityDurationMonths", event.target.value)} /><p className="mt-1 text-[10px] text-[#718079]">Yeni sözleşmeler 3 ayla başlar; değiştirebilirsiniz.</p></div></div>
      <section className="rounded-xl border border-[#dbe5dd] bg-[#f8fbf8] p-4"><h2 className="text-sm font-semibold text-[#34433f]">Önceki yetki taslağını çağır</h2><p className="mt-1 text-xs text-[#6f7a75]">Belge türünü seçtikten sonra, sözleşme numarasını hatırlamıyorsanız müşteri adı–soyadıyla arayın. Seçim eski kaydı değiştirmez; bilgileri yeni sözleşmeye kopyalar.</p><div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1.35fr]"><Input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Sözleşme no veya müşteri adı soyadı ile ara" /><Select value={sourceAuthorityContractRecordId} onValueChange={copyPreviousDraft}><SelectTrigger><SelectValue placeholder={authorityDrafts.length ? "Önceki taslağı seçin" : "Bu cihazda önceki yetki taslağı yok"} /></SelectTrigger><SelectContent>{matchingAuthorityDrafts.map((draft) => <SelectItem key={draft.recordId} value={draft.recordId}>{draft.contractNo} · {draft.ownerName} · {draft.propertyAddress}</SelectItem>)}</SelectContent></Select></div>{draftSearch && !matchingAuthorityDrafts.length && <p className="mt-2 text-xs text-[#a85745]">Bu numara veya müşteri adıyla eşleşen yerel taslak bulunamadı. Farklı bilgisayardaki kayıt için şifreli yedeği geri yükleyin veya manager merge yapın.</p>}</section>
      <div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Malik / müşteri kaydı</label><Select value={clientRecordId} onValueChange={(id) => { setPropertyRecordId(""); setPropertySearch(""); chooseClient(id); }}><SelectTrigger><SelectValue placeholder="Müşteri seçin" /></SelectTrigger><SelectContent>{clientRecords.map((item) => <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>)}</SelectContent></Select></div><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Portföy kaydı <span className="font-normal text-[#87938f]">(müşteri altında)</span></label><Input value={propertySearch} onChange={(event) => setPropertySearch(event.target.value)} placeholder="Taşınmaz adı veya adres ara" className="mb-2" /><Select value={propertyRecordId} onValueChange={chooseProperty}><SelectTrigger><SelectValue placeholder="Taşınmaz seçin" /></SelectTrigger><SelectContent>{selectedPropertyRecords.map((item) => <SelectItem key={item.id} value={item.id}>{item.title}{propertyOwnerName(item) ? ` · ${propertyOwnerName(item)}` : ""}</SelectItem>)}</SelectContent></Select>{!selectedPropertyRecords.length && <p className="mt-1 text-xs text-[#a14f3f]">Seçili müşterinin yetkili portföyü bulunamadı. Taşınmaz adı veya adresiyle aramayı deneyin.</p>}</div></div>
      <section><h2 className="mb-3 text-sm font-semibold text-[#34433f]">Taraf ve taşınmaz bilgileri</h2><div className="mb-3"><UrlaLocationField value={details.propertyNeighborhood} onChange={(value) => update("propertyNeighborhood", value)} label="Taşınmaz mahallesi / yerleşimi" /></div><div className="grid gap-3 sm:grid-cols-2">{canEnterSensitive ? ownerIdentityFields.map(renderDetailsField) : ownerIdentityFields.filter(([key]) => key !== "ownerIdentity").map(renderDetailsField)}</div>{!canEnterSensitive && <p className="my-3 rounded-lg bg-[#fffaf0] px-3 py-2 text-xs text-[#8d6f3f]">T.C./vergi no ve telefon fizikî nüshada tarafça el yazısıyla tamamlanır; dijital tam değer yalnız broker manager veya atanmış danışmanın denetimindedir.</p>}<div className="my-3 rounded-lg border border-[#d4e1d8] bg-[#f3f8f4] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><label className="text-xs font-semibold text-[#315047]">EİDS Yetki Numarası</label><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${details.eidsAuthorizationNumber ? "bg-[#d9eee2] text-[#1d6a46]" : "bg-[#fff0df] text-[#9a672a]"}`}>{details.eidsAuthorizationNumber ? "EİDS onayı tamamlandı" : "EİDS onayı bekliyor"}</span></div><Input className="mt-2 bg-white" inputMode="numeric" pattern="[0-9]*" value={details.eidsAuthorizationNumber} onChange={(event) => update("eidsAuthorizationNumber", event.target.value)} placeholder="Yalnız rakam giriniz" /><p className="mt-1 text-[10px] text-[#688078]">İmzalı yetki belgesi sonrasında EİDS ekranındaki numarayı girin. Bu bilgi müşteri A4 belgesine yazılmaz.</p>{sourceAuthorityContractRecordId && canEditOfflineContractEids(records.find((record) => record.id === sourceAuthorityContractRecordId) ?? { userId: "" }, contractAccess) ? <Button type="button" variant="outline" size="sm" className="mt-2 h-8 border-[#9db7a7] bg-white text-xs text-[#245343]" onClick={() => void updateEidsOnSelectedAuthority()}>Çağrılan yetki belgesine EİDS numarasını işle</Button> : <p className="mt-1 text-[10px] text-[#688078]">Mevcut bir yetki belgesine işlemek için kayıt sahibi danışman olarak veya açık broker manager oturumuyla belgeyi çağırın.</p>}</div><div className="grid gap-3 sm:grid-cols-2">{canEnterSensitive ? ownerContactFields.map(renderDetailsField) : ownerContactFields.filter(([key]) => key !== "ownerPhone").map(renderDetailsField)}</div><div className="mt-3 grid gap-3 sm:grid-cols-2">{detailsFields.map(renderDetailsField)}</div></section>
      {details.mode === "sale" ? <section><h2 className="mb-3 text-sm font-semibold text-[#34433f]">Hizmet bedeli, fatura ve performans verisi</h2><div className="grid gap-3 sm:grid-cols-3"><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Hizmet bedeli oranı (%)</label><Input inputMode="decimal" value={details.serviceFeeRate} onChange={(event) => update("serviceFeeRate", event.target.value)} placeholder="Satışta örn. 2" /></div><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Hizmet bedeli (KDV hariç)</label><Input inputMode="numeric" value={details.serviceFeeAmount} onChange={(event) => updateWholeAmount("serviceFeeAmount", event.target.value)} placeholder="Kuruşsuz tutar" /></div><div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">KDV tahsilat biçimi</label><Select value={details.vatCollection} onValueChange={(value) => update("vatCollection", value as "separate" | "included")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="separate">KDV ayrıca tahsil edildi</SelectItem><SelectItem value="included">Tahsil edilen bedele KDV dâhil</SelectItem></SelectContent></Select></div></div><div className="mt-3 rounded-lg bg-[#f3f7f3] px-3 py-2 text-xs text-[#4a5d57]">Sözleşmeye esas bedel: <strong>{summary.contractAmount ? formatAuthorityCurrency(summary.contractAmount, details.currency) : "—"}</strong> · Hizmet bedeli: <strong>{summary.serviceFeeAmount ? formatAuthorityCurrency(summary.serviceFeeAmount, details.currency) : "—"}</strong>{summary.serviceFeeRate ? ` · Oran: %${summary.serviceFeeRate}` : ""}<p className="mt-1 text-[#718079]">KDV tahsilat biçimi, danışman performansındaki ayrı tahsil edilmeyen KDV ve tahmini net gelir kaybı göstergesini etkiler. Bu bir yönetim hesabıdır; fatura ve beyanname için mali müşavir teyidi gerekir.</p></div></section> : <section className="rounded-xl border border-[#dbe5dd] bg-[#f8fbf8] p-3"><h2 className="text-sm font-semibold text-[#34433f]">Kiralama yetkisi</h2><p className="mt-1 text-xs text-[#5d706a]">Bu belge malikin kiralama yetkisini kaydeder; malike hizmet bedeli veya KDV tahakkuku oluşturmaz. Kiracı hizmet bedeli ve KDV kalemleri, kira sözleşmesi kaydedildiğinde yalnız back-office işlem dosyasında oluşur.</p></section>}
      <section><h2 className="mb-3 text-sm font-semibold text-[#34433f]">Danışman ve ofis bilgileri</h2><div className="grid gap-3 sm:grid-cols-2"><Input className={fieldClass("consultantName")} aria-invalid={saveAttempted && missingKeys.includes("consultantName")} value={details.consultantName} onChange={(event) => update("consultantName", event.target.value)} onBlur={normalizeForm} placeholder="Danışman adı soyadı *" /><Input className={fieldClass("consultantPhone")} aria-invalid={saveAttempted && missingKeys.includes("consultantPhone")} value={details.consultantPhone} onChange={(event) => update("consultantPhone", event.target.value)} onBlur={normalizeForm} placeholder="Danışman telefonu *" /><Input className={fieldClass("consultantCode")} aria-invalid={saveAttempted && missingKeys.includes("consultantCode")} value={details.consultantCode} onChange={(event) => update("consultantCode", event.target.value)} placeholder="Yetki / personel kodu *" /><Input value={details.consultantTitle} onChange={(event) => update("consultantTitle", event.target.value)} onBlur={normalizeForm} placeholder="Sorumlu emlak danışmanı" /><Input className={fieldClass("officeName")} aria-invalid={saveAttempted && missingKeys.includes("officeName")} value={details.officeName} onChange={(event) => update("officeName", event.target.value)} onBlur={normalizeForm} placeholder="Ofis unvanı *" /><Input className={fieldClass("officeAuthorizationNo")} aria-invalid={saveAttempted && missingKeys.includes("officeAuthorizationNo")} value={details.officeAuthorizationNo} onChange={(event) => update("officeAuthorizationNo", event.target.value)} placeholder="Ofis yetki belgesi no *" /><Input value={details.officeTaxOffice} onChange={(event) => update("officeTaxOffice", event.target.value)} onBlur={normalizeForm} placeholder="Vergi dairesi" /><Input value={details.officeTaxNo} onChange={(event) => update("officeTaxNo", event.target.value)} placeholder="VKN" /><Input className={fieldClass("officePhone")} aria-invalid={saveAttempted && missingKeys.includes("officePhone")} value={details.officePhone} onChange={(event) => update("officePhone", event.target.value)} onBlur={normalizeForm} placeholder="Ofis telefonu *" /><Input className={fieldClass("officeAddress")} aria-invalid={saveAttempted && missingKeys.includes("officeAddress")} value={details.officeAddress} onChange={(event) => update("officeAddress", event.target.value)} onBlur={normalizeForm} placeholder="Ofis adresi *" /></div></section>
      <Button onClick={() => void saveDraft()} className={`w-full rounded-xl ${saveButtonClass}`}>{saveVisualState === "saved" ? <CheckCircle2 className="mr-2 h-4 w-4" /> : saveVisualState === "invalid" ? <AlertTriangle className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}{saveVisualState === "saved" ? "Yetki sözleşmesi taslağı kaydedildi" : saveVisualState === "invalid" ? "Eksik alanları tamamlayın" : "Yerel yetki sözleşmesi taslağını kaydet"}</Button>{message && <p role="status" className={`rounded-lg px-3 py-2 text-xs ${saveVisualState === "invalid" ? "bg-[#fff2f0] text-[#a13f36]" : "bg-[#f5fbf8] text-[#2b786e]"}`}>{message}</p>}
    </CardContent></Card></div><OfflineOfficeFlowPanel className="offline-operation-aside print:hidden" records={records} userId={userId} /></div>
    <Card className="authority-print-shell overflow-hidden rounded-2xl border-[#d9e2dc] bg-[#eef3ef]"><CardHeader className="print:hidden"><div className="flex flex-wrap items-center justify-between gap-3"><div><CardTitle className="font-serif text-xl">Yetki Sözleşmesi</CardTitle><p className="text-xs text-[#87938f]">Koşullar, bilgi tabloları ve imza alanları dahil tam sözleşme belge olarak aşağıda gösterilir.</p></div><div className="flex items-center gap-2"><label className="text-xs font-semibold text-[#56635f]">Punto</label><Select value={fontSize} onValueChange={setFontSize}><SelectTrigger className="w-[94px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="9">9 punto</SelectItem><SelectItem value="10">10 punto</SelectItem><SelectItem value="11">11 punto</SelectItem><SelectItem value="12">12 punto</SelectItem></SelectContent></Select><FileSignature className="h-5 w-5 text-[#a17b43]" /></div></div></CardHeader><CardContent className="p-0 print:p-0"><AuthorityContractDocument details={details} contractNo={contractNo} fontSize={fontSize} /></CardContent></Card>
    </div><DocumentPrintPreview open={printPreviewOpen} onOpenChange={setPrintPreviewOpen} title="Yetki sözleşmesi" subtitle="Belge sistem yazdırma penceresine gönderilmeden önce burada gerçek A4 oranında incelenir." onPrint={printFromPreview}><AuthorityContractDocument details={details} contractNo={contractNo} fontSize={fontSize} /></DocumentPrintPreview></div>;
}
