/** Kullanıcıya görünen tarihleri Türkiye takvim biçiminde üretir; saklama biçimi ISO olarak kalır. */
function toLocalDate(value: Date | string) {
  if (value instanceof Date) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T12:00:00`);
  return new Date(value);
}

export function formatTurkishDate(value?: Date | string | null, fallback = "—") {
  if (!value) return fallback;
  const date = toLocalDate(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function formatTurkishDateTime(value?: Date | string | null, fallback = "—") {
  if (!value) return fallback;
  const date = toLocalDate(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function formatTurkishLongDate(value?: Date | string | null, fallback = "—") {
  if (!value) return fallback;
  const date = toLocalDate(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long" }).format(date);
}

/** Kullanıcı girişindeki GG.AA.YYYY tarihini ISO YYYY-MM-DD biçimine çevirir; geçersiz tarihi kabul etmez. */
export function parseTurkishDateInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-").map(Number);
    const date = new Date(year, month - 1, day, 12);
    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
      ? trimmed
      : null;
  }
  const match = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(trimmed);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day, 12);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
