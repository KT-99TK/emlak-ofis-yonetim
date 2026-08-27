export const CONSULTANT_CODE_PATTERN = /^[A-Z]{2}\d+$/;
export const CONTRACT_NUMBER_PATTERN = /^([A-Z]{2}\d+)-(\d{3})$/;

export function normalizeConsultantCode(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

export function isConsultantCode(value: string | null | undefined): value is string {
  return CONSULTANT_CODE_PATTERN.test(normalizeConsultantCode(value));
}

export function normalizeContractNumber(value: string | null | undefined) {
  const normalized = (value ?? "").trim().toUpperCase();
  const match = normalized.match(CONTRACT_NUMBER_PATTERN);
  return match ? `${match[1]}-${match[2]}` : normalized;
}

export function isContractNumberForCode(value: string | null | undefined, consultantCode: string | null | undefined) {
  const code = normalizeConsultantCode(consultantCode);
  const match = normalizeContractNumber(value).match(CONTRACT_NUMBER_PATTERN);
  return Boolean(match && isConsultantCode(code) && match[1] === code);
}

export function nextContractNumber(consultantCode: string | null | undefined, existingNumbers: Array<string | null | undefined>) {
  const code = normalizeConsultantCode(consultantCode);
  if (!isConsultantCode(code)) return "";
  const next = existingNumbers.reduce((highest, value) => {
    const match = normalizeContractNumber(value).match(CONTRACT_NUMBER_PATTERN);
    return match?.[1] === code ? Math.max(highest, Number(match[2])) : highest;
  }, 0) + 1;
  return `${code}-${String(next).padStart(3, "0")}`;
}
