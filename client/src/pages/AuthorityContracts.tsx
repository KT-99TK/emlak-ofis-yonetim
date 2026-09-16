import { useEffect, useState } from "react";
import { FileSignature, Printer, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AuthorityContractDocument from "@/components/AuthorityContractDocument";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { authorityContractTitle, emptyAuthorityDetails, formatWholeCurrencyInput, normalizeAuthorityDetails, normalizeAuthorityField, toInternationalPhone, type AuthorityContractDetails } from "@/lib/authorityContract";
import { formatContractPhoneInput } from "@/lib/contractFormFormatting";

const partyFields: Array<[keyof AuthorityContractDetails, string]> = [
  ["ownerName", "Malik adı / unvanı"],
  ["ownerIdentity", "TCKN / VKN"],
  ["ownerPhone", "Malik telefonu / e-posta"],
  ["ownerAddress", "Malik adresi"],
  ["propertyAddress", "Taşınmaz açık adresi"],
  ["parcelInfo", "Ada / parsel / bağımsız bölüm"],
  ["propertyType", "Niteliği / cinsi"],
  ["grossM2", "Brüt / net m²"],
  ["roomCount", "Oda sayısı"],
  ["floorAndView", "Kat / cephe / manzara"],
  ["condition", "Bina yaşı / kullanım durumu"],
  ["price", "Sözleşmeye esas bedel"],
  ["contractDate", "Sözleşme tarihi"],
];

const officeFields: Array<[keyof AuthorityContractDetails, string]> = [
  ["officeName", "Ofis unvanı"],
  ["officeAuthorizationNo", "Ofis yetki belgesi no"],
  ["officePhone", "Ofis telefonu"],
  ["officeAddress", "Ofis adresi"],
];

const DEFAULT_OFFICE_DETAILS: Pick<AuthorityContractDetails, "officeName" | "officeAuthorizationNo" | "officePhone" | "officeAddress"> = {
  officeName: "Global 1881 Gayrimenkul",
  officeAuthorizationNo: "3500211",
  officePhone: "+90 534 975 05 82",
  officeAddress: "HACI İSA MAHALLESİ 75. YIL CUMHURİYET CADDESİ NO:5/38 URLA",
};

const CONSULTANT_DEFAULTS: Record<string, Partial<Pick<AuthorityContractDetails, "consultantName" | "consultantPhone" | "consultantCode" | "consultantTitle">>> = {
  KT1: { consultantName: "KAZIM TAŞLIARMUT", consultantPhone: "+90 541 935 29 59", consultantCode: "3500211/001", consultantTitle: "SORUMLU EMLAK DANIŞMANI" },
  IP1: { consultantName: "İBRAHİM PARİN", consultantCode: "3500211/002", consultantTitle: "SORUMLU EMLAK DANIŞMANI" },
  CT1: { consultantName: "CAHİT TERCAN", consultantPhone: "+90 503 304 21 55", consultantCode: "3500211/003", consultantTitle: "SORUMLU EMLAK DANIŞMANI" },
};

const consultantDefaultsFor = (value?: string) => {
  const normalized = (value ?? "").trim().toUpperCase();
  const shortCode = normalized.match(/(?:^|\/)(KT1|IP1|CT1)$/)?.[1] ?? normalized;
  return CONSULTANT_DEFAULTS[shortCode] ?? {};
};

export default function AuthorityContracts() {
  const { user } = useAuth();
  const clients = trpc.clients.list.useQuery();
  const properties = trpc.properties.list.useQuery();
  const nextNumber = trpc.contracts.nextNumber.useQuery();
  const utils = trpc.useUtils();
  const create = trpc.contracts.create.useMutation({ onSuccess: () => utils.contracts.list.invalidate() });
  const [details, setDetails] = useState<AuthorityContractDetails>(() => ({ ...emptyAuthorityDetails(), ...DEFAULT_OFFICE_DETAILS }));
  const [clientId, setClientId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [contractNo, setContractNo] = useState("");
  const [saved, setSaved] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const selectedClient = clients.data?.find((item) => String(item.id) === clientId);
  const selectedProperty = properties.data?.find((item) => String(item.id) === propertyId);

  useEffect(() => {
    const suggestion = nextNumber.data?.nextContractNo;
    if (suggestion && (!contractNo || contractNo.startsWith("YET-"))) setContractNo(suggestion);
  }, [contractNo, nextNumber.data?.nextContractNo]);

  useEffect(() => {
    const consultant = { ...consultantDefaultsFor(nextNumber.data?.consultantCode ?? undefined), consultantName: user?.name || consultantDefaultsFor(nextNumber.data?.consultantCode ?? undefined).consultantName || "" };
    setDetails((current) => ({ ...current, ...consultant, officeName: current.officeName || DEFAULT_OFFICE_DETAILS.officeName, officeAuthorizationNo: current.officeAuthorizationNo || DEFAULT_OFFICE_DETAILS.officeAuthorizationNo, officePhone: current.officePhone || DEFAULT_OFFICE_DETAILS.officePhone, officeAddress: current.officeAddress || DEFAULT_OFFICE_DETAILS.officeAddress }));
  }, [nextNumber.data?.consultantCode, user?.name]);

  const update = (key: keyof AuthorityContractDetails, value: string) => {
    setSaved(false);
    setValidationMessage("");
    const nextValue = key === "ownerPhone" || key === "consultantPhone" || key === "officePhone"
      ? formatContractPhoneInput(value)
      : key === "price" || key === "serviceFeeAmount"
        ? formatWholeCurrencyInput(value)
        : normalizeAuthorityField(key, value);
    setDetails((current) => ({ ...current, [key]: nextValue }));
  };

  const chooseClient = (value: string) => {
    setClientId(value);
    const client = clients.data?.find((item) => String(item.id) === value);
    if (client) {
      setDetails((current) => ({
        ...current,
        ownerName: normalizeAuthorityField("ownerName", client.name),
        ownerIdentity: client.identityOrTaxNo ?? "",
        ownerPhone: toInternationalPhone(client.phone ?? ""),
        ownerAddress: normalizeAuthorityField("ownerAddress", client.address ?? ""),
      }));
    }
  };

  const chooseProperty = (value: string) => {
    setPropertyId(value);
    const property = properties.data?.find((item) => String(item.id) === value);
    if (property) {
      setDetails((current) => ({
        ...current,
        propertyAddress: normalizeAuthorityField("propertyAddress", property.address),
        propertyType: normalizeAuthorityField("propertyType", property.type),
        grossM2: property.grossM2 ?? "",
        roomCount: property.roomCount ?? "",
        price: property.price ?? current.price,
      }));
    }
  };

  const submit = () => {
    const normalized = normalizeAuthorityDetails(details);
    if (!contractNo.trim() || !normalized.ownerName.trim() || !normalized.propertyAddress.trim()) {
      setValidationMessage("Kayıt için sözleşme numarası, malik ve taşınmaz adresi zorunludur.");
      return;
    }
    if (!nextNumber.data?.consultantCode) {
      setValidationMessage("Bu kullanıcı için danışman kodu tanımlı olmadığı için sözleşme kaydı açılamıyor.");
      return;
    }
    setValidationMessage("");
    create.mutate({
      contractNo: contractNo.trim(),
      type: "authority",
      subtype: normalized.mode,
      title: `${authorityContractTitle(normalized.mode)} — ${normalized.ownerName}`,
      amount: normalized.price || undefined,
      clientId: clientId ? Number(clientId) : undefined,
      propertyId: propertyId ? Number(propertyId) : undefined,
      details: JSON.stringify({ template: "claude-authority-v1", ...normalized }),
    }, {
      onSuccess: () => setSaved(true),
      onError: (error) => {
        setSaved(false);
        setValidationMessage(error.message || "Kayıt oluşturulamadı; sözleşme numarasını kontrol edin.");
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]">Merkezi form düzeni · Global 1881</p>
          <h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Yetki Sözleşmeleri</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#70807c]">Malik, taşınmaz ve danışman bilgilerini tek formda toplayın; imzaya hazır A4 belgeyi sağdaki önizlemede anlık olarak kontrol edin.</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="rounded-xl bg-white"><Printer className="mr-2 h-4 w-4" /> Yazdır</Button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(390px,.9fr)_minmax(0,1.1fr)]">
        <Card className="rounded-2xl border-[#e5e8e3] bg-white/85 print:hidden">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Belge bilgileri</CardTitle>
            <p className="text-xs text-[#87938f]">Seçilen müşteri ve portföy alanları otomatik gelir; eksikleri ayrıca tamamlayabilirsiniz.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Belge türü</label>
                <Select value={details.mode} onValueChange={(value) => update("mode", value as "sale" | "rent")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="rent">Kiralama yetki sözleşmesi</SelectItem><SelectItem value="sale">Satış yetki sözleşmesi</SelectItem></SelectContent>
                </Select>
              </div>
              <div><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Kayıt numarası</label><Input value={contractNo} onChange={(event) => setContractNo(event.target.value)} placeholder="KT1-001" /><p className="mt-1 text-[10px] text-[#718079]">Danışman koduna göre otomatik önerilir: {nextNumber.data?.consultantCode ?? "kod bekleniyor"}</p></div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Malik kaydı</label>
                <Select value={clientId} onValueChange={chooseClient}><SelectTrigger><SelectValue placeholder="Müşteri seçin" /></SelectTrigger><SelectContent>{(clients.data ?? []).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent></Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">Portföy kaydı</label>
                <Select value={propertyId} onValueChange={chooseProperty}><SelectTrigger><SelectValue placeholder="Taşınmaz seçin" /></SelectTrigger><SelectContent>{(properties.data ?? []).map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.referenceNo} · {item.title}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#34433f]">Taraf ve taşınmaz bilgileri</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {partyFields.map(([key, label]) => <div key={key} className={key === "ownerAddress" || key === "propertyAddress" ? "sm:col-span-2" : ""}><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">{label}</label><Input type={key === "contractDate" ? "date" : "text"} value={details[key]} onChange={(event) => update(key, event.target.value)} /></div>)}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-[#34433f]">Danışman ve ofis bilgileri</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input value={details.consultantName} onChange={(event) => update("consultantName", event.target.value)} placeholder={user?.name ?? "Danışman adı soyadı"} aria-label="Danışman adı soyadı" />
                <Input value={details.consultantPhone} onChange={(event) => update("consultantPhone", event.target.value)} placeholder="Telefon / e-posta" aria-label="Danışman telefonu" />
                <Input value={details.consultantCode} onChange={(event) => update("consultantCode", event.target.value)} placeholder="Yetki / personel kodu" aria-label="Danışman kodu" />
                <Input value={details.consultantTitle} onChange={(event) => update("consultantTitle", event.target.value)} placeholder="Sorumlu emlak danışmanı" aria-label="Danışman sıfatı" />
                {officeFields.map(([key, label]) => <div key={key}><label className="mb-1.5 block text-xs font-semibold text-[#56635f]">{label}</label><Input value={details[key]} onChange={(event) => update(key, event.target.value)} /></div>)}
              </div>
            </section>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={submit} disabled={create.isPending || !contractNo.trim() || !details.ownerName.trim() || !details.propertyAddress.trim()} className="rounded-xl bg-[#173e39] hover:bg-[#20554e]"><Save className="mr-2 h-4 w-4" />{create.isPending ? "Kaydediliyor…" : "Yetki sözleşmesi taslağı oluştur"}</Button>
              {saved && <span className="text-xs font-medium text-[#3f7668]">Taslak kayda gönderildi.</span>}
              {(create.isError || validationMessage) && <span role="alert" className="text-xs text-[#a85745]">{validationMessage || create.error?.message || "Kayıt oluşturulamadı; kayıt numarasını kontrol edin."}</span>}
            </div>
          </CardContent>
        </Card>

        <Card className="authority-print-shell overflow-hidden rounded-2xl border-[#d9e2dc] bg-[#eef3ef]">
          <CardHeader className="flex flex-row items-center justify-between print:hidden">
            <div><CardTitle className="font-serif text-xl">Canlı A4 belge önizlemesi</CardTitle><p className="text-xs text-[#87938f]">Windows offline sürümüyle aynı başlık, tablo, mühür ve imza hiyerarşisi kullanılır.</p></div>
            <FileSignature className="h-5 w-5 text-[#a17b43]" />
          </CardHeader>
          <CardContent className="p-0 print:p-0">
            <AuthorityContractDocument details={details} contractNo={contractNo || "Kayıtta atanacak"} fontSize="11" />
            <p className="m-0 border-t border-[#d9e2dc] bg-white px-4 py-3 text-[11px] text-[#87938f] print:hidden">Seçilen müşteri: {selectedClient?.name ?? "—"} · Seçilen portföy: {selectedProperty?.referenceNo ?? "—"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
