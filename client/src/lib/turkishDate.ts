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
