import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  LoaderCircle,
  Printer,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import DocumentPrintPreview from "@/components/DocumentPrintPreview";
import writeXlsxFile from "write-excel-file/browser";
import {
  estimateRentalIncomeTax2026,
  type RentalExpenseMethod,
} from "@/lib/rentalIncomeTaxEstimate";

const TEMPLATE_URL =
  "/manus-storage/Global1881-Aktif-Kiralamalar-Aktarim-Sablonu_80505521.xlsx";

type ParsedRentalRow = {
  clientName: string;
  clientPhone: string;
  tenantName: string;
  tenantPhone: string;
  contractDate: Date;
  rentIncreaseDate?: Date;
  evictionDate?: Date;
  monthlyRent: string;
  neighborhood: string;
  propertyLocation: string;
  unitInfo: string;
  authorityCode?: string;
  consultantCode: string;
  assignedUserId: number;
};
type ParsedWorkbook = {
  rows: ParsedRentalRow[];
  errors: string[];
  fileName: string;
};
type TaxInput = {
  ownershipSharePercent: string;
  residentialExemptionEligible: boolean;
  expenseMethod: RentalExpenseMethod;
  actualExpenseTotal: string;
};
const TAX_YEAR = 2026;
const defaultTaxInput = (): TaxInput => ({
  ownershipSharePercent: "100",
  residentialExemptionEligible: false,
  expenseMethod: "lump_sum",
  actualExpenseTotal: "0",
});

function clean(value: unknown) {
  return String(value ?? "").trim();
}
function header(value: unknown) {
  return clean(value).replace(/\s+/g, " ").toLocaleLowerCase("tr-TR");
}
function key(value: string) {
  return value.toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
}
function importRowKey(row: {
  clientName: string;
  tenantName: string;
  contractDate: Date | string;
  propertyLocation: string;
  unitInfo: string;
  authorityCode?: string | null;
  assignedUserId: number;
}) {
  const contractDate = row.contractDate instanceof Date
    ? row.contractDate.toISOString().slice(0, 10)
    : String(row.contractDate).slice(0, 10);
  return [
    key(row.clientName),
    key(row.tenantName),
    contractDate,
    key(row.propertyLocation),
    key(row.unitInfo),
    key(row.authorityCode ?? ""),
    row.assignedUserId,
  ].join("|");
}
function emptyRow(row: unknown[]) {
  return row.every(cell => !clean(cell));
}
function parseDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number") {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    epoch.setUTCDate(epoch.getUTCDate() + value);
    return new Date(epoch.getUTCFullYear(), epoch.getUTCMonth(), epoch.getUTCDate());
  }
  const raw = clean(value);
  const match = raw.match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
  if (match)
    return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseMoney(value: unknown) {
  if (typeof value === "number")
    return Number.isFinite(value) && value > 0 ? value : undefined;
  const raw = clean(value).replace(/[₺\s]/g, "");
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

export async function parseActiveRentalWorkbook(
  file: File,
  consultants: Array<{ userId: number; consultantCode: string | null }>,
  codeAliases: Record<string, string> = {}
): Promise<ParsedWorkbook> {
  const { default: readXlsxFile } = await import("read-excel-file/browser");
  const sheets = await readXlsxFile(file);
  const selectedSheet = sheets.find(sheet => sheet.sheet === "Aktif Kiralamalar") ?? sheets[0];
  const grid = (selectedSheet?.data ?? []) as unknown[][];
  if (!selectedSheet || !grid.length)
    return {
      rows: [],
      errors: ["Aktif Kiralamalar sayfası bulunamadı veya boş."],
      fileName: file.name,
    };
  const headers = (grid[0] ?? []).map(header);
  const at = (...names: string[]) =>
    headers.findIndex(value => names.includes(value));
  const indexes = {
    clientName: at("müşteri / malik adı"),
    clientPhone: at("müşteri / malik telefonu", "malik telefonu"),
    tenantName: at("kiracı adı"),
    tenantPhone: at("kiracı telefonu"),
    contractDate: at("sözleşme tarihi"),
    rentIncreaseDate: at(
      "kira artış tarihi (boşsa sözleşme tarihi)",
      "kira artış tarihi"
    ),
    evictionDate: at("tahliye tarihi (opsiyonel)", "tahliye tarihi"),
    monthlyRent: at("güncel aylık kira (tl)", "güncel aylık kira"),
    neighborhood: at("mahalle"),
    propertyLocation: at(
      "taşınmaz konumu",
      "konum",
      "konum bilgisi",
      "taşınmaz kısa tanımı"
    ),
    unitInfo: at(
      "daire bilgisi",
      "daire / bağımsız bölüm",
      "daire",
      "bağımsız bölüm"
    ),
    authorityCode: at("yetki kodu", "yetki sözleşmesi kodu"),
    consultantCode: at("danışman kodu"),
  };
  const compact =
    indexes.clientName === 0 &&
    indexes.clientPhone === 2 &&
    indexes.tenantName === 3 &&
    indexes.tenantPhone === 4 &&
    indexes.contractDate === 5 &&
    indexes.monthlyRent === 7 &&
    indexes.neighborhood === 8 &&
    (indexes.propertyLocation === 1 || indexes.propertyLocation < 0);
  if (!compact && Object.values(indexes).some(value => value < 0))
    return {
      rows: [],
      errors: [
        "Excel başlıklarında zorunlu alan eksik. Güncel Global 1881 şablonunu kullanın.",
      ],
      fileName: file.name,
    };
  const compactIndex: Record<string, number> = {
    clientName: 0,
    propertyLocation: 1,
    clientPhone: 2,
    tenantName: 3,
    tenantPhone: 4,
    contractDate: 5,
    rentIncreaseDate: 6,
    monthlyRent: 7,
    neighborhood: 8,
    consultantCode: indexes.consultantCode >= 0 ? indexes.consultantCode : 9,
  };
  const consultantByCode = new Map(
    consultants
      .filter(item => item.consultantCode)
      .map(item => [key(item.consultantCode!), item.userId])
  );
  const rows: ParsedRentalRow[] = [];
  const errors: string[] = [];
  const identities = new Set<string>();
  grid.slice(1).forEach((source, offset) => {
    if (emptyRow(source as unknown[])) return;
    const rowNo = offset + 2;
    const index = (field: keyof typeof indexes) =>
      compact ? compactIndex[field] : indexes[field];
    const value = (field: keyof typeof indexes) => {
      const position = index(field);
      return position >= 0 ? clean(source[position]) : "";
    };
    const rawClientName = value("clientName");
    const clientName = compact
      ? rawClientName.split(/\s*-\s*/)[0].trim()
      : rawClientName;
    const clientPhone = value("clientPhone");
    const tenantName = value("tenantName");
    const tenantPhone = value("tenantPhone");
    const contractDate = parseDate(source[index("contractDate")]);
    const rentIncreaseText = value("rentIncreaseDate");
    const evictionText = value("evictionDate");
    const rentIncreaseDate = rentIncreaseText
      ? parseDate(source[index("rentIncreaseDate")])
      : undefined;
    const evictionDate = evictionText
      ? parseDate(source[index("evictionDate")])
      : undefined;
    const monthlyRent = parseMoney(source[index("monthlyRent")]);
    const neighborhood = value("neighborhood");
    const propertyLocation = value("propertyLocation");
    const unitInfo = compact
      ? indexes.unitInfo >= 0
        ? clean(source[indexes.unitInfo]) || "—"
        : "—"
      : value("unitInfo");
    const sourceConsultantCode = value("consultantCode");
    const consultantCode =
      codeAliases[key(sourceConsultantCode)] ?? sourceConsultantCode;
    const assignedUserId = consultantByCode.get(key(consultantCode));
    const issues = [
      !clientName && "müşteri/malik",
      !clientPhone && "müşteri/malik telefonu",
      !tenantName && "kiracı",
      !tenantPhone && "kiracı telefonu",
      !contractDate && "sözleşme tarihi",
      !monthlyRent && "güncel kira",
      !neighborhood && "mahalle",
      !propertyLocation && "taşınmaz konumu/kısa tanımı",
      !consultantCode && "danışman kodu",
      consultantCode && !assignedUserId && "tanımsız danışman kodu",
      !compact && !unitInfo && "daire bilgisi",
    ]
      .filter(Boolean)
      .join(", ");
    if (issues) {
      errors.push(`${rowNo}. satır: ${issues} alanını kontrol edin.`);
      return;
    }
    if (
      (rentIncreaseText && !rentIncreaseDate) ||
      (evictionText && !evictionDate)
    ) {
      errors.push(`${rowNo}. satır: tarih alanı geçerli değil.`);
      return;
    }
    const identity = `${key(clientName)}|${assignedUserId}|${key(propertyLocation)}|${key(unitInfo)}`;
    if (identities.has(identity)) {
      errors.push(
        `${rowNo}. satır: aynı malik, danışman, taşınmaz ve daire bilgisi için mükerrer kayıt var.`
      );
      return;
    }
    identities.add(identity);
    rows.push({
      clientName,
      clientPhone,
      tenantName,
      tenantPhone,
      contractDate: contractDate!,
      rentIncreaseDate,
      evictionDate,
      monthlyRent: monthlyRent!.toFixed(2),
      neighborhood,
      propertyLocation,
      unitInfo,
      authorityCode: value("authorityCode") || undefined,
      consultantCode: consultantCode.toUpperCase(),
      assignedUserId: assignedUserId!,
    });
  });
  return { rows, errors, fileName: file.name };
}

function money(value: number | string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(Number(value));
}
function dateText(value: Date | string | null | undefined) {
  return value
    ? new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(value))
    : "—";
}
function taskLabel(type: string) {
  return type === "rentIncrease"
    ? "Kira artışı"
    : type === "eviction"
      ? "Açık tahliye bildirimi"
      : type === "ownerLeaseReview"
        ? "Malik kontrolü · kira dönemi"
        : type === "relettingPreparation"
          ? "Yeniden kiralama hazırlığı"
          : type === "propertyTaxFirstInstallment"
            ? "Emlak vergisi · 1. taksit için arama"
            : type === "propertyTaxSecondInstallment"
              ? "Emlak vergisi · 2. taksit için arama"
              : "Kira geliri vergi dönemi";
}
function taskPurpose(type: string) {
  return type === "ownerLeaseReview"
    ? "Kira dönemi sonu tahliye anlamına gelmez. Malik, kiracıdan ayrılma isteği gelip gelmediği konusunda aranır."
    : type === "relettingPreparation"
      ? "Malikten gelen ayrılma bilgisi sonrası ilan ve yeniden kiralama hazırlığı için iç görevdir; otomatik ilan açılmaz."
      : type === "propertyTaxFirstInstallment" ||
          type === "propertyTaxSecondInstallment"
        ? "Belediye kaynağıyla son ödeme gününü teyit edin; malik araması vade gününden 15 gün önce planlanır."
        : type === "rentalIncomeTaxDeclaration"
          ? "Malik bazında kümülatif kira geliri ön bilgisi için hazırlıktır; resmî beyan veya tahakkuk değildir."
          : "Danışmanın kişisel ve kontrollü müşteri bilgilendirmesi için iç görevdir.";
}
function taskStatus(status: string) {
  return status === "planned"
    ? "Hazırlık bekliyor"
    : status === "prepared"
      ? "Manager gözden geçirmesi"
      : status === "reviewed"
        ? "Paylaşım için hazır"
        : status === "shared"
          ? "Paylaşım kaydı var"
          : "Tamamlandı";
}

export function getActiveRentalAdvisorDistribution(
  items: Array<{ consultantCode: string | null }>
) {
  const counts = new Map<string, number>();
  items.forEach(item => {
    const code = item.consultantCode?.trim().toUpperCase() || "KOD BEKLİYOR";
    counts.set(code, (counts.get(code) ?? 0) + 1);
  });
  return Array.from(counts, ([consultantCode, count]) => ({
    consultantCode,
    count,
  })).sort(
    (left, right) =>
      right.count - left.count ||
      left.consultantCode.localeCompare(right.consultantCode, "tr-TR")
  );
}

export default function ActiveRentalSummaries() {
  const { user } = useAuth();
  const isManager = user?.role === "admin";
  const utils = trpc.useUtils();
  const team = trpc.team.list.useQuery(undefined, { enabled: isManager });
  const summaries = trpc.activeRentals.list.useQuery();
  const tasks = trpc.activeRentals.serviceTasks.list.useQuery();
  const taxProfiles = trpc.activeRentals.rentalIncomeTaxProfiles.list.useQuery({
    taxYear: TAX_YEAR,
  });
  const [parsed, setParsed] = useState<ParsedWorkbook | null>(null);
  const [message, setMessage] = useState("");
  const [taxInputs, setTaxInputs] = useState<Record<number, TaxInput>>({});
  const [taskNotes, setTaskNotes] = useState<Record<number, string>>({});
  const [ownerExitConfirmed, setOwnerExitConfirmed] = useState<
    Record<number, boolean>
  >({});
  const [revealSummaryId, setRevealSummaryId] = useState<number | null>(null);
  const [revealReason, setRevealReason] = useState("");
  const [revealedPhones, setRevealedPhones] = useState<{
    summaryId: number;
    clientPhone: string | null;
    tenantPhone: string | null;
  } | null>(null);
  const invalidateTasks = () =>
    void utils.activeRentals.serviceTasks.list.invalidate();
  const importMutation = trpc.activeRentals.importSummaries.useMutation({
    onSuccess: result => {
      setParsed(null);
      setMessage(
        `${result.imported} aktif kira özeti ve ${result.createdClients} yeni müşteri kartı aktarıldı.`
      );
      void utils.activeRentals.list.invalidate();
    },
    onError: error => setMessage(error.message),
  });
  const revealSensitiveMutation = trpc.activeRentals.revealSensitive.useMutation({
    onSuccess: (result, input) => {
      setRevealedPhones({
        summaryId: input.summaryId,
        clientPhone: result.clientPhone,
        tenantPhone: result.tenantPhone,
      });
      setRevealSummaryId(null);
      setRevealReason("");
    },
  });
  useEffect(() => {
    if (!revealedPhones) return;
    const timer = window.setTimeout(() => setRevealedPhones(null), 30_000);
    return () => window.clearTimeout(timer);
  }, [revealedPhones]);
  const refreshMutation = trpc.activeRentals.serviceTasks.refresh.useMutation({
    onSuccess: result => {
      setMessage(
        `${result.created} yeni hizmet görevi oluşturuldu; dış iletişim gönderilmedi.`
      );
      invalidateTasks();
    },
    onError: error => setMessage(error.message),
  });
  const prepareMutation = trpc.activeRentals.serviceTasks.prepare.useMutation({
    onSuccess: () => {
      setMessage(
        "Görev hazırlığı kaydedildi; broker manager gözden geçirmesi bekleniyor."
      );
      invalidateTasks();
    },
    onError: error => setMessage(error.message),
  });
  const reviewMutation = trpc.activeRentals.serviceTasks.review.useMutation({
    onSuccess: () => {
      setMessage("Görev broker manager tarafından gözden geçirildi.");
      invalidateTasks();
    },
    onError: error => setMessage(error.message),
  });
  const shareMutation = trpc.activeRentals.serviceTasks.markShared.useMutation({
    onSuccess: () => {
      setMessage(
        "Manuel iletişim/paylaşım kaydı eklendi; sistem otomatik mesaj göndermedi."
      );
      invalidateTasks();
    },
    onError: error => setMessage(error.message),
  });
  const startRelettingMutation =
    trpc.activeRentals.serviceTasks.startReletting.useMutation({
      onSuccess: result => {
        setMessage(
          result.created
            ? "Yeniden kiralama hazırlığı oluşturuldu; otomatik ilan veya mesaj gönderilmedi."
            : "Bu malik kontrolü için yeniden kiralama hazırlığı zaten açık."
        );
        invalidateTasks();
      },
      onError: error => setMessage(error.message),
    });
  const saveTaxProfileMutation =
    trpc.activeRentals.rentalIncomeTaxProfiles.save.useMutation({
      onSuccess: (_profile, variables) => {
        setTaxInputs(current => {
          const next = { ...current };
          delete next[variables.clientId];
          return next;
        });
        setMessage(
          `${TAX_YEAR} kira geliri vergisi ön bilgi parametreleri kaydedildi; resmî beyan veya tahakkuk oluşturulmadı.`
        );
        void utils.activeRentals.rentalIncomeTaxProfiles.list.invalidate({
          taxYear: TAX_YEAR,
        });
      },
      onError: error => setMessage(error.message),
    });
  const savedTaxInputs = useMemo(
    () =>
      new Map(
        (taxProfiles.data ?? []).map(profile => [
          profile.clientId,
          {
            ownershipSharePercent: String(profile.ownershipSharePercent),
            residentialExemptionEligible: Boolean(
              profile.residentialExemptionEligible
            ),
            expenseMethod: profile.expenseMethod as RentalExpenseMethod,
            actualExpenseTotal: String(profile.actualExpenseTotal),
          } satisfies TaxInput,
        ])
      ),
    [taxProfiles.data]
  );
  const taxes = useMemo(() => {
    const groups = new Map<
      number,
      {
        clientId: number;
        clientName: string;
        consultantCode: string;
        gross: number;
      }
    >();
    (summaries.data ?? []).forEach(item => {
      const group = groups.get(item.clientId) ?? {
        clientId: item.clientId,
        clientName: item.clientName,
        consultantCode: item.consultantCode ?? "",
        gross: 0,
      };
      group.gross += Number(item.monthlyRent) * 12;
      groups.set(item.clientId, group);
    });
    return Array.from(groups.values()).map(group => {
      const input =
        taxInputs[group.clientId] ??
        savedTaxInputs.get(group.clientId) ??
        defaultTaxInput();
      return {
        ...group,
        input,
        estimate: estimateRentalIncomeTax2026({
          annualGrossRent: group.gross,
          ownershipSharePercent: Number(input.ownershipSharePercent),
          residentialExemptionEligible: input.residentialExemptionEligible,
          expenseMethod: input.expenseMethod,
          actualExpenseTotal: Number(input.actualExpenseTotal || 0),
        }),
      };
    });
  }, [summaries.data, savedTaxInputs, taxInputs]);
  const advisorDistribution = useMemo(
    () => getActiveRentalAdvisorDistribution(summaries.data ?? []),
    [summaries.data]
  );
  const highestAdvisorCount = advisorDistribution[0]?.count ?? 1;
  const busy =
    importMutation.isPending ||
    refreshMutation.isPending ||
    prepareMutation.isPending ||
    reviewMutation.isPending ||
    shareMutation.isPending ||
    startRelettingMutation.isPending ||
    saveTaxProfileMutation.isPending;
  const existingImportKeys = useMemo(
    () => new Set((summaries.data ?? []).map(item => importRowKey(item))),
    [summaries.data]
  );
  const duplicateImportRows = parsed?.rows.filter(row => existingImportKeys.has(importRowKey(row))) ?? [];
  const importableRows = parsed?.rows.filter(row => !existingImportKeys.has(importRowKey(row))) ?? [];
  const readWorkbook = async (file?: File) => {
    if (!file) return;
    setMessage("");
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setParsed({
        fileName: file.name,
        rows: [],
        errors: ["Yalnız .xlsx dosyası kabul edilir."],
      });
      return;
    }
    if (!team.data) {
      setMessage(
        "Danışman kodları yüklenmedi. Önce ekip bağlantısını kontrol edin."
      );
      return;
    }
    setParsed(await parseActiveRentalWorkbook(file, team.data, { kt0: "KT1" }));
  };

  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const exportRows = (summaries.data ?? []).map(item => ({
    clientName: item.clientName ?? "",
    propertyLocation: `${item.propertyLocation}${item.unitInfo && item.unitInfo !== "—" ? ` / ${item.unitInfo}` : ""}`,
    clientPhone: item.clientPhone || "—",
    tenantName: item.tenantName,
    tenantPhone: item.tenantPhone || "—",
    contractDate: dateText(item.contractDate),
    rentIncreaseDate: dateText(item.rentIncreaseDate ?? item.contractDate),
    evictionDate: item.evictionDate ? dateText(item.evictionDate) : "",
    monthlyRent: money(item.monthlyRent),
    neighborhood: item.neighborhood,
    consultantCode: item.consultantCode ?? "—",
  }));
  const EXPORT_HEADINGS = [
    "Müşteri / malik adı",
    "Portföy Adresi",
    "Ev sahibi telefon",
    "Kiracı adı",
    "Kiracı telefonu",
    "Sözleşme tarihi",
    "Kira artış tarihi (boşsa sözleşme tarihi)",
    "Tahliye tarihi (opsiyonel)",
    "Güncel aylık kira",
    "Mahalle",
    "Danışman kodu",
  ];
  const exportActiveRentalsXlsx = async () => {
    const rows = exportRows.map(row => [
      row.clientName,
      row.propertyLocation,
      row.clientPhone,
      row.tenantName,
      row.tenantPhone,
      row.contractDate,
      row.rentIncreaseDate,
      row.evictionDate,
      row.monthlyRent,
      row.neighborhood,
      row.consultantCode,
    ]);
    const date = new Date().toISOString().slice(0, 10);
    await writeXlsxFile([EXPORT_HEADINGS, ...rows] as any, {
      sheet: "Aktif Kiralamalar",
      stickyRowsCount: 1,
      orientation: "landscape",
    }).toFile(`Global1881-Aktif-Kiralamalar-${date}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#243733] md:px-10 md:py-9">
      <header className="mb-7">
        <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]">
          <FileSpreadsheet className="h-3.5 w-3.5" /> Merkezi kira takibi
        </p>
        <h1 className="font-serif text-4xl text-[#223230]">
          Aktif Kiralamalar
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#70807c]">
          Geçmiş sözleşme, PDF ve finans hareketi taşınmadan devam eden
          kiralamaların güvenli özeti.
        </p>
      </header>
      {message && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-[#d4e6dc] bg-[#f3faf5] px-4 py-3 text-sm text-[#285347]"
        >
          {message}
        </div>
      )}
      <div className="mb-6 rounded-2xl border border-[#d9c99e] bg-[#fffdf7] px-5 py-4 text-xs leading-5 text-[#6f603c]">
        <strong>İletişim kuralı:</strong> Sistem dış mesaj göndermez. Danışman
        hazırlığı yapar, broker manager gözden geçirir, yetkili kişi manuel
        paylaşır. Yıllık kira dönemi sonu tahliye varsayımı değildir; malik 60
        gün önce yalnız kiracıdan ayrılma isteği gelip gelmediği için aranır.
        Vergi alanı yaklaşık ön bilgidir; resmî tahakkuk veya beyanname
        değildir.
      </div>
      {isManager && (
        <Card className="mb-6 rounded-2xl border-[#e5e8e3] bg-white">
          <CardHeader className="flex flex-wrap items-start justify-between gap-3 p-6">
            <div>
              <CardTitle className="font-serif text-xl">
                Excel ile başlangıç aktarımı
              </CardTitle>
              <p className="mt-1 text-xs text-[#87938f]">
                Aynı malik için birden çok taşınmaz konum ve daire/kısa tanımla
                ayrılır. Yalnız broker manager aktarabilir.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={TEMPLATE_URL} download>
                <Button type="button" variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Şablonu indir
                </Button>
              </a>
              <label className="inline-flex cursor-pointer items-center rounded-md bg-[#173e39] px-4 py-2 text-sm font-medium text-white">
                <Upload className="mr-2 h-4 w-4" /> Excel önizle
                <input
                  className="sr-only"
                  type="file"
                  accept=".xlsx"
                  onChange={event => void readWorkbook(event.target.files?.[0])}
                />
              </label>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {parsed && (
              <div className="rounded-xl border border-[#e5e8e3] bg-[#fbfcfa] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#173e39]">
                    {parsed.fileName}
                  </p>
                  <span className="text-xs font-semibold text-[#587069]">
                    {parsed.rows.length} geçerli satır · {importableRows.length} yeni · {duplicateImportRows.length} mevcut/mükerrer
                  </span>
                </div>
                {parsed.errors.length > 0 && (
                  <div className="mt-3 rounded-lg border border-[#ecd5ca] bg-[#fff8f5] p-3 text-xs text-[#914b3a]">
                    <p className="flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" /> Kontrol gereken
                      satırlar
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {parsed.errors.map(error => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {parsed.rows.length > 0 && (
                  <>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[840px] text-xs">
                        <thead className="border-b text-left text-[#718079]">
                          <tr>
                            <th className="px-2 py-2">Malik</th>
                            <th className="px-2 py-2">Taşınmaz</th>
                            <th className="px-2 py-2">Kiracı</th>
                            <th className="px-2 py-2">Kira</th>
                            <th className="px-2 py-2">Danışman</th>
                            <th className="px-2 py-2">Aktarım durumu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsed.rows.map((row, index) => (
                            <tr
                              key={`${row.clientName}-${row.propertyLocation}-${index}`}
                              className="border-b border-[#edf1ed]"
                            >
                              <td className="px-2 py-2">{row.clientName}</td>
                              <td className="px-2 py-2">
                                {row.propertyLocation}
                                {row.unitInfo !== "—"
                                  ? ` / ${row.unitInfo}`
                                  : ""}
                              </td>
                              <td className="px-2 py-2">{row.tenantName}</td>
                              <td className="px-2 py-2">
                                {money(row.monthlyRent)}
                              </td>
                              <td className="px-2 py-2">
                                {row.consultantCode}
                              </td>
                              <td className="px-2 py-2">
                                {existingImportKeys.has(importRowKey(row)) ? (
                                  <span className="font-semibold text-[#9a6e38]">Mevcut kayıt — aktarılmayacak</span>
                                ) : (
                                  <span className="font-semibold text-[#2e6f5f]">Yeni kayıt — aktarılacak</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-[#687771]">
                        {duplicateImportRows.length > 0
                          ? `${duplicateImportRows.length} mevcut/mükerrer satır aktarılmayacak; yalnız ${importableRows.length} yeni satır kayıt edilir.`
                          : "Aşağıdaki onay veritabanına kayıt yazar."}
                      </p>
                      <Button
                        type="button"
                        disabled={busy || parsed.errors.length > 0 || importableRows.length === 0}
                        onClick={() =>
                          importMutation.mutate({ rows: importableRows })
                        }
                      >
                        {busy ? (
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}{" "}
                        Önizlemeyi onayla ve aktar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <section className="mb-6 grid gap-3 md:grid-cols-3">
        <Card className="rounded-2xl border-[#dce8df] bg-white">
          <CardContent className="p-5">
            <p className="text-xs text-[#718079]">Görünür aktif kira</p>
            <p className="mt-2 font-serif text-3xl text-[#173e39]">
              {summaries.data?.length ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-[#ead6c9] bg-[#fffdf9]">
          <CardContent className="p-5">
            <p className="text-xs text-[#718079]">Açık hizmet görevi</p>
            <p className="mt-2 font-serif text-3xl text-[#8c5a35]">
              {tasks.data?.filter(item => item.task.status !== "shared")
                .length ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-[#d9e2ef] bg-[#f8fbff]">
          <CardContent className="p-5">
            <p className="text-xs text-[#718079]">Malik grubu</p>
            <p className="mt-2 font-serif text-3xl text-[#315b77]">
              {taxes.length}
            </p>
          </CardContent>
        </Card>
      </section>
      {isManager && (
        <section className="mb-6 rounded-2xl border border-[#dce8df] bg-white p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4b8878]">
                Portföy dengesi
              </p>
              <h2 className="mt-1 font-serif text-2xl text-[#223230]">
                Danışman bazlı aktif kiralama dağılımı
              </h2>
            </div>
            <p className="text-xs text-[#718079]">
              Toplam {summaries.data?.length ?? 0} aktif kira
            </p>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#718079]">
            Bu özet yalnız danışman kodu ve kayıt sayısını gösterir; müşteri,
            telefon ve taşınmaz detayı içermez.
          </p>
          {advisorDistribution.length ? (
            <div
              className="mt-5 space-y-4"
              role="img"
              aria-label="Danışman bazlı aktif kiralama dağılım grafiği"
            >
              {advisorDistribution.map((item, index) => {
                const percent = Math.round(
                  (item.count / Math.max(summaries.data?.length ?? 1, 1)) * 100
                );
                const width = Math.max(
                  (item.count / highestAdvisorCount) * 100,
                  8
                );
                return (
                  <div
                    key={item.consultantCode}
                    className="grid grid-cols-[56px_minmax(0,1fr)_58px] items-center gap-3"
                  >
                    <span className="text-xs font-bold tracking-wide text-[#315c53]">
                      {item.consultantCode}
                    </span>
                    <div
                      className="h-8 overflow-hidden rounded-md bg-[#edf3ef]"
                      aria-label={`${item.consultantCode}: ${item.count} aktif kira, yüzde ${percent}`}
                    >
                      <div
                        className={
                          index === 0
                            ? "flex h-full items-center justify-end rounded-md bg-[#173e39] px-2 text-[11px] font-bold text-white"
                            : "flex h-full items-center justify-end rounded-md bg-[#4f897a] px-2 text-[11px] font-bold text-white"
                        }
                        style={{ width: `${width}%` }}
                      >
                        {percent}%
                      </div>
                    </div>
                    <span className="text-right text-sm font-semibold text-[#223230]">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-[#d8e4db] p-5 text-sm text-[#718079]">
              Aktarım tamamlandığında danışman kodlarına göre dağılım burada
              görünür.
            </p>
          )}
        </section>
      )}
      <section className="mb-6 rounded-2xl border border-[#d9c99e] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9b7840]">
              Müşteri hizmeti
            </p>
            <h2 className="mt-1 font-serif text-2xl text-[#223230]">
              Görevler ve broker yönlendirmesi
            </h2>
            <p className="mt-1 text-xs text-[#718079]">
              Vergi, kira artışı ve malik kontrolü yalnız danışman ile broker
              managerın izlediği iç görevlerdir.
            </p>
          </div>
          {isManager && (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => refreshMutation.mutate()}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Görevleri yenile
            </Button>
          )}
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {tasks.data?.length ? (
            tasks.data.map(
              ({
                task,
                clientName,
                tenantName,
                propertyLocation,
                unitInfo,
                consultantCode,
              }) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-[#e5e8e3] bg-[#fbfcfa] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#173e39]">
                        {taskLabel(task.serviceType)}
                      </p>
                      <p className="mt-1 text-xs text-[#6f7d76]">
                        {clientName}
                        {tenantName ? ` · ${tenantName}` : ""}
                        {propertyLocation ? ` · ${propertyLocation}` : ""}
                        {unitInfo && unitInfo !== "—" ? ` / ${unitInfo}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#587069]">
                      {taskStatus(task.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#718079]">
                    {taskPurpose(task.serviceType)}
                  </p>
                  <p className="mt-2 text-xs text-[#718079]">
                    Takip: {dateText(task.dueDate)} · Danışman:{" "}
                    {consultantCode ?? "—"}
                  </p>
                  {task.status === "reviewed" && (
                    <>
                      <label className="mt-3 block text-xs text-[#587069]">
                        Görüşme / müşteri geri dönüş notu
                        <textarea
                          value={taskNotes[task.id] ?? ""}
                          maxLength={1000}
                          onChange={event =>
                            setTaskNotes(current => ({
                              ...current,
                              [task.id]: event.target.value,
                            }))
                          }
                          className="mt-1 min-h-16 w-full rounded-md border border-[#d9e3dc] bg-white px-3 py-2 text-sm"
                          placeholder="Örneğin: Malik, kiracıdan ayrılma talebi geldiğini bildirdi."
                        />
                      </label>
                      {task.serviceType === "ownerLeaseReview" && (
                        <label className="mt-3 flex items-start gap-2 rounded-lg border border-[#ead6c9] bg-[#fffaf5] p-3 text-xs leading-5 text-[#70513c]">
                          <input
                            className="mt-0.5"
                            type="checkbox"
                            checked={Boolean(ownerExitConfirmed[task.id])}
                            onChange={event =>
                              setOwnerExitConfirmed(current => ({
                                ...current,
                                [task.id]: event.target.checked,
                              }))
                            }
                          />
                          Malik, kiracıdan açık ayrılma isteği geldiğini teyit
                          etti. Bu işaret yalnız görüşme notuyla birlikte
                          kaydedilir.
                        </label>
                      )}
                    </>
                  )}
                  {task.serviceType === "ownerLeaseReview" &&
                    task.status === "shared" && (
                      <p className="mt-3 rounded-lg bg-white px-3 py-2 text-xs text-[#587069]">
                        Malik teyidi: {task.ownerConfirmedTenantExit ? "Kiracıdan açık ayrılma isteği kaydedildi." : "Ayrılma isteği teyit edilmedi; yeniden kiralama hazırlığı başlatılamaz."}
                      </p>
                    )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {task.status === "planned" && (
                      <Button
                        size="sm"
                        type="button"
                        onClick={() =>
                          prepareMutation.mutate({ taskId: task.id })
                        }
                      >
                        Hazırlığı kaydet
                      </Button>
                    )}
                    {isManager && task.status === "prepared" && (
                      <Button
                        size="sm"
                        type="button"
                        onClick={() =>
                          reviewMutation.mutate({ taskId: task.id })
                        }
                      >
                        Manager gözden geçir
                      </Button>
                    )}
                    {task.status === "reviewed" && (
                      <Button
                        size="sm"
                        type="button"
                        onClick={() =>
                          shareMutation.mutate({
                            taskId: task.id,
                            responseNote:
                              taskNotes[task.id]?.trim() || undefined,
                            ownerConfirmedTenantExit:
                              task.serviceType === "ownerLeaseReview"
                                ? Boolean(ownerExitConfirmed[task.id])
                                : undefined,
                          })
                        }
                      >
                        Manuel iletişim kaydını ekle
                      </Button>
                    )}
                    {task.serviceType === "ownerLeaseReview" &&
                      task.status === "shared" &&
                      task.ownerConfirmedTenantExit === 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() =>
                            startRelettingMutation.mutate({
                              sourceTaskId: task.id,
                            })
                          }
                        >
                          Yeniden kiralama hazırlığını başlat
                        </Button>
                      )}
                  </div>
                </div>
              )
            )
          ) : (
            <p className="rounded-xl border border-dashed border-[#d8e4db] p-5 text-sm text-[#718079]">
              Henüz görev yok. Manager manuel yenileme yapabilir.
            </p>
          )}
        </div>
      </section>
      <details className="mb-6 rounded-2xl border border-[#e5e8e3] bg-white p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-[#173e39]">
          Malik bazında kümülatif kira geliri ve yaklaşık vergi{" "}
          <ChevronDown className="h-4 w-4" />
        </summary>
        <p className="mt-3 text-xs leading-5 text-[#6f7d76]">
          Aktif taşınmazların yıllıklaştırılmış kira bedelleri malik bazında
          otomatik toplanır. 2026 tarifesi üzerinden yalnız yaklaşık ön
          bilgidir; hisse, istisna ve gider yöntemi teyit edilmeden
          kullanılmamalıdır. Seçimler yalnız bu karttaki kaydet düğmesiyle
          merkezi profile yazılır; resmî beyan, tahakkuk veya belge üretilmez.
        </p>
        <div className="mt-4 grid gap-3 xl:grid-cols-2">
          {taxes.map(row => (
            <div
              key={row.clientId}
              className="rounded-xl border border-[#e5e8e3] bg-[#fbfcfa] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-[#173e39]">
                    {row.clientName}
                  </p>
                  <p className="text-xs text-[#718079]">
                    {row.consultantCode || "Kod yok"} · Brüt{" "}
                    {money(row.estimate.grossRentalIncome)}
                  </p>
                </div>
                <span className="font-semibold text-[#315b77]">
                  {money(row.estimate.estimatedTax)}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="text-xs text-[#6f7d76]">
                  Hisse %
                  <input
                    className="mt-1 w-full rounded-md border border-[#d9e3dc] px-3 py-2"
                    value={row.input.ownershipSharePercent}
                    onChange={event =>
                      setTaxInputs(current => ({
                        ...current,
                        [row.clientId]: {
                          ...row.input,
                          ownershipSharePercent: event.target.value,
                        },
                      }))
                    }
                  />
                </label>
                <label className="text-xs text-[#6f7d76]">
                  Gider yöntemi
                  <select
                    className="mt-1 w-full rounded-md border border-[#d9e3dc] px-3 py-2"
                    value={row.input.expenseMethod}
                    onChange={event =>
                      setTaxInputs(current => ({
                        ...current,
                        [row.clientId]: {
                          ...row.input,
                          expenseMethod: event.target
                            .value as RentalExpenseMethod,
                        },
                      }))
                    }
                  >
                    <option value="lump_sum">Götürü %15</option>
                    <option value="actual">Gerçek gider</option>
                  </select>
                </label>
                {row.input.expenseMethod === "actual" && (
                  <label className="text-xs text-[#6f7d76] sm:col-span-2">
                    Teyit edilen yıllık gerçek gider (₺)
                    <input
                      inputMode="decimal"
                      className="mt-1 w-full rounded-md border border-[#d9e3dc] px-3 py-2"
                      value={row.input.actualExpenseTotal}
                      onChange={event =>
                        setTaxInputs(current => ({
                          ...current,
                          [row.clientId]: {
                            ...row.input,
                            actualExpenseTotal: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>
                )}
              </div>
              <label className="mt-3 flex items-center gap-2 text-xs text-[#6f7d76]">
                <input
                  type="checkbox"
                  checked={row.input.residentialExemptionEligible}
                  onChange={event =>
                    setTaxInputs(current => ({
                      ...current,
                      [row.clientId]: {
                        ...row.input,
                        residentialExemptionEligible: event.target.checked,
                      },
                    }))
                  }
                />{" "}
                Konut istisnası uygunluğu
              </label>
              <p className="mt-3 text-xs text-[#718079]">
                Matrah: {money(row.estimate.taxableBase)} · İstisna:{" "}
                {money(row.estimate.residentialExemption)} · Gider:{" "}
                {money(row.estimate.deductibleExpense)}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] text-[#718079]">
                  {taxProfiles.isLoading
                    ? "Kaydedilmiş parametreler yükleniyor…"
                    : taxProfiles.isError
                      ? "Kaydedilmiş parametreler yüklenemedi; mevcut merkezi kaydı korumak için kayıt kapalı"
                    : taxInputs[row.clientId]
                      ? "Kaydedilmemiş değişiklik var"
                      : savedTaxInputs.has(row.clientId)
                        ? "Merkezi ön bilgi parametresi kullanılıyor"
                        : "Varsayılan ön bilgi parametresi kullanılıyor"}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    taxProfiles.isLoading ||
                    taxProfiles.isError ||
                    saveTaxProfileMutation.isPending ||
                    Number(row.input.ownershipSharePercent) <= 0 ||
                    Number(row.input.ownershipSharePercent) > 100 ||
                    Number(row.input.actualExpenseTotal || 0) < 0
                  }
                  onClick={() =>
                    saveTaxProfileMutation.mutate({
                      clientId: row.clientId,
                      taxYear: TAX_YEAR,
                      ownershipSharePercent: row.input.ownershipSharePercent,
                      residentialExemptionEligible:
                        row.input.residentialExemptionEligible,
                      expenseMethod: row.input.expenseMethod,
                      actualExpenseTotal:
                        row.input.expenseMethod === "actual"
                          ? row.input.actualExpenseTotal || "0"
                          : "0",
                    })
                  }
                >
                  {saveTaxProfileMutation.isPending
                    ? "Kaydediliyor…"
                    : "Vergi ön bilgisini kaydet"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </details>
      <details className="rounded-2xl border border-[#e5e8e3] bg-white p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium text-[#173e39]">
          <span className="flex items-center gap-3">Tüm aktif kira özetleri <ChevronDown className="h-4 w-4" /></span>
          <span className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled={!exportRows.length} onClick={(event) => { event.preventDefault(); setPrintPreviewOpen(true); }}>
              <Printer className="mr-1.5 h-4 w-4" /> PDF
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={!exportRows.length} onClick={(event) => { event.preventDefault(); void exportActiveRentalsXlsx(); }}>
              <FileSpreadsheet className="mr-1.5 h-4 w-4" /> Excel
            </Button>
          </span>
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wide text-[#718079]">
              <tr>
                <th className="px-3 py-3">Malik / kiracı</th>
                <th className="px-3 py-3">Taşınmaz</th>
                <th className="px-3 py-3">Kira</th>
                <th className="px-3 py-3">Sözleşme</th>
                <th className="px-3 py-3">Danışman</th>
                <th className="px-3 py-3">İletişim</th>
              </tr>
            </thead>
            <tbody>
              {summaries.data?.map(item => {
                const isRevealed = revealedPhones?.summaryId === item.id;
                return <tr key={item.id} className="border-b border-[#edf1ed]">
                  <td className="px-3 py-3">
                    <div className="font-medium text-[#173e39]">
                      {item.clientName}
                    </div>
                    <div className="text-xs text-[#718079]">
                      {item.tenantName}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {item.propertyLocation}
                    {item.unitInfo && item.unitInfo !== "—"
                      ? ` / ${item.unitInfo}`
                      : ""}
                    <div className="text-xs text-[#718079]">
                      {item.neighborhood}
                    </div>
                  </td>
                  <td className="px-3 py-3">{money(item.monthlyRent)}</td>
                  <td className="px-3 py-3">{dateText(item.contractDate)}</td>
                  <td className="px-3 py-3">{item.consultantCode ?? "—"}</td>
                  <td className="px-3 py-3 text-xs text-[#718079]">
                    <div>Malik: {isRevealed ? revealedPhones?.clientPhone || "—" : item.clientPhone || "—"}</div>
                    <div>Kiracı: {isRevealed ? revealedPhones?.tenantPhone || "—" : item.tenantPhone || "—"}</div>
                    {item.canRevealSensitive && <Button variant="outline" size="sm" className="mt-2 h-7 border-[#d7b270] px-2 text-[10px] text-[#74561f]" onClick={() => { setRevealSummaryId(item.id); setRevealReason(""); }}><Eye className="mr-1 h-3 w-3" /> Gerekçeyle aç</Button>}
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
          {!summaries.data?.length && (
            <p className="py-6 text-center text-sm text-[#718079]">
              Rolünüzde görünür aktif kira özeti bulunmuyor.
            </p>
          )}
        </div>
      </details>
      <Dialog open={revealSummaryId !== null} onOpenChange={(open) => { if (!open && !revealSensitiveMutation.isPending) setRevealSummaryId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-[#223230]">Hassas iletişim erişimi</DialogTitle>
            <DialogDescription>Malik ve kiracı telefonu yalnız bu ekranda 30 saniye süreyle gösterilir. Gerekçe audit kaydına eklenir; telefon değerleri audit kaydına yazılmaz.</DialogDescription>
          </DialogHeader>
          <Textarea value={revealReason} onChange={event => setRevealReason(event.target.value)} placeholder="Örn. kira artışı hizmet görevi için fiziki dosya doğrulaması" aria-label="Görüntüleme gerekçesi" />
          {revealSensitiveMutation.error && <p role="alert" className="text-sm text-[#a85745]">{revealSensitiveMutation.error.message}</p>}
          <DialogFooter>
            <Button variant="outline" disabled={revealSensitiveMutation.isPending} onClick={() => setRevealSummaryId(null)}>Vazgeç</Button>
            <Button className="bg-[#173e39] hover:bg-[#20554e]" disabled={revealReason.trim().length < 8 || revealSensitiveMutation.isPending} onClick={() => revealSummaryId && revealSensitiveMutation.mutate({ summaryId: revealSummaryId, reason: revealReason.trim() })}><Eye className="mr-2 h-4 w-4" /> Tam değeri aç</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DocumentPrintPreview
        open={printPreviewOpen}
        onOpenChange={setPrintPreviewOpen}
        title="Aktif Kiralamalar Listesi"
        subtitle="Filtrelenmiş kayıtlar A4 yatay düzende yazdırılmadan önce burada incelenir."
        fileName={`Global1881-Aktif-Kiralamalar-${new Date().toISOString().slice(0, 10)}.pdf`}
        onPrint={() => window.print()}
      >
        <article className="authority-print-document active-rentals-print-document bg-white p-6 text-[#24322f]">
          <div className="mb-4 border-b-2 border-[#173e39] pb-3">
            <h1 className="font-serif text-2xl text-[#173e39]">GLOBAL 1881 — AKTİF KİRALAMALAR LİSTESİ</h1>
            <p className="mt-1 text-xs text-[#64736e]">Oluşturulma tarihi: {new Date().toLocaleDateString("tr-TR")} · Kayıt sayısı: {exportRows.length}</p>
          </div>
          <table className="w-full border-collapse text-[8px]">
            <thead>
              <tr className="bg-[#eaf1ed]">
                {EXPORT_HEADINGS.map(label => <th key={label} className="border border-[#b8c5bf] p-1.5 text-left font-semibold">{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {exportRows.map((row, index) => (
                <tr key={`${row.clientName}-${row.propertyLocation}-${index}`}>
                  <td className="border border-[#b8c5bf] p-1.5">{row.clientName}</td>
                  <td className="border border-[#b8c5bf] p-1.5">{row.propertyLocation}</td>
                  <td className="border border-[#b8c5bf] p-1.5">{row.clientPhone}</td>
                  <td className="border border-[#b8c5bf] p-1.5">{row.tenantName}</td>
                  <td className="border border-[#b8c5bf] p-1.5">{row.tenantPhone}</td>
                  <td className="border border-[#b8c5bf] p-1.5">{row.contractDate}</td>
                  <td className="border border-[#b8c5bf] p-1.5">{row.rentIncreaseDate}</td>
                  <td className="border border-[#b8c5bf] p-1.5">{row.evictionDate}</td>
                  <td className="border border-[#b8c5bf] p-1.5">{row.monthlyRent}</td>
                  <td className="border border-[#b8c5bf] p-1.5">{row.neighborhood}</td>
                  <td className="border border-[#b8c5bf] p-1.5">{row.consultantCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </DocumentPrintPreview>
    </div>
  );
}
