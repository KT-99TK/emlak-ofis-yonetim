export const DASHBOARD_GREETING = "İyi çalışmalar, gününüz bereketli geçsin.";

export function formatDashboardDate(date = new Date()) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "long" }).format(date);
}
