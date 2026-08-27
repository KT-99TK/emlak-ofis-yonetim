import React, { useEffect, useMemo, useState } from "react";
import {
  Calculator,
  FileSignature,
  Printer,
  Save,
  WifiOff,
} from "lucide-react";
import RentalContractDocument from "@/components/RentalContractDocument";
import RentalAppendixDocument, {
  type RentalAppendixKind,
} from "@/components/RentalAppendixDocument";
import RentalFixturesEditor from "@/components/RentalFixturesEditor";
import OfflineOfficeFlowPanel from "@/components/OfflineOfficeFlowPanel";
import DocumentPrintPreview from "@/components/DocumentPrintPreview";
import TurkishDateInput from "@/components/TurkishDateInput";
import UrlaLocationField from "@/components/UrlaLocationField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateRentalSummary,
  createOfflineRentalSnapshot,
  emptyRentalDetails,
  firstPaymentDeadline,
  formatWholeRentalAmount,
  type OfflineRentalDetails,
} from "@/lib/rentalContract";
import {
  canViewFullOfflineContract,
  getOfflineAccessRole,
  getOfflineAssistantAssignedUserIds,
} from "@/lib/offlineContractAccess";
import {
  listOfflineContractLookups,
  searchOfflineContractLookups,
} from "@/lib/offlineContractLookup";
import { isLocalManagerSessionActive } from "@/lib/offlineManagerAccess";
import {
  getUserId,
  listOfflineRecords,
  saveOfflineRecord,
  type OfflineRecord,
} from "@/lib/offlineStore";

const personFields: Array<[keyof OfflineRentalDetails, string]> = [
  ["ownerName", "Kiraya veren adı / unvanı"],
  ["ownerIdentity", "Kiraya veren TCKN / VKN"],
  ["ownerPhone", "Kiraya veren telefonu"],
  ["ownerAddress", "Kiraya veren adresi"],
  ["tenantName", "Kiracı adı / unvanı"],
  ["tenantIdentity", "Kiracı TCKN / VKN"],
  ["tenantPhone", "Kiracı telefonu"],
  ["tenantAddress", "Kiracı adresi"],
];

const appendixOptions: Array<{ kind: RentalAppendixKind; label: string }> = [
  { kind: "evacuation", label: "Tahliye Taahhütnamesi" },
  { kind: "handover", label: "Teslim Etme Formu" },
  { kind: "return", label: "Teslim Alma Formu" },
  { kind: "fixtures", label: "Demirbaş Listesi" },
];

type PrintMode = "package" | "contract" | RentalAppendixKind;

export function PropertyAddressDaskFields({
  propertyAddress,
  daskPolicyNo,
  onChange,
}: {
  propertyAddress: string;
  daskPolicyNo: string;
  onChange: (key: "propertyAddress" | "daskPolicyNo", value: string) => void;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-[#dbe5dd] bg-[#f8fbf8] p-3 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_minmax(220px,0.62fr)]">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
          Taşınmaz açık adresi
        </label>
        <Input
          value={propertyAddress}
          onChange={event => onChange("propertyAddress", event.target.value)}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
          DASK poliçe numarası
        </label>
        <Input
          value={daskPolicyNo}
          onChange={event => onChange("daskPolicyNo", event.target.value)}
          placeholder="DASK poliçe numarasını yazın"
        />
      </div>
    </div>
  );
}

export default function OfflineRentalContracts() {
  const [records, setRecords] = useState<OfflineRecord[]>([]);
  const [details, setDetails] = useState<OfflineRentalDetails>(() =>
    emptyRentalDetails()
  );
  const [contractNo, setContractNo] = useState("");
  const [ownerRecordId, setOwnerRecordId] = useState("");
  const [tenantRecordId, setTenantRecordId] = useState("");
  const [propertyRecordId, setPropertyRecordId] = useState("");
  const [sourceRentalRecordId, setSourceRentalRecordId] = useState("");
  const [rentalSearch, setRentalSearch] = useState("");
  const [fontSize, setFontSize] = useState("10");
  const [printMode, setPrintMode] = useState<PrintMode>("contract");
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [message, setMessage] = useState("");
  const userId = getUserId();
  const contractAccess = {
    userId,
    role: getOfflineAccessRole(),
    managerSessionActive: isLocalManagerSessionActive(),
    assistantAssignedUserIds: getOfflineAssistantAssignedUserIds(),
  } as const;
  const summary = useMemo(() => calculateRentalSummary(details), [details]);
  const people = records.filter(
    record =>
      record.entity === "client" &&
      canViewFullOfflineContract(record, contractAccess)
  );
  const properties = records.filter(
    record =>
      record.entity === "property" &&
      canViewFullOfflineContract(record, contractAccess)
  );
  const rentalSources = useMemo(
    () =>
      listOfflineContractLookups(
        records.filter(
          record =>
            record.entity !== "contract" ||
            canViewFullOfflineContract(record, contractAccess)
        )
      ).filter(row => row.type === "rental"),
    [records, contractAccess]
  );
  const matchingRentalSources = useMemo(
    () => searchOfflineContractLookups(rentalSources, rentalSearch),
    [rentalSources, rentalSearch]
  );
  const selectedAppendixCount = appendixOptions.filter(
    option => details.appendixSelection[option.kind]
  ).length;

  const refresh = async () => setRecords(await listOfflineRecords());
  useEffect(() => {
    void refresh();
  }, []);

  const update = (key: keyof OfflineRentalDetails, value: string | boolean) =>
    setDetails(
      current => ({ ...current, [key]: value }) as OfflineRentalDetails
    );
  const updateMoney = (
    key: "monthlyRent" | "deposit" | "guarantorLimit",
    value: string
  ) => update(key, formatWholeRentalAmount(value));
  const updateAppendix = (kind: RentalAppendixKind, checked: boolean) =>
    setDetails(current => ({
      ...current,
      appendixSelection: { ...current.appendixSelection, [kind]: checked },
    }));
  const selectType = (useType: OfflineRentalDetails["useType"]) =>
    setDetails(current => ({
      ...current,
      useType,
      usagePurpose: useType === "commercial" ? "İşyeri" : "Konut",
    }));
  const printDocument = (mode: PrintMode) => {
    setPrintMode(mode);
    setPrintPreviewOpen(true);
  };
  const printFromPreview = () => {
    setPrintPreviewOpen(false);
    window.setTimeout(() => window.print(), 140);
  };

  const fillPerson = (id: string, kind: "owner" | "tenant") => {
    const record = people.find(item => item.id === id);
    if (!record) return;
    if (kind === "owner")
      setDetails(current => ({
        ...current,
        ownerName: record.title,
        ownerAddress: record.details || current.ownerAddress,
      }));
    else
      setDetails(current => ({
        ...current,
        tenantName: record.title,
        tenantAddress: record.details || current.tenantAddress,
      }));
    if (kind === "owner") setOwnerRecordId(id);
    else setTenantRecordId(id);
  };

  const fillProperty = (id: string) => {
    setPropertyRecordId(id);
    const record = properties.find(item => item.id === id);
    if (record)
      setDetails(current => ({
        ...current,
        propertyAddress: record.details
          ? `${record.title} · ${record.details}`
          : record.title,
      }));
  };

  const copyPreviousRental = (recordId: string) => {
    setSourceRentalRecordId(recordId);
    const source = rentalSources.find(row => row.recordId === recordId);
    if (!source) return;
    const today = new Date().toISOString().slice(0, 10);
    setOwnerRecordId(String(source.snapshot.sourceOwnerRecordId ?? ""));
    setTenantRecordId(String(source.snapshot.sourceTenantRecordId ?? ""));
    setPropertyRecordId(String(source.snapshot.sourcePropertyRecordId ?? ""));
    setDetails({
      ...emptyRentalDetails(),
      ...(source.snapshot as Partial<OfflineRentalDetails>),
      startDate: today,
      firstPaymentDueDate: firstPaymentDeadline(today),
      signedByParties: false,
      signedAt: "",
      ownerApproval: "pending",
    });
    setContractNo("");
    setMessage(
      `${source.contractNo} numaralı önceki kira sözleşmesi yeni taslağa kopyalandı. Yeni kayıt numarasını ve güncel bilgileri kontrol edip kaydedin.`
    );
  };

  const saveDraft = async () => {
    if (!userId.trim()) {
      setMessage(
        "Önce Yerel Çalışma Alanı ekranından offline kullanıcı kodunu kaydedin."
      );
      return;
    }
    if (
      !contractNo.trim() ||
      !details.ownerName.trim() ||
      !details.tenantName.trim() ||
      !details.propertyAddress.trim() ||
      summary.monthlyRent <= 0
    ) {
      setMessage(
        "Kayıt numarası, kiraya veren, kiracı, taşınmaz adresi ve aylık kira tutarı zorunludur."
      );
      return;
    }
    const backOfficeDetails = {
      ...details,
      vatCollection: "separate" as const,
      firstPaymentDueDate: summary.firstDueDate,
    };
    const snapshot = createOfflineRentalSnapshot(
      backOfficeDetails,
      contractNo,
      ownerRecordId || undefined,
      tenantRecordId || undefined,
      propertyRecordId || undefined
    );
    const common = `Kira sözleşmesi ${contractNo.trim()}`;
    await saveOfflineRecord({
      entity: "contract",
      title: `${details.useType === "commercial" ? "İŞYERİ" : "KONUT"} KİRA SÖZLEŞMESİ — ${details.tenantName}`,
      details: JSON.stringify(snapshot),
      amount: details.monthlyRent,
      dueDate: summary.endDate,
      noticeDate: summary.noticeDate,
      noticeDays: summary.noticeDays,
      approvalDecision: details.ownerApproval,
      status: details.signedByParties ? "signed" : "draft",
    });
    await saveOfflineRecord({
      entity: "obligation",
      title: `İlk kira vadesi — ${common}`,
      details: JSON.stringify({
        schema: "global1881-offline-rent-obligation-v2",
        contractNo: contractNo.trim(),
        recurring: "monthly",
        firstDueDate: summary.firstDueDate,
        paymentDay: summary.paymentDay,
        tenant: details.tenantName,
      }),
      amount: details.monthlyRent,
      dueDate: summary.firstDueDate,
      obligationType: "rent",
      status: "planned",
    });
    if (summary.monthlyRent > 0 && details.deposit.trim())
      await saveOfflineRecord({
        entity: "ledger",
        title: `Depozito alacağı — ${common}`,
        details: JSON.stringify({
          schema: "global1881-offline-deposit-v1",
          contractNo: contractNo.trim(),
          owner: details.ownerName,
          tenant: details.tenantName,
        }),
        amount: details.deposit,
        dueDate: details.startDate,
        ledgerType: "receivable",
        status: "planned",
      });
    await saveOfflineRecord({
      entity: "evacuation",
      title: `Tahliye / sözleşme sonu — ${common}`,
      details: JSON.stringify({
        schema: "global1881-offline-evacuation-v1",
        contractNo: contractNo.trim(),
        endDate: summary.endDate,
      }),
      dueDate: summary.endDate,
      noticeDate: summary.noticeDate,
      noticeDays: summary.noticeDays,
      status: "planned",
    });
    await saveOfflineRecord({
      entity: "ownerApproval",
      title: `Mülk sahibi onayı — ${common}`,
      details: JSON.stringify({
        schema: "global1881-offline-owner-approval-v1",
        contractNo: contractNo.trim(),
      }),
      approvalDecision: details.ownerApproval,
      status:
        details.ownerApproval === "approved" ? "approved" : "approvalPending",
    });
    setMessage(
      details.signedByParties
        ? "İmzalı kira sözleşmesi, ilk vade, depozito, tahliye ve owner approval kayıtları yerel veritabanına yazıldı. Kiracı hizmet bedeli/KDV dosyası yalnız back-office İşlem Kapanışları ekranında açılabilir."
        : "Kira sözleşmesi taslağı kaydedildi. Taraflar imzaladığında back-office imza teyidini işaretleyip yeniden kaydedin."
    );
    setContractNo("");
    await refresh();
  };

  const annualRent = new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0,
  }).format(summary.annualRent);

  return (
    <div className="offline-rental-contract-workspace min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]">
            <WifiOff className="h-3.5 w-3.5" /> Offline sözleşme çalışma alanı
          </p>
          <h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">
            Kira Sözleşmeleri
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#70807c]">
            Konut veya işyeri türünü seçin; tam koşul metni, teslim/demirbaş eki
            ve imza alanları formun altında A4 belge olarak güncellenir.
          </p>
        </div>
        <Button
          onClick={() => printDocument("package")}
          variant="outline"
          className="rounded-xl bg-white"
        >
          <Printer className="mr-2 h-4 w-4" /> Sözleşme + seçili ekler
        </Button>
      </header>
      <section className="mx-auto mb-6 max-w-[1440px] rounded-2xl border border-[#e7dfc9] bg-[#fffaf0] px-4 py-3 print:hidden">
        <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
          <div>
            <h2 className="font-serif text-lg text-[#34433f]">
              Tahliye Taahhütnamesi
            </h2>
            <p className="mt-1 text-xs text-[#7f7154]">
              Kiraya veren, kiracı, açık adres ve kira başlangıcı sözleşmeden
              gelir. Taahhüt edilen tahliye tarihi sözleşme bitişinden otomatik
              alınmaz.
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
              Taahhüt edilen tahliye tarihi
            </label>
            <TurkishDateInput
              value={details.evacuationCommitmentDate ?? ""}
              onValueChange={value => update("evacuationCommitmentDate", value)}
              aria-label="Taahhüt edilen tahliye tarihi"
            />
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[1440px] space-y-6">
        <div className="offline-operation-grid print:block">
          <div className="offline-operation-main">
            <Card className="rounded-2xl border-[#e5e8e3] bg-white/85 print:hidden">
              <CardHeader>
                <CardTitle className="font-serif text-xl">
                  Doldurulabilir kira sözleşmesi bilgileri
                </CardTitle>
                <p className="text-xs text-[#87938f]">
                  Kira, depozito ve kefalet tutarları kuruşsuz girilir; binlik
                  ayırıcı yazarken otomatik uygulanır.
                </p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                      Kiralama türü
                    </label>
                    <Select
                      value={details.useType}
                      onValueChange={value =>
                        selectType(value as OfflineRentalDetails["useType"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">
                          Konut Kira Sözleşmesi
                        </SelectItem>
                        <SelectItem value="commercial">
                          İşyeri Kira Sözleşmesi
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                      Kayıt numarası
                    </label>
                    <Input
                      value={contractNo}
                      onChange={event => setContractNo(event.target.value)}
                      placeholder="KIR-OF-2026-001"
                    />
                  </div>
                </div>
                <section className="rounded-xl border border-[#dbe5dd] bg-[#f8fbf8] p-4">
                  <h2 className="text-sm font-semibold text-[#34433f]">
                    Önceki kira sözleşmesini çağır
                  </h2>
                  <p className="mt-1 text-xs text-[#6f7a75]">
                    Konut veya işyeri türünü seçtikten sonra sözleşme numarası
                    ya da kiracı/malik adı–soyadıyla arayın. Seçilen kayıt
                    değiştirilmez; bilgiler yeni taslağa kopyalanır.
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1.35fr]">
                    <Input
                      value={rentalSearch}
                      onChange={event => setRentalSearch(event.target.value)}
                      placeholder="Sözleşme no veya müşteri adı soyadı ile ara"
                    />
                    <Select
                      value={sourceRentalRecordId}
                      onValueChange={copyPreviousRental}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            rentalSources.length
                              ? "Önceki kira sözleşmesini seçin"
                              : "Bu cihazda önceki kira sözleşmesi yok"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {matchingRentalSources.map(source => (
                          <SelectItem
                            key={source.recordId}
                            value={source.recordId}
                          >
                            {source.contractNo} ·{" "}
                            {source.customerNames.join(" / ") ||
                              "Müşteri belirtilmemiş"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {rentalSearch && !matchingRentalSources.length && (
                    <p className="mt-2 text-xs text-[#a85745]">
                      Bu numara veya müşteri adıyla eşleşen kira sözleşmesi
                      bulunamadı.
                    </p>
                  )}
                </section>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                      Kiraya veren kaydı
                    </label>
                    <Select
                      value={ownerRecordId}
                      onValueChange={id => fillPerson(id, "owner")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Malik seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {people.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                      Kiracı kaydı
                    </label>
                    <Select
                      value={tenantRecordId}
                      onValueChange={id => fillPerson(id, "tenant")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kiracı seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {people.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                      Portföy kaydı
                    </label>
                    <Select
                      value={propertyRecordId}
                      onValueChange={fillProperty}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Mülk seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <section>
                  <h2 className="mb-3 text-sm font-semibold text-[#34433f]">
                    Taraflar
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {personFields.map(([key, label]) => (
                      <div
                        key={key}
                        className={
                          key === "ownerAddress" || key === "tenantAddress"
                            ? "sm:col-span-2"
                            : ""
                        }
                      >
                        <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                          {label}
                        </label>
                        <Input
                          value={details[key] as string}
                          onChange={event => update(key, event.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h2 className="mb-3 text-sm font-semibold text-[#34433f]">
                    Taşınmaz, teslim ve demirbaş bilgileri
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <UrlaLocationField
                      className="sm:col-span-2"
                      value={details.propertyNeighborhood}
                      onChange={value => update("propertyNeighborhood", value)}
                      label="Taşınmaz mahallesi / yerleşimi"
                    />
                    <PropertyAddressDaskFields
                      propertyAddress={details.propertyAddress}
                      daskPolicyNo={details.daskPolicyNo}
                      onChange={update}
                    />
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Nitelik / cins
                      </label>
                      <Input
                        value={details.propertyType}
                        onChange={event =>
                          update("propertyType", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Ada / parsel / bağımsız bölüm
                      </label>
                      <Input
                        value={details.parcelInfo}
                        onChange={event =>
                          update("parcelInfo", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Elektrik sayaç numarası
                      </label>
                      <Input
                        value={details.electricityMeterNo}
                        onChange={event =>
                          update("electricityMeterNo", event.target.value)
                        }
                        placeholder="Elektrik sayaç no"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Su sayaç numarası
                      </label>
                      <Input
                        value={details.waterMeterNo}
                        onChange={event =>
                          update("waterMeterNo", event.target.value)
                        }
                        placeholder="Su sayaç no"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Doğalgaz sayaç numarası
                      </label>
                      <Input
                        value={details.naturalGasMeterNo}
                        onChange={event =>
                          update("naturalGasMeterNo", event.target.value)
                        }
                        placeholder="Doğalgaz sayaç no"
                      />
                    </div>
                    <RentalFixturesEditor
                      details={details}
                      onChange={setDetails}
                    />
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Diğer sayaç / abonelik teslim notları
                      </label>
                      <Textarea
                        value={details.meterNotes}
                        onChange={event =>
                          update("meterNotes", event.target.value)
                        }
                        placeholder="Teslim endeksleri, abonelik veya diğer teslim notları"
                      />
                    </div>
                  </div>
                </section>
                <section>
                  <h2 className="mb-3 text-sm font-semibold text-[#34433f]">
                    Bedel, süre, kullanım ve onay
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Aylık kira (₺)
                      </label>
                      <Input
                        inputMode="numeric"
                        value={details.monthlyRent}
                        onChange={event =>
                          updateMoney("monthlyRent", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Depozito (₺)
                      </label>
                      <Input
                        inputMode="numeric"
                        value={details.deposit}
                        onChange={event =>
                          updateMoney("deposit", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Ödeme günü (sonraki aylar)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="28"
                        value={details.paymentDay}
                        onChange={event =>
                          update("paymentDay", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        IBAN
                      </label>
                      <Input
                        value={details.iban}
                        onChange={event => update("iban", event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Sözleşme / başlangıç tarihi
                      </label>
                      <TurkishDateInput
                        value={details.startDate}
                        onValueChange={value =>
                          setDetails(current => ({
                            ...current,
                            startDate: value,
                            firstPaymentDueDate: firstPaymentDeadline(value),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        İlk kira son ödeme tarihi{" "}
                        <span className="text-[#a85745]">(en geç 5 gün)</span>
                      </label>
                      <TurkishDateInput
                        value={summary.firstDueDate}
                        onValueChange={value =>
                          update("firstPaymentDueDate", value)
                        }
                      />
                      <p className="mt-1 text-[11px] text-[#718079]">
                        En geç: {summary.maxFirstPaymentDate}
                      </p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Süre (ay)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="120"
                        value={details.durationMonths}
                        onChange={event =>
                          update("durationMonths", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Tahliye ihbarı (gün)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={details.noticeDays}
                        onChange={event =>
                          update("noticeDays", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Mülk sahibi onayı
                      </label>
                      <Select
                        value={details.ownerApproval}
                        onValueChange={value =>
                          update(
                            "ownerApproval",
                            value as "pending" | "approved"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Onay bekliyor</SelectItem>
                          <SelectItem value="approved">Onaylandı</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Kullanım amacı
                      </label>
                      <Input
                        value={details.usagePurpose}
                        onChange={event =>
                          update("usagePurpose", event.target.value)
                        }
                      />
                    </div>
                    {details.useType === "residential" ? (
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                          İkamet edecek kişi sayısı
                        </label>
                        <Input
                          value={details.residentsCount}
                          onChange={event =>
                            update("residentsCount", event.target.value)
                          }
                          placeholder="Boş bırakılabilir"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                          KDV durumu
                        </label>
                        <Select
                          value={details.kdvIncluded ? "included" : "excluded"}
                          onValueChange={value =>
                            update("kdvIncluded", value === "included")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="included">KDV dâhil</SelectItem>
                            <SelectItem value="excluded">KDV hariç</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Yetkili mahkeme ilçesi
                      </label>
                      <Input
                        value={details.courtCity}
                        onChange={event =>
                          update("courtCity", event.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                        Düzenleme yeri
                      </label>
                      <Input
                        value={details.documentPlace}
                        onChange={event =>
                          update("documentPlace", event.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>
                <section>
                  <h2 className="mb-3 text-sm font-semibold text-[#34433f]">
                    Kefil, danışman ve ofis
                  </h2>
                  <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-lg border border-[#dbe5dd] bg-[#f8fbf8] px-3 py-2 text-sm font-medium text-[#34433f]">
                    <input
                      type="checkbox"
                      checked={details.hasGuarantor}
                      onChange={event =>
                        setDetails(current =>
                          event.target.checked
                            ? { ...current, hasGuarantor: true }
                            : {
                                ...current,
                                hasGuarantor: false,
                                guarantorName: "",
                                guarantorIdentity: "",
                                guarantorLimit: "",
                              }
                        )
                      }
                    />{" "}
                    Kefil var
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {details.hasGuarantor && (
                      <>
                        <Input
                          value={details.guarantorName}
                          onChange={event =>
                            update("guarantorName", event.target.value)
                          }
                          placeholder="Kefil adı soyadı"
                        />
                        <Input
                          value={details.guarantorIdentity}
                          onChange={event =>
                            update("guarantorIdentity", event.target.value)
                          }
                          placeholder="Kefil TCKN"
                        />
                        <Input
                          inputMode="numeric"
                          value={details.guarantorLimit}
                          onChange={event =>
                            updateMoney("guarantorLimit", event.target.value)
                          }
                          placeholder="Kefil azami tutarı (₺)"
                        />
                      </>
                    )}
                    <Input
                      value={details.consultantName}
                      onChange={event =>
                        update("consultantName", event.target.value)
                      }
                      placeholder="Danışman adı soyadı"
                    />
                    <Input
                      value={details.consultantCode}
                      onChange={event =>
                        update("consultantCode", event.target.value)
                      }
                      placeholder="Yetki / personel kodu"
                    />
                    <Input
                      value={details.officeName}
                      onChange={event =>
                        update("officeName", event.target.value)
                      }
                      placeholder="Ofis unvanı"
                    />
                    <Input
                      value={details.officeAuthorizationNo}
                      onChange={event =>
                        update("officeAuthorizationNo", event.target.value)
                      }
                      placeholder="Ofis yetki belgesi no"
                    />
                  </div>
                  <div className="mt-4 rounded-xl border border-[#dbe8df] bg-[#f4fbf6] p-3">
                    <label className="flex cursor-pointer items-start gap-2 text-sm font-semibold text-[#34433f]">
                      <input
                        className="mt-0.5"
                        type="checkbox"
                        checked={details.signedByParties}
                        onChange={event =>
                          setDetails(current => ({
                            ...current,
                            signedByParties: event.target.checked,
                            signedAt: event.target.checked
                              ? current.signedAt || current.startDate
                              : "",
                          }))
                        }
                      />{" "}
                      <span>
                        Taraflar kira sözleşmesini imzaladı{" "}
                        <small className="mt-1 block font-normal text-[#60706b]">
                          Yalnız back-office imza teyididir; kira sözleşmesi
                          veya müşteriye verilen eklerde görünmez. Teyit olmadan
                          İşlem Kapanışları’nda kiracı hizmet bedeli/KDV dosyası
                          açılamaz.
                        </small>
                      </span>
                    </label>
                    {details.signedByParties && (
                      <div className="mt-3 max-w-[240px]">
                        <label className="mb-1.5 block text-xs font-semibold text-[#56635f]">
                          İmza teyit tarihi
                        </label>
                        <TurkishDateInput
                          value={details.signedAt}
                          onValueChange={value => update("signedAt", value)}
                        />
                      </div>
                    )}
                  </div>
                </section>
                <div className="rounded-xl border border-[#e7dfc9] bg-[#fffaf0] p-3 text-xs text-[#8d6f3f]">
                  <div className="flex items-center gap-2 font-semibold">
                    <Calculator className="h-4 w-4" /> Otomatik özet
                  </div>
                  <p className="mt-1">
                    Yıllık kira: {annualRent} ₺ · İlk vade:{" "}
                    {summary.firstDueDate} (en geç 5 gün) · Bitiş:{" "}
                    {summary.endDate} · Tahliye uyarısı: {summary.noticeDate}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => void saveDraft()}
                    className="flex-1 rounded-xl bg-[#173e39] text-white hover:bg-[#20554e] hover:text-white [&_svg]:text-white"
                  >
                    <Save className="mr-2 h-4 w-4" /> Yerel kira sözleşmesi ve
                    vade kayıtlarını kaydet
                  </Button>
                  {details.signedByParties && (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl bg-white"
                      onClick={() => {
                        window.location.hash = "/offline-active-documents";
                      }}
                    >
                      İmzalı PDF dosyasına git
                    </Button>
                  )}
                </div>
                {message && (
                  <p
                    role="status"
                    className="rounded-lg bg-[#f5fbf8] px-3 py-2 text-xs text-[#2b786e]"
                  >
                    {message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          <OfflineOfficeFlowPanel
            className="offline-operation-aside print:hidden"
            records={records}
            userId={userId}
          />
        </div>

        <Card
          className={`authority-print-shell rental-print-${printMode} rental-package-${details.appendixSelection.evacuation ? "include" : "omit"}-evacuation rental-package-${details.appendixSelection.handover ? "include" : "omit"}-handover rental-package-${details.appendixSelection.return ? "include" : "omit"}-return rental-package-${details.appendixSelection.fixtures ? "include" : "omit"}-fixtures overflow-hidden rounded-2xl border-[#d9e2dc] bg-[#eef3ef]`}
        >
          <CardHeader className="print:hidden">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-serif text-xl">
                    Kira Sözleşmesi ve Ekleri
                  </CardTitle>
                  <p className="text-xs text-[#87938f]">
                    Paket için ekleri işaretleyin; isterseniz her belgeyi tek
                    başına da yazdırabilirsiniz.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-[#56635f]">
                    Punto
                  </label>
                  <Select value={fontSize} onValueChange={setFontSize}>
                    <SelectTrigger className="w-[94px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9 punto</SelectItem>
                      <SelectItem value="10">10 punto</SelectItem>
                      <SelectItem value="11">11 punto</SelectItem>
                      <SelectItem value="12">12 punto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FileSignature className="h-5 w-5 text-[#a17b43]" />
                </div>
              </div>
              <div className="rounded-xl border border-[#dbe5dd] bg-[#f8fbf8] p-3">
                <p className="mb-2 text-xs font-semibold text-[#34433f]">
                  Sözleşme paketine dahil edilecek ekler
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {appendixOptions.map(option => (
                    <label
                      key={option.kind}
                      className="flex cursor-pointer items-center gap-2 text-sm text-[#34433f]"
                    >
                      <input
                        type="checkbox"
                        checked={details.appendixSelection[option.kind]}
                        onChange={event =>
                          updateAppendix(option.kind, event.target.checked)
                        }
                      />{" "}
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => printDocument("package")}
                  disabled={selectedAppendixCount === 0}
                >
                  <Printer className="mr-1 h-3.5 w-3.5" /> Sözleşme + seçili
                  ekler ({selectedAppendixCount})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => printDocument("contract")}
                >
                  <Printer className="mr-1 h-3.5 w-3.5" /> Ana sözleşme
                </Button>
                {appendixOptions.map(option => (
                  <Button
                    key={option.kind}
                    size="sm"
                    variant="outline"
                    onClick={() => printDocument(option.kind)}
                  >
                    <Printer className="mr-1 h-3.5 w-3.5" /> {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 print:p-0">
            <RentalContractDocument
              details={details}
              contractNo={contractNo || "Kayıtta atanacak"}
              fontSize={fontSize}
            />
            {selectedAppendixCount > 0 && (
              <div className="rental-selected-appendices-heading print:hidden">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8d6f3f]">
                  Seçili ek önizlemeleri
                </p>
                <p className="mt-1 text-sm text-[#52635e]">
                  İşaretlediğiniz ekler ana sözleşmenin altında sırasıyla
                  görünür.
                </p>
              </div>
            )}
            {appendixOptions.map(option => (
              <RentalAppendixDocument
                key={option.kind}
                kind={option.kind}
                details={details}
                contractNo={contractNo || "Kayıtta atanacak"}
                fontSize={fontSize}
                screenVisible={details.appendixSelection[option.kind]}
              />
            ))}
          </CardContent>
        </Card>
      </div>
      <DocumentPrintPreview
        open={printPreviewOpen}
        onOpenChange={setPrintPreviewOpen}
        title={
          printMode === "package"
            ? "Kira sözleşmesi ve seçili ekleri"
            : printMode === "contract"
              ? "Kira sözleşmesi"
              : (appendixOptions.find(option => option.kind === printMode)
                  ?.label ?? "Kira belgesi")
        }
        subtitle="Belge sistem yazdırma penceresine gönderilmeden önce burada gerçek A4 oranında incelenir."
        onPrint={printFromPreview}
      >
        <RentalContractDocument
          details={details}
          contractNo={contractNo || "Kayıtta atanacak"}
          fontSize={fontSize}
        />
        {appendixOptions.map(option => (
          <RentalAppendixDocument
            key={`preview-${option.kind}`}
            kind={option.kind}
            details={details}
            contractNo={contractNo || "Kayıtta atanacak"}
            fontSize={fontSize}
            screenVisible={
              printMode === "package"
                ? details.appendixSelection[option.kind]
                : printMode === option.kind
            }
          />
        ))}
      </DocumentPrintPreview>
    </div>
  );
}
