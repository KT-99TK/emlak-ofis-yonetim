import { AlertTriangle, ArrowLeftRight, BadgeCheck, ClipboardList, Landmark, LockKeyhole, Plus, RefreshCw, Settings2, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import OfficeContributionControl from "@/components/OfficeContributionControl";
import OfflineOfficeFlowPanel from "@/components/OfflineOfficeFlowPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatAuthorityCurrency, formatWholeCurrencyInput } from "@/lib/authorityContract";
import { approveBudgetExpense, buildBudgetSummary, buildYearlyBudgetSummary, createBudgetExpense, createBudgetTransfer, currentInternalControlSettings, defaultInternalControlSettings, internalBudgetCategories, internalScopeLabels, parseInternalBudgetExpense, type InternalBudgetExpense, type InternalControlScope, type PaymentSource } from "@/lib/internalControl";
import { configureLocalManagerPasscode, hasLocalManagerPasscode, isLocalManagerSessionActive, lockLocalManagerAccess, unlockLocalManagerAccess } from "@/lib/offlineManagerAccess";
import { getUserId, listOfflineRecords, recordOfflineAudit, saveOfflineRecord, updateOfflineRecord, type OfflineRecord } from "@/lib/offlineStore";

const today = () => new Date().toISOString().slice(0, 10);
const currentYear = () => String(new Date().getFullYear());
const currentMonth = () => new Date().getMonth() + 1;
const toAmount = (value: string) => Number(value.replace(/\D/g, "")) || 0;
const money = (value: number) => formatAuthorityCurrency(value, "TRY");
const monthOptions = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
type ExpenseDraft = { categoryCode: string; amount: string; expenseKind: "actual" | "commitment"; paymentSource: PaymentSource; supplier: string; reference: string; dueDate: string; note: string };
const blankExpense = (): ExpenseDraft => ({ categoryCode: "760.01", amount: "", expenseKind: "actual", paymentSource: "bank", supplier: "", reference: "", dueDate: "", note: "" });

export default function OfflineInternalControl() {
  const { user } = useAuth();
  const [records, setRecords] = useState<OfflineRecord[]>([]);
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [message, setMessage] = useState("");
  const [planCategoryCode, setPlanCategoryCode] = useState("760.01");
  const [planAmount, setPlanAmount] = useState("");
  const [planNote, setPlanNote] = useState("");
  const [expense, setExpense] = useState<ExpenseDraft>(blankExpense);
  const [transferSource, setTransferSource] = useState("760.01");
  const [transferTarget, setTransferTarget] = useState("760.02");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferReason, setTransferReason] = useState("");
  const [representationThreshold, setRepresentationThreshold] = useState("3.000");
  const [scope, setScope] = useState<InternalControlScope>("all");
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});
  const [localManagerConfigured, setLocalManagerConfigured] = useState(false);
  const [localManagerUnlocked, setLocalManagerUnlocked] = useState(false);
  const [managerPasscode, setManagerPasscode] = useState("");
  const [managerPasscodeRepeat, setManagerPasscodeRepeat] = useState("");
  const [managerWorking, setManagerWorking] = useState(false);
  const userId = getUserId();
  const serverManager = user?.role === "admin";
  const isOfflineDesktop = typeof window !== "undefined" && window.location.protocol === "file:";
  const needsLocalManagerAccess = isOfflineDesktop && !serverManager;
  const isManager = serverManager || (needsLocalManagerAccess && localManagerUnlocked);
  const refresh = async () => setRecords(await listOfflineRecords());

  useEffect(() => { void refresh(); setLocalManagerConfigured(hasLocalManagerPasscode()); setLocalManagerUnlocked(isLocalManagerSessionActive()); }, []);

  const settings = useMemo(() => currentInternalControlSettings(records), [records]);
  const budgetSummary = useMemo(() => buildBudgetSummary(records, year, month), [records, year, month]);
  const visibleBudgetSummary = useMemo(() => budgetSummary.filter((row) => scope === "personnelExpenses" ? row.category.group === "personnelExpense" : scope === "officeExpenses" ? row.category.group === "officeExpense" || row.category.group === "financeExpense" : scope === "contributions" || scope === "officeIncome" ? false : true), [budgetSummary, scope]);
  const summary = visibleBudgetSummary;
  const yearlyTotals = useMemo(() => buildYearlyBudgetSummary(records, year).filter((row) => scope === "personnelExpenses" ? row.category.group === "personnelExpense" : scope === "officeExpenses" ? row.category.group === "officeExpense" || row.category.group === "financeExpense" : scope === "contributions" || scope === "officeIncome" ? false : true).reduce((total, row) => ({ revised: total.revised + row.revisedBudget, actual: total.actual + row.actual, commitment: total.commitment + row.commitment }), { revised: 0, actual: 0, commitment: 0 }), [records, scope, year]);
  const expenses = useMemo(() => records.flatMap((record) => { const detail = parseInternalBudgetExpense(record); return detail && detail.year === year && detail.month === month ? [{ record, detail }] : []; }).sort((left, right) => right.detail.occurredOn.localeCompare(left.detail.occurredOn)), [records, year, month]);
  const totals = useMemo(() => visibleBudgetSummary.reduce((total, row) => ({ original: total.original + row.originalBudget, revised: total.revised + row.revisedBudget, actual: total.actual + row.actual, commitment: total.commitment + row.commitment, pending: total.pending + row.pendingApproval, remaining: total.remaining + row.remaining }), { original: 0, revised: 0, actual: 0, commitment: 0, pending: 0, remaining: 0 }), [visibleBudgetSummary]);

  useEffect(() => setRepresentationThreshold(formatWholeCurrencyInput(String(settings.representationThreshold))), [settings.representationThreshold]);

  const ensureManager = () => {
    if (!isManager) { setMessage("Bu iç denetim ekranı yalnız broker manager yetkisiyle kullanılabilir."); return false; }
    if (!userId.trim()) { setMessage("Önce Yerel Çalışma Alanı ekranından offline kullanıcı kodunu kaydedin."); return false; }
    return true;
  };

  const saveSettings = async () => {
    if (!ensureManager()) return;
    const threshold = toAmount(representationThreshold);
    if (!threshold) { setMessage("Temsil/ağırlama bilgi ve onay eşiği sıfırdan büyük olmalıdır."); return; }
    const next = { ...defaultInternalControlSettings(), representationThreshold: threshold };
    await saveOfflineRecord({ entity: "internalControl", title: `İç denetim ayarları · ${year}`, details: JSON.stringify(next), status: "saved" });
    recordOfflineAudit("internal-budget-saved", { type: "settings", threshold });
    setMessage(`Temsil/ağırlama eşiği ${money(threshold)} olarak broker manager ayarıyla kaydedildi.`); await refresh();
  };

  const savePlan = async () => {
    if (!ensureManager()) return;
    const amount = toAmount(planAmount);
    if (!amount) { setMessage("Aylık bütçe tutarı sıfırdan büyük olmalıdır."); return; }
    const category = internalBudgetCategories.find((item) => item.code === planCategoryCode);
    await saveOfflineRecord({ entity: "internalControl", title: `Bütçe planı · ${year}/${String(month).padStart(2, "0")} · ${category?.label ?? planCategoryCode}`, details: JSON.stringify({ schema: "global1881-internal-budget-plan-v1", year, month, categoryCode: planCategoryCode, originalBudget: amount, note: planNote.trim() || undefined }), amount: String(amount), status: "planned" });
    recordOfflineAudit("internal-budget-saved", { type: "plan", year, month, category: planCategoryCode, amount });
    setPlanAmount(""); setPlanNote(""); setMessage(`${category?.label ?? planCategoryCode} için aylık iç denetim bütçesi kaydedildi.`); await refresh();
  };

  const saveExpense = async () => {
    if (!ensureManager()) return;
    try {
      const entry = createBudgetExpense({ year, month, occurredOn: today(), categoryCode: expense.categoryCode, amount: toAmount(expense.amount), paymentSource: expense.paymentSource, supplier: expense.supplier, reference: expense.reference, dueDate: expense.dueDate || undefined, declaredBy: userId, note: expense.note, expenseKind: expense.expenseKind }, settings);
      await saveOfflineRecord({ entity: "internalControl", title: `İç denetim gideri · ${entry.supplier} · ${entry.categoryCode}`, details: JSON.stringify(entry), amount: String(entry.amount), dueDate: entry.dueDate, status: entry.status });
      recordOfflineAudit("internal-expense-declared", { category: entry.categoryCode, amount: entry.amount, pendingApproval: entry.status === "pendingApproval" });
      setExpense(blankExpense()); setMessage(entry.status === "pendingApproval" ? "Temsil/ağırlama eşiği nedeniyle kayıt taahhüt olarak kaydedildi; broker manager onayı bekliyor." : "Gider/taahhüt iç denetim kaydı kaydedildi."); await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gider kaydı oluşturulamadı."); }
  };

  const approveExpense = async (record: OfflineRecord, detail: InternalBudgetExpense, approved: boolean) => {
    if (!ensureManager()) return;
    try {
      const note = approvalNotes[detail.id] ?? "";
      const next = approveBudgetExpense(detail, userId, approved, note);
      await updateOfflineRecord(record, { details: JSON.stringify(next), status: next.status });
      recordOfflineAudit("internal-expense-approved", { expenseId: detail.id, approved, amount: detail.amount, category: detail.categoryCode });
      setMessage(approved ? "Gider broker manager tarafından onaylandı ve gerçekleşen bütçeye alındı." : "Gider kaydı gerekçesiyle reddedildi; bütçe toplamına alınmadı."); await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Onay işlemi tamamlanamadı."); }
  };

  const saveTransfer = async () => {
    if (!ensureManager()) return;
    try {
      const transfer = createBudgetTransfer({ year, month, sourceCategoryCode: transferSource, targetCategoryCode: transferTarget, amount: toAmount(transferAmount), reason: transferReason, transferredBy: userId, transferredAt: today() }, budgetSummary);
      await saveOfflineRecord({ entity: "internalControl", title: `Bütçe aktarımı · ${transfer.sourceCategoryCode} → ${transfer.targetCategoryCode}`, details: JSON.stringify(transfer), amount: String(transfer.amount), status: "transferred" });
      recordOfflineAudit("internal-budget-transferred", { source: transfer.sourceCategoryCode, target: transfer.targetCategoryCode, amount: transfer.amount });
      setTransferAmount(""); setTransferReason(""); setMessage("Bütçe aktarımı ilk planı koruyarak revize bütçeye işlendi."); await refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Bütçe aktarımı kaydedilemedi."); }
  };

  const submitLocalManagerAccess = async () => { setManagerWorking(true); try { if (!localManagerConfigured) { if (managerPasscode !== managerPasscodeRepeat) throw new Error("Parola tekrarını aynı girin."); await configureLocalManagerPasscode(managerPasscode, user?.name || userId || "broker-manager"); setLocalManagerConfigured(true); } else await unlockLocalManagerAccess(managerPasscode); setLocalManagerUnlocked(true); setManagerPasscode(""); setManagerPasscodeRepeat(""); setMessage("Yerel broker manager yetkisi açıldı."); } catch (error) { setMessage(error instanceof Error ? error.message : "Yerel yönetici doğrulaması tamamlanamadı."); } finally { setManagerWorking(false); } };
  const lockManager = () => { lockLocalManagerAccess(); setLocalManagerUnlocked(false); setMessage("Yerel broker manager oturumu kilitlendi."); };

  if (!isManager) return <div className="offline-page-surface min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9"><Card className="mx-auto max-w-2xl rounded-2xl border-[#d8e4df] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl text-[#223230]"><LockKeyhole className="h-6 w-6 text-[#a17b43]" /> Bütçe ve Gider Kontrolü</CardTitle><p className="text-sm text-[#60706b]">Bu ekran yalnız broker manager içindir; resmî muhasebe, e-Fatura, beyanname veya vergi hesaplaması üretmez.</p></CardHeader><CardContent className="space-y-4">{message && <p role="status" className="rounded-lg bg-[#fff8ed] px-3 py-2 text-sm text-[#8d6f3f]">{message}</p>}{needsLocalManagerAccess && <div className="space-y-3 rounded-xl bg-[#f7faf7] p-4"><p className="text-sm font-semibold text-[#34433f]">Yerel broker manager doğrulaması</p><Input type="password" value={managerPasscode} onChange={(event) => setManagerPasscode(event.target.value)} placeholder={localManagerConfigured ? "Yerel yönetici parolası" : "Yeni yerel yönetici parolası"} />{!localManagerConfigured && <Input type="password" value={managerPasscodeRepeat} onChange={(event) => setManagerPasscodeRepeat(event.target.value)} placeholder="Parolayı tekrar girin" />}<Button onClick={() => void submitLocalManagerAccess()} disabled={managerWorking}>{localManagerConfigured ? "Yetkiyi aç" : "Manager laptopunu kur"}</Button></div>} {!needsLocalManagerAccess && <p className="rounded-xl bg-[#f7faf7] p-4 text-sm text-[#60706b]">Merkezi kullanımda broker manager hesabıyla giriş yapın. Danışmanlar yalnız kendi pay hareketlerini ayrı ekranda görür.</p>}</CardContent></Card></div>;

  return <div className="offline-page-surface min-h-screen bg-[#f7f7f4] px-5 py-7 md:px-10 md:py-9"><header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a17b43]"><WalletCards className="h-3.5 w-3.5" /> Broker manager · resmî olmayan iç denetim</p><h1 className="font-serif text-4xl tracking-[-0.04em] text-[#223230]">Bütçe ve Gider Kontrolü</h1><p className="mt-2 max-w-4xl text-sm text-[#70807c]">Yıllık plan, aylık gerçekleşen, açık taahhüt, ödeme kaynağı ve bütçe sapmasını takip eder. e-Fatura, beyanname, vergi ve resmî muhasebe fişi üretmez.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => void refresh()} className="rounded-xl bg-white"><RefreshCw className="mr-2 h-4 w-4" /> Yenile</Button>{needsLocalManagerAccess && <Button variant="outline" onClick={lockManager} className="rounded-xl bg-white">Kilitle</Button>}</div></header>
    {message && <p role="status" className="mb-5 rounded-xl border border-[#dbe8df] bg-[#f4fbf6] px-4 py-3 text-sm text-[#287052]">{message}</p>}
    <div className="mb-6 grid gap-3 md:grid-cols-[1fr_180px_1.5fr]"><Input value={year} onChange={(event) => setYear(event.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="Yıl" /><Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{monthOptions.map((label, index) => <SelectItem key={label} value={String(index + 1)}>{label}</SelectItem>)}</SelectContent></Select><Select value={scope} onValueChange={(value) => setScope(value as InternalControlScope)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(internalScopeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"><Card className="rounded-2xl border-[#dbe5dd] bg-white"><CardContent className="p-4"><p className="text-xs text-[#718079]">İlk bütçe</p><p className="mt-2 font-serif text-2xl text-[#173e39]">{money(totals.original)}</p></CardContent></Card><Card className="rounded-2xl border-[#dbe5dd] bg-white"><CardContent className="p-4"><p className="text-xs text-[#718079]">Revize bütçe</p><p className="mt-2 font-serif text-2xl text-[#173e39]">{money(totals.revised)}</p></CardContent></Card><Card className="rounded-2xl border-[#dbe5dd] bg-white"><CardContent className="p-4"><p className="text-xs text-[#718079]">Gerçekleşen</p><p className="mt-2 font-serif text-2xl text-[#a14f3f]">{money(totals.actual)}</p></CardContent></Card><Card className="rounded-2xl border-[#dbe5dd] bg-white"><CardContent className="p-4"><p className="text-xs text-[#718079]">Açık taahhüt</p><p className="mt-2 font-serif text-2xl text-[#9a672a]">{money(totals.commitment)}</p></CardContent></Card><Card className="rounded-2xl border-[#dbe5dd] bg-white"><CardContent className="p-4"><p className="text-xs text-[#718079]">Kalan</p><p className={`mt-2 font-serif text-2xl ${totals.remaining < 0 ? "text-[#a14f3f]" : "text-[#287052]"}`}>{money(totals.remaining)}</p>{totals.pending > 0 && <p className="mt-1 text-[10px] text-[#9a672a]">{money(totals.pending)} manager onayı bekliyor</p>}</CardContent></Card></div><p className="mt-3 rounded-xl bg-[#f2f6f3] px-4 py-3 text-xs text-[#52635d]">Yıl içi özet: revize bütçe <strong>{money(yearlyTotals.revised)}</strong> · gerçekleşen <strong>{money(yearlyTotals.actual)}</strong> · açık taahhüt <strong>{money(yearlyTotals.commitment)}</strong>. Bu toplam yönetimsel iç denetim içindir; resmî muhasebe sonucu değildir.</p>
    <div className="mt-6 offline-operation-grid"><div className="offline-operation-main space-y-6"><Card className="rounded-2xl border-[#e5e8e3] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-xl"><Settings2 className="h-5 w-5 text-[#a17b43]" /> Manager parametresi ve aylık bütçe</CardTitle><p className="text-xs text-[#718079]">İlk bütçe kayıtları tarihçeli kalır; aktarım ayrı izlenir. Temsil/ağırlama eşiği başlangıçta 3.000 TL’dir.</p></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-2"><div><label className="mb-1 block text-xs font-semibold text-[#56635f]">Temsil/ağırlama bilgi ve onay eşiği</label><div className="flex gap-2"><Input inputMode="numeric" value={representationThreshold} onChange={(event) => setRepresentationThreshold(formatWholeCurrencyInput(event.target.value))} /><Button variant="outline" onClick={() => void saveSettings()}>Eşiği kaydet</Button></div></div><div><label className="mb-1 block text-xs font-semibold text-[#56635f]">Bütçe kalemi</label><Select value={planCategoryCode} onValueChange={setPlanCategoryCode}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{internalBudgetCategories.map((category) => <SelectItem key={category.code} value={category.code}>{category.code} · {category.label}</SelectItem>)}</SelectContent></Select></div><Input inputMode="numeric" value={planAmount} onChange={(event) => setPlanAmount(formatWholeCurrencyInput(event.target.value))} placeholder="Bu ay için ilk bütçe (₺)" /><Input value={planNote} onChange={(event) => setPlanNote(event.target.value)} placeholder="Plan notu (opsiyonel)" /></div><Button onClick={() => void savePlan()}><Plus className="mr-2 h-4 w-4" /> Aylık bütçeyi kaydet</Button></CardContent></Card>
      <Card className="rounded-2xl border-[#e5e8e3] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-xl"><Landmark className="h-5 w-5 text-[#a17b43]" /> Gider veya taahhüt kaydı</CardTitle><p className="text-xs text-[#718079]">Ödeme kaynağı ve belge referansı yönetimsel kontrol içindir. 3.000 TL ve üzeri temsil/ağırlama kaydı önce manager onayına düşer.</p></CardHeader><CardContent className="space-y-3"><div className="grid gap-3 md:grid-cols-2"><Select value={expense.categoryCode} onValueChange={(value) => setExpense({ ...expense, categoryCode: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{internalBudgetCategories.map((category) => <SelectItem key={category.code} value={category.code}>{category.code} · {category.label}</SelectItem>)}</SelectContent></Select><Input inputMode="numeric" value={expense.amount} onChange={(event) => setExpense({ ...expense, amount: formatWholeCurrencyInput(event.target.value) })} placeholder="Tutar (₺)" /><Select value={expense.expenseKind} onValueChange={(value) => setExpense({ ...expense, expenseKind: value as ExpenseDraft["expenseKind"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="actual">Gerçekleşen ödeme</SelectItem><SelectItem value="commitment">Ödeme bekleyen taahhüt</SelectItem></SelectContent></Select><Select value={expense.paymentSource} onValueChange={(value) => setExpense({ ...expense, paymentSource: value as PaymentSource })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cash">Kasa</SelectItem><SelectItem value="bank">Banka</SelectItem><SelectItem value="card">Kart</SelectItem><SelectItem value="external">Sistem dışı bilgi</SelectItem></SelectContent></Select><Input value={expense.supplier} onChange={(event) => setExpense({ ...expense, supplier: event.target.value })} placeholder="Tedarikçi / ödeme yapılan kişi" /><Input value={expense.reference} onChange={(event) => setExpense({ ...expense, reference: event.target.value })} placeholder="Fatura, makbuz veya ödeme referansı" /><Input type="date" value={expense.dueDate} onChange={(event) => setExpense({ ...expense, dueDate: event.target.value })} /><Textarea value={expense.note} onChange={(event) => setExpense({ ...expense, note: event.target.value })} placeholder="Açıklama veya taahhüt notu (opsiyonel)" /></div><Button onClick={() => void saveExpense()}><Plus className="mr-2 h-4 w-4" /> Gider/taahhüt kaydını ekle</Button></CardContent></Card>
      <Card className="rounded-2xl border-[#e5e8e3] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-xl"><ArrowLeftRight className="h-5 w-5 text-[#a17b43]" /> Bütçe faslı aktarımı</CardTitle><p className="text-xs text-[#718079]">Yalnız broker manager yapabilir. Kaynak faslın kalan bütçesi aşılmaz; ilk plan ve aktarımlar raporda ayrı görünür.</p></CardHeader><CardContent className="space-y-3"><div className="grid gap-3 md:grid-cols-2"><Select value={transferSource} onValueChange={setTransferSource}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{summary.map((row) => <SelectItem key={row.category.code} value={row.category.code}>{row.category.code} · Kalan {money(row.remaining)}</SelectItem>)}</SelectContent></Select><Select value={transferTarget} onValueChange={setTransferTarget}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{internalBudgetCategories.map((category) => <SelectItem key={category.code} value={category.code}>{category.code} · {category.label}</SelectItem>)}</SelectContent></Select><Input inputMode="numeric" value={transferAmount} onChange={(event) => setTransferAmount(formatWholeCurrencyInput(event.target.value))} placeholder="Aktarılacak tutar (₺)" /><Input value={transferReason} onChange={(event) => setTransferReason(event.target.value)} placeholder="Zorunlu aktarım gerekçesi" /></div><Button onClick={() => void saveTransfer()}><ArrowLeftRight className="mr-2 h-4 w-4" /> Aktarımı kaydet</Button></CardContent></Card>
      <Card className="rounded-2xl border-[#e5e8e3] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-xl"><ClipboardList className="h-5 w-5 text-[#a17b43]" /> Aylık bütçe sapma tablosu</CardTitle></CardHeader><CardContent>{summary.some((row) => row.originalBudget || row.actual || row.commitment || row.transfersIn || row.transfersOut) ? <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-sm"><thead className="border-b border-[#edf0ec] text-left text-[10px] font-semibold uppercase tracking-wide text-[#87938f]"><tr><th className="px-2 py-2">Fasıl</th><th className="px-2 py-2 text-right">İlk</th><th className="px-2 py-2 text-right">Aktarım</th><th className="px-2 py-2 text-right">Revize</th><th className="px-2 py-2 text-right">Gerçekleşen</th><th className="px-2 py-2 text-right">Taahhüt</th><th className="px-2 py-2 text-right">Kalan</th></tr></thead><tbody>{summary.map((row) => <tr key={row.category.code} className="border-b border-[#f0f2ef]"><td className="px-2 py-3"><strong>{row.category.code}</strong><small className="mt-1 block text-xs text-[#718079]">{row.category.label}</small></td><td className="px-2 py-3 text-right">{money(row.originalBudget)}</td><td className="px-2 py-3 text-right">{row.transfersIn - row.transfersOut ? `${row.transfersIn - row.transfersOut > 0 ? "+" : ""}${money(row.transfersIn - row.transfersOut)}` : "—"}</td><td className="px-2 py-3 text-right">{money(row.revisedBudget)}</td><td className="px-2 py-3 text-right text-[#a14f3f]">{money(row.actual)}</td><td className="px-2 py-3 text-right text-[#9a672a]">{money(row.commitment)}</td><td className={`px-2 py-3 text-right font-semibold ${row.remaining < 0 ? "text-[#a14f3f]" : "text-[#287052]"}`}>{money(row.remaining)}</td></tr>)}</tbody></table></div> : <p className="rounded-xl bg-[#f7f7f4] px-4 py-8 text-center text-sm text-[#718079]">Seçilen ay için henüz bütçe, gider veya aktarım kaydı yok.</p>}</CardContent></Card>
      {expenses.some((item) => item.detail.status === "pendingApproval") && <Card className="rounded-2xl border-[#f0dfd9] bg-white"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-xl"><AlertTriangle className="h-5 w-5 text-[#9a503c]" /> Broker manager onayı bekleyen kayıtlar</CardTitle></CardHeader><CardContent className="space-y-3">{expenses.filter((item) => item.detail.status === "pendingApproval").map(({ record, detail }) => <div key={record.id} className="rounded-xl border border-[#f0dfd9] bg-[#fffaf8] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-[#34433f]">{detail.supplier} · {money(detail.amount)}</p><p className="mt-1 text-xs text-[#718079]">{detail.categoryCode} · {detail.reference} · {detail.note || "Not yok"}</p></div><span className="rounded-full bg-[#fff0df] px-2 py-1 text-[10px] font-semibold text-[#9a672a]">Eşik üstü temsil/ağırlama</span></div><div className="mt-3 flex flex-wrap gap-2"><Input value={approvalNotes[detail.id] ?? ""} onChange={(event) => setApprovalNotes({ ...approvalNotes, [detail.id]: event.target.value })} placeholder="Onay veya ret gerekçesi *" className="min-w-[260px] flex-1" /><Button size="sm" onClick={() => void approveExpense(record, detail, true)}><BadgeCheck className="mr-1 h-3.5 w-3.5" /> Onayla</Button><Button size="sm" variant="outline" onClick={() => void approveExpense(record, detail, false)}>Reddet</Button></div></div>)}</CardContent></Card>}</div><OfflineOfficeFlowPanel className="offline-operation-aside" records={records} userId={userId} managerActive={isManager} /></div></div>;
}
