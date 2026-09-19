import { Download, FileSpreadsheet, Plus, Printer, Save, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { canViewFullOfflineContract, type OfflineContractAccessContext } from "@/lib/offlineContractAccess";
import writeXlsxFile from "write-excel-file/browser";
import { getUserId, saveOfflineRecord, type OfflineRecord } from "@/lib/offlineStore";
import DocumentPrintPreview from "@/components/DocumentPrintPreview";

export type MultiPropertyIntakeFormProps = {
  records: OfflineRecord[];
  access: OfflineContractAccessContext;
  onRefresh: () => Promise<void>;
};

type PropertyRow = {
  id: string;
  type: "Daire" | "Villa" | "İşyeri" | "Arsa";
  purpose: "Satılık" | "Kiralık" | "Satılık/Kiralık";
  portfolioDescription: string;
  title: string;
  address: string;
  price: string;
  authorityStart: string;
  authorityEnd: string;
};

const emptyRow = (): PropertyRow => ({ id: crypto.randomUUID(), type: "Daire", purpose: "Satılık", portfolioDescription: "", title: "", address: "", price: "", authorityStart: "", authorityEnd: "" });
const clean = (value: string) => value.trim().replace(/\s+/g, " ");
const normalize = (value: string) => clean(value).toLocaleUpperCase("tr-TR");
const numberValue = (value: string) => value.replace(/[^0-9]/g, "");

export default function MultiPropertyIntakeForm({ records, access, onRefresh }: MultiPropertyIntakeFormProps) {
  const [clientId, setClientId] = useState("");
  const [groupNo, setGroupNo] = useState("");
  const [rows, setRows] = useState<PropertyRow[]>([emptyRow()]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const userId = getUserId();
  const clients = records.filter(record => record.entity === "client" && canViewFullOfflineContract(record, access));
  const properties = records.filter(record => record.entity === "property" && canViewFullOfflineContract(record, access));
  const client = clients.find(record => record.id === clientId);
  const existingForClient = useMemo(() => {
    if (!client) return [];
    const prefix = groupNo.trim() ? `${groupNo.trim()}-` : "";
    return properties.filter(record => prefix && record.title.startsWith(prefix));
  }, [client, groupNo, properties]);
  const exportProperties = useMemo(() => [...properties].sort((left, right) => left.title.localeCompare(right.title, "tr-TR")), [properties]);
  const exportRows = useMemo(() => exportProperties.map(record => {
    const titleParts = record.title.split(" · ");
    const detailParts = record.details.split(" | ");
    const readDetail = (prefix: string) => detailParts.find(part => part.startsWith(prefix))?.slice(prefix.length).trim() ?? "";
    return {
      sequence: titleParts[0] ?? "",
      portfolioDescription: titleParts[1] ?? titleParts[0] ?? "",
      type: titleParts[2] ?? "",
      purpose: titleParts[3] ?? "",
      address: detailParts[0] ?? record.details,
      owner: readDetail("MALİK:"),
      price: readDetail("BEDEL:"),
      authority: readDetail("YETKİ:"),
      consultant: readDetail("DANIŞMAN:") || "",
    };
  }), [exportProperties]);

  const setRow = (id: string, patch: Partial<PropertyRow>) => setRows(current => current.map(row => row.id === id ? { ...row, ...patch } : row));
  const addRow = () => setRows(current => [...current, emptyRow()]);
  const removeRow = (id: string) => setRows(current => current.length === 1 ? current : current.filter(row => row.id !== id));

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const exportExcel = async () => {
    if (!exportRows.length) { setMessage("Dışa aktarılacak kayıtlı mülk bulunmuyor."); return; }
    setMessage("Excel dosyası hazırlanıyor...");
    const rows = [
      ["Sıra No", "Portföy Tanımı", "Tür", "İşlem Amacı", "Açık Adres", "Malik / Müşteri", "Bedel", "Yetki Tarihleri", "Danışman"],
      ...exportRows.map(row => [row.sequence, row.portfolioDescription, row.type, row.purpose, row.address, row.owner, row.price, row.authority, row.consultant]),
    ];
    const workbook = writeXlsxFile(rows.map(row => row.map(value => ({ value }))), {
      sheet: "Mülk Portföy Listesi",
      stickyRowsCount: 1,
      orientation: "landscape",
      columns: [10, 26, 12, 16, 40, 24, 16, 24, 16].map(width => ({ width })),
    });
    const blob = await workbook.toBlob();
    downloadBlob(blob, `Global1881-Mulk-Portfoy-Listesi-${new Date().toISOString().slice(0, 10)}.xlsx`);
    setMessage(`${exportRows.length} mülk Excel dosyası olarak dışa aktarıldı.`);
  };
  const printPdf = () => {
    if (!exportRows.length) {
      setMessage("PDF olarak çıkarılacak kayıtlı mülk bulunmuyor.");
      return;
    }
    setPrintPreviewOpen(true);
  };

  const save = async () => {
    if (!userId.trim()) { setMessage("Önce Yerel Çalışma Alanı ekranından offline kullanıcı kodunu kaydedin."); return; }
    if (!client) { setMessage("Önce malik/müşteri kaydını seçin."); return; }
    if (!groupNo.trim()) { setMessage("Müşteri portföy grup numarası zorunludur."); return; }
    const invalid = rows.find(row => !clean(row.portfolioDescription) || !clean(row.address));
    if (invalid) { setMessage("Her taşınmaz satırında portföy tanımı ve açık adres zorunludur."); return; }
    setSaving(true); setMessage("Taşınmazlar kaydediliyor...");
    try {
      const existingKeys = new Set(properties.map(record => normalize(`${record.title}|${record.details}`)));
      let created = 0; let skipped = 0;
      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        const sequence = `${groupNo.trim()}-${String(index + 1).padStart(2, "0")}`;
        const title = `${sequence} · ${normalize(row.portfolioDescription)} · ${normalize(row.type)} · ${normalize(row.purpose)}`;
        const details = `${normalize(row.address)} | PORTFÖY: ${normalize(row.portfolioDescription)} | TANIM: ${normalize(row.title)} | MALİK: ${normalize(client.title)} | MÜŞTERİ_ID: ${client.id} | BEDEL: ${row.price || "BELİRTİLMEDİ"} | YETKİ: ${row.authorityStart || ""}–${row.authorityEnd || ""}`;
        const key = normalize(`${title}|${details}`);
        if (existingKeys.has(key)) { skipped++; continue; }
        await saveOfflineRecord({ entity: "property", title, details, status: "active" });
        existingKeys.add(key); created++;
      }
      await onRefresh();
      setMessage(`${created} taşınmaz kaydedildi${skipped ? `, ${skipped} mevcut kayıt mükerrerlik nedeniyle atlandı` : ""}.`);
      setRows([emptyRow()]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Taşınmazlar kaydedilemedi.");
    } finally { setSaving(false); }
  };

  return <Card className="mb-6 rounded-2xl border-[#dbe5dd] bg-white/90">
    <CardHeader><CardTitle className="font-serif text-xl">Müşterinin çoklu taşınmaz kaydı</CardTitle><p className="text-xs text-[#718079]">Aynı müşteriyi bir kez seçin; daire, villa veya diğer taşınmazları aşağıdaki doldurulabilir satırlara ekleyin. Her satır ayrı mülk kaydı olur.</p></CardHeader>
    <CardContent className="space-y-4">
      {message && <p role="status" className="rounded-lg bg-[#f4fbf6] px-3 py-2 text-sm text-[#287052]">{message}</p>}
      <div className="grid gap-3 md:grid-cols-[1.4fr_.7fr]">
        <div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Malik / müşteri</label><Select value={clientId} onValueChange={setClientId}><SelectTrigger><SelectValue placeholder="Mevcut müşteri seçin" /></SelectTrigger><SelectContent>{clients.map(item => <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>)}</SelectContent></Select></div>
        <div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Müşteri portföy grup no</label><Input value={groupNo} onChange={event => setGroupNo(event.target.value.toUpperCase())} placeholder="Örn. CT1-001" /><p className="mt-1 text-[10px] text-[#718079]">Satır numaraları bu grubun altında oluşur: CT1-001-01.</p></div>
      </div>
      {client && existingForClient.length > 0 && <p className="rounded-lg bg-[#fff8e8] px-3 py-2 text-xs text-[#8d6630]">Bu müşteri/grup için {existingForClient.length} mevcut mülk bulundu. Aynı satırlar mükerrer olarak atlanır.</p>}
      <div className="space-y-3">{rows.map((row, index) => <div key={row.id} className="rounded-xl border border-[#e5e8e3] bg-[#fbfdfb] p-3"><div className="mb-2 flex items-center justify-between gap-2"><p className="text-xs font-semibold text-[#173e39]">Mülk {index + 1}</p>{rows.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(row.id)} aria-label={`Mülk ${index + 1} satırını kaldır`}><Trash2 className="h-4 w-4 text-[#a14f3f]" /></Button>}</div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><Select value={row.type} onValueChange={value => setRow(row.id, { type: value as PropertyRow["type"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Daire", "Villa", "İşyeri", "Arsa"].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><Select value={row.purpose} onValueChange={value => setRow(row.id, { purpose: value as PropertyRow["purpose"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Satılık", "Kiralık", "Satılık/Kiralık"].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select><Input value={row.portfolioDescription} onChange={event => setRow(row.id, { portfolioDescription: event.target.value })} placeholder="Portföy tanımı * · GAZİEMİR 2+1 DUBLEKS" /><Input value={row.title} onChange={event => setRow(row.id, { title: event.target.value })} placeholder="Mülk kısa adı / blok-daire" /><Input value={row.price} onChange={event => setRow(row.id, { price: numberValue(event.target.value) })} placeholder="Fiyat / kira" inputMode="numeric" /><Input className="sm:col-span-2 lg:col-span-4" value={row.address} onChange={event => setRow(row.id, { address: event.target.value })} placeholder="Açık adres *" /><Input type="date" value={row.authorityStart} onChange={event => setRow(row.id, { authorityStart: event.target.value })} aria-label={`Mülk ${index + 1} yetki başlangıç tarihi`} /><Input type="date" value={row.authorityEnd} onChange={event => setRow(row.id, { authorityEnd: event.target.value })} aria-label={`Mülk ${index + 1} yetki bitiş tarihi`} /></div></div>)}</div>
      <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={addRow}><Plus className="mr-2 h-4 w-4" /> Mülk satırı ekle</Button><Button type="button" onClick={() => void save()} disabled={saving} className="bg-[#173e39] hover:bg-[#20554e]"><Save className="mr-2 h-4 w-4" />{saving ? "Kaydediliyor…" : "Mülkleri toplu kaydet"}</Button><Button type="button" variant="outline" onClick={() => void exportExcel()} disabled={!exportRows.length || saving}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel’e aktar</Button><Button type="button" variant="outline" onClick={printPdf} disabled={!exportRows.length || saving}><Printer className="mr-2 h-4 w-4" /> PDF liste</Button></div>      <div className="flex items-center gap-2 rounded-lg bg-[#f7fbf8] px-3 py-2 text-xs text-[#5e716a]"><Download className="h-3.5 w-3.5" />{exportRows.length ? `${exportRows.length} kayıt dışa aktarmaya hazır.` : "Önce mülk kaydı oluşturun; sonra Excel veya PDF olarak dışa aktarın."}</div>
      <DocumentPrintPreview
        open={printPreviewOpen}
        onOpenChange={setPrintPreviewOpen}
        title="Mülk portföy listesi"
        subtitle="Filtrelenmiş kayıtlar A4 yatay düzende yazdırılmadan önce burada incelenir."
        fileName={`Global1881-Mulk-Portfoy-Listesi-${new Date().toISOString().slice(0, 10)}.pdf`}
        onPrint={() => window.print()}
      >
        <article className="authority-print-document property-portfolio-print-document bg-white p-6 text-[#24322f]">
          <div className="mb-4 border-b-2 border-[#173e39] pb-3">
            <h1 className="font-serif text-2xl text-[#173e39]">GLOBAL 1881 — MÜLK PORTFÖY LİSTESİ</h1>
            <p className="mt-1 text-xs text-[#64736e]">Oluşturulma tarihi: {new Date().toLocaleDateString("tr-TR")} · Kayıt sayısı: {exportRows.length}</p>
          </div>
          <table className="w-full border-collapse text-[9px]">
            <thead><tr className="bg-[#eaf1ed]">{["Sıra No", "Portföy Tanımı", "Tür", "İşlem Amacı", "Açık Adres", "Malik / Müşteri", "Bedel", "Yetki Tarihleri", "Danışman"].map(label => <th key={label} className="border border-[#b8c5bf] p-1.5 text-left font-semibold">{label}</th>)}</tr></thead>
            <tbody>{exportRows.map(row => <tr key={`${row.sequence}-${row.address}`}><td className="border border-[#b8c5bf] p-1.5">{row.sequence}</td><td className="border border-[#b8c5bf] p-1.5">{row.portfolioDescription}</td><td className="border border-[#b8c5bf] p-1.5">{row.type}</td><td className="border border-[#b8c5bf] p-1.5">{row.purpose}</td><td className="border border-[#b8c5bf] p-1.5">{row.address}</td><td className="border border-[#b8c5bf] p-1.5">{row.owner}</td><td className="border border-[#b8c5bf] p-1.5">{row.price}</td><td className="border border-[#b8c5bf] p-1.5">{row.authority}</td><td className="border border-[#b8c5bf] p-1.5">{row.consultant}</td></tr>)}</tbody>
          </table>
        </article>
      </DocumentPrintPreview>
    </CardContent>
  </Card>;
}
