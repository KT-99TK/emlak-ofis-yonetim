import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatAuthorityCurrency, formatWholeCurrencyInput } from "@/lib/authorityContract";
import { createMultiPartyOfficeContribution, parseMultiPartyOfficeContribution, type CommissionSide, type ContributionChannel, type InternalControlSettings } from "@/lib/internalControl";
import { recordOfflineAudit, saveOfflineRecord, type OfflineRecord } from "@/lib/offlineStore";

const today = () => new Date().toISOString().slice(0, 10);
const amount = (value: string) => Number(value.replace(/\D/g, "")) || 0;
const money = (value: number) => formatAuthorityCurrency(value, "TRY");

type Props = { records: OfflineRecord[]; userId: string; settings: InternalControlSettings; onRefresh: () => Promise<void> };
type Person = { code: string; name: string; rate: string };
const emptyPerson = (): Person => ({ code: "", name: "", rate: "" });

export default function MultiPartyCommissionControl({ records, userId, settings, onRefresh }: Props) {
  const [transactionNo, setTransactionNo] = useState("");
  const [contractNo, setContractNo] = useState("");
  const [fee, setFee] = useState("");
  const [vat, setVat] = useState("");
  const [reference, setReference] = useState("");
  const [channel, setChannel] = useState<ContributionChannel>("systemBank");
  const [buyer, setBuyer] = useState<Person>(emptyPerson);
  const [seller, setSeller] = useState<Person>(emptyPerson);
  const [externalOffice, setExternalOffice] = useState<Person>(emptyPerson);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const multiPartyRecords = records.flatMap((record) => { const detail = parseMultiPartyOfficeContribution(record); return detail ? [detail] : []; });

  const consultantRate = amount(buyer.rate) + amount(seller.rate);
  const externalRate = amount(externalOffice.rate);
  const totalRate = consultantRate + externalRate;
  const feeAmount = amount(fee);
  const preview = feeAmount > 0 && totalRate === 100 ? {
    buyerBase: Math.round(feeAmount * amount(buyer.rate) / 100),
    sellerBase: Math.round(feeAmount * amount(seller.rate) / 100),
    buyerConsultant: Math.round(feeAmount * amount(buyer.rate) / 100 * settings.defaultConsultantRate / 100),
    sellerConsultant: Math.round(feeAmount * amount(seller.rate) / 100 * settings.defaultConsultantRate / 100),
    globalOffice: Math.round((feeAmount * consultantRate / 100) * settings.defaultOfficeRate / 100),
    external: Math.round(feeAmount * externalRate / 100),
  } : null;

  const save = async () => {
    try {
      const participants = [
        buyer.code.trim() && buyer.name.trim() && amount(buyer.rate) > 0 ? { type: "consultant" as const, side: "buyer" as CommissionSide, code: buyer.code, name: buyer.name, rate: amount(buyer.rate) } : null,
        seller.code.trim() && seller.name.trim() && amount(seller.rate) > 0 ? { type: "consultant" as const, side: "seller" as CommissionSide, code: seller.code, name: seller.name, rate: amount(seller.rate) } : null,
        externalOffice.code.trim() && externalOffice.name.trim() && externalRate > 0 ? { type: "externalOffice" as const, side: "shared" as CommissionSide, code: externalOffice.code, name: externalOffice.name, rate: externalRate } : null,
      ].filter((item): item is NonNullable<typeof item> => Boolean(item));
      const entry = createMultiPartyOfficeContribution({ sourceTransactionNo: transactionNo, sourceContractNo: contractNo || undefined, occurredOn: today(), netServiceFee: feeAmount, vatAmount: amount(vat), collectionChannel: channel, collectionReference: reference, declaredBy: userId, participants, managerActor: userId, overrideReason: reason }, settings);
      await saveOfflineRecord({ entity: "internalControl", title: `Çok paydaşlı komisyon · ${entry.sourceTransactionNo}`, details: JSON.stringify(entry), amount: String(entry.netServiceFee), dueDate: entry.occurredOn, status: entry.collectionStatus });
      recordOfflineAudit("internal-multi-party-contribution-declared", { transactionNo: entry.sourceTransactionNo, participantCount: entry.participants.length, consultantShare: entry.consultantShare, externalOfficeShare: entry.externalOfficeShare });
      setMessage(`Kayıt oluşturuldu. Danışman toplamı ${money(entry.consultantShare)}, dış ofis ${money(entry.externalOfficeShare)}.`);
      setTransactionNo(""); setContractNo(""); setFee(""); setVat(""); setReference(""); setBuyer(emptyPerson()); setSeller(emptyPerson()); setExternalOffice(emptyPerson()); setReason("");
      await onRefresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Çok paydaşlı komisyon kaydedilemedi."); }
  };

  return <Card className="rounded-2xl border-[#dbe5dd] bg-[#fbfdfb]"><CardHeader><CardTitle className="font-serif text-xl">Çok Paydaşlı Komisyon Paylaşımı</CardTitle><p className="text-xs text-[#718079]">Alıcı ve satıcı danışmanlarını, varsa dış emlak ofisini aynı işlemde ayrı gösterir. Paylar KDV hariç hizmet bedeli üzerinden hesaplanır; varsayılan danışman/ofis kuralı %60/%40’tır.</p></CardHeader><CardContent className="space-y-4">{message && <p role="status" className="rounded-lg bg-[#f4fbf6] px-3 py-2 text-sm text-[#287052]">{message}</p>}<div className="grid gap-3 md:grid-cols-2"><Input value={transactionNo} onChange={(event) => setTransactionNo(event.target.value)} placeholder="İşlem numarası *" /><Input value={contractNo} onChange={(event) => setContractNo(event.target.value)} placeholder="Sözleşme numarası (opsiyonel)" /><Input inputMode="numeric" value={fee} onChange={(event) => setFee(formatWholeCurrencyInput(event.target.value))} placeholder="KDV hariç toplam hizmet bedeli *" /><Input inputMode="numeric" value={vat} onChange={(event) => setVat(formatWholeCurrencyInput(event.target.value))} placeholder="KDV (paylaşıma katılmaz)" /><Input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Tahsilat/makbuz referansı *" /><select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={channel} onChange={(event) => setChannel(event.target.value as ContributionChannel)}><option value="systemBank">Sistem içi banka</option><option value="systemCash">Sistem içi kasa</option><option value="systemCard">Sistem içi kart</option><option value="externalCash">Sistem dışı nakit bildirimi</option></select></div><div className="grid gap-3 rounded-xl border border-[#e5e8e3] p-3 md:grid-cols-3"><div><p className="mb-2 text-sm font-semibold text-[#34433f]">Alıcı danışmanı</p><Input value={buyer.code} onChange={(event) => setBuyer({ ...buyer, code: event.target.value })} placeholder="Kod" /><Input className="mt-2" value={buyer.name} onChange={(event) => setBuyer({ ...buyer, name: event.target.value })} placeholder="Ad soyad" /><Input className="mt-2" inputMode="numeric" value={buyer.rate} onChange={(event) => setBuyer({ ...buyer, rate: event.target.value.replace(/\D/g, "").slice(0, 3) })} placeholder="Pay oranı %" /></div><div><p className="mb-2 text-sm font-semibold text-[#34433f]">Satıcı danışmanı</p><Input value={seller.code} onChange={(event) => setSeller({ ...seller, code: event.target.value })} placeholder="Kod" /><Input className="mt-2" value={seller.name} onChange={(event) => setSeller({ ...seller, name: event.target.value })} placeholder="Ad soyad" /><Input className="mt-2" inputMode="numeric" value={seller.rate} onChange={(event) => setSeller({ ...seller, rate: event.target.value.replace(/\D/g, "").slice(0, 3) })} placeholder="Pay oranı %" /></div><div><p className="mb-2 text-sm font-semibold text-[#34433f]">Dış emlak ofisi</p><Input value={externalOffice.code} onChange={(event) => setExternalOffice({ ...externalOffice, code: event.target.value })} placeholder="Ofis kodu" /><Input className="mt-2" value={externalOffice.name} onChange={(event) => setExternalOffice({ ...externalOffice, name: event.target.value })} placeholder="Ofis adı" /><Input className="mt-2" inputMode="numeric" value={externalOffice.rate} onChange={(event) => setExternalOffice({ ...externalOffice, rate: event.target.value.replace(/\D/g, "").slice(0, 3) })} placeholder="Pay oranı %" /></div></div><div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f1f6f2] px-3 py-3 text-sm"><span>Toplam oran: <strong>%{totalRate}</strong> {totalRate !== 100 && <span className="text-[#a14f3f]">(100 olmalı)</span>}</span>{preview && <span>Danışman tabanı: {money(preview.buyerBase + preview.sellerBase)} · Danışman neti: {money(preview.buyerConsultant + preview.sellerConsultant)} · Global ofis: {money(preview.globalOffice)} · Dış ofis: {money(preview.external)}</span>}</div><Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="İki taraflı/dış ofis paylaşım gerekçesi *" /><Button onClick={() => void save()} disabled={totalRate !== 100 || !transactionNo.trim() || !reference.trim() || !feeAmount}>Çok paydaşlı komisyonu kaydet</Button>{multiPartyRecords.length > 0 && <div className="space-y-2 border-t border-[#e5e8e3] pt-4"><p className="text-sm font-semibold text-[#34433f]">Çok paydaşlı işlem kayıtları</p>{multiPartyRecords.map((entry) => <div key={entry.id} className="rounded-xl border border-[#e5e8e3] bg-white p-3 text-xs"><div className="flex flex-wrap justify-between gap-2"><strong>{entry.sourceTransactionNo}</strong><span>{money(entry.netServiceFee)} net · {entry.collectionStatus}</span></div><div className="mt-2 grid gap-1 md:grid-cols-3">{entry.participants.map((participant) => <span key={participant.id}>{participant.name} ({participant.side === "buyer" ? "alıcı" : participant.side === "seller" ? "satıcı" : "dış ofis"}): {money(participant.share)} · %{participant.rate}</span>)}</div><p className="mt-2 text-[#718079]">Global 1881 ofis payı: {money(entry.global1881Share)} · Danışman net payı: {money(entry.consultantShare)} · Dış ofis payı: {money(entry.externalOfficeShare)} · KDV: {money(entry.vatAmount)} (paylaşım dışı)</p></div>)}</div>}</CardContent></Card>;
}
