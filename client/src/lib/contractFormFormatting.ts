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
  // Yerli görünüm: "0532 XXX XX XX" (bkz. toInternationalPhone — adı korunmuş, artık yerli biçim üretiyor).
  return toInternationalPhone(draft);
}
