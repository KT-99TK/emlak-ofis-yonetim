export function maskPhone(value: string) {
  if (!value.trim() || value.includes("•")) return value;
  const digits = value.replace(/\D/g, "");
  if (!digits) return "••••";
  if (digits.length <= 4) return "••••";
  const prefix = digits.length >= 10 ? digits.slice(0, 2) : digits.slice(0, 1);
  return `${prefix}•• ••• •• ${digits.slice(-2)}`;
}

export function maskIdentityOrTaxNo(value: string) {
  if (!value.trim() || value.includes("*") || value.includes("•")) return value;
  const digits = value.replace(/\D/g, "");
  if (!digits) return "****";
  if (digits.length <= 4) return "*".repeat(digits.length);
  const prefixLength = digits.length >= 10 ? 2 : 1;
  const suffixLength = 2;
  const hiddenLength = Math.max(1, digits.length - prefixLength - suffixLength);
  return `${digits.slice(0, prefixLength)}${"*".repeat(hiddenLength)}${digits.slice(-suffixLength)}`;
}
