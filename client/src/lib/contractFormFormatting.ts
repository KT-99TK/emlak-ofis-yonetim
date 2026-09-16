import { toInternationalPhone } from "./authorityContract";

export function normalizeContractPhoneDraft(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function formatContractPhoneInput(value: string) {
  const draft = normalizeContractPhoneDraft(value);
  if (!draft) return "";
  const digits = draft.replace(/\D/g, "");
  if (digits.length < 10) return draft;
  const normalized = toInternationalPhone(draft);
  const match = /^\+90(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(normalized);
  return match ? `+90 ${match[1]} ${match[2]} ${match[3]} ${match[4]}` : normalized;
}
