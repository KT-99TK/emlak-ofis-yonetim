import type { ConsultancyAssignmentDetails } from "./consultancyAssignmentContract";

/**
 * Kat Karşılığı Danışmanlık Sözleşmesi taslakları — bu belge paketi nadir ve yüksek bedelli,
 * standart müşteri/portföy akışına dahil edilmeyen bir özel anlaşma olduğundan, diğer
 * sözleşmelerdeki gibi merkezi veritabanına değil, yalnızca bu tarayıcıda `localStorage`'a
 * kaydedilir. Amaç, formu tekrar doldurmadan önceki bir taslağı çağırabilmektir.
 */

const STORAGE_KEY = "global1881-consultancy-assignment-drafts-v1";

export type ConsultancyAssignmentDraft = {
  id: string;
  savedAt: string;
  contractNo: string;
  label: string;
  details: ConsultancyAssignmentDetails;
};

function readAll(): ConsultancyAssignmentDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(drafts: ConsultancyAssignmentDraft[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // Depolama dolu/engelli olabilir; taslak kaydı sessizce başarısız olur, sözleşme formu etkilenmez.
  }
}

export function listConsultancyAssignmentDrafts(): ConsultancyAssignmentDraft[] {
  return readAll().sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export function saveConsultancyAssignmentDraft(input: { id?: string; contractNo: string; details: ConsultancyAssignmentDetails }): ConsultancyAssignmentDraft {
  const drafts = readAll();
  const id = input.id ?? `consultancy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const label = `${input.details.projectName || "Proje belirtilmedi"} — ${input.details.consultantName || "Danışman belirtilmedi"}`;
  const draft: ConsultancyAssignmentDraft = { id, savedAt: new Date().toISOString(), contractNo: input.contractNo, label, details: input.details };
  const next = [draft, ...drafts.filter((item) => item.id !== id)];
  writeAll(next);
  return draft;
}

export function deleteConsultancyAssignmentDraft(id: string) {
  writeAll(readAll().filter((item) => item.id !== id));
}
