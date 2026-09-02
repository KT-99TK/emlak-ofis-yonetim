export function maskPhone(value: string) {
  if (!value.trim() || value.includes("•")) return value;
  const digits = value.replace(/\D/g, "");
  if (!digits) return "••••";
  if (digits.length <= 4) return "••••";
  const prefix = digits.length >= 10 ? digits.slice(0, 2) : digits.slice(0, 1);
  return `${prefix}•• ••• •• ${digits.slice(-2)}`;
}

export function maskIdentityOrTaxNo(value: string) {
  if (!value.trim() || value.includes("•")) return value;
  const digits = value.replace(/\D/g, "");
  if (!digits) return "••••";
  return `••••••••${digits.slice(-Math.min(4, digits.length))}`;
}
