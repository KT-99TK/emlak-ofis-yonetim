export const ONLINE_START_CONFIRMATION = "TEMİZ ONLINE BAŞLANGICI AKTİFLEŞTİR";

export type OnlineStartPolicy = {
  effectiveAt: Date;
  noBalanceCarry: boolean;
  noOfflineImport: boolean;
};

const TURKEY_TIME_ZONE = "Europe/Istanbul";

export function turkeyBusinessDateKey(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TURKEY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function startOfTurkeyBusinessDay(value: Date) {
  return new Date(`${turkeyBusinessDateKey(value)}T00:00:00+03:00`);
}

export function assertCentralRecordDateIsAllowed(
  policy: OnlineStartPolicy | undefined,
  recordDate: Date,
) {
  if (!policy) {
    throw new Error("Merkezi online başlangıç tarihi broker manager tarafından henüz ayarlanmadı.");
  }

  if (recordDate.getTime() < policy.effectiveAt.getTime()) {
    throw new Error("Merkezi sistemde yalnız geçiş tarihinden sonraki yeni kayıtlar oluşturulabilir.");
  }
}

export function assertFreshStartConfirmation(confirmationText: string) {
  if (confirmationText.trim() !== ONLINE_START_CONFIRMATION) {
    throw new Error("Temiz online başlangıç için tam teyit metni doğrulanamadı.");
  }
}
