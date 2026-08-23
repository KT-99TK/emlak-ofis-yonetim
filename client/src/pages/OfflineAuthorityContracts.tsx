import { useEffect, useMemo, useState } from "react";
import { FileSignature, Printer, Save, WifiOff } from "lucide-react";
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
  nextAuthorityContractNo,
  normalizeAuthorityDetails,
  renderAuthorityContract,
  type AuthorityContractDetails,
} from "@/lib/authorityContract";
import { getUserId, listOfflineRecords, saveOfflineRecord, type OfflineRecord } from "@/lib/offlineStore";

const detailsFields: Array<[keyof AuthorityContractDetails, string]> = [
  ["ownerName", "Malik adı / unvanı"], ["ownerIdentity", "TCKN / VKN"], ["ownerPhone", "Malik telefonu"], ["ownerAddress", "Malik adresi"],
  ["propertyAddress", "Taşınmaz açık adresi"], ["parcelInfo", "Ada / parsel / bağımsız bölüm"], ["propertyType", "Niteliği / cinsi"], ["grossM2", "Brüt / net m²"],
  ["roomCount", "Oda sayısı"], ["floorAndView", "Kat / cephe / manzara"], ["condition", "Bina yaşı / kullanım durumu"], ["price", "Sözleşmeye esas bedel"], ["contractDate", "Sözleşme tarihi"],
];

type AuthoritySnapshot = { schema?: string; contractNo?: string };

function existingAuthorityNumbers(records: OfflineRecord[]) {
  return records.flatMap((record) => {
    if (record.entity !== "contract") return [];
    try {
      const snapshot = JSON.parse(record.details) as AuthoritySnapshot;
      return snapshot.schema === "global1881-offline-authority-v1" || snapshot.schema === "global1881-offline-authority-v2"
        ? [snapshot.contractNo ?? ""]
        : [];
    } catch {
      return [];
    }
  });
}

export default function OfflineAuthorityContracts() {
  const [records, setRecords] = useState<OfflineRecord[]>([]);
  const [details, setDetails] = useState<AuthorityContractDetails>(() => emptyAuthorityDetails());
  const [clientRecordId, setClientRecordId] = useState("");
  const [propertyRecordId, setPropertyRecordId] = useState("");
  const [fontSize, setFontSize] = useState("11");
  const [message, setMessage] = useState("");
  const userId = getUserId();

  const refresh = async () => setRecords(await listOfflineRecords());
  useEffect(() => { void refresh(); }, []);

  const clientRecords = records.filter((record) => record.entity === "client");
  const propertyRecords = records.filter((record) => record.entity === "property");
  const contractNo = useMemo(
    () => nextAuthorityContractNo(existingAuthorityNumbers(records), details.consultantName, details.contractDate),
    [details.consultantName, details.contractDate, records],
  );
  const summary = useMemo(() => calculateAuthoritySummary(details), [details]);
  const preview = useMemo(() => renderAuthorityContract(details, contractNo), [details, contractNo]);

  const update = (key: keyof AuthorityContractDetails, value: string) => {
    setDetails((current) => ({ ...current, [key]: value }));
  };

  const normalizeForm = () => setDetails((current) => normalizeAuthorityDetails(current));

  const chooseClient = (id: string) => {
    setClientRecordId(id);
    const record = clientRecords.find((item) => item.id === id);
    if (record) setDetails((current) => normalizeAuthorityDetails({ ...current, ownerName: record.title, ownerAddress: record.details || current.ownerAddress }));
  };

  const chooseProperty = (id: string) => {
    setPropertyRecordId(id);
    const record = propertyRecords.find((item) => item.id === id);
    if (record) setDetails((current) => normalizeAuthorityDetails({ ...current, propertyAddress: record.details ? `${record.title} · ${record.details}` : record.title }));
  };

  const saveDraft = async () => {
    const normalized = normalizeAuthorityDetails(details);
    if (!userId.trim()) {
      setMessage("Önce Yerel Çalışma Alanı ekranından offline kullanıcı kodunu kaydedin.");
      return;
    }
    if (!normalized.ownerName || !normalized.propertyAddress || !normalized.consultantName) {
      setMessage("Malik adı, taşınmaz adresi ve danışman adı zorunludur; otomatik kayıt numarası danışman adına göre üretilir.");
      return;
    }
    const finalNumber = nextAuthorityContractNo(existingAuthorityNumbers(records), normalized.consultantName, normalized.contractDate);
    await saveOfflineRecord({
      entity: "contract",
      title: `${finalNumber} — ${authorityContractTitle(normalized.mode)} — ${normalized.ownerName}`,
      details: JSON.stringify(createOfflineAuthoritySnapshot(normalized, finalNumber, clientRecordId || undefined, propertyRecordId || undefined)),
      amount: normalized.price || undefined,
      status: "draft",
    });
    setDetails(normalized);
    setMessage(`${finalNumber} numaralı yetki sözleşmesi taslağı kaydedildi. Danışman, bedel ve hizmet bedeli verileri şifreli yedek/merge ile performans tablosuna aktarılacaktır.`);
    await refresh();
  };

  return (
    <div className="authority-contract-workspace min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]"><WifiOff className="h-3.5 w-3.5" /> Offline sözleşme çalışma alanı</p>
          <h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Yetki Sözleşmeleri</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#70807c]">Taslak bu cihazın yerel veritabanına yazılır; şifreli yedek ve manager merge ile güvenle taşınır.</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="rounded-xl bg-white"><Printer className="mr-2 h-4 w-4" /> A4 yazdırma önizlemesi</Button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
        <Card className="rounded-2xl border-[#e5e8e3] bg-white/85 print:hidden">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Belge bilgileri</CardTitle>
            <p className="text-xs text-[#87938f]">İsim ve adres alanları kayıt sırasında Türkçe baş harf düzeniyle; telefon alanları +90 uluslararası biçimiyle saklanır.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section className="rounded-xl border border-[#eadfca] bg-[#fffaf0] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d6f3f]">Otomatik takip kimliği</p>
              <p className="mt-1 font-mono text-lg font-semibold text-[#173e39]">{contractNo}</p>
              <p className="mt-1 text-xs text-[#6f7a75]">Danışman baş harfi: <strong>{consultantInitials(details.consultantName)}</strong>. Aynı danışmanın yıl içindeki sıra numarası, önceki yerel kayıtlar dikkate alınarak otomatik artar.</p>
            </section>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Belge türü</label>
                <Select value={details.mode} onValueChange={(value) => update("mode", value as "sale" | "rent")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="rent">Kiralama yetki sözleşmesi</SelectItem><SelectItem value="sale">Satış yetki sözleşmesi</SelectItem></SelectContent></Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Para birimi</label>
                <Select value={details.currency} onValueChange={(value) => update("currency", value as AuthorityContractDetails["currency"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TRY">Türk lirası (TRY)</SelectItem><SelectItem value="USD">ABD doları (USD)</SelectItem><SelectItem value="EUR">Euro (EUR)</SelectItem></SelectContent></Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Yerel malik kaydı</label><Select value={clientRecordId} onValueChange={chooseClient}><SelectTrigger><SelectValue placeholder="Müşteri seçin" /></SelectTrigger><SelectContent>{clientRecords.map((item) => <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>)}</SelectContent></Select></div>
              <div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Yerel portföy kaydı</label><Select value={propertyRecordId} onValueChange={chooseProperty}><SelectTrigger><SelectValue placeholder="Mülk seçin" /></SelectTrigger><SelectContent>{propertyRecords.map((item) => <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>)}</SelectContent></Select></div>
            </div>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#34433f]">Taraf ve taşınmaz bilgileri</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {detailsFields.map(([key, label]) => (
                  <div key={key} className={key === "ownerAddress" || key === "propertyAddress" ? "sm:col-span-2" : ""}>
                    <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">{label}</label>
                    <Input type={key === "contractDate" ? "date" : "text"} value={details[key] as string} onChange={(event) => update(key, event.target.value)} onBlur={normalizeForm} />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#34433f]">Hizmet bedeli ve performans verisi</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Hizmet bedeli oranı (%)</label><Input inputMode="decimal" value={details.serviceFeeRate} onChange={(event) => update("serviceFeeRate", event.target.value)} placeholder="Örn. 2" /></div>
                <div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Hizmet bedeli tutarı</label><Input inputMode="decimal" value={details.serviceFeeAmount} onChange={(event) => update("serviceFeeAmount", event.target.value)} placeholder="Oran boşsa tutarı yazın" /></div>
              </div>
              <div className="mt-3 rounded-lg bg-[#f3f7f3] px-3 py-2 text-xs text-[#4a5d57]">
                Sözleşmeye esas bedel: <strong>{summary.contractAmount ? formatAuthorityCurrency(summary.contractAmount, details.currency) : "—"}</strong> · Hizmet bedeli: <strong>{summary.serviceFeeAmount ? formatAuthorityCurrency(summary.serviceFeeAmount, details.currency) : "—"}</strong>{summary.serviceFeeRate ? ` · Oran: %${summary.serviceFeeRate}` : ""}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#34433f]">Danışman ve ofis bilgileri</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input value={details.consultantName} onChange={(event) => update("consultantName", event.target.value)} onBlur={normalizeForm} placeholder="Danışman adı soyadı (zorunlu)" />
                <Input value={details.consultantPhone} onChange={(event) => update("consultantPhone", event.target.value)} onBlur={normalizeForm} placeholder="Danışman telefonu" />
                <Input value={details.consultantCode} onChange={(event) => update("consultantCode", event.target.value)} placeholder="Yetki / personel kodu" />
                <Input value={details.consultantTitle} onChange={(event) => update("consultantTitle", event.target.value)} onBlur={normalizeForm} placeholder="Sorumlu emlak danışmanı" />
                <Input value={details.officeName} onChange={(event) => update("officeName", event.target.value)} onBlur={normalizeForm} placeholder="Ofis unvanı" />
                <Input value={details.officeAuthorizationNo} onChange={(event) => update("officeAuthorizationNo", event.target.value)} placeholder="Ofis yetki belgesi no" />
                <Input value={details.officePhone} onChange={(event) => update("officePhone", event.target.value)} onBlur={normalizeForm} placeholder="Ofis telefonu" />
                <Input value={details.officeAddress} onChange={(event) => update("officeAddress", event.target.value)} onBlur={normalizeForm} placeholder="Ofis adresi" />
              </div>
            </section>

            <Button onClick={() => void saveDraft()} className="w-full rounded-xl bg-[#173e39] hover:bg-[#20554e]"><Save className="mr-2 h-4 w-4" /> Yerel yetki sözleşmesi taslağını kaydet</Button>
            {message && <p role="status" className="rounded-lg bg-[#f5fbf8] px-3 py-2 text-xs text-[#2b786e]">{message}</p>}
          </CardContent>
        </Card>

        <Card className="authority-print-shell rounded-2xl border-[#e5e8e3] bg-white">
          <CardHeader className="print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><CardTitle className="font-serif text-xl">Canlı A4 belge önizlemesi</CardTitle><p className="text-xs text-[#87938f]">Okunabilirlik önceliklidir. Metin sayfaya sığmadığında küçük puntoya zorlanmaz; sonraki A4 sayfasına düzenli biçimde devam eder.</p></div>
              <div className="flex items-center gap-2"><label className="text-xs font-semibold text-[#56635f]">Punto</label><Select value={fontSize} onValueChange={setFontSize}><SelectTrigger className="w-[94px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="9">9 punto</SelectItem><SelectItem value="10">10 punto</SelectItem><SelectItem value="11">11 punto</SelectItem><SelectItem value="12">12 punto</SelectItem></SelectContent></Select><FileSignature className="h-5 w-5 text-[#a17b43]" /></div>
            </div>
          </CardHeader>
          <CardContent className="print:p-0">
            <article className="authority-print-document whitespace-pre-wrap rounded-xl border border-[#ede9de] bg-[#fffdf8] p-6 font-serif text-[#34433f] shadow-sm" style={{ "--authority-print-font-size": `${fontSize}pt` } as React.CSSProperties}>
              <div className="authority-print-running-header"><span>GLOBAL 1881 GAYRİMENKUL</span><span>{contractNo}</span></div>
              <div className="authority-print-body">{preview}</div>
              <div className="authority-print-running-footer">Global 1881 Gayrimenkul · Yetki sözleşmesi taslağı · Kayıt: {contractNo}</div>
            </article>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
