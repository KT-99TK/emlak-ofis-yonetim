export const URLA_NEIGHBORHOODS_VERSION = "urla-mahalleleri-2026-08-v1";

/** T.C. Urla Kaymakamlığı idari durum sayfasındaki 37 mahalle listesi. */
export const URLA_NEIGHBORHOODS = [
  "Altıntaş", "Atatürk", "Bademler", "Balıklıova", "Barbaros", "Birgi", "Camiatik", "Çamlıçay", "Demircili", "Denizli", "Gülbahçe", "Güvendik", "Hacıisa", "İçmeler", "İskele", "Kadıovacık", "Kalabak", "Kuşçular", "M. Fevzi", "Naipli", "Nohutalan", "Ovacık", "Özbek", "Rüstem", "Sıra", "Şirinkent", "Torasan", "Uzunkuyu", "Yağcılar", "Yaka", "Yelaltı", "Yeni", "Yenice", "Yenikent", "Zeytinalanı", "Zeytineli", "Zeytinler",
] as const;

export function isUrlaNeighborhood(value: string) {
  return URLA_NEIGHBORHOODS.includes(value.trim() as (typeof URLA_NEIGHBORHOODS)[number]);
}

export function titleCaseTurkish(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).map((word) => `${word.slice(0, 1).toLocaleUpperCase("tr-TR")}${word.slice(1).toLocaleLowerCase("tr-TR")}`).join(" ");
}
