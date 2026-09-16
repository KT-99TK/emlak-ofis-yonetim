import React, { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  CalendarClock,
  Check,
  CirclePlus,
  Clock3,
  ExternalLink,
  ListTodo,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { formatTurkishDate } from "@/lib/turkishDate";

export const PERSONAL_TASK_REMINDER_EVENT = "global1881:personal-task-reminder";

type TaskPriority = "low" | "normal" | "high";
type TaskStatus = "open" | "done" | "cancelled";

export type ReminderSeed = {
  title: string;
  linkedEntityType?: "client" | "property" | "contract" | "ledger" | "obligation" | "rentalServiceTask";
  linkedEntityId?: number;
  linkedLabel?: string;
  linkedPath?: string;
};

type PersonalTaskPanelProps = {
  onOpenPath?: (path: string) => void;
};

type TaskRecord = {
  id: number;
  title: string;
  notes: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueAt: Date | string | null;
  reminderAt: Date | string | null;
  linkedLabel: string | null;
  linkedPath: string | null;
};

function taskDueLabel(value: Date | string | null) {
  if (!value) return "Tarih belirtilmedi";
  return formatTurkishDate(value);
}

function toDateTimeLocalValue(value: Date | string | null) {
  if (!value) return "";
  const date = new Date(value);
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
}

function taskTone(priority: TaskPriority) {
  if (priority === "high") return "border-[#ead6d0] bg-[#fff8f6] text-[#a85745]";
  if (priority === "low") return "border-[#e5e8e3] bg-[#f7f7f4] text-[#70807c]";
  return "border-[#e7dfc9] bg-[#fffaf0] text-[#8d6f3f]";
}

function emptyToNull(value: string) {
  return value.trim() ? value.trim() : null;
}

export function BanaHatirlatButton({
  seed,
  className = "",
}: {
  seed: ReminderSeed;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className={`h-9 rounded-lg border-[#d8e8e4] bg-white px-3 text-xs text-[#2b786e] hover:bg-[#f1f8f5] ${className}`}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent<ReminderSeed>(PERSONAL_TASK_REMINDER_EVENT, {
            detail: seed,
          })
        );
      }}
    >
      <BellRing className="mr-1.5 h-3.5 w-3.5" /> Bana Hatırlat
    </Button>
  );
}

export function PersonalTaskPanel({ onOpenPath }: PersonalTaskPanelProps) {
  const tasksQuery = trpc.personalTasks.list.useQuery(undefined, {
    retry: false,
  });
  const [taskLoadingTimedOut, setTaskLoadingTimedOut] = useState(false);

  useEffect(() => {
    if (!tasksQuery.isLoading) {
      setTaskLoadingTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setTaskLoadingTimedOut(true), 10000);
    return () => window.clearTimeout(timer);
  }, [tasksQuery.isLoading]);
  const createTask = trpc.personalTasks.create.useMutation({
    onSuccess: () => {
      void tasksQuery.refetch();
      setComposerOpen(false);
      resetComposer();
    },
  });
  const updateTask = trpc.personalTasks.update.useMutation({
    onSuccess: () => {
      void tasksQuery.refetch();
      setComposerOpen(false);
      resetComposer();
    },
  });
  const cancelTask = trpc.personalTasks.cancel.useMutation({
    onSuccess: () => void tasksQuery.refetch(),
  });

  const [composerOpen, setComposerOpen] = useState(false);
  const [reminderSeed, setReminderSeed] = useState<ReminderSeed | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [dueAt, setDueAt] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);

  function resetComposer() {
    setReminderSeed(null);
    setTitle("");
    setNotes("");
    setPriority("normal");
    setDueAt("");
    setReminderAt("");
    setEditingTask(null);
  }

  useEffect(() => {
    const handleReminder = (event: Event) => {
      const seed = (event as CustomEvent<ReminderSeed>).detail;
      setReminderSeed(seed);
      setTitle(seed.title);
      setNotes(seed.linkedLabel ? `İlgili kayıt: ${seed.linkedLabel}` : "");
      setPriority("normal");
      setDueAt("");
      setReminderAt("");
      setComposerOpen(true);
    };
    window.addEventListener(PERSONAL_TASK_REMINDER_EVENT, handleReminder);
    return () =>
      window.removeEventListener(PERSONAL_TASK_REMINDER_EVENT, handleReminder);
  }, []);

  const tasks = (tasksQuery.data ?? []) as TaskRecord[];
  const upcomingReminders = useMemo(
    () => tasks
      .filter(task => task.status === "open" && task.reminderAt && new Date(task.reminderAt).getTime() >= Date.now())
      .sort((left, right) => new Date(left.reminderAt!).getTime() - new Date(right.reminderAt!).getTime())
      .slice(0, 5),
    [tasks]
  );
  const openTasks = useMemo(
    () => tasks.filter(task => task.status === "open").slice(0, 5),
    [tasks]
  );
  const completedCount = tasks.filter(task => task.status === "done").length;
  const overdueCount = openTasks.filter(task => {
    if (!task.dueAt) return false;
    return new Date(task.dueAt).getTime() < Date.now();
  }).length;

  const submitTask = () => {
    if (editingTask) {
      updateTask.mutate({
        taskId: editingTask.id,
        title,
        notes: emptyToNull(notes),
        priority,
        dueAt: dueAt ? new Date(dueAt) : null,
        reminderAt: reminderAt ? new Date(reminderAt) : null,
      });
      return;
    }
    createTask.mutate({
      title,
      notes: emptyToNull(notes),
      priority,
      dueAt: dueAt ? new Date(dueAt) : null,
      reminderAt: reminderAt ? new Date(reminderAt) : null,
      linkedEntityType: reminderSeed?.linkedEntityType ?? null,
      linkedEntityId: reminderSeed?.linkedEntityId ?? null,
      linkedLabel: reminderSeed?.linkedLabel ?? null,
      linkedPath: reminderSeed?.linkedPath ?? null,
    });
  };

  const editTask = (task: TaskRecord) => {
    setEditingTask(task);
    setReminderSeed(null);
    setTitle(task.title);
    setNotes(task.notes ?? "");
    setPriority(task.priority);
    setDueAt(toDateTimeLocalValue(task.dueAt));
    setReminderAt(toDateTimeLocalValue(task.reminderAt));
    setComposerOpen(true);
  };

  return (
    <>
      <Card className="rounded-2xl border-[#dce8e4] bg-white/90 shadow-[0_12px_32px_rgba(26,46,42,.06)]">
        <CardHeader className="flex flex-row items-start justify-between gap-3 p-5 pb-3 md:p-6 md:pb-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a17b43]">
              <ListTodo className="h-3.5 w-3.5" /> Günlük çalışma masası
            </div>
            <CardTitle className="mt-2 font-serif text-2xl font-medium text-[#173e39]">
              Bugünkü Planım
            </CardTitle>
            <p className="mt-1 text-xs leading-5 text-[#70807c]">
              Kişisel görevlerinizi ve sistem içi hatırlatmalarınızı tek yerde takip edin.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              resetComposer();
              setComposerOpen(true);
            }}
            className="h-9 shrink-0 rounded-lg bg-[#173e39] px-3 text-xs hover:bg-[#20554e]"
          >
            <CirclePlus className="mr-1.5 h-3.5 w-3.5" /> Yeni görev
          </Button>
        </CardHeader>
        <CardContent className="p-5 pt-2 md:p-6 md:pt-2">
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-[#f5fbf8] px-3 py-2">
              <strong className="block text-lg font-serif text-[#173e39]">{openTasks.length}</strong>
              <span className="text-[10px] text-[#70807c]">Açık görev</span>
            </div>
            <div className="rounded-xl bg-[#fff8f6] px-3 py-2">
              <strong className="block text-lg font-serif text-[#a85745]">{overdueCount}</strong>
              <span className="text-[10px] text-[#70807c]">Vadesi geçen</span>
            </div>
            <div className="rounded-xl bg-[#fffaf0] px-3 py-2">
              <strong className="block text-lg font-serif text-[#8d6f3f]">{completedCount}</strong>
              <span className="text-[10px] text-[#70807c]">Tamamlanan</span>
            </div>
          </div>

          {upcomingReminders.length > 0 && (
            <div className="mb-4 rounded-xl border border-[#e7dfc9] bg-[#fffaf0] p-3">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8d6f3f]">
                <BellRing className="h-3.5 w-3.5" /> Yaklaşan Hatırlatmalar
              </div>
              <div className="space-y-1.5">
                {upcomingReminders.map(task => (
                  <button key={task.id} type="button" onClick={() => editTask(task)} className="flex w-full items-center justify-between gap-3 rounded-lg bg-white/70 px-2.5 py-2 text-left hover:bg-white">
                    <span className="min-w-0 truncate text-[11px] font-medium text-[#5c5037]">{task.title}</span>
                    <span className="shrink-0 text-[10px] text-[#8d6f3f]">{taskDueLabel(task.reminderAt)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tasksQuery.isLoading && !taskLoadingTimedOut ? (
            <p className="rounded-xl bg-[#f7f7f4] px-4 py-5 text-center text-xs text-[#87938f]" role="status">
              Kişisel plan yükleniyor…
            </p>
          ) : tasksQuery.isError || taskLoadingTimedOut ? (
            <div className="rounded-xl border border-[#ead6d0] bg-[#fff8f6] px-4 py-4 text-xs text-[#a85745]" role="alert">
              {taskLoadingTimedOut && !tasksQuery.isError ? "Kişisel plan yanıtı beklenenden uzun sürdü; görevler gösterilemedi." : "Kişisel plan alınamadı. Merkezi bağlantıyı kontrol edip tekrar deneyin."}
              <Button type="button" variant="ghost" onClick={() => void tasksQuery.refetch()} className="mt-2 h-8 px-2 text-xs text-[#a85745]">
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Tekrar dene
              </Button>
            </div>
          ) : openTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#cfe0da] bg-[#f7fbf9] px-4 py-5 text-center">
              <Check className="mx-auto h-5 w-5 text-[#2b786e]" />
              <p className="mt-2 text-xs font-semibold text-[#24413b]">Bugün için açık görev yok</p>
              <p className="mt-1 text-[11px] leading-4 text-[#70807c]">
                Yeni görev ekleyebilir veya ilgili kayıtlardan “Bana Hatırlat” düğmesini kullanabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {openTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 rounded-xl border border-[#edf0ec] bg-white p-3">
                  <button
                    type="button"
                    aria-label={`${task.title} görevini tamamla`}
                    onClick={() => updateTask.mutate({ taskId: task.id, status: "done" })}
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#b8d5cc] text-[#2b786e] transition-colors hover:bg-[#edf7f3]"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-5 text-[#34433f]">{task.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-[#87938f]">
                      <span className={`rounded-full border px-2 py-0.5 font-semibold ${taskTone(task.priority)}`}>
                        {task.priority === "high" ? "Yüksek" : task.priority === "low" ? "Düşük" : "Normal"}
                      </span>
                      {task.dueAt && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" /> {taskDueLabel(task.dueAt)}
                        </span>
                      )}
                      {task.reminderAt && (
                        <span className="inline-flex items-center gap-1 text-[#a17b43]">
                          <Clock3 className="h-3 w-3" /> Hatırlatma var
                        </span>
                      )}
                    </div>
                    {task.linkedLabel && (
                      <button
                        type="button"
                        onClick={() => task.linkedPath && onOpenPath?.(task.linkedPath)}
                        className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-[10px] font-medium text-[#2b786e] hover:underline"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" /> {task.linkedLabel}
                      </button>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label={`${task.title} görevini düzenle`}
                      onClick={() => editTask(task)}
                      className="rounded-lg p-1.5 text-[#9aa6a1] hover:bg-[#f1f8f5] hover:text-[#2b786e]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`${task.title} görevini iptal et`}
                      onClick={() => cancelTask.mutate({ taskId: task.id })}
                      className="rounded-lg p-1.5 text-[#b3beb9] hover:bg-[#fff8f6] hover:text-[#a85745]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-[#dce8e4] bg-[#f7fbf9]">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#173e39]">
              {reminderSeed ? "Bana Hatırlat" : editingTask ? "Görevi düzenle" : "Yeni kişisel görev"}
            </DialogTitle>
            <DialogDescription>
              Bu kayıt yalnızca sizin kişisel çalışma listenizde görünür. Harici bildirim gönderilmez; hatırlatma sisteme girişinizde gösterilir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="personal-task-title">Görev</Label>
              <Input id="personal-task-title" value={title} onChange={event => setTitle(event.target.value)} placeholder="Örn. Kiracı ile tekrar görüş" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="personal-task-due">Son tarih</Label>
                <Input id="personal-task-due" type="datetime-local" value={dueAt} onChange={event => setDueAt(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personal-task-reminder">Bana hatırlat</Label>
                <Input id="personal-task-reminder" type="datetime-local" value={reminderAt} onChange={event => setReminderAt(event.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="personal-task-priority">Öncelik</Label>
              <select id="personal-task-priority" value={priority} onChange={event => setPriority(event.target.value as TaskPriority)} className="h-10 w-full rounded-lg border border-[#d8e1dc] bg-white px-3 text-sm text-[#34433f] outline-none focus:ring-2 focus:ring-[#9fcabc]">
                <option value="high">Yüksek</option>
                <option value="normal">Normal</option>
                <option value="low">Düşük</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="personal-task-notes">Not</Label>
              <Textarea id="personal-task-notes" value={notes} onChange={event => setNotes(event.target.value)} placeholder="Kısa açıklama veya takip notu" rows={3} />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
            <Button type="button" variant="ghost" onClick={() => setComposerOpen(false)} className="text-[#70807c]">Vazgeç</Button>
            <Button type="button" disabled={!title.trim() || createTask.isPending || updateTask.isPending} onClick={submitTask} className="bg-[#173e39] hover:bg-[#20554e]">
              {createTask.isPending || updateTask.isPending ? "Kaydediliyor…" : editingTask ? "Değişiklikleri kaydet" : "Görevi kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
